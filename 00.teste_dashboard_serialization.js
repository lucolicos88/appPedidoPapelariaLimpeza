/**
 * ========================================
 * TESTE DE SERIALIZAÇÃO DO DASHBOARD v15.1
 * ========================================
 *
 * Execute esta função no Apps Script para identificar
 * qual parte do dashboard está causando problemas de serialização
 */

function testarSerializacaoDashboard() {
  Logger.log('🧪 INICIANDO TESTE DE SERIALIZAÇÃO DO DASHBOARD');
  Logger.log('================================================');

  try {
    // 1. Chamar getDashboardAvancado
    Logger.log('1️⃣ Chamando getDashboardAvancado()...');
    const resultado = getDashboardAvancado({});

    if (!resultado) {
      Logger.log('❌ getDashboardAvancado retornou NULL');
      return;
    }

    if (!resultado.success) {
      Logger.log('❌ getDashboardAvancado retornou erro: ' + resultado.error);
      return;
    }

    Logger.log('✅ getDashboardAvancado retornou com sucesso');

    // 2. Testar JSON.stringify de cada seção
    Logger.log('\n2️⃣ Testando serialização de cada seção...');

    // 2.1 Financeiros
    try {
      const financeirosJson = JSON.stringify(resultado.kpis.financeiros);
      Logger.log('✅ Financeiros: ' + financeirosJson.length + ' bytes');

      // Verificar se tem Date objects
      verificarDateObjects(resultado.kpis.financeiros, 'financeiros');
    } catch (e) {
      Logger.log('❌ ERRO ao serializar Financeiros: ' + e.message);
      Logger.log('   Objeto problemático: ' + typeof resultado.kpis.financeiros);
      inspecionarObjeto(resultado.kpis.financeiros, 'financeiros');
    }

    // 2.2 Logísticos
    try {
      const logisticosJson = JSON.stringify(resultado.kpis.logisticos);
      Logger.log('✅ Logísticos: ' + logisticosJson.length + ' bytes');

      verificarDateObjects(resultado.kpis.logisticos, 'logisticos');
    } catch (e) {
      Logger.log('❌ ERRO ao serializar Logísticos: ' + e.message);
      inspecionarObjeto(resultado.kpis.logisticos, 'logisticos');
    }

    // 2.3 Estoque
    try {
      const estoqueJson = JSON.stringify(resultado.kpis.estoque);
      Logger.log('✅ Estoque: ' + estoqueJson.length + ' bytes');

      verificarDateObjects(resultado.kpis.estoque, 'estoque');
    } catch (e) {
      Logger.log('❌ ERRO ao serializar Estoque: ' + e.message);
      inspecionarObjeto(resultado.kpis.estoque, 'estoque');
    }

    // 2.4 Fornecedores
    try {
      const fornecedoresJson = JSON.stringify(resultado.kpis.fornecedores);
      Logger.log('✅ Fornecedores: ' + fornecedoresJson.length + ' bytes');

      verificarDateObjects(resultado.kpis.fornecedores, 'fornecedores');
    } catch (e) {
      Logger.log('❌ ERRO ao serializar Fornecedores: ' + e.message);
      inspecionarObjeto(resultado.kpis.fornecedores, 'fornecedores');
    }

    // 3. Testar serialização completa
    Logger.log('\n3️⃣ Testando serialização completa...');
    try {
      const dashboardJson = JSON.stringify(resultado);
      Logger.log('✅ Dashboard completo: ' + dashboardJson.length + ' bytes');

      // Verificar limite do Apps Script (aproximadamente 500KB para retorno)
      if (dashboardJson.length > 500000) {
        Logger.log('⚠️ AVISO: Dashboard muito grande (' + dashboardJson.length + ' bytes > 500KB)');
        Logger.log('   Google Apps Script pode falhar ao retornar objetos muito grandes');
      }
    } catch (e) {
      Logger.log('❌ ERRO ao serializar dashboard completo: ' + e.message);
    }

    // 4. Testar com serializarParaFrontend
    Logger.log('\n4️⃣ Testando com serializarParaFrontend()...');
    try {
      const resultadoSerializado = serializarParaFrontend(resultado);
      const serializedJson = JSON.stringify(resultadoSerializado);
      Logger.log('✅ Dashboard serializado: ' + serializedJson.length + ' bytes');

      // Verificar se ainda há Date objects
      verificarDateObjects(resultadoSerializado, 'resultadoSerializado');
    } catch (e) {
      Logger.log('❌ ERRO ao usar serializarParaFrontend: ' + e.message);
    }

    // 5. Testar wrapper
    Logger.log('\n5️⃣ Testando wrapper __getDashboardAvancado()...');
    try {
      const resultadoWrapper = __getDashboardAvancado({});

      if (!resultadoWrapper) {
        Logger.log('❌ Wrapper retornou NULL');
      } else if (!resultadoWrapper.success) {
        Logger.log('❌ Wrapper retornou erro: ' + resultadoWrapper.error);
      } else {
        const wrapperJson = JSON.stringify(resultadoWrapper);
        Logger.log('✅ Wrapper funcionou: ' + wrapperJson.length + ' bytes');
      }
    } catch (e) {
      Logger.log('❌ ERRO no wrapper: ' + e.message);
      Logger.log('   Stack: ' + e.stack);
    }

    Logger.log('\n✅ TESTE CONCLUÍDO');
    Logger.log('================================================');

  } catch (erro) {
    Logger.log('❌ ERRO FATAL no teste: ' + erro.message);
    Logger.log('   Stack: ' + erro.stack);
  }
}

/**
 * Verifica recursivamente se há Date objects no objeto
 */
function verificarDateObjects(obj, caminho) {
  if (!obj) return;

  if (obj instanceof Date) {
    Logger.log('   🗓️ Date object encontrado em: ' + caminho);
    Logger.log('      Valor: ' + obj.toISOString());
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      verificarDateObjects(item, caminho + '[' + idx + ']');
    });
    return;
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        verificarDateObjects(obj[key], caminho + '.' + key);
      }
    }
  }
}

/**
 * Inspeciona objeto para encontrar propriedades problemáticas
 */
function inspecionarObjeto(obj, nome) {
  Logger.log('   🔍 Inspecionando: ' + nome);

  if (!obj) {
    Logger.log('      Objeto é null/undefined');
    return;
  }

  Logger.log('      Tipo: ' + typeof obj);

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    Logger.log('      Propriedades:');
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const valor = obj[key];
        const tipo = Array.isArray(valor) ? 'Array[' + valor.length + ']' : typeof valor;
        const preview = valor instanceof Date ? valor.toISOString() :
                       (typeof valor === 'object' && valor !== null ? '{...}' : String(valor).substring(0, 50));

        Logger.log('        - ' + key + ': ' + tipo + ' = ' + preview);

        // Se for array, inspecionar primeiro item
        if (Array.isArray(valor) && valor.length > 0) {
          Logger.log('          Primeiro item:');
          inspecionarObjeto(valor[0], key + '[0]');
        }
      }
    }
  } else if (Array.isArray(obj)) {
    Logger.log('      Array com ' + obj.length + ' itens');
    if (obj.length > 0) {
      Logger.log('      Primeiro item:');
      inspecionarObjeto(obj[0], nome + '[0]');
    }
  }
}

/**
 * Teste simplificado para executar rapidamente
 */
function testeRapidoDashboard() {
  Logger.log('🧪 TESTE RÁPIDO DO DASHBOARD');

  const resultado = __getDashboardAvancado({});

  if (!resultado) {
    Logger.log('❌ Resultado NULL');
  } else if (!resultado.success) {
    Logger.log('❌ Erro: ' + resultado.error);
  } else {
    Logger.log('✅ Sucesso!');
    Logger.log('📊 Total Pedidos: ' + (resultado.kpis.financeiros.totalPedidos || '?'));
    Logger.log('💰 Valor Total: R$ ' + (resultado.kpis.financeiros.valorTotal || 0).toFixed(2));
  }
}
