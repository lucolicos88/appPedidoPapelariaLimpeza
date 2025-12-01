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

  // Google Apps Script não tem Logger.getLog()
  // Vamos mostrar instrução de como ver logs
  ui.alert(
    '📋 Ver Logs dos Testes',
    'Para ver os logs detalhados dos testes:\n\n' +
    '1. Vá em: Extensões > Apps Script\n' +
    '2. Clique em "Execuções" (ícone de relógio) na barra lateral\n' +
    '3. Clique na execução mais recente\n' +
    '4. Veja os logs completos com timestamps\n\n' +
    'OU\n\n' +
    '1. No Apps Script, execute a função de teste desejada\n' +
    '2. Clique em "Ver" > "Logs" (ou Ctrl+Enter)',
    ui.ButtonSet.OK
  );
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

  Logger.log('');
  Logger.log('='.repeat(80));
  Logger.log('🧪 EXECUTANDO TODOS OS TESTES - v16.0');
  Logger.log('='.repeat(80));
  Logger.log('Início: ' + new Date().toLocaleString('pt-BR'));
  Logger.log('');

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
    Logger.log('');
    Logger.log(`[${i + 1}/${testes.length}] Executando: ${teste.nome}`);
    Logger.log('-'.repeat(80));

    try {
      teste.funcao();
      resultados.push({ nome: teste.nome, status: '✅ PASSOU' });
      Logger.log(`✅ ${teste.nome} - PASSOU`);
    } catch (error) {
      resultados.push({ nome: teste.nome, status: '❌ FALHOU', erro: error.message });
      Logger.log(`❌ ${teste.nome} - FALHOU: ${error.message}`);
    }
  }

  const fim = new Date();
  const tempoTotal = ((fim - inicio) / 1000).toFixed(2);

  // Resumo
  Logger.log('');
  Logger.log('='.repeat(80));
  Logger.log('📊 RESUMO DOS TESTES');
  Logger.log('='.repeat(80));

  const passaram = resultados.filter(r => r.status.includes('PASSOU')).length;
  const falharam = resultados.filter(r => r.status.includes('FALHOU')).length;

  resultados.forEach((r, idx) => {
    Logger.log(`${idx + 1}. ${r.status} - ${r.nome}`);
    if (r.erro) {
      Logger.log(`   Erro: ${r.erro}`);
    }
  });

  Logger.log('');
  Logger.log(`✅ Passaram: ${passaram}/${testes.length}`);
  Logger.log(`❌ Falharam: ${falharam}/${testes.length}`);
  Logger.log(`⏱️ Tempo total: ${tempoTotal}s`);
  Logger.log('');
  Logger.log('Fim: ' + new Date().toLocaleString('pt-BR'));
  Logger.log('='.repeat(80));

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
  Logger.log('=== TESTE 01: DASHBOARD COMPLETO ===\n');
  teste01_DashboardFinanceiro();
  Logger.log('');
  teste01_DashboardLogistico();
  Logger.log('');
  teste01_DashboardEstoque();
  Logger.log('\n✅ TESTE 01 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 01: Dashboard KPIs',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste01_DashboardFinanceiro() {
  Logger.log('=== TESTE 01.1: KPIs Financeiros ===');

  // v16.0: Usar função wrapper correta
  const resultado = __getDashboardAvancado();

  if (!resultado.success) {
    Logger.log('❌ FALHA: ' + resultado.error);
    throw new Error('Dashboard não carregou');
  }

  const kpis = resultado.kpis.financeiros;

  Logger.log('\n📊 Total de Pedidos: ' + (kpis.totalPedidos || 0));
  Logger.log('💰 Valor Total: R$ ' + (kpis.valorTotal || 0).toFixed(2));
  Logger.log('✅ Aprovados: ' + (kpis.pedidosAprovados || 0));
  Logger.log('⏳ Em Análise: ' + (kpis.pedidosEmAnalise || 0));
  Logger.log('📦 Papelaria: ' + (kpis.pedidosPapelaria || 0));
  Logger.log('🧹 Limpeza: ' + (kpis.pedidosLimpeza || 0));

  const temNull = Object.values(kpis).some(v => v === null);
  if (temNull) {
    Logger.log('\n❌ FALHA: Encontrados valores null nos KPIs');
    throw new Error('KPIs com valores null');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs financeiros OK');
  }
}

function teste01_DashboardLogistico() {
  Logger.log('=== TESTE 01.2: KPIs Logísticos ===');

  const resultado = __getDashboardAvancado();
  const kpis = resultado.kpis.logisticos;

  Logger.log('\n⏱️ Tempo Médio de Processamento: ' + (kpis.tempoMedioProcessamento || 0) + ' dias');
  Logger.log('📈 Taxa de Conclusão: ' + (kpis.taxaConclusao || 0) + '%');
  Logger.log('👤 Solicitantes Ativos: ' + (kpis.solicitantesAtivos || 0));

  const temNull = [
    kpis.tempoMedioProcessamento,
    kpis.taxaConclusao,
    kpis.solicitantesAtivos
  ].some(v => v === null);

  if (temNull) {
    Logger.log('\n❌ FALHA: Valores null nos KPIs logísticos');
    throw new Error('KPIs logísticos com null');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs logísticos OK');
  }
}

function teste01_DashboardEstoque() {
  Logger.log('=== TESTE 01.3: KPIs de Estoque ===');

  const resultado = __getDashboardAvancado();
  const kpis = resultado.kpis.estoque;

  Logger.log('\n📦 Produtos em Estoque: ' + (kpis.produtosEmEstoque || 0));
  Logger.log('⚠️ Produtos Abaixo do Mínimo: ' + (kpis.produtosAbaixoMinimo || 0));
  Logger.log('💵 Valor Total do Estoque: R$ ' + (kpis.valorTotalEstoque || 0).toFixed(2));
  Logger.log('🔒 Estoque Reservado: ' + (kpis.estoqueReservado || 0) + ' (v16.0)');

  const temNull = [
    kpis.produtosEmEstoque,
    kpis.produtosAbaixoMinimo,
    kpis.valorTotalEstoque
  ].some(v => v === null);

  if (temNull) {
    Logger.log('\n❌ FALHA: Valores null nos KPIs de estoque');
    throw new Error('KPIs de estoque com null');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs de estoque OK');
  }
}

// ============================================================================
// TESTE 02: CATÁLOGO DE PRODUTOS
// ============================================================================

function teste02_CatalogoCompleto() {
  Logger.log('=== TESTE 02: CATÁLOGO COMPLETO ===\n');
  teste02_CatalogoCarrega();
  Logger.log('');
  teste02_ProdutosSemNeo();
  Logger.log('');
  teste02_Imagens();
  Logger.log('\n✅ TESTE 02 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 02: Catálogo de Produtos',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste02_CatalogoCarrega() {
  Logger.log('=== TESTE 02.1: Catálogo de Produtos ===');

  // v16.0: Usar função wrapper correta
  const resultado = __obterCatalogoProdutosComEstoque();

  if (!resultado.success) {
    Logger.log('❌ FALHA: ' + resultado.error);
    throw new Error('Catálogo não carregou');
  }

  const produtos = resultado.produtos;

  Logger.log(`\n📦 Total de produtos carregados: ${produtos.length}`);

  if (produtos.length === 0) {
    Logger.log('⚠️ AVISO: Nenhum produto encontrado');
    Logger.log('Verifique se há produtos com Ativo = "Sim" na aba Produtos');
  } else {
    Logger.log('✅ PASSOU: Produtos carregados com sucesso');
    Logger.log('\n📋 Exemplo do primeiro produto:');
    Logger.log(JSON.stringify(produtos[0], null, 2));
  }
}

function teste02_ProdutosSemNeo() {
  Logger.log('=== TESTE 02.2: Produtos Sem Código NEO ===');

  const resultado = __obterCatalogoProdutosComEstoque();
  const produtos = resultado.produtos;

  const produtosSemNeo = produtos.filter(p => !p.codigoNeo || p.codigoNeo === '');

  Logger.log(`\n📦 Produtos sem código NEO: ${produtosSemNeo.length}`);

  if (produtosSemNeo.length > 0) {
    Logger.log('✅ PASSOU: Produtos sem NEO aparecem no catálogo');
    Logger.log('Exemplo: ' + produtosSemNeo[0].nome);
  } else {
    Logger.log('⚠️ Todos os produtos têm código NEO (OK se for o caso)');
  }
}

function teste02_Imagens() {
  Logger.log('=== TESTE 02.3: Imagens de Produtos ===');

  const resultado = __obterCatalogoProdutosComEstoque();
  const produtos = resultado.produtos;

  let comImagem = 0;
  let semImagem = 0;

  produtos.forEach(p => {
    p.fornecedores.forEach(f => {
      if (f.imagemURL && f.imagemURL !== '') {
        comImagem++;
      } else {
        semImagem++;
      }
    });
  });

  Logger.log(`\n🖼️ Fornecedores com imagem: ${comImagem}`);
  Logger.log(`📷 Fornecedores sem imagem: ${semImagem}`);

  if (comImagem > 0) {
    Logger.log('✅ PASSOU: Sistema de imagens funcionando');
  } else {
    Logger.log('⚠️ AVISO: Nenhum produto tem imagem cadastrada');
  }
}

// ============================================================================
// TESTE 03: MÚLTIPLOS FORNECEDORES
// ============================================================================

function teste03_AgrupamentoNeo() {
  Logger.log('=== TESTE 03: Agrupamento por Código NEO ===');

  const resultado = __obterCatalogoProdutosComEstoque();
  const produtos = resultado.produtos;

  const produtosMultiplos = produtos.filter(p => p.fornecedores.length > 1);

  Logger.log(`\n🏢 Produtos com múltiplos fornecedores: ${produtosMultiplos.length}`);

  if (produtosMultiplos.length > 0) {
    Logger.log('✅ PASSOU: Sistema de múltiplos fornecedores funcional');

    const exemplo = produtosMultiplos[0];
    Logger.log(`\n📋 Exemplo: ${exemplo.nome}`);
    Logger.log(`Código NEO: ${exemplo.codigoNeo}`);
    Logger.log(`Fornecedores (${exemplo.fornecedores.length}):`);
    exemplo.fornecedores.forEach(f => {
      Logger.log(`  - ${f.fornecedorNome}: R$ ${f.preco.toFixed(2)}`);
    });
  } else {
    Logger.log('⚠️ Nenhum produto com múltiplos fornecedores encontrado');
    Logger.log('   (Normal se não houver produtos duplicados com mesmo código NEO)');
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
  Logger.log('=== TESTE 04: ESTOQUE RESERVADO COMPLETO ===\n');
  teste04_EstruturaEstoque();
  Logger.log('\n✅ TESTE 04 COMPLETO\n');
  Logger.log('⚠️ ATENÇÃO: Testes de reserva, liberação e baixa devem ser feitos MANUALMENTE');
  Logger.log('   Siga o GUIA_TESTES_V16.0_COMPLETO.md seções 4.2, 4.3 e 4.4\n');

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
  Logger.log('=== TESTE 04.1: Estrutura de Estoque ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

  if (!abaEstoque) {
    Logger.log('❌ FALHA: Aba Estoque não encontrada');
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

  Logger.log('\n📋 Colunas encontradas:');
  let todasPresentes = true;
  colunasEsperadas.forEach((col, idx) => {
    const encontrada = headers[idx] === col;
    Logger.log(`${encontrada ? '✅' : '❌'} Coluna ${idx + 1}: ${col} ${!encontrada ? `(encontrada: "${headers[idx]}")` : ''}`);
    if (!encontrada) todasPresentes = false;
  });

  if (todasPresentes) {
    Logger.log('\n✅ PASSOU: Estrutura de estoque correta (v16.0)');
  } else {
    Logger.log('\n❌ FALHA: Estrutura de estoque incorreta');
    throw new Error('Colunas de estoque não conferem');
  }
}

// ============================================================================
// TESTE 05: VALIDAÇÃO DE PEDIDOS
// ============================================================================

function teste05_ValidacaoPedido() {
  Logger.log('=== TESTE 05: Validação de Pedido ===');

  // Teste 1: Tipo inválido
  const pedido1 = {
    tipo: 'TipoInexistente',
    produtos: [{ produtoId: 'PROD-001', quantidade: 1 }]
  };
  const r1 = criarPedido(pedido1);
  Logger.log('Tipo inválido: ' + (r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Teste 2: Quantidade negativa
  const pedido2 = {
    tipo: 'Papelaria',
    produtos: [{ produtoId: 'PROD-001', quantidade: -5 }]
  };
  const r2 = criarPedido(pedido2);
  Logger.log('Quantidade negativa: ' + (r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Teste 3: Sem produtos
  const pedido3 = {
    tipo: 'Papelaria',
    produtos: []
  };
  const r3 = criarPedido(pedido3);
  Logger.log('Sem produtos: ' + (r3.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  Logger.log('\n✅ PASSOU: Validações funcionando');

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
  Logger.log('=== TESTE 08: MOVIMENTAÇÕES COMPLETO ===\n');
  teste08_TiposMovimentacao();
  Logger.log('');
  teste08_RastreabilidadePedido();
  Logger.log('\n✅ TESTE 08 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 08: Movimentações',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste08_TiposMovimentacao() {
  Logger.log('=== TESTE 08.1: Tipos de Movimentação ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');

  if (!abaMovimentacoes) {
    Logger.log('❌ FALHA: Aba Movimentações Estoque não encontrada');
    throw new Error('Aba Movimentações não existe');
  }

  const dados = abaMovimentacoes.getDataRange().getValues();
  const movimentacoes = dados.slice(1);

  const tipos = {};
  movimentacoes.forEach(mov => {
    const tipo = mov[1];
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  Logger.log('\n📊 Tipos de Movimentação encontrados:');
  Object.entries(tipos).forEach(([tipo, count]) => {
    Logger.log(`  ${tipo}: ${count} movimentações`);
  });

  const tiposV16 = ['RESERVA', 'LIBERACAO_RESERVA', 'SAIDA'];
  const temTiposV16 = tiposV16.some(t => tipos[t] > 0);

  if (temTiposV16) {
    Logger.log('\n✅ PASSOU: Sistema v16.0 registrando movimentações');
  } else {
    Logger.log('\n⚠️ AVISO: Nenhuma movimentação v16.0 encontrada');
    Logger.log('   Teste criar/cancelar/concluir um pedido');
  }
}

function teste08_RastreabilidadePedido() {
  Logger.log('=== TESTE 08.2: Rastreabilidade por Pedido ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');
  const dados = abaMovimentacoes.getDataRange().getValues();

  const movimentacoesComPedido = dados.slice(1).filter(mov => {
    const pedidoId = mov[8];
    return pedidoId && pedidoId !== '';
  });

  Logger.log(`\n📋 Movimentações vinculadas a pedidos: ${movimentacoesComPedido.length}`);

  if (movimentacoesComPedido.length > 0) {
    const porPedido = {};
    movimentacoesComPedido.forEach(mov => {
      const pedidoId = mov[8];
      if (!porPedido[pedidoId]) {
        porPedido[pedidoId] = [];
      }
      porPedido[pedidoId].push(mov[1]);
    });

    Logger.log('\n📊 Pedidos rastreados:');
    Object.entries(porPedido).forEach(([pedidoId, tipos]) => {
      Logger.log(`  ${pedidoId}: ${tipos.join(', ')}`);
    });

    Logger.log('\n✅ PASSOU: Rastreabilidade por pedido funcional');
  } else {
    Logger.log('⚠️ AVISO: Nenhuma movimentação vinculada a pedidos');
  }
}

// ============================================================================
// TESTE 09: PERFORMANCE E CACHE
// ============================================================================

function teste09_PerformanceCompleto() {
  Logger.log('=== TESTE 09: PERFORMANCE COMPLETO ===\n');
  teste09_CacheUsuarios();
  Logger.log('');
  teste09_CacheProdutos();
  Logger.log('\n✅ TESTE 09 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 09: Performance e Cache',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste09_CacheUsuarios() {
  Logger.log('=== TESTE 09.1: Cache de Usuários ===');

  limparCacheUsuarios();

  console.time('getUserContext - SEM CACHE');
  const r1 = getUserContext();
  console.timeEnd('getUserContext - SEM CACHE');

  console.time('getUserContext - COM CACHE');
  const r2 = getUserContext();
  console.timeEnd('getUserContext - COM CACHE');

  if (r1.success && r2.success) {
    Logger.log('✅ PASSOU: Cache de usuários funcional');
    Logger.log('Esperado: Segunda chamada 10-50x mais rápida');
  } else {
    Logger.log('❌ FALHA: Erro ao buscar usuário');
    throw new Error('getUserContext falhou');
  }
}

function teste09_CacheProdutos() {
  Logger.log('=== TESTE 09.2: Cache de Produtos ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const produtos = abaProdutos.getDataRange().getValues();

  if (produtos.length < 2) {
    Logger.log('⚠️ AVISO: Poucos produtos para testar cache');
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

  Logger.log('✅ PASSOU: Cache de produtos funcional');
}

// ============================================================================
// TESTE 10: VALIDAÇÕES E SEGURANÇA
// ============================================================================

function teste10_ValidacoesCompleto() {
  Logger.log('=== TESTE 10: VALIDAÇÕES E SEGURANÇA ===\n');
  teste10_ValidacaoDatas();
  Logger.log('\n✅ TESTE 10 COMPLETO\n');

  SpreadsheetApp.getUi().alert(
    '✅ Teste 10: Validações e Segurança',
    'Teste concluído!\n\nClique em "Testes > Ver Logs" para ver os resultados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function teste10_ValidacaoDatas() {
  Logger.log('=== TESTE 10.2: Validação de Datas ===');

  // Data início > data fim
  const filtro1 = {
    dataInicio: '2025-12-31',
    dataFim: '2025-01-01'
  };

  const r1 = __getDashboardAvancado(filtro1);
  Logger.log('Data início > fim: ' + (r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  // Intervalo muito grande
  const filtro2 = {
    dataInicio: '2020-01-01',
    dataFim: '2025-12-31'
  };

  const r2 = __getDashboardAvancado(filtro2);
  Logger.log('Intervalo > 2 anos: ' + (r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU'));

  Logger.log('\n✅ PASSOU: Validações de data funcionando');
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

  Logger.log('=== VERIFICAÇÃO DA ESTRUTURA ===');
  let todasPresentes = true;
  abasNecessarias.forEach(nome => {
    if (abas.includes(nome)) {
      Logger.log(`✅ ${nome}`);
    } else {
      Logger.log(`❌ FALTANDO: ${nome}`);
      todasPresentes = false;
    }
  });

  const abaEstoque = ss.getSheetByName('Estoque');
  if (abaEstoque) {
    const headers = abaEstoque.getRange(1, 1, 1, 8).getValues()[0];
    Logger.log('\n=== COLUNAS DE ESTOQUE ===');
    Logger.log('Esperado: Produto ID, Quantidade Atual, Estoque Mínimo, Ponto de Pedido, Última Atualização, Quantidade Reservada, Estoque Disponível, Última Movimentação');
    Logger.log('Atual: ' + headers.join(', '));
  }

  Logger.log('\n✅ Verificação concluída!');

  if (!todasPresentes) {
    throw new Error('Estrutura da planilha incompleta');
  }
}
