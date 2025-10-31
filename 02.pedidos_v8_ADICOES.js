/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * ADIÇÕES AO ARQUIVO: 02.pedidos.js
 * ========================================
 *
 * INSTRUÇÕES:
 * 1. Abra o arquivo existente "02.pedidos" no Apps Script
 * 2. Role até o final do arquivo
 * 3. Cole TODO o conteúdo abaixo ANTES da última chave de fechamento }
 * 4. Salve o arquivo (Ctrl+S)
 */

/**
 * Dar baixa em pedido - Remove produtos do estoque e finaliza pedido
 *
 * @param {string} pedidoId - ID do pedido (formato: linha da planilha)
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

    // Mapear colunas do pedido
    const pedido = {
      id: linhaPedido,
      dataSolicitacao: dadosPedido[0],
      tipo: dadosPedido[1],
      solicitante: dadosPedido[2],
      departamento: dadosPedido[3],
      status: dadosPedido[4],
      produtos: dadosPedido[5], // JSON string
      valorTotal: dadosPedido[6],
      observacoes: dadosPedido[7],
      dataAprovacao: dadosPedido[8],
      aprovadoPor: dadosPedido[9],
      motivoCancelamento: dadosPedido[10],
      dataCancelamento: dadosPedido[11],
      prioridade: dadosPedido[12],
      dataEntregaPrevista: dadosPedido[13],
      dataFinalizacao: dadosPedido[14]
    };

    // 2. Validar status
    if (pedido.status !== 'Aguardando Entrega' && pedido.status !== 'Em Compra') {
      throw new Error(`Pedido não está no status adequado para baixa. Status atual: ${pedido.status}`);
    }

    // 3. Parsear produtos
    let produtos = [];
    try {
      produtos = JSON.parse(pedido.produtos);
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

    produtos.forEach(produto => {
      // 4.1. Buscar produto no estoque
      const dadosEstoque = abaEstoque.getDataRange().getValues();
      let linhaEstoque = -1;
      let estoqueAtual = 0;

      for (let i = 1; i < dadosEstoque.length; i++) {
        if (dadosEstoque[i][1] === produto.nome || dadosEstoque[i][0] === produto.codigo) {
          linhaEstoque = i + 1;
          estoqueAtual = dadosEstoque[i][3]; // Coluna D - Quantidade
          break;
        }
      }

      if (linhaEstoque === -1) {
        Logger.log(`⚠️ Produto não encontrado no estoque: ${produto.nome}`);
        // Decidir se deve lançar erro ou continuar
        // throw new Error(`Produto não encontrado no estoque: ${produto.nome}`);
        return; // Pula este produto
      }

      // 4.2. Verificar se há estoque suficiente
      if (estoqueAtual < produto.quantidade) {
        throw new Error(`Estoque insuficiente para ${produto.nome}. Disponível: ${estoqueAtual}, Necessário: ${produto.quantidade}`);
      }

      // 4.3. Dar saída no estoque
      const novoEstoque = estoqueAtual - produto.quantidade;
      abaEstoque.getRange(linhaEstoque, 4).setValue(novoEstoque); // Coluna D

      Logger.log(`✅ Baixa realizada: ${produto.nome} - Qtd: ${produto.quantidade} - Estoque anterior: ${estoqueAtual} - Novo estoque: ${novoEstoque}`);

      // 4.4. Registrar movimentação
      const novaMovimentacao = [
        dataHoraAtual,
        'SAIDA',
        produto.nome,
        produto.quantidade,
        estoqueAtual,
        novoEstoque,
        usuario,
        `Baixa do pedido #${pedidoId}`,
        pedidoId // Nova coluna: Pedido ID
      ];

      abaMovimentacoes.appendRow(novaMovimentacao);
    });

    // 5. Atualizar status do pedido para "Finalizado"
    abaPedidos.getRange(linhaPedido, 5).setValue('Finalizado'); // Coluna E - Status
    abaPedidos.getRange(linhaPedido, 15).setValue(dataHoraAtual); // Coluna O - Data Finalização

    Logger.log(`✅ Pedido #${pedidoId} finalizado com sucesso`);

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
 * Buscar pedido por ID
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
      dataSolicitacao: dadosPedido[0],
      tipo: dadosPedido[1],
      solicitante: dadosPedido[2],
      departamento: dadosPedido[3],
      status: dadosPedido[4],
      produtos: JSON.parse(dadosPedido[5] || '[]'),
      valorTotal: dadosPedido[6],
      observacoes: dadosPedido[7],
      dataAprovacao: dadosPedido[8],
      aprovadoPor: dadosPedido[9],
      motivoCancelamento: dadosPedido[10],
      dataCancelamento: dadosPedido[11],
      prioridade: dadosPedido[12],
      dataEntregaPrevista: dadosPedido[13],
      dataFinalizacao: dadosPedido[14]
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
 * Buscar produtos (para aba Solicitação)
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

    const dados = abaProdutos.getRange(2, 1, lastRow - 1, 13).getValues(); // Ajustar quantidade de colunas

    const termoLower = termo.toLowerCase();

    const produtosFiltrados = dados
      .map((row, index) => ({
        id: index + 2,
        codigo: row[0],
        nome: row[1],
        tipo: row[2],
        categoria: row[3],
        unidade: row[4],
        precoUnitario: row[5] || 0,
        fornecedor: row[6],
        descricao: row[7],
        ativo: row[8],
        dataCadastro: row[9],
        dataUltimaAtualizacao: row[10],
        usuarioCriacao: row[11],
        imagemUrl: row[12] // Nova coluna v8.0
      }))
      .filter(p => {
        // Filtrar por tipo se especificado
        if (tipo && p.tipo !== tipo) return false;

        // Filtrar por termo de busca
        if (termo) {
          const match =
            p.nome.toLowerCase().includes(termoLower) ||
            p.codigo.toLowerCase().includes(termoLower) ||
            (p.categoria && p.categoria.toLowerCase().includes(termoLower));
          return match;
        }

        return true;
      })
      .filter(p => p.ativo !== false) // Apenas produtos ativos
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
 * Buscar solicitações do usuário logado
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
        dataSolicitacao: row[0],
        tipo: row[1],
        solicitante: row[2],
        departamento: row[3],
        status: row[4],
        produtos: row[5],
        valorTotal: row[6],
        observacoes: row[7]
      }))
      .filter(p => p.solicitante === email)
      .sort((a, b) => b.dataSolicitacao - a.dataSolicitacao) // Mais recentes primeiro
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
