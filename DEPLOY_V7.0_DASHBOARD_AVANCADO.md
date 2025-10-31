# 🚀 DEPLOY VERSÃO 7.0 - DASHBOARD AVANÇADO

## ✨ O QUE VOCÊ VAI OBTER

Após este deploy, você terá um **Dashboard Profissional Completo** com:

✅ **32+ KPIs** divididos em 3 categorias (Financeiros, Logísticos, Estoque)
✅ **8 Gráficos Interativos** (Pizza, Linha, Barra, Radar)
✅ **5 Tabelas de Ranking** com progress bars
✅ **Filtros Avançados** (Data, Tipo, Status)
✅ **Interface Moderna** com abas e animações
✅ **Totalmente Responsivo** - funciona em desktop, tablet e mobile

---

## 📁 ARQUIVOS PARA UPLOAD

Você precisa fazer upload de **3 ARQUIVOS** no Google Apps Script:

### **1. Backend - Cálculo de KPIs**
- **Arquivo:** `06.dashboard_avancado.js`
- **Tipo:** Script (.gs)
- **Tamanho:** ~15KB
- **Descrição:** Calcula todos os 32 KPIs automaticamente

### **2. Backend - Wrapper Function**
- **Arquivo:** `00.funcoes_wrapper.js`
- **Tipo:** Script (.gs)
- **Ação:** SUBSTITUIR o arquivo existente
- **Descrição:** Adiciona wrapper `__getDashboardAvancado()`

### **3. Frontend - Interface do Dashboard**
- **Arquivo:** `DashboardAvancado.html`
- **Tipo:** HTML
- **Tamanho:** ~30KB
- **Descrição:** Interface completa com gráficos e tabelas

---

## 📋 PASSO A PASSO DO DEPLOY

### **PASSO 1: Abrir o Google Apps Script**

1. Acesse: https://script.google.com
2. Abra o projeto "Sistema Neoformula"
3. Certifique-se de estar na planilha correta

---

### **PASSO 2: Adicionar Arquivo Backend (06.dashboard_avancado.js)**

#### 2.1 - Criar novo arquivo Script

1. No Apps Script, clique em **+** ao lado de "Arquivos"
2. Selecione **Script**
3. Nome do arquivo: `06.dashboard_avancado`

#### 2.2 - Copiar código

1. Abra o arquivo local: `06.dashboard_avancado.js`
2. Copie **TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
3. Cole no Apps Script (Ctrl+V)
4. Clique em **Salvar** (Ctrl+S)

✅ **Checkpoint:** Arquivo `06.dashboard_avancado` criado

---

### **PASSO 3: Atualizar Wrapper Functions**

#### 3.1 - Abrir arquivo existente

1. No Apps Script, abra o arquivo `00.funcoes_wrapper`

#### 3.2 - Substituir conteúdo

1. **SELECIONE TODO O CONTEÚDO** (Ctrl+A)
2. Abra o arquivo local: `00.funcoes_wrapper.js`
3. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
4. Cole no Apps Script (Ctrl+V) - **SUBSTITUINDO TUDO**
5. Clique em **Salvar** (Ctrl+S)

✅ **Checkpoint:** Arquivo `00.funcoes_wrapper` atualizado com 9 wrappers

---

### **PASSO 4: Adicionar Frontend (DashboardAvancado.html)**

#### 4.1 - Criar novo arquivo HTML

1. No Apps Script, clique em **+** ao lado de "Arquivos"
2. Selecione **HTML**
3. Nome do arquivo: `DashboardAvancado`

#### 4.2 - Copiar código

1. Abra o arquivo local: `DashboardAvancado.html`
2. Copie **TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
3. Cole no Apps Script (Ctrl+V)
4. Clique em **Salvar** (Ctrl+S)

✅ **Checkpoint:** Arquivo `DashboardAvancado` HTML criado

---

### **PASSO 5: Verificar Arquivos**

Confira se os 3 arquivos estão corretos:

- [ ] `06.dashboard_avancado` - Script com ~400 linhas
- [ ] `00.funcoes_wrapper` - Script com `__getDashboardAvancado` function
- [ ] `DashboardAvancado` - HTML com ~800 linhas

---

### **PASSO 6: Criar Nova Versão**

#### 6.1 - Abrir gerenciador de implantações

1. Clique em **Implantar** (canto superior direito)
2. Selecione **Gerenciar implantações**

#### 6.2 - Criar nova versão

1. Clique no ícone de **edição** (lápis) da implantação "App da Web"
2. Clique em **Nova versão**
3. Na descrição, digite:
   ```
   v7.0 - Dashboard Avançado: 32 KPIs + 8 gráficos + 5 tabelas de ranking
   ```

#### 6.3 - Configurar permissões

1. **Executar como:** Eu (seu email)
2. **Quem tem acesso:** Qualquer pessoa (ou "Apenas minha organização" se Google Workspace)

#### 6.4 - Concluir deploy

1. Clique em **Implantar**
2. Na janela de confirmação, clique em **Atualizar**
3. **COPIE A URL** que aparece (termina com `/exec`)

✅ **Checkpoint:** Nova versão v7.0 criada com sucesso

---

### **PASSO 7: Acessar Dashboard Avançado**

Para acessar o Dashboard Avançado, você tem 2 opções:

#### **Opção A: URL Direta**
A URL do Dashboard Avançado é a mesma URL principal, mas abrindo `DashboardAvancado.html`:

```
https://script.google.com/macros/s/[SEU_ID]/exec?page=DashboardAvancado
```

#### **Opção B: Adicionar Link no Menu Principal**

No `Index.html`, adicione um botão no menu:

```html
<button onclick="window.open('URL_DO_DASHBOARD_AVANCADO', '_blank')">
  📊 Dashboard Avançado
</button>
```

---

## 🧪 TESTE COMPLETO DO SISTEMA

### **TESTE 1: Verificar Inicialização**

1. Abra a URL em **aba anônima** (Ctrl+Shift+N)
2. Console do navegador (F12) deve mostrar:
   ```
   🚀 Carregando Dashboard Avançado v7.0...
   ✅ Dashboard carregado com sucesso
   ```

---

### **TESTE 2: Verificar KPIs Financeiros**

1. Abra a aba **💰 Financeiros** (deve estar aberta por padrão)
2. Verifique se aparecem **5 KPI Cards:**
   - [ ] Valor Total de Pedidos (R$ ...)
   - [ ] Ticket Médio (R$ ...)
   - [ ] Variação Mensal (...%)
   - [ ] Previsão de Gastos (R$ ...)
   - [ ] Custo per Capita (R$ ...)

3. Verifique **2 Gráficos:**
   - [ ] Gastos por Tipo (Pizza - Papelaria vs Limpeza)
   - [ ] Evolução Mensal (Linha - valores ao longo do tempo)

4. Verifique **2 Tabelas:**
   - [ ] Top 10 Gastos por Setor
   - [ ] Top 10 Produtos Mais Caros

---

### **TESTE 3: Verificar KPIs Logísticos**

1. Clique na aba **🚚 Logísticos**
2. Verifique se aparecem **7 KPI Cards:**
   - [ ] Tempo Médio de Aprovação
   - [ ] Lead Time Total
   - [ ] Taxa de Pedidos no Prazo
   - [ ] Taxa de Cancelamento
   - [ ] Backlog de Pedidos
   - [ ] Taxa de Pedidos Urgentes
   - [ ] Eficiência de Processamento

3. Verifique **2 Gráficos:**
   - [ ] Pedidos por Status (Barras)
   - [ ] Tempos Médios (Barras)

4. Verifique **1 Tabela:**
   - [ ] Top 10 Solicitantes Mais Ativos

---

### **TESTE 4: Verificar KPIs de Estoque**

1. Clique na aba **📦 Estoque**
2. Verifique se aparecem **9 KPI Cards:**
   - [ ] Valor Total de Estoque
   - [ ] Giro de Estoque
   - [ ] Cobertura de Estoque
   - [ ] Taxa de Ruptura
   - [ ] Produtos Abaixo do Mínimo
   - [ ] Acurácia de Estoque
   - [ ] Idade Média do Estoque
   - [ ] Produtos Inativos
   - [ ] Custo de Armazenagem

3. Se houver produtos com estoque baixo, deve aparecer:
   - [ ] **Alerta amarelo** ⚠️ com quantidade de produtos

4. Verifique **2 Gráficos:**
   - [ ] Top 10 Produtos Mais Solicitados (Barras horizontais)
   - [ ] Indicadores de Saúde (Radar - 5 dimensões)

5. Verifique **1 Tabela:**
   - [ ] Previsão de Reposição (com cores de urgência)

---

### **TESTE 5: Verificar Filtros**

1. No topo da página, configure os filtros:
   - **Data Início:** Selecione uma data
   - **Data Fim:** Selecione outra data
   - **Tipo:** Escolha "Papelaria" ou "Limpeza"
   - **Status:** Escolha um status

2. Clique em **✓ Aplicar Filtros**

3. Verifique:
   - [ ] Loading aparece
   - [ ] KPIs atualizam com novos valores
   - [ ] Gráficos atualizam
   - [ ] Tabelas atualizam

4. Clique em **✗ Limpar**

5. Verifique:
   - [ ] Filtros são limpos
   - [ ] Dados voltam ao estado original

---

### **TESTE 6: Verificar Gráficos**

1. **Hover** sobre os gráficos
2. Deve aparecer tooltip com valores
3. **Resize** a janela do navegador
4. Gráficos devem se ajustar (responsivo)

---

### **TESTE 7: Verificar Console (Debug)**

1. Abra o **Console do navegador** (F12)
2. **NÃO deve haver erros vermelhos**
3. Deve ver apenas logs de sucesso:
   ```
   🚀 Carregando Dashboard Avançado v7.0...
   ✅ Dashboard carregado com sucesso
   ```

---

### **TESTE 8: Verificar Logs do Apps Script**

1. Vá para Apps Script → **Execuções**
2. Clique em **Ver logs** da execução mais recente
3. Deve ver:
   ```
   🔄 __getDashboardAvancado chamado com filtros: {...}
   📤 __getDashboardAvancado retornando: objeto válido
   ✅ Objeto serializado com sucesso
   ```

---

## 🐛 TROUBLESHOOTING

### **Problema 1: "Resposta vazia do servidor"**

**Sintoma:** Console mostra `❌ Resposta vazia ao carregar dashboard`

**Causa:** Arquivo `06.dashboard_avancado.js` não foi carregado

**Solução:**
1. Verifique se o arquivo existe no Apps Script
2. Verifique o nome: deve ser `06.dashboard_avancado` (sem extensão .gs)
3. Recrie o arquivo seguindo PASSO 2

---

### **Problema 2: Gráficos não aparecem**

**Sintoma:** Área dos gráficos fica em branco

**Causa:** Chart.js não carregou ou canvas inválido

**Solução:**
1. Verifique conexão com internet (Chart.js carrega via CDN)
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Teste em aba anônima
4. Verifique console para erros de rede

---

### **Problema 3: KPIs mostram "0" ou "NaN"**

**Sintoma:** Todos os KPIs estão zerados

**Causa:** Sem dados na planilha ou formato incorreto

**Solução:**
1. Verifique se há pedidos cadastrados na planilha
2. Verifique se as colunas estão na ordem correta
3. Execute `99.teste_debug.js` no Apps Script para verificar dados

---

### **Problema 4: Filtros não funcionam**

**Sintoma:** Clicar em "Aplicar Filtros" não muda nada

**Causa:** IDs dos inputs não correspondem ao JavaScript

**Solução:**
1. Verifique se os IDs estão corretos no HTML:
   - `filterDataInicio`
   - `filterDataFim`
   - `filterTipo`
   - `filterStatus`
2. Abra console e verifique erros JavaScript

---

### **Problema 5: "Cannot read properties of null"**

**Sintoma:** Erro no console: `Cannot read properties of null (reading 'financeiros')`

**Causa:** Wrapper `__getDashboardAvancado` não existe ou não retorna dados

**Solução:**
1. Verifique se `00.funcoes_wrapper.js` foi atualizado (PASSO 3)
2. Verifique se contém a função `__getDashboardAvancado`
3. Recrie o arquivo seguindo PASSO 3

---

### **Problema 6: Página em branco**

**Sintoma:** Dashboard não carrega nada, tela branca

**Causa:** Erro de JavaScript ou HTML mal formado

**Solução:**
1. Abra console do navegador (F12)
2. Veja qual erro aparece
3. Verifique se `DashboardAvancado.html` foi copiado corretamente
4. Recrie o arquivo seguindo PASSO 4

---

## 📊 VERIFICAÇÃO FINAL

Antes de considerar o deploy concluído, marque TODOS os itens:

### **Upload de Arquivos:**
- [ ] `06.dashboard_avancado` criado no Apps Script
- [ ] `00.funcoes_wrapper` atualizado no Apps Script
- [ ] `DashboardAvancado` HTML criado no Apps Script
- [ ] Todos os arquivos salvos (Ctrl+S)

### **Deploy:**
- [ ] Nova versão criada com descrição correta
- [ ] URL de produção copiada e guardada
- [ ] Deploy concluído sem erros

### **Testes Funcionais:**
- [ ] Dashboard inicializa (v7.0 aparece no console)
- [ ] Aba Financeiros carrega (5 KPIs + 2 gráficos + 2 tabelas)
- [ ] Aba Logísticos carrega (7 KPIs + 2 gráficos + 1 tabela)
- [ ] Aba Estoque carrega (9 KPIs + 2 gráficos + 1 tabela)
- [ ] Filtros aplicam corretamente
- [ ] Botão "Limpar" funciona
- [ ] Gráficos são interativos (hover)
- [ ] Tabelas mostram rankings
- [ ] Console sem erros críticos

### **Performance:**
- [ ] Dashboard carrega em < 5 segundos
- [ ] Filtros respondem em < 3 segundos
- [ ] Gráficos renderizam suavemente
- [ ] Animações fluidas

### **Responsividade:**
- [ ] Funciona em desktop (1920x1080)
- [ ] Funciona em tablet (768x1024)
- [ ] Funciona em mobile (375x667)

---

## 🎉 PARABÉNS!

Se todos os testes passaram, você agora tem um **Dashboard Profissional de Nível Empresarial** com:

✅ **32+ KPIs** automatizados
✅ **8 Gráficos** interativos
✅ **5 Tabelas** de ranking
✅ **Filtros** avançados
✅ **Interface** moderna e responsiva

---

## 📞 SUPORTE

Se você seguiu todos os passos e ainda tem problemas:

1. **Verifique os logs** do Apps Script (Execuções > Ver logs)
2. **Verifique o console** do navegador (F12)
3. **Tire screenshots** dos erros
4. **Documente** os passos que causam o erro
5. **Consulte** o arquivo `V7.0_DASHBOARD_AVANCADO.md` para detalhes técnicos

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **[V7.0_DASHBOARD_AVANCADO.md](V7.0_DASHBOARD_AVANCADO.md)** - Lista completa de KPIs e fórmulas
- **[VERSAO_7.0_RESUMO.md](VERSAO_7.0_RESUMO.md)** - Visão geral da versão 7.0
- **[SOLUCAO_PROBLEMA_SERIALIZACAO.md](SOLUCAO_PROBLEMA_SERIALIZACAO.md)** - Detalhes técnicos da correção Date

---

**Versão:** 7.0
**Data:** 30 de outubro de 2025
**Status:** ✅ Pronto para produção
**Tempo estimado de deploy:** 15-20 minutos
**Nível de complexidade:** Médio
**Requer:** Google Apps Script + Planilha Google Sheets
