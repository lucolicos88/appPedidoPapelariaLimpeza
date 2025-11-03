# 🚀 GUIA DE DEPLOY v8.0 VIA CLASP

**Data:** 03/11/2025
**Versão:** 8.0
**Método:** CLASP (Command Line Apps Script Projects)

---

## 📋 PRÉ-REQUISITOS

✅ CLASP instalado globalmente: `npm install -g @google/clasp`
✅ Autenticado: `clasp login`
✅ Projeto vinculado: `.clasp.json` configurado
✅ Todos os commits v8.0 finalizados (7 commits)

---

## 🎯 ARQUIVOS PRONTOS PARA DEPLOY

### **Backend (12 módulos .js):**
```
✅ 00.utils_serialization.js       - Serialização
✅ 00.funcoes_wrapper.js            - 21 wrappers consolidados v8.0
✅ 01.config.js                     - CONFIG com 48 colunas (NOVO v8.0)
✅ 01.setup.js                      - Setup
✅ 02.autenticacao.js               - Autenticação
✅ 03.gerenciamentoProdutos.js      - CRUD produtos (v8.0 CONFIG)
✅ 04.gerenciamentoPedidos.js       - CRUD pedidos (v8.0 CONFIG + 4 funções)
✅ 05.controleEstoque.js            - Gestão de estoque
✅ 06.dashboard_consolidado.js      - Dashboard v7.0
✅ 07.funcoesAuxiliares.js          - Auxiliares
✅ 08.interfaceWeb.js               - Interface web
✅ 09.relatorios_avancados.js       - 8 relatórios v8.0
✅ 10.gerenciamentoImagens.js       - Upload Google Drive (v8.0 CONFIG)
✅ 99.teste_debug.js                - Testes
```

### **Frontend (1 arquivo .html):**
```
✅ Index.html                       - Interface completa v8.0 (3702 linhas)
                                      - 4 abas dashboard
                                      - 36 KPIs
                                      - Progress bars, ranking tables
```

### **Arquivos Removidos (não serão enviados):**
```
❌ DashboardAvancado.html            - Consolidado no Index.html
❌ 06.dashboard.js                   - Obsoleto (substituído por 06.dashboard_consolidado.js)
❌ 09.relatorios.js                  - Obsoleto (substituído por 09.relatorios_avancados.js)
❌ 00.funcoes_wrapper_v8_ADICOES.js  - Consolidado
❌ 02.pedidos_v8_ADICOES.js          - Consolidado
```

---

## 🔧 COMANDOS CLASP

### **1. Verificar Status Atual**
```bash
# Ver informações do projeto
clasp status

# Listar arquivos que serão enviados
clasp list
```

### **2. Fazer Push para Google Apps Script**
```bash
# Enviar todos os arquivos
clasp push

# Ou enviar com watch (auto-upload em mudanças)
clasp push --watch
```

### **3. Abrir no Editor Online (Opcional)**
```bash
# Abrir o Apps Script Editor no navegador
clasp open
```

### **4. Ver Logs de Execução (Opcional)**
```bash
# Ver logs em tempo real
clasp logs

# Ver logs com filtro
clasp logs --json
```

---

## ✅ CHECKLIST PÓS-DEPLOY

### **1. Verificar Upload**
- [ ] Abrir Apps Script Editor: `clasp open`
- [ ] Verificar que **13 arquivos .gs** estão presentes
- [ ] Verificar que **1 arquivo Index.html** está presente
- [ ] Confirmar que **DashboardAvancado.html** NÃO está presente

### **2. Verificar CONFIG**
- [ ] Abrir `01.config.js` no editor
- [ ] Confirmar `COLUNAS_PRODUTOS.IMAGEM_URL = 11`
- [ ] Confirmar 13 colunas para Produtos (A-M)
- [ ] Confirmar 15 colunas para Pedidos (A-O)

### **3. Verificar Wrappers**
- [ ] Abrir `00.funcoes_wrapper.js`
- [ ] Confirmar 21 funções wrapper consolidadas
- [ ] Verificar presença de `__darBaixaPedido`
- [ ] Verificar presença de `__buscarProdutos`
- [ ] Verificar presença de `__getMinhasSolicitacoes`

### **4. Verificar Módulos Atualizados**
- [ ] `03.gerenciamentoProdutos.js` usando CONFIG
- [ ] `04.gerenciamentoPedidos.js` com 4 funções v8.0
- [ ] `10.gerenciamentoImagens.js` usando CONFIG

### **5. Testar Interface**
- [ ] Fazer deploy como Web App (se ainda não feito)
- [ ] Abrir a URL da Web App
- [ ] Verificar que mostra "Sistema Neoformula v8.0"
- [ ] Testar login

### **6. Testar Dashboard**
- [ ] Acessar aba Dashboard
- [ ] Verificar 4 sub-abas: Resumo, Financeiro, Logístico, Estoque
- [ ] Clicar em cada sub-aba e verificar carregamento de KPIs
- [ ] Verificar progress bars e ranking tables

### **7. Testar Funcionalidades v8.0**
- [ ] Testar busca de produtos na aba Solicitação
- [ ] Testar baixa de pedido
- [ ] Testar upload de imagem de produto
- [ ] Testar relatórios (8 tipos)

---

## 🐛 TROUBLESHOOTING

### **Erro: "Project not found"**
```bash
# Re-autenticar
clasp login

# Verificar .clasp.json
cat .clasp.json
```

### **Erro: "Permission denied"**
```bash
# Verificar permissões do projeto no Google Cloud Console
clasp open --webapp
```

### **Erro: "Files not found"**
```bash
# Verificar .claspignore
cat .claspignore

# Listar arquivos que serão enviados
clasp list
```

### **Erro: "Script ID missing"**
```bash
# Verificar se .clasp.json tem scriptId
cat .clasp.json

# Se necessário, criar novo projeto
clasp create --type webapp --title "Sistema Neoformula v8.0"
```

---

## 📊 ESTRUTURA .clasp.json ESPERADA

```json
{
  "scriptId": "SEU_SCRIPT_ID_AQUI",
  "rootDir": "."
}
```

---

## 🔒 ARQUIVOS A IGNORAR (.claspignore)

Se você tiver um arquivo `.claspignore`, certifique-se de que **não** inclui:
```
# NÃO ignorar estes arquivos (precisam ser enviados):
# *.js
# *.html
# 01.config.js
# Index.html
```

Ignorar apenas:
```
# Arquivos do Git
.git/
.gitignore

# Documentação local
*.md
!appsscript.json

# Node modules
node_modules/

# VSCode
.vscode/

# Outros
.DS_Store
```

---

## 🚀 DEPLOY WEB APP (Publicação)

### **1. Criar Nova Versão (Via Editor)**
1. Abrir Apps Script Editor: `clasp open`
2. Clicar em **Deploy** → **New deployment**
3. Selecionar tipo: **Web app**
4. Configurar:
   - **Description:** "v8.0 - Dashboard Consolidado + CONFIG + 4 Funções Novas"
   - **Execute as:** Me (seu usuário)
   - **Who has access:** Anyone within organization (ou conforme necessário)
5. Clicar em **Deploy**
6. Copiar a **URL da Web App**

### **2. Atualizar Deployment Existente**
1. Abrir Apps Script Editor: `clasp open`
2. Clicar em **Deploy** → **Manage deployments**
3. Clicar no ícone de **edição** (lápis) do deployment ativo
4. Selecionar **New version**
5. Adicionar descrição: "v8.0"
6. Salvar

---

## 📈 VERSIONAMENTO

**Versão atual no código:** v8.0
**Data:** 03/11/2025
**Commits:** 7 commits organizados

**Histórico de versões:**
- v6.0 - Sistema básico
- v7.0 - Dashboard avançado (32 KPIs)
- **v8.0 - Reorganização + CONFIG + Consolidação** ⭐ **ATUAL**

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Deploy completo em 3 passos
clasp status           # 1. Verificar status
clasp push             # 2. Enviar arquivos
clasp open             # 3. Abrir no navegador

# Ver logs de execução
clasp logs --watch

# Listar deployments
clasp deployments
```

---

## 📞 SUPORTE

**Arquivos de referência:**
- [V8.0_RESUMO_FINAL.md](V8.0_RESUMO_FINAL.md) - Resumo completo da v8.0
- [V8.0_ESTRUTURA_FINAL.md](V8.0_ESTRUTURA_FINAL.md) - Estrutura e mapeamentos
- [V8.0_REORGANIZACAO_MODULOS.md](V8.0_REORGANIZACAO_MODULOS.md) - Plano de reorganização

**Links úteis:**
- [CLASP Documentation](https://github.com/google/clasp)
- [Apps Script Guides](https://developers.google.com/apps-script/guides/web)

---

**✅ Sistema v8.0 Pronto para Deploy via CLASP!**
