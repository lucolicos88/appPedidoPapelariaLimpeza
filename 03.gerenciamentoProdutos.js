/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v13.0
 * Módulo: Gerenciamento de Produtos
 * ========================================
 *
 * NOVIDADES v13.0:
 * - Estrutura com 18 colunas (dual code: Fornecedor + Neoformula)
 * - Campo FORNECEDOR_ID (FK para aba Fornecedores)
 * - Campo ORIGEM (MANUAL ou NF)
 * - Campo DADOS_COMPLETOS (SIM ou NÃO)
 * - Produtos podem ser cadastrados via NF com dados parciais
 * - Gestor completa dados Neoformula posteriormente
 *
 * NOVIDADES v8.0:
 * - Uso de CONFIG para mapeamento de colunas
 * - ImagemURL na coluna M (índice 13)
 * - Upload de imagens com preview
 * - Estoque mínimo e ponto de pedido
 *
 * MELHORIAS v6.0.1:
 * - Cache de produtos para otimização
 * - Validação robusta de entrada
 * - Tratamento de erros aprimorado
 */

/**
 * Cache de produtos (NOVO v6.0.1)
 * Usando var para compatibilidade com Google Apps Script
 */
var CACHE_PRODUTOS = CACHE_PRODUTOS || {};
var CACHE_PRODUTOS_TTL = 3 * 60 * 1000; // 3 minutos

/**
 * Lista produtos com filtros v13.0
 */
function listarProdutos(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();
    const produtos = [];

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias

      const descricaoNeoformula = dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '';
      const descricaoFornecedor = dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] || '';
      const codigoNeoformula = dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '';
      const codigoFornecedor = dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] || '';
      const dadosCompletos = dados[i][CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1] || 'SIM';

      const produto = {
        id: dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigoFornecedor: codigoFornecedor,
        descricaoFornecedor: descricaoFornecedor,
        fornecedorId: dados[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1] || '',
        codigoNeoformula: codigoNeoformula,
        descricaoNeoformula: descricaoNeoformula,
        tipo: dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
        categoria: dados[i][CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] || '',
        unidade: dados[i][CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1],
        precoUnitario: dados[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0,
        estoqueMinimo: dados[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] || 0,
        pontoPedido: dados[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] || 0,
        imagemURL: dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] || '',
        ncm: dados[i][CONFIG.COLUNAS_PRODUTOS.NCM - 1] || '',
        ativo: dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] !== undefined ? dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] : 'Sim',
        dataCadastro: dados[i][CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1],
        origem: dados[i][CONFIG.COLUNAS_PRODUTOS.ORIGEM - 1] || 'MANUAL',
        dadosCompletos: dadosCompletos,
        // Campos computados para compatibilidade com frontend
        // PRIORIZAR SEMPRE NEOFORMULA (dados internos) sobre Fornecedor
        codigo: codigoNeoformula || codigoFornecedor || 'SEM CÓDIGO',
        nome: descricaoNeoformula || descricaoFornecedor || 'Produto sem descrição'
      };

      // Aplicar filtros
      if (filtros) {
        if (filtros.tipo && produto.tipo !== filtros.tipo) continue;
        if (filtros.categoria && produto.categoria !== filtros.categoria) continue;
        if (filtros.ativo !== undefined && produto.ativo !== filtros.ativo) continue;
        if (filtros.origem && produto.origem !== filtros.origem) continue;
        if (filtros.dadosCompletos && produto.dadosCompletos !== filtros.dadosCompletos) continue;
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase();
          const encontrado =
            (produto.descricaoNeoformula && String(produto.descricaoNeoformula).toLowerCase().includes(busca)) ||
            (produto.descricaoFornecedor && String(produto.descricaoFornecedor).toLowerCase().includes(busca)) ||
            (produto.codigoNeoformula && String(produto.codigoNeoformula).toLowerCase().includes(busca)) ||
            (produto.codigoFornecedor && String(produto.codigoFornecedor).toLowerCase().includes(busca)) ||
            (produto.categoria && String(produto.categoria).toLowerCase().includes(busca));
          if (!encontrado) continue;
        }
      }

      produtos.push(produto);
    }

    return {
      success: true,
      produtos: produtos
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar produtos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Busca produto por ID ou código Neoformula (v13.0 - COM CACHE)
 */
function buscarProduto(identificador) {
  try {
    // Validar identificador
    if (!identificador || String(identificador).trim() === '') {
      return {
        success: false,
        error: 'Identificador inválido'
      };
    }

    const identificadorStr = String(identificador).trim();

    // Verificar cache
    const agora = new Date().getTime();
    if (CACHE_PRODUTOS[identificadorStr] &&
        (agora - CACHE_PRODUTOS[identificadorStr].timestamp < CACHE_PRODUTOS_TTL)) {
      Logger.log('✅ Produto recuperado do cache: ' + identificadorStr);
      return {
        success: true,
        produto: CACHE_PRODUTOS[identificadorStr].data
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const lastRow = abaProdutos.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: 'Produto não encontrado' };
    }

    const dados = abaProdutos.getRange(2, 1, lastRow - 1, CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS).getValues();

    for (let i = 0; i < dados.length; i++) {
      // Buscar por ID ou código Neoformula
      if (dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === identificadorStr ||
          dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] === identificadorStr) {
        const descricaoNeoformula = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '');
        const descricaoFornecedor = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] || '');
        const codigoNeoformula = String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '');
        const codigoFornecedor = String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] || '');
        const dadosCompletos = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1] || 'SIM');

        const produto = {
          id: String(dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]),
          codigoFornecedor: codigoFornecedor,
          descricaoFornecedor: descricaoFornecedor,
          fornecedorId: String(dados[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1] || ''),
          codigoNeoformula: codigoNeoformula,
          descricaoNeoformula: descricaoNeoformula,
          tipo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1]),
          categoria: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] || ''),
          unidade: String(dados[i][CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1]),
          precoUnitario: parseFloat(dados[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1]) || 0,
          estoqueMinimo: parseInt(dados[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1]) || 0,
          pontoPedido: parseInt(dados[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1]) || 0,
          imagemURL: String(dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] || ''),
          ncm: String(dados[i][CONFIG.COLUNAS_PRODUTOS.NCM - 1] || ''),
          ativo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] !== undefined ? dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] : 'Sim'),
          dataCadastro: dados[i][CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1],
          origem: String(dados[i][CONFIG.COLUNAS_PRODUTOS.ORIGEM - 1] || 'MANUAL'),
          dadosCompletos: dadosCompletos,
          // Campos computados para compatibilidade com frontend
          // PRIORIZAR SEMPRE NEOFORMULA (dados internos) sobre Fornecedor
          codigo: codigoNeoformula || codigoFornecedor || 'SEM CÓDIGO',
          nome: descricaoNeoformula || descricaoFornecedor || 'Produto sem descrição'
        };

        // Armazenar no cache (por ID e por código Neoformula)
        CACHE_PRODUTOS[produto.id] = {
          data: produto,
          timestamp: agora
        };
        if (produto.codigoNeoformula) {
          CACHE_PRODUTOS[produto.codigoNeoformula] = {
            data: produto,
            timestamp: agora
          };
        }

        return {
          success: true,
          produto: produto
        };
      }
    }

    return {
      success: false,
      error: 'Produto não encontrado'
    };

  } catch (error) {
    Logger.log('❌ Erro ao buscar produto: ' + error.message);
    Logger.log(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Limpa cache de produtos (NOVO v6.0.1)
 */
function limparCacheProdutos(identificador) {
  if (identificador) {
    delete CACHE_PRODUTOS[identificador];
  } else {
    // Limpar todo o cache
    Object.keys(CACHE_PRODUTOS).forEach(key => {
      delete CACHE_PRODUTOS[key];
    });
  }
}

/**
 * Cadastra novo produto (v6.0 - com suporte a imagem)
 */
/**
 * Cadastrar Produto v13.0 - MANUAL (com dados completos)
 */
function cadastrarProduto(dadosProduto) {
  try {
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem cadastrar produtos.'
      };
    }

    // Validar dados obrigatórios (v13)
    if (!dadosProduto.codigoFornecedor || !dadosProduto.descricaoFornecedor) {
      return {
        success: false,
        error: 'Código e descrição do fornecedor são obrigatórios'
      };
    }

    if (!dadosProduto.codigoNeoformula || !dadosProduto.descricaoNeoformula) {
      return {
        success: false,
        error: 'Código e descrição Neoformula são obrigatórios'
      };
    }

    if (!dadosProduto.tipo) {
      return {
        success: false,
        error: 'Tipo do produto é obrigatório'
      };
    }

    if (!dadosProduto.fornecedorId) {
      return {
        success: false,
        error: 'Fornecedor é obrigatório. Cadastre o fornecedor primeiro.'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    // Verificar se código Neoformula já existe
    const dados = abaProdutos.getDataRange().getValues();
    for (let i = 1; i < dados.length; i++) {
      const codigoExistente = dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1];
      if (codigoExistente && codigoExistente === dadosProduto.codigoNeoformula) {
        return {
          success: false,
          error: 'Código Neoformula já existe'
        };
      }
    }

    // Gerar ID único
    const id = Utilities.getUuid();

    // Se tiver imagem, fazer upload
    let imagemURL = '';
    if (dadosProduto.imagemBase64) {
      const resultadoUpload = uploadImagemProduto({
        base64Data: dadosProduto.imagemBase64,
        fileName: dadosProduto.imagemFileName || 'produto.jpg',
        mimeType: dadosProduto.imagemMimeType || 'image/jpeg',
        produtoId: id,
        produtoNome: dadosProduto.descricaoNeoformula,
        tipo: dadosProduto.tipo
      });

      if (resultadoUpload.success) {
        imagemURL = resultadoUpload.imageUrl;
      } else {
        Logger.log('⚠️ Erro ao fazer upload da imagem: ' + resultadoUpload.error);
      }
    }

    // Adicionar produto usando CONFIG v13
    const novoProduto = [];
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ID - 1] = id;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] = dadosProduto.codigoFornecedor;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] = dadosProduto.descricaoFornecedor;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1] = dadosProduto.fornecedorId; // v13
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] = dadosProduto.codigoNeoformula;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] = dadosProduto.descricaoNeoformula;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.TIPO - 1] = dadosProduto.tipo;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] = dadosProduto.categoria || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1] = dadosProduto.unidade || 'UN';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] = dadosProduto.precoUnitario || 0;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] = dadosProduto.estoqueMinimo || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] = dadosProduto.pontoPedido || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] = imagemURL;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.NCM - 1] = dadosProduto.ncm || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] = 'Sim';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1] = new Date();
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ORIGEM - 1] = 'MANUAL'; // v13
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1] = 'SIM'; // v13 - produto manual tem dados completos

    abaProdutos.appendRow(novoProduto);

    // Criar registro de estoque inicial usando CONFIG
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    if (abaEstoque) {
      const novoEstoque = [];
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.ID - 1] = Utilities.getUuid();
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] = id;
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_NOME - 1] = dadosProduto.descricaoNeoformula;
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] = 0;
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_RESERVADA - 1] = 0;
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL - 1] = 0;
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO - 1] = new Date();
      novoEstoque[CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL - 1] = email;
      abaEstoque.appendRow(novoEstoque);
    }

    // Registrar log
    registrarLog('PRODUTO_CADASTRADO', `Produto ${dadosProduto.descricaoNeoformula} cadastrado`, 'SUCESSO');

    return {
      success: true,
      message: 'Produto cadastrado com sucesso',
      produtoId: id,
      imagemURL: imagemURL
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao cadastrar produto: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza dados de um produto (v13.0)
 */
function atualizarProdutoCore(produtoId, dadosAtualizados) {
  try {
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem atualizar produtos.'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();

    // Procurar produto
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === produtoId) {
        // Atualizar campos usando CONFIG v13
        if (dadosAtualizados.codigoFornecedor !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR).setValue(dadosAtualizados.codigoFornecedor);
        }
        if (dadosAtualizados.descricaoFornecedor !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR).setValue(dadosAtualizados.descricaoFornecedor);
        }
        if (dadosAtualizados.fornecedorId !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID).setValue(dadosAtualizados.fornecedorId);
        }
        if (dadosAtualizados.codigoNeoformula !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA).setValue(dadosAtualizados.codigoNeoformula);
        }
        if (dadosAtualizados.descricaoNeoformula !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA).setValue(dadosAtualizados.descricaoNeoformula);
        }
        if (dadosAtualizados.tipo !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.TIPO).setValue(dadosAtualizados.tipo);
        }
        if (dadosAtualizados.categoria !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.CATEGORIA).setValue(dadosAtualizados.categoria);
        }
        if (dadosAtualizados.unidade !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.UNIDADE).setValue(dadosAtualizados.unidade);
        }
        if (dadosAtualizados.precoUnitario !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO).setValue(dadosAtualizados.precoUnitario);
        }
        if (dadosAtualizados.estoqueMinimo !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO).setValue(dadosAtualizados.estoqueMinimo);
        }
        if (dadosAtualizados.pontoPedido !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO).setValue(dadosAtualizados.pontoPedido);
        }
        if (dadosAtualizados.ncm !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.NCM).setValue(dadosAtualizados.ncm);
        }
        if (dadosAtualizados.ativo !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.ATIVO).setValue(dadosAtualizados.ativo);
        }

        // Atualizar imagem se fornecida
        if (dadosAtualizados.imagemBase64) {
          const resultadoUpload = uploadImagemProduto({
            base64Data: dadosAtualizados.imagemBase64,
            fileName: dadosAtualizados.imagemFileName || 'produto.jpg',
            mimeType: dadosAtualizados.imagemMimeType || 'image/jpeg',
            produtoId: produtoId,
            produtoNome: dadosAtualizados.descricaoNeoformula || dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1],
            tipo: dadosAtualizados.tipo || dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1]
          });

          if (resultadoUpload.success) {
            abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL).setValue(resultadoUpload.imageUrl);
          }
        }

        // IMPORTANTE: Atualizar DADOS_COMPLETOS se campos Neoformula foram preenchidos
        const codigoNeo = dadosAtualizados.codigoNeoformula !== undefined ?
          dadosAtualizados.codigoNeoformula :
          dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1];
        const descNeo = dadosAtualizados.descricaoNeoformula !== undefined ?
          dadosAtualizados.descricaoNeoformula :
          dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1];

        if (codigoNeo && descNeo) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS).setValue('SIM');
        } else {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS).setValue('NÃO');
        }

        // Limpar cache
        limparCacheProdutos(produtoId);

        // Registrar log
        const nomeProduto = descNeo || dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1];
        registrarLog('PRODUTO_ATUALIZADO', `Produto ${nomeProduto} atualizado`, 'SUCESSO');

        return {
          success: true,
          message: 'Produto atualizado com sucesso'
        };
      }
    }

    return {
      success: false,
      error: 'Produto não encontrado'
    };

  } catch (error) {
    Logger.log('❌ Erro ao atualizar produto: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove (desativa) um produto
 */
function removerProduto(produtoId) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Somente administradores podem remover produtos.'
      };
    }
    
    return atualizarProduto(produtoId, { ativo: 'Não' });
    
  } catch (error) {
    Logger.log('❌ Erro ao remover produto: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exporta produtos para CSV (v14.0.5)
 */
function exportarProdutosCSV() {
  try {
    const resultado = listarProdutos();

    if (!resultado.success) {
      return resultado;
    }

    // UTF-8 BOM para garantir acentuação correta + delimitador ; (PT-BR)
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'ID;Código;Nome;Tipo;Categoria;Unidade;Preço Unitário;Estoque Mínimo;Ponto de Pedido;Fornecedor;Ativo;Data Cadastro\n';

    resultado.produtos.forEach(produto => {
      // Escapar aspas duplas e usar delimitador ;
      const linha = [
        produto.id,
        produto.codigo,
        produto.nome,
        produto.tipo,
        produto.categoria,
        produto.unidade,
        produto.precoUnitario,
        produto.estoqueMinimo,
        produto.pontoPedido,
        produto.fornecedor,
        produto.ativo,
        produto.dataCadastro
      ].map(campo => {
        let valor = String(campo || '');
        valor = valor.replace(/"/g, '""'); // Escapar aspas duplas
        return `"${valor}"`;
      });
      csv += linha.join(';') + '\n';
    });

    return {
      success: true,
      csv: csv,
      fileName: `produtos_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.csv`
    };

  } catch (error) {
    Logger.log('❌ Erro ao exportar produtos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém análise de produtos (v13.0)
 */
function getAnaliseProdutos() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

    if (!abaProdutos || !abaEstoque) {
      return { success: false, error: 'Abas não encontradas' };
    }

    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const dadosEstoque = abaEstoque.getDataRange().getValues();

    let totalProdutos = 0;
    let produtosAtivos = 0;
    let produtosEstoqueBaixo = 0;
    let produtosPontoPedido = 0;
    let valorTotalEstoque = 0;
    let produtosDadosCompletos = 0;
    let produtosDadosIncompletos = 0;

    const produtosEmAlerta = [];

    for (let i = 1; i < dadosProdutos.length; i++) {
      if (!dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]) continue;

      totalProdutos++;

      if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] === 'Sim') {
        produtosAtivos++;
      }

      // Contar dados completos vs incompletos
      const dadosCompletos = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1];
      if (dadosCompletos === 'SIM') {
        produtosDadosCompletos++;
      } else {
        produtosDadosIncompletos++;
      }

      const produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
      // Priorizar descrição Neoformula, se não existir usar descrição Fornecedor
      const produtoNome = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] ||
                          dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1];
      const estoqueMinimo = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] || 0;
      const pontoPedido = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] || 0;
      const precoUnitario = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0;

      // Buscar estoque atual usando CONFIG
      let qtdAtual = 0;
      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === produtoId) {
          qtdAtual = dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
          break;
        }
      }

      valorTotalEstoque += qtdAtual * precoUnitario;

      // Verificar alertas
      if (qtdAtual <= estoqueMinimo && estoqueMinimo > 0) {
        produtosEstoqueBaixo++;
        produtosEmAlerta.push({
          nome: produtoNome,
          qtdAtual: qtdAtual,
          estoqueMinimo: estoqueMinimo,
          tipo: 'ESTOQUE_BAIXO'
        });
      }

      if (qtdAtual <= pontoPedido && pontoPedido > 0) {
        produtosPontoPedido++;
        if (!produtosEmAlerta.find(p => p.nome === produtoNome)) {
          produtosEmAlerta.push({
            nome: produtoNome,
            qtdAtual: qtdAtual,
            pontoPedido: pontoPedido,
            tipo: 'PONTO_PEDIDO'
          });
        }
      }
    }

    return {
      success: true,
      analise: {
        totalProdutos: totalProdutos,
        produtosAtivos: produtosAtivos,
        produtosEstoqueBaixo: produtosEstoqueBaixo,
        produtosPontoPedido: produtosPontoPedido,
        valorTotalEstoque: valorTotalEstoque,
        produtosDadosCompletos: produtosDadosCompletos,
        produtosDadosIncompletos: produtosDadosIncompletos,
        produtosEmAlerta: produtosEmAlerta
      }
    };

  } catch (error) {
    Logger.log('❌ Erro ao obter análise de produtos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém apenas produtos em alerta (v13.0)
 * Usado na aba Movimentações
 */
function getProdutosEmAlerta() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

    if (!abaProdutos || !abaEstoque) {
      return { success: false, error: 'Abas não encontradas' };
    }

    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const dadosEstoque = abaEstoque.getDataRange().getValues();

    const produtosAlerta = [];

    for (let i = 1; i < dadosProdutos.length; i++) {
      if (!dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]) continue;

      const produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
      // Priorizar descrição Neoformula, se não existir usar descrição Fornecedor
      const produtoNome = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] ||
                          dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1];
      const estoqueMinimo = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] || 0;
      const pontoPedido = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] || 0;

      // Buscar estoque atual
      let qtdAtual = 0;
      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === produtoId) {
          qtdAtual = dadosEstoque[j][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
          break;
        }
      }

      // Verificar alertas
      if (qtdAtual <= estoqueMinimo && estoqueMinimo > 0) {
        produtosAlerta.push({
          nome: produtoNome,
          qtdAtual: qtdAtual,
          estoqueMinimo: estoqueMinimo,
          tipo: 'ESTOQUE_BAIXO'
        });
      } else if (qtdAtual <= pontoPedido && pontoPedido > 0) {
        produtosAlerta.push({
          nome: produtoNome,
          qtdAtual: qtdAtual,
          pontoPedido: pontoPedido,
          tipo: 'PONTO_PEDIDO'
        });
      }
    }

    return {
      success: true,
      produtosAlerta: produtosAlerta
    };

  } catch (error) {
    Logger.log('❌ Erro ao obter produtos em alerta: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ========================================
 * FUNÇÃO OBSOLETA - REMOVIDA EM v13.0
 * ========================================
 *
 * cadastrarProdutoAutomatico() foi substituída por processarProdutosNF()
 * em 13.processarNFv13.js
 *
 * A v13 usa um fluxo completamente novo de cadastro automático via NF.
 */

/**
 * ========================================
 * FUNÇÕES v15.0 - MÚLTIPLOS FORNECEDORES
 * ========================================
 */

/**
 * Lista códigos Neoformula únicos já cadastrados (v15.0)
 * Para autocomplete no modal de edição
 */
function listarCodigosNeoUnicos() {
  try {
    Logger.log('📋 Listando códigos NEO únicos...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();
    const codigos = {};

    // Usar objeto para garantir unicidade por código
    for (let i = 1; i < dados.length; i++) {
      const codigoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '').trim();
      const descricaoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '').trim();

      if (codigoNeo) {
        // Se código já existe, mantém a primeira descrição encontrada
        if (!codigos[codigoNeo]) {
          codigos[codigoNeo] = descricaoNeo;
        }
      }
    }

    // Converter para array de objetos
    const lista = Object.keys(codigos).map(codigo => ({
      codigo: codigo,
      descricao: codigos[codigo]
    }));

    // Ordenar por código
    lista.sort((a, b) => a.codigo.localeCompare(b.codigo));

    Logger.log(`✅ Encontrados ${lista.length} códigos NEO únicos`);

    return {
      success: true,
      codigos: lista
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar códigos NEO: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista descrições Neoformula únicas já cadastradas (v15.0)
 * Para autocomplete no modal de edição
 */
function listarDescricoesNeoUnicas() {
  try {
    Logger.log('📋 Listando descrições NEO únicas...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();
    const descricoes = {};

    // Usar objeto para garantir unicidade por descrição
    for (let i = 1; i < dados.length; i++) {
      const codigoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '').trim();
      const descricaoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '').trim();

      if (descricaoNeo) {
        // Se descrição já existe, mantém o primeiro código encontrado
        if (!descricoes[descricaoNeo]) {
          descricoes[descricaoNeo] = codigoNeo;
        }
      }
    }

    // Converter para array de objetos
    const lista = Object.keys(descricoes).map(descricao => ({
      descricao: descricao,
      codigo: descricoes[descricao]
    }));

    // Ordenar por descrição
    lista.sort((a, b) => a.descricao.localeCompare(b.descricao));

    Logger.log(`✅ Encontradas ${lista.length} descrições NEO únicas`);

    return {
      success: true,
      descricoes: lista
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar descrições NEO: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista produtos agrupados por código Neoformula (v15.0)
 * Retorna cada produto NEO com todos os seus fornecedores
 */
function listarProdutosAgrupadosPorNeo() {
  try {
    Logger.log('📋 Listando produtos agrupados por código NEO...');

    const resultado = listarProdutos({});

    if (!resultado.success) {
      return resultado;
    }

    const agrupados = {};

    // Agrupar produtos por código NEO
    resultado.produtos.forEach(produto => {
      // Usar código NEO como chave, ou ID do produto se não tiver NEO
      const chave = produto.codigoNeoformula || produto.id;

      if (!agrupados[chave]) {
        agrupados[chave] = {
          codigoNeo: produto.codigoNeoformula,
          descricaoNeo: produto.descricaoNeoformula,
          tipo: produto.tipo,
          categoria: produto.categoria,
          unidade: produto.unidade,
          ativo: produto.ativo,
          cadastroCompleto: produto.codigoNeoformula && produto.descricaoNeoformula,
          fornecedores: []
        };
      }

      // Adicionar fornecedor
      agrupados[chave].fornecedores.push({
        id: produto.id,
        fornecedorId: produto.fornecedorId,
        codigoFornecedor: produto.codigoFornecedor,
        descricaoFornecedor: produto.descricaoFornecedor,
        precoUnitario: produto.precoUnitario,
        estoqueMinimo: produto.estoqueMinimo,
        pontoPedido: produto.pontoPedido,
        imagemURL: produto.imagemURL,  // v16.0: Incluir URL da imagem
        ativo: produto.ativo,
        dataCadastro: produto.dataCadastro
      });
    });

    // Converter para array
    const lista = Object.values(agrupados);

    // v16.0: Ordenar por código NEO (com proteção para valores null/undefined)
    lista.sort((a, b) => {
      // Converter para string explicitamente
      const codigoA = String(a.codigoNeo || '');
      const codigoB = String(b.codigoNeo || '');

      // Produtos sem código NEO vão para o final
      if (!codigoA && codigoB) return 1;
      if (codigoA && !codigoB) return -1;
      if (!codigoA && !codigoB) return 0;

      return codigoA.localeCompare(codigoB);
    });

    Logger.log(`✅ ${lista.length} produtos agrupados, ${resultado.produtos.length} fornecedores total`);

    return {
      success: true,
      produtos: lista
    };

  } catch (error) {
    Logger.log('❌ Erro ao agrupar produtos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista apenas produtos com cadastro completo (v15.0)
 * Cadastro completo = Código NEO + Descrição NEO preenchidos
 */
function listarProdutosCompletos(filtros) {
  try {
    Logger.log('📋 Listando apenas produtos com cadastro completo...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();
    const produtos = [];

    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][0]) continue; // Pular linhas vazias

      const codigoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] || '').trim();
      const descricaoNeo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] || '').trim();
      const ativo = String(dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] || 'Sim');

      // Verificar se cadastro está completo
      const cadastroCompleto = codigoNeo !== '' && descricaoNeo !== '';

      if (!cadastroCompleto || ativo !== 'Sim') {
        continue; // Pular produtos incompletos ou inativos
      }

      // Montar objeto produto (mesma estrutura de listarProdutos)
      const produto = {
        id: dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigoFornecedor: dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] || '',
        descricaoFornecedor: dados[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] || '',
        fornecedorId: dados[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1] || '',
        codigoNeoformula: codigoNeo,
        descricaoNeoformula: descricaoNeo,
        tipo: dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
        categoria: dados[i][CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] || '',
        unidade: dados[i][CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1],
        precoUnitario: dados[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0,
        estoqueMinimo: dados[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] || 0,
        pontoPedido: dados[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] || 0,
        imagemURL: dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] || '',
        ncm: dados[i][CONFIG.COLUNAS_PRODUTOS.NCM - 1] || '',
        ativo: ativo,
        dataCadastro: dados[i][CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1],
        origem: dados[i][CONFIG.COLUNAS_PRODUTOS.ORIGEM - 1] || 'MANUAL',
        dadosCompletos: 'SIM',
        // Campos computados
        codigo: codigoNeo,
        nome: descricaoNeo
      };

      // Aplicar filtros adicionais se fornecidos
      if (filtros) {
        if (filtros.tipo && produto.tipo !== filtros.tipo) continue;
        if (filtros.categoria && produto.categoria !== filtros.categoria) continue;
      }

      produtos.push(produto);
    }

    Logger.log(`✅ ${produtos.length} produtos com cadastro completo`);

    return {
      success: true,
      produtos: produtos
    };

  } catch (error) {
    Logger.log('❌ Erro ao listar produtos completos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
