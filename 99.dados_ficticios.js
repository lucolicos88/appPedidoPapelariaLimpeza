/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA
 * MÓDULO: DADOS FICTÍCIOS PARA TESTES
 * ========================================
 *
 * Este módulo permite inserir dados fictícios na planilha para testes de KPIs
 *
 * COMO EXECUTAR VIA APPS SCRIPT EDITOR:
 * 1. Selecione a função "testarInsercaoDadosFicticios" no dropdown
 * 2. Clique no botão "Executar" (▶️)
 * 3. Veja os logs em "Execuções" ou pressione Ctrl+Enter
 */

/**
 * FUNÇÃO DE TESTE - Execute esta função pelo Apps Script Editor
 * Não requer autenticação de usuário Admin (apenas para testes)
 */
function testarInsercaoDadosFicticios() {
  Logger.log('🧪 INICIANDO TESTE DE INSERÇÃO DE DADOS FICTÍCIOS...');
  Logger.log('⚠️ Esta função ignora a verificação de perfil Admin para testes');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userEmail = Session.getActiveUser().getEmail();

    Logger.log('📊 Iniciando inserção de dados fictícios...');
    Logger.log('👤 Usuário: ' + userEmail);

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0,
      erros: []
    };

    // 1. Inserir Produtos
    try {
      resultado.produtos = inserirProdutosFicticios(ss);
      Logger.log(`✅ ${resultado.produtos} produtos inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir produtos: ' + error.message);
      resultado.erros.push('Produtos: ' + error.message);
    }

    // 2. Inserir Estoque
    try {
      resultado.estoque = inserirEstoqueFicticio(ss, userEmail);
      Logger.log(`✅ ${resultado.estoque} registros de estoque inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir estoque: ' + error.message);
      resultado.erros.push('Estoque: ' + error.message);
    }

    // 3. Inserir Pedidos
    try {
      resultado.pedidos = inserirPedidosFicticios(ss, userEmail);
      Logger.log(`✅ ${resultado.pedidos} pedidos inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir pedidos: ' + error.message);
      resultado.erros.push('Pedidos: ' + error.message);
    }

    // 4. Inserir Movimentações
    try {
      resultado.movimentacoes = inserirMovimentacoesFicticias(ss, userEmail);
      Logger.log(`✅ ${resultado.movimentacoes} movimentações inseridas`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir movimentações: ' + error.message);
      resultado.erros.push('Movimentações: ' + error.message);
    }

    Logger.log('');
    Logger.log('✅ ===== RESUMO DA INSERÇÃO =====');
    Logger.log(`📦 Produtos inseridos: ${resultado.produtos}`);
    Logger.log(`📊 Registros de estoque: ${resultado.estoque}`);
    Logger.log(`🛒 Pedidos inseridos: ${resultado.pedidos}`);
    Logger.log(`📝 Movimentações inseridas: ${resultado.movimentacoes}`);

    if (resultado.erros.length > 0) {
      Logger.log('');
      Logger.log('⚠️ AVISOS:');
      resultado.erros.forEach(erro => Logger.log('  • ' + erro));
    }

    Logger.log('');
    Logger.log('🎯 Agora abra o Dashboard e verifique os KPIs!');
    Logger.log('📊 Valores esperados:');
    Logger.log('   • Total de Pedidos: 11 (excluindo cancelado)');
    Logger.log('   • Valor Total: R$ 3.526,80');
    Logger.log('   • Ticket Médio: R$ 320,62');
    Logger.log('   • Estoque Baixo: 2 produtos (Caderno e Álcool)');

    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO GERAL: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * FUNÇÃO DE TESTE - Limpa dados fictícios (Execute pelo Apps Script Editor)
 */
function testarLimpezaDadosFicticios() {
  Logger.log('🧪 INICIANDO TESTE DE LIMPEZA DE DADOS FICTÍCIOS...');
  Logger.log('⚠️ Esta função ignora a verificação de perfil Admin para testes');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    Logger.log('🗑️ Iniciando limpeza de dados fictícios...');

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0
    };

    // IDs fictícios a remover
    const idsPedidosFicticios = ['PED-001', 'PED-002', 'PED-003', 'PED-004', 'PED-005', 'PED-006', 'PED-007', 'PED-008', 'PED-009', 'PED-010', 'PED-011', 'PED-012'];
    const idsProdutosFicticios = ['PROD-021', 'PROD-022', 'PROD-023', 'PROD-024', 'PROD-025'];
    const idsEstoqueFicticios = ['EST-001', 'EST-002', 'EST-003', 'EST-004', 'EST-005'];
    const idsMovimentacoesFicticias = ['MOV-001', 'MOV-002', 'MOV-003'];

    // Remover Pedidos
    resultado.pedidos = removerLinhasPorIds(ss, CONFIG.ABAS.ORDERS, idsPedidosFicticios);
    Logger.log(`✅ ${resultado.pedidos} pedidos removidos`);

    // Remover Movimentações
    resultado.movimentacoes = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK_MOVEMENTS, idsMovimentacoesFicticias);
    Logger.log(`✅ ${resultado.movimentacoes} movimentações removidas`);

    // Remover Estoque
    resultado.estoque = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK, idsEstoqueFicticios);
    Logger.log(`✅ ${resultado.estoque} registros de estoque removidos`);

    // Remover Produtos
    resultado.produtos = removerLinhasPorIds(ss, CONFIG.ABAS.PRODUCTS, idsProdutosFicticios);
    Logger.log(`✅ ${resultado.produtos} produtos removidos`);

    Logger.log('');
    Logger.log('✅ ===== RESUMO DA LIMPEZA =====');
    Logger.log(`📦 Produtos removidos: ${resultado.produtos}`);
    Logger.log(`📊 Registros de estoque: ${resultado.estoque}`);
    Logger.log(`🛒 Pedidos removidos: ${resultado.pedidos}`);
    Logger.log(`📝 Movimentações removidas: ${resultado.movimentacoes}`);
    Logger.log('');
    Logger.log('✅ Dados fictícios removidos com sucesso!');

    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO GERAL: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Insere todos os dados fictícios na planilha
 * @returns {Object} Status da operação com contadores
 */
function inserirDadosFicticios() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userEmail = Session.getActiveUser().getEmail();

    Logger.log('📊 Iniciando inserção de dados fictícios...');

    // Verificar se usuário é Admin
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.perfil !== CONFIG.PERFIS.ADMIN) {
      throw new Error('Apenas administradores podem inserir dados fictícios');
    }

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0,
      erros: []
    };

    // 1. Inserir Produtos (se não existirem)
    try {
      resultado.produtos = inserirProdutosFicticios(ss);
      Logger.log(`✅ ${resultado.produtos} produtos inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir produtos: ' + error.message);
      resultado.erros.push('Produtos: ' + error.message);
    }

    // 2. Inserir Estoque (após produtos)
    try {
      resultado.estoque = inserirEstoqueFicticio(ss, userEmail);
      Logger.log(`✅ ${resultado.estoque} registros de estoque inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir estoque: ' + error.message);
      resultado.erros.push('Estoque: ' + error.message);
    }

    // 3. Inserir Pedidos
    try {
      resultado.pedidos = inserirPedidosFicticios(ss, userEmail);
      Logger.log(`✅ ${resultado.pedidos} pedidos inseridos`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir pedidos: ' + error.message);
      resultado.erros.push('Pedidos: ' + error.message);
    }

    // 4. Inserir Movimentações
    try {
      resultado.movimentacoes = inserirMovimentacoesFicticias(ss, userEmail);
      Logger.log(`✅ ${resultado.movimentacoes} movimentações inseridas`);
    } catch (error) {
      Logger.log('❌ Erro ao inserir movimentações: ' + error.message);
      resultado.erros.push('Movimentações: ' + error.message);
    }

    Logger.log('✅ Dados fictícios inseridos com sucesso!');
    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO ao inserir dados fictícios: ' + error.message);
    return {
      sucesso: false,
      erro: error.message,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0,
      erros: [error.message]
    };
  }
}

/**
 * Insere produtos fictícios (se não existirem)
 * @param {SpreadsheetApp.Spreadsheet} ss - Spreadsheet
 * @returns {number} Quantidade de produtos inseridos
 */
function inserirProdutosFicticios(ss) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  if (!sheet) throw new Error('Aba Produtos não encontrada');

  const produtos = [
    ['PROD-021', 'CAN-001', 'Caneta Azul', 'Papelaria', 'Escrita', 'UN', 2.50, 50, 100, 'Papelaria ABC', '', 'Sim', '01/01/2025'],
    ['PROD-022', 'CAD-001', 'Caderno', 'Papelaria', 'Escrita', 'UN', 12.50, 10, 20, 'Papelaria ABC', '', 'Sim', '01/01/2025'],
    ['PROD-023', 'DET-001', 'Detergente', 'Limpeza', 'Limpeza', 'UN', 4.50, 30, 50, 'Limpeza XYZ', '', 'Sim', '01/01/2025'],
    ['PROD-024', 'ALC-001', 'Álcool', 'Limpeza', 'Limpeza', 'UN', 8.90, 20, 40, 'Limpeza XYZ', '', 'Sim', '01/01/2025'],
    ['PROD-025', 'PAP-001', 'Papel A4', 'Papelaria', 'Papel', 'CX', 35.00, 20, 40, 'Papelaria ABC', '', 'Sim', '01/01/2025']
  ];

  // Verificar se produtos já existem
  const dados = sheet.getDataRange().getValues();
  const idsExistentes = dados.slice(1).map(row => row[0]); // Coluna A = ID

  let inseridos = 0;
  produtos.forEach(produto => {
    if (!idsExistentes.includes(produto[0])) {
      sheet.appendRow(produto);
      inseridos++;
    }
  });

  return inseridos;
}

/**
 * Insere registros de estoque fictícios
 * @param {SpreadsheetApp.Spreadsheet} ss - Spreadsheet
 * @param {string} userEmail - Email do usuário
 * @returns {number} Quantidade de registros inseridos
 */
function inserirEstoqueFicticio(ss, userEmail) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.STOCK);
  if (!sheet) throw new Error('Aba Estoque não encontrada');

  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy');

  const estoques = [
    ['EST-001', 'PROD-021', 'Caneta Azul', 150, 20, 130, dataFormatada, userEmail],
    ['EST-002', 'PROD-022', 'Caderno', 8, 0, 8, dataFormatada, userEmail],
    ['EST-003', 'PROD-023', 'Detergente', 45, 10, 35, dataFormatada, userEmail],
    ['EST-004', 'PROD-024', 'Álcool', 15, 5, 10, dataFormatada, userEmail],
    ['EST-005', 'PROD-025', 'Papel A4', 60, 15, 45, dataFormatada, userEmail]
  ];

  // Verificar se registros já existem
  const dados = sheet.getDataRange().getValues();
  const idsExistentes = dados.slice(1).map(row => row[0]); // Coluna A = ID

  let inseridos = 0;
  estoques.forEach(estoque => {
    if (!idsExistentes.includes(estoque[0])) {
      sheet.appendRow(estoque);
      inseridos++;
    }
  });

  return inseridos;
}

/**
 * Insere pedidos fictícios
 * @param {SpreadsheetApp.Spreadsheet} ss - Spreadsheet
 * @param {string} userEmail - Email do usuário
 * @returns {number} Quantidade de pedidos inseridos
 */
function inserirPedidosFicticios(ss, userEmail) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  if (!sheet) throw new Error('Aba Pedidos não encontrada');

  const pedidos = [
    ['PED-001', '2025-001', 'Papelaria', 'joao@neoformula.com', 'João Silva', 'TI', 'Caneta Azul; Caderno', '50; 10', 125.50, 'Finalizado', '01/10/2025', '02/10/2025', '05/10/2025', '10/10/2025', 'Entregue no prazo'],
    ['PED-002', '2025-002', 'Limpeza', 'maria@neoformula.com', 'Maria Santos', 'RH', 'Detergente; Álcool', '20; 15', 189.90, 'Finalizado', '03/10/2025', '04/10/2025', '08/10/2025', '12/10/2025', 'OK'],
    ['PED-003', '2025-003', 'Papelaria', 'pedro@neoformula.com', 'Pedro Costa', 'Vendas', 'Papel A4; Grampeador', '100; 5', 450.00, 'Em Compra', '10/10/2025', '11/10/2025', '', '20/10/2025', 'Aguardando fornecedor'],
    ['PED-004', '2025-004', 'Limpeza', 'ana@neoformula.com', 'Ana Oliveira', 'Produção', 'Sabão; Vassoura', '30; 8', 267.40, 'Solicitado', '15/10/2025', '', '', '25/10/2025', 'Pendente aprovação'],
    ['PED-005', '2025-005', 'Papelaria', 'carlos@neoformula.com', 'Carlos Lima', 'Financeiro', 'Calculadora; Régua', '3; 20', 189.70, 'Solicitado', '18/10/2025', '', '', '28/10/2025', 'Urgente'],
    ['PED-006', '2025-006', 'Limpeza', 'lucia@neoformula.com', 'Lúcia Ferreira', 'TI', 'Desinfetante; Pano', '25; 50', 345.80, 'Em Compra', '20/10/2025', '21/10/2025', '', '30/10/2025', 'Em processo'],
    ['PED-007', '2025-007', 'Papelaria', 'rafael@neoformula.com', 'Rafael Santos', 'RH', 'Pasta; Clips', '40; 100', 198.50, 'Finalizado', '22/10/2025', '23/10/2025', '26/10/2025', '01/11/2025', 'Entregue'],
    ['PED-008', '2025-008', 'Limpeza', 'julia@neoformula.com', 'Júlia Martins', 'Vendas', 'Luva; Saco Lixo', '60; 200', 412.30, 'Aguardando Entrega', '25/10/2025', '26/10/2025', '', '05/11/2025', 'Despachado'],
    ['PED-009', '2025-009', 'Papelaria', 'bruno@neoformula.com', 'Bruno Alves', 'Produção', 'Etiqueta; Fita', '150; 30', 523.90, 'Finalizado', '28/10/2025', '29/10/2025', '02/11/2025', '08/11/2025', 'OK'],
    ['PED-010', '2025-010', 'Limpeza', 'fernanda@neoformula.com', 'Fernanda Rocha', 'Financeiro', 'Esponja; Amaciante', '80; 40', 298.60, 'Em Compra', '30/10/2025', '31/10/2025', '', '10/11/2025', 'Processando'],
    ['PED-011', '2025-011', 'Papelaria', 'diego@neoformula.com', 'Diego Souza', 'TI', 'Mouse Pad; Teclado', '10; 2', 389.00, 'Cancelado', '01/11/2025', '', '', '', 'Cancelado por solicitante'],
    ['PED-012', '2025-012', 'Limpeza', 'patricia@neoformula.com', 'Patrícia Dias', 'RH', 'Sabonete; Papel Toalha', '100; 80', 456.20, 'Solicitado', '02/11/2025', '', '', '12/11/2025', 'Aguardando']
  ];

  // Verificar se pedidos já existem
  const dados = sheet.getDataRange().getValues();
  const idsExistentes = dados.slice(1).map(row => row[0]); // Coluna A = ID

  let inseridos = 0;
  pedidos.forEach(pedido => {
    if (!idsExistentes.includes(pedido[0])) {
      sheet.appendRow(pedido);
      inseridos++;
    }
  });

  return inseridos;
}

/**
 * Insere movimentações de estoque fictícias
 * @param {SpreadsheetApp.Spreadsheet} ss - Spreadsheet
 * @param {string} userEmail - Email do usuário
 * @returns {number} Quantidade de movimentações inseridas
 */
function inserirMovimentacoesFicticias(ss, userEmail) {
  const sheet = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
  if (!sheet) throw new Error('Aba Movimentações Estoque não encontrada');

  const movimentacoes = [
    ['MOV-001', '01/10/2025 10:00', 'ENTRADA', 'PROD-021', 'Caneta Azul', 200, 0, 200, userEmail, 'Entrada inicial', ''],
    ['MOV-002', '05/10/2025 14:30', 'SAIDA', 'PROD-021', 'Caneta Azul', 50, 200, 150, userEmail, 'Baixa pedido PED-001', 'PED-001'],
    ['MOV-003', '08/10/2025 11:00', 'SAIDA', 'PROD-023', 'Detergente', 20, 65, 45, userEmail, 'Baixa pedido PED-002', 'PED-002']
  ];

  // Verificar se movimentações já existem
  const dados = sheet.getDataRange().getValues();
  const idsExistentes = dados.slice(1).map(row => row[0]); // Coluna A = ID

  let inseridos = 0;
  movimentacoes.forEach(mov => {
    if (!idsExistentes.includes(mov[0])) {
      sheet.appendRow(mov);
      inseridos++;
    }
  });

  return inseridos;
}

/**
 * Limpa todos os dados fictícios inseridos
 * CUIDADO: Esta função remove APENAS os dados fictícios (IDs específicos)
 * @returns {Object} Status da operação
 */
function limparDadosFicticios() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Verificar se usuário é Admin
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.perfil !== CONFIG.PERFIS.ADMIN) {
      throw new Error('Apenas administradores podem limpar dados fictícios');
    }

    Logger.log('🗑️ Iniciando limpeza de dados fictícios...');

    let resultado = {
      sucesso: true,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0
    };

    // IDs fictícios a remover
    const idsPedidosFicticios = ['PED-001', 'PED-002', 'PED-003', 'PED-004', 'PED-005', 'PED-006', 'PED-007', 'PED-008', 'PED-009', 'PED-010', 'PED-011', 'PED-012'];
    const idsProdutosFicticios = ['PROD-021', 'PROD-022', 'PROD-023', 'PROD-024', 'PROD-025'];
    const idsEstoqueFicticios = ['EST-001', 'EST-002', 'EST-003', 'EST-004', 'EST-005'];
    const idsMovimentacoesFicticias = ['MOV-001', 'MOV-002', 'MOV-003'];

    // Remover Pedidos
    resultado.pedidos = removerLinhasPorIds(ss, CONFIG.ABAS.ORDERS, idsPedidosFicticios);

    // Remover Movimentações
    resultado.movimentacoes = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK_MOVEMENTS, idsMovimentacoesFicticias);

    // Remover Estoque
    resultado.estoque = removerLinhasPorIds(ss, CONFIG.ABAS.STOCK, idsEstoqueFicticios);

    // Remover Produtos
    resultado.produtos = removerLinhasPorIds(ss, CONFIG.ABAS.PRODUCTS, idsProdutosFicticios);

    Logger.log('✅ Dados fictícios removidos com sucesso!');
    return resultado;

  } catch (error) {
    Logger.log('❌ ERRO ao limpar dados fictícios: ' + error.message);
    return {
      sucesso: false,
      erro: error.message,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0
    };
  }
}

/**
 * Remove linhas de uma aba baseado em IDs específicos
 * @param {SpreadsheetApp.Spreadsheet} ss - Spreadsheet
 * @param {string} nomeAba - Nome da aba
 * @param {Array<string>} ids - Array de IDs a remover
 * @returns {number} Quantidade de linhas removidas
 */
function removerLinhasPorIds(ss, nomeAba, ids) {
  const sheet = ss.getSheetByName(nomeAba);
  if (!sheet) return 0;

  const dados = sheet.getDataRange().getValues();
  let removidos = 0;

  // Percorrer de trás para frente para evitar problemas com índices
  for (let i = dados.length - 1; i > 0; i--) { // i > 0 para não remover cabeçalho
    if (ids.includes(dados[i][0])) { // Coluna A = ID
      sheet.deleteRow(i + 1); // +1 porque sheets são 1-indexed
      removidos++;
    }
  }

  return removidos;
}
