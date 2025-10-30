/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Gerenciamento de Pedidos
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Suporte a múltiplos produtos em um único pedido
 * - Cálculo automático de prazos por tipo
 * - Melhor organização de dados
 */

/**
 * Cria novo pedido (v6.0 - múltiplos produtos)
 */
function criarPedido(dadosPedido) {
  try {
    const email = Session.getActiveUser().getEmail();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      return { success: false, error: 'Aba de pedidos não encontrada' };
    }
    
    // Validar dados obrigatórios
    if (!dadosPedido.tipo || !dadosPedido.produtos || dadosPedido.produtos.length === 0) {
      return {
        success: false,
        error: 'Tipo e produtos são obrigatórios'
      };
    }
    
    // Gerar número do pedido
    const numeroPedido = gerarNumeroPedido();
    
    // Obter dados do usuário
    const contexto = getUserContext();
    
    if (!contexto.success || !contexto.user) {
      return {
        success: false,
        error: 'Erro ao obter dados do usuário'
      };
    }
    
    const usuario = contexto.user;
    
    // Processar produtos e calcular valor total
    let valorTotal = 0;
    const produtosNomes = [];
    const produtosQuantidades = [];
    
    for (let i = 0; i < dadosPedido.produtos.length; i++) {
      const item = dadosPedido.produtos[i];
      
      // Buscar produto
      const resultado = buscarProduto(item.produtoId);
      
      if (!resultado.success) {
        return {
          success: false,
          error: `Produto não encontrado: ${item.produtoId}`
        };
      }
      
      const produto = resultado.produto;
      
      // Calcular valor
      const quantidade = parseFloat(item.quantidade) || 0;
      const precoUnitario = parseFloat(produto.precoUnitario) || 0;
      valorTotal += quantidade * precoUnitario;
      
      produtosNomes.push(produto.nome);
      produtosQuantidades.push(quantidade);
    }
    
    // Calcular prazo de entrega baseado no tipo
    const prazoEntrega = calcularPrazoEntrega(dadosPedido.tipo);
    
    // Criar pedido
    const id = Utilities.getUuid();
    const novoPedido = [
      id,
      numeroPedido,
      dadosPedido.tipo,
      usuario.email,
      usuario.nome,
      usuario.setor,
      produtosNomes.join('; '),
      produtosQuantidades.join('; '),
      valorTotal,
      CONFIG.STATUS_PEDIDO.SOLICITADO,
      new Date(),
      '', // Data Compra
      '', // Data Finalização
      prazoEntrega,
      dadosPedido.observacoes || ''
    ];
    
    abaPedidos.appendRow(novoPedido);
    
    // Enviar notificação ao gestor
    const emailGestor = obterConfiguracao('EMAIL_GESTOR');
    if (emailGestor && emailGestor.includes('@')) {
      enviarNotificacaoPedido(emailGestor, {
        numeroPedido: numeroPedido,
        solicitante: usuario.nome,
        tipo: dadosPedido.tipo,
        valorTotal: valorTotal,
        produtos: produtosNomes
      });
    }
    
    // Registrar log
    registrarLog('PEDIDO_CRIADO', `Pedido ${numeroPedido} criado por ${usuario.nome}`, 'SUCESSO');
    
    return {
      success: true,
      message: 'Pedido criado com sucesso',
      pedidoId: id,
      numeroPedido: numeroPedido,
      valorTotal: valorTotal
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao criar pedido: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera número único para o pedido
 */
function gerarNumeroPedido() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  
  if (!abaPedidos) {
    return `PED${ano}${mes}${dia}-001`;
  }
  
  const dados = abaPedidos.getDataRange().getValues();
  const prefixo = `PED${ano}${mes}${dia}`;
  
  let ultimoNumero = 0;
  
  for (let i = 1; i < dados.length; i++) {
    const numeroPedido = dados[i][1];
    if (numeroPedido && numeroPedido.startsWith(prefixo)) {
      const numero = parseInt(numeroPedido.split('-')[1]);
      if (numero > ultimoNumero) {
        ultimoNumero = numero;
      }
    }
  }
  
  const proximoNumero = String(ultimoNumero + 1).padStart(3, '0');
  return `${prefixo}-${proximoNumero}`;
}

/**
 * Calcula prazo de entrega baseado no tipo (NOVO v6.0)
 */
function calcularPrazoEntrega(tipo) {
  let diasUteis = 5; // Padrão
  
  if (tipo === 'Papelaria') {
    diasUteis = parseInt(obterConfiguracao('TEMPO_ENTREGA_PAPELARIA')) || 5;
  } else if (tipo === 'Limpeza') {
    diasUteis = parseInt(obterConfiguracao('TEMPO_ENTREGA_LIMPEZA')) || 7;
  }
  
  return `${diasUteis} dias úteis`;
}

/**
 * Lista pedidos com filtros (CORRIGIDO v6.0.1)
 */
function listarPedidos(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      Logger.log('❌ Aba de pedidos não encontrada');
      return { 
        success: false, 
        error: 'Aba de pedidos não encontrada',
        pedidos: []
      };
    }
    
    const dados = abaPedidos.getDataRange().getValues();
    
    // Verificar se há dados além do cabeçalho
    if (dados.length <= 1) {
      Logger.log('⚠️ Nenhum pedido encontrado na planilha');
      return {
        success: true,
        pedidos: [],
        message: 'Nenhum pedido cadastrado'
      };
    }
    
    const pedidos = [];
    
    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias
      
      try {
        const pedido = {
          id: dados[i][0] || '',
          numeroPedido: dados[i][1] || '',
          tipo: dados[i][2] || '',
          solicitanteEmail: dados[i][3] || '',
          solicitanteNome: dados[i][4] || '',
          setor: dados[i][5] || '',
          produtos: dados[i][6] || '',
          quantidades: dados[i][7] || '',
          valorTotal: dados[i][8] || 0,
          status: dados[i][9] || '',
          dataSolicitacao: dados[i][10] || new Date(),
          dataCompra: dados[i][11] || '',
          dataFinalizacao: dados[i][12] || '',
          prazoEntrega: dados[i][13] || '',
          observacoes: dados[i][14] || ''
        };
        
        // Aplicar filtros
        if (filtros) {
          if (filtros.tipo && pedido.tipo !== filtros.tipo) continue;
          if (filtros.status && pedido.status !== filtros.status) continue;
          if (filtros.solicitante && pedido.solicitanteEmail !== filtros.solicitante) continue;
          if (filtros.setor && pedido.setor !== filtros.setor) continue;
          
          if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            const dataPedido = new Date(pedido.dataSolicitacao);
            if (dataPedido < dataInicio) continue;
          }
          
          if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            const dataPedido = new Date(pedido.dataSolicitacao);
            if (dataPedido > dataFim) continue;
          }
        }
        
        pedidos.push(pedido);
        
      } catch (rowError) {
        Logger.log('⚠️ Erro ao processar linha ' + i + ': ' + rowError.message);
        continue;
      }
    }
    
    Logger.log('✅ ' + pedidos.length + ' pedidos carregados com sucesso');
    
    return {
      success: true,
      pedidos: pedidos
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao listar pedidos: ' + error.message);
    Logger.log(error.stack);
    
    return {
      success: false,
      error: error.message,
      pedidos: []
    };
  }
}


/**
 * Busca pedido por ID
 */
function buscarPedido(pedidoId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      return { success: false, error: 'Aba de pedidos não encontrada' };
    }
    
    const dados = abaPedidos.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === pedidoId) {
        return {
          success: true,
          pedido: {
            id: dados[i][0],
            numeroPedido: dados[i][1],
            tipo: dados[i][2],
            solicitanteEmail: dados[i][3],
            solicitanteNome: dados[i][4],
            setor: dados[i][5],
            produtos: dados[i][6],
            quantidades: dados[i][7],
            valorTotal: dados[i][8],
            status: dados[i][9],
            dataSolicitacao: dados[i][10],
            dataCompra: dados[i][11],
            dataFinalizacao: dados[i][12],
            prazoEntrega: dados[i][13],
            observacoes: dados[i][14]
          }
        };
      }
    }
    
    return {
      success: false,
      error: 'Pedido não encontrado'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao buscar pedido: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza status do pedido
 */
function atualizarStatusPedido(pedidoId, novoStatus) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão (gestor ou admin)
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem atualizar status de pedidos.'
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      return { success: false, error: 'Aba de pedidos não encontrada' };
    }
    
    const dados = abaPedidos.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === pedidoId) {
        // Atualizar status
        abaPedidos.getRange(i + 1, 10).setValue(novoStatus);
        
        // Atualizar datas conforme status
        if (novoStatus === CONFIG.STATUS_PEDIDO.EM_COMPRA) {
          abaPedidos.getRange(i + 1, 12).setValue(new Date());
        } else if (novoStatus === CONFIG.STATUS_PEDIDO.FINALIZADO) {
          abaPedidos.getRange(i + 1, 13).setValue(new Date());
        }
        
        // Registrar log
        registrarLog('PEDIDO_STATUS_ATUALIZADO', `Pedido ${dados[i][1]} - Status: ${novoStatus}`, 'SUCESSO');
        
        return {
          success: true,
          message: 'Status atualizado com sucesso'
        };
      }
    }
    
    return {
      success: false,
      error: 'Pedido não encontrado'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao atualizar status: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancela um pedido
 */
function cancelarPedido(pedidoId, motivo) {
  try {
    const email = Session.getActiveUser().getEmail();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      return { success: false, error: 'Aba de pedidos não encontrada' };
    }
    
    const dados = abaPedidos.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === pedidoId) {
        const solicitanteEmail = dados[i][3];
        
        // Verificar permissão: próprio solicitante ou gestor
        if (email !== solicitanteEmail && !verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
          return {
            success: false,
            error: 'Permissão negada'
          };
        }
        
        // Cancelar pedido
        abaPedidos.getRange(i + 1, 10).setValue(CONFIG.STATUS_PEDIDO.CANCELADO);
        
        // Adicionar motivo nas observações
        const observacoesAtuais = dados[i][14] || '';
        const novasObservacoes = observacoesAtuais + `\n[CANCELADO] ${motivo || 'Sem motivo informado'}`;
        abaPedidos.getRange(i + 1, 15).setValue(novasObservacoes);
        
        // Registrar log
        registrarLog('PEDIDO_CANCELADO', `Pedido ${dados[i][1]} cancelado: ${motivo}`, 'SUCESSO');
        
        return {
          success: true,
          message: 'Pedido cancelado com sucesso'
        };
      }
    }
    
    return {
      success: false,
      error: 'Pedido não encontrado'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao cancelar pedido: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém detalhes expandidos do pedido
 */
function getDetalhesPedido(pedidoId) {
  try {
    const resultado = buscarPedido(pedidoId);
    
    if (!resultado.success) {
      return resultado;
    }
    
    const pedido = resultado.pedido;
    
    // Processar produtos
    const produtosNomes = pedido.produtos.split('; ');
    const produtosQuantidades = pedido.quantidades.split('; ');
    
    const produtosDetalhados = [];
    
    for (let i = 0; i < produtosNomes.length; i++) {
      produtosDetalhados.push({
        nome: produtosNomes[i],
        quantidade: parseFloat(produtosQuantidades[i]) || 0
      });
    }
    
    pedido.produtosDetalhados = produtosDetalhados;
    
    return {
      success: true,
      pedido: pedido
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao obter detalhes do pedido: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envia notificação de pedido por email
 */
function enviarNotificacaoPedido(destinatario, dadosPedido) {
  try {
    const assunto = `🛒 Novo Pedido: ${dadosPedido.numeroPedido}`;
    
    let corpo = `
      <h2 style="color: #00A651;">Sistema Neoformula - Novo Pedido</h2>
      <p><strong>Número do Pedido:</strong> ${dadosPedido.numeroPedido}</p>
      <p><strong>Solicitante:</strong> ${dadosPedido.solicitante}</p>
      <p><strong>Tipo:</strong> ${dadosPedido.tipo}</p>
      <p><strong>Valor Total:</strong> R$ ${dadosPedido.valorTotal.toFixed(2)}</p>
      
      <h3>Produtos:</h3>
      <ul>
    `;
    
    dadosPedido.produtos.forEach(produto => {
      corpo += `<li>${produto}</li>`;
    });
    
    corpo += `
      </ul>
      
      <p style="margin-top: 20px;">
        <a href="${ScriptApp.getService().getUrl()}" 
           style="background-color: #00A651; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px;">
          Acessar Sistema
        </a>
      </p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sistema de Controle de Pedidos Neoformula v6.0
      </p>
    `;
    
    MailApp.sendEmail({
      to: destinatario,
      subject: assunto,
      htmlBody: corpo
    });
    
    Logger.log(`✅ Notificação enviada para ${destinatario}`);
    
  } catch (error) {
    Logger.log(`⚠️ Erro ao enviar notificação: ${error.message}`);
  }
}
