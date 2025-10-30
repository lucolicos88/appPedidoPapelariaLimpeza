# 🔍 Instruções para Identificar o Problema

## Passo 1: Fazer Upload do Arquivo de Teste

1. Abra o Google Apps Script (Extensões > Apps Script)
2. Clique em **+** (adicionar arquivo)
3. Copie o conteúdo de `99.teste_debug.js`
4. Cole no novo arquivo
5. Salve

## Passo 2: Executar os Testes

1. No Google Apps Script, selecione a função `executarTodosOsTestes`
2. Clique em **Executar** (▶️)
3. Aguarde alguns segundos
4. Clique em **Visualizar** > **Logs** (ou Ctrl+Enter)

## Passo 3: Analisar os Resultados

### Se TODOS os testes passarem ✅

**O PROBLEMA ESTÁ NO FRONTEND!**

Isso significa que:
- O backend (Google Apps Script) está funcionando
- As funções retornam dados corretamente
- O problema está no arquivo `Index.html`

**SOLUÇÃO:**
O `Index.html` pode não estar atualizado no deployment. Você precisa:
1. Re-implantar o Web App
2. Atualizar a versão do deployment

### Se ALGUM teste falhar ❌

**O PROBLEMA ESTÁ NO BACKEND!**

Verifique qual teste falhou e veja a mensagem de erro nos logs.

Problemas comuns:
- **CONFIG não definido:** `01.setup.js` não foi carregado primeiro
- **Função retorna null:** Erro de sintaxe no arquivo
- **Erro de permissão:** Usuário não tem acesso à planilha

## Passo 4: Verificar Deployment do Web App

### Problema Comum: Index.html Desatualizado

O Google Apps Script pode estar servindo uma versão antiga do `Index.html`.

**SOLUÇÃO:**

1. No Apps Script, clique em **Implantar** > **Gerenciar implantações**
2. Clique nos três pontos (**⋮**) da implantação ativa
3. Clique em **Editar**
4. Em **Versão**, selecione **Nova versão**
5. Adicione uma descrição: "v6.0.1 - Correção de erros"
6. Clique em **Implantar**
7. **IMPORTANTE:** Copie a nova URL do Web App
8. Abra a nova URL em uma aba anônima (Ctrl+Shift+N)
9. Teste novamente

### Por que fazer nova implantação?

Quando você altera arquivos no Apps Script, o Web App continua servindo a versão antiga até você criar uma nova implantação.

## Passo 5: Verificar Console do Navegador

Depois de fazer nova implantação:

1. Abra o sistema na nova URL
2. Pressione F12 (DevTools)
3. Vá para aba **Console**
4. Recarregue a página (F5)
5. Procure por:
   - ✅ "Sistema inicializado com sucesso"
   - ❌ "Resposta vazia" (não deve aparecer mais)

## Diagnóstico Rápido

Execute este teste primeiro:

```javascript
function testeSimples() {
  Logger.log('✅ Apps Script funcionando!');
  return 'OK';
}
```

Se ver "OK", o Apps Script está rodando corretamente.

## Checklist de Verificação

- [ ] Arquivo `99.teste_debug.js` foi carregado no Apps Script
- [ ] Executei `executarTodosOsTestes()`
- [ ] Vi os logs (Ctrl+Enter)
- [ ] Todos os testes passaram OU identifiquei qual falhou
- [ ] Fiz nova implantação do Web App (se necessário)
- [ ] Abri a nova URL em aba anônima
- [ ] Verifiquei o Console do navegador (F12)

## Se Nada Funcionar

Me envie:
1. Screenshot dos logs do `executarTodosOsTestes()`
2. Screenshot do Console do navegador (F12)
3. URL do Web App que você está acessando

Com essas informações, posso identificar o problema exato!

---

**Próximo Passo:** Execute `executarTodosOsTestes()` no Apps Script e me diga o resultado!
