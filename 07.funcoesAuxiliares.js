/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Funções Auxiliares
 * ========================================
 */

/**
 * Registra log do sistema
 */
function registrarLog(acao, detalhes, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaLogs = ss.getSheetByName(CONFIG.ABAS.LOGS);
    
    if (!abaLogs) {
      Logger.log('⚠️ Aba de logs não encontrada');
      return;
    }
    
    const email = Session.getActiveUser().getEmail();
    const id = Utilities.getUuid();
    
    const log = [
      id,
      new Date(),
      email,
      acao,
      detalhes,
      status || 'SUCESSO'
    ];
    
    abaLogs.appendRow(log);
    
  } catch (error) {
    Logger.log('❌ Erro ao registrar log: ' + error.message);
  }
}

/**
 * Formata valor monetário
 */
function formatarMoeda(valor) {
  try {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  } catch (error) {
    return 'R$ 0,00';
  }
}

/**
 * Formata data
 */
function formatarData(data, formato) {
  try {
    if (!data) return '';
    
    const d = new Date(data);
    
    if (formato === 'dd/MM/yyyy') {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    } else if (formato === 'dd/MM/yyyy HH:mm') {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    } else {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    }
  } catch (error) {
    return '';
  }
}

/**
 * Valida email
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Gera ID único
 */
function gerarId() {
  return Utilities.getUuid();
}

/**
 * Limpa logs antigos (mantém últimos 90 dias)
 */
function limparLogsAntigos() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaLogs = ss.getSheetByName(CONFIG.ABAS.LOGS);
    
    if (!abaLogs) {
      return { success: false, error: 'Aba de logs não encontrada' };
    }
    
    const dados = abaLogs.getDataRange().getValues();
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 90);
    
    let linhasDeletadas = 0;
    
    // Percorrer de trás para frente para evitar problemas com índices
    for (let i = dados.length - 1; i >= 1; i--) {
      const dataLog = new Date(dados[i][1]);
      
      if (dataLog < dataLimite) {
        abaLogs.deleteRow(i + 1);
        linhasDeletadas++;
      }
    }
    
    Logger.log(`🗑️ ${linhasDeletadas} logs antigos deletados`);
    
    return {
      success: true,
      linhasDeletadas: linhasDeletadas
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao limpar logs: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém lista de usuários únicos (para filtros)
 */
function getListaUsuarios() {
  try {
    const resultado = listarUsuarios();
    
    if (!resultado.success) {
      return [];
    }
    
    return resultado.usuarios.map(u => ({
      email: u.email,
      nome: u.nome
    }));
    
  } catch (error) {
    Logger.log('❌ Erro ao obter lista de usuários: ' + error.message);
    return [];
  }
}

/**
 * Obtém lista de setores únicos (para filtros)
 */
function getListaSetores() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaUsers = ss.getSheetByName(CONFIG.ABAS.USERS);
    
    if (!abaUsers) {
      return [];
    }
    
    const dados = abaUsers.getDataRange().getValues();
    const setores = new Set();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][2]) {
        setores.add(dados[i][2]);
      }
    }
    
    return Array.from(setores).sort();
    
  } catch (error) {
    Logger.log('❌ Erro ao obter lista de setores: ' + error.message);
    return [];
  }
}

/**
 * Exporta dados para CSV
 */
function exportarParaCSV(dados, nomeArquivo) {
  try {
    if (!dados || dados.length === 0) {
      return {
        success: false,
        error: 'Não há dados para exportar'
      };
    }
    
    let csv = '';
    
    // Cabeçalhos
    const headers = Object.keys(dados[0]);
    csv += headers.join(',') + '\n';
    
    // Dados
    dados.forEach(linha => {
      const valores = headers.map(header => {
        const valor = linha[header];
        // Escapar aspas e adicionar aspas se contém vírgula
        if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"'))) {
          return `"${valor.replace(/"/g, '""')}"`;
        }
        return valor;
      });
      csv += valores.join(',') + '\n';
    });
    
    return {
      success: true,
      csv: csv,
      fileName: nomeArquivo || `export_${new Date().getTime()}.csv`
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao exportar CSV: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
