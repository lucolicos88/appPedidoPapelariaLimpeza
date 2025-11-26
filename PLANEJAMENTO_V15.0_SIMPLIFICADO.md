# 📋 PLANEJAMENTO v15.0 - VERSÃO SIMPLIFICADA
## Múltiplos Fornecedores por Produto (Usando Estrutura Atual!)

## 🎯 Descoberta Importante

A **estrutura atual JÁ SUPORTA** múltiplos fornecedores!

**Como?** Código Neoformula agrupa produtos de diferentes fornecedores.

---

## 📊 Modelo de Dados (SEM MUDANÇAS!)

### Conceito:
```
1 Produto Neoformula = N linhas na planilha (uma por fornecedor)
```

### Exemplo Real:
```
Papel A4 (PAP-001) vendido por 3 fornecedores:

Linha 1: ID=001 | CodForn=11708794 | FornID=ABC | CodNeo=PAP-001 | Preço=5,59
Linha 2: ID=002 | CodForn=98765    | FornID=XYZ | CodNeo=PAP-001 | Preço=6,20
Linha 3: ID=003 | CodForn=A4500    | FornID=QWE | CodNeo=PAP-001 | Preço=5,85
```

**Agrupamento**: Todas têm `CODIGO_NEOFORMULA = PAP-001`

---

## 🔧 Mudanças Necessárias

### 1. Modal "Editar Produto" ⚡ PRIORIDADE 1

**Layout Atual**:
```
┌────────────────────────────┐
│ Código: [11708794       ]  │
│ Nome: [BL ADES...       ]  │
│ Tipo: [Papelaria ▼]       │
└────────────────────────────┘
```

**Novo Layout**:
```
┌─────────────────────────────────────────┐
│ 📦 DADOS DO FORNECEDOR                  │
│ ┌─────────────────────────────────┐    │
│ │ Cód. Fornecedor: [11708794   ]  │    │
│ │ Desc. Fornecedor:               │    │
│ │ [BL ADES 38X50 AMARELO...    ]  │    │
│ │ Fornecedor: [Dist. ABC ▼]      │    │
│ └─────────────────────────────────┘    │
│                                         │
│ 🏢 DADOS NEOFORMULA (Padronizado)       │
│ ┌─────────────────────────────────┐    │
│ │ Cód. NEO: [Buscar... ▼]         │    │
│ │           [PAP-001    ] ou      │    │
│ │           [📝 Novo Código]      │    │
│ │                                  │    │
│ │ Desc. NEO: [Buscar... ▼]        │    │
│ │            [Papel A4 500fls  ]  │    │
│ │            [📝 Nova Descrição]  │    │
│ └─────────────────────────────────┘    │
│                                         │
│ 📋 OUTROS DADOS                         │
│ ┌─────────────────────────────────┐    │
│ │ Tipo: [Papelaria ▼]             │    │
│ │ Preço: [R$ 5,59]                │    │
│ └─────────────────────────────────┘    │
│                                         │
│ [Cancelar]         [Salvar Produto]    │
└─────────────────────────────────────────┘
```

#### Funcionalidades:

1. **Autocomplete Código NEO**:
   ```javascript
   // Ao clicar no campo, lista códigos únicos já cadastrados:
   PAP-001 - Papel A4 500 folhas
   PAP-002 - Papel A4 Colorido
   LIM-001 - Detergente
   [📝 Criar Novo Código]
   ```

2. **Autocomplete Descrição NEO**:
   ```javascript
   // Ao clicar no campo, lista descrições únicas:
   Papel A4 500 folhas
   Papel A4 Colorido
   Detergente Líquido
   [📝 Criar Nova Descrição]
   ```

3. **Vinculação Automática**:
   - Se selecionar código existente → preenche descrição
   - Se selecionar descrição existente → preenche código
   - Se criar novo → permite editar ambos

---

### 2. Função: Listar Códigos NEO Únicos

```javascript
/**
 * Retorna lista de códigos Neoformula já cadastrados
 */
function listarCodigosNeoUnicos() {
  const produtos = listarProdutos({});
  const codigos = new Set();

  produtos.forEach(p => {
    if (p.codigoNeoformula) {
      codigos.add({
        codigo: p.codigoNeoformula,
        descricao: p.descricaoNeoformula
      });
    }
  });

  return Array.from(codigos);
}
```

---

### 3. Função: Listar Produtos Agrupados por NEO

```javascript
/**
 * Agrupa produtos por código Neoformula
 * Retorna: { codigoNeo: [fornecedor1, fornecedor2, ...] }
 */
function listarProdutosAgrupadosPorNeo() {
  const produtos = listarProdutos({});
  const agrupados = {};

  produtos.forEach(p => {
    const codigo = p.codigoNeoformula || p.id;

    if (!agrupados[codigo]) {
      agrupados[codigo] = {
        codigoNeo: p.codigoNeoformula,
        descricaoNeo: p.descricaoNeoformula,
        tipo: p.tipo,
        fornecedores: []
      };
    }

    agrupados[codigo].fornecedores.push({
      id: p.id,
      fornecedorId: p.fornecedorId,
      fornecedorNome: buscarNomeFornecedor(p.fornecedorId),
      codigoFornecedor: p.codigoFornecedor,
      precoUnitario: p.precoUnitario,
      ativo: p.ativo
    });
  });

  return agrupados;
}
```

---

### 4. Filtro: Apenas Produtos Completos

```javascript
/**
 * Lista apenas produtos com cadastro completo
 */
function listarProdutosCompletos() {
  return listarProdutos({
    codigoNeoPreenchido: true,
    descricaoNeoPreenchida: true,
    ativo: 'Sim'
  });
}
```

---

### 5. Catálogo de Pedidos - Agrupado

**Antes (v14)**: Lista todas as linhas
```
BL ADES 38X50 - Dist. ABC - R$ 5,59
PAPEL A4 500 - Forn. XYZ - R$ 6,20
A4 AMARELO - Forn. QWE - R$ 5,85
```

**Depois (v15)**: Agrupa por produto NEO
```
┌─────────────────────────────────────┐
│ Papel A4 500 folhas (PAP-001)       │
│ ┌─────────────────────────────────┐ │
│ │ Dist. ABC    - R$ 5,59 [Melhor]│ │ ⭐
│ │ Forn. XYZ    - R$ 6,20         │ │
│ │ Forn. QWE    - R$ 5,85         │ │
│ └─────────────────────────────────┘ │
│ Quantidade: [___] [Adicionar]       │
└─────────────────────────────────────┘
```

---

## 📋 Tarefas de Implementação

### Fase 1: Backend (1-2h)
- [ ] Criar `listarCodigosNeoUnicos()`
- [ ] Criar `listarDescricoesNeoUnicas()`
- [ ] Criar `listarProdutosAgrupadosPorNeo()`
- [ ] Modificar `listarProdutos()` para aceitar filtro de cadastro completo

### Fase 2: Modal Editar Produto (2-3h)
- [ ] Adicionar campo autocomplete "Código NEO"
- [ ] Adicionar campo autocomplete "Descrição NEO"
- [ ] Implementar lógica de vinculação automática
- [ ] Permitir criar novo código/descrição

### Fase 3: Catálogo de Pedidos (2-3h)
- [ ] Agrupar produtos por código NEO
- [ ] Exibir múltiplos fornecedores por produto
- [ ] Destacar melhor preço
- [ ] Permitir escolher fornecedor ao adicionar ao pedido

### Fase 4: Filtros (1h)
- [ ] Filtrar produtos completos em Pedidos
- [ ] Filtrar produtos completos em Estoque
- [ ] Adicionar indicador visual de cadastro completo

### Fase 5: Relatórios (1-2h)
- [ ] Relatório de produtos agrupado por NEO
- [ ] Mostrar todos os fornecedores
- [ ] Exibir faixa de preços (min/max)

**Total: 7-11 horas** (muito mais rápido que 15h!)

---

## 🎯 Regras de Negócio

### Produto Completo = Aparece em Pedidos/Estoque
```
CODIGO_NEOFORMULA !== null AND
CODIGO_NEOFORMULA !== '' AND
DESCRICAO_NEOFORMULA !== null AND
DESCRICAO_NEOFORMULA !== '' AND
ATIVO === 'Sim'
```

### Agrupamento
```
Produtos são agrupados por CODIGO_NEOFORMULA
```

### Preço no Pedido
```
Usuário escolhe o fornecedor OU
Sistema usa o menor preço
```

---

## ✅ Vantagens desta Abordagem

1. **Sem mudança estrutural** ✅
2. **Compatível com NF existente** ✅
3. **Migração zero** ✅
4. **Implementação rápida** ✅
5. **Funciona com dados atuais** ✅

---

## 🚀 Próximo Passo

Você aprova esta abordagem simplificada?

Se sim, começamos pelo **Modal Editar Produto** com autocomplete! 🎉
