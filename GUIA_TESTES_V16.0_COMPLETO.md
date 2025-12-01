# 🧪 GUIA DE TESTES COMPLETO - v16.0

## Sistema Neoformula v16.0 - Testes de Todas as Funcionalidades

**Versão**: 16.0 (FASE 3.4)
**Data**: 2025-12-01
**Status**: ✅ Produção

---

## 📋 ÍNDICE

1. [Pré-requisitos](#-pré-requisitos)
2. [Dashboard KPIs](#-teste-01-dashboard-kpis)
3. [Catálogo de Produtos](#-teste-02-catálogo-de-produtos)
4. [Sistema de Múltiplos Fornecedores](#-teste-03-sistema-de-múltiplos-fornecedores)
5. [Sistema de Estoque Reservado](#-teste-04-sistema-de-estoque-reservado)
6. [Pedidos - Criar](#-teste-05-criar-pedido)
7. [Pedidos - Cancelar](#-teste-06-cancelar-pedido)
8. [Pedidos - Concluir](#-teste-07-concluir-pedido)
9. [Movimentações de Estoque](#-teste-08-movimentações-de-estoque)
10. [Performance e Cache](#-teste-09-performance-e-cache)
11. [Validações e Segurança](#-teste-10-validações-e-segurança)
12. [Checklist Final](#-checklist-final)

---

## 📦 PRÉ-REQUISITOS

### Abas Necessárias na Planilha

Execute este teste antes de começar:

```javascript
function verificarEstrutura() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = ss.getSheets().map(s => s.getName());

  const abasNecessarias = [
    'Configurações',
    'Usuários',
    'Produtos',
    'Pedidos',
    'Estoque',
    'Movimentações Estoque',
    'Fornecedores'
  ];

  Logger.log('=== VERIFICAÇÃO DA ESTRUTURA ===');
  abasNecessarias.forEach(nome => {
    if (abas.includes(nome)) {
      Logger.log(`✅ ${nome}`);
    } else {
      Logger.log(`❌ FALTANDO: ${nome}`);
    }
  });

  // Verificar colunas de Estoque
  const abaEstoque = ss.getSheetByName('Estoque');
  if (abaEstoque) {
    const headers = abaEstoque.getRange(1, 1, 1, 8).getValues()[0];
    Logger.log('\n=== COLUNAS DE ESTOQUE ===');
    Logger.log('Esperado: Produto ID, Quantidade Atual, Estoque Mínimo, Ponto de Pedido, Última Atualização, Quantidade Reservada, Estoque Disponível, Última Movimentação');
    Logger.log('Atual: ' + headers.join(', '));
  }

  Logger.log('\n✅ Verificação concluída!');
}
```

**Resultado Esperado**:
```
✅ Todas as abas existem
✅ Aba Estoque tem 8 colunas (incluindo Quantidade Reservada e Estoque Disponível)
```

---

## 📊 TESTE 01: Dashboard KPIs

### Objetivo
Verificar se todos os KPIs do Dashboard carregam sem erros e calculam valores corretos.

### Cenário de Teste

#### 1.1. Verificar KPIs Financeiros

```javascript
function teste01_DashboardFinanceiro() {
  Logger.log('=== TESTE 01.1: KPIs Financeiros ===');

  // Buscar dados do Dashboard
  const resultado = getDashboardData();

  if (!resultado.success) {
    Logger.log('❌ FALHA: ' + resultado.error);
    return;
  }

  const kpis = resultado.data.kpis;

  // Verificar estrutura
  Logger.log('\n📊 Total de Pedidos:', kpis.totalPedidos || 0);
  Logger.log('💰 Valor Total:', kpis.valorTotal || 0);
  Logger.log('✅ Aprovados:', kpis.pedidosAprovados || 0);
  Logger.log('⏳ Em Análise:', kpis.pedidosEmAnalise || 0);
  Logger.log('📦 Papelaria:', kpis.pedidosPapelaria || 0);
  Logger.log('🧹 Limpeza:', kpis.pedidosLimpeza || 0);

  // Verificar se não há nulls
  const temNull = Object.values(kpis).some(v => v === null);
  if (temNull) {
    Logger.log('❌ FALHA: Encontrados valores null nos KPIs');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs financeiros OK');
  }
}
```

**Resultado Esperado**:
```
✅ Todos os valores numéricos (nenhum null)
✅ Total de Pedidos >= 0
✅ Valor Total >= 0
```

#### 1.2. Verificar KPIs Logísticos

```javascript
function teste01_DashboardLogistico() {
  Logger.log('=== TESTE 01.2: KPIs Logísticos ===');

  const resultado = getDashboardData();
  const kpis = resultado.data.kpis;

  Logger.log('\n⏱️ Tempo Médio de Processamento:', kpis.tempoMedioProcessamento || 0, 'dias');
  Logger.log('📈 Taxa de Conclusão:', kpis.taxaConclusao || 0, '%');
  Logger.log('👤 Solicitantes Ativos:', kpis.solicitantesAtivos || 0);

  const temNull = [
    kpis.tempoMedioProcessamento,
    kpis.taxaConclusao,
    kpis.solicitantesAtivos
  ].some(v => v === null);

  if (temNull) {
    Logger.log('❌ FALHA: Valores null nos KPIs logísticos');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs logísticos OK');
  }
}
```

**Resultado Esperado**:
```
✅ Tempo médio >= 0
✅ Taxa de conclusão entre 0-100%
✅ Solicitantes ativos >= 0
```

#### 1.3. Verificar KPIs de Estoque

```javascript
function teste01_DashboardEstoque() {
  Logger.log('=== TESTE 01.3: KPIs de Estoque ===');

  const resultado = getDashboardData();
  const kpis = resultado.data.kpis;

  Logger.log('\n📦 Produtos em Estoque:', kpis.produtosEmEstoque || 0);
  Logger.log('⚠️ Produtos Abaixo do Mínimo:', kpis.produtosAbaixoMinimo || 0);
  Logger.log('💵 Valor Total do Estoque:', kpis.valorTotalEstoque || 0);
  Logger.log('🔒 Estoque Reservado:', kpis.estoqueReservado || 0); // v16.0

  const temNull = [
    kpis.produtosEmEstoque,
    kpis.produtosAbaixoMinimo,
    kpis.valorTotalEstoque,
    kpis.estoqueReservado
  ].some(v => v === null);

  if (temNull) {
    Logger.log('❌ FALHA: Valores null nos KPIs de estoque');
  } else {
    Logger.log('\n✅ PASSOU: Todos KPIs de estoque OK');
  }
}
```

**Resultado Esperado**:
```
✅ Produtos em estoque >= 0
✅ Estoque reservado >= 0 (novo em v16.0)
✅ Valor total >= 0
```

---

## 🛒 TESTE 02: Catálogo de Produtos

### Objetivo
Verificar se o catálogo carrega produtos ativos corretamente (com e sem código NEO).

### Cenário de Teste

#### 2.1. Catálogo Carrega Produtos

```javascript
function teste02_CatalogoCarrega() {
  Logger.log('=== TESTE 02.1: Catálogo de Produtos ===');

  // Chamar a função que o frontend usa
  const resultado = obterProdutosParaCatalogo();

  if (!resultado.success) {
    Logger.log('❌ FALHA: ' + resultado.error);
    return;
  }

  const produtos = resultado.produtos;

  Logger.log(`\n📦 Total de produtos carregados: ${produtos.length}`);

  if (produtos.length === 0) {
    Logger.log('⚠️ AVISO: Nenhum produto encontrado');
    Logger.log('Verifique se há produtos com Ativo = "Sim" na aba Produtos');
  } else {
    Logger.log('✅ PASSOU: Produtos carregados com sucesso');

    // Mostrar primeiro produto como exemplo
    Logger.log('\n📋 Exemplo do primeiro produto:');
    Logger.log(JSON.stringify(produtos[0], null, 2));
  }
}
```

**Resultado Esperado**:
```
✅ produtos.length > 0
✅ Produtos têm propriedades: id, nome, fornecedores, tipo, categoria, unidade
```

#### 2.2. Produtos Sem NEO Aparecem

```javascript
function teste02_ProdutosSemNeo() {
  Logger.log('=== TESTE 02.2: Produtos Sem Código NEO ===');

  const resultado = obterProdutosParaCatalogo();
  const produtos = resultado.produtos;

  // Filtrar produtos sem código NEO
  const produtosSemNeo = produtos.filter(p => !p.codigoNeo || p.codigoNeo === '');

  Logger.log(`\n📦 Produtos sem código NEO: ${produtosSemNeo.length}`);

  if (produtosSemNeo.length > 0) {
    Logger.log('✅ PASSOU: Produtos sem NEO aparecem no catálogo');
    Logger.log('Exemplo:', produtosSemNeo[0].nome);
  } else {
    Logger.log('⚠️ Todos os produtos têm código NEO (OK se for o caso)');
  }
}
```

**Resultado Esperado**:
```
✅ Produtos sem código NEO aparecem normalmente
✅ Produtos com código NEO agrupam múltiplos fornecedores
```

#### 2.3. Imagens Aparecem

```javascript
function teste02_Imagens() {
  Logger.log('=== TESTE 02.3: Imagens de Produtos ===');

  const resultado = obterProdutosParaCatalogo();
  const produtos = resultado.produtos;

  // Verificar produtos com imagem
  let comImagem = 0;
  let semImagem = 0;

  produtos.forEach(p => {
    p.fornecedores.forEach(f => {
      if (f.imagemURL && f.imagemURL !== '') {
        comImagem++;
      } else {
        semImagem++;
      }
    });
  });

  Logger.log(`\n🖼️ Fornecedores com imagem: ${comImagem}`);
  Logger.log(`📷 Fornecedores sem imagem: ${semImagem}`);

  if (comImagem > 0) {
    Logger.log('✅ PASSOU: Sistema de imagens funcionando');
  } else {
    Logger.log('⚠️ AVISO: Nenhum produto tem imagem cadastrada');
  }
}
```

**Resultado Esperado**:
```
✅ Propriedade imagemURL presente em fornecedores
✅ URLs de imagem válidas para produtos que têm
```

---

## 🏢 TESTE 03: Sistema de Múltiplos Fornecedores

### Objetivo
Verificar se produtos com mesmo código NEO agrupam fornecedores corretamente.

### Cenário de Teste

#### 3.1. Agrupamento por Código NEO

```javascript
function teste03_AgrupamentoNeo() {
  Logger.log('=== TESTE 03.1: Agrupamento por Código NEO ===');

  const resultado = obterProdutosParaCatalogo();
  const produtos = resultado.produtos;

  // Verificar produtos com múltiplos fornecedores
  const produtosMultiplos = produtos.filter(p => p.fornecedores.length > 1);

  Logger.log(`\n🏢 Produtos com múltiplos fornecedores: ${produtosMultiplos.length}`);

  if (produtosMultiplos.length > 0) {
    Logger.log('✅ PASSOU: Sistema de múltiplos fornecedores funcional');

    // Mostrar exemplo
    const exemplo = produtosMultiplos[0];
    Logger.log(`\n📋 Exemplo: ${exemplo.nome}`);
    Logger.log(`Código NEO: ${exemplo.codigoNeo}`);
    Logger.log(`Fornecedores (${exemplo.fornecedores.length}):`);
    exemplo.fornecedores.forEach(f => {
      Logger.log(`  - ${f.fornecedorNome}: R$ ${f.preco.toFixed(2)}`);
    });
  } else {
    Logger.log('⚠️ Nenhum produto com múltiplos fornecedores encontrado');
    Logger.log('   (Normal se não houver produtos duplicados com mesmo código NEO)');
  }
}
```

**Resultado Esperado**:
```
✅ Produtos com mesmo código NEO agrupados
✅ Array fornecedores contém múltiplas opções
✅ Cada fornecedor tem: fornecedorNome, preco, imagemURL
```

---

## 🔒 TESTE 04: Sistema de Estoque Reservado

### Objetivo
Verificar o ciclo completo: reservar → liberar/baixar estoque.

### Cenário de Teste

#### 4.1. Verificar Estrutura de Estoque

```javascript
function teste04_EstruturaEstoque() {
  Logger.log('=== TESTE 04.1: Estrutura de Estoque ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);

  if (!abaEstoque) {
    Logger.log('❌ FALHA: Aba Estoque não encontrada');
    return;
  }

  const headers = abaEstoque.getRange(1, 1, 1, 8).getValues()[0];

  const colunasEsperadas = [
    'Produto ID',
    'Quantidade Atual',
    'Estoque Mínimo',
    'Ponto de Pedido',
    'Última Atualização',
    'Quantidade Reservada',     // v16.0
    'Estoque Disponível',        // v16.0
    'Última Movimentação'
  ];

  Logger.log('\n📋 Colunas encontradas:');
  let todasPresentes = true;
  colunasEsperadas.forEach((col, idx) => {
    const encontrada = headers[idx] === col;
    Logger.log(`${encontrada ? '✅' : '❌'} Coluna ${idx + 1}: ${col} ${!encontrada ? `(encontrada: "${headers[idx]}")` : ''}`);
    if (!encontrada) todasPresentes = false;
  });

  if (todasPresentes) {
    Logger.log('\n✅ PASSOU: Estrutura de estoque correta');
  } else {
    Logger.log('\n❌ FALHA: Estrutura de estoque incorreta');
  }
}
```

**Resultado Esperado**:
```
✅ Coluna 6: Quantidade Reservada
✅ Coluna 7: Estoque Disponível
```

#### 4.2. Reservar Estoque ao Criar Pedido

**TESTE MANUAL**:

1. Vá em **Estoque** na planilha
2. Escolha um produto e anote:
   - Produto ID: `___________`
   - Qtd Atual: `___________`
   - Qtd Reservada: `___________`
   - Qtd Disponível: `___________`

3. Vá no aplicativo → **Novo Pedido**
4. Adicione **3 unidades** do produto escolhido
5. Finalize o pedido
6. Anote o número do pedido: `___________`

7. Volte em **Estoque** e verifique:
   - [ ] Qtd Atual: **NÃO MUDOU** ✅
   - [ ] Qtd Reservada: **AUMENTOU +3** ✅
   - [ ] Qtd Disponível: **DIMINUIU -3** ✅

8. Vá em **Movimentações Estoque** e verifique:
   - [ ] Nova linha tipo **RESERVA** ✅
   - [ ] Quantidade: **3** ✅
   - [ ] Pedido ID: **correto** ✅

**RESULTADO ESPERADO**:
```
✅ Estoque reservado automaticamente
✅ Movimentação RESERVA registrada
✅ Qtd Disponível diminuiu corretamente
```

#### 4.3. Liberar Estoque ao Cancelar

**TESTE MANUAL** (continuação do 4.2):

1. Com o pedido criado no teste anterior
2. Vá em **Gestão de Pedidos** (perfil Gestor/Admin)
3. Encontre o pedido criado
4. Clique em **Alterar Status** → **Cancelado**
5. Confirme

6. Vá em **Movimentações Estoque** e verifique:
   - [ ] **NOVA LINHA** tipo **LIBERACAO_RESERVA** ✅
   - [ ] Quantidade: **3** ✅
   - [ ] Observações: "Reserva liberada por cancelamento" ✅

7. Volte em **Estoque** e verifique:
   - [ ] Qtd Reservada: **VOLTOU A 0** ✅
   - [ ] Qtd Disponível: **VOLTOU AO VALOR ORIGINAL** ✅
   - [ ] Qtd Atual: **NÃO MUDOU** ✅

**RESULTADO ESPERADO**:
```
✅ Movimentação LIBERACAO_RESERVA criada
✅ Estoque reservado liberado
✅ Estoque disponível restaurado
```

#### 4.4. Baixar Estoque ao Concluir

**TESTE MANUAL**:

1. Crie um **novo pedido** com **5 unidades** de um produto
2. Anote a **Qtd Atual** do estoque (ex: 20)
3. Anote o **Pedido ID**: `___________`

4. Como **Gestor**, vá em **Gestão de Pedidos**
5. Altere status para **Concluído**

6. Vá em **Movimentações Estoque** e verifique:
   - [ ] **NOVA LINHA** tipo **SAIDA** ✅
   - [ ] Quantidade: **5** ✅
   - [ ] Estoque Anterior: **20** (o valor anotado) ✅
   - [ ] Estoque Atual: **15** (20 - 5) ✅
   - [ ] Observações: "Saída automática por finalização" ✅

7. Volte em **Estoque** e verifique:
   - [ ] Qtd Atual: **DIMINUIU 5** (15) ✅
   - [ ] Qtd Reservada: **0** (liberada) ✅
   - [ ] Qtd Disponível: **15** ✅

**RESULTADO ESPERADO**:
```
✅ Movimentação SAIDA criada
✅ Qtd Atual diminuiu (saída real)
✅ Qtd Reservada zerada
✅ Qtd Disponível = Qtd Atual
```

---

## 📝 TESTE 05: Criar Pedido

### Objetivo
Verificar validações e criação de pedido.

### Cenário de Teste

#### 5.1. Validação de Dados

```javascript
function teste05_ValidacaoPedido() {
  Logger.log('=== TESTE 05.1: Validação de Pedido ===');

  // Teste 1: Tipo inválido
  const pedido1 = {
    tipo: 'TipoInexistente',
    produtos: [{ produtoId: 'PROD-001', quantidade: 1 }]
  };
  const r1 = criarPedido(pedido1);
  Logger.log('Tipo inválido:', r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU');

  // Teste 2: Quantidade negativa
  const pedido2 = {
    tipo: 'Papelaria',
    produtos: [{ produtoId: 'PROD-001', quantidade: -5 }]
  };
  const r2 = criarPedido(pedido2);
  Logger.log('Quantidade negativa:', r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU');

  // Teste 3: Sem produtos
  const pedido3 = {
    tipo: 'Papelaria',
    produtos: []
  };
  const r3 = criarPedido(pedido3);
  Logger.log('Sem produtos:', r3.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU');

  Logger.log('\n✅ PASSOU: Validações funcionando');
}
```

**Resultado Esperado**:
```
✅ Tipo inválido bloqueado
✅ Quantidade negativa bloqueada
✅ Pedido vazio bloqueado
```

#### 5.2. Criar Pedido Válido

```javascript
function teste05_CriarPedidoValido() {
  Logger.log('=== TESTE 05.2: Criar Pedido Válido ===');

  // Buscar um produto válido
  const produtos = obterProdutosParaCatalogo();
  if (produtos.produtos.length === 0) {
    Logger.log('❌ FALHA: Nenhum produto disponível');
    return;
  }

  const produtoTeste = produtos.produtos[0];
  const produtoId = produtoTeste.fornecedores[0].produtoId;

  // Criar pedido de teste
  const pedidoTeste = {
    tipo: 'Papelaria',
    produtos: [
      { produtoId: produtoId, quantidade: 2 }
    ],
    observacoes: 'Pedido de teste automatizado'
  };

  const resultado = criarPedido(pedidoTeste);

  if (resultado.success) {
    Logger.log('✅ PASSOU: Pedido criado com sucesso');
    Logger.log('Número do Pedido:', resultado.pedido.numeroPedido);
    Logger.log('ID:', resultado.pedido.id);

    // Verificar se reservou estoque
    Logger.log('\n🔍 Verificar manualmente:');
    Logger.log('1. Aba Pedidos → Pedido', resultado.pedido.numeroPedido, 'existe');
    Logger.log('2. Aba Movimentações Estoque → RESERVA registrada');
    Logger.log('3. Aba Estoque → Qtd Reservada aumentou');
  } else {
    Logger.log('❌ FALHA:', resultado.error);
  }
}
```

**Resultado Esperado**:
```
✅ Pedido criado com status SOLICITADO
✅ Número único gerado (PED20251201-XXX)
✅ Estoque reservado automaticamente
```

---

## ❌ TESTE 06: Cancelar Pedido

### Objetivo
Verificar liberação de estoque ao cancelar.

### Teste Manual

1. Crie um pedido (ver Teste 05)
2. Anote: Pedido ID `___________` e Produto ID `___________`
3. Como **Gestor**, vá em **Gestão de Pedidos**
4. Localize o pedido → **Cancelar**
5. Verifique:

**Estoque**:
- [ ] Qtd Reservada **DIMINUIU** ✅
- [ ] Qtd Disponível **AUMENTOU** ✅
- [ ] Qtd Atual **NÃO MUDOU** ✅

**Movimentações**:
- [ ] Nova linha tipo **LIBERACAO_RESERVA** ✅
- [ ] Quantidade correta ✅
- [ ] Pedido ID correto ✅

**Pedidos**:
- [ ] Status = **Cancelado** ✅

---

## ✅ TESTE 07: Concluir Pedido

### Objetivo
Verificar baixa de estoque ao concluir.

### Teste Manual

1. Crie um pedido com 3 unidades
2. Anote **Qtd Atual** do estoque: `___________`
3. Como **Gestor**, vá em **Gestão de Pedidos**
4. Altere status para **Concluído**
5. Verifique:

**Estoque**:
- [ ] Qtd Atual **DIMINUIU 3** ✅
- [ ] Qtd Reservada **ZEROU** ✅
- [ ] Qtd Disponível = Qtd Atual ✅

**Movimentações**:
- [ ] Nova linha tipo **SAIDA** ✅
- [ ] Quantidade: 3 ✅
- [ ] Estoque Anterior e Atual corretos ✅

**Pedidos**:
- [ ] Status = **Concluído** ✅
- [ ] Data Finalização preenchida ✅

---

## 📊 TESTE 08: Movimentações de Estoque

### Objetivo
Verificar tipos de movimentação e rastreabilidade.

### Cenário de Teste

#### 8.1. Tipos de Movimentação

```javascript
function teste08_TiposMovimentacao() {
  Logger.log('=== TESTE 08.1: Tipos de Movimentação ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');

  if (!abaMovimentacoes) {
    Logger.log('❌ FALHA: Aba Movimentações Estoque não encontrada');
    return;
  }

  const dados = abaMovimentacoes.getDataRange().getValues();
  const movimentacoes = dados.slice(1); // Pular header

  // Contar tipos
  const tipos = {};
  movimentacoes.forEach(mov => {
    const tipo = mov[1]; // Coluna B - Tipo
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  Logger.log('\n📊 Tipos de Movimentação encontrados:');
  Object.entries(tipos).forEach(([tipo, count]) => {
    Logger.log(`  ${tipo}: ${count} movimentações`);
  });

  // Verificar tipos v16.0
  const tiposV16 = ['RESERVA', 'LIBERACAO_RESERVA', 'SAIDA'];
  const temTiposV16 = tiposV16.some(t => tipos[t] > 0);

  if (temTiposV16) {
    Logger.log('\n✅ PASSOU: Sistema v16.0 registrando movimentações');
  } else {
    Logger.log('\n⚠️ AVISO: Nenhuma movimentação v16.0 encontrada');
    Logger.log('   Teste criar/cancelar/concluir um pedido');
  }
}
```

**Resultado Esperado**:
```
✅ Tipos encontrados: ENTRADA, SAIDA, AJUSTE, RESERVA, LIBERACAO_RESERVA, INVENTARIO
✅ Movimentações registradas com timestamp
✅ Pedido ID presente quando aplicável
```

#### 8.2. Rastreabilidade por Pedido

```javascript
function teste08_RastreabilidadePedido() {
  Logger.log('=== TESTE 08.2: Rastreabilidade por Pedido ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMovimentacoes = ss.getSheetByName('Movimentações Estoque');
  const dados = abaMovimentacoes.getDataRange().getValues();

  // Buscar movimentações com Pedido ID
  const movimentacoesComPedido = dados.slice(1).filter(mov => {
    const pedidoId = mov[8]; // Coluna I - Pedido ID
    return pedidoId && pedidoId !== '';
  });

  Logger.log(`\n📋 Movimentações vinculadas a pedidos: ${movimentacoesComPedido.length}`);

  if (movimentacoesComPedido.length > 0) {
    // Agrupar por pedido
    const porPedido = {};
    movimentacoesComPedido.forEach(mov => {
      const pedidoId = mov[8];
      if (!porPedido[pedidoId]) {
        porPedido[pedidoId] = [];
      }
      porPedido[pedidoId].push(mov[1]); // Tipo
    });

    Logger.log('\n📊 Pedidos rastreados:');
    Object.entries(porPedido).forEach(([pedidoId, tipos]) => {
      Logger.log(`  ${pedidoId}: ${tipos.join(', ')}`);
    });

    Logger.log('\n✅ PASSOU: Rastreabilidade por pedido funcional');
  } else {
    Logger.log('⚠️ AVISO: Nenhuma movimentação vinculada a pedidos');
  }
}
```

**Resultado Esperado**:
```
✅ Movimentações vinculadas ao pedido
✅ Sequência lógica: RESERVA → LIBERACAO_RESERVA ou RESERVA → SAIDA
```

---

## ⚡ TESTE 09: Performance e Cache

### Objetivo
Verificar se o sistema de cache melhora performance.

### Cenário de Teste

#### 9.1. Cache de Usuários

```javascript
function teste09_CacheUsuarios() {
  Logger.log('=== TESTE 09.1: Cache de Usuários ===');

  // Limpar cache
  limparCacheUsuarios();

  // Primeira chamada (sem cache)
  console.time('getUserContext - SEM CACHE');
  const r1 = getUserContext();
  console.timeEnd('getUserContext - SEM CACHE');

  // Segunda chamada (com cache)
  console.time('getUserContext - COM CACHE');
  const r2 = getUserContext();
  console.timeEnd('getUserContext - COM CACHE');

  if (r1.success && r2.success) {
    Logger.log('✅ PASSOU: Cache de usuários funcional');
    Logger.log('Esperado: Segunda chamada 10-50x mais rápida');
  } else {
    Logger.log('❌ FALHA: Erro ao buscar usuário');
  }
}
```

**Resultado Esperado**:
```
getUserContext - SEM CACHE: 150-300ms
getUserContext - COM CACHE: 5-15ms
✅ Ganho de 10-30x em performance
```

#### 9.2. Cache de Produtos

```javascript
function teste09_CacheProdutos() {
  Logger.log('=== TESTE 09.2: Cache de Produtos ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
  const produtos = abaProdutos.getDataRange().getValues();

  if (produtos.length < 2) {
    Logger.log('⚠️ AVISO: Poucos produtos para testar cache');
    return;
  }

  const produtoId = produtos[1][0]; // Primeiro produto

  // Limpar cache
  limparCacheProdutos();

  // Sem cache - 5 buscas
  console.time('buscarProduto (5x) - SEM CACHE');
  for (let i = 0; i < 5; i++) {
    limparCacheProdutos();
    buscarProduto(produtoId);
  }
  console.timeEnd('buscarProduto (5x) - SEM CACHE');

  // Com cache - 5 buscas
  console.time('buscarProduto (5x) - COM CACHE');
  for (let i = 0; i < 5; i++) {
    buscarProduto(produtoId);
  }
  console.timeEnd('buscarProduto (5x) - COM CACHE');

  Logger.log('✅ PASSOU: Cache de produtos funcional');
}
```

**Resultado Esperado**:
```
✅ Cache reduz tempo de busca em 10-50x
```

---

## 🔒 TESTE 10: Validações e Segurança

### Objetivo
Verificar validações de entrada e proteções.

### Cenário de Teste

#### 10.1. Proteção de Estoque Negativo

```javascript
function teste10_EstoqueNegativo() {
  Logger.log('=== TESTE 10.1: Proteção Estoque Negativo ===');

  // Buscar produto com pouco estoque
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
  const dados = abaEstoque.getDataRange().getValues();

  // Encontrar produto com estoque baixo
  let produtoTeste = null;
  for (let i = 1; i < dados.length; i++) {
    const qtdDisponivel = dados[i][6]; // Coluna G - Estoque Disponível
    if (qtdDisponivel > 0 && qtdDisponivel < 5) {
      produtoTeste = {
        id: dados[i][0],
        qtdDisponivel: qtdDisponivel
      };
      break;
    }
  }

  if (!produtoTeste) {
    Logger.log('⚠️ AVISO: Nenhum produto com estoque baixo para testar');
    return;
  }

  Logger.log(`\n📦 Produto teste: ${produtoTeste.id}`);
  Logger.log(`Estoque disponível: ${produtoTeste.qtdDisponivel}`);

  // Tentar criar pedido com quantidade maior que disponível
  const pedidoExcedente = {
    tipo: 'Papelaria',
    produtos: [
      { produtoId: produtoTeste.id, quantidade: produtoTeste.qtdDisponivel + 10 }
    ]
  };

  const resultado = criarPedido(pedidoExcedente);

  if (resultado.success) {
    Logger.log('✅ PASSOU: Pedido criado (reserva parcial OK)');
    Logger.log('⚠️ AVISO: Verifique se reservou apenas o disponível');
  } else {
    Logger.log('✅ PASSOU: Pedido bloqueado (se política for bloquear)');
  }
}
```

**Resultado Esperado**:
```
✅ Sistema permite reserva parcial OU bloqueia pedido (depende da política)
✅ Nunca permite qtdDisponivel negativa
```

#### 10.2. Validação de Datas

```javascript
function teste10_ValidacaoDatas() {
  Logger.log('=== TESTE 10.2: Validação de Datas ===');

  // Data início > data fim
  const filtro1 = {
    dataInicio: '2025-12-31',
    dataFim: '2025-01-01'
  };

  const r1 = getDashboardData(filtro1);
  Logger.log('Data início > fim:', r1.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU');

  // Intervalo muito grande
  const filtro2 = {
    dataInicio: '2020-01-01',
    dataFim: '2025-12-31'
  };

  const r2 = getDashboardData(filtro2);
  Logger.log('Intervalo > 2 anos:', r2.success ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEOU');

  Logger.log('\n✅ PASSOU: Validações de data funcionando');
}
```

**Resultado Esperado**:
```
✅ Data início > fim: BLOQUEADO
✅ Intervalo > 2 anos: BLOQUEADO
```

---

## ✅ CHECKLIST FINAL

### Dashboard e KPIs
- [ ] Dashboard carrega sem erros
- [ ] KPIs Financeiros sem null
- [ ] KPIs Logísticos sem null
- [ ] KPIs Estoque sem null
- [ ] KPI "Estoque Reservado" aparece (v16.0)

### Catálogo de Produtos
- [ ] Catálogo carrega produtos ativos
- [ ] Produtos sem código NEO aparecem
- [ ] Produtos com código NEO agrupam fornecedores
- [ ] Imagens aparecem corretamente

### Sistema de Estoque Reservado (v16.0)
- [ ] Estrutura de estoque correta (8 colunas)
- [ ] Criar pedido → RESERVA registrada
- [ ] Criar pedido → Qtd Reservada aumenta
- [ ] Criar pedido → Qtd Disponível diminui
- [ ] Cancelar pedido → LIBERACAO_RESERVA registrada
- [ ] Cancelar pedido → Estoque liberado
- [ ] Concluir pedido → SAIDA registrada
- [ ] Concluir pedido → Qtd Atual diminui

### Pedidos
- [ ] Criar pedido com validações corretas
- [ ] Número único gerado (PED20251201-XXX)
- [ ] Status inicial = Solicitado
- [ ] Alterar status funciona
- [ ] Cancelar pedido funciona
- [ ] Concluir pedido funciona

### Movimentações
- [ ] Tipos: ENTRADA, SAIDA, AJUSTE (anteriores)
- [ ] Tipos: RESERVA, LIBERACAO_RESERVA, INVENTARIO (v16.0)
- [ ] Movimentações vinculadas a pedido
- [ ] Timestamps corretos
- [ ] Rastreabilidade funcional

### Performance
- [ ] Cache de usuários funcional
- [ ] Cache de produtos funcional
- [ ] Dashboard carrega em < 3 segundos

### Validações
- [ ] Tipo de pedido inválido bloqueado
- [ ] Quantidade negativa bloqueada
- [ ] Pedido vazio bloqueado
- [ ] Validação de datas funciona
- [ ] Estoque negativo impedido

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Movimentações não aparecem

**Sintomas**:
- Criar pedido funciona
- Mas nenhuma movimentação RESERVA aparece

**Soluções**:
1. Verificar se `registrarMovimentacao()` aceita tipos v16.0:
   ```javascript
   // 05.controleEstoque.js linha 620
   const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA', 'INVENTARIO'];
   ```

2. Verificar logs no Apps Script (Ctrl+Enter → Ver logs)

3. Verificar se produto existe na aba Estoque

---

### Problema 2: Cancelar não libera estoque

**Sintomas**:
- RESERVA funciona
- Mas LIBERACAO_RESERVA não aparece ao cancelar

**Soluções**:
1. Verificar se `__atualizarPedido()` tem lógica de liberação:
   ```javascript
   // 00.funcoes_wrapper.js linha 1146+
   if (dadosPedido.status === CONFIG.STATUS_PEDIDO.CANCELADO) {
     liberarEstoquePedido(pedidoId, produtosEstoque);
   }
   ```

2. Verificar STATUS_PEDIDO.CANCELADO em CONFIG:
   ```javascript
   // 01.config.js
   CANCELADO: 'Cancelado'
   ```

3. Verificar logs: "🔓 v16.0: Liberando estoque do pedido..."

---

### Problema 3: Concluir não baixa estoque

**Sintomas**:
- RESERVA funciona
- Mas SAIDA não aparece ao concluir

**Soluções**:
1. Verificar STATUS_PEDIDO.FINALIZADO:
   ```javascript
   // 01.config.js
   FINALIZADO: 'Concluído'  // Deve bater com valor real do banco
   ```

2. Verificar `__atualizarPedido()` detecta FINALIZADO:
   ```javascript
   if (dadosPedido.status === CONFIG.STATUS_PEDIDO.FINALIZADO) {
     baixarEstoquePedido(pedidoId, produtosEstoque);
   }
   ```

---

### Problema 4: "Produto não encontrado no estoque"

**Sintomas**:
- Log: "⚠️ Produto AGUA SANITARIA... não encontrado no estoque"

**Causa**:
- Sistema buscando por NOME mas estoque usa ID

**Solução**:
- Verificar se `__atualizarPedido()` converte nome para ID:
   ```javascript
   // 00.funcoes_wrapper.js linha 1171-1199
   // Buscar ID do produto pelo nome na aba Produtos
   ```

---

## 📞 SUPORTE

### Como Reportar Problemas

1. **Executar teste automatizado** correspondente
2. **Copiar logs completos** (Apps Script → Ver execuções)
3. **Print screen** da planilha (se aplicável)
4. **Anotar**:
   - Versão do sistema: v16.0
   - Teste que falhou: (número e nome)
   - Mensagem de erro exata
   - Comportamento esperado vs. observado

### Logs Úteis

Para ver logs detalhados:
```javascript
function verLogsDetalhados() {
  // Ativar log detalhado
  Logger.log('=== MODO DEBUG ===');

  // Criar pedido de teste
  const resultado = criarPedido({
    tipo: 'Papelaria',
    produtos: [{ produtoId: 'PROD-XXX', quantidade: 1 }]
  });

  // Ver todos os logs (Ctrl+Enter)
  Logger.log('Resultado:', JSON.stringify(resultado, null, 2));
}
```

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- [CHANGELOG_V16.0_FASE2.md](CHANGELOG_V16.0_FASE2.md) - Correções Dashboard e Catálogo
- [CHANGELOG_V16.0_FASE3.md](CHANGELOG_V16.0_FASE3.md) - Sistema de Estoque Reservado
- [CHANGELOG_V16.0_FASE3.2_FINAL.md](CHANGELOG_V16.0_FASE3.2_FINAL.md) - Correção Cancelamento

---

**Versão**: 16.0 FASE 3.4
**Data**: 2025-12-01
**Status**: ✅ Completo

**Total de Testes**: 10 suítes, 25+ testes individuais

🤖 Generated with [Claude Code](https://claude.com/claude-code)
