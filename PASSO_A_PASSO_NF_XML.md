# 📋 PASSO A PASSO: Sistema de Notas Fiscais com Upload XML

## 🎯 OBJETIVO

Implementar sistema completo de upload de XML de NF-e com:
- Parse automático de XML
- Mapeamento inteligente de produtos
- Cálculo de custo médio ponderado
- Atualização automática de preços e estoque

---

## ✅ STATUS ATUAL (O que já foi feito)

### Backend - [11.notasFiscais.js](11.notasFiscais.js)

✅ **Funções já implementadas:**

1. `uploadEProcessarXMLNF(xmlBase64, fileName)` - Upload e decode
2. `parseXMLNotaFiscal(xmlContent)` - Parse completo do XML da NF-e
3. `mapearProdutosNF(produtosNF, tipoProdutos)` - Mapeamento inteligente
4. `calcularSimilaridade(str1, str2)` - Algoritmo de matching
5. `processarNFComCustoMedio(nfId)` - Processa NF com custo médio
6. `atualizarCustoMedioProduto(produtoId, qtd, custo)` - Custo médio ponderado

---

## 🔧 O QUE FALTA FAZER

### 1. ATUALIZAR FRONTEND (Index.html)

Substituir o modal atual de Nova NF por um com upload de XML:

**Localização:** [Index.html](Index.html) - Procure por `<!-- Modal: Nova Nota Fiscal (v10.3) -->`

**Mudanças necessárias:**

```html
<!-- Modal: Nova Nota Fiscal com Upload XML (v10.4) -->
<div class="modal" id="modalNovaNF">
  <div class="modal-content" style="max-width: 900px;">
    <div class="modal-header">
      <h3 class="modal-title">📄 Nova Nota Fiscal - Upload XML</h3>
      <button class="modal-close" onclick="closeModal('modalNovaNF')">&times;</button>
    </div>

    <form id="formNovaNF" onsubmit="submitNovaNFXML(event)">

      <!-- Tipo de Produto (OBRIGATÓRIO ANTES DO UPLOAD) -->
      <div class="form-group">
        <label class="form-label">Tipo de Produtos da NF *</label>
        <select class="form-control" id="nfTipoProdutos" required>
          <option value="">Selecione...</option>
          <option value="Papelaria">📝 Papelaria</option>
          <option value="Limpeza">🧹 Limpeza</option>
        </select>
        <small style="color: #666;">Selecione o tipo ANTES de fazer upload do XML</small>
      </div>

      <!-- Upload de Arquivo XML -->
      <div class="form-group">
        <label class="form-label">Arquivo XML da NF-e *</label>
        <input type="file" class="form-control" id="nfArquivoXML" accept=".xml" required onchange="processarArquivoXML(event)">
        <small style="color: #666;">Faça upload do arquivo XML da nota fiscal eletrônica</small>
      </div>

      <!-- Área de Preview dos Dados da NF -->
      <div id="nfPreviewArea" style="display: none; margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h4>📋 Dados da NF carregados:</h4>
        <div id="nfDadosBasicos"></div>

        <h4 style="margin-top: 20px;">📦 Produtos identificados:</h4>
        <div id="nfProdutosMapeados"></div>

        <div id="nfProdutosNaoMapeados" style="margin-top: 15px;"></div>
      </div>

      <!-- Hidden fields para armazenar dados -->
      <input type="hidden" id="nfDadosParsed">

      <!-- Observações -->
      <div class="form-group">
        <label class="form-label">Observações</label>
        <textarea class="form-control" id="nfObservacoes" rows="3"></textarea>
      </div>

      <!-- Botões -->
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;" id="btnCadastrarNF" disabled>
          ✅ Cadastrar e Processar NF
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('modalNovaNF')" style="flex: 1;">
          ❌ Cancelar
        </button>
      </div>
    </form>
  </div>
</div>
```

---

### 2. ADICIONAR FUNÇÕES JAVASCRIPT (Index.html)

**Localização:** Após as funções de NF existentes (cerca da linha 5710)

```javascript
/**
 * ========================================
 * UPLOAD E PROCESSAMENTO DE XML (v10.4)
 * ========================================
 */

/**
 * Processa arquivo XML selecionado
 */
function processarArquivoXML(event) {
  const file = event.target.files[0];

  if (!file) return;

  const tipoProdutos = document.getElementById('nfTipoProdutos').value;
  if (!tipoProdutos) {
    showError('Selecione o tipo de produtos antes de fazer upload do XML');
    document.getElementById('nfArquivoXML').value = '';
    return;
  }

  showLoading();

  const reader = new FileReader();

  reader.onload = function(e) {
    const xmlContent = e.target.result;
    const xmlBase64 = btoa(unescape(encodeURIComponent(xmlContent)));

    // Enviar para backend para parse
    google.script.run
      .withSuccessHandler(function(response) {
        hideLoading();

        if (response && response.success) {
          exibirPreviewNF(response.dadosNF, tipoProdutos);
        } else {
          showError('Erro ao processar XML: ' + (response ? response.error : 'Erro desconhecido'));
          document.getElementById('nfArquivoXML').value = '';
        }
      })
      .withFailureHandler(function(error) {
        hideLoading();
        showError('Erro: ' + error.message);
        document.getElementById('nfArquivoXML').value = '';
      })
      .uploadEProcessarXMLNF(xmlBase64, file.name);
  };

  reader.readAsText(file);
}

/**
 * Exibe preview dos dados da NF após parse
 */
function exibirPreviewNF(dadosNF, tipoProdutos) {
  console.log('📋 Dados da NF:', dadosNF);

  // Mapear produtos
  showLoading();

  google.script.run
    .withSuccessHandler(function(response) {
      hideLoading();

      if (response && response.success) {
        renderizarPreviewCompleto(dadosNF, response.mapeamento, response.naoMapeados);

        // Armazenar dados para submit
        document.getElementById('nfDadosParsed').value = JSON.stringify({
          dadosNF: dadosNF,
          mapeamento: response.mapeamento,
          naoMapeados: response.naoMapeados,
          tipoProdutos: tipoProdutos
        });

        // Habilitar botão de cadastro
        document.getElementById('btnCadastrarNF').disabled = false;
      } else {
        showError('Erro ao mapear produtos: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro: ' + error.message);
    })
    .mapearProdutosNF(dadosNF.produtos, tipoProdutos);
}

/**
 * Renderiza preview completo da NF
 */
function renderizarPreviewCompleto(dadosNF, mapeamento, naoMapeados) {
  // Dados básicos
  document.getElementById('nfDadosBasicos').innerHTML = `
    <p><strong>Número:</strong> ${dadosNF.numeroNF}</p>
    <p><strong>Fornecedor:</strong> ${dadosNF.fornecedor}</p>
    <p><strong>CNPJ:</strong> ${dadosNF.cnpjFornecedor}</p>
    <p><strong>Data Emissão:</strong> ${formatDate(dadosNF.dataEmissao)}</p>
    <p><strong>Valor Total:</strong> R$ ${formatMoney(dadosNF.valorTotal)}</p>
  `;

  // Produtos mapeados
  let htmlMapeados = '';
  if (mapeamento.length > 0) {
    htmlMapeados = `
      <div style="background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <strong>✅ ${mapeamento.length} produto(s) identificado(s):</strong>
        <ul style="margin: 10px 0 0 20px;">
          ${mapeamento.map(p => `
            <li>
              <strong>${p.produtoNome}</strong><br>
              <small>Qtd: ${p.quantidade} | Valor Unit.: R$ ${formatMoney(p.valorUnitario)}</small>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  document.getElementById('nfProdutosMapeados').innerHTML = htmlMapeados;

  // Produtos não mapeados
  let htmlNaoMapeados = '';
  if (naoMapeados.length > 0) {
    htmlNaoMapeados = `
      <div style="background: #fff3cd; padding: 10px; border-radius: 5px;">
        <strong>⚠️ ${naoMapeados.length} produto(s) NÃO identificado(s):</strong>
        <ul style="margin: 10px 0 0 20px;">
          ${naoMapeados.map(p => `
            <li>
              <strong>${p.descricao}</strong> (Código: ${p.codigoNF})<br>
              <small>Qtd: ${p.quantidade} | Valor Unit.: R$ ${formatMoney(p.valorUnitario)}</small><br>
              <small style="color: #856404;">Este produto precisa ser cadastrado antes</small>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  document.getElementById('nfProdutosNaoMapeados').innerHTML = htmlNaoMapeados;

  // Mostrar área de preview
  document.getElementById('nfPreviewArea').style.display = 'block';
}

/**
 * Submete NF com XML processado
 */
function submitNovaNFXML(event) {
  event.preventDefault();

  const dadosParsedStr = document.getElementById('nfDadosParsed').value;
  if (!dadosParsedStr) {
    showError('Faça upload do XML primeiro');
    return;
  }

  const dadosParsed = JSON.parse(dadosParsedStr);

  if (dadosParsed.naoMapeados.length > 0) {
    if (!confirm(`Atenção: ${dadosParsed.naoMapeados.length} produto(s) não foram identificados e NÃO serão processados.\n\nDeseja continuar mesmo assim?`)) {
      return;
    }
  }

  const observacoes = document.getElementById('nfObservacoes').value;

  // Preparar dados para cadastro
  const dadosCadastro = {
    numeroNF: dadosParsed.dadosNF.numeroNF,
    dataEmissao: dadosParsed.dadosNF.dataEmissao,
    dataEntrada: new Date(),
    fornecedor: dadosParsed.dadosNF.fornecedor,
    cnpjFornecedor: dadosParsed.dadosNF.cnpjFornecedor,
    tipoProdutos: dadosParsed.tipoProdutos,
    produtos: dadosParsed.mapeamento.map(m => m.produtoId),
    quantidades: dadosParsed.mapeamento.map(m => m.quantidade),
    valoresUnitarios: dadosParsed.mapeamento.map(m => m.valorUnitario),
    observacoes: observacoes
  };

  showLoading();

  // Cadastrar NF
  google.script.run
    .withSuccessHandler(function(response) {
      if (response && response.success) {
        // NF cadastrada, agora processar com custo médio
        processarNFComCustoMedio(response.nfId);
      } else {
        hideLoading();
        showError('Erro ao cadastrar NF: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro: ' + error.message);
    })
    .cadastrarNotaFiscal(dadosCadastro);
}

/**
 * Processa NF recém cadastrada
 */
function processarNFComCustoMedio(nfId) {
  google.script.run
    .withSuccessHandler(function(response) {
      hideLoading();

      if (response && response.success) {
        showSuccess('NF processada com sucesso! Estoque e preços atualizados.');
        closeModal('modalNovaNF');
        loadNotasFiscais();
      } else {
        showError('Erro ao processar NF: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro: ' + error.message);
    })
    .processarNFComCustoMedio(nfId);
}
```

---

## 🚀 COMO TESTAR

### 1. Fazer Deploy
```bash
clasp push
```

### 2. Preparar arquivo XML de teste
- Pegue um XML real de NF-e (formato padrão brasileiro)
- Certifique-se que tem a tag `<nfeProc>` ou `<NFe>`

### 3. Cadastrar produtos correspondentes
- Vá em **Produtos**
- Cadastre produtos com **códigos** que correspondam aos da NF
- Ou use descrições similares (sistema faz matching inteligente)

### 4. Testar upload
1. Acesse **Notas Fiscais**
2. Clique em **➕ Nova Nota Fiscal**
3. Selecione tipo (**Papelaria** ou **Limpeza**)
4. Faça upload do XML
5. Verifique o preview
6. Clique em **Cadastrar e Processar**
7. Verifique:
   - NF cadastrada com status **Processada**
   - Estoque atualizado
   - Preços dos produtos atualizados (custo médio)
   - Histórico de movimentações registrado

---

## 📊 COMO FUNCIONA O CUSTO MÉDIO

### Fórmula:
```
Novo Custo Médio = (Qtd Atual × Custo Atual + Qtd NF × Custo NF) / (Qtd Atual + Qtd NF)
```

### Exemplo:
- **Produto:** Caneta Azul
- **Estoque Atual:** 100 unidades a R$ 2,00 cada
- **NF Nova:** 50 unidades a R$ 2,50 cada

```
Novo Custo = (100 × 2,00 + 50 × 2,50) / (100 + 50)
           = (200,00 + 125,00) / 150
           = 325,00 / 150
           = R$ 2,17
```

✅ O preço do produto é atualizado para **R$ 2,17**

---

## ⚠️ TRATAMENTO DE ERROS

### Produtos não mapeados:
- Sistema exibe lista de produtos não identificados
- Usuário pode:
  1. Cancelar e cadastrar produtos faltantes
  2. Continuar (só processa os mapeados)

### XML inválido:
- Sistema valida estrutura do XML
- Retorna erro detalhado

### NF duplicada:
- Sistema verifica se número da NF já existe
- Impede cadastro duplicado

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

1. **Histórico de Custos**: Criar aba para guardar histórico de custos por produto/lote
2. **Relatório de Custos**: Gráficos de evolução de custos
3. **Alertas de Variação**: Notificar quando custo variar mais de X%
4. **Export**: Exportar dados de NF para Excel/CSV

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Verifique os logs no Google Apps Script
2. Teste com XMLs menores primeiro
3. Valide estrutura do XML no [portal da NF-e](http://www.nfe.fazenda.gov.br/)
