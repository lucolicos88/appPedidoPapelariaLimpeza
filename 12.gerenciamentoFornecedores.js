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

    Logger.log(`✅ ${fornecedores.length} fornecedores encontrados`);

    return serializarParaFrontend({
      success: true,
      fornecedores: fornecedores
    });

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

    // Verificar se CNPJ já existe (se fornecido) - v13.1.6: com normalização
    if (dadosFornecedor.cnpj) {
      const cnpjNovo = String(dadosFornecedor.cnpj).replace(/[^\d]/g, '').trim();

      if (cnpjNovo) {
        Logger.log(`🔍 Verificando se CNPJ ${cnpjNovo} já existe...`);

        const dados = abaFornecedores.getDataRange().getValues();
        for (let i = 1; i < dados.length; i++) {
          const cnpjExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];

          if (cnpjExistente) {
            const cnpjExistenteNormalizado = String(cnpjExistente).replace(/[^\d]/g, '').trim();

            if (cnpjExistenteNormalizado === cnpjNovo) {
              const nomeExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1];
              Logger.log(`❌ CNPJ ${cnpjNovo} já cadastrado para: ${nomeExistente}`);

              return {
                success: false,
                error: `CNPJ já cadastrado para o fornecedor: ${nomeExistente}`
              };
            }
          }
        }

        Logger.log(`✅ CNPJ ${cnpjNovo} disponível para cadastro`);
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

/**
 * Busca fornecedor por CNPJ (v13.1.3)
 */
function buscarFornecedorPorCNPJ(cnpj) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaFornecedores = ss.getSheetByName(CONFIG.ABAS.FORNECEDORES);

    if (!abaFornecedores) {
      return { success: false, error: 'Aba Fornecedores não encontrada' };
    }

    // Normalizar CNPJ buscado (remover formatação)
    const cnpjNormalizado = String(cnpj || '').replace(/[^\d]/g, '').trim();

    if (!cnpjNormalizado) {
      Logger.log('⚠️ CNPJ vazio ou inválido fornecido para busca');
      return { success: false, error: 'CNPJ vazio ou inválido' };
    }

    Logger.log(`🔍 Buscando fornecedor com CNPJ normalizado: ${cnpjNormalizado}`);

    const dados = abaFornecedores.getDataRange().getValues();

    for (let i = 1; i < dados.length; i++) {
      const cnpjFornecedor = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];

      if (cnpjFornecedor) {
        // Normalizar CNPJ do banco (remover formatação)
        const cnpjFornecedorNormalizado = String(cnpjFornecedor).replace(/[^\d]/g, '').trim();

        Logger.log(`   Comparando: "${cnpjFornecedorNormalizado}" === "${cnpjNormalizado}"`);

        if (cnpjFornecedorNormalizado === cnpjNormalizado) {
          Logger.log(`✅ FORNECEDOR ENCONTRADO! Nome: ${dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1]}`);

          const fornecedor = {
            id: dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1],
            nome: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1],
            nomeFantasia: dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME_FANTASIA - 1] || '',
            cnpj: cnpjFornecedor,
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
    }

    Logger.log(`❌ Fornecedor NÃO encontrado com CNPJ: ${cnpjNormalizado}`);
    return {
      success: false,
      error: 'Fornecedor não encontrado com este CNPJ'
    };

  } catch (error) {
    Logger.log('❌ Erro ao buscar fornecedor por CNPJ: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza fornecedor existente (v13.1)
 */
function atualizarFornecedor(dadosFornecedor) {
  try {
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem atualizar fornecedores.'
      };
    }

    // Validar dados obrigatórios
    if (!dadosFornecedor.id || !dadosFornecedor.nome) {
      return {
        success: false,
        error: 'ID e Nome do fornecedor são obrigatórios'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaFornecedores = ss.getSheetByName(CONFIG.ABAS.FORNECEDORES);

    if (!abaFornecedores) {
      return { success: false, error: 'Aba Fornecedores não encontrada' };
    }

    const dados = abaFornecedores.getDataRange().getValues();
    let linhaFornecedor = -1;

    // Encontrar linha do fornecedor
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1] === dadosFornecedor.id) {
        linhaFornecedor = i + 1;
        break;
      }
    }

    if (linhaFornecedor === -1) {
      return {
        success: false,
        error: 'Fornecedor não encontrado'
      };
    }

    // Verificar se CNPJ já existe em outro fornecedor (se fornecido e alterado)
    if (dadosFornecedor.cnpj) {
      for (let i = 1; i < dados.length; i++) {
        const cnpjExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];
        const idExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.ID - 1];
        if (cnpjExistente && cnpjExistente === dadosFornecedor.cnpj && idExistente !== dadosFornecedor.id) {
          return {
            success: false,
            error: 'CNPJ já cadastrado para outro fornecedor'
          };
        }
      }
    }

    // Atualizar fornecedor
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.NOME).setValue(dadosFornecedor.nome);
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.NOME_FANTASIA).setValue(dadosFornecedor.nomeFantasia || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.CNPJ).setValue(dadosFornecedor.cnpj || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.TELEFONE).setValue(dadosFornecedor.telefone || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.EMAIL).setValue(dadosFornecedor.email || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.ENDERECO).setValue(dadosFornecedor.endereco || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.CIDADE).setValue(dadosFornecedor.cidade || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.ESTADO).setValue(dadosFornecedor.estado || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.CEP).setValue(dadosFornecedor.cep || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.TIPO_PRODUTOS).setValue(dadosFornecedor.tipoProdutos || '');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.ATIVO).setValue(dadosFornecedor.ativo || 'Sim');
    abaFornecedores.getRange(linhaFornecedor, CONFIG.COLUNAS_FORNECEDORES.OBSERVACOES).setValue(dadosFornecedor.observacoes || '');

    // Registrar log
    registrarLog('FORNECEDOR_ATUALIZADO', `Fornecedor ${dadosFornecedor.nome} atualizado`, 'SUCESSO');

    return {
      success: true,
      message: 'Fornecedor atualizado com sucesso'
    };

  } catch (error) {
    Logger.log('❌ Erro ao atualizar fornecedor: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
