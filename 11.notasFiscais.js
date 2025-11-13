/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v10.4
 * Módulo: 11. NOTAS FISCAIS DE ENTRADA COM UPLOAD XML
 * ========================================
 *
 * Este módulo gerencia notas fiscais de entrada de produtos no estoque
 * - Upload e parse de arquivo XML (NF-e)
 * - Mapeamento automático de produtos
 * - Cálculo de custo médio ponderado
 * - Atualização de preços por lote
 * - Integração com estoque (atualização automática)
 * - Histórico de entradas e custos
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
 * Cria aba de Histórico de Custos (v10.4)
 * Executada durante setup ou manualmente
 */
function criarAbaHistoricoCustos(ss) {
  try {
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();

    // Verificar se aba já existe
    let abaHistCusto = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);

    if (abaHistCusto) {
      Logger.log('⚠️ Aba Histórico Custos já existe');
      return { success: true, message: 'Aba já existe' };
    }

    // Criar nova aba
    abaHistCusto = ss.insertSheet(CONFIG.ABAS.HISTORICO_CUSTOS);

    // Cabeçalhos
    const headers = [
      'ID',
      'Produto ID',
      'Produto Nome',
      'Data',
      'Custo Unitário',
      'Quantidade Comprada',
      'Fornecedor',
      'Número NF',
      'NF ID',
      'Custo Anterior',
      'Variação %',
      'Tipo Movimentação',
      'Responsável',
      'Observações'
    ];

    // Aplicar cabeçalhos
    const headerRange = abaHistCusto.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#00A651');
    headerRange.setFontColor('#FFFFFF');

    // Formatar colunas
    abaHistCusto.setColumnWidth(1, 120);   // ID
    abaHistCusto.setColumnWidth(2, 100);   // Produto ID
    abaHistCusto.setColumnWidth(3, 200);   // Produto Nome
    abaHistCusto.setColumnWidth(4, 120);   // Data
    abaHistCusto.setColumnWidth(5, 120);   // Custo Unitário
    abaHistCusto.setColumnWidth(6, 120);   // Quantidade Comprada
    abaHistCusto.setColumnWidth(7, 200);   // Fornecedor
    abaHistCusto.setColumnWidth(8, 120);   // Número NF
    abaHistCusto.setColumnWidth(9, 120);   // NF ID
    abaHistCusto.setColumnWidth(10, 120);  // Custo Anterior
    abaHistCusto.setColumnWidth(11, 100);  // Variação %
    abaHistCusto.setColumnWidth(12, 100);  // Tipo Movimentação
    abaHistCusto.setColumnWidth(13, 150);  // Responsável
    abaHistCusto.setColumnWidth(14, 250);  // Observações

    // Congelar primeira linha
    abaHistCusto.setFrozenRows(1);

    Logger.log('✅ Aba Histórico Custos criada com sucesso');

    return {
      success: true,
      message: 'Aba Histórico Custos criada com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao criar aba Histórico Custos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cria aba de Itens de Notas Fiscais (v10.4)
 * Executada durante setup ou manualmente
 */
function criarAbaItensNotasFiscais(ss) {
  try {
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();

    // Verificar se aba já existe
    let abaItensNF = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

    if (abaItensNF) {
      Logger.log('⚠️ Aba Itens NF já existe');
      return { success: true, message: 'Aba já existe' };
    }

    // Criar nova aba
    abaItensNF = ss.insertSheet(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

    // Cabeçalhos
    const headers = [
      'ID',
      'NF ID',
      'Produto ID',
      'Produto Nome',
      'Código na NF',
      'Descrição na NF',
      'NCM',
      'Quantidade',
      'Unidade',
      'Valor Unitário',
      'Valor Total',
      'Mapeado',
      'Match Score',
      'Data Entrada'
    ];

    // Aplicar cabeçalhos
    const headerRange = abaItensNF.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#00A651');
    headerRange.setFontColor('#FFFFFF');

    // Formatar colunas
    abaItensNF.setColumnWidth(1, 120);   // ID
    abaItensNF.setColumnWidth(2, 120);   // NF ID
    abaItensNF.setColumnWidth(3, 100);   // Produto ID
    abaItensNF.setColumnWidth(4, 200);   // Produto Nome
    abaItensNF.setColumnWidth(5, 120);   // Código na NF
    abaItensNF.setColumnWidth(6, 250);   // Descrição na NF
    abaItensNF.setColumnWidth(7, 100);   // NCM
    abaItensNF.setColumnWidth(8, 100);   // Quantidade
    abaItensNF.setColumnWidth(9, 80);    // Unidade
    abaItensNF.setColumnWidth(10, 120);  // Valor Unitário
    abaItensNF.setColumnWidth(11, 120);  // Valor Total
    abaItensNF.setColumnWidth(12, 80);   // Mapeado
    abaItensNF.setColumnWidth(13, 100);  // Match Score
    abaItensNF.setColumnWidth(14, 150);  // Data Entrada

    // Congelar primeira linha
    abaItensNF.setFrozenRows(1);

    Logger.log('✅ Aba Itens NF criada com sucesso');

    return {
      success: true,
      message: 'Aba Itens NF criada com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao criar aba Itens NF: ' + error.message);
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

/**
 * ========================================
 * UPLOAD E PROCESSAMENTO DE XML (v10.4)
 * ========================================
 */

/**
 * Upload e parse de arquivo XML da NF-e (v10.4)
 *
 * @param {string} xmlBase64 - Arquivo XML em Base64
 * @param {string} fileName - Nome do arquivo
 * @returns {object} - { success: boolean, dadosNF: {} }
 */
function uploadEProcessarXMLNF(xmlBase64, fileName) {
  try {
    Logger.log(`📄 Processando XML da NF: ${fileName}`);

    // 1. Decodificar Base64
    const xmlContent = Utilities.newBlob(
      Utilities.base64Decode(xmlBase64)
    ).getDataAsString();

    Logger.log(`✅ XML decodificado: ${xmlContent.length} caracteres`);

    // 2. Parse do XML
    const dadosNF = parseXMLNotaFiscal(xmlContent);

    if (!dadosNF.success) {
      return dadosNF;
    }

    return {
      success: true,
      dadosNF: dadosNF.dados,
      message: 'XML processado com sucesso'
    };

  } catch (error) {
    Logger.log(`❌ Erro ao processar XML: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse do XML da NF-e (v10.4)
 * Extrai dados da nota fiscal eletrônica
 *
 * @param {string} xmlContent - Conteúdo do XML
 * @returns {object} - { success: boolean, dados: {} }
 */
function parseXMLNotaFiscal(xmlContent) {
  try {
    Logger.log('🔍 Iniciando parse do XML da NF-e...');

    // Parse do XML usando XmlService
    const document = XmlService.parse(xmlContent);
    const root = document.getRootElement();

    // Namespace da NF-e
    const nfeNamespace = XmlService.getNamespace('http://www.portalfiscal.inf.br/nfe');

    // Navegar até <infNFe>
    let infNFe = root.getChild('NFe', nfeNamespace);
    if (infNFe) {
      infNFe = infNFe.getChild('infNFe', nfeNamespace);
    } else {
      // Tentar sem namespace (alguns XMLs não têm)
      infNFe = root.getChild('NFe');
      if (infNFe) {
        infNFe = infNFe.getChild('infNFe');
      }
    }

    if (!infNFe) {
      throw new Error('Estrutura XML inválida - tag infNFe não encontrada');
    }

    // Extrair dados da NF
    const ide = infNFe.getChild('ide', nfeNamespace) || infNFe.getChild('ide');
    const emit = infNFe.getChild('emit', nfeNamespace) || infNFe.getChild('emit');
    const total = infNFe.getChild('total', nfeNamespace) || infNFe.getChild('total');

    // Número da NF
    const numeroNF = ide ? ide.getChildText('nNF', nfeNamespace) || ide.getChildText('nNF') : '';

    // Data de emissão
    const dhEmi = ide ? ide.getChildText('dhEmi', nfeNamespace) || ide.getChildText('dhEmi') : '';
    const dataEmissao = dhEmi ? new Date(dhEmi) : new Date();

    // Dados do fornecedor
    const fornecedorNome = emit ? (emit.getChildText('xNome', nfeNamespace) || emit.getChildText('xNome')) : '';
    const fornecedorCNPJ = emit ? (emit.getChildText('CNPJ', nfeNamespace) || emit.getChildText('CNPJ')) : '';

    // Valor total
    const icmsTot = total ? (total.getChild('ICMSTot', nfeNamespace) || total.getChild('ICMSTot')) : null;
    const valorTotal = icmsTot ? parseFloat(icmsTot.getChildText('vNF', nfeNamespace) || icmsTot.getChildText('vNF') || '0') : 0;

    // Extrair produtos
    const produtos = [];
    const det = infNFe.getChildren('det', nfeNamespace).length > 0
      ? infNFe.getChildren('det', nfeNamespace)
      : infNFe.getChildren('det');

    Logger.log(`📦 Encontrados ${det.length} produtos na NF`);

    det.forEach(function(item) {
      const prod = item.getChild('prod', nfeNamespace) || item.getChild('prod');
      if (!prod) return;

      const codigo = prod.getChildText('cProd', nfeNamespace) || prod.getChildText('cProd') || '';
      const descricao = prod.getChildText('xProd', nfeNamespace) || prod.getChildText('xProd') || '';
      const ncm = prod.getChildText('NCM', nfeNamespace) || prod.getChildText('NCM') || '';
      const unidade = prod.getChildText('uCom', nfeNamespace) || prod.getChildText('uCom') || '';
      const quantidade = parseFloat(prod.getChildText('qCom', nfeNamespace) || prod.getChildText('qCom') || '0');
      const valorUnitario = parseFloat(prod.getChildText('vUnCom', nfeNamespace) || prod.getChildText('vUnCom') || '0');
      const valorTotal = parseFloat(prod.getChildText('vProd', nfeNamespace) || prod.getChildText('vProd') || '0');

      produtos.push({
        codigoNF: codigo,
        descricao: descricao,
        ncm: ncm,
        unidade: unidade,
        quantidade: quantidade,
        valorUnitario: valorUnitario,
        valorTotal: valorTotal
      });
    });

    const dadosNF = {
      numeroNF: numeroNF,
      dataEmissao: dataEmissao,
      fornecedor: fornecedorNome,
      cnpjFornecedor: fornecedorCNPJ,
      valorTotal: valorTotal,
      produtos: produtos
    };

    Logger.log(`✅ Parse concluído: NF ${numeroNF} com ${produtos.length} produtos`);

    return {
      success: true,
      dados: dadosNF
    };

  } catch (error) {
    Logger.log(`❌ Erro no parse do XML: ${error.message}`);
    return {
      success: false,
      error: `Erro ao processar XML: ${error.message}`
    };
  }
}

/**
 * Mapeia produtos da NF com produtos cadastrados (v10.4)
 * Usa matching inteligente por código, descrição e NCM
 *
 * @param {array} produtosNF - Produtos extraídos da NF
 * @param {string} tipoProdutos - Tipo (Papelaria ou Limpeza)
 * @returns {object} - { success: boolean, mapeamento: [], naoMapeados: [] }
 */
function mapearProdutosNF(produtosNF, tipoProdutos, fornecedor) {
  try {
    Logger.log(`🔗 Mapeando ${produtosNF.length} produtos da NF...`);
    Logger.log(`   Tipo: ${tipoProdutos}`);
    Logger.log(`   Fornecedor: ${fornecedor || 'não informado'}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    // Carregar todos os produtos cadastrados
    const dados = abaProdutos.getDataRange().getValues();
    const produtosCadastrados = [];

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]) continue;

      const tipo = dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1];
      if (tipo !== tipoProdutos) continue; // Filtrar por tipo

      // Parse do mapeamento de códigos (JSON)
      let mapeamento = [];
      try {
        const mapeamentoStr = dados[i][CONFIG.COLUNAS_PRODUTOS.MAPEAMENTO_CODIGOS - 1] || '[]';
        mapeamento = JSON.parse(mapeamentoStr);
      } catch (e) {
        mapeamento = [];
      }

      produtosCadastrados.push({
        id: dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO - 1] || '').toUpperCase(),
        nome: String(dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1] || '').toUpperCase(),
        tipo: dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
        codigoFornecedor: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] || '').toUpperCase(),
        mapeamento: mapeamento
      });
    }

    Logger.log(`📦 ${produtosCadastrados.length} produtos cadastrados do tipo ${tipoProdutos}`);

    const mapeamento = [];
    const naoMapeados = [];

    // Mapear cada produto da NF
    produtosNF.forEach(function(prodNF) {
      const codigoNF = String(prodNF.codigoNF || '').toUpperCase().trim();
      const descricaoNF = String(prodNF.descricao || '').toUpperCase().trim();

      let produtoEncontrado = null;
      let matchScore = 0;
      let estrategiaUsada = '';

      // ========================================
      // ESTRATÉGIA 1: Match exato por código interno
      // ========================================
      if (!produtoEncontrado && codigoNF) {
        produtoEncontrado = produtosCadastrados.find(p => p.codigo === codigoNF);
        if (produtoEncontrado) {
          matchScore = 1.0;
          estrategiaUsada = 'Código Interno';
        }
      }

      // ========================================
      // ESTRATÉGIA 2: Match por código fornecedor principal
      // ========================================
      if (!produtoEncontrado && codigoNF) {
        produtoEncontrado = produtosCadastrados.find(p => p.codigoFornecedor === codigoNF);
        if (produtoEncontrado) {
          matchScore = 1.0;
          estrategiaUsada = 'Código Fornecedor';
        }
      }

      // ========================================
      // ESTRATÉGIA 3: Match por mapeamento de códigos (JSON)
      // ========================================
      if (!produtoEncontrado && codigoNF && fornecedor) {
        produtoEncontrado = produtosCadastrados.find(p => {
          return p.mapeamento.some(m =>
            String(m.fornecedor).toUpperCase() === fornecedor.toUpperCase() &&
            String(m.codigo).toUpperCase() === codigoNF
          );
        });
        if (produtoEncontrado) {
          matchScore = 1.0;
          estrategiaUsada = 'Mapeamento JSON';
        }
      }

      // ========================================
      // ESTRATÉGIA 4: Match por similaridade de descrição
      // ========================================
      if (!produtoEncontrado && descricaoNF) {
        let melhorSimilaridade = 0;
        produtosCadastrados.forEach(p => {
          const similarity = calcularSimilaridade(p.nome, descricaoNF);
          if (similarity > melhorSimilaridade && similarity >= 0.7) {
            melhorSimilaridade = similarity;
            produtoEncontrado = p;
            matchScore = similarity;
            estrategiaUsada = 'Similaridade';
          }
        });
      }

      if (produtoEncontrado) {
        mapeamento.push({
          produtoId: produtoEncontrado.id,
          produtoNome: produtoEncontrado.nome,
          codigoNF: prodNF.codigoNF,
          descricaoNF: prodNF.descricao,
          quantidade: prodNF.quantidade,
          valorUnitario: prodNF.valorUnitario,
          valorTotal: prodNF.valorTotal,
          matchScore: matchScore,
          estrategia: estrategiaUsada
        });
        Logger.log(`✅ [${estrategiaUsada}] ${prodNF.descricao} → ${produtoEncontrado.nome} (${(matchScore * 100).toFixed(0)}%)`);
      } else {
        naoMapeados.push({
          codigoNF: prodNF.codigoNF,
          descricao: prodNF.descricao,
          quantidade: prodNF.quantidade,
          valorUnitario: prodNF.valorUnitario,
          valorTotal: prodNF.valorTotal,
          ncm: prodNF.ncm,
          unidade: prodNF.unidade
        });
        Logger.log(`⚠️ Não mapeado: ${prodNF.descricao} (Código: ${prodNF.codigoNF})`);
      }
    });

    Logger.log(`✅ Mapeamento concluído: ${mapeamento.length} mapeados, ${naoMapeados.length} não mapeados`);

    return {
      success: true,
      mapeamento: mapeamento,
      naoMapeados: naoMapeados
    };

  } catch (error) {
    Logger.log(`❌ Erro ao mapear produtos: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calcula similaridade entre duas strings (v10.4)
 * Usa algoritmo de Levenshtein Distance simplificado
 *
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} - Similaridade de 0 a 1
 */
function calcularSimilaridade(str1, str2) {
  str1 = str1.toUpperCase().trim();
  str2 = str2.toUpperCase().trim();

  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Verificar se uma string contém a outra
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.8;
  }

  // Contar palavras em comum
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  let commonWords = 0;

  words1.forEach(function(word) {
    if (words2.includes(word) && word.length > 2) {
      commonWords++;
    }
  });

  const maxWords = Math.max(words1.length, words2.length);
  return commonWords / maxWords;
}

/**
 * Processa NF com XML e atualiza estoque com custo médio (v10.4)
 *
 * @param {string} nfId - ID da NF
 * @returns {object} - { success: boolean }
 */
function processarNFComCustoMedio(nfId) {
  try {
    Logger.log(`⚙️ Processando NF com custo médio: ${nfId}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaNF || !abaProdutos) {
      return { success: false, error: 'Abas não encontradas' };
    }

    // Buscar NF
    const dadosNF = abaNF.getDataRange().getValues();
    let nfRow = -1;
    let nfData = null;

    for (let i = 1; i < dadosNF.length; i++) {
      if (dadosNF[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] === nfId) {
        nfRow = i + 1;
        nfData = dadosNF[i];
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

    // Extrair dados da NF
    const produtos = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1]);
    const quantidades = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1]);
    const valoresUnitarios = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1]);
    const numeroNF = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1];

    const email = Session.getActiveUser().getEmail();
    let erros = [];

    const fornecedor = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1];

    // Processar cada produto
    for (let i = 0; i < produtos.length; i++) {
      const produtoId = produtos[i];
      const quantidade = quantidades[i];
      const valorUnitarioNF = valoresUnitarios[i];

      // Buscar nome do produto
      const dadosProdutos = abaProdutos.getDataRange().getValues();
      let produtoNome = '';
      for (let j = 1; j < dadosProdutos.length; j++) {
        if (dadosProdutos[j][CONFIG.COLUNAS_PRODUTOS.ID - 1] === produtoId) {
          produtoNome = dadosProdutos[j][CONFIG.COLUNAS_PRODUTOS.NOME - 1];
          break;
        }
      }

      // Atualizar preço do produto com custo médio ponderado
      const resultadoCusto = atualizarCustoMedioProduto(produtoId, quantidade, valorUnitarioNF);

      if (!resultadoCusto.success) {
        erros.push(`Produto ${produtoId}: ${resultadoCusto.error}`);
        continue;
      }

      // ========================================
      // REGISTRAR HISTÓRICO DE CUSTO (v10.4)
      // ========================================
      registrarHistoricoCusto({
        produtoId: produtoId,
        produtoNome: produtoNome,
        custoUnitario: resultadoCusto.novoCustoMedio,
        quantidade: quantidade,
        fornecedor: fornecedor,
        numeroNF: numeroNF,
        nfId: nfId,
        custoAnterior: resultadoCusto.custoAnterior,
        responsavel: email,
        observacoes: `Entrada NF ${numeroNF} - Custo NF: R$ ${valorUnitarioNF.toFixed(2)}`
      });

      // Registrar movimentação de entrada
      const resultadoMov = registrarMovimentacao({
        tipo: CONFIG.TIPOS_MOVIMENTACAO.ENTRADA,
        produtoId: produtoId,
        quantidade: quantidade,
        observacoes: `Entrada NF ${numeroNF} - Custo: R$ ${valorUnitarioNF.toFixed(2)} - Novo custo médio: R$ ${resultadoCusto.novoCustoMedio.toFixed(2)}`,
        responsavel: email,
        nfId: nfId,                        // v10.4 - Referência à NF
        custoUnitario: valorUnitarioNF     // v10.4 - Custo da NF
      });

      if (!resultadoMov.success) {
        erros.push(`Movimentação ${produtoId}: ${resultadoMov.error}`);
      }
    }

    if (erros.length > 0) {
      Logger.log(`⚠️ Erros ao processar NF: ${erros.join('; ')}`);
      return {
        success: false,
        error: 'Alguns produtos não puderam ser processados: ' + erros.join('; ')
      };
    }

    // Atualizar status da NF
    abaNF.getRange(nfRow, CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS).setValue(CONFIG.STATUS_NOTAS_FISCAIS.PROCESSADA);

    // Registrar log
    registrarLog(email, 'Processar NF', `NF ${numeroNF} processada com custo médio - ${produtos.length} produto(s)`, 'sucesso');

    Logger.log(`✅ NF processada com custo médio: ${nfId}`);

    return {
      success: true,
      message: `Nota Fiscal processada com sucesso. ${produtos.length} produto(s) atualizados.`
    };

  } catch (error) {
    Logger.log(`❌ Erro ao processar NF com custo médio: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza custo médio ponderado de um produto (v10.4)
 *
 * @param {string} produtoId - ID do produto
 * @param {number} quantidadeNova - Quantidade da NF
 * @param {number} custoNovo - Custo unitário da NF
 * @returns {object} - { success: boolean, novoCustoMedio: number }
 */
function atualizarCustoMedioProduto(produtoId, quantidadeNova, custoNovo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

    // Buscar produto
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    let produtoRow = -1;
    let produtoData = null;

    for (let i = 1; i < dadosProdutos.length; i++) {
      if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === produtoId) {
        produtoRow = i + 1;
        produtoData = dadosProdutos[i];
        break;
      }
    }

    if (!produtoData) {
      return { success: false, error: 'Produto não encontrado' };
    }

    // Buscar estoque atual
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let quantidadeAtual = 0;

    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === produtoId) {
        quantidadeAtual = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
        break;
      }
    }

    // Obter custo atual
    const custoAtual = produtoData[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0;

    // Calcular custo médio ponderado
    // Fórmula: (Qtd Atual * Custo Atual + Qtd Nova * Custo Novo) / (Qtd Atual + Qtd Nova)
    const novoCustoMedio = ((quantidadeAtual * custoAtual) + (quantidadeNova * custoNovo)) / (quantidadeAtual + quantidadeNova);

    Logger.log(`💰 Custo médio calculado para ${produtoId}: R$ ${custoAtual.toFixed(2)} → R$ ${novoCustoMedio.toFixed(2)}`);

    // Atualizar preço do produto
    abaProdutos.getRange(produtoRow, CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO).setValue(novoCustoMedio);

    return {
      success: true,
      novoCustoMedio: novoCustoMedio,
      custoAnterior: custoAtual
    };

  } catch (error) {
    Logger.log(`❌ Erro ao atualizar custo médio: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ========================================
 * FUNÇÕES DE HISTÓRICO E RASTREAMENTO (v10.4)
 * ========================================
 */

/**
 * Registra histórico de custo de produto (v10.4)
 *
 * @param {object} dados - Dados do histórico
 * @param {string} dados.produtoId - ID do produto
 * @param {string} dados.produtoNome - Nome do produto
 * @param {number} dados.custoUnitario - Custo unitário novo
 * @param {number} dados.quantidade - Quantidade comprada
 * @param {string} dados.fornecedor - Fornecedor
 * @param {string} dados.numeroNF - Número da NF
 * @param {string} dados.nfId - ID da NF
 * @param {number} dados.custoAnterior - Custo anterior
 * @param {string} dados.responsavel - Responsável
 * @param {string} dados.observacoes - Observações
 * @returns {object} - { success, historicoId }
 */
function registrarHistoricoCusto(dados) {
  try {
    Logger.log('📊 Registrando histórico de custo...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let abaHistorico = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);

    // Criar aba se não existir
    if (!abaHistorico) {
      Logger.log('⚠️ Aba Histórico Custos não existe, criando...');
      criarAbaHistoricoCustos(ss);
      abaHistorico = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);
    }

    // Gerar ID
    const historicoId = 'HIST-' + Date.now();

    // Calcular variação percentual
    let variacaoPercentual = 0;
    if (dados.custoAnterior && dados.custoAnterior > 0) {
      variacaoPercentual = ((dados.custoUnitario - dados.custoAnterior) / dados.custoAnterior) * 100;
    }

    // Preparar linha
    const novaLinha = [
      historicoId,                                              // A - ID
      dados.produtoId,                                          // B - Produto ID
      dados.produtoNome,                                        // C - Produto Nome
      new Date(),                                               // D - Data
      dados.custoUnitario,                                      // E - Custo Unitário
      dados.quantidade || 0,                                    // F - Quantidade Comprada
      dados.fornecedor || '',                                   // G - Fornecedor
      dados.numeroNF || '',                                     // H - Número NF
      dados.nfId || '',                                         // I - NF ID
      dados.custoAnterior || 0,                                 // J - Custo Anterior
      variacaoPercentual,                                       // K - Variação %
      'ENTRADA',                                                // L - Tipo Movimentação
      dados.responsavel || Session.getActiveUser().getEmail(), // M - Responsável
      dados.observacoes || ''                                   // N - Observações
    ];

    abaHistorico.appendRow(novaLinha);

    Logger.log(`✅ Histórico de custo registrado: ${historicoId}`);
    Logger.log(`   Variação: ${variacaoPercentual.toFixed(2)}%`);

    return {
      success: true,
      historicoId: historicoId,
      variacaoPercentual: variacaoPercentual
    };

  } catch (error) {
    Logger.log('❌ Erro ao registrar histórico de custo: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registra item de Nota Fiscal na aba Itens NF (v10.4)
 *
 * @param {object} dados - Dados do item
 * @param {string} dados.nfId - ID da NF
 * @param {string} dados.produtoId - ID do produto (ou vazio se não mapeado)
 * @param {string} dados.produtoNome - Nome do produto
 * @param {string} dados.codigoNF - Código do produto na NF
 * @param {string} dados.descricaoNF - Descrição do produto na NF
 * @param {string} dados.ncm - NCM
 * @param {number} dados.quantidade - Quantidade
 * @param {string} dados.unidade - Unidade
 * @param {number} dados.valorUnitario - Valor unitário
 * @param {number} dados.valorTotal - Valor total
 * @param {boolean} dados.mapeado - Se foi mapeado
 * @param {number} dados.matchScore - Score do matching (0-1)
 * @returns {object} - { success, itemId }
 */
function registrarItemNF(dados) {
  try {
    Logger.log('📝 Registrando item de NF...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let abaItensNF = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

    // Criar aba se não existir
    if (!abaItensNF) {
      Logger.log('⚠️ Aba Itens NF não existe, criando...');
      criarAbaItensNotasFiscais(ss);
      abaItensNF = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);
    }

    // Gerar ID
    const itemId = 'ITNF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Preparar linha
    const novaLinha = [
      itemId,                          // A - ID
      dados.nfId,                      // B - NF ID
      dados.produtoId || '',           // C - Produto ID
      dados.produtoNome || '',         // D - Produto Nome
      dados.codigoNF || '',            // E - Código na NF
      dados.descricaoNF || '',         // F - Descrição na NF
      dados.ncm || '',                 // G - NCM
      dados.quantidade || 0,           // H - Quantidade
      dados.unidade || '',             // I - Unidade
      dados.valorUnitario || 0,        // J - Valor Unitário
      dados.valorTotal || 0,           // K - Valor Total
      dados.mapeado ? 'SIM' : 'NÃO',   // L - Mapeado
      dados.matchScore || 0,           // M - Match Score
      new Date()                       // N - Data Entrada
    ];

    abaItensNF.appendRow(novaLinha);

    Logger.log(`✅ Item de NF registrado: ${itemId}`);

    return {
      success: true,
      itemId: itemId
    };

  } catch (error) {
    Logger.log('❌ Erro ao registrar item de NF: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
