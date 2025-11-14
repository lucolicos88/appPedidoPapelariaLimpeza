# 📋 IMPLEMENTAÇÃO V12 - ETAPAS FINAIS

## ✅ O QUE JÁ FOI FEITO

### 1. Estrutura de Dados Atualizada
- ✅ [01.config.js](01.config.js) - Atualizado CONFIG.COLUNAS_PRODUTOS com duplo código
- ✅ [01.setup.js](01.setup.js) - Função criarAbaProdutos atualizada para v12
- ✅ Versão alterada para `12.0` em CONFIG

### 2. Frontend Atualizado
- ✅ Modal de Novo Produto reformulado com campos:
  - Código Fornecedor / Descrição Fornecedor
  - Código Neoformula / Descrição Neoformula
  - NCM
- ✅ Função `submitNovoProduto()` atualizada para enviar novos campos
- ✅ Modal de Nova NF modificado para v12

### 3. Backend Atualizado
- ✅ Função `cadastrarProduto()` em [03.gerenciamentoProdutos.js](03.gerenciamentoProdutos.js) atualizada

---

## 🔧 O QUE FALTA FAZER (MANUAL)

### ETAPA 1: Adicionar Funções JavaScript no Index.html

Adicione APÓS a função `processarArquivoXMLv12` (linha ~5813):

```javascript
/**
 * Exibe tela de mapeamento v12 - Gestor preenche dados Neoformula
 */
function exibirTelaMapeamentoV12(dadosNF, tipoProdutos) {
  console.log('📋 Exibindo tela de mapeamento v12', dadosNF);

  // Dados básicos da NF
  document.getElementById('nfDadosBasicos').innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div>
        <strong>Número NF:</strong><br>
        <span style="font-size: 1.2em;">${dadosNF.numeroNF}</span>
      </div>
      <div>
        <strong>Fornecedor:</strong><br>
        ${dadosNF.fornecedor}
      </div>
      <div>
        <strong>CNPJ:</strong><br>
        ${dadosNF.cnpjFornecedor || 'N/A'}
      </div>
      <div>
        <strong>Data Emissão:</strong><br>
        ${new Date(dadosNF.dataEmissao).toLocaleDateString('pt-BR')}
      </div>
      <div>
        <strong>Valor Total:</strong><br>
        <span style="font-size: 1.2em; color: #00A651;">R$ ${formatMoney(dadosNF.valorTotal)}</span>
      </div>
    </div>
  `;

  // Tabela de produtos para mapeamento
  let html = `
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 5px; overflow: hidden;">
      <thead style="background: #00A651; color: white;">
        <tr>
          <th style="padding: 10px; text-align: left;">Código Fornecedor</th>
          <th style="padding: 10px; text-align: left;">Descrição Fornecedor</th>
          <th style="padding: 10px; text-align: center;">Qtd</th>
          <th style="padding: 10px; text-align: right;">Valor Unit.</th>
          <th style="padding: 10px; text-align: left; background: #e8f5e9; color: #333;">Código Neoformula *</th>
          <th style="padding: 10px; text-align: left; background: #e8f5e9; color: #333;">Descrição Neoformula *</th>
          <th style="padding: 10px; text-align: center; background: #e8f5e9; color: #333;">Imagem</th>
        </tr>
      </thead>
      <tbody>
  `;

  produtosNFData = []; // Reset array

  dadosNF.produtos.forEach((produto, index) => {
    produtosNFData.push({
      codigoFornecedor: produto.codigo || '',
      descricaoFornecedor: produto.descricao,
      quantidade: produto.quantidade,
      valorUnitario: produto.valorUnitario,
      unidade: produto.unidade || 'UN',
      ncm: produto.ncm || '',
      // Campos a serem preenchidos:
      codigoNeoformula: '',
      descricaoNeoformula: '',
      categoria: '',
      imagemBase64: null,
      imagemFileName: null
    });

    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px; font-family: monospace;">${produto.codigo || 'N/A'}</td>
        <td style="padding: 8px;">${produto.descricao}</td>
        <td style="padding: 8px; text-align: center;">${produto.quantidade}</td>
        <td style="padding: 8px; text-align: right;">R$ ${formatMoney(produto.valorUnitario)}</td>
        <td style="padding: 8px; background: #f9fff9;">
          <input type="text"
                 class="form-control"
                 id="codNeo_${index}"
                 required
                 placeholder="Ex: NEO001"
                 style="font-family: monospace; min-width: 120px;">
        </td>
        <td style="padding: 8px; background: #f9fff9;">
          <input type="text"
                 class="form-control"
                 id="descNeo_${index}"
                 required
                 placeholder="Ex: Caneta Azul BIC"
                 style="min-width: 200px;">
        </td>
        <td style="padding: 8px; text-align: center; background: #f9fff9;">
          <input type="file"
                 id="imgProd_${index}"
                 accept="image/*"
                 onchange="previewImageNF(${index}, event)"
                 style="font-size: 0.85em; max-width: 150px;">
          <div id="previewImg_${index}" style="margin-top: 5px;"></div>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById('nfProdutosTable').innerHTML = html;

  // Armazenar dados básicos
  document.getElementById('nfDadosParsed').value = JSON.stringify({
    dadosNF: dadosNF,
    tipoProdutos: tipoProdutos
  });

  // Mostrar área de preview e habilitar botão
  document.getElementById('nfPreviewArea').style.display = 'block';
  document.getElementById('btnCadastrarNF').disabled = false;
}

/**
 * Preview de imagem de produto na tabela de mapeamento
 */
function previewImageNF(index, event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result.split(',')[1];
    produtosNFData[index].imagemBase64 = base64Data;
    produtosNFData[index].imagemFileName = file.name;
    produtosNFData[index].imagemMimeType = file.type;

    document.getElementById('previewImg_' + index).innerHTML = `
      <img src="${e.target.result}" style="max-width: 80px; max-height: 80px; border-radius: 3px;">
    `;
  };
  reader.readAsDataURL(file);
}

/**
 * Submete NF v12 - Cadastra produtos e processa NF
 */
function submitNovaNFXML(event) {
  event.preventDefault();

  const dadosParsedStr = document.getElementById('nfDadosParsed').value;
  if (!dadosParsedStr) {
    showError('Faça upload do XML primeiro');
    return;
  }

  const dadosParsed = JSON.parse(dadosParsedStr);

  // Coletar dados preenchidos pelo gestor
  const produtosCompletos = [];

  for (let i = 0; i < produtosNFData.length; i++) {
    const codigoNeo = document.getElementById('codNeo_' + i).value.trim();
    const descNeo = document.getElementById('descNeo_' + i).value.trim();

    if (!codigoNeo || !descNeo) {
      showError(`Preencha Código e Descrição Neoformula para o produto ${i + 1}`);
      return;
    }

    produtosCompletos.push({
      ...produtosNFData[i],
      codigoNeoformula: codigoNeo,
      descricaoNeoformula: descNeo,
      tipo: dadosParsed.tipoProdutos
    });
  }

  const observacoes = document.getElementById('nfObservacoes').value;

  const dadosSubmit = {
    dadosNF: dadosParsed.dadosNF,
    tipoProdutos: dadosParsed.tipoProdutos,
    produtos: produtosCompletos,
    observacoes: observacoes
  };

  console.log('📤 Enviando dados v12:', dadosSubmit);

  showLoading();

  // Chamar backend para cadastrar produtos e processar NF
  google.script.run
    .withSuccessHandler(function(response) {
      hideLoading();

      if (response && response.success) {
        showSuccess(`NF cadastrada com sucesso! ${response.produtosCriados} produtos cadastrados.`);
        closeModalNF();
        loadNotasFiscais();
      } else {
        showError('Erro ao processar NF: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro: ' + error.message);
    })
    .processarNFv12(dadosSubmit);
}
```

---

### ETAPA 2: Criar Função Backend `processarNFv12`

Adicione ao final do arquivo [11.notasFiscais.js](11.notasFiscais.js):

```javascript
/**
 * Processa NF v12 - Cadastra produtos e registra NF
 */
function processarNFv12(dadosSubmit) {
  try {
    Logger.log('📋 PROCESSAR NF V12 - INÍCIO');
    const email = Session.getActiveUser().getEmail();

    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Somente gestores podem processar NFs.'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);
    const abaItensNF = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

    if (!abaProdutos || !abaNF || !abaItensNF) {
      return { success: false, error: 'Abas necessárias não encontradas' };
    }

    Logger.log('📦 Produtos a cadastrar: ' + dadosSubmit.produtos.length);

    // 1. Cadastrar produtos novos
    let produtosCriados = 0;
    const produtosIds = [];

    for (const produto of dadosSubmit.produtos) {
      // Verificar se código Neoformula já existe
      const dadosProdutos = abaProdutos.getDataRange().getValues();
      let produtoExiste = false;
      let produtoId = null;

      for (let i = 1; i < dadosProdutos.length; i++) {
        if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] === produto.codigoNeoformula) {
          produtoExiste = true;
          produtoId = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1];
          Logger.log('⚠️ Produto já existe: ' + produto.codigoNeoformula);
          break;
        }
      }

      if (!produtoExiste) {
        // Cadastrar novo produto
        produtoId = Utilities.getUuid();

        // Upload de imagem se houver
        let imagemURL = '';
        if (produto.imagemBase64) {
          const resultadoUpload = uploadImagemProduto({
            base64Data: produto.imagemBase64,
            fileName: produto.imagemFileName || 'produto.jpg',
            mimeType: produto.imagemMimeType || 'image/jpeg',
            produtoId: produtoId,
            produtoNome: produto.descricaoNeoformula,
            tipo: produto.tipo
          });

          if (resultadoUpload.success) {
            imagemURL = resultadoUpload.imageUrl;
          }
        }

        const novoProduto = [];
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ID - 1] = produtoId;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] = produto.codigoFornecedor;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1] = produto.descricaoFornecedor;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CODIGO_NEOFORMULA - 1] = produto.codigoNeoformula;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1] = produto.descricaoNeoformula;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.TIPO - 1] = produto.tipo;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.CATEGORIA - 1] = produto.categoria || '';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.UNIDADE - 1] = produto.unidade || 'UN';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] = produto.valorUnitario;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1] = 0;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1] = 0;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.FORNECEDOR - 1] = dadosSubmit.dadosNF.fornecedor;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1] = imagemURL;
        novoProduto[CONFIG.COLUNAS_PRODUTOS.ATIVO - 1] = 'Sim';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1] = new Date();
        novoProduto[CONFIG.COLUNAS_PRODUTOS.NCM - 1] = produto.ncm || '';
        novoProduto[CONFIG.COLUNAS_PRODUTOS.MAPEAMENTO_CODIGOS - 1] = '';

        abaProdutos.appendRow(novoProduto);

        // Criar estoque inicial
        const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
        if (abaEstoque) {
          const novoEstoque = [];
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ID - 1] = Utilities.getUuid();
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] = produtoId;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.PRODUTO_NOME - 1] = produto.descricaoNeoformula;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_RESERVADA - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL - 1] = 0;
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO - 1] = new Date();
          novoEstoque[CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL - 1] = email;
          abaEstoque.appendRow(novoEstoque);
        }

        produtosCriados++;
        Logger.log('✅ Produto cadastrado: ' + produto.descricaoNeoformula);
      }

      produtosIds.push({
        produtoId: produtoId,
        quantidade: produto.quantidade,
        valorUnitario: produto.valorUnitario
      });
    }

    // 2. Cadastrar NF
    const nfId = Utilities.getUuid();

    const novaNF = [];
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] = nfId;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1] = dadosSubmit.dadosNF.numeroNF;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_EMISSAO - 1] = new Date(dadosSubmit.dadosNF.dataEmissao);
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_ENTRADA - 1] = new Date();
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1] = dadosSubmit.dadosNF.fornecedor;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.CNPJ_FORNECEDOR - 1] = dadosSubmit.dadosNF.cnpjFornecedor || '';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.VALOR_TOTAL - 1] = dadosSubmit.dadosNF.valorTotal;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1] = JSON.stringify(produtosIds.map(p => p.produtoId));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1] = JSON.stringify(produtosIds.map(p => p.quantidade));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1] = JSON.stringify(produtosIds.map(p => p.valorUnitario));
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.TIPO_PRODUTOS - 1] = dadosSubmit.tipoProdutos;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.STATUS - 1] = 'Processada';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.RESPONSAVEL - 1] = email;
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.OBSERVACOES - 1] = dadosSubmit.observacoes || '';
    novaNF[CONFIG.COLUNAS_NOTAS_FISCAIS.DATA_CADASTRO - 1] = new Date();

    abaNF.appendRow(novaNF);

    // 3. Atualizar estoque e custo médio
    for (const item of produtosIds) {
      atualizarEstoque(item.produtoId, item.quantidade, 'ENTRADA', email, 'Entrada via NF ' + dadosSubmit.dadosNF.numeroNF, nfId, item.valorUnitario);
      atualizarCustoMedioProduto(item.produtoId, item.quantidade, item.valorUnitario);
    }

    Logger.log('✅ NF processada com sucesso!');

    return {
      success: true,
      message: 'NF processada com sucesso',
      nfId: nfId,
      produtosCriados: produtosCriados
    };

  } catch (error) {
    Logger.log('❌ ERRO ao processar NF v12: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

### ETAPA 3: Adicionar função `atualizarCustoMedioProduto` se não existir

Verificar se existe em `11.notasFiscais.js`. Se não existir, adicionar:

```javascript
/**
 * Atualiza custo médio ponderado do produto
 */
function atualizarCustoMedioProduto(produtoId, qtdNova, custoNovo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

    if (!abaProdutos || !abaEstoque) return;

    // Buscar produto
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    let linhaProduto = -1;

    for (let i = 1; i < dadosProdutos.length; i++) {
      if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === produtoId) {
        linhaProduto = i + 1;
        break;
      }
    }

    if (linhaProduto === -1) return;

    // Buscar estoque atual
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let qtdAtual = 0;

    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === produtoId) {
        qtdAtual = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
        break;
      }
    }

    // Custo atual
    const custoAtual = dadosProdutos[linhaProduto - 1][CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1] || 0;

    // Calcular custo médio ponderado
    const qtdAnterior = qtdAtual - qtdNova; // Estoque antes da entrada
    const novoCustoMedio = ((qtdAnterior * custoAtual) + (qtdNova * custoNovo)) / qtdAtual;

    // Atualizar custo
    abaProdutos.getRange(linhaProduto, CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO).setValue(novoCustoMedio);

    Logger.log(`💰 Custo médio atualizado: R$ ${custoAtual.toFixed(2)} → R$ ${novoCustoMedio.toFixed(2)}`);

  } catch (error) {
    Logger.log('❌ Erro ao atualizar custo médio: ' + error.message);
  }
}
```

---

## 🚀 ETAPA 4: DEPLOY

Após fazer as mudanças acima:

```bash
# 1. Deploy no Apps Script
clasp push

# 2. Git commit
git add .
git commit -m "v12.0 - NOVA ESTRUTURA: Sistema NF com duplo código (Fornecedor + Neoformula)"
git push origin main
```

---

## ✅ CHECKLIST FINAL

- [ ] Adicionar funções JavaScript no Index.html (ETAPA 1)
- [ ] Adicionar função `processarNFv12` em 11.notasFiscais.js (ETAPA 2)
- [ ] Verificar/adicionar função `atualizarCustoMedioProduto` (ETAPA 3)
- [ ] Executar `clasp push`
- [ ] Fazer commit git com mensagem v12.0
- [ ] Fazer git push
- [ ] Testar: Nova NF → Upload XML → Preencher campos → Processar

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Backup**: Antes do deploy, faça backup da planilha
2. **Teste**: Teste com um XML pequeno primeiro (1-2 produtos)
3. **Logs**: Monitore os logs no Apps Script durante o teste
4. **Estrutura**: Se já existem produtos antigos, eles terão campos vazios nas novas colunas. Isso é OK!

---

## 🎯 RESULTADO ESPERADO

Após implementação completa:

1. Usuário abre **Nova Nota Fiscal**
2. Seleciona **Tipo** (Papelaria/Limpeza)
3. Faz **upload do XML**
4. Sistema extrai dados e mostra **tabela de produtos**
5. Para cada produto, gestor preenche:
   - Código Neoformula
   - Descrição Neoformula
   - Imagem (opcional)
6. Clica em **Processar NF e Cadastrar Produtos**
7. Sistema:
   - Cadastra produtos novos automaticamente
   - Registra NF
   - Atualiza estoque
   - Calcula custo médio ponderado
