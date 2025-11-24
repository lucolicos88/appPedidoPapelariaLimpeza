# 🧪 GUIA DE TESTES - v13.1.1

## 📋 RESUMO DAS CORREÇÕES

Esta versão corrige **4 bugs críticos** e adiciona a **aba Fornecedores** completa.

---

## ✅ TESTE 1: Correção do erro "toLowerCase is not a function"

### 🎯 Objetivo
Verificar que o erro `produto.codigoFornecedor.toLowerCase is not a function` foi corrigido

### 📝 Passos
1. Faça login na aplicação
2. Navegue para a aba **"Produtos"**
3. Tente usar a busca no campo de pesquisa
4. Verifique no console do navegador (F12)

### ✅ Resultado Esperado
- ✅ A página de produtos carrega sem erros
- ✅ A busca funciona normalmente
- ✅ Não há erros no console sobre "toLowerCase"
- ✅ Produtos aparecem com nomes corretos (não "undefined")

### ❌ Se falhar
- Verifique se o `clasp push` foi executado com sucesso
- Verifique se a página foi recarregada (Ctrl+F5)

---

## ✅ TESTE 2: Correção "Resposta vazia" em Movimentações

### 🎯 Objetivo
Verificar que o erro "Resposta vazia" na aba Movimentações foi corrigido

### 📝 Passos
1. Navegue para a aba **"Movimentações"**
2. Aguarde o carregamento
3. Tente aplicar filtros

### ✅ Resultado Esperado
- ✅ A página carrega sem erro "Resposta vazia"
- ✅ Movimentações de estoque aparecem na tabela
- ✅ Filtros funcionam normalmente
- ✅ Datas são exibidas corretamente

### ❌ Se não houver movimentações
- Faça uma movimentação de entrada/saída primeiro
- Ou verifique se a planilha "MovimentacoesEstoque" tem dados

---

## ✅ TESTE 3: Correção "Resposta vazia" em Notas Fiscais

### 🎯 Objetivo
Verificar que o erro "Resposta vazia" na aba Notas Fiscais foi corrigido

### 📝 Passos
1. Navegue para a aba **"Notas Fiscais"**
2. Aguarde o carregamento
3. Tente aplicar filtros

### ✅ Resultado Esperado
- ✅ A página carrega sem erro "Resposta vazia"
- ✅ Notas fiscais aparecem na tabela (se houver)
- ✅ Filtros funcionam normalmente
- ✅ Datas são exibidas corretamente

### ℹ️ Nota
Se não houver notas fiscais, a tabela deve mostrar uma mensagem amigável, não um erro

---

## ✅ TESTE 4: Produtos exibindo "undefined" no catálogo

### 🎯 Objetivo
Verificar que produtos agora aparecem com nome correto ao invés de "undefined"

### 📝 Passos
1. Navegue para **"Abrir Pedido"**
2. Observe o catálogo de produtos

### ✅ Resultado Esperado
- ✅ Produtos aparecem com descrição/nome
- ✅ Não há cards com "undefined"
- ✅ Descrição prioriza "Descrição Neoformula" se preenchida
- ✅ Ou mostra "Descrição Fornecedor" se Neoformula estiver vazia

---

## ✅ TESTE 5: Nova Aba Fornecedores - Visualização

### 🎯 Objetivo
Verificar que a nova aba Fornecedores foi criada e está visível

### 📝 Passos
1. Faça login como **Admin** ou **Gestor**
2. Verifique o menu lateral
3. Clique em **"🏢 Fornecedores"**

### ✅ Resultado Esperado
- ✅ Item "🏢 Fornecedores" aparece no menu lateral
- ✅ Ao clicar, abre a página de Fornecedores
- ✅ Tabela carrega com fornecedores existentes
- ✅ Filtros aparecem: Busca, Tipo de Produtos, Status
- ✅ Botão "➕ Novo Fornecedor" está visível

### ℹ️ Nota
Para **Funcionários/Usuários**, este item NÃO deve aparecer no menu

---

## ✅ TESTE 6: Cadastrar Novo Fornecedor

### 🎯 Objetivo
Verificar que é possível cadastrar novos fornecedores

### 📝 Passos
1. Na aba **"Fornecedores"**, clique em **"➕ Novo Fornecedor"**
2. Preencha os dados:
   - **Nome/Razão Social**: Fornecedor Teste LTDA
   - **Nome Fantasia**: Teste
   - **CNPJ**: 12.345.678/0001-99
   - **Telefone**: (11) 98765-4321
   - **Email**: teste@fornecedor.com
   - **Tipo de Produtos**: Papelaria
3. Clique em **"✅ Salvar Alterações"**

### ✅ Resultado Esperado
- ✅ Modal abre corretamente
- ✅ Todos os campos estão presentes
- ✅ Ao salvar, mostra mensagem de sucesso
- ✅ Modal fecha automaticamente
- ✅ Tabela recarrega com o novo fornecedor
- ✅ Novo fornecedor aparece na lista

---

## ✅ TESTE 7: Editar Fornecedor Existente

### 🎯 Objetivo
Verificar que é possível editar fornecedores

### 📝 Passos
1. Na tabela de Fornecedores, clique em **"✏️ Editar"** em qualquer fornecedor
2. Modifique alguns campos (ex: telefone, email, observações)
3. Clique em **"✅ Salvar Alterações"**

### ✅ Resultado Esperado
- ✅ Modal abre com dados do fornecedor preenchidos
- ✅ Título do modal é "✏️ Editar Fornecedor"
- ✅ Ao salvar, mostra mensagem de sucesso
- ✅ Tabela recarrega com dados atualizados
- ✅ Alterações aparecem na planilha Google Sheets (aba Fornecedores)

---

## ✅ TESTE 8: Filtros de Fornecedores

### 🎯 Objetivo
Verificar que os filtros da aba Fornecedores funcionam

### 📝 Passos
1. Na aba **"Fornecedores"**, teste cada filtro:
   - **Busca**: Digite parte de um nome ou CNPJ
   - **Tipo de Produtos**: Selecione "Papelaria" ou "Limpeza"
   - **Status**: Selecione "Ativo" ou "Inativo"
2. Clique em **"🔍 Filtrar"**

### ✅ Resultado Esperado
- ✅ Filtro de busca funciona para nome e CNPJ
- ✅ Filtro de tipo mostra apenas fornecedores do tipo selecionado
- ✅ Filtro de status mostra apenas ativos ou inativos
- ✅ Combinação de filtros funciona corretamente

---

## ✅ TESTE 9: Inativar Fornecedor

### 🎯 Objetivo
Verificar que é possível inativar fornecedores

### 📝 Passos
1. Edite um fornecedor
2. Altere o campo **"Status"** para **"❌ Inativo"**
3. Salve

### ✅ Resultado Esperado
- ✅ Fornecedor é marcado como inativo
- ✅ Badge na tabela muda para "❌ Inativo" (cinza)
- ✅ Ao filtrar por "Ativo", este fornecedor não aparece
- ✅ Fornecedor inativo **não** aparece no dropdown de importação de NF

---

## ✅ TESTE 10: Validação de CNPJ Duplicado

### 🎯 Objetivo
Verificar que o sistema bloqueia CNPJ duplicado

### 📝 Passos
1. Cadastre um fornecedor com CNPJ **12.345.678/0001-99**
2. Tente cadastrar outro fornecedor com o **mesmo CNPJ**
3. Observe a mensagem de erro

### ✅ Resultado Esperado
- ✅ Sistema mostra erro: "CNPJ já cadastrado"
- ✅ Não permite salvar
- ✅ Fornecedor não é duplicado

---

## ✅ TESTE 11: Integração com Importação de NF

### 🎯 Objetivo
Verificar que fornecedores cadastrados aparecem no dropdown de importação de XML

### 📝 Passos
1. Navegue para **"Notas Fiscais"**
2. Clique em **"📤 Importar XML"**
3. Verifique o dropdown **"1️⃣ Fornecedor"**

### ✅ Resultado Esperado
- ✅ Dropdown carrega com todos os fornecedores **ativos**
- ✅ Mostra nome e CNPJ (formato: "Nome - CNPJ")
- ✅ Fornecedores inativos **não** aparecem
- ✅ É possível selecionar um fornecedor
- ✅ Botão "➕ Cadastrar Novo Fornecedor" ainda funciona

---

## ✅ TESTE 12: Permissões de Acesso

### 🎯 Objetivo
Verificar que apenas Admin/Gestor têm acesso à aba Fornecedores

### 📝 Passos
1. Faça login como **Funcionário** ou **Usuário**
2. Verifique o menu lateral

### ✅ Resultado Esperado
- ✅ Item "🏢 Fornecedores" **não** aparece no menu
- ✅ Outras abas continuam acessíveis normalmente

---

## 🔄 TESTE 13: Regressão - Funcionalidades Existentes

### 🎯 Objetivo
Verificar que as correções não quebraram funcionalidades existentes

### 📝 Checklist Rápido
- [ ] Dashboard carrega normalmente
- [ ] Abrir Pedido funciona
- [ ] Gestão de Pedidos funciona (Admin/Gestor)
- [ ] Produtos: listar, buscar, editar
- [ ] Estoque: visualização e movimentações
- [ ] Relatórios carregam
- [ ] Configurações acessíveis (Admin)

### ✅ Resultado Esperado
- ✅ Todas as funcionalidades anteriores continuam funcionando
- ✅ Não há novos erros no console

---

## 📊 VERIFICAÇÃO NA PLANILHA GOOGLE SHEETS

### Aba "Fornecedores"
1. Abra a planilha no Google Sheets
2. Verifique a aba **"Fornecedores"**
3. Confirme que os dados batem com a interface

### ✅ Resultado Esperado
- ✅ Aba "Fornecedores" existe com 14 colunas
- ✅ Dados cadastrados via interface aparecem na planilha
- ✅ Edições feitas na interface refletem na planilha
- ✅ Status (Ativo/Inativo) está correto

---

## 🐛 TROUBLESHOOTING

### Problema: Aba Fornecedores não aparece no menu
**Solução:**
1. Verifique se fez login como Admin ou Gestor
2. Recarregue a página (Ctrl+F5)
3. Verifique os logs no console (F12)

### Problema: Erro ao carregar fornecedores
**Solução:**
1. Verifique se a aba "Fornecedores" existe na planilha
2. Execute: `Sistema de Pedidos` → `🔧 Setup: Criar/Atualizar Planilha`
3. Verifique permissões do usuário

### Problema: Produtos ainda aparecem como "undefined"
**Solução:**
1. Confirme que fez `clasp push` com sucesso
2. Limpe o cache do navegador
3. Recarregue a página (Ctrl+F5)

### Problema: Movimentações/NF ainda dão "Resposta vazia"
**Solução:**
1. Verifique se há dados nas planilhas correspondentes
2. Confirme que fez `clasp push`
3. Verifique logs no Google Apps Script Editor

---

## ✅ CHECKLIST FINAL DE DEPLOY

- [x] Clasp push realizado com sucesso
- [x] Git commit criado
- [x] Git push para GitHub realizado
- [ ] Aba "Fornecedores" criada no Google Sheets (via Setup)
- [ ] Pelo menos 1 fornecedor cadastrado
- [ ] Todos os testes acima executados
- [ ] Nenhum erro no console do navegador
- [ ] Nenhum erro nos logs do Apps Script

---

## 📞 SUPORTE

Se algum teste falhar:
1. Capture screenshot do erro
2. Abra o console do navegador (F12) e copie mensagens de erro
3. Verifique logs: `Sistema de Pedidos` → `Ver Logs`
4. Reporte no GitHub Issues com detalhes

---

**Versão:** v13.1.1
**Data:** 24/11/2025
**Status:** ✅ PRONTO PARA TESTES

---

## 🎯 PRÓXIMOS PASSOS

Após validar todos os testes:
1. Cadastrar fornecedores reais
2. Importar XMLs de notas fiscais
3. Completar dados de produtos (Código/Descrição Neoformula)
4. Monitorar uso em produção
