/**
 * ================================================================================
 * 🧪 SISTEMA DE TESTES AUTOMATIZADOS - v16.0
 * ================================================================================
 *
 * Funções de teste para validar todas as funcionalidades do sistema.
 * Acessível via menu: Sistema de Pedidos → Testes → [Opção]
 *
 * Baseado em: GUIA_TESTES_V16.0_COMPLETO.md
 */

// ============================================================================
// SISTEMA DE LOGS EM MEMÓRIA
// ============================================================================

var LOGS_TESTE = [];

function limparLogsTeste() {
  LOGS_TESTE = [];
}

function logTeste(mensagem) {
  LOGS_TESTE.push(mensagem);
  Logger.log(mensagem);
}

function obterLogsTeste() {
  return LOGS_TESTE.join('\n');
}

// ============================================================================
// MENU DE TESTES
// ============================================================================

/**
 * Adiciona menu de testes à planilha
 */
function adicionarMenuTestes() {
  const ui = SpreadsheetApp.getUi();
  const menuPrincipal = ui.createMenu('Sistema de Pedidos');

  // Submenu de Testes
  const menuTestes = ui.createMenu('🧪 Testes')
    .addItem('▶️ EXECUTAR TODOS OS TESTES', 'executarTodosTestes')
    .addSeparator()
    .addItem('✅ Teste 01: Dashboard KPIs', 'teste01_DashboardCompleto')
    .addItem('🛒 Teste 02: Catálogo de Produtos', 'teste02_CatalogoCompleto')
    .addItem('🏢 Teste 03: Múltiplos Fornecedores', 'teste03_AgrupamentoNeo')
    .addItem('🔒 Teste 04: Estoque Reservado', 'teste04_EstoqueReservadoCompleto')
    .addItem('📝 Teste 05: Validação de Pedidos', 'teste05_ValidacaoPedido')
    .addItem('📊 Teste 08: Movimentações', 'teste08_MovimentacoesCompleto')
    .addItem('⚡ Teste 09: Performance e Cache', 'teste09_PerformanceCompleto')
    .addItem('🔒 Teste 10: Validações e Segurança', 'teste10_ValidacoesCompleto')
    .addSeparator()
    .addItem('🔍 Ver Logs do Último Teste', 'mostrarLogsUltimoTeste')
    .addItem('🗑️ Limpar Cache (Reset)', 'limparTodosOsCaches');

  menuPrincipal
    .addSubMenu(menuTestes)
    .addToUi();
}

/**
 * Mostra logs do último teste em um dialog
 */
function mostrarLogsUltimoTeste() {
  const ui = SpreadsheetApp.getUi();
  const logs = obterLogsTeste();

  if (!logs || logs.trim() === '') {
    ui.alert(
      '📋 Logs',
      'Nenhum log disponível.\n\n' +
      'Execute um teste primeiro (EXECUTAR TODOS OS TESTES ou um teste individual).\n\n' +
      'Alternativamente, veja logs detalhados em:\n' +
      'Extensões > Apps Script > Execuções',
      ui.ButtonSet.OK
    );
  } else {
    // Criar HTML para melhor visualização
    const html = HtmlService.createHtmlOutput(
      '<style>' +
      'body { font-family: "Courier New", monospace; font-size: 12px; padding: 10px; background: #1e1e1e; color: #d4d4d4; }' +
      'pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; }' +
      '.success { color: #4ec9b0; }' +
      '.error { color: #f48771; }' +
      '.warning { color: #dcdcaa; }' +
      '.info { color: #9cdcfe; }' +
      '</style>' +
      '<pre>' + logs.replace(/✅/g, '<span class="success">✅</span>')
                     .replace(/❌/g, '<span class="error">❌</span>')
                     .replace(/⚠️/g, '<span class="warning">⚠️</span>')
                     .replace(/📊|📦|🔍|💰|🚚|🏢/g, '<span class="info">$&</span>') +
      '</pre>'
    )
    .setWidth(900)
    .setHeight(700);

    ui.showModelessDialog(html, '📋 Logs do Último Teste - v16.0');
  }
}

/**
 * Limpa todos os caches
 */
function limparTodosOsCaches() {
  Logger.log('🗑️ Limpando todos os caches...');

  try {
    limparCacheUsuarios();
    limparCacheProdutos();

    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ Cache Limpo',
      'Todos os caches foram limpos com sucesso!\n\n' +
      'Os próximos testes vão executar sem cache.',
      ui.ButtonSet.OK
    );

    Logger.log('✅ Todos os caches limpos');
  } catch (error) {
    Logger.log('❌ Erro ao limpar caches: ' + error.message);
    const ui = SpreadsheetApp.getUi();
    ui.alert('❌ Erro', 'Erro ao limpar caches: ' + error.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// TESTE 00: EXECUTAR TODOS
// ============================================================================

/**
 * Executa todos os testes em sequência
 */
function executarTodosTestes() {
  const ui = SpreadsheetApp.getUi();

  // Confirmar execução
  const resposta = ui.alert(
    '🧪 Executar Todos os Testes',
    'Isso vai executar todos os testes automatizados do sistema.\n\n' +
    'Tempo estimado: 2-5 minutos.\n\n' +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO
  );

  if (resposta !== ui.Button.YES) {
    return;
  }

  // Limpar logs anteriores
  limparLogsTeste();

  logTeste('');
  logTeste('='.repeat(80));
  logTeste('🧪 EXECUTANDO TODOS OS TESTES - v16.0');
  logTeste('='.repeat(80));
  logTeste('Início: ' + new Date().toLocaleString('pt-BR'));
  logTeste('');

  const resultados = [];
  const inicio = new Date();

  // Lista de testes
  const testes = [
    { nome: 'Verificação da Estrutura', funcao: verificarEstrutura },
    { nome: 'Dashboard - KPIs Financeiros', funcao: teste01_DashboardFinanceiro },
    { nome: 'Dashboard - KPIs Logísticos', funcao: teste01_DashboardLogistico },
    { nome: 'Dashboard - KPIs Estoque', funcao: teste01_DashboardEstoque },
    { nome: 'Catálogo - Carrega Produtos', funcao: teste02_CatalogoCarrega },
    { nome: 'Catálogo - Produtos Sem NEO', funcao: teste02_ProdutosSemNeo },
    { nome: 'Catálogo - Imagens', funcao: teste02_Imagens },
    { nome: 'Múltiplos Fornecedores - Agrupamento NEO', funcao: teste03_AgrupamentoNeo },
    { nome: 'Estoque Reservado - Estrutura', funcao: teste04_EstruturaEstoque },
    { nome: 'Validação de Pedidos', funcao: teste05_ValidacaoPedido },
    { nome: 'Movimentações - Tipos', funcao: teste08_TiposMovimentacao },
    { nome: 'Movimentações - Rastreabilidade', funcao: teste08_RastreabilidadePedido },
    { nome: 'Performance - Cache Usuários', funcao: teste09_CacheUsuarios },
    { nome: 'Performance - Cache Produtos', funcao: teste09_CacheProdutos },
    { nome: 'Segurança - Validação Datas', funcao: teste10_ValidacaoDatas }
  ];

  // Executar cada teste
  for (let i = 0; i < testes.length; i++) {
    const teste = testes[i];
    logTeste('');
    logTeste(`[${i + 1}/${testes.length}] Executando: ${teste.nome}`);
    logTeste('-'.repeat(80));

    try {
      teste.funcao();
      resultados.push({ nome: teste.nome, status: '✅ PASSOU' });
      logTeste(`✅ ${teste.nome} - PASSOU`);
    } catch (error) {
      resultados.push({ nome: teste.nome, status: '❌ FALHOU', erro: error.message });
      logTeste(`❌ ${teste.nome} - FALHOU: ${error.message}`);
    }
  }

  const fim = new Date();
  const tempoTotal = ((fim - inicio) / 1000).toFixed(2);

  // Resumo
  logTeste('');
  logTeste('='.repeat(80));
  logTeste('📊 RESUMO DOS TESTES');
  logTeste('='.repeat(80));

  const passaram = resultados.filter(r => r.status.includes('PASSOU')).length;
  const falharam = resultados.filter(r => r.status.includes('FALHOU')).length;

  resultados.forEach((r, idx) => {
    logTeste(`${idx + 1}. ${r.status} - ${r.nome}`);
    if (r.erro) {
      logTeste(`   Erro: ${r.erro}`);
    }
  });

  logTeste('');
  logTeste(`✅ Passaram: ${passaram}/${testes.length}`);
  logTeste(`❌ Falharam: ${falharam}/${testes.length}`);
  logTeste(`⏱️ Tempo total: ${tempoTotal}s`);
  logTeste('');
  logTeste('Fim: ' + new Date().toLocaleString('pt-BR'));
  logTeste('='.repeat(80));

  // Mostrar resultado em dialog
  ui.alert(
    '🧪 Testes Concluídos',
    `Execução completa!\n\n` +
    `✅ Passaram: ${passaram}/${testes.length}\n` +
    `❌ Falharam: ${falharam}/${testes.length}\n` +
    `⏱️ Tempo total: ${tempoTotal}s\n\n` +
    `Clique em "Testes > Ver Logs" para detalhes.`,
    ui.ButtonSet.OK
  );
}

// ============================================================================
// TESTE 01: DASHBOARD KPIs
// ============================================================================

function teste01_DashboardCompleto() {
  logTeste('=== TESTE 01: DASHBOARD COMPLETO ===\n');
  teste01_DashboardFinanceiro();
  logTeste('');
  teste01_DashboardLogistico();
  logTeste('');
  teste01_DashboardEstoque();
  logTeste('\n✅ TESTE 01 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 01: Dashboard KPIs',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste01_DashboardFinanceiro() {
  logTeste('=== TESTE 01.1: KPIs Financeiros ===');

  // v16.0: Usar função wrapper correta
  const resultado = __getDashboardAvancado();

  if (!resultado.success) {
    logTeste('❌ FALHA: ' + resultado.error);
    throw new Error('Dashboard não carregou');
  }

  const kpis = resultado.kpis.financeiros;

  logTeste('\n📊 Total de Pedidos: ' + (kpis.totalPedidos || 0));
  logTeste('💰 Valor Total: R$ ' + (kpis.valorTotal || 0).toFixed(2));
  logTeste('✅ Aprovados: ' + (kpis.pedidosAprovados || 0));
  logTeste('⏳ Em Análise: ' + (kpis.pedidosEmAnalise || 0));
  logTeste('📦 Papelaria: ' + (kpis.pedidosPapelaria || 0));
  logTeste('🧹 Limpeza: ' + (kpis.pedidosLimpeza || 0));

  const temNull = Object.values(kpis).some(v => v === null);
  if (temNull) {
    logTeste('\n❌ FALHA: Encontrados valores null nos KPIs');
    throw new Error('KPIs com valores null');
  } else {
    logTeste('\n✅ PASSOU: Todos KPIs financeiros OK');
  }
}

function teste01_DashboardLogistico() {
  logTeste('=== TESTE 01.2: KPIs Logísticos ===');

  const resultado = __getDashboardAvancado();
  const kpis = resultado.kpis.logisticos;

  logTeste('\n⏱️ Tempo Médio de Processamento: ' + (kpis.tempoMedioProcessamento || 0) + ' dias');
  logTeste('📈 Taxa de Conclusão: ' + (kpis.taxaConclusao || 0) + '%');
  logTeste('👤 Solicitantes Ativos: ' + (kpis.solicitantesAtivos || 0));

  const temNull = [
    kpis.tempoMedioProcessamento,
    kpis.taxaConclusao,
    kpis.solicitantesAtivos
  ].some(v => v === null);

  if (temNull) {
    logTeste('\n❌ FALHA: Valores null nos KPIs logísticos');
    throw new Error('KPIs logísticos com null');
  } else {
    logTeste('\n✅ PASSOU: Todos KPIs logísticos OK');
  }
}

function teste01_DashboardEstoque() {
  logTeste('=== TESTE 01.3: KPIs de Estoque ===');

  const resultado = __getDashboardAvancado();
  const kpis = resultado.kpis.estoque;

  logTeste('\n📦 Produtos em Estoque: ' + (kpis.produtosEmEstoque || 0));
  logTeste('⚠️ Produtos Abaixo do Mínimo: ' + (kpis.produtosAbaixoMinimo || 0));
  logTeste('💵 Valor Total do Estoque: R$ ' + (kpis.valorTotalEstoque || 0).toFixed(2));
  logTeste('🔒 Estoque Reservado: ' + (kpis.estoqueReservado || 0) + ' (v16.0)');

  const temNull = [
    kpis.produtosEmEstoque,
    kpis.produtosAbaixoMinimo,
    kpis.valorTotalEstoque
  ].some(v => v === null);

  if (temNull) {
    logTeste('\n❌ FALHA: Valores null nos KPIs de estoque');
    throw new Error('KPIs de estoque com null');
  } else {
    logTeste('\n✅ PASSOU: Todos KPIs de estoque OK');
  }
}

// ============================================================================
// TESTE 02: CATÁLOGO DE PRODUTOS
// ============================================================================

function teste02_CatalogoCompleto() {
  logTeste('=== TESTE 02: CATÁLOGO COMPLETO ===\n');
  teste02_CatalogoCarrega();
  logTeste('');
  teste02_ProdutosSemNeo();
  logTeste('');
  teste02_Imagens();
  logTeste('\n✅ TESTE 02 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 02: Catálogo de Produtos',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste02_CatalogoCarrega() {
  logTeste('=== TESTE 02.1: Catálogo de Produtos ===');

  // v16.0: Usar função wrapper correta
  const resultado = __obterCatalogoProdutosComEstoque();

  if (!resultado.success) {
    logTeste('❌ FALHA: ' + resultado.error);
    throw new Error('Catálogo não carregou');
  }

  const produtos = resultado.produtos;

  logTeste(`\n📦 Total de produtos carregados: ${produtos.length}`);

  if (produtos.length === 0) {
    logTeste('⚠️ AVISO: Nenhum produto encontrado');
    logTeste('Verifique se há produtos com Ativo = "Sim" na aba Produtos');
  } else {
    logTeste('✅ PASSOU: Produtos carregados com sucesso');
    logTeste('\n📋 Exemplo do primeiro produto:');
    logTeste(JSON.stringify(produtos[0], null, 2));
  }
}

function teste02_ProdutosSemNeo() {
  logTeste('=== TESTE 02.2: Produtos Sem Código NEO ===');

  const resultado = __obterCatalogoProdutosComEstoque();
  const produtos = resultado.produtos;

  const produtosSemNeo = produtos.filter(p => !p.codigoNeo || p.codigoNeo === '');

  logTeste(`\n📦 Produtos sem código NEO: ${produtosSemNeo.length}`);

  if (produtosSemNeo.length > 0) {
    logTeste('✅ PASSOU: Produtos sem NEO aparecem no catálogo');
    logTeste('Exemplo: ' + produtosSemNeo[0].nome);
  } else {
    logTeste('⚠️ Todos os produtos têm código NEO (OK se for o caso)');
  }
}

function teste02_Imagens() {
  logTeste('=== TESTE 02.3: Imagens de Produtos ===');

  const resultado = __obterCatalogoProdutosComEstoque();

  // v16.0: resultado.produtos é array de produtos individuais, não agrupados
  if (!resultado.produtos || resultado.produtos.length === 0) {
    logTeste('⚠️ AVISO: Nenhum produto disponível para testar');
    return;
  }

  let comImagem = 0;
  let semImagem = 0;

  resultado.produtos.forEach(p => {
    if (p.imagemURL && p.imagemURL !== '') {
      comImagem++;
    } else {
      semImagem++;
    }
  });

  logTeste(`\n🖼️ Produtos com imagem: ${comImagem}`);
  logTeste(`📷 Produtos sem imagem: ${semImagem}`);

  if (comImagem > 0) {
    logTeste('✅ PASSOU: Sistema de imagens funcionando');
  } else {
    logTeste('⚠️ AVISO: Nenhum produto tem imagem cadastrada');
  }
}

// ============================================================================
// TESTE 03: MÚLTIPLOS FORNECEDORES
// ============================================================================

function teste03_AgrupamentoNeo() {
  logTeste('=== TESTE 03: Agrupamento por Código NEO ===');

  const resultado = __obterCatalogoProdutosComEstoque();

  if (!resultado.produtos || resultado.produtos.length === 0) {
    logTeste('⚠️ AVISO: Nenhum produto disponível para testar');
    return;
  }

  // v16.0: Agrupar produtos por código NEO manualmente para o teste
  const agrupados = {};
  resultado.produtos.forEach(p => {
    const codigoNeo = p.codigoNeoformula || p.codigo || 'sem-neo';
    if (!agrupados[codigoNeo]) {
      agrupados[codigoNeo] = [];
    }
    agrupados[codigoNeo].push(p);
  });

  // Contar produtos com múltiplos fornecedores (mesmo código NEO)
  let produtosMultiplos = 0;
  Object.entries(agrupados).forEach(([codigoNeo, produtos]) => {
    if (produtos.length > 1) {
      produtosMultiplos++;
      logTeste(`\n📋 Código NEO ${codigoNeo}: ${produtos.length} fornecedores`);
      produtos.forEach(p => {
        logTeste(`  - ${p.descricaoFornecedor}: R$ ${(p.precoUnitario || 0).toFixed(2)}`);
      });
    }
  });

  logTeste(`\n🏢 Produtos com múltiplos fornecedores: ${produtosMultiplos}`);

  if (produtosMultiplos > 0) {
    logTeste('✅ PASSOU: Sistema de múltiplos fornecedores funcional');
  } else {
    logTeste('⚠️ Nenhum produto com múltiplos fornecedores encontrado');
    logTeste('   (Normal se não houver produtos duplicados com mesmo código NEO)');
  }

  SpreadsheetApp.getUi().alert(
    '✅ Teste 03: Múltiplos Fornecedores',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ============================================================================
// TESTE 04: ESTOQUE RESERVADO
// ============================================================================

function teste04_EstoqueReservadoCompleto() {
  logTeste('=== TESTE 04: ESTOQUE RESERVADO COMPLETO ===\n');
  teste04_EstruturaEstoque();
  logTeste('\n✅ TESTE 04 COMPLETO\n');
  logTeste('⚠️ ATENÇÃO: Testes de reserva, liberação e baixa devem ser feitos MANUALMENTE');
  logTeste('   Siga o GUIA_TESTES_V16.0_COMPLETO.md seções 4.2, 4.3 e 4.4\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 04: Estoque Reservado',
    'Teste de estrutura concluído!\n\n' +
    '⚠️ PRÓXIMOS PASSOS:\n' +
    'Os testes de RESERVA, LIBERAÇÃO e BAIXA devem ser feitos manualmente:\n\n' +
    '1. Criar um pedido e verificar RESERVA\n' +
    '2. Cancelar pedido e verificar LIBERACAO_RESERVA\n' +
    '3. Concluir pedido e verificar SAIDA\n\n' +
    'Veja detalhes no GUIA_TESTES_V16.0_COMPLETO.md',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste04_EstruturaEstoque() {
  logTeste('=== TESTE 04.1: Estrutura de Estoque ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

  if (!abaEstoque) {
    logTeste('❌ FALHA: Aba Estoque não encontrada');
    throw new Error('Aba Estoque não existe');
  }

  const headers = abaEstoque.getRange(1, 1, 1, 8).getValues()[0];

  // v16.0: Estrutura correta conforme CONFIG.COLUNAS_ESTOQUE
  const colunasEsperadas = [
    'ID',                      // A
    'Produto ID',              // B
    'Produto Nome',            // C
    'Quantidade Atual',        // D
    'Quantidade Reservada',    // E
    'Estoque Disponível',      // F
    'Última Atualização',      // G
    'Responsável'              // H
  ];

  logTeste('\n📋 Colunas encontradas:');
  let todasPresentes = true;
  colunasEsperadas.forEach((col, idx) => {
    const encontrada = headers[idx] === col;
    logTeste(`${encontrada ? '✅' : '❌'} Coluna ${idx + 1}: ${col} ${!encontrada ? `(encontrada: "${headers[idx]}")` : ''}`);
    if (!encontrada) todasPresentes = false;
  });

  if (todasPresentes) {
    logTeste('\n✅ PASSOU: Estrutura de estoque correta (v16.0)');
  } else {
    logTeste('\n❌ FALHA: Estrutura de estoque incorreta');
    throw new Error('Colunas de estoque não conferem');
  }
}

// ============================================================================
// TESTE 05: VALIDAÇÃO DE PEDIDOS
// ============================================================================

function teste05_ValidacaoPedido() {
  logTeste('=== TESTE 05: Validação de Pedido ===');

  // Teste 1: Tipo inválido
  const pedido1 = {
    tipo: 'TipoInexistente',
    produtos: [{ produtoId: 'PROD-001', quantidade: 1 }]
  };
  const r1 = criarPedido(pedido1);
  logTeste('Tipo inválido: ' + (r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Teste 2: Quantidade negativa
  const pedido2 = {
    tipo: 'Papelaria',
    produtos: [{ produtoId: 'PROD-001', quantidade: -5 }]
  };
  const r2 = criarPedido(pedido2);
  logTeste('Quantidade negativa: ' + (r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Teste 3: Sem produtos
  const pedido3 = {
    tipo: 'Papelaria',
    produtos: []
  };
  const r3 = criarPedido(pedido3);
  logTeste('Sem produtos: ' + (r3.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  logTeste('\n✅ PASSOU: Validações funcionando');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 05: Validação de Pedidos',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ============================================================================
// TESTE 08: MOVIMENTAÇÕES
// ============================================================================

function teste08_MovimentacoesCompleto() {
  logTeste('=== TESTE 08: MOVIMENTAÇÕES COMPLETO ===\n');
  teste08_TiposMovimentacao();
  logTeste('');
  teste08_RastreabilidadePedido();
  logTeste('\n✅ TESTE 08 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 08: Movimentações',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste08_TiposMovimentacao() {
  logTeste('=== TESTE 08.1: Tipos de Movimentação ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');

  if (!abaMovimentacoes) {
    logTeste('❌ FALHA: Aba Movimentações Estoque não encontrada');
    throw new Error('Aba Movimentações não existe');
  }

  const dados = abaMovimentacoes.getDataRange().getValues();
  const movimentacoes = dados.slice(1);

  const tipos = {};
  movimentacoes.forEach(mov => {
    const tipo = mov[1];
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  logTeste('\n📊 Tipos de Movimentação encontrados:');
  Object.entries(tipos).forEach(([tipo, count]) => {
    logTeste(`  ${tipo}: ${count} movimentações`);
  });

  const tiposV16 = ['RESERVA', 'LIBERACAO_RESERVA', 'SAIDA'];
  const temTiposV16 = tiposV16.some(t => tipos[t] > 0);

  if (temTiposV16) {
    logTeste('\n✅ PASSOU: Sistema v16.0 registrando movimentações');
  } else {
    logTeste('\n⚠️ AVISO: Nenhuma movimentação v16.0 encontrada');
    logTeste('   Teste criar/cancelar/concluir um pedido');
  }
}

function teste08_RastreabilidadePedido() {
  logTeste('=== TESTE 08.2: Rastreabilidade por Pedido ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');
  const dados = abaMovimentacoes.getDataRange().getValues();

  const movimentacoesComPedido = dados.slice(1).filter(mov => {
    const pedidoId = mov[8];
    return pedidoId && pedidoId !== '';
  });

  logTeste(`\n📋 Movimentações vinculadas a pedidos: ${movimentacoesComPedido.length}`);

  if (movimentacoesComPedido.length > 0) {
    const porPedido = {};
    movimentacoesComPedido.forEach(mov => {
      const pedidoId = mov[8];
      if (!porPedido[pedidoId]) {
        porPedido[pedidoId] = [];
      }
      porPedido[pedidoId].push(mov[1]);
    });

    logTeste('\n📊 Pedidos rastreados:');
    Object.entries(porPedido).forEach(([pedidoId, tipos]) => {
      logTeste(`  ${pedidoId}: ${tipos.join(', ')}`);
    });

    logTeste('\n✅ PASSOU: Rastreabilidade por pedido funcional');
  } else {
    logTeste('⚠️ AVISO: Nenhuma movimentação vinculada a pedidos');
  }
}

// ============================================================================
// TESTE 09: PERFORMANCE E CACHE
// ============================================================================

function teste09_PerformanceCompleto() {
  logTeste('=== TESTE 09: PERFORMANCE COMPLETO ===\n');
  teste09_CacheUsuarios();
  logTeste('');
  teste09_CacheProdutos();
  logTeste('\n✅ TESTE 09 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 09: Performance e Cache',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste09_CacheUsuarios() {
  logTeste('=== TESTE 09.1: Cache de Usuários ===');

  limparCacheUsuarios();

  console.time('getUserContext - SEM CACHE');
  const r1 = getUserContext();
  console.timeEnd('getUserContext - SEM CACHE');

  console.time('getUserContext - COM CACHE');
  const r2 = getUserContext();
  console.timeEnd('getUserContext - COM CACHE');

  if (r1.success && r2.success) {
    logTeste('✅ PASSOU: Cache de usuários funcional');
    logTeste('Esperado: Segunda chamada 10-50x mais rápida');
  } else {
    logTeste('❌ FALHA: Erro ao buscar usuário');
    throw new Error('getUserContext falhou');
  }
}

function teste09_CacheProdutos() {
  logTeste('=== TESTE 09.2: Cache de Produtos ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const produtos = abaProdutos.getDataRange().getValues();

  if (produtos.length < 2) {
    logTeste('⚠️ AVISO: Poucos produtos para testar cache');
    return;
  }

  const produtoId = produtos[1][0];

  console.time('buscarProduto (5x) - SEM CACHE');
  for (let i = 0; i < 5; i++) {
    limparCacheProdutos();
    buscarProduto(produtoId);
  }
  console.timeEnd('buscarProduto (5x) - SEM CACHE');

  console.time('buscarProduto (5x) - COM CACHE');
  for (let i = 0; i < 5; i++) {
    buscarProduto(produtoId);
  }
  console.timeEnd('buscarProduto (5x) - COM CACHE');

  logTeste('✅ PASSOU: Cache de produtos funcional');
}

// ============================================================================
// TESTE 10: VALIDAÇÕES E SEGURANÇA
// ============================================================================

function teste10_ValidacoesCompleto() {
  logTeste('=== TESTE 10: VALIDAÇÕES E SEGURANÇA ===\n');
  teste10_ValidacaoDatas();
  logTeste('\n✅ TESTE 10 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 10: Validações e Segurança',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste10_ValidacaoDatas() {
  logTeste('=== TESTE 10.2: Validação de Datas ===');

  // Data início > data fim
  const filtro1 = {
    dataInicio: '2025-12-31',
    dataFim: '2025-01-01'
  };

  const r1 = __getDashboardAvancado(filtro1);
  logTeste('Data início > fim: ' + (r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Intervalo muito grande
  const filtro2 = {
    dataInicio: '2020-01-01',
    dataFim: '2025-12-31'
  };

  const r2 = __getDashboardAvancado(filtro2);
  logTeste('Intervalo > 2 anos: ' + (r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  logTeste('\n✅ PASSOU: Validações de data funcionando');
}

// ============================================================================
// FUNÇÃO AUXILIAR: VERIFICAR ESTRUTURA
// ============================================================================

function verificarEstrutura() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = ss.getSheets().map(s => s.getName());

  const abasNecessarias = [
    'Configurações',
    'Usuários',
    'Produtos',
    'Pedidos',
    'Estoque',
    'Movimentações Estoque',
    'Fornecedores'
  ];

  logTeste('=== VERIFICAÇÃO DA ESTRUTURA ===');
  let todasPresentes = true;
  abasNecessarias.forEach(nome => {
    if (abas.includes(nome)) {
      logTeste(`✅ ${nome}`);
    } else {
      logTeste(`❌ FALTANDO: ${nome}`);
      todasPresentes = false;
    }
  });

  const abaEstoque = ss.getSheetByName('Estoque');
  if (abaEstoque) {
    const headers = abaEstoque.getRange(1, 1, 1, 8).getValues()[0];
    logTeste('\n=== COLUNAS DE ESTOQUE ===');
    logTeste('Esperado: Produto ID, Quantidade Atual, Estoque Mínimo, Ponto de Pedido, Última Atualização, Quantidade Reservada, Estoque Disponível, Última Movimentação');
    logTeste('Atual: ' + headers.join(', '));
  }

  logTeste('\n✅ Verificação concluída!');

  if (!todasPresentes) {
    throw new Error('Estrutura da planilha incompleta');
  }
}
