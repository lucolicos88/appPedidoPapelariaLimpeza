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
 * Cache de usuários para otimizar buscas (NOVO v6.0.1)
 * Usando var para compatibilidade com Google Apps Script
 */
var CACHE_USUARIOS = CACHE_USUARIOS || {};
var CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém contexto do usuário atual (v6.0.1 - OTIMIZADO)
 */
function getUserContext() {
  try {
    const email = Session.getActiveUser().getEmail();

    // Validar email
    if (!email || !validarEmail(email)) {
      return {
        success: false,
        error: 'Email não identificado ou inválido',
        user: null
      };
    }

    // Verificar cache
    const agora = new Date().getTime();
    if (CACHE_USUARIOS[email] && (agora - CACHE_USUARIOS[email].timestamp < CACHE_TTL)) {
      Logger.log('✅ Usuário recuperado do cache: ' + email);
      return {
        success: true,
        user: CACHE_USUARIOS[email].data
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

    const lastRow = abaUsers.getLastRow();

    // Verificar se há dados além do cabeçalho
    if (lastRow < 2) {
      return criarUsuarioAutomatico(email);
    }

    const dados = abaUsers.getRange(2, 1, lastRow - 1, 6).getValues();

    if (!dados || dados.length === 0) {
      return criarUsuarioAutomatico(email);
    }

    // Procurar usuário
    let usuario = null;
    for (let i = 0; i < dados.length; i++) {
      if (dados[i][0] === email) {
        usuario = {
          email: String(dados[i][0] || email),
          nome: String(dados[i][1] || email.split('@')[0]),
          setor: String(dados[i][2] || 'Sem Setor'),
          permissao: String(dados[i][3] || CONFIG.PERMISSOES.USUARIO),
          ativo: dados[i][4] !== undefined ? String(dados[i][4]) : 'Sim'
        };
        break;
      }
    }

    // Se usuário não encontrado, criar automaticamente
    if (!usuario) {
      return criarUsuarioAutomatico(email);
    }

    // Verificar se está ativo
    if (usuario.ativo === 'Não' || usuario.ativo === 'false' || usuario.ativo === false) {
      return {
        success: false,
        error: 'Usuário inativo',
        user: null
      };
    }

    // Armazenar no cache
    CACHE_USUARIOS[email] = {
      data: usuario,
      timestamp: agora
    };

    return {
      success: true,
      user: usuario
    };

  } catch (error) {
    Logger.log('❌ Erro em getUserContext: ' + error.message);
    Logger.log(error.stack);

    // Em caso de erro, tentar criar usuário de emergência
    try {
      const email = Session.getActiveUser().getEmail();
      if (email && validarEmail(email)) {
        return criarUsuarioAutomatico(email);
      }
    } catch (e) {
      Logger.log('❌ Erro ao criar usuário de emergência: ' + e.message);
    }

    return {
      success: false,
      error: 'Erro crítico ao obter contexto: ' + error.message,
      user: null
    };
  }
}

/**
 * Obtém perfil do usuário (v10.1)
 */
function obterPerfilUsuario(email) {
  try {
    Logger.log('🔍 [v10.1] obterPerfilUsuario chamado para:', email);

    if (!email) {
      Logger.log('⚠️ [v10.1] Email não fornecido');
      return null;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);

    if (!abaUsers) {
      Logger.log('❌ [v10.1] Aba de usuários não encontrada');
      return null;
    }

    const dados = abaUsers.getDataRange().getValues();

    // Procurar usuário por email
    for (let i = 1; i < dados.length; i++) {
      const emailUsuario = dados[i][0]; // Coluna A - Email
      if (emailUsuario && emailUsuario.toLowerCase() === email.toLowerCase()) {
        const perfil = dados[i][3] || 'Usuario'; // Coluna D - Permissão (índice 3)
        Logger.log('✅ [v10.1] Perfil encontrado:', perfil, 'para', email);
        Logger.log('🔍 [v10.1] Dados da linha:', dados[i]);
        return perfil;
      }
    }

    Logger.log('⚠️ [v10.1] Usuário não encontrado:', email);
    return 'Usuario'; // Default

  } catch (error) {
    Logger.log('❌ [v10.1] Erro em obterPerfilUsuario:', error.message);
    return null;
  }
}

/**
 * Limpa cache de usuários (NOVO v6.0.1)
 */
function limparCacheUsuarios(email) {
  if (email) {
    delete CACHE_USUARIOS[email];
  } else {
    // Limpar todo o cache
    Object.keys(CACHE_USUARIOS).forEach(key => {
      delete CACHE_USUARIOS[key];
    });
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
    
    const nivelUsuario = hierarquia[usuario.permissao?.toUpperCase()] || 0;
    const nivelRequerido = hierarquia[permissaoRequerida?.toUpperCase()] || 0;
    
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
 * Atualiza dados de um usuário (v6.0.1 - OTIMIZADO)
 */
function atualizarUsuario(email, dadosAtualizados) {
  try {
    const emailAtual = Session.getActiveUser().getEmail();

    // Validar email
    if (!email || !validarEmail(email)) {
      return {
        success: false,
        error: 'Email inválido'
      };
    }

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

    const lastRow = abaUsers.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const dados = abaUsers.getRange(2, 1, lastRow - 1, 6).getValues();

    // Procurar usuário
    for (let i = 0; i < dados.length; i++) {
      if (dados[i][0] === email) {
        const linha = i + 2; // +2 porque: +1 para cabeçalho, +1 para índice de planilha

        // Atualizar dados com validação
        if (dadosAtualizados.nome && String(dadosAtualizados.nome).trim()) {
          abaUsers.getRange(linha, 2).setValue(String(dadosAtualizados.nome).trim());
        }
        if (dadosAtualizados.setor && String(dadosAtualizados.setor).trim()) {
          abaUsers.getRange(linha, 3).setValue(String(dadosAtualizados.setor).trim());
        }
        if (dadosAtualizados.permissao) {
          // Validar permissão
          const permissoesValidas = Object.values(CONFIG.PERMISSOES);
          if (permissoesValidas.includes(dadosAtualizados.permissao)) {
            abaUsers.getRange(linha, 4).setValue(dadosAtualizados.permissao);
          }
        }
        if (dadosAtualizados.ativo !== undefined) {
          const ativoValor = dadosAtualizados.ativo === true || dadosAtualizados.ativo === 'Sim' ? 'Sim' : 'Não';
          abaUsers.getRange(linha, 5).setValue(ativoValor);
        }

        // Limpar cache do usuário
        limparCacheUsuarios(email);

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
    Logger.log(error.stack);
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
