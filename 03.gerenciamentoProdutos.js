/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * Módulo: Gerenciamento de Produtos
 * ========================================
 *
 * NOVIDADES v8.0:
 * - Uso de CONFIG para mapeamento de colunas
 * - ImagemURL na coluna K (índice 11)
 * - Compatibilidade total com estrutura v8.0
 *
 * NOVIDADES v6.0:
 * - Upload de imagens com preview
 * - Renomeação inteligente de arquivos
 * - Estoque mínimo e ponto de pedido
 * - Histórico de produtos
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
 * Lista produtos com filtros v6.0
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

      const produto = {
        id: dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigo: dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO - 1],
        nome: dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1],
        tipo: dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
        categoria: dados[i][CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1],
        unidade: dados[i][CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1],
        precoUnitario: dados[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1],
        estoqueMinimo: dados[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] || 0,
        pontoPedido: dados[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] || 0,
        fornecedor: dados[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR - 1],
        imagemURL: dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] || '',
        ativo: dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] !== undefined ? dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] : 'Sim',
        dataCadastro: dados[i][CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1]
      };
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.tipo && produto.tipo !== filtros.tipo) continue;
        if (filtros.categoria && produto.categoria !== filtros.categoria) continue;
        if (filtros.ativo !== undefined && produto.ativo !== filtros.ativo) continue;
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase();
          const encontrado = 
            produto.nome.toLowerCase().includes(busca) ||
            produto.codigo.toLowerCase().includes(busca) ||
            produto.categoria.toLowerCase().includes(busca);
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
 * Busca produto por ID ou código (v6.0.1 - COM CACHE)
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

    const dados = abaProdutos.getRange(2, 1, lastRow - 1, CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO).getValues();

    for (let i = 0; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === identificadorStr ||
          dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO - 1] === identificadorStr) {
        const produto = {
          id: String(dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]),
          codigo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO - 1]),
          nome: String(dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1]),
          tipo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1]),
          categoria: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1]),
          unidade: String(dados[i][CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1]),
          precoUnitario: parseFloat(dados[i][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1]) || 0,
          estoqueMinimo: parseInt(dados[i][CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1]) || 0,
          pontoPedido: parseInt(dados[i][CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1]) || 0,
          fornecedor: String(dados[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR - 1] || ''),
          imagemURL: String(dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] || ''),
          ativo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] !== undefined ? dados[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] : 'Sim'),
          dataCadastro: dados[i][CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1]
        };

        // Armazenar no cache (tanto por ID quanto por código)
        CACHE_PRODUTOS[produto.id] = {
          data: produto,
          timestamp: agora
        };
        CACHE_PRODUTOS[produto.codigo] = {
          data: produto,
          timestamp: agora
        };

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
 * Cadastrar Produto v12.0 - com duplo código (Fornecedor + Neoformula)
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

    // Validar dados obrigatórios (v12 - novos campos)
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

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    // Verificar se código Neoformula já existe
    const dados = abaProdutos.getDataRange().getValues();
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] === dadosProduto.codigoNeoformula) {
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

    // Adicionar produto usando CONFIG v12
    const novoProduto = [];
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ID - 1] = id;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] = dadosProduto.codigoFornecedor;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] = dadosProduto.descricaoFornecedor;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] = dadosProduto.codigoNeoformula;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] = dadosProduto.descricaoNeoformula;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.TIPO - 1] = dadosProduto.tipo;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] = dadosProduto.categoria || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1] = dadosProduto.unidade || 'UN';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] = dadosProduto.precoUnitario || 0;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] = dadosProduto.estoqueMinimo || 0;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] = dadosProduto.pontoPedido || 0;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.FORNECEDOR - 1] = dadosProduto.fornecedor || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] = imagemURL;
    novoProduto[CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] = 'Sim';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1] = new Date();
    novoProduto[CONFIG.COLUNAS_PRODUTOS.NCM - 1] = dadosProduto.ncm || '';
    novoProduto[CONFIG.COLUNAS_PRODUTOS.MAPEAMENTO_CODIGOS - 1] = '';

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
 * Atualiza dados de um produto (Core - v10.1)
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
        // Atualizar campos usando CONFIG
        if (dadosAtualizados.codigo) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.CODIGO).setValue(dadosAtualizados.codigo);
        }
        if (dadosAtualizados.nome) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.NOME).setValue(dadosAtualizados.nome);
        }
        if (dadosAtualizados.tipo) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.TIPO).setValue(dadosAtualizados.tipo);
        }
        if (dadosAtualizados.categoria) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.CATEGORIA).setValue(dadosAtualizados.categoria);
        }
        if (dadosAtualizados.unidade) {
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
        if (dadosAtualizados.fornecedor) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.FORNECEDOR).setValue(dadosAtualizados.fornecedor);
        }

        // Atualizar imagem se fornecida
        if (dadosAtualizados.imagemBase64) {
          const resultadoUpload = uploadImagemProduto({
            base64Data: dadosAtualizados.imagemBase64,
            fileName: dadosAtualizados.imagemFileName || 'produto.jpg',
            mimeType: dadosAtualizados.imagemMimeType || 'image/jpeg',
            produtoId: produtoId,
            produtoNome: dadosAtualizados.nome || dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1],
            tipo: dadosAtualizados.tipo || dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1]
          });

          if (resultadoUpload.success) {
            abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL).setValue(resultadoUpload.imageUrl);
          }
        }

        if (dadosAtualizados.ativo !== undefined) {
          abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.ATIVO).setValue(dadosAtualizados.ativo);
        }

        // Registrar log
        registrarLog('PRODUTO_ATUALIZADO', `Produto ${dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1]} atualizado`, 'SUCESSO');

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
 * Exporta produtos para CSV
 */
function exportarProdutosCSV() {
  try {
    const resultado = listarProdutos();
    
    if (!resultado.success) {
      return resultado;
    }
    
    let csv = 'ID,Código,Nome,Tipo,Categoria,Unidade,Preço Unitário,Estoque Mínimo,Ponto de Pedido,Fornecedor,Ativo,Data Cadastro\n';
    
    resultado.produtos.forEach(produto => {
      csv += `"${produto.id}","${produto.codigo}","${produto.nome}","${produto.tipo}","${produto.categoria}","${produto.unidade}",${produto.precoUnitario},${produto.estoqueMinimo},${produto.pontoPedido},"${produto.fornecedor}","${produto.ativo}","${produto.dataCadastro}"\n`;
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
 * Obtém análise de produtos (NOVO v6.0)
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
    
    const produtosEmAlerta = [];
    
    for (let i = 1; i < dadosProdutos.length; i++) {
      if (!dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1]) continue;

      totalProdutos++;

      if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] === 'Sim') {
        produtosAtivos++;
      }

      const produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
      const produtoNome = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1];
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
 * Obtém apenas produtos em alerta (v10.1 - NOVO)
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
      const produtoNome = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1];
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
 * CADASTRO AUTOMÁTICO DE PRODUTOS (v10.4)
 * ========================================
 */

/**
 * Cadastra produto automaticamente a partir de dados da NF (v10.4)
 *
 * @param {object} dadosProduto - Dados do produto da NF
 * @param {string} dadosProduto.tipo - Tipo: 'Papelaria' ou 'Limpeza'
 * @param {string} dadosProduto.descricao - Descrição do produto na NF
 * @param {string} dadosProduto.codigoNF - Código do produto na NF
 * @param {string} dadosProduto.fornecedor - Fornecedor
 * @param {string} dadosProduto.unidade - Unidade
 * @param {number} dadosProduto.preco - Preço unitário
 * @param {string} dadosProduto.categoria - Categoria (opcional)
 * @returns {object} - { success, produtoId }
 */
function cadastrarProdutoAutomatico(dadosProduto) {
  try {
    Logger.log('🤖 Cadastrando produto automaticamente...');
    Logger.log(`   Descrição: ${dadosProduto.descricao}`);
    Logger.log(`   Código NF: ${dadosProduto.codigoNF}`);

    // Validações
    if (!dadosProduto.descricao || !dadosProduto.tipo) {
      return {
        success: false,
        error: 'Descrição e Tipo são obrigatórios'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return {
        success: false,
        error: 'Aba de produtos não encontrada'
      };
    }

    // Gerar código interno único baseado no tipo
    const timestamp = Date.now();
    let codigoInterno;

    if (dadosProduto.tipo === 'Papelaria') {
      codigoInterno = `PAP-${timestamp}`;
    } else if (dadosProduto.tipo === 'Limpeza') {
      codigoInterno = `LMP-${timestamp}`;
    } else {
      codigoInterno = `PRD-${timestamp}`;
    }

    // Gerar ID único
    const produtoId = 'PROD-' + timestamp;

    // Criar mapeamento de códigos (JSON)
    const mapeamentoCodigos = JSON.stringify([{
      fornecedor: dadosProduto.fornecedor || '',
      codigo: dadosProduto.codigoNF || '',
      principal: true
    }]);

    // Preparar nova linha
    const novaLinha = [
      produtoId,                                  // A - ID
      codigoInterno,                              // B - Código
      dadosProduto.descricao,                     // C - Nome
      dadosProduto.tipo,                          // D - Tipo
      dadosProduto.categoria || 'Geral',          // E - Categoria
      dadosProduto.unidade || 'UN',               // F - Unidade
      dadosProduto.preco || 0,                    // G - Preço Unitário
      10,                                         // H - Estoque Mínimo (padrão)
      20,                                         // I - Ponto de Pedido (padrão)
      dadosProduto.fornecedor || '',              // J - Fornecedor
      '',                                         // K - ImagemURL
      'Sim',                                      // L - Ativo
      new Date(),                                 // M - Data Cadastro
      dadosProduto.codigoNF || '',                // N - Código Fornecedor
      mapeamentoCodigos                           // O - Mapeamento Códigos (JSON)
    ];

    // Adicionar produto
    abaProdutos.appendRow(novaLinha);

    // Criar registro de estoque zerado
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    if (abaEstoque) {
      const estoqueId = 'EST-' + timestamp;
      const novaLinhaEstoque = [
        estoqueId,                                // A - ID
        produtoId,                                // B - Produto ID
        dadosProduto.descricao,                   // C - Produto Nome
        0,                                        // D - Quantidade Atual
        0,                                        // E - Quantidade Reservada
        0,                                        // F - Estoque Disponível
        new Date(),                               // G - Última Atualização
        Session.getActiveUser().getEmail()       // H - Responsável
      ];

      abaEstoque.appendRow(novaLinhaEstoque);
      Logger.log(`✅ Estoque zerado criado para produto ${produtoId}`);
    }

    Logger.log(`✅ Produto cadastrado automaticamente: ${produtoId}`);
    Logger.log(`   Código Interno: ${codigoInterno}`);
    Logger.log(`   Código Fornecedor: ${dadosProduto.codigoNF}`);

    return {
      success: true,
      produtoId: produtoId,
      codigoInterno: codigoInterno
    };

  } catch (error) {
    Logger.log('❌ Erro ao cadastrar produto automaticamente: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}
