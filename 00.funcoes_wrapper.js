/**
 * ========================================
 * WRAPPER FUNCTIONS - CORREÇÃO v6.0.2
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
 */

/**
 * Wrapper para listarPedidos
 */
function __listarPedidos(filtros) {
  try {
    Logger.log('🔄 __listarPedidos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarPedidos(filtros);
    Logger.log('📤 __listarPedidos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));

    // CRITICAL: Serializar todas as Dates para strings ISO
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
 * Wrapper para getDashboardData
 */
function __getDashboardData(filtros) {
  try {
    Logger.log('🔄 __getDashboardData chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getDashboardData(filtros);
    Logger.log('📤 __getDashboardData retornando: ' + (resultado ? 'objeto válido' : 'NULL'));

    // CRITICAL: Serializar todas as Dates para strings ISO
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
 * Wrapper para listarProdutos
 */
function __listarProdutos(filtros) {
  try {
    Logger.log('🔄 __listarProdutos chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = listarProdutos(filtros);
    Logger.log('📤 __listarProdutos retornando: ' + (resultado ? 'objeto válido' : 'NULL'));

    // CRITICAL: Serializar todas as Dates para strings ISO
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
 * Wrapper para getEstoqueAtual
 */
function __getEstoqueAtual(filtros) {
  try {
    Logger.log('🔄 __getEstoqueAtual chamado com filtros: ' + JSON.stringify(filtros));
    var resultado = getEstoqueAtual(filtros);
    Logger.log('📤 __getEstoqueAtual retornando: ' + (resultado ? 'objeto válido' : 'NULL'));

    // CRITICAL: Serializar todas as Dates para strings ISO
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
 * Teste simplificado que sempre retorna dados
 */
function testeRetornoSimples() {
  Logger.log('✅ testeRetornoSimples chamado');
  return {
    success: true,
    message: 'Função wrapper funcionando!',
    timestamp: new Date().toISOString() // Convertido para ISO string
  };
}
