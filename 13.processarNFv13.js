/**
 * ========================================
 * PROCESSAR NF V13 - FLUXO AUTOMÁTICO
 * ========================================
 *
 * NOVO FLUXO:
 * 1. Upload XML → Extração dados NF
 * 2. Buscar/Criar fornecedor automaticamente
 * 3. Cruzar produtos da NF com produtos cadastrados
 * 4. Produtos encontrados → Apenas entrada no estoque
 * 5. Produtos novos → Cadastro automático com dados básicos
 * 6. Gestor completa dados Neoformula posteriormente
 */

/**
 * Processa NF v13.1.3 - Importação com AUTO-CADASTRO de fornecedor
 * @param {object} params - { xmlBase64, fornecedorId (opcional), tipoProdutos, observacoes }
 * @returns {object} - { success, nfId, produtosCriados, produtosEncontrados }
 */
function processarNFv13Automatico(params) {
  try {
    Logger.log('📋 ========== PROCESSAR NF V13.1.3 - INÍCIO ==========');
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem processar NFs.'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. PARSE DO XML PRIMEIRO (para extrair dados do fornecedor)
    Logger.log('1️⃣ Fazendo parse do XML...');
    const resultadoXML = uploadEProcessarXMLNF(params.xmlBase64, 'nf.xml');

    if (!resultadoXML.success) {
      return {
        success: false,
        error: 'Erro ao processar XML: ' + resultadoXML.error
      };
    }

    const dadosNF = resultadoXML.dadosNF;
    Logger.log(`✅ XML processado: NF ${dadosNF.numeroNF} com ${dadosNF.produtos.length} produtos`);

    // 2. BUSCAR OU CRIAR FORNECEDOR AUTOMATICAMENTE
    Logger.log('2️⃣ Buscando ou criando fornecedor...');
    let fornecedorId = params.fornecedorId;
    let fornecedor;

    if (!fornecedorId) {
      // Auto-cadastro: Buscar fornecedor por CNPJ do XML
      Logger.log(`🔍 Buscando fornecedor por CNPJ: ${dadosNF.cnpjFornecedor}`);
      const resultadoBusca = buscarFornecedorPorCNPJ(dadosNF.cnpjFornecedor);

      if (resultadoBusca.success && resultadoBusca.fornecedor) {
        // Fornecedor encontrado
        fornecedor = resultadoBusca.fornecedor;
        fornecedorId = fornecedor.id;
        Logger.log(`✅ Fornecedor encontrado: ${fornecedor.nome} - ID: ${fornecedorId}`);
      } else {
        // Fornecedor não existe, criar automaticamente
        Logger.log(`➕ Fornecedor não encontrado, criando automaticamente...`);
        const resultadoCadastro = cadastrarFornecedor({
          nome: dadosNF.fornecedor,
          cnpj: dadosNF.cnpjFornecedor,
          tipoProdutos: params.tipoProdutos || 'Ambos',
          observacoes: `Cadastrado automaticamente via importação de NF ${dadosNF.numeroNF}`
        });

        if (!resultadoCadastro.success) {
          return {
            success: false,
            error: 'Erro ao cadastrar fornecedor automaticamente: ' + resultadoCadastro.error
          };
        }

        fornecedorId = resultadoCadastro.fornecedorId;
        const fornecedorBuscado = buscarFornecedor(fornecedorId);
        fornecedor = fornecedorBuscado.fornecedor;
        Logger.log(`✅ Fornecedor criado: ${fornecedor.nome} - ID: ${fornecedorId}`);
      }
    } else {
      // Fornecedor foi pré-selecionado
      Logger.log(`✅ Fornecedor pré-selecionado: ID ${fornecedorId}`);
      const fornecedorResult = buscarFornecedor(fornecedorId);

      if (!fornecedorResult.success) {
        return {
          success: false,
          error: 'Fornecedor não encontrado.'
        };
      }

      fornecedor = fornecedorResult.fornecedor;
      Logger.log(`✅ Fornecedor: ${fornecedor.nome} - ID: ${fornecedorId}`);
    }

    // 3. VALIDAR SE NF JÁ FOI IMPORTADA (evitar duplicação)
    Logger.log('3️⃣ Verificando se NF já foi importada...');
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);
    if (!abaNF) {
      return { success: false, error: 'Aba Notas Fiscais não encontrada' };
    }

    const dadosNFExistentes = abaNF.getDataRange().getValues();
    for (let i = 1; i < dadosNFExistentes.length; i++) {
      const numeroNFExistente = dadosNFExistentes[i][CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1];
      const cnpjExistente = dadosNFExistentes[i][CONFIG.COLUNAS_NOTAS_FISCAIS.CNPJ_FORNECEDOR - 1];

      if (numeroNFExistente == dadosNF.numeroNF && cnpjExistente === dadosNF.cnpjFornecedor) {
        return {
          success: false,
          error: `❌ NOTA FISCAL DUPLICADA!\n\nA NF ${dadosNF.numeroNF} do fornecedor ${dadosNF.fornecedor} (CNPJ: ${dadosNF.cnpjFornecedor}) já foi importada anteriormente.\n\nVerifique a aba "Notas Fiscais" para confirmar.`
        };
      }
    }
    Logger.log('✅ NF não está duplicada, prosseguindo...');

    // 4. PROCESSAR PRODUTOS (CRUZAMENTO + CADASTRO)
    Logger.log('4️⃣ Processando produtos da NF...');
    const resultadoProdutos = processarProdutosNF({
      produtos: dadosNF.produtos,
      fornecedorId: fornecedorId,
      tipoProdutos: params.tipoProdutos,
      email: email
    });

    if (!resultadoProdutos.success) {
      return {
        success: false,
        error: 'Erro ao processar produtos: ' + resultadoProdutos.error
      };
    }

    Logger.log(`✅ Produtos processados: ${resultadoProdutos.produtosCriados} novos, ${resultadoProdutos.produtosEncontrados} existentes`);

    // 5. REGISTRAR NOTA FISCAL
    Logger.log('5️⃣ Registrando Nota Fiscal...');
    const nfId = Utilities.getUuid();

    // Aba já foi carregada na validação de duplicação
    const novaNF = [];
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] = nfId;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1] = dadosNF.numeroNF;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_EMISSAO - 1] = new Date(dadosNF.dataEmissao);
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_ENTRADA - 1] = new Date();
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1] = dadosNF.fornecedor;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.CNPJ_FORNECEDOR - 1] = dadosNF.cnpjFornecedor || '';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.VALOR_TOTAL - 1] = dadosNF.valorTotal;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1] = JSON.stringify(resultadoProdutos.produtosIds.map(p => p.produtoId));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1] = JSON.stringify(resultadoProdutos.produtosIds.map(p => p.quantidade));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1] = JSON.stringify(resultadoProdutos.produtosIds.map(p => p.valorUnitario));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.TIPO_PRODUTOS - 1] = params.tipoProdutos;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1] = 'Processada';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.RESPONSAVEL - 1] = email;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES - 1] = params.observacoes || '';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_CADASTRO - 1] = new Date();

    abaNF.appendRow(novaNF);
    Logger.log(`✅ NF registrada: ${nfId}`);

    // 5. ATUALIZAR ESTOQUE E CUSTOS
    Logger.log('5️⃣ Atualizando estoque e custos...');
    for (const item of resultadoProdutos.produtosIds) {
      // Registrar movimentação de entrada
      registrarMovimentacao({
        tipo: CONFIG.TIPOS_MOVIMENTACAO.ENTRADA,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        observacoes: `Entrada NF ${dadosNF.numeroNF}`,
        responsavel: email,
        nfId: nfId,
        custoUnitario: item.valorUnitario
      });

      // Atualizar custo médio
      atualizarCustoMedioProduto(item.produtoId, item.quantidade, item.valorUnitario);
    }

    Logger.log('✅ Estoque e custos atualizados');

    // 6. MENSAGEM DE SUCESSO
    let mensagem = `✅ NF ${dadosNF.numeroNF} processada com sucesso!\n\n`;
    mensagem += `🏢 Fornecedor: ${fornecedor.nome}\n`;
    mensagem += `💰 Valor Total: R$ ${dadosNF.valorTotal.toFixed(2)}\n\n`;
    mensagem += `📦 ${dadosNF.produtos.length} produtos processados:\n`;
    mensagem += `   ✓ ${resultadoProdutos.produtosEncontrados} produtos já existentes (entrada no estoque)\n`;
    mensagem += `   ➕ ${resultadoProdutos.produtosCriados} produtos novos cadastrados\n\n`;

    if (resultadoProdutos.produtosCriados > 0) {
      mensagem += `⚠️ IMPORTANTE - CADASTROS INCOMPLETOS!\n\n`;
      mensagem += `Os ${resultadoProdutos.produtosCriados} produtos novos foram cadastrados APENAS com:\n`;
      mensagem += `   • Código e Descrição do FORNECEDOR (da NF)\n`;
      mensagem += `   • Preço, Unidade, NCM (da NF)\n\n`;
      mensagem += `Você DEVE completar os cadastros com:\n`;
      mensagem += `   📝 Código Neoformula (seu código interno)\n`;
      mensagem += `   📝 Descrição Neoformula (sua descrição)\n`;
      mensagem += `   📂 Categoria\n`;
      mensagem += `   🖼️ Imagem do produto\n`;
      mensagem += `   📊 Estoque mínimo e Ponto de pedido\n\n`;
      mensagem += `➡️ Vá em "Produtos" → produtos com badge "⚠️ CADASTRO INCOMPLETO" → clique em "✏️ Completar"`;
    }

    Logger.log('========== PROCESSAR NF V13 - CONCLUÍDO ==========');

    return {
      success: true,
      nfId: nfId,
      produtosCriados: resultadoProdutos.produtosCriados,
      produtosEncontrados: resultadoProdutos.produtosEncontrados,
      mensagem: mensagem
    };

  } catch (error) {
    Logger.log(`❌ ERRO CRÍTICO ao processar NF v13: ${error.message}`);
    Logger.log(`❌ Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * FUNÇÃO REMOVIDA EM v13.1
 *
 * buscarOuCriarFornecedor() foi removida.
 * Agora o fornecedor DEVE ser selecionado ANTES do upload do XML.
 * Use cadastrarFornecedor() em 12.gerenciamentoFornecedores.js para cadastrar novos fornecedores.
 */

/**
 * Processa produtos da NF: cruza com cadastrados e cadastra novos
 */
function processarProdutosNF(params) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba Produtos não encontrada' };
    }

    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const produtosIds = [];
    let produtosCriados = 0;
    let produtosEncontrados = 0;

    for (const produtoNF of params.produtos) {
      // CRUZAMENTO: Tentar encontrar produto cadastrado
      let produtoId = null;
      let produtoEncontrado = false;

      // Estratégia 1: Buscar por código fornecedor + fornecedor ID
      for (let i = 1; i < dadosProdutos.length; i++) {
        const codigoFornecedor = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1];
        const fornecedorIdProduto = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1];

        if (codigoFornecedor === produtoNF.codigoNF && fornecedorIdProduto === params.fornecedorId) {
          produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
          produtoEncontrado = true;
          produtosEncontrados++;
          Logger.log(`✅ Produto encontrado por código: ${produtoNF.codigoNF}`);
          break;
        }
      }

      // Estratégia 2: Se não encontrou, buscar por descrição similar (match fuzzy)
      if (!produtoEncontrado) {
        for (let i = 1; i < dadosProdutos.length; i++) {
          const descricaoFornecedor = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1];
          const fornecedorIdProduto = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1];

          if (fornecedorIdProduto === params.fornecedorId) {
            const similaridade = calcularSimilaridade(produtoNF.descricao, descricaoFornecedor);
            if (similaridade >= 0.85) { // 85% de similaridade
              produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
              produtoEncontrado = true;
              produtosEncontrados++;
              Logger.log(`✅ Produto encontrado por descrição (${(similaridade * 100).toFixed(0)}%): ${produtoNF.descricao}`);
              break;
            }
          }
        }
      }

      // Se não encontrou, CADASTRAR NOVO
      if (!produtoEncontrado) {
        produtoId = Utilities.getUuid();

        const novoProduto = [];
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ID - 1] = produtoId;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] = produtoNF.codigoNF || '';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] = produtoNF.descricao;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.FORNECEDOR_ID - 1] = params.fornecedorId;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] = ''; // VAZIO - preencher depois
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] = ''; // VAZIO - preencher depois
        novoProduto[CONFIG.COLUNAS_PRODUTOS.TIPO - 1] = params.tipoProdutos;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] = ''; // VAZIO
        novoProduto[CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1] = produtoNF.unidade || 'UN';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] = produtoNF.valorUnitario;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] = ''; // VAZIO
        novoProduto[CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] = ''; // VAZIO
        novoProduto[CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] = ''; // VAZIO
        novoProduto[CONFIG.COLUNAS_PRODUTOS.NCM - 1] = produtoNF.ncm || '';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] = 'Sim';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1] = new Date();
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ORIGEM - 1] = 'NF'; // Origem: NF
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DADOS_COMPLETOS - 1] = 'NÃO'; // Dados incompletos

        abaProdutos.appendRow(novoProduto);

        // Criar estoque inicial
        const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
        if (abaEstoque) {
          const novoEstoque = [];
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ID - 1] = Utilities.getUuid();
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] = produtoId;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_NOME - 1] = produtoNF.descricao;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_RESERVADA - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO - 1] = new Date();
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL - 1] = params.email;
          abaEstoque.appendRow(novoEstoque);
        }

        produtosCriados++;
        Logger.log(`✅ Produto CADASTRADO: ${produtoNF.descricao}`);
      }

      // Adicionar à lista de produtos da NF
      produtosIds.push({
        produtoId: produtoId,
        quantidade: produtoNF.quantidade,
        valorUnitario: produtoNF.valorUnitario
      });
    }

    return {
      success: true,
      produtosIds: produtosIds,
      produtosCriados: produtosCriados,
      produtosEncontrados: produtosEncontrados
    };

  } catch (error) {
    Logger.log(`❌ Erro ao processar produtos: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calcula similaridade entre duas strings (algoritmo simples)
 */
function calcularSimilaridade(str1, str2) {
  if (!str1 || !str2) return 0;

  // Normalizar
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Calcular distância de Levenshtein simplificada
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const costs = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }

  return (longer.length - costs[longer.length]) / longer.length;
}
