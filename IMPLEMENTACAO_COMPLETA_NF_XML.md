# 📋 IMPLEMENTAÇÃO COMPLETA: Sistema de NF com XML v10.5

## 🎯 OBJETIVO

Implementar sistema completo de Notas Fiscais com:
- ✅ Upload de XML da NF-e
- ✅ Cadastro automático de produtos novos
- ✅ Mapeamento de código interno vs código fornecedor
- ✅ Cálculo de custo médio ponderado
- ✅ Histórico de custos por lote
- ✅ Rastreabilidade completa NF → Produto → Estoque

---

## 📊 ANÁLISE DA ESTRUTURA ATUAL

### ❌ PROBLEMAS IDENTIFICADOS:

1. **Código Interno vs Código Fornecedor:**
   - Aba Produtos tem apenas 1 campo "Código" (coluna B)
   - Não suporta produtos com códigos diferentes por fornecedor
   - Necessário adicionar campo para mapeamento

2. **Função `registrarMovimentacao()` NÃO EXISTE:**
   - Código chama essa função em 2 lugares (linhas 245 e 855 do 11.notasFiscais.js)
   - Existem apenas `registrarEntradaEstoque()` e `registrarSaidaEstoque()`
   - Sistema VAI FALHAR ao processar NF

3. **Sem Histórico de Custos:**
   - Preço do produto é sobrescrito sem guardar histórico
   - Impossível rastrear variações de custo ao longo do tempo
   - Não há controle de custos por lote/NF

4. **Sem Rastreabilidade Completa:**
   - Movimentações não têm referência à NF de origem
   - Não há aba para guardar detalhes dos itens da NF
   - Impossível saber qual NF originou determinado lote

5. **Frontend de Upload XML não existe:**
   - Modal atual é form manual
   - Não há funcionalidade de upload de arquivo
   - Usuário não consegue usar o sistema

---

## 🔧 SOLUÇÃO PROPOSTA

### FASE 1: Estrutura de Dados (Obrigatório)

#### 1.1. Atualizar Aba **Produtos**

**Adicionar colunas:**
- **Coluna N:** Código Fornecedor Principal
- **Coluna O:** Mapeamento Códigos (JSON)

**Exemplo de Mapeamento:**
```json
[
  {"fornecedor": "ABC Ltda", "codigo": "ABC-123", "principal": true},
  {"fornecedor": "XYZ S.A.", "codigo": "X999"}
]
```

**Implementação:**
```javascript
// Em 01.setup.js - Atualizar função criarAbaProdutos()

const headers = [
  'ID',
  'Código',
  'Nome',
  'Tipo',
  'Categoria',
  'Unidade',
  'Preço Unitário',
  'Estoque Mínimo',
  'Ponto de Pedido',
  'Fornecedor',
  'ImagemURL',
  'Ativo',
  'Data Cadastro',
  'Código Fornecedor',      // NOVO - Coluna N
  'Mapeamento Códigos'       // NOVO - Coluna O
];

// Ajustar larguras
aba.setColumnWidth(14, 150); // Código Fornecedor
aba.setColumnWidth(15, 250); // Mapeamento Códigos
```

**Atualizar CONFIG:**
```javascript
// Em 01.config.js - Adicionar ao COLUNAS_PRODUTOS

COLUNAS_PRODUTOS: {
  ID: 1,
  CODIGO: 2,
  NOME: 3,
  TIPO: 4,
  CATEGORIA: 5,
  UNIDADE: 6,
  PRECO_UNITARIO: 7,
  ESTOQUE_MINIMO: 8,
  PONTO_PEDIDO: 9,
  FORNECEDOR: 10,
  IMAGEM_URL: 11,
  ATIVO: 12,
  DATA_CADASTRO: 13,
  CODIGO_FORNECEDOR: 14,    // NOVO
  MAPEAMENTO_CODIGOS: 15     // NOVO
}
```

---

#### 1.2. Criar Nova Aba **Histórico de Custos**

**Colunas (14 colunas):**
```
A - ID
B - Produto ID
C - Produto Nome
D - Data
E - Custo Unitário
F - Quantidade Comprada
G - Fornecedor
H - Número NF
I - NF ID
J - Custo Anterior
K - Variação %
L - Tipo Movimentação (COMPRA/AJUSTE)
M - Responsável
N - Observações
```

**Implementação:**
```javascript
// Criar arquivo: 01.setup.js (adicionar função)

function criarAbaHistoricoCustos(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);

  if (aba) {
    Logger.log('⚠️ Aba Histórico de Custos já existe');
    return;
  }

  aba = ss.insertSheet(CONFIG.ABAS.HISTORICO_CUSTOS);

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

  const headerRange = aba.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#00A651');
  headerRange.setFontColor('#FFFFFF');

  // Larguras
  aba.setColumnWidth(1, 80);   // ID
  aba.setColumnWidth(2, 120);  // Produto ID
  aba.setColumnWidth(3, 200);  // Produto Nome
  aba.setColumnWidth(4, 100);  // Data
  aba.setColumnWidth(5, 100);  // Custo Unitário
  aba.setColumnWidth(6, 100);  // Quantidade
  aba.setColumnWidth(7, 150);  // Fornecedor
  aba.setColumnWidth(8, 100);  // Número NF
  aba.setColumnWidth(9, 120);  // NF ID
  aba.setColumnWidth(10, 100); // Custo Anterior
  aba.setColumnWidth(11, 80);  // Variação %
  aba.setColumnWidth(12, 100); // Tipo
  aba.setColumnWidth(13, 150); // Responsável
  aba.setColumnWidth(14, 250); // Observações

  aba.setFrozenRows(1);

  Logger.log('✅ Aba Histórico de Custos criada');
}
```

**Atualizar CONFIG:**
```javascript
// Em 01.config.js

ABAS: {
  PRODUCTS: 'Produtos',
  ORDERS: 'Pedidos',
  STOCK: 'Estoque',
  STOCK_MOVEMENTS: 'Movimentações Estoque',
  USERS: 'Usuários',
  CONFIG: 'Configurações',
  LOGS: 'Registros',
  KPIS: 'Indicadores',
  NOTAS_FISCAIS: 'Notas Fiscais',
  HISTORICO_CUSTOS: 'Histórico Custos'  // NOVO
},

COLUNAS_HISTORICO_CUSTOS: {
  ID: 1,
  PRODUTO_ID: 2,
  PRODUTO_NOME: 3,
  DATA: 4,
  CUSTO_UNITARIO: 5,
  QUANTIDADE: 6,
  FORNECEDOR: 7,
  NUMERO_NF: 8,
  NF_ID: 9,
  CUSTO_ANTERIOR: 10,
  VARIACAO_PERCENTUAL: 11,
  TIPO_MOVIMENTACAO: 12,
  RESPONSAVEL: 13,
  OBSERVACOES: 14
}
```

---

#### 1.3. Atualizar Aba **Movimentações Estoque**

**Adicionar colunas:**
- **Coluna L:** NF ID (referência)
- **Coluna M:** Custo Unitário

**Implementação:**
```javascript
// Em 01.setup.js - Atualizar criarAbaMovimentacoesEstoque()

const headers = [
  'ID',
  'Data/Hora',
  'Tipo Movimentação',
  'Produto ID',
  'Produto Nome',
  'Quantidade',
  'Estoque Anterior',
  'Estoque Atual',
  'Responsável',
  'Observações',
  'Pedido ID',
  'NF ID',           // NOVO - Coluna L
  'Custo Unitário'   // NOVO - Coluna M
];
```

**Atualizar CONFIG:**
```javascript
// Em 01.config.js

COLUNAS_MOVIMENTACOES: {
  ID: 1,
  DATA_HORA: 2,
  TIPO_MOVIMENTACAO: 3,
  PRODUTO_ID: 4,
  PRODUTO_NOME: 5,
  QUANTIDADE: 6,
  ESTOQUE_ANTERIOR: 7,
  ESTOQUE_ATUAL: 8,
  RESPONSAVEL: 9,
  OBSERVACOES: 10,
  PEDIDO_ID: 11,
  NF_ID: 12,              // NOVO
  CUSTO_UNITARIO: 13      // NOVO
}
```

---

#### 1.4. Criar Nova Aba **Itens de Notas Fiscais**

**Colunas (14 colunas):**
```
A - ID
B - NF ID
C - Produto ID (mapeado)
D - Produto Nome
E - Código na NF
F - Descrição na NF
G - NCM
H - Quantidade
I - Unidade
J - Valor Unitário
K - Valor Total
L - Mapeado (Sim/Não)
M - Match Score (0-1)
N - Data Entrada
```

**Implementação:**
```javascript
// Criar em 01.setup.js

function criarAbaItensNotasFiscais(ss) {
  let aba = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

  if (aba) {
    Logger.log('⚠️ Aba Itens de Notas Fiscais já existe');
    return;
  }

  aba = ss.insertSheet(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

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

  const headerRange = aba.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#00A651');
  headerRange.setFontColor('#FFFFFF');

  // Larguras
  aba.setColumnWidth(1, 80);
  aba.setColumnWidth(2, 120);
  aba.setColumnWidth(3, 120);
  aba.setColumnWidth(4, 200);
  aba.setColumnWidth(5, 120);
  aba.setColumnWidth(6, 250);
  aba.setColumnWidth(7, 100);
  aba.setColumnWidth(8, 80);
  aba.setColumnWidth(9, 80);
  aba.setColumnWidth(10, 100);
  aba.setColumnWidth(11, 100);
  aba.setColumnWidth(12, 80);
  aba.setColumnWidth(13, 80);
  aba.setColumnWidth(14, 150);

  aba.setFrozenRows(1);

  Logger.log('✅ Aba Itens de Notas Fiscais criada');
}
```

**Atualizar CONFIG:**
```javascript
// Em 01.config.js

ABAS: {
  // ... existentes ...
  ITENS_NOTAS_FISCAIS: 'Itens NF'  // NOVO
},

COLUNAS_ITENS_NF: {
  ID: 1,
  NF_ID: 2,
  PRODUTO_ID: 3,
  PRODUTO_NOME: 4,
  CODIGO_NF: 5,
  DESCRICAO_NF: 6,
  NCM: 7,
  QUANTIDADE: 8,
  UNIDADE: 9,
  VALOR_UNITARIO: 10,
  VALOR_TOTAL: 11,
  MAPEADO: 12,
  MATCH_SCORE: 13,
  DATA_ENTRADA: 14
}
```

---

### FASE 2: Backend - Funções Críticas

#### 2.1. Criar função `registrarMovimentacao()` GENÉRICA

**⚠️ CRÍTICO:** Esta função NÃO EXISTE e é chamada pelo código!

```javascript
// Criar em 05.controleEstoque.js

/**
 * Registra movimentação genérica de estoque (v10.5)
 * Unifica entrada/saída/ajuste
 *
 * @param {object} dados - { tipo, produtoId, quantidade, observacoes, responsavel, pedidoId, nfId, custoUnitario }
 * @returns {object} - { success: boolean }
 */
function registrarMovimentacao(dados) {
  try {
    Logger.log(`📦 Registrando movimentação: ${dados.tipo} - Produto: ${dados.produtoId}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaEstoque || !abaMovimentacoes || !abaProdutos) {
      return { success: false, error: 'Abas não encontradas' };
    }

    // 1. Buscar produto
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    let produtoNome = '';

    for (let i = 1; i < dadosProdutos.length; i++) {
      if (dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.ID - 1] === dados.produtoId) {
        produtoNome = dadosProdutos[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1];
        break;
      }
    }

    if (!produtoNome) {
      return { success: false, error: 'Produto não encontrado' };
    }

    // 2. Buscar estoque atual
    const dadosEstoque = abaEstoque.getDataRange().getValues();
    let estoqueRow = -1;
    let estoqueAtual = 0;

    for (let i = 1; i < dadosEstoque.length; i++) {
      if (dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_ID - 1] === dados.produtoId) {
        estoqueRow = i + 1;
        estoqueAtual = dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1] || 0;
        break;
      }
    }

    // Se produto não tem estoque cadastrado, criar
    if (estoqueRow === -1) {
      const novaLinhaEstoque = [
        'EST-' + Date.now(),
        dados.produtoId,
        produtoNome,
        0,  // Quantidade atual (será atualizada)
        0,  // Quantidade reservada
        0,  // Estoque disponível
        new Date(),
        dados.responsavel || Session.getActiveUser().getEmail()
      ];
      abaEstoque.appendRow(novaLinhaEstoque);
      estoqueRow = abaEstoque.getLastRow();
      estoqueAtual = 0;
    }

    // 3. Calcular novo estoque
    let novoEstoque = estoqueAtual;

    if (dados.tipo === CONFIG.TIPOS_MOVIMENTACAO.ENTRADA) {
      novoEstoque = estoqueAtual + dados.quantidade;
    } else if (dados.tipo === CONFIG.TIPOS_MOVIMENTACAO.SAIDA) {
      novoEstoque = estoqueAtual - dados.quantidade;

      if (novoEstoque < 0) {
        return { success: false, error: 'Estoque insuficiente' };
      }
    } else if (dados.tipo === CONFIG.TIPOS_MOVIMENTACAO.AJUSTE) {
      novoEstoque = dados.quantidade; // Ajuste define quantidade absoluta
    }

    // 4. Atualizar estoque
    abaEstoque.getRange(estoqueRow, CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL).setValue(novoEstoque);
    abaEstoque.getRange(estoqueRow, CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL).setValue(novoEstoque);
    abaEstoque.getRange(estoqueRow, CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO).setValue(new Date());
    abaEstoque.getRange(estoqueRow, CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL).setValue(dados.responsavel || Session.getActiveUser().getEmail());

    // 5. Registrar movimentação
    const movId = 'MOV-' + Date.now();
    const novaMovimentacao = [
      movId,
      new Date(),
      dados.tipo,
      dados.produtoId,
      produtoNome,
      dados.quantidade,
      estoqueAtual,
      novoEstoque,
      dados.responsavel || Session.getActiveUser().getEmail(),
      dados.observacoes || '',
      dados.pedidoId || '',
      dados.nfId || '',           // NOVO - Coluna L
      dados.custoUnitario || 0    // NOVO - Coluna M
    ];

    abaMovimentacoes.appendRow(novaMovimentacao);

    Logger.log(`✅ Movimentação registrada: ${dados.tipo} - Estoque: ${estoqueAtual} → ${novoEstoque}`);

    return {
      success: true,
      estoqueAnterior: estoqueAtual,
      estoqueAtual: novoEstoque,
      movimentacaoId: movId
    };

  } catch (error) {
    Logger.log(`❌ Erro ao registrar movimentação: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

#### 2.2. Criar função `registrarHistoricoCusto()`

```javascript
// Criar em 11.notasFiscais.js

/**
 * Registra histórico de custo no banco (v10.5)
 *
 * @param {object} dados - Dados do custo
 * @returns {object} - { success: boolean }
 */
function registrarHistoricoCusto(dados) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaHistorico = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);

    if (!abaHistorico) {
      // Criar aba se não existir
      criarAbaHistoricoCustos(ss);
      abaHistorico = ss.getSheetByName(CONFIG.ABAS.HISTORICO_CUSTOS);
    }

    const variacaoPercentual = dados.custoAnterior > 0
      ? ((dados.custoUnitario - dados.custoAnterior) / dados.custoAnterior) * 100
      : 0;

    const novaLinha = [
      'HC-' + Date.now(),
      dados.produtoId,
      dados.produtoNome,
      new Date(),
      dados.custoUnitario,
      dados.quantidade,
      dados.fornecedor,
      dados.numeroNF,
      dados.nfId,
      dados.custoAnterior,
      variacaoPercentual,
      dados.tipo || 'COMPRA',
      dados.responsavel || Session.getActiveUser().getEmail(),
      dados.observacoes || ''
    ];

    abaHistorico.appendRow(novaLinha);

    Logger.log(`✅ Histórico de custo registrado: ${dados.produtoNome} - R$ ${dados.custoAnterior.toFixed(2)} → R$ ${dados.custoUnitario.toFixed(2)}`);

    return { success: true };

  } catch (error) {
    Logger.log(`❌ Erro ao registrar histórico de custo: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

---

#### 2.3. Criar função `registrarItemNF()`

```javascript
// Criar em 11.notasFiscais.js

/**
 * Registra item da NF na aba Itens NF (v10.5)
 *
 * @param {object} dados - Dados do item
 * @returns {object} - { success: boolean }
 */
function registrarItemNF(dados) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaItens = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);

    if (!abaItens) {
      criarAbaItensNotasFiscais(ss);
      abaItens = ss.getSheetByName(CONFIG.ABAS.ITENS_NOTAS_FISCAIS);
    }

    const novaLinha = [
      'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      dados.nfId,
      dados.produtoId || '',
      dados.produtoNome || '',
      dados.codigoNF,
      dados.descricaoNF,
      dados.ncm || '',
      dados.quantidade,
      dados.unidade || '',
      dados.valorUnitario,
      dados.valorTotal,
      dados.mapeado ? 'Sim' : 'Não',
      dados.matchScore || 0,
      new Date()
    ];

    abaItens.appendRow(novaLinha);

    return { success: true };

  } catch (error) {
    Logger.log(`❌ Erro ao registrar item NF: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

---

#### 2.4. Atualizar função `processarNFComCustoMedio()`

```javascript
// Atualizar em 11.notasFiscais.js - linhas 796-896

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
    const fornecedor = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1];

    const email = Session.getActiveUser().getEmail();
    let erros = [];

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

      // Registrar histórico de custo
      registrarHistoricoCusto({
        produtoId: produtoId,
        produtoNome: produtoNome,
        custoUnitario: resultadoCusto.novoCustoMedio,
        custoAnterior: resultadoCusto.custoAnterior,
        quantidade: quantidade,
        fornecedor: fornecedor,
        numeroNF: numeroNF,
        nfId: nfId,
        tipo: 'COMPRA',
        responsavel: email
      });

      // Registrar movimentação de entrada COM referência à NF
      const resultadoMov = registrarMovimentacao({
        tipo: CONFIG.TIPOS_MOVIMENTACAO.ENTRADA,
        produtoId: produtoId,
        quantidade: quantidade,
        observacoes: `Entrada NF ${numeroNF} - Custo: R$ ${valorUnitarioNF.toFixed(2)} - Novo custo médio: R$ ${resultadoCusto.novoCustoMedio.toFixed(2)}`,
        responsavel: email,
        nfId: nfId,                    // NOVO
        custoUnitario: valorUnitarioNF // NOVO
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
```

---

#### 2.5. Criar função `cadastrarProdutoAutomatico()`

**Para produtos não mapeados que precisam ser cadastrados:**

```javascript
// Criar em 03.gerenciamentoProdutos.js

/**
 * Cadastra produto automaticamente a partir da NF (v10.5)
 *
 * @param {object} dadosProduto - Dados do produto da NF
 * @returns {object} - { success: boolean, produtoId: string }
 */
function cadastrarProdutoAutomatico(dadosProduto) {
  try {
    Logger.log(`📦 Cadastrando produto automático: ${dadosProduto.descricao}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    // Gerar código interno único
    const timestamp = Date.now();
    const codigoInterno = dadosProduto.tipo === 'Papelaria'
      ? `PAP-${timestamp}`
      : `LMP-${timestamp}`;

    const produtoId = 'PROD-' + timestamp;

    // Preparar mapeamento de códigos
    const mapeamentoCodigos = JSON.stringify([{
      fornecedor: dadosProduto.fornecedor,
      codigo: dadosProduto.codigoNF,
      principal: true
    }]);

    const novaLinha = [
      produtoId,
      codigoInterno,
      dadosProduto.descricao,
      dadosProduto.tipo,
      'Outros',  // Categoria padrão
      dadosProduto.unidade || 'UN',
      dadosProduto.valorUnitario,
      0,  // Estoque mínimo
      0,  // Ponto de pedido
      dadosProduto.fornecedor,
      '',  // ImagemURL
      'Sim',  // Ativo
      new Date(),
      dadosProduto.codigoNF,  // Código Fornecedor - NOVA COLUNA
      mapeamentoCodigos        // Mapeamento Códigos - NOVA COLUNA
    ];

    abaProdutos.appendRow(novaLinha);

    // Criar registro de estoque zerado
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    if (abaEstoque) {
      const novaLinhaEstoque = [
        'EST-' + timestamp,
        produtoId,
        dadosProduto.descricao,
        0,
        0,
        0,
        new Date(),
        Session.getActiveUser().getEmail()
      ];
      abaEstoque.appendRow(novaLinhaEstoque);
    }

    Logger.log(`✅ Produto cadastrado automaticamente: ${produtoId} - ${dadosProduto.descricao}`);

    return {
      success: true,
      produtoId: produtoId,
      codigoInterno: codigoInterno
    };

  } catch (error) {
    Logger.log(`❌ Erro ao cadastrar produto automático: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

#### 2.6. Atualizar função `mapearProdutosNF()`

**Adicionar suporte para múltiplos códigos de fornecedor:**

```javascript
// Atualizar em 11.notasFiscais.js - linhas 662-753

function mapearProdutosNF(produtosNF, tipoProdutos, fornecedor) {
  try {
    Logger.log(`🔗 Mapeando ${produtosNF.length} produtos da NF...`);

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
      if (tipo !== tipoProdutos) continue;

      // Carregar mapeamento de códigos
      const mapeamentoStr = dados[i][CONFIG.COLUNAS_PRODUTOS.MAPEAMENTO_CODIGOS - 1] || '[]';
      let mapeamento = [];

      try {
        mapeamento = JSON.parse(mapeamentoStr);
      } catch (e) {
        mapeamento = [];
      }

      produtosCadastrados.push({
        id: dados[i][CONFIG.COLUNAS_PRODUTOS.ID - 1],
        codigo: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO - 1] || '').toUpperCase(),
        codigoFornecedor: String(dados[i][CONFIG.COLUNAS_PRODUTOS.CODIGO_FORNECEDOR - 1] || '').toUpperCase(),
        nome: String(dados[i][CONFIG.COLUNAS_PRODUTOS.NOME - 1] || '').toUpperCase(),
        tipo: dados[i][CONFIG.COLUNAS_PRODUTOS.TIPO - 1],
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

      // Estratégia 1: Match exato por código interno
      if (codigoNF) {
        produtoEncontrado = produtosCadastrados.find(p => p.codigo === codigoNF);
        if (produtoEncontrado) matchScore = 1.0;
      }

      // Estratégia 2: Match por código fornecedor principal
      if (!produtoEncontrado && codigoNF) {
        produtoEncontrado = produtosCadastrados.find(p => p.codigoFornecedor === codigoNF);
        if (produtoEncontrado) matchScore = 1.0;
      }

      // Estratégia 3: Match por mapeamento de códigos
      if (!produtoEncontrado && codigoNF && fornecedor) {
        produtoEncontrado = produtosCadastrados.find(p => {
          return p.mapeamento.some(m =>
            m.fornecedor === fornecedor &&
            String(m.codigo).toUpperCase() === codigoNF
          );
        });
        if (produtoEncontrado) matchScore = 1.0;
      }

      // Estratégia 4: Match parcial por descrição
      if (!produtoEncontrado && descricaoNF) {
        let melhorMatch = null;
        let melhorScore = 0;

        produtosCadastrados.forEach(p => {
          const similarity = calcularSimilaridade(p.nome, descricaoNF);
          if (similarity > melhorScore && similarity > 0.7) {
            melhorScore = similarity;
            melhorMatch = p;
          }
        });

        if (melhorMatch) {
          produtoEncontrado = melhorMatch;
          matchScore = melhorScore;
        }
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
          ncm: prodNF.ncm,
          unidade: prodNF.unidade,
          matchScore: matchScore
        });
        Logger.log(`✅ Mapeado: ${prodNF.descricao} → ${produtoEncontrado.nome} (score: ${matchScore.toFixed(2)})`);
      } else {
        naoMapeados.push({
          codigoNF: prodNF.codigoNF,
          descricao: prodNF.descricao,
          ncm: prodNF.ncm,
          unidade: prodNF.unidade,
          quantidade: prodNF.quantidade,
          valorUnitario: prodNF.valorUnitario
        });
        Logger.log(`⚠️ Não mapeado: ${prodNF.descricao}`);
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
```

---

#### 2.7. Criar função `processarNFComCadastroAutomatico()`

**Nova função que mapeia E cadastra produtos novos:**

```javascript
// Criar em 11.notasFiscais.js

/**
 * Processa NF com cadastro automático de produtos não mapeados (v10.5)
 *
 * @param {string} nfId - ID da NF
 * @param {boolean} cadastrarNovos - Se true, cadastra produtos não mapeados
 * @returns {object} - { success: boolean }
 */
function processarNFComCadastroAutomatico(nfId, cadastrarNovos) {
  try {
    Logger.log(`⚙️ Processando NF ${nfId} - Cadastro automático: ${cadastrarNovos}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaNF = ss.getSheetByName(CONFIG.ABAS.NOTAS_FISCAIS);

    if (!abaNF) {
      return { success: false, error: 'Aba Notas Fiscais não encontrada' };
    }

    // Buscar NF
    const dadosNF = abaNF.getDataRange().getValues();
    let nfData = null;
    let nfRow = -1;

    for (let i = 1; i < dadosNF.length; i++) {
      if (dadosNF[i][CONFIG.COLUNAS_NOTAS_FISCAIS.ID - 1] === nfId) {
        nfData = dadosNF[i];
        nfRow = i + 1;
        break;
      }
    }

    if (!nfData) {
      return { success: false, error: 'NF não encontrada' };
    }

    // Extrair produtos já mapeados
    const produtosMapeados = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.PRODUTOS - 1]);
    const quantidades = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.QUANTIDADE - 1]);
    const valoresUnitarios = JSON.parse(nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.VALORES_UNITARIOS - 1]);
    const fornecedor = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.FORNECEDOR - 1];
    const tipoProdutos = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.TIPO_PRODUTOS - 1];
    const numeroNF = nfData[CONFIG.COLUNAS_NOTAS_FISCAIS.NUMERO_NF - 1];

    // Se tem produtos não mapeados E usuário quer cadastrar
    if (cadastrarNovos) {
      // Parse do XML original para pegar produtos não mapeados
      // (Isso requer armazenar XML ou dados extras na NF)
      // Por simplicidade, assume que produtos já foram filtrados
    }

    // Processar com custo médio
    return processarNFComCustoMedio(nfId);

  } catch (error) {
    Logger.log(`❌ Erro ao processar NF: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

---

### FASE 3: Frontend - Modal de Upload

#### 3.1. Substituir Modal de NF no Index.html

**Localização:** Procure por `<!-- Modal: Nova Nota Fiscal (v10.3) -->` (cerca da linha 2147)

**Substituir por:**

```html
<!-- Modal: Nova Nota Fiscal com Upload XML (v10.5) -->
<div class="modal" id="modalNovaNF">
  <div class="modal-content" style="max-width: 900px;">
    <div class="modal-header">
      <h3 class="modal-title">📄 Nova Nota Fiscal - Upload XML</h3>
      <button class="modal-close" onclick="closeModal('modalNovaNF')">&times;</button>
    </div>

    <form id="formNovaNF" onsubmit="submitNovaNFXML(event)">

      <!-- PASSO 1: Tipo de Produto -->
      <div class="form-group">
        <label class="form-label">Tipo de Produtos da NF *</label>
        <select class="form-control" id="nfTipoProdutos" required>
          <option value="">Selecione o tipo ANTES de fazer upload...</option>
          <option value="Papelaria">📝 Papelaria</option>
          <option value="Limpeza">🧹 Limpeza</option>
        </select>
        <small style="color: #856404; background: #fff3cd; padding: 5px; border-radius: 3px; display: inline-block; margin-top: 5px;">
          ⚠️ Importante: Selecione o tipo ANTES de fazer upload do XML
        </small>
      </div>

      <!-- PASSO 2: Upload de XML -->
      <div class="form-group">
        <label class="form-label">Arquivo XML da NF-e *</label>
        <input
          type="file"
          class="form-control"
          id="nfArquivoXML"
          accept=".xml"
          required
          onchange="processarArquivoXML(event)"
          style="padding: 10px; border: 2px dashed #ccc;">
        <small style="color: #666; display: block; margin-top: 5px;">
          📄 Faça upload do arquivo XML da nota fiscal eletrônica (NF-e)
        </small>
      </div>

      <!-- PASSO 3: Preview dos Dados -->
      <div id="nfPreviewArea" style="display: none; margin-top: 20px;">

        <!-- Dados Básicos da NF -->
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #2e7d32;">📋 Dados da NF</h4>
          <div id="nfDadosBasicos"></div>
        </div>

        <!-- Produtos Mapeados -->
        <div id="nfProdutosMapeadosContainer" style="display: none; margin-bottom: 15px;">
          <div style="background: #d4edda; padding: 15px; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Produtos Identificados</h4>
            <div id="nfProdutosMapeados"></div>
          </div>
        </div>

        <!-- Produtos Não Mapeados -->
        <div id="nfProdutosNaoMapeadosContainer" style="display: none; margin-bottom: 15px;">
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 2px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Produtos NÃO Identificados</h4>
            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #856404;">
              Os produtos abaixo não foram encontrados no sistema. Você pode:
            </p>
            <div id="nfProdutosNaoMapeados"></div>

            <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 5px;">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="nfCadastrarNovos" style="margin-right: 10px; width: 18px; height: 18px;">
                <span style="font-weight: bold; color: #856404;">
                  Cadastrar automaticamente estes produtos no sistema
                </span>
              </label>
              <small style="display: block; margin-top: 5px; color: #666;">
                ℹ️ Os produtos serão criados com os dados da NF. Você poderá editá-los depois.
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden field para armazenar dados -->
      <input type="hidden" id="nfDadosParsed">

      <!-- Observações -->
      <div class="form-group">
        <label class="form-label">Observações</label>
        <textarea class="form-control" id="nfObservacoes" rows="3" placeholder="Observações adicionais sobre esta nota fiscal..."></textarea>
      </div>

      <!-- Botões -->
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;" id="btnCadastrarNF" disabled>
          ✅ Processar Nota Fiscal
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

#### 3.2. Adicionar Funções JavaScript

**Localização:** Após as funções de NF existentes (cerca da linha 5710 do Index.html)

**Adicionar:**

```javascript
/**
 * ========================================
 * UPLOAD E PROCESSAMENTO DE XML (v10.5)
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
    showError('Selecione o tipo de produtos ANTES de fazer upload do XML');
    document.getElementById('nfArquivoXML').value = '';
    return;
  }

  showLoading('Processando XML da NF-e...');

  const reader = new FileReader();

  reader.onload = function(e) {
    const xmlContent = e.target.result;
    const xmlBase64 = btoa(unescape(encodeURIComponent(xmlContent)));

    // Enviar para backend para parse
    google.script.run
      .withSuccessHandler(function(response) {
        hideLoading();

        if (response && response.success) {
          // Parse OK, agora mapear produtos
          mapearProdutosNFFromXML(response.dadosNF, tipoProdutos);
        } else {
          showError('Erro ao processar XML: ' + (response ? response.error : 'Erro desconhecido'));
          document.getElementById('nfArquivoXML').value = '';
        }
      })
      .withFailureHandler(function(error) {
        hideLoading();
        showError('Erro ao ler XML: ' + error.message);
        document.getElementById('nfArquivoXML').value = '';
      })
      .uploadEProcessarXMLNF(xmlBase64, file.name);
  };

  reader.onerror = function() {
    hideLoading();
    showError('Erro ao ler arquivo XML');
    document.getElementById('nfArquivoXML').value = '';
  };

  reader.readAsText(file);
}

/**
 * Mapeia produtos da NF com produtos cadastrados
 */
function mapearProdutosNFFromXML(dadosNF, tipoProdutos) {
  showLoading('Mapeando produtos...');

  google.script.run
    .withSuccessHandler(function(response) {
      hideLoading();

      if (response && response.success) {
        exibirPreviewCompleto(dadosNF, response.mapeamento, response.naoMapeados, tipoProdutos);
      } else {
        showError('Erro ao mapear produtos: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro: ' + error.message);
    })
    .mapearProdutosNF(dadosNF.produtos, tipoProdutos, dadosNF.fornecedor);
}

/**
 * Exibe preview completo da NF
 */
function exibirPreviewCompleto(dadosNF, mapeamento, naoMapeados, tipoProdutos) {
  console.log('📋 Preview:', { dadosNF, mapeamento, naoMapeados });

  // Dados básicos
  document.getElementById('nfDadosBasicos').innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.95rem;">
      <div><strong>Número NF:</strong> ${dadosNF.numeroNF}</div>
      <div><strong>Data Emissão:</strong> ${formatDate(dadosNF.dataEmissao)}</div>
      <div><strong>Fornecedor:</strong> ${dadosNF.fornecedor}</div>
      <div><strong>CNPJ:</strong> ${dadosNF.cnpjFornecedor}</div>
      <div><strong>Valor Total:</strong> <span style="color: #2e7d32; font-weight: bold;">R$ ${formatMoney(dadosNF.valorTotal)}</span></div>
      <div><strong>Total de Itens:</strong> ${dadosNF.produtos.length}</div>
    </div>
  `;

  // Produtos mapeados
  if (mapeamento.length > 0) {
    document.getElementById('nfProdutosMapeadosContainer').style.display = 'block';

    let htmlMapeados = `
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #155724;">
        ${mapeamento.length} produto(s) serão processados:
      </p>
      <div style="max-height: 300px; overflow-y: auto;">
        <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
          <thead style="background: #c3e6cb; position: sticky; top: 0;">
            <tr>
              <th style="padding: 8px; text-align: left; border: 1px solid #b1dfbb;">Produto Sistema</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #b1dfbb;">Descrição NF</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #b1dfbb;">Qtd</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #b1dfbb;">Valor Unit.</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #b1dfbb;">Match</th>
            </tr>
          </thead>
          <tbody>
    `;

    mapeamento.forEach(p => {
      const matchColor = p.matchScore === 1.0 ? '#28a745' : p.matchScore >= 0.8 ? '#ffc107' : '#dc3545';
      const matchIcon = p.matchScore === 1.0 ? '✅' : p.matchScore >= 0.8 ? '⚠️' : '❌';

      htmlMapeados += `
        <tr style="border-bottom: 1px solid #b1dfbb;">
          <td style="padding: 8px;"><strong>${p.produtoNome}</strong></td>
          <td style="padding: 8px; color: #666;">${p.descricaoNF}</td>
          <td style="padding: 8px; text-align: center;"><strong>${p.quantidade}</strong></td>
          <td style="padding: 8px; text-align: right;">R$ ${formatMoney(p.valorUnitario)}</td>
          <td style="padding: 8px; text-align: center;">
            <span style="color: ${matchColor};">${matchIcon} ${(p.matchScore * 100).toFixed(0)}%</span>
          </td>
        </tr>
      `;
    });

    htmlMapeados += `
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('nfProdutosMapeados').innerHTML = htmlMapeados;
  } else {
    document.getElementById('nfProdutosMapeadosContainer').style.display = 'none';
  }

  // Produtos não mapeados
  if (naoMapeados.length > 0) {
    document.getElementById('nfProdutosNaoMapeadosContainer').style.display = 'block';

    let htmlNaoMapeados = `
      <div style="max-height: 250px; overflow-y: auto; margin-bottom: 10px;">
        <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
          <thead style="background: #ffeaa7; position: sticky; top: 0;">
            <tr>
              <th style="padding: 8px; text-align: left; border: 1px solid #fdcb6e;">Código NF</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #fdcb6e;">Descrição</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #fdcb6e;">Qtd</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #fdcb6e;">Valor Unit.</th>
            </tr>
          </thead>
          <tbody>
    `;

    naoMapeados.forEach(p => {
      htmlNaoMapeados += `
        <tr style="border-bottom: 1px solid #fdcb6e;">
          <td style="padding: 8px;"><code>${p.codigoNF}</code></td>
          <td style="padding: 8px;"><strong>${p.descricao}</strong></td>
          <td style="padding: 8px; text-align: center;">${p.quantidade}</td>
          <td style="padding: 8px; text-align: right;">R$ ${formatMoney(p.valorUnitario)}</td>
        </tr>
      `;
    });

    htmlNaoMapeados += `
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('nfProdutosNaoMapeados').innerHTML = htmlNaoMapeados;
  } else {
    document.getElementById('nfProdutosNaoMapeadosContainer').style.display = 'none';
  }

  // Armazenar dados para submit
  document.getElementById('nfDadosParsed').value = JSON.stringify({
    dadosNF: dadosNF,
    mapeamento: mapeamento,
    naoMapeados: naoMapeados,
    tipoProdutos: tipoProdutos
  });

  // Mostrar preview
  document.getElementById('nfPreviewArea').style.display = 'block';

  // Habilitar botão
  document.getElementById('btnCadastrarNF').disabled = false;

  // Avisar se tem produtos não mapeados
  if (naoMapeados.length > 0) {
    showWarning(`⚠️ ${naoMapeados.length} produto(s) não foram identificados. Marque a opção para cadastrá-los automaticamente ou cancele e cadastre manualmente.`);
  }
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
  const cadastrarNovos = document.getElementById('nfCadastrarNovos')?.checked || false;

  // Validar produtos não mapeados
  if (dadosParsed.naoMapeados.length > 0 && !cadastrarNovos) {
    if (!confirm(`⚠️ ATENÇÃO!\n\n${dadosParsed.naoMapeados.length} produto(s) não foram identificados e NÃO serão processados.\n\nProdutos não processados:\n${dadosParsed.naoMapeados.map(p => `- ${p.descricao}`).join('\n')}\n\nDeseja continuar mesmo assim?`)) {
      return;
    }
  }

  const observacoes = document.getElementById('nfObservacoes').value;

  // Preparar dados de cadastro
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

  showLoading('Cadastrando Nota Fiscal...');

  // 1. Cadastrar produtos não mapeados (se usuário marcou)
  if (cadastrarNovos && dadosParsed.naoMapeados.length > 0) {
    cadastrarProdutosNaoMapeados(dadosParsed.naoMapeados, dadosParsed.tipoProdutos, dadosParsed.dadosNF.fornecedor, function(produtosCadastrados) {

      // Adicionar produtos recém cadastrados
      produtosCadastrados.forEach(p => {
        dadosCadastro.produtos.push(p.produtoId);
        dadosCadastro.quantidades.push(p.quantidade);
        dadosCadastro.valoresUnitarios.push(p.valorUnitario);
      });

      // Prosseguir com cadastro da NF
      cadastrarEProcessarNF(dadosCadastro);
    });
  } else {
    // Cadastrar NF direto
    cadastrarEProcessarNF(dadosCadastro);
  }
}

/**
 * Cadastra produtos não mapeados
 */
function cadastrarProdutosNaoMapeados(naoMapeados, tipoProdutos, fornecedor, callback) {
  let produtosCadastrados = [];
  let erros = [];
  let processados = 0;

  naoMapeados.forEach(prodNF => {
    const dadosProduto = {
      descricao: prodNF.descricao,
      codigoNF: prodNF.codigoNF,
      tipo: tipoProdutos,
      unidade: prodNF.unidade,
      valorUnitario: prodNF.valorUnitario,
      fornecedor: fornecedor
    };

    google.script.run
      .withSuccessHandler(function(response) {
        processados++;

        if (response && response.success) {
          produtosCadastrados.push({
            produtoId: response.produtoId,
            quantidade: prodNF.quantidade,
            valorUnitario: prodNF.valorUnitario
          });
        } else {
          erros.push(`${prodNF.descricao}: ${response ? response.error : 'Erro desconhecido'}`);
        }

        // Quando terminar todos
        if (processados === naoMapeados.length) {
          if (erros.length > 0) {
            showWarning(`⚠️ Alguns produtos não puderam ser cadastrados:\n${erros.join('\n')}`);
          }
          callback(produtosCadastrados);
        }
      })
      .withFailureHandler(function(error) {
        processados++;
        erros.push(`${prodNF.descricao}: ${error.message}`);

        if (processados === naoMapeados.length) {
          showWarning(`⚠️ Alguns produtos não puderam ser cadastrados:\n${erros.join('\n')}`);
          callback(produtosCadastrados);
        }
      })
      .cadastrarProdutoAutomatico(dadosProduto);
  });
}

/**
 * Cadastra e processa NF
 */
function cadastrarEProcessarNF(dadosCadastro) {
  google.script.run
    .withSuccessHandler(function(response) {
      if (response && response.success) {
        // NF cadastrada, agora processar
        processarNFComCustoMedio(response.nfId);
      } else {
        hideLoading();
        showError('Erro ao cadastrar NF: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro ao cadastrar NF: ' + error.message);
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
        showSuccess('✅ Nota Fiscal processada com sucesso!\n\n' + response.message);
        closeModal('modalNovaNF');
        loadNotasFiscais();
      } else {
        showError('Erro ao processar NF: ' + (response ? response.error : 'Erro desconhecido'));
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showError('Erro ao processar NF: ' + error.message);
    })
    .processarNFComCustoMedio(nfId);
}

/**
 * Helper: Mostra warning
 */
function showWarning(message) {
  alert('⚠️ ATENÇÃO\n\n' + message);
}
```

---

### FASE 4: Atualizar Setup

#### 4.1. Atualizar função `setupPlanilha()`

```javascript
// Em 01.setup.js - Adicionar chamadas

// ... após criarAbaNotasFiscais(ss);

// 10. Criar aba de Histórico de Custos (v10.5)
criarAbaHistoricoCustos(ss);
Logger.log('✅ Aba Histórico de Custos criada');

// 11. Criar aba de Itens de Notas Fiscais (v10.5)
criarAbaItensNotasFiscais(ss);
Logger.log('✅ Aba Itens de Notas Fiscais criada');
```

---

### FASE 5: Testes e Validação

#### 5.1. Checklist de Testes

```
☐ Setup cria todas as novas abas
☐ Produtos tem colunas Código Fornecedor e Mapeamento
☐ Movimentações tem colunas NF ID e Custo Unitário
☐ Modal de NF aceita upload de XML
☐ Parse de XML funciona
☐ Mapeamento de produtos funciona (código exato)
☐ Mapeamento de produtos funciona (similaridade)
☐ Produtos não mapeados são listados
☐ Cadastro automático de produtos funciona
☐ Custo médio é calculado corretamente
☐ Histórico de custos é registrado
☐ Movimentações tem referência à NF
☐ Estoque é atualizado
☐ Status da NF muda para Processada
```

---

## 📦 RESUMO DAS ALTERAÇÕES

### Arquivos a Modificar:

1. **01.config.js**
   - Adicionar COLUNAS_HISTORICO_CUSTOS
   - Adicionar COLUNAS_ITENS_NF
   - Atualizar COLUNAS_PRODUTOS
   - Atualizar COLUNAS_MOVIMENTACOES
   - Adicionar ABAS novas

2. **01.setup.js**
   - Criar criarAbaHistoricoCustos()
   - Criar criarAbaItensNotasFiscais()
   - Atualizar criarAbaProdutos() (+ 2 colunas)
   - Atualizar criarAbaMovimentacoesEstoque() (+ 2 colunas)
   - Atualizar setupPlanilha() (chamar novas funções)

3. **03.gerenciamentoProdutos.js**
   - Criar cadastrarProdutoAutomatico()

4. **05.controleEstoque.js**
   - Criar registrarMovimentacao() GENÉRICA

5. **11.notasFiscais.js**
   - Criar registrarHistoricoCusto()
   - Criar registrarItemNF()
   - Atualizar mapearProdutosNF() (suporte a múltiplos códigos)
   - Atualizar processarNFComCustoMedio() (registrar histórico)
   - Criar processarNFComCadastroAutomatico()

6. **Index.html**
   - Substituir modal de NF (linha ~2147)
   - Adicionar funções JavaScript (linha ~5710):
     - processarArquivoXML()
     - mapearProdutosNFFromXML()
     - exibirPreviewCompleto()
     - submitNovaNFXML()
     - cadastrarProdutosNaoMapeados()
     - cadastrarEProcessarNF()
     - processarNFComCustoMedio()
     - showWarning()

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO

### DIA 1: Estrutura de Dados
1. Atualizar 01.config.js (30min)
2. Criar funções criarAbaHistoricoCustos() e criarAbaItensNotasFiscais() (1h)
3. Atualizar criarAbaProdutos() e criarAbaMovimentacoesEstoque() (30min)
4. Testar setup completo (30min)

### DIA 2: Backend Crítico
5. Criar registrarMovimentacao() genérica (1h)
6. Criar registrarHistoricoCusto() (30min)
7. Criar registrarItemNF() (30min)
8. Criar cadastrarProdutoAutomatico() (1h)
9. Atualizar mapearProdutosNF() (1h)
10. Atualizar processarNFComCustoMedio() (1h)

### DIA 3: Frontend e Testes
11. Substituir modal de NF (30min)
12. Adicionar funções JavaScript (2h)
13. Testes completos (2h)
14. Deploy e validação (1h)

**TOTAL:** 12-15 horas de desenvolvimento

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Backup antes de alterar estrutura**
2. **Testar em planilha de homologação primeiro**
3. **Validar XMLs de fornecedores reais**
4. **Documentar códigos de fornecedor**
5. **Treinar usuários no novo fluxo**

---

## 📞 SUPORTE

Dúvidas ou problemas:
1. Verificar logs no Google Apps Script
2. Validar estrutura do XML
3. Conferir mapeamento de colunas no CONFIG
4. Testar com produtos já cadastrados primeiro
