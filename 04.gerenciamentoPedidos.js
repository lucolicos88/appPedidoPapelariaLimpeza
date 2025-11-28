/**
 * ========================================
 * SISTEMA DE PEDIDOS NEO v14.0.0
 * Módulo: Gerenciamento de Pedidos
 * ========================================
 *
 * NOVIDADES v14.0.0:
 * - Unidade de produto exibida no catálogo
 * - Email profissional com logo e tabela completa
 * - Produtos detalhados no email (quantidade, unidade, valor)
 * - Remetente personalizado
 */

/**
 * Valida dados de produto para pedido (NOVO v6.0.1)
 */
function validarProdutoPedido(item) {
  if (!item || typeof item !== 'object') {
    return { valido: false, erro: 'Item inválido' };
  }

  if (!item.produtoId || String(item.produtoId).trim() === '') {
    return { valido: false, erro: 'ID do produto é obrigatório' };
  }

  if (item.quantidade === undefined || item.quantidade === null || item.quantidade === '') {
    return { valido: false, erro: 'Quantidade é obrigatória' };
  }

  const quantidade = parseFloat(item.quantidade);
  if (isNaN(quantidade) || quantidade <= 0) {
    return { valido: false, erro: 'Quantidade deve ser um número positivo' };
  }

  if (quantidade > 10000) {
    return { valido: false, erro: 'Quantidade muito alta (máximo 10.000 unidades por item)' };
  }

  return { valido: true };
}

/**
 * Cria novo pedido (v6.0.1 - COM VALIDAÇÃO)
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
    if (!dadosPedido || typeof dadosPedido !== 'object') {
      return {
        success: false,
        error: 'Dados do pedido inválidos'
      };
    }

    if (!dadosPedido.tipo || String(dadosPedido.tipo).trim() === '') {
      return {
        success: false,
        error: 'Tipo de pedido é obrigatório'
      };
    }

    // Validar tipo
    const tiposValidos = ['Papelaria', 'Limpeza'];
    if (!tiposValidos.includes(dadosPedido.tipo)) {
      return {
        success: false,
        error: 'Tipo de pedido inválido. Use: Papelaria ou Limpeza'
      };
    }

    if (!dadosPedido.produtos || !Array.isArray(dadosPedido.produtos) || dadosPedido.produtos.length === 0) {
      return {
        success: false,
        error: 'Lista de produtos é obrigatória'
      };
    }

    if (dadosPedido.produtos.length > 50) {
      return {
        success: false,
        error: 'Número máximo de produtos por pedido é 50'
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

      // Validar item
      const validacao = validarProdutoPedido(item);
      if (!validacao.valido) {
        return {
          success: false,
          error: `Produto ${i + 1}: ${validacao.erro}`
        };
      }

      // Buscar produto
      const resultado = buscarProduto(item.produtoId);

      if (!resultado.success) {
        return {
          success: false,
          error: `Produto não encontrado: ${item.produtoId}`
        };
      }

      const produto = resultado.produto;

      // Verificar se produto está ativo
      if (produto.ativo !== 'Sim') {
        return {
          success: false,
          error: `Produto inativo: ${produto.nome}`
        };
      }

      // Calcular valor
      const quantidade = parseFloat(item.quantidade);
      const precoUnitario = parseFloat(produto.precoUnitario) || 0;
      const subtotal = quantidade * precoUnitario;

      if (subtotal > 1000000) {
        return {
          success: false,
          error: `Valor muito alto para produto ${produto.nome} (máximo R$ 1.000.000 por item)`
        };
      }

      valorTotal += subtotal;
      produtosNomes.push(produto.nome);
      produtosQuantidades.push(quantidade);
    }

    // Validar valor total
    if (valorTotal > 10000000) {
      return {
        success: false,
        error: 'Valor total do pedido excede o limite (R$ 10.000.000)'
      };
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

    // v16.0: Reservar estoque automaticamente
    Logger.log(`📦 v16.0: Reservando estoque para pedido ${numeroPedido}`);
    const resultadoReserva = reservarEstoquePedido(id, dadosPedido.produtos);
    if (!resultadoReserva.success) {
      Logger.log(`⚠️ Falha ao reservar estoque: ${resultadoReserva.error}`);
      // Não bloqueia criação do pedido, apenas loga o aviso
    } else {
      Logger.log(`✅ Estoque reservado: ${resultadoReserva.message}`);
    }

    // Enviar notificação ao gestor
    const emailGestor = obterConfiguracao('EMAIL_GESTOR');
    if (emailGestor && emailGestor.includes('@')) {
      enviarNotificacaoPedido(emailGestor, {
        numeroPedido: numeroPedido,
        solicitante: usuario.nome,
        tipo: dadosPedido.tipo,
        setor: usuario.setor || 'Administração',
        prazoEntrega: prazoEntrega || 'Não informado',
        valorTotal: valorTotal,
        produtos: produtosNomes,
        produtosDetalhados: dadosPedido.produtosDetalhados || [], // v14.0.0 - dados completos para email
        observacoes: dadosPedido.observacoes || ''
      });
    }

    // Registrar log
    registrarLog('PEDIDO_CRIADO', `Pedido ${numeroPedido} criado por ${usuario.nome}`, 'SUCESSO');

    return {
      success: true,
      message: 'Pedido criado com sucesso',
      pedidoId: id,
      numeroPedido: numeroPedido,
      valorTotal: valorTotal,
      estoqueReservado: resultadoReserva.success // v16.0
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
 * Lock simples para evitar race conditions (NOVO v6.0.1)
 * Usando var para compatibilidade com Google Apps Script
 */
var LOCK_PEDIDOS = LOCK_PEDIDOS || {};

/**
 * Gera número único para o pedido (v6.0.1 - COM LOCK)
 */
function gerarNumeroPedido() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const prefixo = `PED${ano}${mes}${dia}`;

  // Tentar adquirir lock por até 5 segundos
  const lockKey = 'numeroPedido';
  const maxTentativas = 50;
  let tentativas = 0;

  while (LOCK_PEDIDOS[lockKey] && tentativas < maxTentativas) {
    Utilities.sleep(100); // Esperar 100ms
    tentativas++;
  }

  if (tentativas >= maxTentativas) {
    Logger.log('⚠️ Timeout ao aguardar lock para geração de número de pedido');
    // Adicionar timestamp para garantir unicidade em caso de timeout
    const timestamp = agora.getTime().toString().slice(-4);
    return `${prefixo}-${timestamp}`;
  }

  try {
    // Adquirir lock
    LOCK_PEDIDOS[lockKey] = true;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);

    if (!abaPedidos) {
      return `${prefixo}-001`;
    }

    const lastRow = abaPedidos.getLastRow();
    if (lastRow < 2) {
      return `${prefixo}-001`;
    }

    // Buscar apenas a coluna de números de pedido
    const dados = abaPedidos.getRange(2, 2, lastRow - 1, 1).getValues();

    let ultimoNumero = 0;

    for (let i = 0; i < dados.length; i++) {
      const numeroPedido = dados[i][0];
      if (numeroPedido && String(numeroPedido).startsWith(prefixo)) {
        try {
          const partes = String(numeroPedido).split('-');
          if (partes.length === 2) {
            const numero = parseInt(partes[1]);
            if (!isNaN(numero) && numero > ultimoNumero) {
              ultimoNumero = numero;
            }
          }
        } catch (e) {
          Logger.log('⚠️ Erro ao processar número de pedido: ' + numeroPedido);
        }
      }
    }

    const proximoNumero = String(ultimoNumero + 1).padStart(3, '0');
    return `${prefixo}-${proximoNumero}`;

  } finally {
    // Liberar lock
    delete LOCK_PEDIDOS[lockKey];
  }
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
    Logger.log('📋 [v10.1] listarPedidos chamado com filtros:', JSON.stringify(filtros));

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
    Logger.log('📊 [v10.1] Total de linhas na planilha:', dados.length);
    
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
          // v10.1: Suporte para filtros de email (solicitanteEmail ou solicitante)
          if (filtros.solicitanteEmail && pedido.solicitanteEmail !== filtros.solicitanteEmail) continue;
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

    Logger.log('✅ [v10.1] ' + pedidos.length + ' pedidos carregados com sucesso (após filtros)');

    // v10.1: Log de debug para o primeiro pedido
    if (pedidos.length > 0) {
      Logger.log('🔍 [v10.1] Primeiro pedido:', JSON.stringify(pedidos[0]));
    }

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

          // v16.0: Baixar estoque reservado automaticamente
          Logger.log(`📤 v16.0: Baixando estoque do pedido ${dados[i][1]}`);

          // Extrair produtos do pedido
          const produtosStr = String(dados[i][6] || ''); // Produtos IDs
          const quantidadesStr = String(dados[i][7] || ''); // Quantidades
          const produtosArray = produtosStr.split('; ').filter(p => p.trim() !== '');
          const quantidadesArray = quantidadesStr.split('; ').filter(q => q.trim() !== '');

          if (produtosArray.length > 0) {
            const produtosParaBaixar = [];
            for (let j = 0; j < produtosArray.length; j++) {
              produtosParaBaixar.push({
                produtoId: produtosArray[j].trim(),
                quantidade: parseFloat(quantidadesArray[j]) || 0
              });
            }

            const resultadoBaixa = baixarEstoquePedido(pedidoId, produtosParaBaixar);
            if (!resultadoBaixa.success) {
              Logger.log(`⚠️ Falha ao baixar estoque: ${resultadoBaixa.error}`);
            } else {
              Logger.log(`✅ Estoque baixado: ${resultadoBaixa.message}`);
            }
          }
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

        // v16.0: Liberar estoque reservado automaticamente
        Logger.log(`🔓 v16.0: Liberando estoque do pedido ${dados[i][1]}`);

        // Extrair produtos do pedido
        const produtosStr = String(dados[i][6] || ''); // Produtos IDs
        const quantidadesStr = String(dados[i][7] || ''); // Quantidades
        const produtosArray = produtosStr.split('; ').filter(p => p.trim() !== '');
        const quantidadesArray = quantidadesStr.split('; ').filter(q => q.trim() !== '');

        if (produtosArray.length > 0) {
          const produtosParaLiberar = [];
          for (let j = 0; j < produtosArray.length; j++) {
            produtosParaLiberar.push({
              produtoId: produtosArray[j].trim(),
              quantidade: parseFloat(quantidadesArray[j]) || 0
            });
          }

          const resultadoLiberacao = liberarEstoquePedido(pedidoId, produtosParaLiberar);
          if (!resultadoLiberacao.success) {
            Logger.log(`⚠️ Falha ao liberar estoque: ${resultadoLiberacao.error}`);
          } else {
            Logger.log(`✅ Estoque liberado: ${resultadoLiberacao.message}`);
          }
        }

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
 * Rate limiting para emails (NOVO v6.0.1)
 * Usando var para compatibilidade com Google Apps Script
 */
var EMAIL_RATE_LIMIT = EMAIL_RATE_LIMIT || {};
var EMAIL_RATE_LIMIT_MINUTOS = 5;
var EMAIL_MAX_POR_HORA = 10;

/**
 * Verifica rate limit de email (NOVO v6.0.1)
 */
function verificarRateLimitEmail(destinatario) {
  const agora = new Date().getTime();
  const chave = `email_${destinatario}`;

  if (!EMAIL_RATE_LIMIT[chave]) {
    EMAIL_RATE_LIMIT[chave] = {
      ultimoEnvio: 0,
      contadorHora: []
    };
  }

  const limite = EMAIL_RATE_LIMIT[chave];

  // Verificar se passou o intervalo mínimo
  const tempoDesdeUltimoEnvio = agora - limite.ultimoEnvio;
  const intervaloMinimo = EMAIL_RATE_LIMIT_MINUTOS * 60 * 1000;

  if (tempoDesdeUltimoEnvio < intervaloMinimo) {
    return {
      permitido: false,
      motivo: `Aguarde ${Math.ceil((intervaloMinimo - tempoDesdeUltimoEnvio) / 60000)} minutos antes de enviar outro email`
    };
  }

  // Limpar envios mais antigos que 1 hora
  const umaHoraAtras = agora - (60 * 60 * 1000);
  limite.contadorHora = limite.contadorHora.filter(t => t > umaHoraAtras);

  // Verificar limite por hora
  if (limite.contadorHora.length >= EMAIL_MAX_POR_HORA) {
    return {
      permitido: false,
      motivo: 'Limite de emails por hora atingido'
    };
  }

  return { permitido: true };
}

/**
 * Registra envio de email (NOVO v6.0.1)
 */
function registrarEnvioEmail(destinatario) {
  const agora = new Date().getTime();
  const chave = `email_${destinatario}`;

  if (!EMAIL_RATE_LIMIT[chave]) {
    EMAIL_RATE_LIMIT[chave] = {
      ultimoEnvio: 0,
      contadorHora: []
    };
  }

  EMAIL_RATE_LIMIT[chave].ultimoEnvio = agora;
  EMAIL_RATE_LIMIT[chave].contadorHora.push(agora);
}

/**
 * Envia notificação de pedido por email (v14.0.0 - EMAIL PROFISSIONAL)
 */
function enviarNotificacaoPedido(destinatario, dadosPedido) {
  try {
    // Validar email
    if (!destinatario || !validarEmail(destinatario)) {
      Logger.log('⚠️ Email inválido: ' + destinatario);
      return false;
    }

    // Verificar rate limit
    const limiteCheck = verificarRateLimitEmail(destinatario);
    if (!limiteCheck.permitido) {
      Logger.log(`⚠️ Rate limit atingido: ${limiteCheck.motivo}`);
      return false;
    }

    const assunto = `🛒 Novo Pedido: ${dadosPedido.numeroPedido}`;

    // Template de email profissional com mais informações (v14.0.0)
    let corpo = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #00A651 0%, #008542 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { max-width: 180px; margin-bottom: 15px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .info-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #00A651; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; color: #555; }
          .info-value { color: #333; }
          .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .products-table th { background: #00A651; color: white; padding: 12px; text-align: left; font-weight: bold; }
          .products-table td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
          .products-table tr:last-child td { border-bottom: none; }
          .products-table tr:hover { background: #f5f5f5; }
          .total-box { background: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: right; border: 1px solid #c8e6c9; }
          .total-value { font-size: 24px; font-weight: bold; color: #00A651; margin-top: 5px; }
          .btn { display: inline-block; background: #00A651; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .btn:hover { background: #008542; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://neoformula.com.br/cdn/shop/files/Logotipo-NeoFormula-Manipulacao-Homeopatia_76b2fa98-5ffa-4cc3-ac0a-6d41e1bc8810.png?height=100&v=1677088468" alt="Neoformula" class="logo" />
            <h1 style="margin: 10px 0;">🛒 Novo Pedido Recebido</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${dadosPedido.numeroPedido}</p>
          </div>

          <div class="content">
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">📋 Número do Pedido:</span>
                <span class="info-value">${dadosPedido.numeroPedido}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Solicitante:</span>
                <span class="info-value">${dadosPedido.solicitante}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🏷️ Tipo:</span>
                <span class="info-value">${dadosPedido.tipo}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Setor:</span>
                <span class="info-value">${dadosPedido.setor || 'Administração'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ Prazo de Entrega:</span>
                <span class="info-value">${dadosPedido.prazoEntrega || 'Não informado'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🔔 Status:</span>
                <span class="info-value" style="color: #ff9800; font-weight: bold;">⏳ Pendente</span>
              </div>
            </div>

            <h3 style="color: #00A651; margin-top: 30px;">📦 Produtos Solicitados:</h3>
            <table class="products-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style="text-align: center;">Quantidade</th>
                  <th style="text-align: center;">Unidade</th>
                  <th style="text-align: right;">Valor Unit.</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
    `;

    // Adicionar produtos com detalhes
    if (dadosPedido.produtosDetalhados && dadosPedido.produtosDetalhados.length > 0) {
      dadosPedido.produtosDetalhados.forEach(prod => {
        const subtotal = (parseFloat(prod.quantidade) || 0) * (parseFloat(prod.valorUnitario) || 0);
        corpo += `
          <tr>
            <td><strong>${prod.nome}</strong></td>
            <td style="text-align: center;">${prod.quantidade}</td>
            <td style="text-align: center;">${prod.unidade || 'UN'}</td>
            <td style="text-align: right;">R$ ${(parseFloat(prod.valorUnitario) || 0).toFixed(2)}</td>
            <td style="text-align: right;"><strong>R$ ${subtotal.toFixed(2)}</strong></td>
          </tr>
        `;
      });
    } else {
      // Fallback para formato antigo
      dadosPedido.produtos.forEach(produto => {
        corpo += `
          <tr>
            <td colspan="5">${produto}</td>
          </tr>
        `;
      });
    }

    corpo += `
              </tbody>
            </table>

            <div class="total-box">
              <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Valor Total do Pedido</div>
              <div class="total-value">R$ ${(parseFloat(dadosPedido.valorTotal) || 0).toFixed(2)}</div>
            </div>
    `;

    // Adicionar observações se houver
    if (dadosPedido.observacoes) {
      corpo += `
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
              <strong style="color: #856404;">📝 Observações:</strong>
              <p style="margin: 5px 0 0 0; color: #856404;">${dadosPedido.observacoes}</p>
            </div>
      `;
    }

    corpo += `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ScriptApp.getService().getUrl()}" class="btn">
                Acessar Sistema
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                💡 <strong>Próximos Passos:</strong>
              </p>
              <ul style="margin: 10px 0 0 20px; color: #1976d2; font-size: 14px;">
                <li>Acesse o sistema para revisar o pedido</li>
                <li>Confirme a disponibilidade dos produtos</li>
                <li>Atualize o status do pedido</li>
                <li>Notifique o solicitante sobre o andamento</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Sistema de Pedidos Neo - Papelaria / Limpeza</p>
            <p style="margin: 5px 0 0 0;">Versão 14.0.0 | © ${new Date().getFullYear()} TI Neoformula</p>
          </div>
        </div>
      </body>
      </html>
    `;

    MailApp.sendEmail({
      to: destinatario,
      subject: assunto,
      htmlBody: corpo,
      name: 'Sistema de Pedidos - Papelaria / Limpeza' // v14.0.0 - Nome do remetente
    });

    // Registrar envio
    registrarEnvioEmail(destinatario);

    Logger.log(`✅ Notificação enviada para ${destinatario}`);
    return true;

  } catch (error) {
    Logger.log(`⚠️ Erro ao enviar notificação: ${error.message}`);
    Logger.log(error.stack);
    return false;
  }
}

// ========================================
// FUNÇÕES v8.0
// ========================================

/**
 * Dar baixa em pedido - Remove produtos do estoque e finaliza pedido (v8.0)
 *
 * @param {string} pedidoId - ID do pedido (número da linha)
 * @returns {object} - { success: boolean, message: string }
 */
function darBaixaPedido(pedidoId) {
  try {
    Logger.log(`🔄 Iniciando baixa do pedido ID: ${pedidoId}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);

    // 1. Buscar pedido
    const linhaPedido = parseInt(pedidoId);
    if (isNaN(linhaPedido) || linhaPedido < 2) {
      throw new Error('ID de pedido inválido');
    }

    const dadosPedido = abaPedidos.getRange(linhaPedido, 1, 1, 15).getValues()[0];

    // Mapear colunas do pedido usando CONFIG
    const pedido = {
      id: linhaPedido,
      numeroPedido: dadosPedido[CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1],
      tipo: dadosPedido[CONFIG.COLUNAS_PEDIDOS.TIPO - 1],
      solicitanteEmail: dadosPedido[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1],
      status: dadosPedido[CONFIG.COLUNAS_PEDIDOS.STATUS - 1],
      produtos: dadosPedido[CONFIG.COLUNAS_PEDIDOS.PRODUTOS - 1], // JSON string
      quantidades: dadosPedido[CONFIG.COLUNAS_PEDIDOS.QUANTIDADES - 1] // JSON string
    };

    // 2. Validar status
    if (pedido.status !== 'Aguardando Entrega' && pedido.status !== 'Em Compra') {
      throw new Error(`Pedido não está no status adequado para baixa. Status atual: ${pedido.status}`);
    }

    // 3. Parsear produtos
    let produtos = [];
    let quantidades = [];
    try {
      produtos = JSON.parse(pedido.produtos || '[]');
      quantidades = JSON.parse(pedido.quantidades || '[]');
    } catch (e) {
      throw new Error('Erro ao parsear produtos do pedido');
    }

    if (!produtos || produtos.length === 0) {
      throw new Error('Pedido não possui produtos');
    }

    Logger.log(`📦 ${produtos.length} produto(s) a serem baixados`);

    // 4. Processar baixa de cada produto
    const usuario = Session.getActiveUser().getEmail();
    const dataHoraAtual = new Date();

    for (let i = 0; i < produtos.length; i++) {
      const produtoId = produtos[i];
      const quantidade = quantidades[i];

      // 4.1. Buscar produto no estoque
      const dadosEstoque = abaEstoque.getDataRange().getValues();
      let linhaEstoque = -1;
      let estoqueAtual = 0;
      let produtoNome = '';

      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] == produtoId) {
          linhaEstoque = j + 1;
          produtoNome = dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.PRODUTO_NOME - 1];
          estoqueAtual = dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1];
          break;
        }
      }

      if (linhaEstoque === -1) {
        Logger.log(`⚠️ Produto ID ${produtoId} não encontrado no estoque`);
        continue; // Pula este produto
      }

      // 4.2. Verificar se há estoque suficiente
      if (estoqueAtual < quantidade) {
        throw new Error(`Estoque insuficiente para ${produtoNome}. Disponível: ${estoqueAtual}, Necessário: ${quantidade}`);
      }

      // 4.3. Dar saída no estoque
      const novoEstoque = estoqueAtual - quantidade;
      const estoqueDisponivel = novoEstoque; // Simplificado - ajustar se houver reservas

      abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL).setValue(novoEstoque);
      abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL).setValue(estoqueDisponivel);
      abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO).setValue(dataHoraAtual);

      Logger.log(`✅ Baixa realizada: ${produtoNome} - Qtd: ${quantidade} - Estoque anterior: ${estoqueAtual} - Novo estoque: ${novoEstoque}`);

      // 4.4. Registrar movimentação
      const novaMovimentacao = [];
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.ID - 1] = ''; // Auto-gerado
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.DATA_HORA - 1] = dataHoraAtual;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.TIPO_MOVIMENTACAO - 1] = 'SAIDA';
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.PRODUTO_ID - 1] = produtoId;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.PRODUTO_NOME - 1] = produtoNome;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.QUANTIDADE - 1] = quantidade;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.ESTOQUE_ANTERIOR - 1] = estoqueAtual;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.ESTOQUE_ATUAL - 1] = novoEstoque;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.RESPONSAVEL - 1] = usuario;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.OBSERVACOES - 1] = `Baixa do pedido #${pedido.numeroPedido}`;
      novaMovimentacao[CONFIG.COLUNAS_MOVIMENTACOES.PEDIDO_ID - 1] = pedido.numeroPedido;

      abaMovimentacoes.appendRow(novaMovimentacao);
    }

    // 5. Atualizar status do pedido para "Finalizado"
    abaPedidos.getRange(linhaPedido, CONFIG.COLUNAS_PEDIDOS.STATUS).setValue('Finalizado');
    abaPedidos.getRange(linhaPedido, CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO).setValue(dataHoraAtual);

    Logger.log(`✅ Pedido #${pedido.numeroPedido} finalizado com sucesso`);

    return {
      success: true,
      message: `Baixa realizada com sucesso! ${produtos.length} produto(s) baixado(s) do estoque.`,
      pedidoId: pedidoId
    };

  } catch (error) {
    Logger.log(`❌ Erro ao dar baixa no pedido: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Buscar pedido por ID (v8.0)
 *
 * @param {string} pedidoId - ID do pedido (linha da planilha)
 * @returns {object} - { success: boolean, pedido: object }
 */
function getPedidoById(pedidoId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);

    const linhaPedido = parseInt(pedidoId);
    if (isNaN(linhaPedido) || linhaPedido < 2) {
      throw new Error('ID de pedido inválido');
    }

    const dadosPedido = abaPedidos.getRange(linhaPedido, 1, 1, 15).getValues()[0];

    const pedido = {
      id: linhaPedido,
      numeroPedido: dadosPedido[CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1],
      tipo: dadosPedido[CONFIG.COLUNAS_PEDIDOS.TIPO - 1],
      solicitanteEmail: dadosPedido[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1],
      solicitanteNome: dadosPedido[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_NOME - 1],
      setor: dadosPedido[CONFIG.COLUNAS_PEDIDOS.SETOR - 1],
      produtos: JSON.parse(dadosPedido[CONFIG.COLUNAS_PEDIDOS.PRODUTOS - 1] || '[]'),
      quantidades: JSON.parse(dadosPedido[CONFIG.COLUNAS_PEDIDOS.QUANTIDADES - 1] || '[]'),
      valorTotal: dadosPedido[CONFIG.COLUNAS_PEDIDOS.VALOR_TOTAL - 1],
      status: dadosPedido[CONFIG.COLUNAS_PEDIDOS.STATUS - 1],
      dataSolicitacao: dadosPedido[CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1],
      dataCompra: dadosPedido[CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA - 1],
      dataFinalizacao: dadosPedido[CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO - 1],
      prazoEntrega: dadosPedido[CONFIG.COLUNAS_PEDIDOS.PRAZO_ENTREGA - 1],
      observacoes: dadosPedido[CONFIG.COLUNAS_PEDIDOS.OBSERVACOES - 1]
    };

    return {
      success: true,
      pedido: pedido
    };

  } catch (error) {
    Logger.log(`❌ Erro ao buscar pedido: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Buscar produtos para aba Solicitação (v8.0)
 *
 * @param {string} termo - Termo de busca (nome ou código)
 * @param {string} tipo - Tipo de produto (Papelaria ou Limpeza)
 * @returns {object} - { success: boolean, produtos: array }
 */
function buscarProdutos(termo, tipo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const lastRow = abaProdutos.getLastRow();

    if (lastRow <= 1) {
      return { success: true, produtos: [] };
    }

    const dados = abaProdutos.getRange(2, 1, lastRow - 1, CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS).getValues();

    const termoLower = termo ? termo.toLowerCase() : '';

    const produtosFiltrados = dados
      .map((row, index) => ({
        id: row[CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigoFornecedor: row[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1],
        descricaoFornecedor: row[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1],
        codigoNeoformula: row[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '',
        descricaoNeoformula: row[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '',
        // Usar descrição Neoformula se existir, senão usar descrição fornecedor
        nome: row[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || row[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1],
        codigo: row[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || row[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1],
        tipo: row[CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
        categoria: row[CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1],
        unidade: row[CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1],
        precoUnitario: row[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0,
        estoqueMinimo: row[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1],
        imagemUrl: row[CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1],
        ativo: row[CONFIG.COLUNAS_PRODUTOS.ATIVO - 1],
        dadosCompletos: row[CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1]
      }))
      .filter(p => {
        // Filtrar por tipo se especificado
        if (tipo && p.tipo !== tipo) return false;

        // Filtrar por termo de busca
        if (termoLower) {
          const match =
            p.nome.toLowerCase().includes(termoLower) ||
            p.codigo.toLowerCase().includes(termoLower) ||
            (p.descricaoFornecedor && p.descricaoFornecedor.toLowerCase().includes(termoLower)) ||
            (p.codigoFornecedor && p.codigoFornecedor.toLowerCase().includes(termoLower)) ||
            (p.categoria && p.categoria.toLowerCase().includes(termoLower));
          if (!match) return false;
        }

        // Apenas produtos ativos
        return p.ativo !== false && p.ativo !== 'Não' && p.ativo !== 'N';
      })
      .slice(0, 20); // Limitar a 20 resultados

    return {
      success: true,
      produtos: produtosFiltrados
    };

  } catch (error) {
    Logger.log(`❌ Erro ao buscar produtos: ${error.message}`);
    return {
      success: false,
      error: error.message,
      produtos: []
    };
  }
}

/**
 * Buscar solicitações do usuário logado (v8.0)
 *
 * @param {string} email - Email do usuário
 * @returns {object} - { success: boolean, pedidos: array }
 */
function getMinhasSolicitacoes(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    const lastRow = abaPedidos.getLastRow();

    if (lastRow <= 1) {
      return { success: true, pedidos: [] };
    }

    const dados = abaPedidos.getRange(2, 1, lastRow - 1, 15).getValues();

    const pedidos = dados
      .map((row, index) => ({
        id: index + 2,
        numeroPedido: row[CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1],
        tipo: row[CONFIG.COLUNAS_PEDIDOS.TIPO - 1],
        solicitanteEmail: row[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1],
        solicitanteNome: row[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_NOME - 1],
        status: row[CONFIG.COLUNAS_PEDIDOS.STATUS - 1],
        valorTotal: row[CONFIG.COLUNAS_PEDIDOS.VALOR_TOTAL - 1],
        dataSolicitacao: row[CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1],
        observacoes: row[CONFIG.COLUNAS_PEDIDOS.OBSERVACOES - 1]
      }))
      .filter(p => p.solicitanteEmail === email)
      .sort((a, b) => {
        // Ordenar por data mais recente
        const dataA = a.dataSolicitacao ? new Date(a.dataSolicitacao) : new Date(0);
        const dataB = b.dataSolicitacao ? new Date(b.dataSolicitacao) : new Date(0);
        return dataB - dataA;
      })
      .slice(0, 10); // Últimas 10 solicitações

    return {
      success: true,
      pedidos: pedidos
    };

  } catch (error) {
    Logger.log(`❌ Erro ao buscar solicitações: ${error.message}`);
    return {
      success: false,
      error: error.message,
      pedidos: []
    };
  }
}
