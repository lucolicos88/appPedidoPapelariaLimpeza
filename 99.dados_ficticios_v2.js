/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA
 * MÓDULO: DADOS FICTÍCIOS V2 - AUTO-DETECT IDS
 * ========================================
 *
 * SOLUÇÃO PARA CONFLITO DE IDs:
 * - Detecta automaticamente os IDs existentes
 * - Gera novos IDs únicos com prefixo "FICT-"
 * - Mantém registro em aba separada para rastreamento
 * - Permite limpeza seletiva baseada em metadados
 */

/**
 * FUNÇÃO DE TESTE - Insere dados fictícios com IDs auto-gerados
 */
function testarInsercaoDadosFicticio sV2() {
  Logger.log('🧪 INICIANDO TESTE DE INSERÇÃO V2 (Auto-detect IDs)...');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userEmail = Session.getActiveUser().getEmail();

    Logger.log('📊 Iniciando inserção de dados fictícios V2...');
    Logger.log('👤 Usuário: ' + userEmail);

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0,
      idsGerados: {
        produtos: [],
        pedidos: [],
        estoque: [],
        movimentacoes: []
      },
      erros: []
    };

    // Criar/Atualizar aba de metadados
    criarOuAtualizarAbaMetadados(ss);

    // 1. Inserir Produtos com IDs auto-gerados
    try {
      const resultProdutos = inserirProdutosFictíciosV2(ss);
      resultado.produtos = resultProdutos.inseridos;
      resultado.idsGerados.produtos = resultProdutos.ids;
      Logger.log(`✅ ${resultado.produtos} produtos inseridos`);
      Logger.log(`   IDs: ${resultProdutos.ids.join(', ')}`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir produtos: ' + error.message);
      resultado.erros.push('Produtos: ' + error.message);
    }

    // 2. Inserir Estoque
    try {
      const resultEstoque = inserirEstoqueFicticioV2(ss, userEmail, resultado.idsGerados.produtos);
      resultado.estoque = resultEstoque.inseridos;
      resultado.idsGerados.estoque = resultEstoque.ids;
      Logger.log(`✅ ${resultado.estoque} registros de estoque inseridos`);
      Logger.log(`   IDs: ${resultEstoque.ids.join(', ')}`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir estoque: ' + error.message);
      resultado.erros.push('Estoque: ' + error.message);
    }

    // 3. Inserir Pedidos
    try {
      const resultPedidos = inserirPedidosFictíciosV2(ss, userEmail, resultado.idsGerados.produtos);
      resultado.pedidos = resultPedidos.inseridos;
      resultado.idsGerados.pedidos = resultPedidos.ids;
      Logger.log(`✅ ${resultado.pedidos} pedidos inseridos`);
      Logger.log(`   IDs: ${resultPedidos.ids.join(', ')}`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir pedidos: ' + error.message);
      resultado.erros.push('Pedidos: ' + error.message);
    }

    // 4. Inserir Movimentações
    try {
      const resultMov = inserirMovimentacoesFicticiasV2(ss, userEmail, resultado.idsGerados.produtos, resultado.idsGerados.pedidos);
      resultado.movimentacoes = resultMov.inseridos;
      resultado.idsGerados.movimentacoes = resultMov.ids;
      Logger.log(`✅ ${resultado.movimentacoes} movimentações inseridas`);
      Logger.log(`   IDs: ${resultMov.ids.join(', ')}`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir movimentações: ' + error.message);
      resultado.erros.push('Movimentações: ' + error.message);
    }

    // 5. Salvar metadados
    salvarMetadadosFicticios(ss, resultado.idsGerados);

    Logger.log('');
    Logger.log('✅ ===== RESUMO DA INSERÇÃO V2 =====');
    Logger.log(`📦 Produtos inseridos: ${resultado.produtos}`);
    Logger.log(`📊 Registros de estoque: ${resultado.estoque}`);
    Logger.log(`🛒 Pedidos inseridos: ${resultado.pedidos}`);
    Logger.log(`📝 Movimentações inseridas: ${resultado.movimentacoes}`);
    Logger.log('');
    Logger.log('📋 IDs GERADOS (use para limpeza):');
    Logger.log(`   Produtos: ${resultado.idsGerados.produtos.join(', ')}`);
    Logger.log(`   Pedidos: ${resultado.idsGerados.pedidos.join(', ')}`);
    Logger.log(`   Estoque: ${resultado.idsGerados.estoque.join(', ')}`);
    Logger.log(`   Movimentações: ${resultado.idsGerados.movimentacoes.join(', ')}`);

    if (resultado.erros.length > 0) {
      Logger.log('');
      Logger.log('⚠️ AVISOS:');
      resultado.erros.forEach(erro => Logger.log('  • ' + erro));
    }

    Logger.log('');
    Logger.log('🎯 Agora abra o Dashboard e verifique os KPIs!');

    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO GERAL: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Cria ou atualiza aba de metadados para rastreamento
 */
function criarOuAtualizarAbaMetadados(ss) {
  let sheet = ss.getSheetByName('_Dados_Ficticios_Meta');

  if (!sheet) {
    sheet = ss.insertSheet('_Dados_Ficticios_Meta');
    sheet.hideSheet(); // Ocultar para não confundir usuários

    // Cabeçalhos
    sheet.getRange(1, 1, 1, 6).setValues([[
      'Timestamp',
      'Usuario',
      'Tipo',
      'IDs Gerados',
      'Quantidade',
      'Versao'
    ]]);

    // Formatar cabeçalho
    sheet.getRange(1, 1, 1, 6)
      .setBackground('#00A651')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
  }

  return sheet;
}

/**
 * Salva metadados dos dados fictícios inseridos
 */
function salvarMetadadosFicticios(ss, idsGerados) {
  const sheet = ss.getSheetByName('_Dados_Ficticios_Meta');
  if (!sheet) return;

  const timestamp = new Date();
  const userEmail = Session.getActiveUser().getEmail();

  // Adicionar registro para cada tipo
  const tipos = ['produtos', 'pedidos', 'estoque', 'movimentacoes'];

  tipos.forEach(tipo => {
    if (idsGerados[tipo] && idsGerados[tipo].length > 0) {
      sheet.appendRow([
        timestamp,
        userEmail,
        tipo.toUpperCase(),
        idsGerados[tipo].join('; '),
        idsGerados[tipo].length,
        '2.0'
      ]);
    }
  });
}

/**
 * Gera ID único para produtos fictícios
 */
function gerarIdProdutoFicticio(sheet, indice) {
  const dados = sheet.getDataRange().getValues();
  const idsExistentes = dados.slice(1).map(row => row[0]);

  let novoId;
  let contador = indice;

  do {
    novoId = `FICT-PROD-${String(contador).padStart(3, '0')}`;
    contador++;
  } while (idsExistentes.includes(novoId));

  return novoId;
}

/**
 * Insere produtos fictícios V2 (com IDs auto-gerados)
 */
function inserirProdutosFictíciosV2(ss) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  if (!sheet) throw new Error('Aba Produtos não encontrada');

  // Dados base (sem IDs fixos)
  const produtosBase = [
    { codigo: 'CAN-FICT-001', nome: 'Caneta Azul Fictícia', tipo: 'Papelaria', categoria: 'Escrita', unidade: 'UN', preco: 2.50, estoqueMin: 50, pontoPedido: 100, fornecedor: 'Papelaria ABC' },
    { codigo: 'CAD-FICT-001', nome: 'Caderno Fictício', tipo: 'Papelaria', categoria: 'Escrita', unidade: 'UN', preco: 12.50, estoqueMin: 10, pontoPedido: 20, fornecedor: 'Papelaria ABC' },
    { codigo: 'DET-FICT-001', nome: 'Detergente Fictício', tipo: 'Limpeza', categoria: 'Limpeza', unidade: 'UN', preco: 4.50, estoqueMin: 30, pontoPedido: 50, fornecedor: 'Limpeza XYZ' },
    { codigo: 'ALC-FICT-001', nome: 'Álcool Fictício', tipo: 'Limpeza', categoria: 'Limpeza', unidade: 'UN', preco: 8.90, estoqueMin: 20, pontoPedido: 40, fornecedor: 'Limpeza XYZ' },
    { codigo: 'PAP-FICT-001', nome: 'Papel A4 Fictício', tipo: 'Papelaria', categoria: 'Papel', unidade: 'CX', preco: 35.00, estoqueMin: 20, pontoPedido: 40, fornecedor: 'Papelaria ABC' }
  ];

  const dados = sheet.getDataRange().getValues();
  const codigosExistentes = dados.slice(1).map(row => row[1]); // Coluna B = Código

  let inseridos = 0;
  const idsGerados = [];

  produtosBase.forEach((prod, index) => {
    // Verificar se código já existe
    if (!codigosExistentes.includes(prod.codigo)) {
      const novoId = gerarIdProdutoFicticio(sheet, index + 1);

      const novoProduto = [
        novoId,
        prod.codigo,
        prod.nome,
        prod.tipo,
        prod.categoria,
        prod.unidade,
        prod.preco,
        prod.estoqueMin,
        prod.pontoPedido,
        prod.fornecedor,
        '', // ImagemURL
        'Sim', // Ativo
        new Date() // Data Cadastro
      ];

      sheet.appendRow(novoProduto);
      inseridos++;
      idsGerados.push(novoId);
    }
  });

  return { inseridos, ids: idsGerados };
}

/**
 * Insere estoque fictício V2
 */
function inserirEstoqueFicticioV2(ss, userEmail, idsProdutos) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.STOCK);
  if (!sheet) throw new Error('Aba Estoque não encontrada');

  if (!idsProdutos || idsProdutos.length === 0) {
    return { inseridos: 0, ids: [] };
  }

  // Buscar nomes dos produtos
  const sheetProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const dadosProdutos = sheetProdutos.getDataRange().getValues();

  const qtdsEstoque = [150, 8, 45, 15, 60]; // Quantidades para cada produto

  let inseridos = 0;
  const idsGerados = [];
  const agora = new Date();

  idsProdutos.forEach((prodId, index) => {
    // Buscar nome do produto
    let nomeProduto = '';
    for (let i = 1; i < dadosProdutos.length; i++) {
      if (dadosProdutos[i][0] === prodId) {
        nomeProduto = dadosProdutos[i][2]; // Coluna C = Nome
        break;
      }
    }

    if (nomeProduto) {
      const novoId = `FICT-EST-${String(index + 1).padStart(3, '0')}`;
      const qtd = qtdsEstoque[index] || 50;

      sheet.appendRow([
        novoId,
        prodId,
        nomeProduto,
        qtd, // Quantidade Atual
        Math.floor(qtd * 0.1), // Quantidade Reservada (10%)
        qtd - Math.floor(qtd * 0.1), // Estoque Disponível
        agora,
        userEmail
      ]);

      inseridos++;
      idsGerados.push(novoId);
    }
  });

  return { inseridos, ids: idsGerados };
}

/**
 * Insere pedidos fictícios V2
 */
function inserirPedidosFictíciosV2(ss, userEmail, idsProdutos) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  if (!sheet) throw new Error('Aba Pedidos não encontrada');

  if (!idsProdutos || idsProdutos.length < 2) {
    throw new Error('Necessário pelo menos 2 produtos fictícios');
  }

  // Dados dos pedidos (usaremos os produtos fictícios criados)
  const pedidosBase = [
    { numeroPedido: 'FICT-2025-001', tipo: 'Papelaria', email: 'joao@neoformula.com', nome: 'João Silva', setor: 'TI', produtos: [0, 1], quantidades: [50, 10], valorTotal: 250.00, status: 'Finalizado', dataSol: '01/10/2025', dataCompra: '02/10/2025', dataFin: '05/10/2025', prazo: '10/10/2025', obs: 'Entregue no prazo' },
    { numeroPedido: 'FICT-2025-002', tipo: 'Limpeza', email: 'maria@neoformula.com', nome: 'Maria Santos', setor: 'RH', produtos: [2, 3], quantidades: [20, 15], valorTotal: 223.50, status: 'Finalizado', dataSol: '03/10/2025', dataCompra: '04/10/2025', dataFin: '08/10/2025', prazo: '12/10/2025', obs: 'OK' },
    { numeroPedido: 'FICT-2025-003', tipo: 'Papelaria', email: 'pedro@neoformula.com', nome: 'Pedro Costa', setor: 'Vendas', produtos: [4, 0], quantidades: [10, 25], valorTotal: 412.50, status: 'Em Compra', dataSol: '10/10/2025', dataCompra: '11/10/2025', dataFin: '', prazo: '20/10/2025', obs: 'Aguardando fornecedor' }
  ];

  // Buscar nomes dos produtos
  const sheetProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const dadosProdutos = sheetProdutos.getDataRange().getValues();

  let inseridos = 0;
  const idsGerados = [];

  pedidosBase.forEach((ped, index) => {
    const novoId = `FICT-PED-${String(index + 1).padStart(3, '0')}`;

    // Mapear índices de produtos para nomes
    const nomesProdutos = ped.produtos.map(idx => {
      if (idx < idsProdutos.length) {
        const prodId = idsProdutos[idx];
        for (let i = 1; i < dadosProdutos.length; i++) {
          if (dadosProdutos[i][0] === prodId) {
            return dadosProdutos[i][2]; // Nome
          }
        }
      }
      return '';
    }).filter(n => n !== '');

    sheet.appendRow([
      novoId,
      ped.numeroPedido,
      ped.tipo,
      ped.email,
      ped.nome,
      ped.setor,
      nomesProdutos.join('; '),
      ped.quantidades.join('; '),
      ped.valorTotal,
      ped.status,
      ped.dataSol,
      ped.dataCompra,
      ped.dataFin,
      ped.prazo,
      ped.obs
    ]);

    inseridos++;
    idsGerados.push(novoId);
  });

  return { inseridos, ids: idsGerados };
}

/**
 * Insere movimentações fictícias V2
 */
function inserirMovimentacoesFicticiasV2(ss, userEmail, idsProdutos, idsPedidos) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
  if (!sheet) throw new Error('Aba Movimentações Estoque não encontrada');

  if (!idsProdutos || idsProdutos.length === 0) {
    return { inseridos: 0, ids: [] };
  }

  // Buscar nomes dos produtos
  const sheetProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const dadosProdutos = sheetProdutos.getDataRange().getValues();

  const movimentacoesBase = [
    { tipo: 'ENTRADA', produtoIdx: 0, quantidade: 200, estoqueAnt: 0, estoqueAtual: 200, obs: 'Entrada inicial', pedidoIdx: null },
    { tipo: 'SAIDA', produtoIdx: 0, quantidade: 50, estoqueAnt: 200, estoqueAtual: 150, obs: 'Baixa pedido', pedidoIdx: 0 },
    { tipo: 'SAIDA', produtoIdx: 2, quantidade: 20, estoqueAnt: 65, estoqueAtual: 45, obs: 'Baixa pedido', pedidoIdx: 1 }
  ];

  let inseridos = 0;
  const idsGerados = [];

  movimentacoesBase.forEach((mov, index) => {
    if (mov.produtoIdx < idsProdutos.length) {
      const novoId = `FICT-MOV-${String(index + 1).padStart(3, '0')}`;
      const prodId = idsProdutos[mov.produtoIdx];

      // Buscar nome do produto
      let nomeProduto = '';
      for (let i = 1; i < dadosProdutos.length; i++) {
        if (dadosProdutos[i][0] === prodId) {
          nomeProduto = dadosProdutos[i][2];
          break;
        }
      }

      const pedidoId = (mov.pedidoIdx !== null && idsPedidos && mov.pedidoIdx < idsPedidos.length)
        ? idsPedidos[mov.pedidoIdx]
        : '';

      sheet.appendRow([
        novoId,
        new Date(),
        mov.tipo,
        prodId,
        nomeProduto,
        mov.quantidade,
        mov.estoqueAnt,
        mov.estoqueAtual,
        userEmail,
        mov.obs,
        pedidoId
      ]);

      inseridos++;
      idsGerados.push(novoId);
    }
  });

  return { inseridos, ids: idsGerados };
}

/**
 * Limpa dados fictícios baseado nos metadados
 */
function testarLimpezaDadosFictíciosV2() {
  Logger.log('🧪 INICIANDO LIMPEZA V2 (Baseado em Metadados)...');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMeta = ss.getSheetByName('_Dados_Ficticios_Meta');

    if (!sheetMeta) {
      Logger.log('⚠️ Nenhum metadado encontrado. Use a versão V1 da limpeza ou insira dados primeiro.');
      return { sucesso: false, erro: 'Metadados não encontrados' };
    }

    // Ler metadados
    const dadosMeta = sheetMeta.getDataRange().getValues();
    const idsParaRemover = {
      PRODUTOS: [],
      PEDIDOS: [],
      ESTOQUE: [],
      MOVIMENTACOES: []
    };

    for (let i = 1; i < dadosMeta.length; i++) {
      const tipo = dadosMeta[i][2]; // Coluna C = Tipo
      const ids = dadosMeta[i][3].split('; '); // Coluna D = IDs

      if (idsParaRemover[tipo]) {
        idsParaRemover[tipo].push(...ids);
      }
    }

    Logger.log('📋 IDs para remover:');
    Logger.log(`   Produtos: ${idsParaRemover.PRODUTOS.length}`);
    Logger.log(`   Pedidos: ${idsParaRemover.PEDIDOS.length}`);
    Logger.log(`   Estoque: ${idsParaRemover.ESTOQUE.length}`);
    Logger.log(`   Movimentações: ${idsParaRemover.MOVIMENTACOES.length}`);

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0
    };

    // Remover dados
    resultado.pedidos = removerLinhasPorIds(ss, CONFIG.ABAS.ORDERS, idsParaRemover.PEDIDOS);
    resultado.movimentacoes = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK_MOVEMENTS, idsParaRemover.MOVIMENTACOES);
    resultado.estoque = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK, idsParaRemover.ESTOQUE);
    resultado.produtos = removerLinhasPorIds(ss, CONFIG.ABAS.PRODUCTS, idsParaRemover.PRODUTOS);

    // Limpar metadados
    sheetMeta.getRange(2, 1, sheetMeta.getLastRow() - 1, 6).clearContent();

    Logger.log('');
    Logger.log('✅ ===== RESUMO DA LIMPEZA V2 =====');
    Logger.log(`📦 Produtos removidos: ${resultado.produtos}`);
    Logger.log(`📊 Registros de estoque: ${resultado.estoque}`);
    Logger.log(`🛒 Pedidos removidos: ${resultado.pedidos}`);
    Logger.log(`📝 Movimentações removidas: ${resultado.movimentacoes}`);
    Logger.log('✅ Metadados limpos!');

    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO GERAL: ' + error.message);
    throw error;
  }
}

/**
 * Helper: Remove linhas por IDs (mesma função da V1)
 */
function removerLinhasPorIds(ss, nomeAba, ids) {
  const sheet = ss.getSheetByName(nomeAba);
  if (!sheet || ids.length === 0) return 0;

  const dados = sheet.getDataRange().getValues();
  let removidos = 0;

  for (let i = dados.length - 1; i > 0; i--) {
    if (ids.includes(dados[i][0])) {
      sheet.deleteRow(i + 1);
      removidos++;
    }
  }

  return removidos;
}
