/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v10.3
 * Módulo: 11. NOTAS FISCAIS DE ENTRADA
 * ========================================
 *
 * Este módulo gerencia notas fiscais de entrada de produtos no estoque
 * - Registro de NF de fornecedores
 * - Integração com estoque (atualização automática)
 * - Histórico de entradas
 * - Controle de valores e quantidades
 */

/**
 * Cria aba de Notas Fiscais (v10.3)
 * Executada durante setup ou manualmente
 */
function criarAbaNotasFiscais(ss) {
  try {
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();

    // Verificar se aba já existe
    let abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (abaNF) {
      Logger.log('⚠️ Aba Notas Fiscais já existe');
      return { success: true, message: 'Aba já existe' };
    }

    // Criar nova aba
    abaNF = ss.insertSheet(CONFIG.ABAS.NOTAS_FISCAIS);

    // Cabeçalhos
    const headers = [
      'ID',
      'Número NF',
      'Data Emissão',
      'Data Entrada',
      'Fornecedor',
      'CNPJ Fornecedor',
      'Valor Total',
      'Produtos (JSON)',
      'Quantidades (JSON)',
      'Valores Unitários (JSON)',
      'Tipo Produtos',
      'Status',
      'Responsável',
      'Observações',
      'Data Cadastro'
    ];

    // Aplicar cabeçalhos
    const headerRange = abaNF.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#00A651');
    headerRange.setFontColor('#FFFFFF');

    // Formatar colunas
    abaNF.setColumnWidth(1, 80);   // ID
    abaNF.setColumnWidth(2, 120);  // Número NF
    abaNF.setColumnWidth(3, 100);  // Data Emissão
    abaNF.setColumnWidth(4, 100);  // Data Entrada
    abaNF.setColumnWidth(5, 200);  // Fornecedor
    abaNF.setColumnWidth(6, 150);  // CNPJ
    abaNF.setColumnWidth(7, 120);  // Valor Total
    abaNF.setColumnWidth(8, 250);  // Produtos
    abaNF.setColumnWidth(9, 150);  // Quantidades
    abaNF.setColumnWidth(10, 150); // Valores Unitários
    abaNF.setColumnWidth(11, 100); // Tipo Produtos
    abaNF.setColumnWidth(12, 100); // Status
    abaNF.setColumnWidth(13, 150); // Responsável
    abaNF.setColumnWidth(14, 250); // Observações
    abaNF.setColumnWidth(15, 150); // Data Cadastro

    // Congelar primeira linha
    abaNF.setFrozenRows(1);

    Logger.log('✅ Aba Notas Fiscais criada com sucesso');

    return {
      success: true,
      message: 'Aba Notas Fiscais criada com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao criar aba Notas Fiscais: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cadastra nova Nota Fiscal de entrada (v10.3)
 *
 * @param {object} dados - Dados da NF
 * @returns {object} - { success: boolean, nfId: string }
 */
function cadastrarNotaFiscal(dados) {
  try {
    Logger.log('📄 Cadastrando Nota Fiscal: ' + dados.numeroNF);

    // Validações
    if (!dados.numeroNF || !dados.fornecedor) {
      return {
        success: false,
        error: 'Número da NF e Fornecedor são obrigatórios'
      };
    }

    if (!dados.produtos || dados.produtos.length === 0) {
      return {
        success: false,
        error: 'A NF deve conter pelo menos um produto'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      // Criar aba se não existir
      criarAbaNotasFiscais(ss);
      abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);
    }

    // Gerar ID único
    const nfId = 'NF-' + Date.now();

    // Obter email do usuário
    const email = Session.getActiveUser().getEmail();

    // Calcular valor total
    let valorTotal = 0;
    if (dados.valoresUnitarios && dados.quantidades) {
      for (let i = 0; i < dados.valoresUnitarios.length; i++) {
        valorTotal += (dados.valoresUnitarios[i] || 0) * (dados.quantidades[i] || 0);
      }
    }

    // Preparar linha
    const novaLinha = [
      nfId,                                             // A - ID
      dados.numeroNF,                                   // B - Número NF
      dados.dataEmissao || new Date(),                  // C - Data Emissão
      dados.dataEntrada || new Date(),                  // D - Data Entrada
      dados.fornecedor,                                 // E - Fornecedor
      dados.cnpjFornecedor || '',                       // F - CNPJ
      valorTotal,                                       // G - Valor Total
      JSON.stringify(dados.produtos),                   // H - Produtos (JSON)
      JSON.stringify(dados.quantidades),                // I - Quantidades (JSON)
      JSON.stringify(dados.valoresUnitarios || []),     // J - Valores Unitários (JSON)
      dados.tipoProdutos || 'Papelaria',                // K - Tipo Produtos
      CONFIG.STATUS_NOTAS_FISCAIS.PENDENTE,             // L - Status
      email,                                            // M - Responsável
      dados.observacoes || '',                          // N - Observações
      new Date()                                        // O - Data Cadastro
    ];

    // Inserir linha
    abaNF.appendRow(novaLinha);

    // Registrar log
    registrarLog(email, 'Cadastrar NF', `NF ${dados.numeroNF} cadastrada - Fornecedor: ${dados.fornecedor}`, 'sucesso');

    Logger.log(`✅ NF cadastrada: ${nfId}`);

    return {
      success: true,
      nfId: nfId,
      message: 'Nota Fiscal cadastrada com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao cadastrar NF: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Processa Nota Fiscal e atualiza estoque (v10.3)
 *
 * @param {string} nfId - ID da NF a ser processada
 * @returns {object} - { success: boolean }
 */
function processarNotaFiscal(nfId) {
  try {
    Logger.log('⚙️ Processando NF: ' + nfId);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      return { success: false, error: 'Aba Notas Fiscais não encontrada' };
    }

    // Buscar NF
    const dados = abaNF.getDataRange().getValues();
    let nfRow = -1;
    let nfData = null;

    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] === nfId) {
        nfRow = i + 1;
        nfData = dados[i];
        break;
      }
    }

    if (!nfData) {
      return { success: false, error: 'Nota Fiscal não encontrada' };
    }

    // Verificar status
    const status = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1];
    if (status === CONFIG.STATUS_NOTAS_FISCAIS.PROCESSADA) {
      return { success: false, error: 'NF já foi processada anteriormente' };
    }

    if (status === CONFIG.STATUS_NOTAS_FISCAIS.CANCELADA) {
      return { success: false, error: 'NF está cancelada' };
    }

    // Extrair dados da NF
    const produtos = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1]);
    const quantidades = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1]);
    const numeroNF = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1];
    const fornecedor = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1];

    // Processar cada produto (dar entrada no estoque)
    const email = Session.getActiveUser().getEmail();
    let erros = [];

    for (let i = 0; i < produtos.length; i++) {
      const produtoId = produtos[i];
      const quantidade = quantidades[i];

      const resultado = registrarMovimentacao({
        tipo: CONFIG.TIPOS_MOVIMENTACAO.ENTRADA,
        produtoId: produtoId,
        quantidade: quantidade,
        observacoes: `Entrada NF ${numeroNF} - Fornecedor: ${fornecedor}`,
        responsavel: email
      });

      if (!resultado.success) {
        erros.push(`Produto ${produtoId}: ${resultado.error}`);
      }
    }

    if (erros.length > 0) {
      Logger.log('⚠️ Erros ao processar NF: ' + erros.join('; '));
      return {
        success: false,
        error: 'Alguns produtos não puderam ser processados: ' + erros.join('; ')
      };
    }

    // Atualizar status da NF
    abaNF.getRange(nfRow, CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS).setValue(CONFIG.STATUS_NOTAS_FISCAIS.PROCESSADA);

    // Registrar log
    registrarLog(email, 'Processar NF', `NF ${numeroNF} processada - ${produtos.length} produto(s) atualizados`, 'sucesso');

    Logger.log(`✅ NF processada: ${nfId}`);

    return {
      success: true,
      message: `Nota Fiscal processada com sucesso. ${produtos.length} produto(s) atualizados no estoque.`
    };

  } catch (error) {
    Logger.log('❌ Erro ao processar NF: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancela Nota Fiscal (v10.3)
 *
 * @param {string} nfId - ID da NF a ser cancelada
 * @param {string} motivo - Motivo do cancelamento
 * @returns {object} - { success: boolean }
 */
function cancelarNotaFiscal(nfId, motivo) {
  try {
    Logger.log('🚫 Cancelando NF: ' + nfId);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      return { success: false, error: 'Aba Notas Fiscais não encontrada' };
    }

    // Buscar NF
    const dados = abaNF.getDataRange().getValues();
    let nfRow = -1;
    let nfData = null;

    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] === nfId) {
        nfRow = i + 1;
        nfData = dados[i];
        break;
      }
    }

    if (!nfData) {
      return { success: false, error: 'Nota Fiscal não encontrada' };
    }

    // Verificar se já foi processada
    const status = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1];
    if (status === CONFIG.STATUS_NOTAS_FISCAIS.PROCESSADA) {
      return {
        success: false,
        error: 'NF já foi processada. Não é possível cancelar uma NF processada.'
      };
    }

    // Atualizar status
    abaNF.getRange(nfRow, CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS).setValue(CONFIG.STATUS_NOTAS_FISCAIS.CANCELADA);

    // Adicionar motivo nas observações
    const obsAtual = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES - 1];
    const novaObs = `${obsAtual}\n[CANCELADA] ${motivo}`;
    abaNF.getRange(nfRow, CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES).setValue(novaObs);

    // Registrar log
    const email = Session.getActiveUser().getEmail();
    const numeroNF = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1];
    registrarLog(email, 'Cancelar NF', `NF ${numeroNF} cancelada - Motivo: ${motivo}`, 'sucesso');

    Logger.log(`✅ NF cancelada: ${nfId}`);

    return {
      success: true,
      message: 'Nota Fiscal cancelada com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao cancelar NF: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista todas as Notas Fiscais com filtros (v10.3)
 *
 * @param {object} filtros - { status, fornecedor, dataInicio, dataFim }
 * @returns {object} - { success: boolean, notasFiscais: [] }
 */
function listarNotasFiscais(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      return {
        success: true,
        notasFiscais: [],
        message: 'Nenhuma nota fiscal cadastrada'
      };
    }

    const dados = abaNF.getDataRange().getValues();
    const notasFiscais = [];

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias

      const nf = {
        id: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1],
        numeroNF: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1],
        dataEmissao: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_EMISSAO - 1],
        dataEntrada: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_ENTRADA - 1],
        fornecedor: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1],
        cnpjFornecedor: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.CNPJ_FORNECEDOR - 1],
        valorTotal: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.VALOR_TOTAL - 1],
        produtos: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1] || '[]'),
        quantidades: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1] || '[]'),
        valoresUnitarios: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1] || '[]'),
        tipoProdutos: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.TIPO_PRODUTOS - 1],
        status: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1],
        responsavel: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.RESPONSAVEL - 1],
        observacoes: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES - 1],
        dataCadastro: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_CADASTRO - 1]
      };

      // Aplicar filtros
      if (filtros) {
        if (filtros.status && nf.status !== filtros.status) continue;
        if (filtros.fornecedor && !nf.fornecedor.toLowerCase().includes(filtros.fornecedor.toLowerCase())) continue;

        if (filtros.dataInicio) {
          const dataInicio = new Date(filtros.dataInicio);
          const dataEmissao = new Date(nf.dataEmissao);
          if (dataEmissao < dataInicio) continue;
        }

        if (filtros.dataFim) {
          const dataFim = new Date(filtros.dataFim);
          const dataEmissao = new Date(nf.dataEmissao);
          if (dataEmissao > dataFim) continue;
        }
      }

      notasFiscais.push(nf);
    }

    // Ordenar por data de cadastro (mais recente primeiro)
    notasFiscais.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));

    return {
      success: true,
      notasFiscais: notasFiscais
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar NFs: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém detalhes de uma Nota Fiscal específica (v10.3)
 *
 * @param {string} nfId - ID da NF
 * @returns {object} - { success: boolean, notaFiscal: {} }
 */
function getNotaFiscal(nfId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      return { success: false, error: 'Aba Notas Fiscais não encontrada' };
    }

    const dados = abaNF.getDataRange().getValues();

    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] === nfId) {
        const nf = {
          id: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1],
          numeroNF: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1],
          dataEmissao: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_EMISSAO - 1],
          dataEntrada: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_ENTRADA - 1],
          fornecedor: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1],
          cnpjFornecedor: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.CNPJ_FORNECEDOR - 1],
          valorTotal: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.VALOR_TOTAL - 1],
          produtos: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1] || '[]'),
          quantidades: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1] || '[]'),
          valoresUnitarios: JSON.parse(dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1] || '[]'),
          tipoProdutos: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.TIPO_PRODUTOS - 1],
          status: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1],
          responsavel: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.RESPONSAVEL - 1],
          observacoes: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES - 1],
          dataCadastro: dados[i][CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_CADASTRO - 1]
        };

        return {
          success: true,
          notaFiscal: nf
        };
      }
    }

    return {
      success: false,
      error: 'Nota Fiscal não encontrada'
    };

  } catch (error) {
    Logger.log('❌ Erro ao obter NF: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
