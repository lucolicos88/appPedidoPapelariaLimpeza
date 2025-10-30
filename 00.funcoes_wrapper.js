/**
 * ========================================
 * WRAPPER FUNCTIONS - CORREÇÃO v6.0.1
 * ========================================
 *
 * Estas funções servem como wrappers para garantir que
 * o google.script.run consiga chamar e receber dados corretamente.
 *
 * PROBLEMA IDENTIFICADO:
 * Quando o Apps Script serializa objetos complexos com const/let/var,
 * pode haver problemas de escopo. Estas funções simples garantem
 * que sempre há um retorno válido.
 */

/**
 * Wrapper para listarPedidos
 */
function __listarPedidos(filtros) {
  try {
    Logger.log('🔄 __listarPedidos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarPedidos(filtros);
    Logger.log('📤 __listarPedidos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    return resultado;
  } catch (e) {
    Logger.log('❌ Erro em __listarPedidos: ' + e.message);
    return {
      success: false,
      error: e.message,
      pedidos: []
    };
  }
}

/**
 * Wrapper para getDashboardData
 */
function __getDashboardData(filtros) {
  try {
    Logger.log('🔄 __getDashboardData chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getDashboardData(filtros);
    Logger.log('📤 __getDashboardData retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    return resultado;
  } catch (e) {
    Logger.log('❌ Erro em __getDashboardData: ' + e.message);
    return {
      success: false,
      error: e.message,
      kpis: {}
    };
  }
}

/**
 * Wrapper para listarProdutos
 */
function __listarProdutos(filtros) {
  try {
    Logger.log('🔄 __listarProdutos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarProdutos(filtros);
    Logger.log('📤 __listarProdutos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    return resultado;
  } catch (e) {
    Logger.log('❌ Erro em __listarProdutos: ' + e.message);
    return {
      success: false,
      error: e.message,
      produtos: []
    };
  }
}

/**
 * Wrapper para getEstoqueAtual
 */
function __getEstoqueAtual(filtros) {
  try {
    Logger.log('🔄 __getEstoqueAtual chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getEstoqueAtual(filtros);
    Logger.log('📤 __getEstoqueAtual retornando: ' + (resultado ? 'objeto válido' : 'NULL'));
    return resultado;
  } catch (e) {
    Logger.log('❌ Erro em __getEstoqueAtual: ' + e.message);
    return {
      success: false,
      error: e.message,
      estoque: []
    };
  }
}

/**
 * Teste simplificado que sempre retorna dados
 */
function testeRetornoSimples() {
  Logger.log('✅ testeRetornoSimples chamado');
  return {
    success: true,
    message: 'Função wrapper funcionando!',
    timestamp: new Date().toString()
  };
}
