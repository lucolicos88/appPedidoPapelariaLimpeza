/**
 * ARQUIVO DE TESTE E DEBUG
 * Execute essas funções no Google Apps Script para identificar o problema
 */

/**
 * Teste 1: Verificar se o CONFIG está carregado
 */
function teste_01_VerificarCONFIG() {
  try {
    Logger.log('=== TESTE 1: Verificar CONFIG ===');

    if (typeof CONFIG === 'undefined') {
      Logger.log('❌ CONFIG não está definido!');
      Logger.log('SOLUÇÃO: Certifique-se que 01.setup.js foi carregado primeiro');
      return false;
    }

    Logger.log('✅ CONFIG está definido');
    Logger.log('Versão: ' + CONFIG.VERSAO);
    Logger.log('Abas: ' + JSON.stringify(CONFIG.ABAS));
    return true;

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 2: Verificar getUserContext
 */
function teste_02_GetUserContext() {
  try {
    Logger.log('=== TESTE 2: getUserContext ===');

    const resultado = getUserContext();
    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado && resultado.success) {
      Logger.log('✅ getUserContext funciona');
      Logger.log('Usuário: ' + resultado.user.email);
      return true;
    } else {
      Logger.log('❌ getUserContext retornou erro');
      Logger.log('Erro: ' + resultado.error);
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 3: Verificar listarPedidos
 */
function teste_03_ListarPedidos() {
  try {
    Logger.log('=== TESTE 3: listarPedidos ===');

    const resultado = listarPedidos(null);
    Logger.log('Tipo do resultado: ' + typeof resultado);

    if (resultado === null || resultado === undefined) {
      Logger.log('❌ listarPedidos retornou null/undefined');
      Logger.log('PROBLEMA: Função pode ter erro de sintaxe ou não está definida');
      return false;
    }

    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado.success) {
      Logger.log('✅ listarPedidos funciona');
      Logger.log('Pedidos encontrados: ' + resultado.pedidos.length);
      return true;
    } else {
      Logger.log('⚠️ listarPedidos retornou erro');
      Logger.log('Erro: ' + resultado.error);
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 4: Verificar getDashboardData
 */
function teste_04_GetDashboardData() {
  try {
    Logger.log('=== TESTE 4: getDashboardData ===');

    const resultado = getDashboardData(null);
    Logger.log('Tipo do resultado: ' + typeof resultado);

    if (resultado === null || resultado === undefined) {
      Logger.log('❌ getDashboardData retornou null/undefined');
      return false;
    }

    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado.success) {
      Logger.log('✅ getDashboardData funciona');
      return true;
    } else {
      Logger.log('⚠️ getDashboardData retornou erro');
      Logger.log('Erro: ' + resultado.error);
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 5: Verificar listarProdutos
 */
function teste_05_ListarProdutos() {
  try {
    Logger.log('=== TESTE 5: listarProdutos ===');

    const resultado = listarProdutos(null);
    Logger.log('Tipo do resultado: ' + typeof resultado);

    if (resultado === null || resultado === undefined) {
      Logger.log('❌ listarProdutos retornou null/undefined');
      return false;
    }

    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado.success) {
      Logger.log('✅ listarProdutos funciona');
      Logger.log('Produtos encontrados: ' + resultado.produtos.length);
      return true;
    } else {
      Logger.log('⚠️ listarProdutos retornou erro');
      Logger.log('Erro: ' + resultado.error);
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 6: Verificar getEstoqueAtual
 */
function teste_06_GetEstoqueAtual() {
  try {
    Logger.log('=== TESTE 6: getEstoqueAtual ===');

    const resultado = getEstoqueAtual(null);
    Logger.log('Tipo do resultado: ' + typeof resultado);

    if (resultado === null || resultado === undefined) {
      Logger.log('❌ getEstoqueAtual retornou null/undefined');
      return false;
    }

    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado.success) {
      Logger.log('✅ getEstoqueAtual funciona');
      Logger.log('Itens encontrados: ' + resultado.estoque.length);
      return true;
    } else {
      Logger.log('⚠️ getEstoqueAtual retornou erro');
      Logger.log('Erro: ' + resultado.error);
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Teste 7: Verificar getInitialData
 */
function teste_07_GetInitialData() {
  try {
    Logger.log('=== TESTE 7: getInitialData ===');

    const resultado = getInitialData();
    Logger.log('Tipo do resultado: ' + typeof resultado);

    if (resultado === null || resultado === undefined) {
      Logger.log('❌ getInitialData retornou null/undefined');
      Logger.log('PROBLEMA CRÍTICO: Esta função é a primeira chamada do frontend');
      return false;
    }

    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));

    if (resultado.success || resultado.data) {
      Logger.log('✅ getInitialData funciona');
      return true;
    } else {
      Logger.log('⚠️ getInitialData tem estrutura inesperada');
      return false;
    }

  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * EXECUTAR TODOS OS TESTES
 */
function executarTodosOsTestes() {
  Logger.log('╔═══════════════════════════════════════════╗');
  Logger.log('║   INICIANDO BATERIA DE TESTES - v6.0.1   ║');
  Logger.log('╚═══════════════════════════════════════════╝');
  Logger.log('');

  const testes = [
    { nome: 'CONFIG', funcao: teste_01_VerificarCONFIG },
    { nome: 'getUserContext', funcao: teste_02_GetUserContext },
    { nome: 'listarPedidos', funcao: teste_03_ListarPedidos },
    { nome: 'getDashboardData', funcao: teste_04_GetDashboardData },
    { nome: 'listarProdutos', funcao: teste_05_ListarProdutos },
    { nome: 'getEstoqueAtual', funcao: teste_06_GetEstoqueAtual },
    { nome: 'getInitialData', funcao: teste_07_GetInitialData }
  ];

  let passaram = 0;
  let falharam = 0;

  testes.forEach((teste, index) => {
    Logger.log('');
    Logger.log('─────────────────────────────────────────');

    const passou = teste.funcao();

    if (passou) {
      passaram++;
    } else {
      falharam++;
    }

    Logger.log('─────────────────────────────────────────');
  });

  Logger.log('');
  Logger.log('╔═══════════════════════════════════════════╗');
  Logger.log('║         RESUMO DOS TESTES                 ║');
  Logger.log('╠═══════════════════════════════════════════╣');
  Logger.log('║  ✅ Passaram: ' + passaram + '                            ║');
  Logger.log('║  ❌ Falharam: ' + falharam + '                            ║');
  Logger.log('╚═══════════════════════════════════════════╝');

  if (falharam === 0) {
    Logger.log('');
    Logger.log('🎉 TODOS OS TESTES PASSARAM!');
    Logger.log('O problema está no frontend (Index.html) ou na comunicação.');
  } else {
    Logger.log('');
    Logger.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

/**
 * Teste simples que sempre funciona
 */
function testeSimples() {
  Logger.log('✅ Se você vê esta mensagem, o Apps Script está funcionando!');
  Logger.log('Data/Hora: ' + new Date());
  return 'Teste OK';
}
