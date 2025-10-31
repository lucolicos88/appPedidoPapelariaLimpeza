/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * ADIÇÕES AO ARQUIVO: 00.funcoes_wrapper.js
 * ========================================
 *
 * INSTRUÇÕES:
 * 1. Abra o arquivo existente "00.funcoes_wrapper" no Apps Script
 * 2. Role até o final do arquivo
 * 3. Cole TODO o conteúdo abaixo ANTES da última chave de fechamento }
 * 4. Salve o arquivo (Ctrl+S)
 */

/**
 * Wrapper para upload de imagem
 */
function __uploadImagemDrive(base64, fileName, mimeType) {
  try {
    Logger.log('🔄 __uploadImagemDrive chamado');
    var resultado = uploadImagemDrive(base64, fileName, mimeType);
    Logger.log('📤 Upload resultado: ' + (resultado.success ? 'sucesso' : 'falha'));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __uploadImagemDrive: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para deletar imagem
 */
function __deletarImagemDrive(fileIdOrUrl) {
  try {
    Logger.log('🔄 __deletarImagemDrive chamado: ' + fileIdOrUrl);
    var resultado = deletarImagemDrive(fileIdOrUrl);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __deletarImagemDrive: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para atualizar imagem de produto
 */
function __atualizarImagemProduto(imagemUrlAntiga, base64Nova, fileName, mimeType) {
  try {
    Logger.log('🔄 __atualizarImagemProduto chamado');
    var resultado = atualizarImagemProduto(imagemUrlAntiga, base64Nova, fileName, mimeType);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __atualizarImagemProduto: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para dar baixa em pedido (v8.0)
 */
function __darBaixaPedido(pedidoId) {
  try {
    Logger.log('🔄 __darBaixaPedido chamado com ID: ' + pedidoId);
    var resultado = darBaixaPedido(pedidoId);
    Logger.log('📤 Baixa resultado: ' + (resultado.success ? 'sucesso' : 'falha'));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __darBaixaPedido: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para buscar pedido por ID
 */
function __getPedidoById(pedidoId) {
  try {
    Logger.log('🔄 __getPedidoById chamado: ' + pedidoId);
    var resultado = getPedidoById(pedidoId);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getPedidoById: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para gerar relatório
 */
function __getRelatorio(tipo, periodo) {
  try {
    Logger.log('🔄 __getRelatorio chamado: tipo=' + tipo + ', periodo=' + periodo);
    var resultado = getRelatorio(tipo, periodo);
    Logger.log('📤 Relatório gerado: ' + (resultado.success ? 'sucesso' : 'falha'));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getRelatorio: ' + e.message);
    return {
      success: false,
      error: e.message,
      tipo: tipo
    };
  }
}

/**
 * Wrapper para análise de produtos (corrigido v8.0)
 */
function __getAnaliseProdutos() {
  try {
    Logger.log('🔄 __getAnaliseProdutos chamado');

    // Verificar se função existe
    if (typeof getAnaliseProdutos !== 'function') {
      Logger.log('⚠️ Função getAnaliseProdutos não encontrada, retornando dados vazios');
      return {
        success: true,
        analise: {
          totalProdutos: 0,
          produtosEmAlerta: [],
          valorTotalEstoque: 0
        }
      };
    }

    var resultado = getAnaliseProdutos();

    // Garantir que não retorna null
    if (!resultado) {
      Logger.log('⚠️ getAnaliseProdutos retornou null, usando fallback');
      return {
        success: true,
        analise: {
          totalProdutos: 0,
          produtosEmAlerta: [],
          valorTotalEstoque: 0
        }
      };
    }

    Logger.log('📤 Análise retornada com sucesso');
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getAnaliseProdutos: ' + e.message);
    return {
      success: false,
      error: e.message,
      analise: {
        totalProdutos: 0,
        produtosEmAlerta: [],
        valorTotalEstoque: 0
      }
    };
  }
}

/**
 * Wrapper para buscar usuários (corrigido v8.0)
 */
function __getUsuarios() {
  try {
    Logger.log('🔄 __getUsuarios chamado');

    // Verificar se função existe
    if (typeof getUsuarios !== 'function') {
      Logger.log('⚠️ Função getUsuarios não encontrada, retornando lista vazia');
      return {
        success: true,
        usuarios: []
      };
    }

    var resultado = getUsuarios();

    if (!resultado) {
      return {
        success: true,
        usuarios: []
      };
    }

    Logger.log('📤 Usuários retornados: ' + (resultado.usuarios ? resultado.usuarios.length : 0));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getUsuarios: ' + e.message);
    return {
      success: false,
      error: e.message,
      usuarios: []
    };
  }
}

/**
 * Wrapper para salvar configurações de sistema
 */
function __salvarConfigSistema(config) {
  try {
    Logger.log('🔄 __salvarConfigSistema chamado');
    var resultado = salvarConfigSistema(config);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __salvarConfigSistema: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para buscar configurações de sistema
 */
function __getConfigSistema() {
  try {
    Logger.log('🔄 __getConfigSistema chamado');
    var resultado = getConfigSistema();
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getConfigSistema: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para exportar relatório para Excel/CSV
 */
function __exportarRelatorio(tipo, periodo, formato) {
  try {
    Logger.log('🔄 __exportarRelatorio chamado: ' + tipo);
    var resultado = exportarRelatorio(tipo, periodo, formato);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __exportarRelatorio: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para buscar produtos (usado na busca da aba Solicitação)
 */
function __buscarProdutos(termo, tipo) {
  try {
    Logger.log('🔄 __buscarProdutos chamado: ' + termo);
    var resultado = buscarProdutos(termo, tipo);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __buscarProdutos: ' + e.message);
    return {
      success: false,
      error: e.message,
      produtos: []
    };
  }
}

/**
 * Wrapper para obter histórico de solicitações do usuário
 */
function __getMinhasSolicitacoes(email) {
  try {
    Logger.log('🔄 __getMinhasSolicitacoes chamado: ' + email);
    var resultado = getMinhasSolicitacoes(email);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __getMinhasSolicitacoes: ' + e.message);
    return {
      success: false,
      error: e.message,
      pedidos: []
    };
  }
}
