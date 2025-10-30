/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Interface Web
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Sem tela de login (acesso direto)
 * - Logo Neoformula integrado
 * - Interface moderna e responsiva
 */

/**
 * Serve a página HTML (entrada principal do Web App)
 */
function doGet(e) {
  try {
    // Verificar se o sistema está implantado
    const url = ScriptApp.getService().getUrl();
    
    if (!url) {
      return HtmlService.createHtmlOutput('<h1>Sistema não implantado</h1>');
    }
    
    // Carregar interface HTML
    const template = HtmlService.createTemplateFromFile('Index');
    
    // Passar configurações para o template
    template.logoUrl = CONFIG.LOGO_URL;
    template.versao = CONFIG.VERSAO;
    template.nomeSistema = 'Sistema de Controle de Pedidos Neoformula';
    
    return template.evaluate()
      .setTitle('Sistema Neoformula v6.0')
      .setFaviconUrl('https://neoformula.com.br/favicon.ico')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    
  } catch (error) {
    Logger.log('❌ Erro ao servir página: ' + error.message);
    return HtmlService.createHtmlOutput('<h1>Erro ao carregar sistema</h1><p>' + error.message + '</p>');
  }
}

/**
 * Inclui arquivo HTML/CSS/JS
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Retorna informações do usuário atual (v6.0 - sem login)
 */
function getUserInfo() {
  try {
    const contexto = getUserContext();
    
    if (!contexto.success) {
      // Em caso de erro, retornar dados básicos
      const email = Session.getActiveUser().getEmail();
      return {
        success: true,
        user: {
          email: email,
          nome: email.split('@')[0],
          setor: 'Sem Setor',
          permissao: CONFIG.PERMISSOES.USUARIO,
          ativo: 'Sim'
        }
      };
    }
    
    return contexto;
    
  } catch (error) {
    Logger.log('❌ Erro ao obter informações do usuário: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retorna configurações do sistema
 */
function getSystemConfig() {
  try {
    const configuracoes = obterTodasConfiguracoes();
    
    if (!configuracoes.success) {
      return {
        success: false,
        error: 'Erro ao carregar configurações'
      };
    }
    
    return {
      success: true,
      config: {
        versao: CONFIG.VERSAO,
        logoUrl: CONFIG.LOGO_URL,
        cores: CONFIG.CORES,
        tempoEntregaPapelaria: obterConfiguracao('TEMPO_ENTREGA_PAPELARIA') || 5,
        tempoEntregaLimpeza: obterConfiguracao('TEMPO_ENTREGA_LIMPEZA') || 7
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao obter configurações: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica status do sistema
 */
function checkSystemStatus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Verificar abas essenciais
    const abasEssenciais = [
      CONFIG.ABAS.CONFIG,
      CONFIG.ABAS.USERS,
      CONFIG.ABAS.PRODUCTS,
      CONFIG.ABAS.ORDERS,
      CONFIG.ABAS.STOCK
    ];
    
    const abasFaltando = [];
    
    abasEssenciais.forEach(nomeAba => {
      if (!ss.getSheetByName(nomeAba)) {
        abasFaltando.push(nomeAba);
      }
    });
    
    if (abasFaltando.length > 0) {
      return {
        success: false,
        error: `Abas não encontradas: ${abasFaltando.join(', ')}`,
        status: 'INCOMPLETO'
      };
    }
    
    // Verificar configurações críticas
    const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');
    const emailGestor = obterConfiguracao('EMAIL_GESTOR');
    
    const avisos = [];
    
    if (!pastaId || pastaId === '') {
      avisos.push('Pasta de imagens não configurada');
    }
    
    if (!emailGestor || !emailGestor.includes('@')) {
      avisos.push('Email do gestor não configurado');
    }
    
    return {
      success: true,
      status: 'OK',
      avisos: avisos,
      versao: CONFIG.VERSAO
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao verificar status: ' + error.message);
    return {
      success: false,
      error: error.message,
      status: 'ERRO'
    };
  }
}

/**
 * Obtém dados iniciais para a interface (CORRIGIDO v6.0.1)
 */
function getInitialData() {
  try {
    // Tentar obter informações do usuário
    let userInfo = null;
    try {
      userInfo = getUserInfo();
    } catch (e) {
      Logger.log('⚠️ Erro ao obter userInfo: ' + e.message);
      userInfo = {
        success: false,
        error: e.message
      };
    }
    
    // Tentar obter configurações
    let systemConfig = null;
    try {
      systemConfig = getSystemConfig();
    } catch (e) {
      Logger.log('⚠️ Erro ao obter systemConfig: ' + e.message);
      systemConfig = {
        success: false,
        error: e.message
      };
    }
    
    // Tentar obter status
    let systemStatus = null;
    try {
      systemStatus = checkSystemStatus();
    } catch (e) {
      Logger.log('⚠️ Erro ao obter systemStatus: ' + e.message);
      systemStatus = {
        success: false,
        error: e.message
      };
    }
    
    return {
      success: true,
      data: {
        user: userInfo && userInfo.success ? userInfo.user : null,
        config: systemConfig && systemConfig.success ? systemConfig.config : null,
        status: systemStatus || { success: false, status: 'ERRO' }
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro crítico em getInitialData: ' + error.message);
    
    // Retornar estrutura mínima para evitar null
    return {
      success: false,
      error: error.message,
      data: {
        user: null,
        config: null,
        status: { success: false, status: 'ERRO' }
      }
    };
  }
}


/**
 * Testa conectividade com o backend
 */
function testConnection() {
  return {
    success: true,
    message: 'Conexão OK',
    timestamp: new Date(),
    versao: CONFIG.VERSAO
  };
}
