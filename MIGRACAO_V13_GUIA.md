# 📋 GUIA DE MIGRAÇÃO PARA V13.0

## 🎯 RESUMO DAS MUDANÇAS

A v13.0 muda completamente o fluxo de cadastro de produtos via NF, tornando-o **totalmente automático**.

### FLUXO ANTIGO (v12):
1. Upload XML
2. **Gestor preenche manualmente** todos os campos Neoformula
3. Sistema cadastra produtos
4. Dá entrada no estoque

### FLUXO NOVO (v13):
1. Upload XML
2. **Sistema cruza automaticamente** com produtos cadastrados
3. **Produtos encontrados** → Apenas entrada no estoque
4. **Produtos novos** → Cadastro automático com dados básicos da NF
5. **Gestor edita depois** (quando quiser) para completar dados Neoformula

---

## 📊 NOVA ESTRUTURA DE DADOS

### 1. ABA FORNECEDORES (NOVA!)

| Coluna | Nome | Tipo | Obrigatório | Descrição |
|--------|------|------|-------------|-----------|
| A | ID | UUID | Sim | Identificador único |
| B | Nome | Texto | Sim | Razão Social |
| C | Nome Fantasia | Texto | Não | Nome fantasia |
| D | CNPJ | Texto | Sim | CNPJ (único) |
| E | Telefone | Texto | Não | Telefone de contato |
| F | Email | Texto | Não | Email de contato |
| G | Endereço | Texto | Não | Endereço completo |
| H | Cidade | Texto | Não | Cidade |
| I | Estado | Texto | Não | UF (2 letras) |
| J | CEP | Texto | Não | CEP |
| K | Tipo Produtos | Texto | Sim | Papelaria / Limpeza / Ambos |
| L | Ativo | Texto | Sim | Sim / Não |
| M | Data Cadastro | Data | Sim | Data de cadastro |
| N | Observações | Texto | Não | Observações gerais |

**Como será preenchida:**
- Ao processar primeira NF de um fornecedor, sistema cadastra automaticamente
- Gestor pode editar depois para completar dados

---

### 2. ABA PRODUTOS (REESTRUTURADA!)

| Coluna | Nome | Tipo | Obrigatório | Origem | Descrição |
|--------|------|------|-------------|--------|-----------|
| A | ID | UUID | Sim | Sistema | Identificador único |
| B | Código Fornecedor | Texto | Sim | XML NF | Código do produto conforme fornecedor |
| C | Descrição Fornecedor | Texto | Sim | XML NF | Descrição conforme fornecedor |
| D | Fornecedor ID | UUID | Sim | Sistema | FK para aba Fornecedores |
| E | Código Neoformula | Texto | **NÃO** | Gestor | Código interno (preenchido depois) |
| F | Descrição Neoformula | Texto | **NÃO** | Gestor | Descrição interna (preenchido depois) |
| G | Tipo | Texto | Sim | XML NF | Papelaria / Limpeza |
| H | Categoria | Texto | Não | Gestor | Categoria interna |
| I | Unidade | Texto | Sim | XML NF | UN, CX, PCT, etc. |
| J | Preço Unitário | Número | Sim | Sistema | Custo médio ponderado |
| K | Estoque Mínimo | Número | Não | Gestor | Estoque mínimo |
| L | Ponto de Pedido | Número | Não | Gestor | Ponto de pedido |
| M | ImagemURL | Texto | Não | Gestor | URL da imagem do Drive |
| N | NCM | Texto | Não | XML NF | Código NCM (8 dígitos) |
| O | Ativo | Texto | Sim | Sistema | Sim / Não |
| P | Data Cadastro | Data | Sim | Sistema | Data de cadastro |
| Q | Origem | Texto | Sim | Sistema | **MANUAL** ou **NF** |
| R | Dados Completos | Texto | Sim | Sistema | **SIM** ou **NÃO** |

**MUDANÇAS IMPORTANTES:**
- ✅ **Coluna D (Fornecedor ID)**: Agora é FK, não mais texto livre
- ✅ **Colunas E e F**: Agora são OPCIONAIS (eram obrigatórias na v12)
- ✅ **Coluna Q (Origem)**: Identifica como produto foi cadastrado
- ✅ **Coluna R (Dados Completos)**: Indica se tem dados Neoformula preenchidos

---

## 🔄 COMO FAZER A MIGRAÇÃO

### OPÇÃO 1: PLANILHA NOVA (RECOMENDADO)

Se você está começando ou tem poucos dados:

```javascript
// No Apps Script Editor, execute:
setupPlanilhaManual()
```

Isso criará todas as abas com a estrutura v13.

---

### OPÇÃO 2: ATUALIZAR PLANILHA EXISTENTE

Se você já tem produtos cadastrados:

#### PASSO 1: Backup
```
Arquivo → Fazer uma cópia
```
Salve com nome: "BACKUP - [DATA] - Antes v13"

#### PASSO 2: Adicionar Aba Fornecedores

1. Crie manualmente uma nova aba chamada **"Fornecedores"**
2. Adicione cabeçalhos (linha 1):
   ```
   ID | Nome | Nome Fantasia | CNPJ | Telefone | Email | Endereço | Cidade | Estado | CEP | Tipo Produtos | Ativo | Data Cadastro | Observações
   ```

#### PASSO 3: Adicionar Colunas na Aba Produtos

**Verificar colunas atuais:**
- Se você está na v12, já deve ter 17 colunas (A-Q)
- Se está na v10 ou anterior, tem menos colunas

**Adicionar as seguintes colunas:**

**DEPOIS da coluna C (Descrição Fornecedor)**, insira:
- **Coluna D**: "Fornecedor ID"

**DEPOIS da coluna P (Data Cadastro)**, insira:
- **Coluna Q**: "Origem"
- **Coluna R**: "Dados Completos"

**REMOVER** (se existir):
- Coluna "Fornecedor" (texto livre) → substituída por Fornecedor ID
- Coluna "Mapeamento Códigos" → não é mais necessária

#### PASSO 4: Preencher Dados das Novas Colunas

Execute este script no Apps Script Editor:

```javascript
function migrarDadosParaV13() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaProdutos = ss.getSheetByName('Produtos');

  if (!abaProdutos) {
    Logger.log('❌ Aba Produtos não encontrada');
    return;
  }

  const dados = abaProdutos.getDataRange().getValues();

  // Pular cabeçalho
  for (let i = 1; i < dados.length; i++) {
    const origem = dados[i][16] || 'MANUAL'; // Coluna Q
    const dadosCompletos = dados[i][17] || 'NÃO'; // Coluna R

    // Se origem está vazia, assumir MANUAL
    if (!dados[i][16]) {
      abaProdutos.getRange(i + 1, 17).setValue('MANUAL'); // Coluna Q
    }

    // Se dados completos está vazio
    if (!dados[i][17]) {
      // Verificar se tem código Neoformula e descrição Neoformula
      const temCodigoNeo = dados[i][4] && dados[i][4].toString().trim() !== ''; // Coluna E
      const temDescNeo = dados[i][5] && dados[i][5].toString().trim() !== ''; // Coluna F

      if (temCodigoNeo && temDescNeo) {
        abaProdutos.getRange(i + 1, 18).setValue('SIM'); // Coluna R
      } else {
        abaProdutos.getRange(i + 1, 18).setValue('NÃO'); // Coluna R
      }
    }
  }

  Logger.log('✅ Migração concluída! Verifique as colunas Q e R.');
}
```

Execute: `migrarDadosParaV13()`

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após a migração, verifique:

### Aba Fornecedores:
- [ ] Aba existe
- [ ] Tem 14 colunas (A-N)
- [ ] Cabeçalhos corretos
- [ ] Formatação com fundo verde (#00A651)

### Aba Produtos:
- [ ] Tem 18 colunas (A-R)
- [ ] Coluna D: "Fornecedor ID"
- [ ] Coluna Q: "Origem"
- [ ] Coluna R: "Dados Completos"
- [ ] Produtos existentes têm Origem = "MANUAL"
- [ ] Produtos com dados Neoformula têm Dados Completos = "SIM"

### Testando o Novo Fluxo:
- [ ] Cadastre um fornecedor manualmente (ou deixe o sistema criar automaticamente)
- [ ] Importe um XML de NF
- [ ] Verifique se produtos foram cadastrados automaticamente
- [ ] Verifique se entrada de estoque foi feita
- [ ] Edite um produto cadastrado via NF e complete os dados Neoformula

---

## 🔧 TROUBLESHOOTING

### Erro: "Coluna não encontrada"
**Solução**: Verifique se as colunas foram criadas na ordem correta. Use o script de migração acima.

### Produtos duplicados após importar XML
**Solução**: O sistema de cruzamento pode não estar funcionando. Verifique se:
- Código do fornecedor está preenchido
- Fornecedor ID está correto

### Fornecedor não cadastrado automaticamente
**Solução**: Certifique-se de que o CNPJ no XML está correto. O sistema usa o CNPJ para identificar fornecedores.

---

## 📞 SUPORTE

Se encontrar problemas durante a migração:

1. Verifique os logs: `Ver → Logs`
2. Revise o arquivo [IMPLEMENTACAO_V13.md](IMPLEMENTACAO_V13.md) (será criado)
3. Faça rollback para o backup se necessário

---

## 🎯 PRÓXIMOS PASSOS

Após a migração bem-sucedida:

1. Teste o novo fluxo com um XML real
2. Treine a equipe no novo processo
3. Estabeleça rotina de completar dados Neoformula dos produtos cadastrados via NF
4. Monitore produtos com "Dados Completos = NÃO" e vá completando aos poucos
