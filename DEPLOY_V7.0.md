# 🚀 DEPLOY VERSÃO 7.0 - INSTRUÇÕES COMPLETAS

## ✅ ARQUIVOS PARA UPLOAD

Você precisa fazer upload de **3 arquivos** no Google Apps Script:

### 1. **00.utils_serialization.js** (NOVO)
- Local: `c:\Users\Usuario\OneDrive\Documents\GitHub\appPedidoPapelariaLimpeza\00.utils_serialization.js`
- Tipo: Arquivo de script (.gs)
- Descrição: Utilitários para serialização de objetos Date

### 2. **00.funcoes_wrapper.js** (ATUALIZADO)
- Local: `c:\Users\Usuario\OneDrive\Documents\GitHub\appPedidoPapelariaLimpeza\00.funcoes_wrapper.js`
- Tipo: Arquivo de script (.gs)
- Descrição: 8 funções wrapper com serialização automática

### 3. **Index.html** (ATUALIZADO)
- Local: `c:\Users\Usuario\OneDrive\Documents\GitHub\appPedidoPapelariaLimpeza\Index.html`
- Tipo: Arquivo HTML
- Descrição: Frontend completo com v7.0 e 15 KPIs

---

## 📋 PASSO A PASSO DO DEPLOY

### **PASSO 1: Abrir o Google Apps Script**

1. Acesse: https://script.google.com
2. Abra o projeto "Sistema Neoformula"
3. Verifique se você está na planilha correta

### **PASSO 2: Upload do Arquivo NOVO**

#### 2.1 - Adicionar `00.utils_serialization.js`

1. No Apps Script, clique em **+** ao lado de "Arquivos"
2. Selecione **Script**
3. Nome do arquivo: `00.utils_serialization`
4. Abra o arquivo local `00.utils_serialization.js`
5. Copie TODO o conteúdo
6. Cole no Apps Script
7. Clique em **Salvar** (Ctrl+S)

### **PASSO 3: Atualizar Arquivos Existentes**

#### 3.1 - Atualizar `00.funcoes_wrapper.js`

1. No Apps Script, abra o arquivo `00.funcoes_wrapper`
2. **SELECIONE TODO O CONTEÚDO** (Ctrl+A)
3. Abra o arquivo local `00.funcoes_wrapper.js`
4. Copie TODO o conteúdo
5. Cole no Apps Script (substituindo tudo)
6. Clique em **Salvar** (Ctrl+S)

#### 3.2 - Atualizar `Index.html`

1. No Apps Script, abra o arquivo `Index`
2. **SELECIONE TODO O CONTEÚDO** (Ctrl+A)
3. Abra o arquivo local `Index.html`
4. Copie TODO o conteúdo
5. Cole no Apps Script (substituindo tudo)
6. Clique em **Salvar** (Ctrl+S)

### **PASSO 4: Verificar Arquivos**

Verifique se os 3 arquivos foram atualizados:

- [ ] `00.utils_serialization.js` - NOVO arquivo criado
- [ ] `00.funcoes_wrapper.js` - Deve ter 8 funções wrapper
- [ ] `Index.html` - Deve mostrar "v7.0" no título

### **PASSO 5: Criar Nova Versão**

1. Clique em **Implantar** (no canto superior direito)
2. Selecione **Gerenciar implantações**
3. Clique no ícone de **edição** (lápis) da implantação "App da Web" atual
4. Clique em **Nova versão**
5. Descrição da versão:
   ```
   v7.0 - Dashboard expandido (15 KPIs) + correções críticas de serialização Date
   ```
6. Clique em **Implantar**
7. Na janela de confirmação, clique em **Atualizar**

### **PASSO 6: Copiar URL de Produção**

1. Após o deploy, copie a **URL do aplicativo da Web** (termina com `/exec`)
2. Guarde essa URL - é a URL de produção da v7.0

---

## 🧪 TESTE DA VERSÃO 7.0

### **TESTE 1: Inicialização**

1. Abra a URL em uma **aba anônima** (Ctrl+Shift+N)
2. Faça login
3. Verifique no **console do navegador** (F12):
   ```
   ✅ Deve aparecer: "🚀 Iniciando Sistema Neoformula v7.0..."
   ✅ Deve aparecer: "✅ Sistema inicializado com sucesso"
   ```

### **TESTE 2: Dashboard (15 KPIs)**

1. Acesse a aba **Dashboard**
2. Verifique se os seguintes KPIs aparecem:

**KPIs Básicos:**
- [ ] Total de Pedidos
- [ ] Valor Total
- [ ] Ticket Médio

**KPIs de Status:**
- [ ] Solicitados
- [ ] Em Compra
- [ ] Finalizados
- [ ] Cancelados *(NOVO)*

**KPIs de Performance:**
- [ ] Taxa de Finalização (%) *(NOVO)*
- [ ] Taxa de Cancelamento (%) *(NOVO)*

**KPIs de Estoque:**
- [ ] Produtos Cadastrados
- [ ] Estoque Baixo
- [ ] Ponto de Pedido *(NOVO)*
- [ ] Valor Total Estoque *(NOVO)*

**KPIs por Tipo:**
- [ ] Papelaria (quantidade + valor) *(NOVO)*
- [ ] Limpeza (quantidade + valor) *(NOVO)*

### **TESTE 3: Gráficos**

1. Ainda no Dashboard, clique em **Atualizar** 3 vezes
2. Verifique:
   - [ ] Gráficos não dão erro
   - [ ] Gráficos atualizam corretamente
   - [ ] Console NÃO mostra "Canvas is already in use"

### **TESTE 4: Botão "Ver" em Pedidos**

1. Acesse a aba **Pedidos**
2. Clique em **Ver** em qualquer pedido
3. Verifique:
   - [ ] Modal abre corretamente
   - [ ] Detalhes do pedido aparecem
   - [ ] Console NÃO mostra erro de null

### **TESTE 5: Botão "Ver" em Produtos**

1. Acesse a aba **Produtos**
2. Clique em **Ver** em qualquer produto
3. Verifique:
   - [ ] Modal abre corretamente
   - [ ] Detalhes do produto aparecem
   - [ ] Imagem aparece (se houver)
   - [ ] Console NÃO mostra erro de null

### **TESTE 6: Aba Configurações**

1. Acesse a aba **Configurações** (se for admin)
2. Verifique:
   - [ ] Página carrega completamente
   - [ ] NÃO fica em loop infinito
   - [ ] Configurações aparecem
   - [ ] Console NÃO mostra erro de null

### **TESTE 7: Filtros**

1. Volte para o **Dashboard**
2. Aplique filtros de data
3. Clique em **Aplicar Filtros**
4. Verifique:
   - [ ] KPIs atualizam
   - [ ] Gráficos atualizam
   - [ ] Sem erros no console

---

## 🐛 TROUBLESHOOTING

### Problema: "Resposta vazia do servidor"

**Causa:** Arquivo `00.utils_serialization.js` não foi carregado ou está depois dos wrappers

**Solução:**
1. Verifique se `00.utils_serialization.js` existe no Apps Script
2. Se existir, verifique se está ANTES de `00.funcoes_wrapper.js` na lista
3. Se necessário, delete e recrie na ordem correta

### Problema: "Canvas is already in use"

**Causa:** `Index.html` não foi atualizado corretamente

**Solução:**
1. Abra `Index.html` no Apps Script
2. Procure por: `let chartStatus = null;`
3. Se não encontrar, o arquivo não foi atualizado
4. Copie e cole novamente o conteúdo do arquivo local

### Problema: Gráficos não aparecem

**Causa:** Chart.js não carregou

**Solução:**
1. Verifique sua conexão com a internet
2. Abra o console (F12) e veja se há erros de rede
3. Tente atualizar a página (F5)

### Problema: KPIs mostram "0" ou "NaN"

**Causa:** Planilha sem dados ou formato incorreto

**Solução:**
1. Verifique se há pedidos na planilha
2. Verifique se as colunas estão corretas
3. Execute o teste `99.teste_debug.js` no Apps Script

### Problema: "TypeError: Cannot read properties of null"

**Causa:** Funções wrapper não estão sendo chamadas

**Solução:**
1. Abra `Index.html` no Apps Script
2. Procure por chamadas antigas (sem `__`):
   - `.getDashboardData` ❌
   - `.listarPedidos` ❌
   - `.buscarProduto` ❌
3. Devem estar assim:
   - `.__getDashboardData` ✅
   - `.__listarPedidos` ✅
   - `.__buscarProduto` ✅

---

## 📊 VERIFICAÇÃO DE LOGS

### **Logs do Apps Script** (Execuções > Ver logs)

Você deve ver logs assim:

```
🔄 __getDashboardData chamado com filtros: {...}
📤 __getDashboardData retornando: objeto válido
✅ Objeto serializado com sucesso
```

Se você vir:
```
❌ Erro em __getDashboardData: ...
```

Então há um erro no backend. Leia a mensagem de erro para identificar o problema.

### **Console do Navegador** (F12)

Você deve ver:

```
🚀 Iniciando Sistema Neoformula v7.0...
✅ Sistema inicializado com sucesso
✅ Dashboard carregado com sucesso
✅ Pedidos carregados com sucesso
```

Se você vir:
```
❌ Resposta vazia ao carregar dashboard
```

Então o problema é de serialização. Verifique se `00.utils_serialization.js` foi carregado.

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy concluído, marque todos os itens:

### Upload de Arquivos:
- [ ] `00.utils_serialization.js` criado no Apps Script
- [ ] `00.funcoes_wrapper.js` atualizado no Apps Script
- [ ] `Index.html` atualizado no Apps Script
- [ ] Todos os arquivos salvos (Ctrl+S)

### Deploy:
- [ ] Nova versão criada com descrição correta
- [ ] URL de produção copiada
- [ ] Deploy concluído sem erros

### Testes:
- [ ] Inicialização funcionando (v7.0 aparece no console)
- [ ] Dashboard mostra 15 KPIs
- [ ] Gráficos atualizam sem erro
- [ ] Botão "Ver" em Pedidos funciona
- [ ] Botão "Ver" em Produtos funciona
- [ ] Aba Configurações carrega
- [ ] Filtros aplicam corretamente
- [ ] Console sem erros críticos

### Documentação:
- [ ] URL de produção documentada
- [ ] Equipe notificada da nova versão
- [ ] Changelog atualizado (se aplicável)

---

## 📞 SUPORTE

Se você seguiu todos os passos e ainda há problemas:

1. **Verifique os logs** do Apps Script e do console do navegador
2. **Copie as mensagens de erro** completas
3. **Tire screenshots** do erro
4. **Documente** os passos que causam o erro
5. **Consulte** o arquivo `VERSAO_7.0_RESUMO.md` para detalhes técnicos

---

**Versão:** 7.0
**Data:** 30 de outubro de 2025
**Status:** ✅ Pronto para deploy
**Tempo estimado de deploy:** 10-15 minutos
