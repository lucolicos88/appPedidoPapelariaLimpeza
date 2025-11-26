# 📋 RELEASE v15.0 - Múltiplos Fornecedores por Produto

## 🎯 Resumo

Versão que implementa suporte a **múltiplos fornecedores por produto** usando a estrutura atual (sem criação de novas tabelas).

---

## ✨ Principais Funcionalidades

### 1. **Modal Editar Produto Redesenhado**

O modal foi completamente reformulado com 3 seções distintas:

#### 📦 SEÇÃO 1: Dados do Fornecedor (Original)
- Código Fornecedor (da NF)
- Descrição Fornecedor (da NF)
- Seleção do Fornecedor

#### 🏢 SEÇÃO 2: Dados Neoformula (Padronizado)
- **Código NEO** com autocomplete
- **Descrição NEO** com autocomplete
- Dica visual: Ambos devem ser preenchidos para produto aparecer em Pedidos/Estoque

#### 📋 SEÇÃO 3: Dados Gerais
- Tipo (Papelaria/Limpeza)
- Categoria
- Unidade
- Preço Unitário
- Estoque Mínimo
- Ponto de Pedido
- Imagem

### 2. **Sistema de Autocomplete**

Ao editar um produto, o usuário pode:

- **Clicar no campo "Código NEO"**: Aparece lista de códigos já cadastrados
- **Digitar no campo**: Lista filtra em tempo real
- **Selecionar da lista**: Preenche automaticamente código e descrição
- **Criar novo**: Basta digitar um código/descrição que não existe

O mesmo funciona para "Descrição NEO".

### 3. **Agrupamento por Código NEO**

Produtos com mesmo `CODIGO_NEOFORMULA` são considerados o mesmo produto de fornecedores diferentes:

**Exemplo**:
```
Linha 1: ID=001 | CodForn=11708794 | CodNeo=PAP-001 | Fornec=ABC | Preço=5,59
Linha 2: ID=002 | CodForn=98765    | CodNeo=PAP-001 | Fornec=XYZ | Preço=6,20
Linha 3: ID=003 | CodForn=A4500    | CodNeo=PAP-001 | Fornec=QWE | Preço=5,85
```

Todas as 3 linhas representam "Papel A4 500 folhas (PAP-001)" mas de fornecedores diferentes.

---

## 🔧 Alterações Técnicas

### Backend (Google Apps Script)

#### Arquivo: `03.gerenciamentoProdutos.js` (linhas 792-1055)

**Novas Funções**:

1. **`listarCodigosNeoUnicos()`** (linhas 792-841)
   - Retorna lista de códigos NEO únicos já cadastrados
   - Formato: `[{ codigo: "PAP-001", descricao: "Papel A4" }, ...]`

2. **`listarDescricoesNeoUnicas()`** (linhas 844-897)
   - Retorna lista de descrições NEO únicas já cadastradas
   - Formato: `[{ descricao: "Papel A4", codigo: "PAP-001" }, ...]`

3. **`listarProdutosAgrupadosPorNeo()`** (linhas 900-972)
   - Agrupa produtos pelo código NEO
   - Cada grupo contém array de fornecedores
   - Formato:
   ```javascript
   [{
     codigoNeo: "PAP-001",
     descricaoNeo: "Papel A4",
     tipo: "Papelaria",
     fornecedores: [
       { id, fornecedorId, fornecedorNome, precoUnitario, ... },
       { id, fornecedorId, fornecedorNome, precoUnitario, ... }
     ]
   }]
   ```

4. **`listarProdutosCompletos()`** (linhas 975-1055)
   - Lista apenas produtos com cadastro completo
   - Critérios: `CODIGO_NEOFORMULA` e `DESCRICAO_NEOFORMULA` preenchidos

### Frontend (HTML/JavaScript)

#### Arquivo: `Index.html`

**Modal HTML** (linhas 2033-2177):
- Redesenhado com 3 seções visuais
- Campos separados: dados fornecedor vs dados NEO
- Divs para autocomplete (`listaCodigosNeo`, `listaDescricoesNeo`)

**Variáveis Globais** (linhas 5189-5192):
```javascript
let codigosNeoDisponiveis = [];
let descricoesNeoDisponiveis = [];
let fornecedoresDisponiveis = [];
```

**Função `abrirModalEditarProduto()`** (linhas 5197-5249):
- Carrega produto + listas de autocomplete em paralelo usando `Promise.all()`
- 4 chamadas simultâneas ao backend

**Função `preencherFormEditarProduto()`** (linhas 5254-5302):
- Atualizada para novos campos
- Preenche select de fornecedores dinamicamente

**Função `submitEditarProduto()`** (linhas 5307-5350):
- Atualizada para enviar novos campos: `codigoNeoformula`, `descricaoNeoformula`, `fornecedorId`

**Funções de Autocomplete** (linhas 5375-5481):
- `mostrarListaCodigosNeo()` / `mostrarListaDescricoesNeo()`
- `filtrarCodigosNeo()` / `filtrarDescricoesNeo()`
- `selecionarCodigoNeo()` / `selecionarDescricaoNeo()`
- `ocultarListaCodigosNeo()` / `ocultarListaDescricoesNeo()`

---

## 📊 Regras de Negócio

### Produto com Cadastro Completo

Um produto é considerado **completo** quando:
```
CODIGO_NEOFORMULA !== '' AND
DESCRICAO_NEOFORMULA !== '' AND
ATIVO === 'Sim'
```

Apenas produtos completos aparecem em:
- Catálogo de Pedidos
- Controle de Estoque

### Agrupamento de Produtos

Produtos são agrupados por `CODIGO_NEOFORMULA`:
- Mesmo código NEO = Mesmo produto
- Diferentes linhas = Diferentes fornecedores
- Cada fornecedor pode ter preço diferente

---

## 🧪 Como Testar

### Teste 1: Autocomplete de Código NEO

1. Abra a aba "Produtos"
2. Clique em "Editar" em qualquer produto
3. Clique no campo "Código NEO"
4. **Esperado**: Aparece dropdown com códigos já cadastrados
5. Digite algo (ex: "PAP")
6. **Esperado**: Lista filtra mostrando apenas códigos com "PAP"
7. Clique em um código da lista
8. **Esperado**: Preenche código e descrição automaticamente

### Teste 2: Autocomplete de Descrição NEO

1. No mesmo modal, clique no campo "Descrição NEO"
2. **Esperado**: Aparece dropdown com descrições já cadastradas
3. Digite algo (ex: "Papel")
4. **Esperado**: Lista filtra mostrando apenas descrições com "Papel"
5. Clique em uma descrição da lista
6. **Esperado**: Preenche descrição e código automaticamente

### Teste 3: Criar Novo Código NEO

1. No modal, digite um código NEO que não existe (ex: "PAP-999")
2. Digite uma descrição NEO nova (ex: "Papel Especial A3")
3. Preencha outros campos
4. Salve
5. **Esperado**: Produto salvo com novo código NEO
6. Abra outro produto
7. **Esperado**: "PAP-999" aparece no autocomplete

### Teste 4: Múltiplos Fornecedores

1. Crie produto 1: CodNeo=PAP-001, Fornecedor=ABC, Preço=5,59
2. Crie produto 2: CodNeo=PAP-001, Fornecedor=XYZ, Preço=6,20
3. Liste produtos agrupados (backend)
4. **Esperado**: PAP-001 aparece com 2 fornecedores

---

## ✅ Checklist de Validação

- [x] Modal abre com 3 seções visuais distintas
- [x] Autocomplete de Código NEO funciona
- [x] Autocomplete de Descrição NEO funciona
- [x] Seleção da lista preenche ambos os campos
- [x] Posso criar novos códigos/descrições NEO
- [x] Select de fornecedores carrega dinamicamente
- [x] Produto salva com dados NEO
- [x] Backend tem função `listarCodigosNeoUnicos()`
- [x] Backend tem função `listarDescricoesNeoUnicas()`
- [x] Backend tem função `listarProdutosAgrupadosPorNeo()`
- [x] Backend tem função `listarProdutosCompletos()`

---

## 🚀 Próximos Passos (Pendentes)

### Fase 3: Implementar Agrupamento em Pedidos
- Agrupar produtos por código NEO no catálogo
- Exibir múltiplos fornecedores por produto
- Destacar melhor preço
- Permitir escolher fornecedor

### Fase 4: Filtrar Produtos Completos
- Pedidos: Mostrar apenas produtos completos
- Estoque: Mostrar apenas produtos completos

### Fase 5: Atualizar Relatórios
- Relatório agrupado por código NEO
- Exibir todos os fornecedores
- Mostrar faixa de preços (min/max)

---

## 📝 Notas de Migração

**IMPORTANTE**: Nenhuma migração necessária!

Esta versão **não altera a estrutura** da planilha. Produtos existentes continuam funcionando normalmente.

Para ativar múltiplos fornecedores:
1. Edite produtos que são iguais de fornecedores diferentes
2. Preencha o mesmo código e descrição NEO em ambos
3. Pronto! Eles estão agrupados

---

## 🐛 Problemas Conhecidos

Nenhum identificado até o momento.

---

## 📦 Arquivos Modificados

### Backend
- `03.gerenciamentoProdutos.js` (linhas 792-1055) - Novas funções de autocomplete e agrupamento

### Frontend
- `Index.html`:
  - Linhas 2033-2177: Modal HTML redesenhado
  - Linhas 5189-5192: Variáveis globais
  - Linhas 5197-5249: Função `abrirModalEditarProduto()` atualizada
  - Linhas 5254-5302: Função `preencherFormEditarProduto()` atualizada
  - Linhas 5307-5350: Função `submitEditarProduto()` atualizada
  - Linhas 5375-5481: Funções de autocomplete

---

## ✨ Conclusão

A versão **v15.0** implementa com sucesso:
- ✅ Modal redesenhado com 3 seções
- ✅ Autocomplete de Código e Descrição NEO
- ✅ Backend para agrupamento de produtos
- ✅ Suporte a múltiplos fornecedores (estrutura atual)

**Próximo passo**: Implementar agrupamento no catálogo de Pedidos! 🚀
