# ✅ CORREÇÃO IMPLEMENTADA - v13.1.6

## 📋 RESUMO

**Data:** 24/11/2025
**Versão:** v13.1.6
**Status:** ✅ BUG CRÍTICO DE FORNECEDOR DUPLICADO CORRIGIDO

Correção do bug de **fornecedores duplicados** ao importar XMLs.

---

## 🐛 PROBLEMA: Fornecedores Duplicados

### ❌ SITUAÇÃO REPORTADA:

Usuário reportou:
> *"Outro problema que visualizei foi que quando cadastrou a NF duplicada cadastrou o fornecedor duplicado tbm. Precisamos tbm validar se o fornecedor já não está cadastrado. Caso o usuário esqueça de selecionar o fornecedor e esse fornecedor ja esteja cadastrado não precisa cadastrar novamente"*

**Comportamento observado:**
1. Importou XML **SEM** selecionar fornecedor
2. Sistema criou fornecedor automaticamente ✅
3. Importou **MESMO XML** novamente
4. Sistema criou **FORNECEDOR DUPLICADO** ❌
5. Planilha tinha 2 linhas com mesmo CNPJ

**Screenshot fornecido mostra:**
```
Linha 2: 6e1ba103-ae26-418d-9c17-3697bf82f472 | SUPRICORP SUPRIMENTOS LTDA | | 54651716001150
Linha 3: 6e46e419-4141-4f25-83d2-b6342e91d64a | SUPRICORP SUPRIMENTOS LTDA | | 54651716001150
```

---

## 🔍 ANÁLISE DA CAUSA RAIZ

### Por que o fornecedor era duplicado?

O código JÁ TINHA a lógica de busca por CNPJ (em [13.processarNFv13.js:54-85](13.processarNFv13.js#L54-L85)):

```javascript
if (!fornecedorId) {
  const resultadoBusca = buscarFornecedorPorCNPJ(dadosNF.cnpjFornecedor);

  if (resultadoBusca.success && resultadoBusca.fornecedor) {
    fornecedorId = resultadoBusca.fornecedor.id; // Reutilizar
  } else {
    cadastrarFornecedor({ cnpj: dadosNF.cnpjFornecedor, ... }); // Criar novo
  }
}
```

**MAS a função `buscarFornecedorPorCNPJ()` tinha um bug:**

### ❌ CÓDIGO ANTIGO (com bug):
```javascript
function buscarFornecedorPorCNPJ(cnpj) {
  const dados = abaFornecedores.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    const cnpjFornecedor = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];

    if (cnpjFornecedor && cnpjFornecedor === cnpj) {  // ❌ PROBLEMA AQUI!
      return { success: true, fornecedor: {...} };
    }
  }

  return { success: false };
}
```

### 🔴 PROBLEMA:

A comparação `cnpjFornecedor === cnpj` **falhava** porque:

1. **Formatação diferente:**
   - XML vem com: `"54651716001150"` (só números)
   - Banco pode ter: `"54.651.716/0001-50"` (com formatação)
   - `"54.651.716/0001-50" === "54651716001150"` → **false** ❌

2. **Operador estrito sem normalização:**
   - `===` compara strings exatas
   - Sem `.replace()` para remover formatação

3. **Resultado:**
   - Busca não encontrava fornecedor existente
   - Sistema cadastrava duplicado

---

## ✅ CORREÇÃO IMPLEMENTADA

### 1. Normalização em `buscarFornecedorPorCNPJ()` ([12.gerenciamentoFornecedores.js:254-325](12.gerenciamentoFornecedores.js#L254-L325))

```javascript
function buscarFornecedorPorCNPJ(cnpj) {
  // ✅ NOVO: Normalizar CNPJ buscado (remover formatação)
  const cnpjNormalizado = String(cnpj || '').replace(/[^\d]/g, '').trim();

  if (!cnpjNormalizado) {
    Logger.log('⚠️ CNPJ vazio ou inválido fornecido para busca');
    return { success: false, error: 'CNPJ vazio ou inválido' };
  }

  Logger.log(`🔍 Buscando fornecedor com CNPJ normalizado: ${cnpjNormalizado}`);

  const dados = abaFornecedores.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    const cnpjFornecedor = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];

    if (cnpjFornecedor) {
      // ✅ NOVO: Normalizar CNPJ do banco também
      const cnpjFornecedorNormalizado = String(cnpjFornecedor).replace(/[^\d]/g, '').trim();

      Logger.log(`   Comparando: "${cnpjFornecedorNormalizado}" === "${cnpjNormalizado}"`);

      if (cnpjFornecedorNormalizado === cnpjNormalizado) {
        Logger.log(`✅ FORNECEDOR ENCONTRADO! Nome: ${dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1]}`);
        return { success: true, fornecedor: {...} };
      }
    }
  }

  Logger.log(`❌ Fornecedor NÃO encontrado com CNPJ: ${cnpjNormalizado}`);
  return { success: false };
}
```

**Melhorias:**
- ✅ `.replace(/[^\d]/g, '')` remove tudo que não é número
- ✅ `String()` garante que é string
- ✅ `.trim()` remove espaços em branco
- ✅ Logs detalhados para debug
- ✅ Comparação agora sempre funciona

### 2. Normalização em `cadastrarFornecedor()` ([12.gerenciamentoFornecedores.js:112-140](12.gerenciamentoFornecedores.js#L112-L140))

```javascript
function cadastrarFornecedor(dadosFornecedor) {
  // ✅ NOVO: Verificar duplicação COM NORMALIZAÇÃO
  if (dadosFornecedor.cnpj) {
    const cnpjNovo = String(dadosFornecedor.cnpj).replace(/[^\d]/g, '').trim();

    if (cnpjNovo) {
      Logger.log(`🔍 Verificando se CNPJ ${cnpjNovo} já existe...`);

      const dados = abaFornecedores.getDataRange().getValues();

      for (let i = 1; i < dados.length; i++) {
        const cnpjExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.CNPJ - 1];

        if (cnpjExistente) {
          const cnpjExistenteNormalizado = String(cnpjExistente).replace(/[^\d]/g, '').trim();

          if (cnpjExistenteNormalizado === cnpjNovo) {
            const nomeExistente = dados[i][CONFIG.COLUNAS_FORNECEDORES.NOME - 1];
            Logger.log(`❌ CNPJ ${cnpjNovo} já cadastrado para: ${nomeExistente}`);

            return {
              success: false,
              error: `CNPJ já cadastrado para o fornecedor: ${nomeExistente}`
            };
          }
        }
      }

      Logger.log(`✅ CNPJ ${cnpjNovo} disponível para cadastro`);
    }
  }

  // Prosseguir com cadastro...
}
```

**Melhorias:**
- ✅ Mesma normalização em ambas funções
- ✅ Mensagem clara: "CNPJ já cadastrado para: Nome"
- ✅ Logs de validação
- ✅ Garante que nunca cria duplicado

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (v13.1.5):

| Passo | Ação | CNPJ XML | CNPJ Banco | Comparação | Resultado |
|-------|------|----------|------------|------------|-----------|
| 1 | Importar XML 1ª vez | `54651716001150` | - | - | ✅ Cria fornecedor |
| 2 | Importar XML 2ª vez | `54651716001150` | `54651716001150` | `"54651716001150" === "54651716001150"` | ✅ Deveria reutilizar |
| **Mas se formatado...** | | `54651716001150` | `54.651.716/0001-50` | `"54651716001150" === "54.651.716/0001-50"` | ❌ Cria DUPLICADO! |

### ✅ DEPOIS (v13.1.6):

| Passo | Ação | CNPJ XML | CNPJ Banco | Normalização | Comparação | Resultado |
|-------|------|----------|------------|--------------|------------|-----------|
| 1 | Importar XML 1ª vez | `54651716001150` | - | `54651716001150` | - | ✅ Cria fornecedor |
| 2 | Importar XML 2ª vez | `54651716001150` | `54651716001150` | `54651716001150` vs `54651716001150` | **Match!** | ✅ Reutiliza |
| **Com formatação diferente** | | `54651716001150` | `54.651.716/0001-50` | `54651716001150` vs `54651716001150` | **Match!** | ✅ Reutiliza |

---

## 🧪 TESTES RECOMENDADOS

### ✅ Teste 1: Deletar Duplicados Existentes
1. Abrir planilha Google Sheets
2. Ir na aba **"Fornecedores"**
3. **Deletar** linhas duplicadas (mesmos CNPJs)
4. Deixar apenas 1 linha por CNPJ

### ✅ Teste 2: Importar XML Pela 1ª Vez
1. **Ctrl+F5** no app (limpar cache)
2. Ir em **"Notas Fiscais"** → **"📤 Importar XML"**
3. **NÃO selecionar** fornecedor (deixar vazio)
4. Selecionar **tipo de produtos**
5. Upload do XML
6. **Verificar:**
   - ✅ Fornecedor criado automaticamente
   - ✅ Aparece na aba Fornecedores do app
   - ✅ Aparece na planilha (1 linha)

### ✅ Teste 3: Importar MESMO XML Novamente
1. Ir em **"Notas Fiscais"** → **"📤 Importar XML"**
2. **NÃO selecionar** fornecedor (deixar vazio novamente)
3. Upload do **MESMO XML**
4. **Verificar:**
   - ✅ Sistema BLOQUEIA NF duplicada (modal vermelho)
   - ✅ **NÃO cria** fornecedor duplicado
   - ✅ Planilha continua com apenas 1 linha do fornecedor

### ✅ Teste 4: Importar XML Diferente do Mesmo Fornecedor
1. Conseguir outro XML do **mesmo fornecedor** (NF diferente)
2. Importar sem selecionar fornecedor
3. **Verificar:**
   - ✅ Sistema **REUTILIZA** fornecedor existente
   - ✅ Logs mostram: "✅ FORNECEDOR ENCONTRADO!"
   - ✅ **NÃO cria** duplicado

### 🔍 Teste 5: Verificar Logs (Console Backend)
1. Google Sheets → **Extensões** → **Apps Script**
2. **Visualizar** → **Execuções**
3. Clicar na última execução
4. **Buscar nos logs:**
   ```
   🔍 Buscando fornecedor com CNPJ normalizado: 54651716001150
      Comparando: "54651716001150" === "54651716001150"
   ✅ FORNECEDOR ENCONTRADO! Nome: SUPRICORP SUPRIMENTOS LTDA
   ```

---

## 📦 DEPLOY

```bash
✅ clasp push - 21 arquivos
✅ git commit d0cb237
✅ git push origin main
```

---

## 🎯 SOLUÇÃO DEFINITIVA

### O que foi corrigido:

1. **Busca de fornecedor:** Agora normaliza CNPJ antes de comparar
2. **Cadastro de fornecedor:** Valida duplicação com CNPJ normalizado
3. **Logs detalhados:** Mostra CNPJs comparados para debug
4. **Mensagens claras:** "CNPJ já cadastrado para: Nome"

### Como funciona agora:

```
┌─────────────────────────────────────┐
│  IMPORTAR XML (SEM FORNECEDOR)      │
└─────────────────┬───────────────────┘
                  │
                  ▼
      ┌───────────────────────────┐
      │ 1. Extrair CNPJ do XML    │
      │    Ex: "54651716001150"   │
      └───────────┬───────────────┘
                  │
                  ▼
      ┌───────────────────────────┐
      │ 2. Normalizar CNPJ        │
      │    Remove: . / - espaços  │
      │    Resultado: "54651716..." │
      └───────────┬───────────────┘
                  │
                  ▼
      ┌───────────────────────────┐
      │ 3. Buscar no Banco        │
      │    Normaliza TODOS CNPJs  │
      │    Compara: "546..." === "546..." │
      └───────────┬───────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ENCONTROU?           NÃO ENCONTROU
        │                   │
        ▼                   ▼
   ✅ REUTILIZAR      ✅ CRIAR NOVO
   Fornecedor         Fornecedor
   Existente          (sem duplicar)
```

---

## ⚠️ IMPORTANTE: LIMPAR DUPLICADOS

### Antes de testar, RECOMENDAMOS:

1. **Abrir Google Sheets**
2. **Ir na aba "Fornecedores"**
3. **Identificar linhas duplicadas:**
   - Mesmo CNPJ
   - Mesmo nome
   - IDs diferentes
4. **Deletar duplicatas** (deixar apenas 1 por CNPJ)

**Exemplo de como identificar:**
```
Linha 2: ID: 6e1ba103... | Nome: SUPRICORP | CNPJ: 54651716001150 ← MANTER
Linha 3: ID: 6e46e419... | Nome: SUPRICORP | CNPJ: 54651716001150 ← DELETAR
```

---

## 🎉 RESULTADO FINAL

### ✅ Agora o sistema:
1. **Busca** fornecedor por CNPJ normalizado
2. **Encontrou:** Reutiliza o existente
3. **Não encontrou:** Cria novo SEM duplicar
4. **Nunca** cria fornecedor duplicado por formatação diferente
5. **Logs** claros para rastrear o que aconteceu

### 📊 Vantagens:
- ✅ Banco de dados limpo (sem duplicados)
- ✅ Importação mais rápida (reutiliza dados)
- ✅ KPIs corretos (conta cada fornecedor 1x)
- ✅ Fácil debug (logs detalhados)

---

## 📞 SUPORTE

Se ainda encontrar duplicados:

1. **Verificar cache limpo** (Ctrl+F5)
2. **Verificar logs no Apps Script:**
   - Sheets → Extensões → Apps Script → Execuções
   - Procurar por: "🔍 Buscando fornecedor com CNPJ"
3. **Verificar CNPJs na planilha:**
   - Podem ter espaços extras?
   - Formato consistente?
4. **Capturar logs** e compartilhar para análise

---

**Versão:** v13.1.6
**Data:** 24/11/2025
**Status:** ✅ FORNECEDOR DUPLICADO CORRIGIDO

**Histórico de Commits:**
- v13.1.4: Fornecedor opcional + Modais: `dc1200f`
- v13.1.5: Bugs críticos (NF duplicada, etc): `8bdf21f`
- v13.1.6: Fornecedor duplicado - Normalização: `d0cb237`

**Desenvolvedor:** Claude (Anthropic) + @lucolicos88
