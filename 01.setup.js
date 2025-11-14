/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * Módulo: Setup e Configuração Principal
 * ========================================
 *
 * NOVIDADES v8.0:
 * - CONFIG movido para 01.config.js (separado)
 * - Usa CONFIG global do arquivo 01.config.js
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

// CONFIG é declarado em 01.config.js e disponível globalmente
// Não precisa redeclarar aqui

/**
 * Configuração inicial da planilha v10.1 (MELHORADO)
 */
function setupPlanilha() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // Verificar se já está configurado
    const abaConfig = ss.getSheetByName(CONFIG.ABAS.CONFIG);
    const abaUsuarios = ss.getSheetByName(CONFIG.ABAS.USERS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    const jaConfigurado = (abaConfig && abaUsuarios && abaProdutos);

    if (jaConfigurado) {
      // Sistema já configurado - perguntar o que fazer
      const resposta = ui.alert(
        '⚠️ Sistema Já Configurado',
        'O sistema já foi configurado anteriormente.\n\n' +
        'O que você deseja fazer?\n\n' +
        '• OK: Reconfigurar (sobrescrever abas existentes)\n' +
        '• Cancelar: Manter configuração atual',
        ui.ButtonSet.OK_CANCEL
      );

      if (resposta === ui.Button.CANCEL) {
        Logger.log('⚠️ Configuração cancelada pelo usuário');
        return {
          success: false,
          message: 'Configuração cancelada'
        };
      }

      // Usuário escolheu reconfigurar
      const confirmar = ui.alert(
        '⚠️ Confirmação de Reconfiguração',
        'ATENÇÃO: Esta operação irá SOBRESCREVER as abas de configuração.\n\n' +
        '⚠️ DADOS EXISTENTES PODEM SER PERDIDOS!\n\n' +
        'Recomendamos fazer um backup antes de continuar.\n\n' +
        'Deseja realmente continuar?',
        ui.ButtonSet.YES_NO
      );

      if (confirmar !== ui.Button.YES) {
        Logger.log('⚠️ Reconfiguração cancelada pelo usuário');
        return {
          success: false,
          message: 'Reconfiguração cancelada'
        };
      }
    }

    Logger.log('🚀 Iniciando configuração da planilha v10.1...');

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

    // 6. Criar aba de Movimentações de Estoque
    criarAbaMovimentacoesEstoque(ss);
    Logger.log('✅ Aba Movimentações Estoque criada');

    // 7. Criar aba de Registros
    criarAbaRegistros(ss);
    Logger.log('✅ Aba Registros criada');

    // 8. Criar aba de Indicadores
    criarAbaIndicadores(ss);
    Logger.log('✅ Aba Indicadores criada');

    // 9. Criar aba de Notas Fiscais (v10.3)
    criarAbaNotasFiscais(ss);
    Logger.log('✅ Aba Notas Fiscais criada');

    // 10. Criar aba de Histórico de Custos (v10.4)
    criarAbaHistoricoCustos(ss);
    Logger.log('✅ Aba Histórico Custos criada');

    // 11. Criar aba de Itens de NF (v10.4)
    criarAbaItensNotasFiscais(ss);
    Logger.log('✅ Aba Itens NF criada');

    // 12. Popular com dados de teste (APENAS se for primeira configuração)
    if (!jaConfigurado) {
      popularDadosTeste(ss);
      Logger.log('✅ Dados de teste adicionados');
    } else {
      Logger.log('⚠️ Dados de teste NÃO adicionados (reconfiguração)');
    }

    // 10. Aplicar formatação
    aplicarFormatacao(ss);
    Logger.log('✅ Formatação aplicada');

    Logger.log('');
    Logger.log('🎉 CONFIGURAÇÃO v10.1 CONCLUÍDA COM SUCESSO!');
    Logger.log('📊 Sistema de Pedidos pronto para uso');
    Logger.log('');

    const tipoConfig = jaConfigurado ? 'Reconfigurada' : 'Configurada';

    ui.alert(
      `✅ Sistema v10.1 ${tipoConfig}!`,
      `A planilha foi ${tipoConfig.toLowerCase()} com sucesso.\n\n` +
      'Próximos passos:\n' +
      '1. Configure o ID da pasta do Drive em Configurações\n' +
      '2. Menu: Sistema de Pedidos → Criar Estrutura de Pastas\n' +
      '3. Configure o email do gestor\n' +
      '4. Implante como Web App (Extensões > Apps Script > Implantar)',
      ui.ButtonSet.OK
    );

    return {
      success: true,
      message: `Planilha v10.1 ${tipoConfig.toLowerCase()} com sucesso!`
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
 * Cria aba de Produtos (v12.0 - Estrutura com duplo código)
 */
function criarAbaProdutos(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

  if (aba) {
    Logger.log('⚠️ Aba Produtos já existe, mantendo dados...');
    return;
  }

  aba = ss.insertSheet(CONFIG.ABAS.PRODUCTS);

  // Cabeçalhos v12 - Nova estrutura com código/descrição do fornecedor + Neoformula
  const headers = [
    'ID',                       // A
    'Código Fornecedor',        // B - Do XML da NF
    'Descrição Fornecedor',     // C - Do XML da NF
    'Código Neoformula',        // D - Preenchido pelo gestor
    'Descrição Neoformula',     // E - Preenchido pelo gestor
    'Tipo',                     // F - Papelaria/Limpeza
    'Categoria',                // G
    'Unidade',                  // H
    'Preço Unitário',           // I - Custo médio
    'Estoque Mínimo',           // J
    'Ponto de Pedido',          // K
    'Fornecedor',               // L
    'ImagemURL',                // M
    'Ativo',                    // N
    'Data Cadastro',            // O
    'NCM',                      // P - Do XML
    'Mapeamento Códigos'        // Q - JSON histórico
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
    'Quantidade', 'Estoque Anterior', 'Estoque Atual', 'Responsável', 'Observações',
    'Pedido ID', 'NF ID', 'Custo Unitário'
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
 * Cria estrutura de pastas no Google Drive (v10.1 - MELHORADO)
 */
function criarEstruturaPastas() {
  try {
    const ui = SpreadsheetApp.getUi();
    const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');

    // Verificar se ID está configurado
    if (!pastaId || pastaId === '') {
      ui.alert(
        '⚠️ Pasta Não Configurada',
        'O ID da pasta de imagens não está configurado.\n\n' +
        'Para configurar:\n' +
        '1. Crie uma pasta no Google Drive\n' +
        '2. Copie o ID da pasta (da URL)\n' +
        '3. Cole em: Configurações > PASTA_IMAGENS_ID\n' +
        '4. Execute esta função novamente',
        ui.ButtonSet.OK
      );
      return {
        success: false,
        error: 'PASTA_IMAGENS_ID não configurada'
      };
    }

    // Verificar se pasta existe e é acessível
    let pastaPrincipal;
    try {
      pastaPrincipal = DriveApp.getFolderById(pastaId);
    } catch (e) {
      ui.alert(
        '❌ Pasta Não Encontrada',
        'O ID da pasta está inválido ou você não tem acesso a ela.\n\n' +
        `ID configurado: ${pastaId}\n\n` +
        'Verifique se:\n' +
        '1. O ID está correto\n' +
        '2. Você tem permissão para acessar a pasta\n' +
        '3. A pasta não foi deletada',
        ui.ButtonSet.OK
      );
      return {
        success: false,
        error: 'Pasta não encontrada ou sem acesso'
      };
    }

    Logger.log(`📁 Pasta principal encontrada: ${pastaPrincipal.getName()}`);

    let pastasExistentes = [];
    let pastasCriadas = [];

    // Criar subpasta Papelaria
    const foldersPapelaria = pastaPrincipal.getFoldersByName('Papelaria');
    if (!foldersPapelaria.hasNext()) {
      const novaPasta = pastaPrincipal.createFolder('Papelaria');
      novaPasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('📁 Pasta Papelaria criada');
      pastasCriadas.push('Papelaria');
    } else {
      Logger.log('📁 Pasta Papelaria já existe');
      pastasExistentes.push('Papelaria');
    }

    // Criar subpasta Limpeza
    const foldersLimpeza = pastaPrincipal.getFoldersByName('Limpeza');
    if (!foldersLimpeza.hasNext()) {
      const novaPasta = pastaPrincipal.createFolder('Limpeza');
      novaPasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('📁 Pasta Limpeza criada');
      pastasCriadas.push('Limpeza');
    } else {
      Logger.log('📁 Pasta Limpeza já existe');
      pastasExistentes.push('Limpeza');
    }

    // Montar mensagem de resultado
    let mensagem = '✅ Estrutura de Pastas Configurada!\n\n';

    if (pastasCriadas.length > 0) {
      mensagem += `📁 Pastas criadas: ${pastasCriadas.join(', ')}\n`;
    }

    if (pastasExistentes.length > 0) {
      mensagem += `✓ Pastas existentes: ${pastasExistentes.join(', ')}\n`;
    }

    mensagem += `\nPasta principal: ${pastaPrincipal.getName()}\n`;
    mensagem += `ID: ${pastaId}\n\n`;
    mensagem += 'As imagens dos produtos serão salvas nas subpastas correspondentes.';

    ui.alert('Estrutura de Pastas', mensagem, ui.ButtonSet.OK);

    return {
      success: true,
      pastasCriadas: pastasCriadas,
      pastasExistentes: pastasExistentes
    };

  } catch (error) {
    Logger.log('❌ Erro ao criar pastas: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro ao criar estrutura de pastas:\n\n' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return {
      success: false,
      error: error.message
    };
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
 * Menu customizado v10.1
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📦 Sistema de Pedidos')
    .addItem('⚙️ Configurar Planilha', 'setupPlanilha')
    .addItem('📁 Criar Estrutura de Pastas', 'criarEstruturaPastas')
    .addItem('🖼️ Corrigir URLs de Imagens', 'corrigirURLsImagensMenu')
    .addSeparator()
    .addItem('🔍 Verificar Status', 'verificarStatus')
    .addItem('🔄 Recarregar Sistema', 'recarregarSistema')
    .addItem('🗑️ Limpar Cache', 'limparCache')
    .addSeparator()
    .addItem('📊 Gerar Relatório de Dados', 'gerarRelatorioDados')
    .addItem('💾 Backup de Segurança', 'criarBackup')
    .addSeparator()
    .addItem('🔴 Factory Reset (Resetar Tudo)', 'factoryReset')
    .addSeparator()
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
 * Verifica status do sistema v10.1 (MELHORADO)
 */
function verificarStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  let status = '🔍 STATUS DO SISTEMA v10.1\n\n';
  let problemas = [];
  let avisos = [];

  // ========================================
  // 1. VERIFICAR ABAS ESSENCIAIS
  // ========================================
  status += '📋 ABAS DO SISTEMA:\n';

  const abasEssenciais = [
    { nome: CONFIG.ABAS.PRODUCTS, label: 'Produtos' },
    { nome: CONFIG.ABAS.ORDERS, label: 'Pedidos' },
    { nome: CONFIG.ABAS.USERS, label: 'Usuários' },
    { nome: CONFIG.ABAS.STOCK, label: 'Estoque' },
    { nome: CONFIG.ABAS.STOCK_MOVEMENTS, label: 'Movimentações Estoque' },
    { nome: CONFIG.ABAS.CONFIG, label: 'Configurações' }
  ];

  abasEssenciais.forEach(aba => {
    const abaSheet = ss.getSheetByName(aba.nome);
    if (abaSheet) {
      const numLinhas = abaSheet.getLastRow() - 1; // -1 para header
      status += `   ✅ ${aba.label}: ${numLinhas} registros\n`;
    } else {
      status += `   ❌ ${aba.label}: NÃO ENCONTRADA\n`;
      problemas.push(`Aba "${aba.nome}" não existe`);
    }
  });

  // Abas opcionais (LOGS e KPIS)
  const abaLogs = ss.getSheetByName(CONFIG.ABAS.LOGS);
  const abaKpis = ss.getSheetByName(CONFIG.ABAS.KPIS);

  if (abaLogs) {
    const numLogs = abaLogs.getLastRow() - 1;
    status += `   ✅ Registros (Logs): ${numLogs} registros\n`;
  } else {
    status += `   ⚠️ Registros (Logs): opcional, não criada\n`;
    avisos.push('Aba de Logs não existe (opcional)');
  }

  if (abaKpis) {
    const numKpis = abaKpis.getLastRow() - 1;
    status += `   ✅ Indicadores (KPIs): ${numKpis} registros\n`;
  } else {
    status += `   ⚠️ Indicadores (KPIs): opcional, não criada\n`;
    avisos.push('Aba de KPIs não existe (opcional)');
  }

  // ========================================
  // 2. VERIFICAR CONFIGURAÇÕES CRÍTICAS
  // ========================================
  status += '\n⚙️ CONFIGURAÇÕES:\n';

  const versao = obterConfiguracao('VERSAO');
  const nomeSistema = obterConfiguracao('NOME_SISTEMA');
  const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');
  const emailGestor = obterConfiguracao('EMAIL_GESTOR');
  const aprovarPedidos = obterConfiguracao('APROVAR_PEDIDOS');
  const tempoEntregaPapelaria = obterConfiguracao('TEMPO_ENTREGA_PAPELARIA');
  const tempoEntregaLimpeza = obterConfiguracao('TEMPO_ENTREGA_LIMPEZA');

  // Versão
  if (versao) {
    status += `   ✅ Versão: ${versao}\n`;
  } else {
    status += `   ⚠️ Versão: não configurada\n`;
    avisos.push('Versão do sistema não configurada');
  }

  // Nome do Sistema
  if (nomeSistema) {
    status += `   ✅ Nome: ${nomeSistema}\n`;
  } else {
    status += `   ⚠️ Nome: não configurado\n`;
  }

  // Pasta de Imagens (CRÍTICO)
  if (pastaId && pastaId !== '') {
    try {
      const pasta = DriveApp.getFolderById(pastaId);
      status += `   ✅ Pasta de Imagens: configurada (ID válido)\n`;
    } catch (e) {
      status += `   ❌ Pasta de Imagens: ID inválido ou sem acesso\n`;
      problemas.push('ID da pasta de imagens inválido');
    }
  } else {
    status += `   ❌ Pasta de Imagens: NÃO CONFIGURADA\n`;
    problemas.push('Pasta de imagens não configurada (upload não funcionará)');
  }

  // Email do Gestor
  if (emailGestor && emailGestor.includes('@')) {
    status += `   ✅ Email Gestor: ${emailGestor}\n`;
  } else {
    status += `   ⚠️ Email Gestor: não configurado\n`;
    avisos.push('Email do gestor não configurado (notificações desabilitadas)');
  }

  // Aprovação de Pedidos
  status += `   ℹ️ Aprovar Pedidos: ${aprovarPedidos || 'Não'}\n`;

  // Tempos de Entrega
  status += `   ℹ️ Prazo Papelaria: ${tempoEntregaPapelaria || 5} dias úteis\n`;
  status += `   ℹ️ Prazo Limpeza: ${tempoEntregaLimpeza || 7} dias úteis\n`;

  // ========================================
  // 3. VERIFICAR IMPLANTAÇÃO WEB APP
  // ========================================
  status += '\n🌐 IMPLANTAÇÃO:\n';

  const url = ScriptApp.getService().getUrl();
  if (url) {
    status += `   ✅ Sistema implantado como Web App\n`;
    status += `   📎 URL: ${url}\n`;
  } else {
    status += `   ❌ Sistema NÃO implantado como Web App\n`;
    problemas.push('Sistema não implantado (vá em Apps Script > Implantar > Web App)');
  }

  // ========================================
  // 4. VERIFICAR USUÁRIOS
  // ========================================
  status += '\n👥 USUÁRIOS:\n';

  const abaUsuarios = ss.getSheetByName(CONFIG.ABAS.USERS);
  if (abaUsuarios) {
    const dadosUsuarios = abaUsuarios.getDataRange().getValues();
    const totalUsuarios = dadosUsuarios.length - 1;
    const usuariosAtivos = dadosUsuarios.filter((u, i) => i > 0 && u[4] === 'Sim').length;
    const admins = dadosUsuarios.filter((u, i) => i > 0 && u[3] === 'Admin').length;
    const gestores = dadosUsuarios.filter((u, i) => i > 0 && u[3] === 'Gestor').length;
    const usuarios = dadosUsuarios.filter((u, i) => i > 0 && u[3] === 'Usuário').length;

    status += `   ℹ️ Total: ${totalUsuarios} (${usuariosAtivos} ativos)\n`;
    status += `   ℹ️ Admins: ${admins} | Gestores: ${gestores} | Usuários: ${usuarios}\n`;

    if (admins === 0) {
      problemas.push('Nenhum usuário Admin cadastrado');
    }
  } else {
    status += `   ❌ Aba de usuários não encontrada\n`;
  }

  // ========================================
  // 5. VERIFICAR PRODUTOS
  // ========================================
  status += '\n📦 PRODUTOS:\n';

  const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  if (abaProdutos) {
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const totalProdutos = dadosProdutos.length - 1;
    const produtosAtivos = dadosProdutos.filter((p, i) => i > 0 && p[11] === 'Sim').length;
    const produtosPapelaria = dadosProdutos.filter((p, i) => i > 0 && p[3] === 'Papelaria').length;
    const produtosLimpeza = dadosProdutos.filter((p, i) => i > 0 && p[3] === 'Limpeza').length;
    const produtosComImagem = dadosProdutos.filter((p, i) => i > 0 && p[10] && p[10] !== '').length;

    status += `   ℹ️ Total: ${totalProdutos} (${produtosAtivos} ativos)\n`;
    status += `   ℹ️ Papelaria: ${produtosPapelaria} | Limpeza: ${produtosLimpeza}\n`;
    status += `   ℹ️ Com imagem: ${produtosComImagem} de ${totalProdutos}\n`;

    if (totalProdutos === 0) {
      avisos.push('Nenhum produto cadastrado');
    }

    if (produtosComImagem < totalProdutos) {
      avisos.push(`${totalProdutos - produtosComImagem} produto(s) sem imagem`);
    }
  } else {
    status += `   ❌ Aba de produtos não encontrada\n`;
  }

  // ========================================
  // 6. VERIFICAR PEDIDOS
  // ========================================
  status += '\n📋 PEDIDOS:\n';

  const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
  if (abaPedidos) {
    const dadosPedidos = abaPedidos.getDataRange().getValues();
    const totalPedidos = dadosPedidos.length - 1;
    const solicitados = dadosPedidos.filter((p, i) => i > 0 && p[9] === 'Solicitado').length;
    const emCompra = dadosPedidos.filter((p, i) => i > 0 && p[9] === 'Em Compra').length;
    const finalizados = dadosPedidos.filter((p, i) => i > 0 && p[9] === 'Finalizado').length;

    status += `   ℹ️ Total: ${totalPedidos}\n`;
    status += `   ℹ️ Solicitados: ${solicitados} | Em Compra: ${emCompra} | Finalizados: ${finalizados}\n`;

    if (solicitados > 10) {
      avisos.push(`${solicitados} pedidos aguardando processamento`);
    }
  } else {
    status += `   ❌ Aba de pedidos não encontrada\n`;
  }

  // ========================================
  // 7. RESUMO FINAL
  // ========================================
  status += '\n━━━━━━━━━━━━━━━━━━━━━━\n';

  if (problemas.length === 0 && avisos.length === 0) {
    status += '✅ SISTEMA OPERACIONAL\n';
    status += 'Nenhum problema detectado!';
  } else {
    if (problemas.length > 0) {
      status += `❌ ${problemas.length} PROBLEMA(S) CRÍTICO(S):\n`;
      problemas.forEach(p => {
        status += `   • ${p}\n`;
      });
      status += '\n';
    }

    if (avisos.length > 0) {
      status += `⚠️ ${avisos.length} AVISO(S):\n`;
      avisos.forEach(a => {
        status += `   • ${a}\n`;
      });
    }
  }

  ui.alert('Status do Sistema v10.1', status, ui.ButtonSet.OK);
}

/**
 * Mostra ajuda v10.1
 */
function mostrarAjuda() {
  const ui = SpreadsheetApp.getUi();

  const mensagem =
    '📖 AJUDA - SISTEMA DE PEDIDOS v10.1\n\n' +
    '🆕 NOVIDADES v10.1:\n' +
    '   ✨ Kanban board simplificado\n' +
    '   ✨ Edição completa de pedidos\n' +
    '   ✨ Controle avançado de permissões\n' +
    '   ✨ Dashboard profissional\n' +
    '   ✨ Correção de URLs de imagens\n\n' +
    '1️⃣ CONFIGURAR SISTEMA\n' +
    '   Menu: Sistema de Pedidos → Configurar Planilha\n\n' +
    '2️⃣ CONFIGURAR PASTA DE IMAGENS\n' +
    '   a) Crie uma pasta no Google Drive\n' +
    '   b) Copie o ID da pasta (da URL)\n' +
    '   c) Cole em Configurações > PASTA_IMAGENS_ID\n' +
    '   d) Menu: Sistema → Criar Estrutura de Pastas\n\n' +
    '3️⃣ IMPLANTAR SISTEMA\n' +
    '   Extensões → Apps Script → Implantar → Web App\n' +
    '   Executar como: Eu\n' +
    '   Acesso: Qualquer pessoa\n\n' +
    '4️⃣ MANUTENÇÃO\n' +
    '   Use o menu para corrigir imagens, limpar cache e fazer backup\n\n' +
    '❓ Problemas? Use "Verificar Status" no menu.';

  ui.alert('📖 Ajuda v10.1', mensagem, ui.ButtonSet.OK);
}

/**
 * Corrigir URLs de Imagens via menu
 * Converte URLs antigas de Google Drive para formato thumbnail
 */
function corrigirURLsImagensMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    const resposta = ui.alert(
      '🖼️ Corrigir URLs de Imagens',
      'Esta operação irá converter todas as URLs antigas do Google Drive (formato uc?id=) para o novo formato de thumbnail.\n\n' +
      'Isso corrigirá problemas de exibição de imagens dos produtos.\n\n' +
      'Deseja continuar?',
      ui.ButtonSet.YES_NO
    );

    if (resposta !== ui.Button.YES) {
      return;
    }

    const resultado = corrigirURLsImagensAntigas();

    if (resultado.success) {
      ui.alert(
        '✅ URLs Corrigidas',
        `${resultado.corrigidos} URL(s) foi(ram) corrigida(s) com sucesso!\n\n` +
        'As imagens dos produtos devem aparecer corretamente agora.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Erro',
        'Erro ao corrigir URLs: ' + resultado.error,
        ui.ButtonSet.OK
      );
    }

  } catch (error) {
    Logger.log('❌ Erro em corrigirURLsImagensMenu: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Recarregar sistema
 * Limpa caches e força atualização dos dados
 */
function recarregarSistema() {
  try {
    const ui = SpreadsheetApp.getUi();

    // Limpar cache do CacheService
    CacheService.getScriptCache().removeAll([
      'produtos',
      'pedidos',
      'usuarios',
      'estoque'
    ]);

    ui.alert(
      '✅ Sistema Recarregado',
      'Os caches foram limpos. O sistema irá recarregar os dados na próxima vez que for acessado.\n\n' +
      'Recomendamos que os usuários recarreguem a página do navegador (F5).',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('❌ Erro em recarregarSistema: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro ao recarregar sistema: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Limpar cache
 * Remove todos os caches armazenados
 */
function limparCache() {
  try {
    const ui = SpreadsheetApp.getUi();

    const resposta = ui.alert(
      '🗑️ Limpar Cache',
      'Esta operação irá remover todos os dados em cache.\n\n' +
      'Isso pode melhorar o desempenho se houver dados corrompidos no cache.\n\n' +
      'Deseja continuar?',
      ui.ButtonSet.YES_NO
    );

    if (resposta !== ui.Button.YES) {
      return;
    }

    // Limpar todos os caches
    const scriptCache = CacheService.getScriptCache();
    const userCache = CacheService.getUserCache();

    try {
      scriptCache.removeAll(scriptCache.getAll());
    } catch (e) {
      Logger.log('Cache do script já vazio');
    }

    try {
      userCache.removeAll(userCache.getAll());
    } catch (e) {
      Logger.log('Cache do usuário já vazio');
    }

    ui.alert(
      '✅ Cache Limpo',
      'Todos os caches foram removidos com sucesso!\n\n' +
      'O sistema irá reconstruir os caches conforme necessário.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('❌ Erro em limparCache: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro ao limpar cache: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Gerar relatório de dados
 * Cria um resumo estatístico do sistema
 */
function gerarRelatorioDados() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // Contar registros em cada aba
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    const abaUsuarios = ss.getSheetByName(CONFIG.ABAS.USERS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    const abaLogs = ss.getSheetByName(CONFIG.ABAS.LOGS);

    const produtos = abaProdutos ? abaProdutos.getLastRow() - 1 : 0;
    const pedidos = abaPedidos ? abaPedidos.getLastRow() - 1 : 0;
    const usuarios = abaUsuarios ? abaUsuarios.getLastRow() - 1 : 0;
    const estoque = abaEstoque ? abaEstoque.getLastRow() - 1 : 0;
    const movimentacoes = abaMovimentacoes ? abaMovimentacoes.getLastRow() - 1 : 0;
    const logs = abaLogs ? abaLogs.getLastRow() - 1 : 0;

    // Calcular pedidos por status (se houver pedidos)
    let pedidosPorStatus = '';
    if (pedidos > 0) {
      const dadosPedidos = abaPedidos.getRange(2, 1, pedidos, 15).getValues();
      const solicitados = dadosPedidos.filter(p => p[9] === 'Solicitado').length;
      const emCompra = dadosPedidos.filter(p => p[9] === 'Em Compra').length;
      const finalizado = dadosPedidos.filter(p => p[9] === 'Finalizado').length;
      const cancelado = dadosPedidos.filter(p => p[9] === 'Cancelado').length;

      pedidosPorStatus = `\n\n📋 PEDIDOS POR STATUS:\n` +
        `   • Solicitados: ${solicitados}\n` +
        `   • Em Compra: ${emCompra}\n` +
        `   • Finalizados: ${finalizado}\n` +
        `   • Cancelados: ${cancelado}`;
    }

    const relatorio =
      `📊 RELATÓRIO DO SISTEMA\n` +
      `Data: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss')}\n\n` +
      `📦 DADOS PRINCIPAIS:\n` +
      `   • Produtos cadastrados: ${produtos}\n` +
      `   • Pedidos registrados: ${pedidos}\n` +
      `   • Usuários ativos: ${usuarios}\n` +
      `   • Itens em estoque: ${estoque}\n` +
      `   • Movimentações de estoque: ${movimentacoes}\n` +
      `   • Registros de log: ${logs}` +
      pedidosPorStatus +
      `\n\n✅ Sistema operacional na versão ${CONFIG.VERSAO}`;

    ui.alert('📊 Relatório de Dados', relatorio, ui.ButtonSet.OK);

    // Registrar no log
    registrarLog(
      Session.getActiveUser().getEmail(),
      'Relatório Gerado',
      `Relatório de dados do sistema gerado via menu`,
      'sucesso'
    );

  } catch (error) {
    Logger.log('❌ Erro em gerarRelatorioDados: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro ao gerar relatório: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Criar backup de segurança
 * Cria uma cópia da planilha com timestamp
 */
function criarBackup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    const resposta = ui.alert(
      '💾 Backup de Segurança',
      'Esta operação irá criar uma cópia completa da planilha no Google Drive.\n\n' +
      'O backup incluirá todos os dados: produtos, pedidos, usuários, estoque, etc.\n\n' +
      'Deseja continuar?',
      ui.ButtonSet.YES_NO
    );

    if (resposta !== ui.Button.YES) {
      return;
    }

    // Criar nome do backup com timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    const nomeBackup = `[BACKUP] Sistema de Pedidos - ${timestamp}`;

    // Criar cópia
    const backup = ss.copy(nomeBackup);
    const backupUrl = backup.getUrl();

    // Registrar no log
    registrarLog(
      Session.getActiveUser().getEmail(),
      'Backup Criado',
      `Backup de segurança criado: ${nomeBackup}`,
      'sucesso'
    );

    ui.alert(
      '✅ Backup Criado',
      `Backup criado com sucesso!\n\n` +
      `Nome: ${nomeBackup}\n\n` +
      `O backup foi salvo no seu Google Drive.\n\n` +
      `URL: ${backupUrl}`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('❌ Erro em criarBackup: ' + error.message);
    SpreadsheetApp.getUi().alert(
      '❌ Erro',
      'Erro ao criar backup: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Factory Reset - Restaura sistema para configuração inicial (v10.1)
 * ⚠️ ATENÇÃO: Esta função DELETA TODOS OS DADOS!
 */
function factoryReset() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // AVISO 1: Explicar o que é Factory Reset
    const aviso1 = ui.alert(
      '⚠️ FACTORY RESET - AVISO IMPORTANTE',
      '⚠️ ATENÇÃO: Factory Reset DELETA TODOS OS DADOS!\n\n' +
      'Esta operação irá:\n' +
      '• Deletar TODOS os produtos cadastrados\n' +
      '• Deletar TODOS os pedidos\n' +
      '• Deletar TODOS os usuários (exceto você)\n' +
      '• Deletar TODO o histórico de estoque\n' +
      '• Deletar TODOS os logs\n' +
      '• Resetar configurações para padrão\n\n' +
      '🔴 ESTA AÇÃO NÃO PODE SER DESFEITA!\n\n' +
      '💡 Recomendamos fazer um BACKUP antes de continuar.\n\n' +
      'Deseja continuar?',
      ui.ButtonSet.YES_NO
    );

    if (aviso1 !== ui.Button.YES) {
      Logger.log('⚠️ Factory Reset cancelado pelo usuário (aviso 1)');
      return {
        success: false,
        message: 'Factory Reset cancelado'
      };
    }

    // AVISO 2: Confirmação com digitação
    const confirmar = ui.prompt(
      '⚠️ CONFIRMAÇÃO DE FACTORY RESET',
      '⚠️ ÚLTIMA CHANCE: Esta ação irá APAGAR TODOS OS DADOS!\n\n' +
      'Para confirmar, digite exatamente:\n' +
      'CONFIRMO RESET\n\n' +
      '(Digite abaixo)',
      ui.ButtonSet.OK_CANCEL
    );

    if (confirmar.getSelectedButton() !== ui.Button.OK) {
      Logger.log('⚠️ Factory Reset cancelado pelo usuário (aviso 2)');
      return {
        success: false,
        message: 'Factory Reset cancelado'
      };
    }

    const textoDigitado = confirmar.getResponseText().trim();

    if (textoDigitado !== 'CONFIRMO RESET') {
      ui.alert(
        '❌ Confirmação Incorreta',
        `Você digitou: "${textoDigitado}"\n\n` +
        'Texto esperado: "CONFIRMO RESET"\n\n' +
        'Factory Reset cancelado por segurança.',
        ui.ButtonSet.OK
      );
      Logger.log('⚠️ Factory Reset cancelado - confirmação incorreta');
      return {
        success: false,
        message: 'Confirmação incorreta'
      };
    }

    // EXECUTAR FACTORY RESET
    Logger.log('🔴 Iniciando Factory Reset...');

    const email = Session.getActiveUser().getEmail();

    // 1. Deletar todas as abas (exceto primeira)
    const todasAbas = ss.getSheets();
    Logger.log(`🗑️ Deletando ${todasAbas.length - 1} abas...`);

    for (let i = todasAbas.length - 1; i > 0; i--) {
      ss.deleteSheet(todasAbas[i]);
    }

    // Renomear primeira aba para "Temp"
    todasAbas[0].setName('Temp');

    Logger.log('✅ Todas as abas deletadas');

    // 2. Reconfigurar sistema do zero
    Logger.log('🔄 Reconfigurando sistema...');

    // Criar abas
    criarAbaConfiguracoes(ss);
    criarAbaUsuarios(ss);
    criarAbaProdutos(ss);
    criarAbaPedidos(ss);
    criarAbaEstoque(ss);
    criarAbaMovimentacoesEstoque(ss);
    criarAbaRegistros(ss);
    criarAbaIndicadores(ss);
    criarAbaNotasFiscais(ss); // v10.3

    // Popular dados de teste
    popularDadosTeste(ss);

    // Aplicar formatação
    aplicarFormatacao(ss);

    // Deletar aba temporária
    const abaTemp = ss.getSheetByName('Temp');
    if (abaTemp) {
      ss.deleteSheet(abaTemp);
    }

    Logger.log('✅ Sistema reconfigurado');

    // 3. Registrar reset
    registrarLog(
      email,
      'Factory Reset',
      'Sistema resetado para configuração inicial - TODOS OS DADOS FORAM APAGADOS',
      'sucesso'
    );

    Logger.log('');
    Logger.log('🎉 FACTORY RESET CONCLUÍDO COM SUCESSO!');
    Logger.log('📊 Sistema restaurado para configuração inicial');
    Logger.log('');

    ui.alert(
      '✅ Factory Reset Concluído',
      'O sistema foi resetado para a configuração inicial.\n\n' +
      '✅ Todas as abas foram recriadas\n' +
      '✅ Dados de teste foram adicionados\n' +
      '✅ Você foi cadastrado como Admin\n\n' +
      'Próximos passos:\n' +
      '1. Configure o ID da pasta do Drive em Configurações\n' +
      '2. Menu: Sistema de Pedidos → Criar Estrutura de Pastas\n' +
      '3. Cadastre usuários e produtos conforme necessário',
      ui.ButtonSet.OK
    );

    return {
      success: true,
      message: 'Factory Reset concluído com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro no Factory Reset: ' + error.message);
    Logger.log(error.stack);

    SpreadsheetApp.getUi().alert(
      '❌ Erro no Factory Reset',
      'Erro: ' + error.message + '\n\n' +
      'O sistema pode estar em um estado inconsistente.\n' +
      'Recomendamos restaurar um backup.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return {
      success: false,
      error: error.message
    };
  }
}
