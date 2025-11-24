/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v13.0
 * Módulo: Gerenciamento de Fornecedores
 * ========================================
 *
 * FUNCIONALIDADES:
 * - Cadastro de fornecedores
 * - Listagem de fornecedores
 * - Busca de fornecedores
 * - Atualização de dados
 */

/**
 * Lista todos os fornecedores ativos
 */
function listarFornecedores(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaFornecedores = ss.getSheetByName(CONFIG.ABAS.FORNECEDORES);

    if (!abaFornecedores) {
      return { success: false, error: 'Aba Fornecedores não encontrada. Execute setupPlanilha()' };
    }

    const dados = abaFornecedores.getDataRange().getValues();
    const fornecedores = [];

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1]) continue;

      const fornecedor = {
        id: dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1],
        nome: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1],
        nomeFantasia: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME_FANTASIA - 1] || '',
        cnpj: dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1] || '',
        telefone: dados[i][CONFIG.COLUNAS_FORNECEDORES.TELEFONE - 1] || '',
        email: dados[i][CONFIG.COLUNAS_FORNECEDORES.EMAIL - 1] || '',
        endereco: dados[i][CONFIG.COLUNAS_FORNECEDORES.ENDERECO - 1] || '',
        cidade: dados[i][CONFIG.COLUNAS_FORNECEDORES.CIDADE - 1] || '',
        estado: dados[i][CONFIG.COLUNAS_FORNECEDORES.ESTADO - 1] || '',
        cep: dados[i][CONFIG.COLUNAS_FORNECEDORES.CEP - 1] || '',
        tipoProdutos: dados[i][CONFIG.COLUNAS_FORNECEDORES.TIPO_PRODUTOS - 1] || '',
        ativo: dados[i][CONFIG.COLUNAS_FORNECEDORES.ATIVO - 1],
        dataCadastro: dados[i][CONFIG.COLUNAS_FORNECEDORES.DATA_CADASTRO - 1],
        observacoes: dados[i][CONFIG.COLUNAS_FORNECEDORES.OBSERVACOES - 1] || ''
      };

      // Aplicar filtros
      if (filtros) {
        if (filtros.ativo !== undefined && fornecedor.ativo !== filtros.ativo) continue;
        if (filtros.tipoProdutos && fornecedor.tipoProdutos !== filtros.tipoProdutos) continue;
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase();
          const encontrado =
            fornecedor.nome.toLowerCase().includes(busca) ||
            (fornecedor.nomeFantasia && fornecedor.nomeFantasia.toLowerCase().includes(busca)) ||
            (fornecedor.cnpj && fornecedor.cnpj.includes(busca));
          if (!encontrado) continue;
        }
      }

      fornecedores.push(fornecedor);
    }

    return {
      success: true,
      fornecedores: fornecedores
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar fornecedores: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cadastra novo fornecedor
 */
function cadastrarFornecedor(dadosFornecedor) {
  try {
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem cadastrar fornecedores.'
      };
    }

    // Validar dados obrigatórios
    if (!dadosFornecedor.nome) {
      return {
        success: false,
        error: 'Nome do fornecedor é obrigatório'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaFornecedores = ss.getSheetByName(CONFIG.ABAS.FORNECEDORES);

    if (!abaFornecedores) {
      return { success: false, error: 'Aba Fornecedores não encontrada' };
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (dadosFornecedor.cnpj) {
      const dados = abaFornecedores.getDataRange().getValues();
      for (let i = 1; i < dados.length; i++) {
        const cnpjExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];
        if (cnpjExistente && cnpjExistente === dadosFornecedor.cnpj) {
          return {
            success: false,
            error: 'CNPJ já cadastrado'
          };
        }
      }
    }

    // Gerar ID único
    const id = Utilities.getUuid();

    // Criar novo fornecedor
    const novoFornecedor = [];
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.ID - 1] = id;
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.NOME - 1] = dadosFornecedor.nome;
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.NOME_FANTASIA - 1] = dadosFornecedor.nomeFantasia || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1] = dadosFornecedor.cnpj || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.TELEFONE - 1] = dadosFornecedor.telefone || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.EMAIL - 1] = dadosFornecedor.email || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.ENDERECO - 1] = dadosFornecedor.endereco || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.CIDADE - 1] = dadosFornecedor.cidade || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.ESTADO - 1] = dadosFornecedor.estado || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.CEP - 1] = dadosFornecedor.cep || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.TIPO_PRODUTOS - 1] = dadosFornecedor.tipoProdutos || '';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.ATIVO - 1] = 'Sim';
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.DATA_CADASTRO - 1] = new Date();
    novoFornecedor[CONFIG.COLUNAS_FORNECEDORES.OBSERVACOES - 1] = dadosFornecedor.observacoes || '';

    abaFornecedores.appendRow(novoFornecedor);

    // Registrar log
    registrarLog('FORNECEDOR_CADASTRADO', `Fornecedor ${dadosFornecedor.nome} cadastrado`, 'SUCESSO');

    return {
      success: true,
      message: 'Fornecedor cadastrado com sucesso',
      fornecedorId: id
    };

  } catch (error) {
    Logger.log('❌ Erro ao cadastrar fornecedor: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Busca fornecedor por ID
 */
function buscarFornecedor(fornecedorId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaFornecedores = ss.getSheetByName(CONFIG.ABAS.FORNECEDORES);

    if (!abaFornecedores) {
      return { success: false, error: 'Aba Fornecedores não encontrada' };
    }

    const dados = abaFornecedores.getDataRange().getValues();

    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1] === fornecedorId) {
        const fornecedor = {
          id: dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1],
          nome: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1],
          nomeFantasia: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME_FANTASIA - 1] || '',
          cnpj: dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1] || '',
          telefone: dados[i][CONFIG.COLUNAS_FORNECEDORES.TELEFONE - 1] || '',
          email: dados[i][CONFIG.COLUNAS_FORNECEDORES.EMAIL - 1] || '',
          endereco: dados[i][CONFIG.COLUNAS_FORNECEDORES.ENDERECO - 1] || '',
          cidade: dados[i][CONFIG.COLUNAS_FORNECEDORES.CIDADE - 1] || '',
          estado: dados[i][CONFIG.COLUNAS_FORNECEDORES.ESTADO - 1] || '',
          cep: dados[i][CONFIG.COLUNAS_FORNECEDORES.CEP - 1] || '',
          tipoProdutos: dados[i][CONFIG.COLUNAS_FORNECEDORES.TIPO_PRODUTOS - 1] || '',
          ativo: dados[i][CONFIG.COLUNAS_FORNECEDORES.ATIVO - 1],
          dataCadastro: dados[i][CONFIG.COLUNAS_FORNECEDORES.DATA_CADASTRO - 1],
          observacoes: dados[i][CONFIG.COLUNAS_FORNECEDORES.OBSERVACOES - 1] || ''
        };

        return {
          success: true,
          fornecedor: fornecedor
        };
      }
    }

    return {
      success: false,
      error: 'Fornecedor não encontrado'
    };

  } catch (error) {
    Logger.log('❌ Erro ao buscar fornecedor: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista fornecedores ativos para dropdown (apenas ID e Nome)
 */
function listarFornecedoresParaDropdown() {
  try {
    const resultado = listarFornecedores({ ativo: 'Sim' });

    if (!resultado.success) {
      return resultado;
    }

    const fornecedoresSimples = resultado.fornecedores.map(f => ({
      id: f.id,
      nome: f.nomeFantasia || f.nome,
      cnpj: f.cnpj
    }));

    return {
      success: true,
      fornecedores: fornecedoresSimples
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar fornecedores para dropdown: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
