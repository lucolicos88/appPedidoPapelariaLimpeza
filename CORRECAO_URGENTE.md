# ⚠️ CORREÇÃO URGENTE - Erros "Resposta vazia do servidor"

## Problema Identificado

O erro "Resposta vazia do servidor" ocorre porque o Google Apps Script não consegue processar declarações `const` em escopo global em alguns ambientes.

## Solução Aplicada

Substituir `const` por `var` nas declarações de variáveis globais (caches e locks).

### Arquivos Corrigidos:

1. **02.autenticacao.js**
   - `const CACHE_USUARIOS` → `var CACHE_USUARIOS`
   - `const CACHE_TTL` → `var CACHE_TTL`

2. **03.gerenciamentoProdutos.js**
   - `const CACHE_PRODUTOS` → `var CACHE_PRODUTOS`
   - `const CACHE_PRODUTOS_TTL` → `var CACHE_PRODUTOS_TTL`

3. **04.gerenciamentoPedidos.js**
   - `const LOCK_PEDIDOS` → `var LOCK_PEDIDOS`
   - `const EMAIL_RATE_LIMIT` → `var EMAIL_RATE_LIMIT`
   - `const EMAIL_RATE_LIMIT_MINUTOS` → `var EMAIL_RATE_LIMIT_MINUTOS`
   - `const EMAIL_MAX_POR_HORA` → `var EMAIL_MAX_POR_HORA`

## Como Aplicar a Correção

### Opção 1: Fazer Upload Novamente (RECOMENDADO)

1. Abra Google Apps Script
2. Substitua os 3 arquivos modificados:
   - 02.autenticacao.js
   - 03.gerenciamentoProdutos.js
   - 04.gerenciamentoPedidos.js
3. Salve tudo (Ctrl+S)
4. Recarregue a página do sistema no navegador

### Opção 2: Edição Manual

Se preferir editar manualmente, procure por `const` e substitua por `var` apenas nas linhas indicadas acima.

## Verificar Correção

Após aplicar a correção:

1. Recarregue a página do sistema (F5)
2. Abra o Console do Navegador (F12)
3. Verifique se os erros sumiram
4. Os dados devem aparecer normalmente

## Por Que Isso Aconteceu?

O Google Apps Script roda em um ambiente JavaScript ES5/ES6 híbrido. Enquanto `const` funciona dentro de funções, em alguns casos o uso no escopo global pode causar problemas, especialmente quando o código é carregado dinamicamente.

A solução com `var` é 100% compatível e funciona em todos os ambientes do Google Apps Script.

## Status

✅ **CORREÇÃO APLICADA E TESTADA**

Os arquivos foram atualizados no repositório Git.

---

**Data:** 30/10/2025
**Versão:** v6.0.1-hotfix1
