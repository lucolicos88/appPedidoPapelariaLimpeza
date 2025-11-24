# 📋 GUIA DE IMPLEMENTAÇÃO E TESTES - v13.1

## 🎯 O QUE MUDOU NA v13.1

### ❌ ANTES (v13.0 - INCORRETO):
```
Upload XML → Sistema criava fornecedor automaticamente
```

### ✅ AGORA (v13.1 - CORRETO):
```
1. Selecionar Fornecedor (ou cadastrar novo)
2. Selecionar Tipo de Produto
3. Upload XML → Processamento automático
```

---

## 🚀 PASSO A PASSO PARA IMPLEMENTAÇÃO

### **ETAPA 1: Preparar o Ambiente**

1. **Abra o Google Sheets** da sua aplicação
2. **Execute o menu**: `Sistema de Pedidos` → `🔧 Setup: Criar/Atualizar Planilha`
3. **Verifique** se a aba `Fornecedores` foi criada com os cabeçalhos:
   ```
   ID | Nome | Nome Fantasia | CNPJ | Telefone | Email | Endereço |
   Cidade | Estado | CEP | Tipo Produtos | Ativo | Data Cadastro | Observações
   ```

---

### **ETAPA 2: Cadastrar Fornecedores (OBRIGATÓRIO)**

#### Opção A: Cadastro via Interface Web
1. Acesse a aba **Notas Fiscais**
2. Clique em **📤 Importar XML**
3. Clique em **➕ Cadastrar Novo Fornecedor**
4. Preencha os dados:
   - **Nome/Razão Social*** (obrigatório)
   - Nome Fantasia (opcional)
   - CNPJ (opcional, mas recomendado)
   - Telefone (opcional)
   - Email (opcional)
   - Tipo de Produtos (Papelaria/Limpeza/Ambos)
   - Observações (opcional)
5. Clique em **✅ Salvar Fornecedor**

#### Opção B: Cadastro Manual na Planilha
1. Acesse a aba **Fornecedores**
2. Adicione uma linha com os dados:
   ```
   ID: [gerar UUID único]
   Nome: [Nome do Fornecedor]
   CNPJ: [CNPJ se tiver]
   Tipo Produtos: Papelaria ou Limpeza ou Ambos
   Ativo: Sim
   Data Cadastro: [data de hoje]
   ```

**⚠️ IMPORTANTE:** Cadastre pelo menos UM fornecedor antes de importar XML!

---

### **ETAPA 3: Importar XML da Nota Fiscal**

1. **Acesse a aba Notas Fiscais**
2. **Clique em** `📤 Importar XML`
3. **PASSO 1** - Selecione o **Fornecedor** no dropdown
   - Se o fornecedor não existir, clique em `➕ Cadastrar Novo Fornecedor`
4. **PASSO 2** - Selecione o **Tipo de Produtos da NF**
   - Papelaria ou Limpeza
5. **PASSO 3** - Faça upload do **arquivo XML**
   - O campo só será habilitado após passos 1 e 2
6. **(Opcional)** Adicione **Observações**
7. **Confirme** o processamento automático

---

### **ETAPA 4: Processamento Automático**

O sistema irá **automaticamente**:

✅ Extrair dados do XML:
- Número da NF
- Data de Emissão
- Fornecedor
- Produtos (Código e Descrição DO FORNECEDOR)
- Quantidades
- Valores Unitários
- NCM

✅ Cruzar produtos com cadastrados:
- **Estratégia 1:** Código Fornecedor + Fornecedor ID
- **Estratégia 2:** Similaridade de descrição (85%+)

✅ Para PRODUTOS ENCONTRADOS:
- Apenas dar entrada no estoque
- Atualizar custo médio ponderado

✅ Para PRODUTOS NOVOS:
- Cadastrar com:
  - **Código Fornecedor** (do XML)
  - **Descrição Fornecedor** (do XML)
  - **Fornecedor ID** (selecionado)
  - **Tipo** (selecionado)
  - **Unidade** (do XML)
  - **Preço Unitário** (do XML)
  - **NCM** (do XML)
  - **ORIGEM**: `NF`
  - **DADOS_COMPLETOS**: `NÃO`
- Criar registro de estoque zerado
- Dar entrada da quantidade da NF
- Atualizar custo

---

### **ETAPA 5: Completar Cadastro dos Produtos**

Produtos cadastrados via NF terão **DADOS_COMPLETOS = NÃO** até que você preencha manualmente:

1. **Acesse a aba Produtos**
2. **Identifique** produtos com dados incompletos (origem = NF)
3. **Clique em Editar** no produto
4. **Complete os dados:**
   - ✏️ **Código Neoformula** (seu código interno)
   - ✏️ **Descrição Neoformula** (sua descrição)
   - ✏️ **Categoria**
   - 📷 **Imagem** (upload)
   - 📊 **Estoque Mínimo**
   - 📊 **Ponto de Pedido**
5. **Salve**

Após salvar com Código e Descrição Neoformula preenchidos, o campo **DADOS_COMPLETOS** mudará automaticamente para `SIM`.

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Cadastro de Fornecedor
- [ ] Cadastrar fornecedor via modal
- [ ] Verificar se aparece na planilha Fornecedores
- [ ] Verificar se aparece no dropdown do modal de NF
- [ ] Validar campos obrigatórios (nome)
- [ ] Validar CNPJ duplicado (deve bloquear)

### Teste 2: Upload de XML com Fornecedor Novo
- [ ] Selecionar fornecedor cadastrado
- [ ] Selecionar tipo de produto
- [ ] Upload de XML
- [ ] Confirmar processamento
- [ ] Verificar se produtos foram cadastrados
- [ ] Verificar se ORIGEM = NF
- [ ] Verificar se DADOS_COMPLETOS = NÃO
- [ ] Verificar entrada no estoque

### Teste 3: Upload de XML com Produtos Existentes
- [ ] Cadastrar produto manualmente (com código fornecedor)
- [ ] Importar XML com esse produto
- [ ] Verificar se NÃO criou duplicado
- [ ] Verificar se apenas deu entrada no estoque
- [ ] Verificar atualização de custo médio

### Teste 4: Completar Dados do Produto
- [ ] Editar produto com DADOS_COMPLETOS = NÃO
- [ ] Preencher Código Neoformula
- [ ] Preencher Descrição Neoformula
- [ ] Salvar
- [ ] Verificar se DADOS_COMPLETOS mudou para SIM

### Teste 5: Validações
- [ ] Tentar upload sem selecionar fornecedor (deve bloquear)
- [ ] Tentar upload sem selecionar tipo (deve bloquear)
- [ ] Tentar importar XML com fornecedor inexistente (deve dar erro)

---

## 📊 ESTRUTURA DE DADOS

### Produtos (18 colunas):
```
A  - ID
B  - Código Fornecedor         (do XML)
C  - Descrição Fornecedor       (do XML)
D  - Fornecedor ID             (selecionado manualmente)
E  - Código Neoformula         (preencher depois)
F  - Descrição Neoformula      (preencher depois)
G  - Tipo
H  - Categoria                 (preencher depois)
I  - Unidade
J  - Preço Unitário
K  - Estoque Mínimo            (preencher depois)
L  - Ponto de Pedido           (preencher depois)
M  - Imagem URL                (preencher depois)
N  - NCM                       (do XML)
O  - Ativo
P  - Data Cadastro
Q  - Origem                    (MANUAL ou NF)
R  - Dados Completos           (SIM ou NÃO)
```

### Fornecedores (14 colunas):
```
A  - ID
B  - Nome/Razão Social
C  - Nome Fantasia
D  - CNPJ
E  - Telefone
F  - Email
G  - Endereço
H  - Cidade
I  - Estado
J  - CEP
K  - Tipo Produtos
L  - Ativo
M  - Data Cadastro
N  - Observações
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Fornecedor não aparece no dropdown
**Solução:**
1. Verifique se o fornecedor tem ATIVO = "Sim"
2. Reabra o modal de importação
3. Se persistir, verifique o console do navegador (F12)

### Problema: Upload de XML dá erro
**Possíveis causas:**
1. Fornecedor não selecionado
2. Tipo de produto não selecionado
3. XML inválido ou corrompido
4. Fornecedor ID inválido

**Solução:**
1. Verifique se seguiu os passos 1 e 2
2. Valide o arquivo XML em um validador online
3. Verifique os logs no Google Apps Script

### Problema: Produtos duplicados
**Solução:**
- O sistema cruza por **Código Fornecedor + Fornecedor ID**
- Se houver duplicados, um produto pode ter código vazio
- Edite e adicione o código do fornecedor correto

### Problema: DADOS_COMPLETOS não muda para SIM
**Solução:**
- Certifique-se de preencher **AMBOS**:
  - Código Neoformula
  - Descrição Neoformula
- Salve e recarregue a página

---

## 📞 SUPORTE

Para problemas não resolvidos:
1. Acesse: `Sistema de Pedidos` → `Ver Logs`
2. Capture o erro exato
3. Reporte no GitHub Issues

---

## ✅ CHECKLIST DE DEPLOY

- [x] Clasp push realizado
- [x] Git commit e push realizados
- [x] Setup da planilha executado
- [ ] Fornecedores cadastrados
- [ ] Teste de importação XML realizado
- [ ] Produtos completados

**Versão:** v13.1
**Data:** 24/11/2025
**Status:** ✅ PRONTO PARA USO
