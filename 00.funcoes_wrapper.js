/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * WRAPPER FUNCTIONS CONSOLIDADAS
 * ========================================
 *
 * Estas funções servem como wrappers para garantir que
 * o google.script.run consiga chamar e receber dados corretamente.
 *
 * PROBLEMA IDENTIFICADO v6.0.2:
 * O google.script.run NÃO serializa objetos Date corretamente!
 * Quando há objetos Date nas propriedades, retorna NULL para o frontend.
 *
 * SOLUÇÃO: Usar serializarParaFrontend() para converter Date em ISO strings.
 *
 * v8.0: Consolidado com 21 funções wrapper
 */

// ========================================
// PEDIDOS
// ========================================

/**
 * Wrapper para listarPedidos
 */
function __listarPedidos(filtros) {
  try {
    Logger.log('🔄 __listarPedidos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarPedidos(filtros);
    Logger.log('📤 __listarPedidos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __listarPedidos: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      pedidos: []
    };
  }
}

/**
 * Wrapper para getDetalhesPedido
 */
function __getDetalhesPedido(pedidoId) {
  try {
    Logger.log('🔄 __getDetalhesPedido chamado com ID: ' + pedidoId);
    var resultado = getDetalhesPedido(pedidoId);
    Logger.log('📤 __getDetalhesPedido retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __getDetalhesPedido: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      pedido: null
    };
  }
}

/**
 * Wrapper para buscar pedido por ID (v8.0)
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
 * Wrapper para atualizar status do pedido (v9.0 - apenas Admin/Gestor)
 */
function __atualizarStatusPedido(pedidoId, novoStatus, observacoes) {
  try {
    Logger.log(`🔄 [v10.1] __atualizarStatusPedido chamado: ${pedidoId} -> ${novoStatus}`);
    if (observacoes) {
      Logger.log(`📝 [v10.1] Observações: ${observacoes}`);
    }

    // Verificar permissões - CASE INSENSITIVE (v10.1)
    const userEmail = Session.getActiveUser().getEmail();
    Logger.log(`📧 [v10.1] Email do usuário: ${userEmail}`);

    const perfil = obterPerfilUsuario(userEmail);
    Logger.log(`👤 [v10.1] Perfil retornado: ${perfil}`);

    const perfilUpper = (perfil || '').toUpperCase();
    Logger.log(`🔠 [v10.1] Perfil uppercase: ${perfilUpper}`);

    if (perfilUpper !== 'ADMIN' && perfilUpper !== 'GESTOR') {
      Logger.log(`❌ [v10.1] Permissão negada para perfil: ${perfilUpper}`);
      return {
        success: false,
        error: 'Você não tem permissão para alterar o status de pedidos'
      };
    }

    Logger.log(`✅ [v10.1] Permissão concedida para perfil: ${perfilUpper}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);

    if (!abaPedidos) {
      return {
        success: false,
        error: 'Aba de pedidos não encontrada'
      };
    }

    const dados = abaPedidos.getDataRange().getValues();

    // Procurar pedido
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PEDIDOS.ID - 1] === pedidoId) {
        // Atualizar status
        abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.STATUS).setValue(novoStatus);

        // Atualizar data de compra se status = "Em Compra"
        if (novoStatus === 'Em Compra' && !dados[i][CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA - 1]) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA).setValue(new Date());
        }

        // Atualizar data de finalização se status = "Finalizado"
        if (novoStatus === 'Finalizado' && !dados[i][CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO - 1]) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO).setValue(new Date());
        }

        // v10.1: Registrar log com observações se fornecidas
        const logMsg = observacoes
          ? `Pedido ${dados[i][CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1]} -> ${novoStatus} | Obs: ${observacoes}`
          : `Pedido ${dados[i][CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1]} -> ${novoStatus}`;
        registrarLog('STATUS_PEDIDO_ATUALIZADO', logMsg, 'SUCESSO');

        return {
          success: true,
          message: 'Status atualizado com sucesso'
        };
      }
    }

    return {
      success: false,
      error: 'Pedido não encontrado'
    };

  } catch (e) {
    Logger.log('❌ Erro em __atualizarStatusPedido: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para obter histórico de solicitações do usuário (v8.0)
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

// ========================================
// PRODUTOS
// ========================================

/**
 * Wrapper para listarProdutos
 */
function __listarProdutos(filtros) {
  try {
    Logger.log('🔄 __listarProdutos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarProdutos(filtros);
    Logger.log('📤 __listarProdutos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __listarProdutos: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      produtos: []
    };
  }
}

/**
 * Wrapper para buscarProduto
 */
function __buscarProduto(produtoId) {
  try {
    Logger.log('🔄 __buscarProduto chamado com ID: ' + produtoId);
    var resultado = buscarProduto(produtoId);
    Logger.log('📤 __buscarProduto retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __buscarProduto: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      produto: null
    };
  }
}

/**
 * Wrapper para buscar produtos (usado na busca da aba Solicitação) (v8.0)
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
 * Wrapper para obter catálogo de produtos com estoque (v9.0)
 * Usado no novo modal de pedidos com catálogo visual
 */
function __obterCatalogoProdutosComEstoque() {
  try {
    Logger.log('🔄 __obterCatalogoProdutosComEstoque chamado (v9.0)');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

    if (!abaProdutos) {
      return {
        success: false,
        error: 'Aba de produtos não encontrada',
        produtos: [],
        estoque: {}
      };
    }

    // Listar produtos ativos
    const resultadoProdutos = listarProdutos({ ativo: 'Sim' });
    if (!resultadoProdutos.success) {
      return resultadoProdutos;
    }

    // Obter dados de estoque
    const estoqueMap = {};
    if (abaEstoque) {
      const dadosEstoque = abaEstoque.getDataRange().getValues();
      for (let i = 1; i < dadosEstoque.length; i++) {
        if (!dadosEstoque[i][0]) continue;

        const produtoId = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1];
        const qtdAtual = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
        const qtdReservada = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_RESERVADA - 1] || 0;
        const qtdDisponivel = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL - 1] || 0;

        estoqueMap[produtoId] = {
          qtdAtual: qtdAtual,
          qtdReservada: qtdReservada,
          qtdDisponivel: qtdDisponivel
        };
      }
    }

    Logger.log(`✅ Catálogo carregado: ${resultadoProdutos.produtos.length} produtos, ${Object.keys(estoqueMap).length} com estoque`);

    return serializarParaFrontend({
      success: true,
      produtos: resultadoProdutos.produtos,
      estoque: estoqueMap
    });

  } catch (e) {
    Logger.log('❌ Erro em __obterCatalogoProdutosComEstoque: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      produtos: [],
      estoque: {}
    };
  }
}

// ========================================
// ESTOQUE
// ========================================

/**
 * Wrapper para getEstoqueAtual
 */
function __getEstoqueAtual(filtros) {
  try {
    Logger.log('🔄 __getEstoqueAtual chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getEstoqueAtual(filtros);
    Logger.log('📤 __getEstoqueAtual retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __getEstoqueAtual: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      estoque: []
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

// ========================================
// DASHBOARD
// ========================================

/**
 * Wrapper para getDashboardData (básico)
 */
function __getDashboardData(filtros) {
  try {
    Logger.log('🔄 __getDashboardData chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getDashboardData(filtros);
    Logger.log('📤 __getDashboardData retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __getDashboardData: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      kpis: {}
    };
  }
}

/**
 * Wrapper para getDashboardAvancado (v7.0+)
 */
function __getDashboardAvancado(filtros) {
  try {
    Logger.log('🔄 __getDashboardAvancado chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getDashboardAvancado(filtros);
    Logger.log('📤 __getDashboardAvancado retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __getDashboardAvancado: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      kpis: {
        financeiros: {},
        logisticos: {},
        estoque: {}
      }
    };
  }
}

// ========================================
// RELATÓRIOS (v8.0)
// ========================================

/**
 * Wrapper para gerar relatório (v8.0)
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
 * Wrapper para exportar relatório para Excel/CSV (v8.0)
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

// ========================================
// UPLOAD DE IMAGENS (v8.0)
// ========================================

/**
 * Wrapper para upload de imagem (v8.0)
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
 * Wrapper para deletar imagem (v8.0)
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
 * Wrapper para atualizar imagem de produto (v8.0)
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
 * Wrapper para atualizar produto (v10.1)
 * Aceita objeto com id e dados, chama atualizarProdutoCore do módulo 03
 */
function atualizarProduto(dadosProduto) {
  try {
    Logger.log('🔄 [v10.1] atualizarProduto wrapper chamado para ID: ' + dadosProduto.id);

    if (!dadosProduto || !dadosProduto.id) {
      return {
        success: false,
        error: 'ID do produto não fornecido'
      };
    }

    const produtoId = dadosProduto.id;
    const dadosAtualizados = {
      codigo: dadosProduto.codigo,
      nome: dadosProduto.nome,
      tipo: dadosProduto.tipo,
      categoria: dadosProduto.categoria,
      unidade: dadosProduto.unidade,
      precoUnitario: dadosProduto.precoUnitario,
      estoqueMinimo: dadosProduto.estoqueMinimo,
      pontoPedido: dadosProduto.pontoPedido,
      fornecedor: dadosProduto.fornecedor,
      imagemBase64: dadosProduto.imagemBase64,
      imagemFileName: dadosProduto.imagemFileName,
      imagemMimeType: dadosProduto.imagemMimeType
    };

    // Chamar função original do módulo 03 com 2 parâmetros
    const resultado = atualizarProdutoCore(produtoId, dadosAtualizados);
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em atualizarProduto wrapper: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

// ========================================
// DADOS FICTÍCIOS (v8.0)
// ========================================

/**
 * Wrapper para inserir dados fictícios
 */
function __inserirDadosFicticios() {
  try {
    Logger.log('🔄 __inserirDadosFicticios chamado');
    var resultado = inserirDadosFicticios();
    Logger.log('📤 Inserção resultado: ' + (resultado.sucesso ? 'sucesso' : 'falha'));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __inserirDadosFicticios: ' + e.message);
    return {
      sucesso: false,
      erro: e.message,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0,
      erros: [e.message]
    };
  }
}

/**
 * Wrapper para limpar dados fictícios
 */
function __limparDadosFicticios() {
  try {
    Logger.log('🔄 __limparDadosFicticios chamado');
    var resultado = limparDadosFicticios();
    Logger.log('📤 Limpeza resultado: ' + (resultado.sucesso ? 'sucesso' : 'falha'));
    return serializarParaFrontend(resultado);
  } catch (e) {
    Logger.log('❌ Erro em __limparDadosFicticios: ' + e.message);
    return {
      sucesso: false,
      erro: e.message,
      pedidos: 0,
      produtos: 0,
      estoque: 0,
      movimentacoes: 0
    };
  }
}

// ========================================
// CONFIGURAÇÕES
// ========================================

/**
 * Wrapper para getConfig (Configurações)
 */
function __getConfig() {
  try {
    Logger.log('🔄 __getConfig chamado');
    var resultado = getConfig();
    Logger.log('📤 __getConfig retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __getConfig: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      config: null
    };
  }
}

/**
 * Wrapper para obterTodasConfiguracoes
 */
function __obterTodasConfiguracoes() {
  try {
    Logger.log('🔄 __obterTodasConfiguracoes chamado');
    var resultado = obterTodasConfiguracoes();
    Logger.log('📤 __obterTodasConfiguracoes retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    var resultadoSerializado = serializarParaFrontend(resultado);
    Logger.log('✅ Objeto serializado com sucesso');
    return resultadoSerializado;
  } catch (e) {
    Logger.log('❌ Erro em __obterTodasConfiguracoes: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message,
      configuracoes: null
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
 * Wrapper para salvar configurações de sistema (v8.0)
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
 * Wrapper para buscar configurações de sistema (v8.0)
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

// ========================================
// TESTE
// ========================================

/**
 * Teste simplificado que sempre retorna dados
 */
function testeRetornoSimples() {
  Logger.log('✅ testeRetornoSimples chamado');
  return {
    success: true,
    message: 'Função wrapper funcionando!',
    timestamp: new Date().toISOString(),
    totalWrappers: 24,
    versao: '10.0'
  };
}

// ========================================
// NOVOS WRAPPERS v10.0
// ========================================

/**
 * Wrapper para listar usuários (v10.0)
 */
function __listarUsuarios() {
  try {
    Logger.log('👥 __listarUsuarios chamado');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsuarios = ss.getSheetByName(CONFIG.ABAS.USERS);

    if (!abaUsuarios) {
      return {
        success: false,
        error: 'Aba de usuários não encontrada',
        usuarios: []
      };
    }

    const dados = abaUsuarios.getDataRange().getValues();
    const usuarios = [];

    // Assumindo estrutura: Email | Nome | Setor | Perfil/Permissão | Ativo
    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias

      usuarios.push({
        email: dados[i][0],
        nome: dados[i][1] || dados[i][0].split('@')[0],
        setor: dados[i][2] || 'Sem Setor',
        permissao: dados[i][3] || 'Funcionario',
        perfil: dados[i][3] || 'Funcionario',
        ativo: dados[i][4] !== undefined ? dados[i][4] : 'Sim'
      });
    }

    Logger.log(`✅ ${usuarios.length} usuários encontrados`);

    return {
      success: true,
      usuarios: usuarios
    };

  } catch (error) {
    Logger.log('❌ Erro em __listarUsuarios: ' + error.message);
    return {
      success: false,
      error: error.message,
      usuarios: []
    };
  }
}

/**
 * Wrapper para buscar pedido por ID (v10.1)
 * Usado para edição completa de pedidos
 */
function __buscarPedidoPorId(pedidoId) {
  try {
    Logger.log('🔍 [v10.1] __buscarPedidoPorId chamado: ' + pedidoId);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);

    if (!abaPedidos) {
      return {
        success: false,
        error: 'Aba de pedidos não encontrada'
      };
    }

    const dados = abaPedidos.getDataRange().getValues();

    // Procurar pedido por ID
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PEDIDOS.ID - 1] === pedidoId) {
        const pedido = {
          id: dados[i][CONFIG.COLUNAS_PEDIDOS.ID - 1],
          numeroPedido: dados[i][CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1],
          tipo: dados[i][CONFIG.COLUNAS_PEDIDOS.TIPO - 1],
          dataSolicitacao: dados[i][CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1],
          solicitanteEmail: dados[i][CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1],
          solicitanteNome: dados[i][CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_NOME - 1],
          setor: dados[i][CONFIG.COLUNAS_PEDIDOS.SETOR - 1],
          status: dados[i][CONFIG.COLUNAS_PEDIDOS.STATUS - 1],
          prazoEntrega: dados[i][CONFIG.COLUNAS_PEDIDOS.PRAZO_ENTREGA - 1],
          observacoes: dados[i][CONFIG.COLUNAS_PEDIDOS.OBSERVACOES - 1],
          produtos: [],
          valorTotal: dados[i][CONFIG.COLUNAS_PEDIDOS.VALOR_TOTAL - 1] || 0
        };

        // Buscar produtos do pedido
        const produtosJson = dados[i][CONFIG.COLUNAS_PEDIDOS.PRODUTOS_JSON - 1];
        if (produtosJson) {
          try {
            pedido.produtos = JSON.parse(produtosJson);
          } catch (e) {
            Logger.log('⚠️ Erro ao parsear produtos JSON: ' + e.message);
            pedido.produtos = [];
          }
        }

        Logger.log('✅ Pedido encontrado: ' + pedido.numeroPedido);

        return serializarParaFrontend({
          success: true,
          data: pedido
        });
      }
    }

    return {
      success: false,
      error: 'Pedido não encontrado'
    };

  } catch (e) {
    Logger.log('❌ Erro em __buscarPedidoPorId: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para atualizar pedido completo (v10.1)
 * Admin/Gestor podem editar qualquer pedido
 * Usuário comum só pode editar seus próprios pedidos
 */
function __atualizarPedido(dadosPedido) {
  try {
    Logger.log('💾 [v10.1] __atualizarPedido chamado para ID: ' + dadosPedido.id);

    if (!dadosPedido || !dadosPedido.id) {
      return {
        success: false,
        error: 'ID do pedido não fornecido'
      };
    }

    // Verificar permissões
    const userEmail = Session.getActiveUser().getEmail();
    const perfil = obterPerfilUsuario(userEmail);
    const perfilUpper = (perfil || '').toUpperCase();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);

    if (!abaPedidos) {
      return {
        success: false,
        error: 'Aba de pedidos não encontrada'
      };
    }

    const dados = abaPedidos.getDataRange().getValues();

    // Procurar pedido e verificar permissão
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PEDIDOS.ID - 1] === dadosPedido.id) {
        const pedidoEmail = dados[i][CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1];

        // Verificar permissão: Admin/Gestor OU criador do pedido
        const isAdminOuGestor = (perfilUpper === 'ADMIN' || perfilUpper === 'GESTOR');
        const isCriador = (pedidoEmail === userEmail);

        if (!isAdminOuGestor && !isCriador) {
          Logger.log(`❌ Permissão negada para ${userEmail} (perfil: ${perfilUpper}, criador: ${pedidoEmail})`);
          return {
            success: false,
            error: 'Você não tem permissão para editar este pedido'
          };
        }

        Logger.log(`✅ Permissão concedida para ${userEmail}`);

        // Atualizar campos
        if (dadosPedido.tipo) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.TIPO).setValue(dadosPedido.tipo);
        }

        if (dadosPedido.setor) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.SETOR).setValue(dadosPedido.setor);
        }

        if (dadosPedido.status) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.STATUS).setValue(dadosPedido.status);

          // Atualizar data de compra se status = "Em Compra"
          if (dadosPedido.status === 'Em Compra' && !dados[i][CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA - 1]) {
            abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA).setValue(new Date());
          }

          // Atualizar data de finalização se status = "Concluído"
          if (dadosPedido.status === 'Concluído' && !dados[i][CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO - 1]) {
            abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO).setValue(new Date());
          }
        }

        if (dadosPedido.prazoEntrega) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.PRAZO_ENTREGA).setValue(dadosPedido.prazoEntrega);
        }

        if (dadosPedido.observacoes !== undefined) {
          abaPedidos.getRange(i + 1, CONFIG.COLUNAS_PEDIDOS.OBSERVACOES).setValue(dadosPedido.observacoes);
        }

        // Registrar log
        const numeroPedido = dados[i][CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1];
        registrarLog('PEDIDO_ATUALIZADO', `Pedido ${numeroPedido} atualizado por ${userEmail}`, 'SUCESSO');

        Logger.log(`✅ Pedido ${numeroPedido} atualizado com sucesso`);

        return {
          success: true,
          message: 'Pedido atualizado com sucesso'
        };
      }
    }

    return {
      success: false,
      error: 'Pedido não encontrado'
    };

  } catch (e) {
    Logger.log('❌ Erro em __atualizarPedido: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Wrapper para exportar produtos em CSV (v10.0)
 */
function __exportarProdutosCSV() {
  try {
    Logger.log('📥 __exportarProdutosCSV chamado');

    const resultado = listarProdutos({});

    if (!resultado.success) {
      return {
        success: false,
        error: resultado.error
      };
    }

    const produtos = resultado.produtos || [];

    if (produtos.length === 0) {
      return {
        success: false,
        error: 'Nenhum produto encontrado para exportar'
      };
    }

    // Cabeçalho CSV
    let csv = 'ID,Código,Nome,Tipo,Categoria,Unidade,Preço Unitário,Estoque Mínimo,Ponto de Pedido,Fornecedor,Ativo\n';

    // Linhas de dados
    produtos.forEach(function(produto) {
      csv += [
        produto.id || '',
        produto.codigo || '',
        '"' + (produto.nome || '').replace(/"/g, '""') + '"', // Escapar aspas
        produto.tipo || '',
        produto.categoria || '',
        produto.unidade || '',
        (produto.precoUnitario || 0).toString().replace('.', ','),
        produto.estoqueMinimo || 0,
        produto.pontoPedido || 0,
        '"' + (produto.fornecedor || '').replace(/"/g, '""') + '"',
        produto.ativo || 'Sim'
      ].join(',') + '\n';
    });

    Logger.log(`✅ CSV gerado com ${produtos.length} produtos`);

    return {
      success: true,
      csv: csv,
      totalProdutos: produtos.length
    };

  } catch (error) {
    Logger.log('❌ Erro em __exportarProdutosCSV: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
