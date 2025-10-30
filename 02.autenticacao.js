/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Autenticação e Gerenciamento de Usuários
 * ========================================
 * 
 * CORREÇÕES v6.0:
 * - Bug de leitura de usuários corrigido
 * - Verificações de null/undefined adicionadas
 * - Melhor tratamento de erros
 * - Sem necessidade de login (acesso direto)
 */

/**
 * Obtém contexto do usuário atual (v6.0 - CORRIGIDO)
 */
function getUserContext() {
  try {
    const email = Session.getActiveUser().getEmail();
    
    if (!email) {
      return {
        success: false,
        error: 'Email não identificado',
        user: null
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return {
        success: false,
        error: 'Aba de usuários não encontrada',
        user: null
      };
    }
    
    const dados = abaUsers.getDataRange().getValues();
    
    if (!dados || dados.length < 2) {
      // Criar usuário automaticamente se não existir
      return criarUsuarioAutomatico(email);
    }
    
    // Procurar usuário
    let usuario = null;
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === email) {
        usuario = {
          email: dados[i][0] || email,
          nome: dados[i][1] || email.split('@')[0],
          setor: dados[i][2] || 'Sem Setor',
          permissao: dados[i][3] || CONFIG.PERMISSOES.USUARIO,
          ativo: dados[i][4] !== undefined ? dados[i][4] : 'Sim'
        };
        break;
      }
    }
    
    // Se usuário não encontrado, criar automaticamente
    if (!usuario) {
      return criarUsuarioAutomatico(email);
    }
    
    // Verificar se está ativo
    if (usuario.ativo === 'Não' || usuario.ativo === false) {
      return {
        success: false,
        error: 'Usuário inativo',
        user: null
      };
    }
    
    return {
      success: true,
      user: usuario
    };
    
  } catch (error) {
    Logger.log('❌ Erro em getUserContext: ' + error.message);
    
    // Em caso de erro, tentar criar usuário de emergência
    try {
      const email = Session.getActiveUser().getEmail();
      return criarUsuarioAutomatico(email);
    } catch (e) {
      return {
        success: false,
        error: 'Erro crítico ao obter contexto: ' + error.message,
        user: null
      };
    }
  }
}

/**
 * Cria usuário automaticamente (NOVO v6.0)
 */
function criarUsuarioAutomatico(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return {
        success: false,
        error: 'Aba de usuários não encontrada',
        user: null
      };
    }
    
    const nome = email.split('@')[0];
    const novoUsuario = [
      email,
      nome,
      'Sem Setor',
      CONFIG.PERMISSOES.USUARIO,
      'Sim',
      new Date()
    ];
    
    abaUsers.appendRow(novoUsuario);
    
    Logger.log(`✅ Usuário criado automaticamente: ${email}`);
    
    return {
      success: true,
      user: {
        email: email,
        nome: nome,
        setor: 'Sem Setor',
        permissao: CONFIG.PERMISSOES.USUARIO,
        ativo: 'Sim'
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao criar usuário automático: ' + error.message);
    return {
      success: false,
      error: error.message,
      user: null
    };
  }
}

/**
 * Verifica permissão do usuário (v6.0 - MELHORADO)
 */
function verificarPermissao(email, permissaoRequerida) {
  try {
    if (!email || !permissaoRequerida) {
      return false;
    }
    
    const contexto = getUserContext();
    
    if (!contexto.success || !contexto.user) {
      return false;
    }
    
    const usuario = contexto.user;
    
    // Hierarquia de permissões
    const hierarquia = {
      'ADMIN': 4,
      'GESTOR': 3,
      'USUARIO': 2,
      'VISUALIZADOR': 1
    };
    
    const nivelUsuario = hierarquia[usuario.permissao] || 0;
    const nivelRequerido = hierarquia[permissaoRequerida] || 0;
    
    return nivelUsuario >= nivelRequerido;
    
  } catch (error) {
    Logger.log('❌ Erro ao verificar permissão: ' + error.message);
    return false;
  }
}

/**
 * Lista todos os usuários (v6.0)
 */
function listarUsuarios(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return { success: false, error: 'Aba de usuários não encontrada' };
    }
    
    const dados = abaUsers.getDataRange().getValues();
    const usuarios = [];
    
    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias
      
      const usuario = {
        email: dados[i][0],
        nome: dados[i][1] || '',
        setor: dados[i][2] || '',
        permissao: dados[i][3] || CONFIG.PERMISSOES.USUARIO,
        ativo: dados[i][4] !== undefined ? dados[i][4] : 'Sim',
        dataCadastro: dados[i][5] || ''
      };
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.setor && usuario.setor !== filtros.setor) continue;
        if (filtros.permissao && usuario.permissao !== filtros.permissao) continue;
        if (filtros.ativo !== undefined && usuario.ativo !== filtros.ativo) continue;
      }
      
      usuarios.push(usuario);
    }
    
    return {
      success: true,
      usuarios: usuarios
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao listar usuários: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Adiciona novo usuário
 */
function adicionarUsuario(dadosUsuario) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão (somente admin pode adicionar)
    if (!verificarPermissao(email, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Somente administradores podem adicionar usuários.'
      };
    }
    
    // Validar dados obrigatórios
    if (!dadosUsuario.email || !dadosUsuario.nome) {
      return {
        success: false,
        error: 'Email e nome são obrigatórios'
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return { success: false, error: 'Aba de usuários não encontrada' };
    }
    
    // Verificar se usuário já existe
    const dados = abaUsers.getDataRange().getValues();
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === dadosUsuario.email) {
        return {
          success: false,
          error: 'Usuário já cadastrado'
        };
      }
    }
    
    // Adicionar usuário
    const novoUsuario = [
      dadosUsuario.email,
      dadosUsuario.nome,
      dadosUsuario.setor || 'Sem Setor',
      dadosUsuario.permissao || CONFIG.PERMISSOES.USUARIO,
      'Sim',
      new Date()
    ];
    
    abaUsers.appendRow(novoUsuario);
    
    // Registrar log
    registrarLog('USUARIO_ADICIONADO', `Usuário ${dadosUsuario.email} adicionado`, 'SUCESSO');
    
    return {
      success: true,
      message: 'Usuário adicionado com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao adicionar usuário: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza dados de um usuário
 */
function atualizarUsuario(email, dadosAtualizados) {
  try {
    const emailAtual = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(emailAtual, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Somente administradores podem atualizar usuários.'
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return { success: false, error: 'Aba de usuários não encontrada' };
    }
    
    const dados = abaUsers.getDataRange().getValues();
    
    // Procurar usuário
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === email) {
        // Atualizar dados
        if (dadosAtualizados.nome) {
          abaUsers.getRange(i + 1, 2).setValue(dadosAtualizados.nome);
        }
        if (dadosAtualizados.setor) {
          abaUsers.getRange(i + 1, 3).setValue(dadosAtualizados.setor);
        }
        if (dadosAtualizados.permissao) {
          abaUsers.getRange(i + 1, 4).setValue(dadosAtualizados.permissao);
        }
        if (dadosAtualizados.ativo !== undefined) {
          abaUsers.getRange(i + 1, 5).setValue(dadosAtualizados.ativo);
        }
        
        // Registrar log
        registrarLog('USUARIO_ATUALIZADO', `Usuário ${email} atualizado`, 'SUCESSO');
        
        return {
          success: true,
          message: 'Usuário atualizado com sucesso'
        };
      }
    }
    
    return {
      success: false,
      error: 'Usuário não encontrado'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao atualizar usuário: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove (desativa) um usuário
 */
function removerUsuario(email) {
  try {
    const emailAtual = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(emailAtual, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Somente administradores podem remover usuários.'
      };
    }
    
    // Não pode remover a si mesmo
    if (email === emailAtual) {
      return {
        success: false,
        error: 'Você não pode remover seu próprio usuário'
      };
    }
    
    return atualizarUsuario(email, { ativo: 'Não' });
    
  } catch (error) {
    Logger.log('❌ Erro ao remover usuário: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza uma configuração do sistema
 */
function atualizarConfiguracao(chave, valor) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Somente administradores podem atualizar configurações.'
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaConfig = ss.getSheetByName(CONFIG.ABAS.CONFIG);
    
    if (!abaConfig) {
      return { success: false, error: 'Aba de configurações não encontrada' };
    }
    
    const dados = abaConfig.getDataRange().getValues();
    
    // Procurar configuração
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === chave) {
        abaConfig.getRange(i + 1, 2).setValue(valor);
        abaConfig.getRange(i + 1, 4).setValue(new Date());
        
        // Registrar log
        registrarLog('CONFIG_ATUALIZADA', `Configuração ${chave} atualizada`, 'SUCESSO');
        
        return {
          success: true,
          message: 'Configuração atualizada com sucesso'
        };
      }
    }
    
    return {
      success: false,
      error: 'Configuração não encontrada'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao atualizar configuração: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém todas as configurações do sistema
 */
function obterTodasConfiguracoes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaConfig = ss.getSheetByName(CONFIG.ABAS.CONFIG);
    
    if (!abaConfig) {
      return { success: false, error: 'Aba de configurações não encontrada' };
    }
    
    const dados = abaConfig.getDataRange().getValues();
    const configuracoes = {};
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0]) {
        configuracoes[dados[i][0]] = {
          valor: dados[i][1],
          descricao: dados[i][2],
          ultimaAtualizacao: dados[i][3]
        };
      }
    }
    
    return {
      success: true,
      configuracoes: configuracoes
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao obter configurações: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
