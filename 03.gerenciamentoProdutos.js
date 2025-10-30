/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Gerenciamento de Produtos
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Upload de imagens com preview
 * - Renomeação inteligente de arquivos
 * - Estoque mínimo e ponto de pedido
 * - Histórico de produtos
 */

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
        id: dados[i][0],
        codigo: dados[i][1],
        nome: dados[i][2],
        tipo: dados[i][3],
        categoria: dados[i][4],
        unidade: dados[i][5],
        precoUnitario: dados[i][6],
        estoqueMinimo: dados[i][7] || 0,
        pontoPedido: dados[i][8] || 0,
        fornecedor: dados[i][9],
        imagemURL: dados[i][10] || '',
        ativo: dados[i][11] !== undefined ? dados[i][11] : 'Sim',
        dataCadastro: dados[i][12]
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
 * Busca produto por ID ou código
 */
function buscarProduto(identificador) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    
    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }
    
    const dados = abaProdutos.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === identificador || dados[i][1] === identificador) {
        return {
          success: true,
          produto: {
            id: dados[i][0],
            codigo: dados[i][1],
            nome: dados[i][2],
            tipo: dados[i][3],
            categoria: dados[i][4],
            unidade: dados[i][5],
            precoUnitario: dados[i][6],
            estoqueMinimo: dados[i][7] || 0,
            pontoPedido: dados[i][8] || 0,
            fornecedor: dados[i][9],
            imagemURL: dados[i][10] || '',
            ativo: dados[i][11] !== undefined ? dados[i][11] : 'Sim',
            dataCadastro: dados[i][12]
          }
        };
      }
    }
    
    return {
      success: false,
      error: 'Produto não encontrado'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao buscar produto: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cadastra novo produto (v6.0 - com suporte a imagem)
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
    
    // Validar dados obrigatórios
    if (!dadosProduto.nome || !dadosProduto.tipo || !dadosProduto.codigo) {
      return {
        success: false,
        error: 'Nome, tipo e código são obrigatórios'
      };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    
    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }
    
    // Verificar se código já existe
    const dados = abaProdutos.getDataRange().getValues();
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][1] === dadosProduto.codigo) {
        return {
          success: false,
          error: 'Código de produto já existe'
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
        produtoNome: dadosProduto.nome,
        tipo: dadosProduto.tipo
      });
      
      if (resultadoUpload.success) {
        imagemURL = resultadoUpload.imageUrl;
      } else {
        Logger.log('⚠️ Erro ao fazer upload da imagem: ' + resultadoUpload.error);
      }
    }
    
    // Adicionar produto
    const novoProduto = [
      id,
      dadosProduto.codigo,
      dadosProduto.nome,
      dadosProduto.tipo,
      dadosProduto.categoria || '',
      dadosProduto.unidade || 'UN',
      dadosProduto.precoUnitario || 0,
      dadosProduto.estoqueMinimo || 0,
      dadosProduto.pontoPedido || 0,
      dadosProduto.fornecedor || '',
      imagemURL,
      'Sim',
      new Date()
    ];
    
    abaProdutos.appendRow(novoProduto);
    
    // Criar registro de estoque inicial
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    if (abaEstoque) {
      const novoEstoque = [
        Utilities.getUuid(),
        id,
        dadosProduto.nome,
        0, // Quantidade atual
        0, // Quantidade reservada
        0, // Estoque disponível
        new Date(),
        email
      ];
      abaEstoque.appendRow(novoEstoque);
    }
    
    // Registrar log
    registrarLog('PRODUTO_CADASTRADO', `Produto ${dadosProduto.nome} cadastrado`, 'SUCESSO');
    
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
 * Atualiza dados de um produto
 */
function atualizarProduto(produtoId, dadosAtualizados) {
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
      if (dados[i][0] === produtoId) {
        // Atualizar campos
        if (dadosAtualizados.codigo) {
          abaProdutos.getRange(i + 1, 2).setValue(dadosAtualizados.codigo);
        }
        if (dadosAtualizados.nome) {
          abaProdutos.getRange(i + 1, 3).setValue(dadosAtualizados.nome);
        }
        if (dadosAtualizados.tipo) {
          abaProdutos.getRange(i + 1, 4).setValue(dadosAtualizados.tipo);
        }
        if (dadosAtualizados.categoria) {
          abaProdutos.getRange(i + 1, 5).setValue(dadosAtualizados.categoria);
        }
        if (dadosAtualizados.unidade) {
          abaProdutos.getRange(i + 1, 6).setValue(dadosAtualizados.unidade);
        }
        if (dadosAtualizados.precoUnitario !== undefined) {
          abaProdutos.getRange(i + 1, 7).setValue(dadosAtualizados.precoUnitario);
        }
        if (dadosAtualizados.estoqueMinimo !== undefined) {
          abaProdutos.getRange(i + 1, 8).setValue(dadosAtualizados.estoqueMinimo);
        }
        if (dadosAtualizados.pontoPedido !== undefined) {
          abaProdutos.getRange(i + 1, 9).setValue(dadosAtualizados.pontoPedido);
        }
        if (dadosAtualizados.fornecedor) {
          abaProdutos.getRange(i + 1, 10).setValue(dadosAtualizados.fornecedor);
        }
        
        // Atualizar imagem se fornecida
        if (dadosAtualizados.imagemBase64) {
          const resultadoUpload = uploadImagemProduto({
            base64Data: dadosAtualizados.imagemBase64,
            fileName: dadosAtualizados.imagemFileName || 'produto.jpg',
            mimeType: dadosAtualizados.imagemMimeType || 'image/jpeg',
            produtoId: produtoId,
            produtoNome: dadosAtualizados.nome || dados[i][2],
            tipo: dadosAtualizados.tipo || dados[i][3]
          });
          
          if (resultadoUpload.success) {
            abaProdutos.getRange(i + 1, 11).setValue(resultadoUpload.imageUrl);
          }
        }
        
        if (dadosAtualizados.ativo !== undefined) {
          abaProdutos.getRange(i + 1, 12).setValue(dadosAtualizados.ativo);
        }
        
        // Registrar log
        registrarLog('PRODUTO_ATUALIZADO', `Produto ${dados[i][2]} atualizado`, 'SUCESSO');
        
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
      if (!dadosProdutos[i][0]) continue;
      
      totalProdutos++;
      
      if (dadosProdutos[i][11] === 'Sim') {
        produtosAtivos++;
      }
      
      const produtoId = dadosProdutos[i][0];
      const produtoNome = dadosProdutos[i][2];
      const estoqueMinimo = dadosProdutos[i][7] || 0;
      const pontoPedido = dadosProdutos[i][8] || 0;
      const precoUnitario = dadosProdutos[i][6] || 0;
      
      // Buscar estoque atual
      let qtdAtual = 0;
      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][1] === produtoId) {
          qtdAtual = dadosEstoque[j][3] || 0;
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
