/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Controle de Estoque
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Controle de entrada e saída de estoque
 * - Histórico de movimentações
 * - Cálculo de estoque mínimo e ponto de pedido
 * - Alertas automáticos
 */

/**
 * Obtém estoque atual
 */
function getEstoqueAtual(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    
    if (!abaEstoque) {
      return { success: false, error: 'Aba de estoque não encontrada' };
    }
    
    const dados = abaEstoque.getDataRange().getValues();
    const estoque = [];
    
    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue;
      
      const item = {
        id: dados[i][0],
        produtoId: dados[i][1],
        produtoNome: dados[i][2],
        quantidadeAtual: dados[i][3] || 0,
        quantidadeReservada: dados[i][4] || 0,
        estoqueDisponivel: dados[i][5] || 0,
        ultimaAtualizacao: dados[i][6],
        responsavel: dados[i][7]
      };
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.produtoId && item.produtoId !== filtros.produtoId) continue;
        if (filtros.estoqueBaixo) {
          const produto = buscarProduto(item.produtoId);
          if (produto.success) {
            const estoqueMinimo = produto.produto.estoqueMinimo || 0;
            if (item.quantidadeAtual > estoqueMinimo) continue;
          }
        }
      }
      
      estoque.push(item);
    }
    
    return {
      success: true,
      estoque: estoque
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao obter estoque: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registra entrada de estoque (NOVO v6.0)
 */
function registrarEntradaEstoque(dadosMovimentacao) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem registrar entrada de estoque.'
      };
    }
    
    // Validar dados
    if (!dadosMovimentacao.produtoId || !dadosMovimentacao.quantidade) {
      return {
        success: false,
        error: 'Produto e quantidade são obrigatórios'
      };
    }
    
    const quantidade = parseFloat(dadosMovimentacao.quantidade);
    if (quantidade <= 0) {
      return {
        success: false,
        error: 'Quantidade deve ser maior que zero'
      };
    }
    
    // Buscar produto
    const resultadoProduto = buscarProduto(dadosMovimentacao.produtoId);
    if (!resultadoProduto.success) {
      return {
        success: false,
        error: 'Produto não encontrado'
      };
    }
    
    const produto = resultadoProduto.produto;
    
    // Atualizar estoque
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    
    if (!abaEstoque) {
      return { success: false, error: 'Aba de estoque não encontrada' };
    }
    
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let estoqueAtualizado = false;
    let estoqueAnterior = 0;
    let estoqueNovo = 0;
    
    // Verificar se já existe registro de estoque
    let linhaEstoque = -1;
    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][1] === dadosMovimentacao.produtoId) {
        linhaEstoque = i;
        break;
      }
    }

    if (linhaEstoque >= 0) {
      // Atualizar estoque existente
      estoqueAnterior = dadosEstoque[linhaEstoque][3] || 0;
      estoqueNovo = estoqueAnterior + quantidade;

      // Atualizar quantidade atual
      abaEstoque.getRange(linhaEstoque + 1, 4).setValue(estoqueNovo);

      // Atualizar estoque disponível
      const reservada = dadosEstoque[linhaEstoque][4] || 0;
      abaEstoque.getRange(linhaEstoque + 1, 6).setValue(estoqueNovo - reservada);

      // Atualizar data e responsável
      abaEstoque.getRange(linhaEstoque + 1, 7).setValue(new Date());
      abaEstoque.getRange(linhaEstoque + 1, 8).setValue(email);

      estoqueAtualizado = true;
    } else {
      // Criar novo registro
      estoqueAnterior = 0;
      estoqueNovo = quantidade;

      const novoEstoque = [
        Utilities.getUuid(),
        dadosMovimentacao.produtoId,
        produto.nome,
        quantidade,
        0, // Quantidade reservada
        quantidade, // Estoque disponível
        new Date(),
        email
      ];

      abaEstoque.appendRow(novoEstoque);
      estoqueAtualizado = true;
    }
    
    // Registrar movimentação
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    if (abaMovimentacoes) {
      const movimentacao = [
        Utilities.getUuid(),
        new Date(),
        'ENTRADA',
        dadosMovimentacao.produtoId,
        produto.nome,
        quantidade,
        estoqueAnterior,
        estoqueNovo,
        email,
        dadosMovimentacao.observacoes || ''
      ];
      
      abaMovimentacoes.appendRow(movimentacao);
    }
    
    // Registrar log
    registrarLog('ENTRADA_ESTOQUE', `Entrada de ${quantidade} ${produto.unidade} de ${produto.nome}`, 'SUCESSO');
    
    return {
      success: true,
      message: 'Entrada registrada com sucesso',
      estoqueAnterior: estoqueAnterior,
      estoqueNovo: estoqueNovo
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao registrar entrada: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registra saída de estoque (NOVO v6.0)
 */
function registrarSaidaEstoque(dadosMovimentacao) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem registrar saída de estoque.'
      };
    }
    
    // Validar dados
    if (!dadosMovimentacao.produtoId || !dadosMovimentacao.quantidade) {
      return {
        success: false,
        error: 'Produto e quantidade são obrigatórios'
      };
    }
    
    const quantidade = parseFloat(dadosMovimentacao.quantidade);
    if (quantidade <= 0) {
      return {
        success: false,
        error: 'Quantidade deve ser maior que zero'
      };
    }
    
    // Buscar produto
    const resultadoProduto = buscarProduto(dadosMovimentacao.produtoId);
    if (!resultadoProduto.success) {
      return {
        success: false,
        error: 'Produto não encontrado'
      };
    }
    
    const produto = resultadoProduto.produto;
    
    // Atualizar estoque
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    
    if (!abaEstoque) {
      return { success: false, error: 'Aba de estoque não encontrada' };
    }
    
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let estoqueAtualizado = false;
    let estoqueAnterior = 0;
    let estoqueNovo = 0;
    
    // Procurar produto no estoque
    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][1] === dadosMovimentacao.produtoId) {
        estoqueAnterior = dadosEstoque[i][3] || 0;
        
        // Verificar se há estoque suficiente
        if (estoqueAnterior < quantidade) {
          return {
            success: false,
            error: `Estoque insuficiente. Disponível: ${estoqueAnterior}`
          };
        }
        
        estoqueNovo = estoqueAnterior - quantidade;
        
        // Atualizar quantidade atual
        abaEstoque.getRange(i + 1, 4).setValue(estoqueNovo);
        
        // Atualizar estoque disponível
        const reservada = dadosEstoque[i][4] || 0;
        abaEstoque.getRange(i + 1, 6).setValue(estoqueNovo - reservada);
        
        // Atualizar data e responsável
        abaEstoque.getRange(i + 1, 7).setValue(new Date());
        abaEstoque.getRange(i + 1, 8).setValue(email);
        
        estoqueAtualizado = true;
        break;
      }
    }
    
    if (!estoqueAtualizado) {
      return {
        success: false,
        error: 'Produto não encontrado no estoque'
      };
    }
    
    // Registrar movimentação
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    if (abaMovimentacoes) {
      const movimentacao = [
        Utilities.getUuid(),
        new Date(),
        'SAIDA',
        dadosMovimentacao.produtoId,
        produto.nome,
        quantidade,
        estoqueAnterior,
        estoqueNovo,
        email,
        dadosMovimentacao.observacoes || ''
      ];
      
      abaMovimentacoes.appendRow(movimentacao);
    }
    
    // Verificar se atingiu estoque mínimo
    if (estoqueNovo <= produto.estoqueMinimo && produto.estoqueMinimo > 0) {
      // Enviar alerta
      const emailGestor = obterConfiguracao('EMAIL_GESTOR');
      if (emailGestor && emailGestor.includes('@')) {
        enviarAlertaEstoqueBaixo(emailGestor, produto, estoqueNovo);
      }
    }
    
    // Registrar log
    registrarLog('SAIDA_ESTOQUE', `Saída de ${quantidade} ${produto.unidade} de ${produto.nome}`, 'SUCESSO');
    
    return {
      success: true,
      message: 'Saída registrada com sucesso',
      estoqueAnterior: estoqueAnterior,
      estoqueNovo: estoqueNovo
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao registrar saída: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém histórico de movimentações (NOVO v6.0)
 */
function getHistoricoMovimentacoes(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaMovimentacoes) {
      return { success: false, error: 'Aba de movimentações não encontrada' };
    }

    const dados = abaMovimentacoes.getDataRange().getValues();
    const dadosProdutos = abaProdutos ? abaProdutos.getDataRange().getValues() : [];
    const movimentacoes = [];

    // Criar mapa de produtos para buscar tipo
    const mapaProdutos = {};
    for (let i = 1; i < dadosProdutos.length; i++) {
      const produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
      const tipoProduto = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1];
      if (produtoId) {
        mapaProdutos[produtoId] = tipoProduto;
      }
    }

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue;

      const produtoId = dados[i][3];
      const tipoProduto = mapaProdutos[produtoId] || 'Não definido';

      const movimentacao = {
        id: dados[i][0],
        dataHora: dados[i][1],
        tipo: dados[i][2],
        produtoId: produtoId,
        produtoNome: dados[i][4],
        tipoProduto: tipoProduto,
        quantidade: dados[i][5],
        estoqueAnterior: dados[i][6],
        estoqueAtual: dados[i][7],
        responsavel: dados[i][8],
        observacoes: dados[i][9]
      };

      // Aplicar filtros
      if (filtros) {
        if (filtros.produtoId && movimentacao.produtoId !== filtros.produtoId) continue;
        if (filtros.tipo && movimentacao.tipo !== filtros.tipo) continue;
        if (filtros.tipoProduto && movimentacao.tipoProduto !== filtros.tipoProduto) continue;

        if (filtros.dataInicio) {
          const dataInicio = new Date(filtros.dataInicio);
          const dataMovimentacao = new Date(movimentacao.dataHora);
          if (dataMovimentacao < dataInicio) continue;
        }

        if (filtros.dataFim) {
          const dataFim = new Date(filtros.dataFim);
          const dataMovimentacao = new Date(movimentacao.dataHora);
          if (dataMovimentacao > dataFim) continue;
        }
      }

      movimentacoes.push(movimentacao);
    }

    // Ordenar por data (mais recente primeiro)
    movimentacoes.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

    return serializarParaFrontend({
      success: true,
      movimentacoes: movimentacoes
    });

  } catch (error) {
    Logger.log('❌ Erro ao obter histórico: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Identifica produtos com estoque baixo
 */
function getProdutosEstoqueBaixo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    
    if (!abaProdutos || !abaEstoque) {
      return { success: false, error: 'Abas não encontradas' };
    }
    
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    
    const produtosEstoqueBaixo = [];
    
    for (let i = 1; i < dadosProdutos.length; i++) {
      if (!dadosProdutos[i][0]) continue;
      
      const produtoId = dadosProdutos[i][0];
      const produtoNome = dadosProdutos[i][2];
      const estoqueMinimo = dadosProdutos[i][7] || 0;
      const pontoPedido = dadosProdutos[i][8] || 0;
      
      // Buscar estoque atual
      let qtdAtual = 0;
      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][1] === produtoId) {
          qtdAtual = dadosEstoque[j][3] || 0;
          break;
        }
      }
      
      // Verificar se está abaixo do estoque mínimo
      if (qtdAtual <= estoqueMinimo && estoqueMinimo > 0) {
        produtosEstoqueBaixo.push({
          produtoId: produtoId,
          produtoNome: produtoNome,
          qtdAtual: qtdAtual,
          estoqueMinimo: estoqueMinimo,
          pontoPedido: pontoPedido,
          alerta: 'ESTOQUE_BAIXO'
        });
      }
      // Verificar se está no ponto de pedido
      else if (qtdAtual <= pontoPedido && pontoPedido > 0) {
        produtosEstoqueBaixo.push({
          produtoId: produtoId,
          produtoNome: produtoNome,
          qtdAtual: qtdAtual,
          estoqueMinimo: estoqueMinimo,
          pontoPedido: pontoPedido,
          alerta: 'PONTO_PEDIDO'
        });
      }
    }
    
    return {
      success: true,
      produtos: produtosEstoqueBaixo
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao identificar produtos com estoque baixo: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envia alerta de estoque baixo
 */
function enviarAlertaEstoqueBaixo(destinatario, produto, estoqueAtual) {
  try {
    const assunto = `⚠️ Alerta: Estoque Baixo - ${produto.nome}`;
    
    const corpo = `
      <h2 style="color: #F44336;">Sistema Neoformula - Alerta de Estoque</h2>
      <p><strong>Produto:</strong> ${produto.nome}</p>
      <p><strong>Código:</strong> ${produto.codigo}</p>
      <p><strong>Estoque Atual:</strong> ${estoqueAtual} ${produto.unidade}</p>
      <p><strong>Estoque Mínimo:</strong> ${produto.estoqueMinimo} ${produto.unidade}</p>
      <p><strong>Ponto de Pedido:</strong> ${produto.pontoPedido} ${produto.unidade}</p>
      
      <p style="color: #F44336; font-weight: bold;">
        ⚠️ É necessário realizar a reposição deste item!
      </p>
      
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
    
    Logger.log(`✅ Alerta de estoque baixo enviado para ${destinatario}`);

  } catch (error) {
    Logger.log(`⚠️ Erro ao enviar alerta: ${error.message}`);
  }
}

/**
 * ========================================
 * FUNÇÃO GENÉRICA DE MOVIMENTAÇÃO (v10.4)
 * ========================================
 * Unifica ENTRADA, SAÍDA e AJUSTE de estoque
 * Suporta referências a Pedidos e Notas Fiscais
 */

/**
 * Registra movimentação de estoque genérica (v10.4)
 *
 * @param {object} dados - Dados da movimentação
 * @param {string} dados.tipo - Tipo: 'ENTRADA', 'SAIDA', 'AJUSTE'
 * @param {string} dados.produtoId - ID do produto
 * @param {number} dados.quantidade - Quantidade (positiva ou negativa)
 * @param {string} dados.observacoes - Observações
 * @param {string} dados.responsavel - Email do responsável (opcional)
 * @param {string} dados.pedidoId - ID do pedido (opcional)
 * @param {string} dados.nfId - ID da NF (opcional)
 * @param {number} dados.custoUnitario - Custo unitário (opcional)
 * @returns {object} - { success, estoqueAnterior, estoqueAtual, movimentacaoId }
 */
function registrarMovimentacao(dados) {
  try {
    Logger.log('📦 Registrando movimentação de estoque...');
    Logger.log(`   Tipo: ${dados.tipo}`);
    Logger.log(`   Produto ID: ${dados.produtoId}`);
    Logger.log(`   Quantidade: ${dados.quantidade}`);

    // Validações
    if (!dados.tipo || !dados.produtoId || dados.quantidade === undefined) {
      return {
        success: false,
        error: 'Tipo, produtoId e quantidade são obrigatórios'
      };
    }

    const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE'];
    if (!tiposValidos.includes(dados.tipo)) {
      return {
        success: false,
        error: 'Tipo inválido. Use: ENTRADA, SAIDA ou AJUSTE'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);

    if (!abaEstoque || !abaMovimentacoes) {
      return {
        success: false,
        error: 'Abas de estoque ou movimentações não encontradas'
      };
    }

    // 1. Buscar produto
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const dadosProdutos = abaProdutos.getDataRange().getValues();

    let produto = null;
    for (let i = 1; i < dadosProdutos.length; i++) {
      if (dadosProdutos[i][0] === dados.produtoId) {
        produto = {
          id: dadosProdutos[i][0],
          nome: dadosProdutos[i][2]
        };
        break;
      }
    }

    if (!produto) {
      return {
        success: false,
        error: `Produto ${dados.produtoId} não encontrado`
      };
    }

    // 2. Buscar ou criar registro de estoque
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let linhaEstoque = -1;
    let estoqueAtualAntes = 0;
    let estoqueId = null;

    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === dados.produtoId) {
        linhaEstoque = i + 1;
        estoqueId = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.ID - 1];
        estoqueAtualAntes = Number(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1]) || 0;
        break;
      }
    }

    // Se não existe, criar novo registro de estoque
    if (linhaEstoque === -1) {
      Logger.log(`⚠️ Estoque não existe para produto ${dados.produtoId}, criando...`);

      estoqueId = 'EST-' + Date.now();
      const novaLinhaEstoque = [
        estoqueId,                    // ID
        dados.produtoId,              // Produto ID
        produto.nome,                 // Produto Nome
        0,                            // Quantidade Atual
        0,                            // Quantidade Reservada
        0,                            // Estoque Disponível
        new Date(),                   // Última Atualização
        dados.responsavel || Session.getActiveUser().getEmail()  // Responsável
      ];

      abaEstoque.appendRow(novaLinhaEstoque);
      linhaEstoque = abaEstoque.getLastRow();
      estoqueAtualAntes = 0;
    }

    // 3. Calcular novo estoque
    let novoEstoque = estoqueAtualAntes;

    if (dados.tipo === 'ENTRADA') {
      novoEstoque += Math.abs(dados.quantidade);
    } else if (dados.tipo === 'SAIDA') {
      novoEstoque -= Math.abs(dados.quantidade);
    } else if (dados.tipo === 'AJUSTE') {
      // Para ajuste, a quantidade pode ser positiva ou negativa
      novoEstoque += dados.quantidade;
    }

    // Não permitir estoque negativo
    if (novoEstoque < 0) {
      Logger.log(`⚠️ Estoque ficaria negativo: ${novoEstoque}`);
      return {
        success: false,
        error: `Estoque insuficiente. Disponível: ${estoqueAtualAntes}, Solicitado: ${Math.abs(dados.quantidade)}`
      };
    }

    // 4. Atualizar estoque
    abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL).setValue(novoEstoque);
    abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL).setValue(novoEstoque); // Simplificado
    abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO).setValue(new Date());
    abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL).setValue(dados.responsavel || Session.getActiveUser().getEmail());

    // 5. Registrar movimentação
    const movimentacaoId = 'MOV-' + Date.now();

    const novaMovimentacao = [
      movimentacaoId,                                           // A - ID
      new Date(),                                               // B - Data/Hora
      dados.tipo,                                               // C - Tipo Movimentação
      dados.produtoId,                                          // D - Produto ID
      produto.nome,                                             // E - Produto Nome
      Math.abs(dados.quantidade),                               // F - Quantidade
      estoqueAtualAntes,                                        // G - Estoque Anterior
      novoEstoque,                                              // H - Estoque Atual
      dados.responsavel || Session.getActiveUser().getEmail(), // I - Responsável
      dados.observacoes || '',                                  // J - Observações
      dados.pedidoId || '',                                     // K - Pedido ID
      dados.nfId || '',                                         // L - NF ID (v10.4)
      dados.custoUnitario || ''                                 // M - Custo Unitário (v10.4)
    ];

    abaMovimentacoes.appendRow(novaMovimentacao);

    Logger.log(`✅ Movimentação registrada com sucesso!`);
    Logger.log(`   Estoque Anterior: ${estoqueAtualAntes}`);
    Logger.log(`   Estoque Atual: ${novoEstoque}`);
    Logger.log(`   Movimentação ID: ${movimentacaoId}`);

    return {
      success: true,
      estoqueAnterior: estoqueAtualAntes,
      estoqueAtual: novoEstoque,
      movimentacaoId: movimentacaoId
    };

  } catch (error) {
    Logger.log('❌ Erro ao registrar movimentação: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}
