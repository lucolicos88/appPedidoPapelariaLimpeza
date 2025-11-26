# 📋 PLANEJAMENTO v15.0 - Múltiplos Fornecedores por Produto

## 🎯 Objetivo

Implementar relacionamento **N:N** entre Produtos e Fornecedores, permitindo que um mesmo produto tenha múltiplos fornecedores com preços diferentes.

---

## 📊 Mudanças Estruturais

### 1. Nova Aba: **Produto_Fornecedor**

Tabela de relacionamento entre produtos e fornecedores:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| A - ID | UUID | ID único do relacionamento |
| B - PRODUTO_ID | UUID | FK para Produtos |
| C - PRODUTO_CODIGO_NEO | String | Código Neoformula (denormalizado para busca) |
| D - PRODUTO_NOME_NEO | String | Nome Neoformula (denormalizado para exibição) |
| E - FORNECEDOR_ID | UUID | FK para Fornecedores |
| F - FORNECEDOR_NOME | String | Nome Fornecedor (denormalizado) |
| G - PRECO_UNITARIO | Number | Preço específico deste fornecedor |
| H - CODIGO_FORNECEDOR | String | Código que o fornecedor usa para este produto |
| I - PREFERENCIAL | Boolean | Se é o fornecedor preferencial (Sim/Não) |
| J - ATIVO | Boolean | Se este relacionamento está ativo |
| K - DATA_CADASTRO | Date | Data de cadastro |
| L - ULTIMA_COMPRA | Date | Data da última compra deste fornecedor |
| M - OBSERVACOES | String | Observações específicas |

### 2. Alteração na Aba **Produtos**

**Manter estrutura atual** mas adicionar:
- Coluna S: `TEM_FORNECEDORES` (Sim/Não) - calculado automaticamente
- Coluna T: `CADASTRO_COMPLETO` (Sim/Não) - tem código NEO + descrição NEO + fornecedores

**Regra de Cadastro Completo**:
```
CADASTRO_COMPLETO =
  CODIGO_NEOFORMULA preenchido AND
  DESCRICAO_NEOFORMULA preenchida AND
  TEM_FORNECEDORES = 'Sim'
```

---

## 🔄 Fluxo de Dados

### Cenário 1: Cadastro Manual de Produto
1. Usuário cria produto com dados Neoformula
2. Sistema marca `CADASTRO_COMPLETO = 'Não'` (ainda sem fornecedores)
3. Usuário adiciona fornecedores (um ou mais)
4. Sistema atualiza `CADASTRO_COMPLETO = 'Sim'`

### Cenário 2: Importação de NF
1. Sistema lê XML da NF
2. Tenta encontrar produto pelo código do fornecedor
3. **Se encontrar**: Adiciona/atualiza preço na tabela Produto_Fornecedor
4. **Se não encontrar**: Cria produto "incompleto" (sem dados NEO)

### Cenário 3: Completar Cadastro de Produto Importado
1. Usuário edita produto importado
2. Preenche código e descrição Neoformula
3. Sistema:
   - Busca se já existe produto com mesmo código NEO
   - Se sim: Mescla (move fornecedor para produto existente)
   - Se não: Marca como completo

---

## 🖥️ Mudanças na Interface

### Modal "Editar Produto" - NOVA VERSÃO

```
┌─────────────────────────────────────────────┐
│  ✏️ Editar Produto                          │
├─────────────────────────────────────────────┤
│                                             │
│  📦 DADOS DO FORNECEDOR (Original)          │
│  ┌─────────────────────────────────────┐   │
│  │ Código Fornecedor: [11708794      ] │   │
│  │ Descrição Fornecedor:               │   │
│  │ [BL ADES 38X50 AMARELO C/4 10157] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🏢 DADOS NEOFORMULA (Padronizado)          │
│  ┌─────────────────────────────────────┐   │
│  │ Código NEO: [Buscar... ▼]           │   │
│  │             [PAP-001    ]            │   │
│  │                                      │   │
│  │ Descrição NEO: [Lista suspensa ▼]   │   │
│  │                [Papel A4 500fls   ]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📋 DADOS GERAIS                            │
│  ┌─────────────────────────────────────┐   │
│  │ Tipo: [Papelaria ▼]                 │   │
│  │ Categoria: [Papel        ]          │   │
│  │ Unidade: [PT ▼]                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💰 FORNECEDORES E PREÇOS                   │
│  ┌─────────────────────────────────────┐   │
│  │ Fornecedor        Preço    Ações    │   │
│  │ ──────────────────────────────────  │   │
│  │ ⭐ Dist. ABC    R$ 5,59    🗑️ ✏️    │   │
│  │   Fornec. XYZ   R$ 6,20    🗑️ ✏️    │   │
│  │                                      │   │
│  │ [+ Adicionar Fornecedor]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancelar]              [Salvar Produto]  │
└─────────────────────────────────────────────┘
```

#### Funcionalidades:

1. **Autocomplete de Código NEO**:
   - Lista suspensa com códigos já cadastrados
   - Ao selecionar, preenche descrição automaticamente

2. **Autocomplete de Descrição NEO**:
   - Lista suspensa com descrições já cadastradas
   - Ao selecionar, preenche código automaticamente

3. **Seção de Fornecedores**:
   - Lista todos os fornecedores deste produto
   - ⭐ = Fornecedor preferencial
   - Botão para adicionar novo fornecedor
   - Cada linha tem: [Nome] [Preço] [Botões Editar/Excluir]

---

## 📝 Funções Backend Necessárias

### Arquivo: `14.produtoFornecedor.js` (NOVO)

```javascript
// CRUD completo para relacionamento
function adicionarFornecedorProduto(produtoId, fornecedorId, preco, preferencial)
function listarFornecedoresProduto(produtoId)
function atualizarPrecoFornecedor(relacionamentoId, novoPreco)
function removerFornecedorProduto(relacionamentoId)
function definirFornecedorPreferencial(produtoId, fornecedorId)

// Funções auxiliares
function buscarMelhorPreco(produtoId)
function buscarFornecedorPreferencial(produtoId)
function verificarProdutoTemFornecedores(produtoId)
```

### Modificações em `03.gerenciamentoProdutos.js`

```javascript
// Atualizar para verificar cadastro completo
function verificarCadastroCompleto(produtoId)
function listarProdutosCompletos() // Apenas produtos com dados NEO + fornecedores
function listarCodigosNeoExistentes() // Para autocomplete
function listarDescricoesNeoExistentes() // Para autocomplete
```

---

## 🔍 Regras de Negócio

### 1. Produto Aparece em Pedidos SE:
- ✅ `CODIGO_NEOFORMULA` preenchido
- ✅ `DESCRICAO_NEOFORMULA` preenchida
- ✅ Tem pelo menos 1 fornecedor ativo
- ✅ `ATIVO = 'Sim'`

### 2. Produto Aparece em Estoque SE:
- ✅ Mesmas regras acima
- ✅ Tem registro na aba Estoque

### 3. Preço no Pedido:
- Usa preço do **fornecedor preferencial**
- Se não houver preferencial, usa o **menor preço**

### 4. Importação de NF:
- Se produto já existe (por código fornecedor):
  - Atualiza/adiciona preço na tabela Produto_Fornecedor
  - Atualiza data última compra
- Se produto não existe:
  - Cria produto "incompleto"
  - Adiciona relacionamento com fornecedor

---

## 📊 Impacto nos Relatórios

### Relatório de Produtos

**Antes (v14)**:
```
ID | Código | Nome | Fornecedor | Preço
```

**Depois (v15)**:
```
ID | Código NEO | Nome NEO | Fornecedores | Preço Menor | Preço Maior
```

Opção de expandir e ver todos os fornecedores:
```
ID | Código NEO | Nome NEO | Fornecedor | Preço | Preferencial
001| PAP-001    | Papel A4 | Dist. ABC  | 5,59  | ⭐
   |            |          | Fornec XYZ | 6,20  |
```

---

## ⚠️ Considerações de Migração

### Dados Existentes

1. **Produtos atuais** (que têm FORNECEDOR_ID):
   - Migrar para tabela Produto_Fornecedor
   - Marcar como fornecedor preferencial
   - Manter preço atual

2. **Produtos sem fornecedor**:
   - Manter como estão
   - Marcar `CADASTRO_COMPLETO = 'Não'`

### Script de Migração (v15.0.0)

```javascript
function migrarFornecedoresExistentes() {
  // 1. Ler todos os produtos com FORNECEDOR_ID
  // 2. Para cada produto:
  //    - Criar registro em Produto_Fornecedor
  //    - Marcar como preferencial
  //    - Copiar preço
  // 3. Atualizar campo CADASTRO_COMPLETO
}
```

---

## 🎯 Fases de Implementação

### Fase 1: Infraestrutura (1-2 horas)
- ✅ Criar aba Produto_Fornecedor
- ✅ Atualizar CONFIG
- ✅ Criar arquivo 14.produtoFornecedor.js
- ✅ Funções CRUD básicas

### Fase 2: Backend (2-3 horas)
- ✅ Implementar todas as funções CRUD
- ✅ Modificar listarProdutos() para incluir fornecedores
- ✅ Criar funções de autocomplete
- ✅ Atualizar verificação de cadastro completo

### Fase 3: Interface (3-4 horas)
- ✅ Redesenhar modal Editar Produto
- ✅ Adicionar autocomplete de código/descrição NEO
- ✅ Criar seção de gerenciamento de fornecedores
- ✅ Implementar adicionar/editar/remover fornecedor

### Fase 4: Filtros (1-2 horas)
- ✅ Filtrar produtos em Pedidos (só completos)
- ✅ Filtrar produtos em Estoque (só completos)
- ✅ Atualizar cálculo de preços

### Fase 5: Relatórios (1-2 horas)
- ✅ Atualizar relatório de produtos
- ✅ Mostrar múltiplos fornecedores
- ✅ Exibir faixa de preços

### Fase 6: Migração e Testes (1-2 horas)
- ✅ Script de migração
- ✅ Testes completos
- ✅ Documentação

**Total Estimado**: 9-15 horas de desenvolvimento

---

## 📚 Documentação de Atualização

Criar:
- `GUIA_MIGRACAO_V15.md` - Como migrar dados existentes
- `MANUAL_MULTIPLOS_FORNECEDORES.md` - Como usar o novo sistema
- `API_PRODUTO_FORNECEDOR.md` - Documentação das funções

---

## ✅ Checklist de Aceite

Produto considerado **PRONTO** quando:

- [ ] Posso editar produto e ver lista de códigos NEO existentes
- [ ] Posso editar produto e ver lista de descrições NEO existentes
- [ ] Posso adicionar múltiplos fornecedores para um produto
- [ ] Posso definir fornecedor preferencial
- [ ] Posso definir preço diferente por fornecedor
- [ ] Pedidos mostram apenas produtos com cadastro completo
- [ ] Estoque mostra apenas produtos com cadastro completo
- [ ] Relatório de produtos mostra todos os fornecedores
- [ ] Importação de NF atualiza preço do fornecedor correto
- [ ] Dados antigos foram migrados corretamente

---

## 🚀 Aprovação

Você concorda com este planejamento? Alguma alteração antes de começar a implementação?

Se sim, começarei pela **Fase 1: Infraestrutura** criando a nova aba e configurações! 🎉
