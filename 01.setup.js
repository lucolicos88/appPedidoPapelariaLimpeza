/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Setup e Configuração Principal
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Logo Neoformula integrado
 * - Sem tela de login (acesso direto)
 * - Upload de imagens de produtos
 * - Dashboard avançado com filtros
 * - Gerenciamento completo de estoque
 * - Tempos de entrega configuráveis
 * - Correção de bugs de usuários
 */

// Configurações globais do sistema
const CONFIG = {
  // Versão
  VERSAO: '6.0',
  
  // Nomes das abas
  ABAS: {
    CONFIG: 'Configurações',
    USERS: 'Usuários',
    PRODUCTS: 'Produtos',
    ORDERS: 'Pedidos',
    STOCK: 'Estoque',
    STOCK_MOVEMENTS: 'Movimentações Estoque',
    LOGS: 'Registros',
    KPIS: 'Indicadores'
  },
  
  // Níveis de permissão
  PERMISSOES: {
    ADMIN: 'ADMIN',
    GESTOR: 'GESTOR',
    USUARIO: 'USUARIO',
    VISUALIZADOR: 'VISUALIZADOR'
  },
  
  // Status de pedidos
  STATUS_PEDIDO: {
    SOLICITADO: 'Solicitado',
    EM_COMPRA: 'Em Compra',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado'
  },
  
  // Tipos de produtos
  TIPOS_PRODUTO: {
    PAPELARIA: 'Papelaria',
    LIMPEZA: 'Limpeza'
  },
  
  // Cores padrão Neoformula
  CORES: {
    PRIMARY: '#00A651',
    PRIMARY_DARK: '#008542',
    SECONDARY: '#2C3E50',
    ACCENT: '#FF6B35',
    SUCCESS: '#4CAF50',
    WARNING: '#FFC107',
    DANGER: '#F44336',
    INFO: '#2196F3'
  },
  
  // Logo Neoformula
  LOGO_URL: 'https://neoformula.com.br/cdn/shop/files/Logotipo-NeoFormula-Manipulacao-Homeopatia_76b2fa98-5ffa-4cc3-ac0a-6d41e1bc8810.png?height=100&v=1677088468'
};

/**
 * Configuração inicial da planilha v6.0
 */
function setupPlanilha() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    Logger.log('🚀 Iniciando configuração da planilha v6.0...');
    
    // 1. Criar aba de Configurações
    criarAbaConfiguracoes(ss);
    Logger.log('✅ Aba Configurações criada');
    
    // 2. Criar aba de Usuários
    criarAbaUsuarios(ss);
    Logger.log('✅ Aba Usuários criada');
    
    // 3. Criar aba de Produtos
    criarAbaProdutos(ss);
    Logger.log('✅ Aba Produtos criada');
    
    // 4. Criar aba de Pedidos
    criarAbaPedidos(ss);
    Logger.log('✅ Aba Pedidos criada');
    
    // 5. Criar aba de Estoque
    criarAbaEstoque(ss);
    Logger.log('✅ Aba Estoque criada');
    
    // 6. Criar aba de Movimentações de Estoque (NOVO v6.0)
    criarAbaMovimentacoesEstoque(ss);
    Logger.log('✅ Aba Movimentações Estoque criada');
    
    // 7. Criar aba de Registros
    criarAbaRegistros(ss);
    Logger.log('✅ Aba Registros criada');
    
    // 8. Criar aba de Indicadores
    criarAbaIndicadores(ss);
    Logger.log('✅ Aba Indicadores criada');
    
    // 9. Criar estrutura de pastas no Drive
    criarEstruturaPastas();
    Logger.log('✅ Estrutura de pastas criada');
    
    // 10. Popular com dados de teste
    popularDadosTeste(ss);
    Logger.log('✅ Dados de teste adicionados');
    
    // 11. Aplicar formatação
    aplicarFormatacao(ss);
    Logger.log('✅ Formatação aplicada');
    
    Logger.log('');
    Logger.log('🎉 CONFIGURAÇÃO v6.0 CONCLUÍDA COM SUCESSO!');
    Logger.log('📊 Sistema Neoformula pronto para uso');
    Logger.log('');
    Logger.log('⚠️ PRÓXIMOS PASSOS:');
    Logger.log('1. Configure o ID da pasta do Google Drive em Configurações');
    Logger.log('2. Ajuste o email do gestor para notificações');
    Logger.log('3. Configure os tempos de entrega por tipo');
    Logger.log('4. Implante como Web App');
    Logger.log('');
    
    SpreadsheetApp.getUi().alert(
      '✅ Sistema v6.0 Configurado!',
      'A planilha foi configurada com sucesso.\n\n' +
      'Próximos passos:\n' +
      '1. Vá em Configurações e preencha o ID da pasta do Drive\n' +
      '2. Configure o email do gestor\n' +
      '3. Implante como Web App (Extensões > Apps Script > Implantar)',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return {
      success: true,
      message: 'Planilha v6.0 configurada com sucesso!'
    };
    
  } catch (error) {
    Logger.log('❌ Erro na configuração: ' + error.message);
    Logger.log(error.stack);
    
    SpreadsheetApp.getUi().alert(
      '❌ Erro na Configuração',
      'Erro: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cria aba de Configurações v6.0
 */
function criarAbaConfiguracoes(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.CONFIG);
  
  if (aba) {
    Logger.log('⚠️ Aba Configurações já existe, atualizando...');
  } else {
    aba = ss.insertSheet(CONFIG.ABAS.CONFIG);
  }
  
  // Limpar conteúdo
  aba.clear();
  
  // Cabeçalhos
  const headers = ['Chave', 'Valor', 'Descrição', 'Última Atualização'];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Dados padrão v6.0
  const dados = [
    ['VERSAO', '6.0', 'Versão do sistema', new Date()],
    ['NOME_SISTEMA', 'Sistema de Controle de Pedidos Neoformula', 'Nome do sistema', new Date()],
    ['EMAIL_GESTOR', 'gestor@neoformula.com.br', 'Email do gestor para notificações', new Date()],
    ['PASTA_IMAGENS_ID', '', 'ID da pasta do Google Drive para imagens dos produtos (IMPORTANTE: PREENCHER)', new Date()],
    ['APROVAR_PEDIDOS', 'Não', 'Requer aprovação de pedidos (Sim/Não)', new Date()],
    ['LIMITE_PEDIDO_MENSAL', 10000, 'Limite de valor mensal por usuário (R$)', new Date()],
    ['ALERTA_ESTOQUE_BAIXO', 'Sim', 'Enviar alerta de estoque baixo (Sim/Não)', new Date()],
    ['TEMPO_ENTREGA_PAPELARIA', 5, 'Tempo de entrega para Papelaria (dias úteis)', new Date()],
    ['TEMPO_ENTREGA_LIMPEZA', 7, 'Tempo de entrega para Limpeza (dias úteis)', new Date()],
    ['COR_PRIMARY', '#00A651', 'Cor primária do sistema (verde Neoformula)', new Date()],
    ['COR_SECONDARY', '#2C3E50', 'Cor secundária do sistema', new Date()],
    ['COR_ACCENT', '#FF6B35', 'Cor de destaque', new Date()],
    ['LOGO_URL', CONFIG.LOGO_URL, 'URL do logo Neoformula', new Date()]
  ];
  
  aba.getRange(2, 1, dados.length, dados[0].length).setValues(dados);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // Destacar linha da pasta (IMPORTANTE)
  aba.getRange(5, 1, 1, 4)
    .setBackground('#FFF3E0')
    .setFontWeight('bold');
  
  // Ajustar largura das colunas
  aba.setColumnWidth(1, 250);
  aba.setColumnWidth(2, 400);
  aba.setColumnWidth(3, 350);
  aba.setColumnWidth(4, 180);
}

/**
 * Cria aba de Usuários
 */
function criarAbaUsuarios(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.USERS);
  
  if (aba) {
    Logger.log('⚠️ Aba Usuários já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.USERS);
  
  // Cabeçalhos
  const headers = ['Email', 'Nome', 'Setor', 'Permissão', 'Ativo', 'Data Cadastro'];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Criar primeiro usuário (admin)
  const email = Session.getActiveUser().getEmail();
  const nome = email.split('@')[0];
  
  const primeiroUsuario = [
    [email, nome, 'Administração', CONFIG.PERMISSOES.ADMIN, 'Sim', new Date()]
  ];
  
  aba.getRange(2, 1, 1, headers.length).setValues(primeiroUsuario);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Produtos (v6.0 - com campo de imagem)
 */
function criarAbaProdutos(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  
  if (aba) {
    Logger.log('⚠️ Aba Produtos já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.PRODUCTS);
  
  // Cabeçalhos
  const headers = [
    'ID', 'Código', 'Nome', 'Tipo', 'Categoria', 'Unidade',
    'Preço Unitário', 'Estoque Mínimo', 'Ponto de Pedido', 'Fornecedor', 
    'ImagemURL', 'Ativo', 'Data Cadastro'
  ];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Pedidos
 */
function criarAbaPedidos(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  
  if (aba) {
    Logger.log('⚠️ Aba Pedidos já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.ORDERS);
  
  // Cabeçalhos
  const headers = [
    'ID', 'Número Pedido', 'Tipo', 'Solicitante Email', 'Solicitante Nome', 'Setor',
    'Produtos', 'Quantidades', 'Valor Total', 'Status',
    'Data Solicitação', 'Data Compra', 'Data Finalização', 'Prazo Entrega', 'Observações'
  ];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Estoque
 */
function criarAbaEstoque(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.STOCK);
  
  if (aba) {
    Logger.log('⚠️ Aba Estoque já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.STOCK);
  
  // Cabeçalhos
  const headers = [
    'ID', 'Produto ID', 'Produto Nome', 'Quantidade Atual',
    'Quantidade Reservada', 'Estoque Disponível', 'Última Atualização', 'Responsável'
  ];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Movimentações de Estoque (NOVO v6.0)
 */
function criarAbaMovimentacoesEstoque(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
  
  if (aba) {
    Logger.log('⚠️ Aba Movimentações já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.STOCK_MOVEMENTS);
  
  // Cabeçalhos
  const headers = [
    'ID', 'Data/Hora', 'Tipo Movimentação', 'Produto ID', 'Produto Nome',
    'Quantidade', 'Estoque Anterior', 'Estoque Atual', 'Responsável', 'Observações'
  ];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Registros (Logs)
 */
function criarAbaRegistros(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.LOGS);
  
  if (aba) {
    Logger.log('⚠️ Aba Registros já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.LOGS);
  
  // Cabeçalhos
  const headers = ['ID', 'Data/Hora', 'Usuário', 'Ação', 'Detalhes', 'Status'];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria aba de Indicadores (KPIs)
 */
function criarAbaIndicadores(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.KPIS);
  
  if (aba) {
    Logger.log('⚠️ Aba Indicadores já existe, mantendo dados...');
    return;
  }
  
  aba = ss.insertSheet(CONFIG.ABAS.KPIS);
  
  // Cabeçalhos
  const headers = ['Métrica', 'Valor', 'Data'];
  aba.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, headers.length)
    .setBackground(CONFIG.CORES.PRIMARY)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  aba.autoResizeColumns(1, headers.length);
}

/**
 * Cria estrutura de pastas no Google Drive
 */
function criarEstruturaPastas() {
  try {
    const config = obterConfiguracao('PASTA_IMAGENS_ID');
    
    if (!config || config === '') {
      Logger.log('⚠️ ID da pasta não configurado. Configure em Configurações.');
      return false;
    }
    
    const pastaPrincipal = DriveApp.getFolderById(config);
    
    // Criar subpasta Papelaria
    const folders1 = pastaPrincipal.getFoldersByName('Papelaria');
    if (!folders1.hasNext()) {
      pastaPrincipal.createFolder('Papelaria');
      Logger.log('📁 Pasta Papelaria criada');
    }
    
    // Criar subpasta Limpeza
    const folders2 = pastaPrincipal.getFoldersByName('Limpeza');
    if (!folders2.hasNext()) {
      pastaPrincipal.createFolder('Limpeza');
      Logger.log('📁 Pasta Limpeza criada');
    }
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Erro ao criar pastas: ' + error.message);
    Logger.log('💡 Configure o ID da pasta em Configurações > PASTA_IMAGENS_ID');
    return false;
  }
}

/**
 * Popular planilha com dados de teste (v6.0)
 */
function popularDadosTeste(ss) {
  Logger.log('📝 Adicionando dados de teste v6.0...');
  
  // Produtos de teste
  const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const produtosTeste = [
    // Papelaria
    [Utilities.getUuid(), 'PAP-001', 'Caneta Azul Bic', 'Papelaria', 'Canetas', 'UN', 1.50, 50, 60, 'Fornecedor ABC', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-002', 'Caderno Espiral 96 Folhas', 'Papelaria', 'Cadernos', 'UN', 12.90, 30, 40, 'Fornecedor ABC', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-003', 'Lápis Preto HB', 'Papelaria', 'Lápis', 'UN', 0.80, 100, 120, 'Fornecedor XYZ', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-004', 'Borracha Branca', 'Papelaria', 'Borrachas', 'UN', 1.20, 80, 90, 'Fornecedor XYZ', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-005', 'Papel Sulfite A4 500 Folhas', 'Papelaria', 'Papéis', 'RESMA', 22.50, 20, 30, 'Fornecedor ABC', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-006', 'Tesoura Escolar', 'Papelaria', 'Tesouras', 'UN', 8.90, 15, 20, 'Fornecedor DEF', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-007', 'Cola Bastão 20g', 'Papelaria', 'Colas', 'UN', 3.50, 40, 50, 'Fornecedor DEF', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-008', 'Grampeador Grande', 'Papelaria', 'Grampeadores', 'UN', 35.00, 10, 15, 'Fornecedor GHI', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-009', 'Marca Texto Amarelo', 'Papelaria', 'Canetas', 'UN', 4.50, 60, 70, 'Fornecedor ABC', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'PAP-010', 'Pasta Catálogo 50 Folhas', 'Papelaria', 'Pastas', 'UN', 18.90, 25, 35, 'Fornecedor DEF', '', 'Sim', new Date()],
    
    // Limpeza
    [Utilities.getUuid(), 'LMP-001', 'Detergente Neutro 500ml', 'Limpeza', 'Detergentes', 'UN', 2.90, 50, 60, 'Fornecedor LIM', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-002', 'Sabão em Pó 1kg', 'Limpeza', 'Sabões', 'UN', 8.50, 30, 40, 'Fornecedor LIM', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-003', 'Álcool 70% 1L', 'Limpeza', 'Álcool', 'UN', 12.90, 40, 50, 'Fornecedor HIG', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-004', 'Desinfetante 2L', 'Limpeza', 'Desinfetantes', 'UN', 7.80, 35, 45, 'Fornecedor LIM', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-005', 'Papel Toalha 2 Rolos', 'Limpeza', 'Papel Toalha', 'PCT', 6.50, 25, 35, 'Fornecedor HIG', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-006', 'Saco de Lixo 100L', 'Limpeza', 'Sacos de Lixo', 'PCT', 18.90, 20, 30, 'Fornecedor HIG', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-007', 'Esponja Dupla Face', 'Limpeza', 'Esponjas', 'UN', 1.50, 60, 70, 'Fornecedor LIM', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-008', 'Pano de Chão', 'Limpeza', 'Panos', 'UN', 4.90, 30, 40, 'Fornecedor HIG', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-009', 'Luva de Borracha Par', 'Limpeza', 'Luvas', 'PAR', 8.90, 20, 25, 'Fornecedor HIG', '', 'Sim', new Date()],
    [Utilities.getUuid(), 'LMP-010', 'Vassoura de Pelo', 'Limpeza', 'Vassouras', 'UN', 15.90, 15, 20, 'Fornecedor LIM', '', 'Sim', new Date()]
  ];
  
  abaProdutos.getRange(2, 1, produtosTeste.length, 13).setValues(produtosTeste);
  
  // Criar registros de estoque
  const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
  const email = Session.getActiveUser().getEmail();
  const estoquesTeste = produtosTeste.map(produto => {
    const qtdAtual = Math.floor(Math.random() * 100) + 50;
    const qtdReservada = Math.floor(Math.random() * 10);
    const qtdDisponivel = qtdAtual - qtdReservada;
    
    return [
      Utilities.getUuid(),
      produto[0], // Produto ID
      produto[2], // Nome do produto
      qtdAtual,
      qtdReservada,
      qtdDisponivel,
      new Date(),
      email
    ];
  });
  
  abaEstoque.getRange(2, 1, estoquesTeste.length, 8).setValues(estoquesTeste);
  
  // Pedidos de teste
  const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  const nome = email.split('@')[0];
  
  const dataBase = new Date();
  dataBase.setDate(dataBase.getDate() - 30);
  
  const pedidosTeste = [
    [
      Utilities.getUuid(),
      'PED20250101-001',
      'Papelaria',
      email,
      nome,
      'Administração',
      'Caneta Azul Bic; Caderno Espiral 96 Folhas',
      '10; 5',
      79.50,
      'Finalizado',
      new Date(dataBase.getTime() + 1*24*60*60*1000),
      new Date(dataBase.getTime() + 2*24*60*60*1000),
      new Date(dataBase.getTime() + 7*24*60*60*1000),
      '5 dias úteis',
      'Pedido para reposição de estoque'
    ],
    [
      Utilities.getUuid(),
      'PED20250105-001',
      'Limpeza',
      email,
      nome,
      'Administração',
      'Detergente Neutro 500ml; Álcool 70% 1L; Saco de Lixo 100L',
      '20; 10; 5',
      252.50,
      'Finalizado',
      new Date(dataBase.getTime() + 5*24*60*60*1000),
      new Date(dataBase.getTime() + 6*24*60*60*1000),
      new Date(dataBase.getTime() + 13*24*60*60*1000),
      '7 dias úteis',
      'Material de limpeza mensal'
    ],
    [
      Utilities.getUuid(),
      'PED20250110-001',
      'Papelaria',
      email,
      nome,
      'Administração',
      'Papel Sulfite A4 500 Folhas; Grampeador Grande',
      '10; 2',
      295.00,
      'Em Compra',
      new Date(dataBase.getTime() + 10*24*60*60*1000),
      new Date(dataBase.getTime() + 11*24*60*60*1000),
      '',
      '5 dias úteis',
      'Urgente para final de trimestre'
    ],
    [
      Utilities.getUuid(),
      'PED20250115-001',
      'Limpeza',
      email,
      nome,
      'Administração',
      'Papel Toalha 2 Rolos; Esponja Dupla Face',
      '20; 30',
      175.00,
      'Solicitado',
      new Date(dataBase.getTime() + 15*24*60*60*1000),
      '',
      '',
      '7 dias úteis',
      ''
    ],
    [
      Utilities.getUuid(),
      'PED20250120-001',
      'Papelaria',
      email,
      nome,
      'Administração',
      'Caneta Azul Bic; Lápis Preto HB; Borracha Branca; Marca Texto Amarelo',
      '50; 50; 30; 20',
      230.00,
      'Solicitado',
      new Date(dataBase.getTime() + 20*24*60*60*1000),
      '',
      '',
      '5 dias úteis',
      'Material para novos colaboradores'
    ]
  ];
  
  abaPedidos.getRange(2, 1, pedidosTeste.length, 15).setValues(pedidosTeste);
  
  // Adicionar algumas movimentações de estoque
  const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
  const movimentacoesTeste = [
    [
      Utilities.getUuid(),
      new Date(dataBase.getTime() + 1*24*60*60*1000),
      'ENTRADA',
      produtosTeste[0][0],
      produtosTeste[0][2],
      50,
      100,
      150,
      email,
      'Compra de reposição'
    ],
    [
      Utilities.getUuid(),
      new Date(dataBase.getTime() + 5*24*60*60*1000),
      'ENTRADA',
      produtosTeste[10][0],
      produtosTeste[10][2],
      100,
      50,
      150,
      email,
      'Entrada de mercadoria'
    ],
    [
      Utilities.getUuid(),
      new Date(dataBase.getTime() + 10*24*60*60*1000),
      'SAIDA',
      produtosTeste[0][0],
      produtosTeste[0][2],
      20,
      150,
      130,
      email,
      'Distribuição para setores'
    ]
  ];
  
  abaMovimentacoes.getRange(2, 1, movimentacoesTeste.length, 10).setValues(movimentacoesTeste);
  
  Logger.log('✅ Dados de teste adicionados:');
  Logger.log(`   - ${produtosTeste.length} produtos`);
  Logger.log(`   - ${pedidosTeste.length} pedidos`);
  Logger.log(`   - ${movimentacoesTeste.length} movimentações de estoque`);
}

/**
 * Aplica formatação geral
 */
function aplicarFormatacao(ss) {
  const abas = [
    CONFIG.ABAS.CONFIG,
    CONFIG.ABAS.USERS,
    CONFIG.ABAS.PRODUCTS,
    CONFIG.ABAS.ORDERS,
    CONFIG.ABAS.STOCK,
    CONFIG.ABAS.STOCK_MOVEMENTS,
    CONFIG.ABAS.LOGS,
    CONFIG.ABAS.KPIS
  ];
  
  abas.forEach(nomeAba => {
    const aba = ss.getSheetByName(nomeAba);
    if (aba) {
      // Congelar primeira linha
      aba.setFrozenRows(1);
      
      // Aplicar filtro
      const range = aba.getDataRange();
      if (range.getLastRow() > 1) {
        try {
          range.createFilter();
        } catch (e) {
          // Filtro já existe
        }
      }
      
      // Cor das abas (verde Neoformula)
      aba.setTabColor(CONFIG.CORES.PRIMARY);
    }
  });
  
  // Deletar abas padrão
  ['Sheet1', 'Planilha1', 'Planilha 1', 'Sheet 1'].forEach(nome => {
    try {
      const sheet = ss.getSheetByName(nome);
      if (sheet && ss.getSheets().length > 1) {
        ss.deleteSheet(sheet);
      }
    } catch (e) {
      // Aba não existe
    }
  });
}

/**
 * Obtém configuração do sistema
 */
function obterConfiguracao(chave) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaConfig = ss.getSheetByName(CONFIG.ABAS.CONFIG);
    
    if (!abaConfig) return null;
    
    const dados = abaConfig.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === chave) {
        return dados[i][1];
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('❌ Erro ao obter configuração: ' + error.message);
    return null;
  }
}

/**
 * Menu customizado v6.0
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📦 Sistema Neoformula v6.0')
    .addItem('🚀 Abrir Sistema', 'abrirSistema')
    .addSeparator()
    .addItem('⚙️ Configurar Planilha', 'setupPlanilha')
    .addItem('📁 Criar Estrutura de Pastas', 'criarEstruturaPastas')
    .addSeparator()
    .addItem('🔍 Verificar Status', 'verificarStatus')
    .addItem('📖 Ajuda', 'mostrarAjuda')
    .addToUi();
}

/**
 * Abre o sistema
 */
function abrirSistema() {
  const url = ScriptApp.getService().getUrl();
  
  if (!url) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Sistema não implantado',
      'O sistema ainda não foi implantado como Web App.\n\n' +
      'Vá em: Extensões → Apps Script → Implantar → Nova implantação → Aplicativo da Web',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const html = HtmlService.createHtmlOutput(
    '<script>window.open("' + url + '", "_blank"); google.script.host.close();</script>'
  );
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Abrindo sistema...');
}

/**
 * Verifica status do sistema
 */
function verificarStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');
  const emailGestor = obterConfiguracao('EMAIL_GESTOR');
  
  let status = '🔍 STATUS DO SISTEMA v6.0\n\n';
  
  // Verificar abas
  const abasNecessarias = Object.values(CONFIG.ABAS);
  const abasExistentes = ss.getSheets().map(s => s.getName());
  const abasFaltando = abasNecessarias.filter(a => !abasExistentes.includes(a));
  
  if (abasFaltando.length === 0) {
    status += '✅ Todas as abas criadas\n';
  } else {
    status += `❌ Abas faltando: ${abasFaltando.join(', ')}\n`;
  }
  
  // Verificar configurações
  if (pastaId && pastaId !== '') {
    status += '✅ Pasta de imagens configurada\n';
  } else {
    status += '⚠️ Pasta de imagens NÃO configurada\n';
  }
  
  if (emailGestor && emailGestor.includes('@')) {
    status += '✅ Email do gestor configurado\n';
  } else {
    status += '⚠️ Email do gestor NÃO configurado\n';
  }
  
  // Verificar implantação
  const url = ScriptApp.getService().getUrl();
  if (url) {
    status += '✅ Sistema implantado como Web App\n';
    status += `\n📎 URL: ${url}`;
  } else {
    status += '⚠️ Sistema NÃO implantado como Web App\n';
  }
  
  SpreadsheetApp.getUi().alert('Status do Sistema', status, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Mostra ajuda v6.0
 */
function mostrarAjuda() {
  const ui = SpreadsheetApp.getUi();
  
  const mensagem = 
    '📖 AJUDA - SISTEMA NEOFORMULA v6.0\n\n' +
    '🆕 NOVIDADES v6.0:\n' +
    '   ✨ Logo Neoformula integrado\n' +
    '   ✨ Sem tela de login (acesso direto)\n' +
    '   ✨ Upload de fotos para produtos\n' +
    '   ✨ Dashboard avançado com filtros\n' +
    '   ✨ Gerenciamento completo de estoque\n' +
    '   ✨ Tempos de entrega configuráveis\n' +
    '   ✨ Correção de bugs\n\n' +
    '1️⃣ CONFIGURAR SISTEMA\n' +
    '   Menu: Sistema Neoformula v6.0 → Configurar Planilha\n\n' +
    '2️⃣ CONFIGURAR PASTA DE IMAGENS\n' +
    '   a) Crie uma pasta no Google Drive\n' +
    '   b) Copie o ID da pasta (da URL)\n' +
    '   c) Cole em Configurações > PASTA_IMAGENS_ID\n' +
    '   d) Menu: Sistema → Criar Estrutura de Pastas\n\n' +
    '3️⃣ IMPLANTAR SISTEMA\n' +
    '   Extensões → Apps Script → Implantar → Web App\n' +
    '   Executar como: Eu\n' +
    '   Acesso: Qualquer pessoa\n\n' +
    '4️⃣ ABRIR SISTEMA\n' +
    '   Menu: Sistema Neoformula v6.0 → Abrir Sistema\n\n' +
    '❓ Problemas? Use "Verificar Status" no menu.';
  
  ui.alert('📖 Ajuda v6.0', mensagem, ui.ButtonSet.OK);
}
