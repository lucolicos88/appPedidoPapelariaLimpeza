# 🧪 Como Usar o Sistema de Testes - v16.0

## 📋 Acesso Rápido

O sistema de testes agora está integrado ao menu da planilha!

### Como Acessar

1. Abra sua planilha Google Sheets
2. Clique no menu **📦 Sistema de Pedidos**
3. Vá em **🧪 Testes**
4. Escolha o teste desejado

---

## 🎯 Testes Disponíveis

### ▶️ EXECUTAR TODOS OS TESTES

Executa **todos** os testes automatizados em sequência.

- **Tempo estimado**: 2-5 minutos
- **O que faz**: Valida Dashboard, Catálogo, Estoque, Movimentações, Performance, etc.
- **Resultado**: Mostra quantos testes passaram/falharam

**Quando usar**: Após fazer deploy de novas mudanças ou para validação completa.

---

### ✅ Teste 01: Dashboard KPIs

Valida todos os KPIs do Dashboard:
- KPIs Financeiros (total pedidos, valor total, etc.)
- KPIs Logísticos (tempo médio, taxa conclusão, etc.)
- KPIs Estoque (produtos em estoque, estoque reservado, etc.)

**Verifica**: Se há valores `null` nos KPIs (bug comum de índices hardcoded)

---

### 🛒 Teste 02: Catálogo de Produtos

Valida o sistema de catálogo:
- Carrega produtos ativos
- Produtos sem código NEO aparecem
- Sistema de imagens funciona

**Verifica**: Se o catálogo lista todos os produtos corretamente

---

### 🏢 Teste 03: Múltiplos Fornecedores

Valida o agrupamento por código NEO:
- Produtos com mesmo código NEO agrupam fornecedores
- Cada fornecedor tem preço e imagem

**Verifica**: Se o sistema v15.0 de múltiplos fornecedores funciona

---

### 🔒 Teste 04: Estoque Reservado

Valida a estrutura do sistema de estoque reservado (v16.0):
- Verifica se aba Estoque tem 8 colunas
- Verifica se colunas "Quantidade Reservada" e "Estoque Disponível" existem

⚠️ **IMPORTANTE**: Este teste **NÃO** executa reserva/liberação/baixa automaticamente.
Para testar essas operações, você deve:
1. Criar um pedido manualmente
2. Cancelar/Concluir o pedido
3. Verificar movimentações na aba "Movimentações Estoque"

---

### 📝 Teste 05: Validação de Pedidos

Testa as validações de entrada:
- Tipo de pedido inválido é bloqueado
- Quantidade negativa é bloqueada
- Pedido sem produtos é bloqueado

**Verifica**: Proteções de segurança

---

### 📊 Teste 08: Movimentações

Valida o sistema de movimentações de estoque:
- Verifica tipos de movimentação (ENTRADA, SAIDA, AJUSTE, RESERVA, LIBERACAO_RESERVA)
- Verifica rastreabilidade por pedido

**Verifica**: Se movimentações v16.0 estão sendo registradas

---

### ⚡ Teste 09: Performance e Cache

Testa o sistema de cache:
- Cache de usuários (getUserContext)
- Cache de produtos (buscarProduto)

**Verifica**: Se a segunda chamada é 10-50x mais rápida

---

### 🔒 Teste 10: Validações e Segurança

Testa validações de segurança:
- Data início > data fim é bloqueada
- Intervalo de datas > 2 anos é bloqueado

**Verifica**: Proteções do Dashboard

---

## 🔍 Como Ver os Resultados

### Opção 1: Durante o Teste

Cada teste mostra um **alerta** no final com o resultado:
- ✅ "Teste concluído!"
- Clique em "Testes > Ver Logs" para detalhes

### Opção 2: Ver Logs do Último Teste

1. Menu: **Sistema de Pedidos** > **🧪 Testes** > **🔍 Ver Logs do Último Teste**
2. Uma janela abrirá mostrando todos os logs do último teste executado

**Logs incluem**:
- ✅ Mensagens de sucesso
- ❌ Mensagens de erro
- ⚠️ Avisos
- 📊 Estatísticas

### Opção 3: Apps Script (Avançado)

1. Menu: **Extensões** > **Apps Script**
2. Execute a função de teste desejada
3. Veja os logs em: **Ver** > **Logs** (ou Ctrl+Enter)

---

## 🗑️ Limpar Cache (Reset)

**Menu**: Sistema de Pedidos > 🧪 Testes > 🗑️ Limpar Cache (Reset)

**O que faz**:
- Limpa cache de usuários
- Limpa cache de produtos
- Força o sistema a buscar dados novamente da planilha

**Quando usar**:
- Antes de testar performance
- Quando suspeitar que dados em cache estão desatualizados
- Após modificar dados na planilha

---

## 📊 Interpretando Resultados

### ✅ PASSOU

O teste validou corretamente a funcionalidade.

**Exemplo**:
```
✅ PASSOU: Todos KPIs financeiros OK
```

### ❌ FALHOU

O teste encontrou um problema.

**Exemplo**:
```
❌ FALHA: Encontrados valores null nos KPIs
```

**O que fazer**:
1. Veja os logs detalhados
2. Identifique qual KPI está null
3. Verifique o código correspondente

### ⚠️ AVISO

O teste rodou mas encontrou uma situação incomum (não necessariamente erro).

**Exemplo**:
```
⚠️ AVISO: Nenhum produto tem imagem cadastrada
```

**O que fazer**:
- Verifique se é esperado (ex: produtos sem imagem cadastrada)
- Se não for esperado, corrija

---

## 🧪 Executar Todos os Testes - Resumo

Quando você executa **▶️ EXECUTAR TODOS OS TESTES**:

1. **Confirmação**: Sistema pede confirmação (2-5 minutos)
2. **Execução**: Cada teste roda em sequência com logs detalhados
3. **Resumo**: Ao final, mostra:
   ```
   ✅ Passaram: 14/15
   ❌ Falharam: 1/15
   ⏱️ Tempo total: 45.32s
   ```

**Lista de testes executados**:
1. Verificação da Estrutura
2. Dashboard - KPIs Financeiros
3. Dashboard - KPIs Logísticos
4. Dashboard - KPIs Estoque
5. Catálogo - Carrega Produtos
6. Catálogo - Produtos Sem NEO
7. Catálogo - Imagens
8. Múltiplos Fornecedores - Agrupamento NEO
9. Estoque Reservado - Estrutura
10. Validação de Pedidos
11. Movimentações - Tipos
12. Movimentações - Rastreabilidade
13. Performance - Cache Usuários
14. Performance - Cache Produtos
15. Segurança - Validação Datas

---

## 🚀 Exemplo de Uso Prático

### Cenário: Após Deploy de v16.0 FASE 3.4

1. Faça `clasp push` para deploy
2. Abra a planilha
3. Menu: **Sistema de Pedidos** > **🧪 Testes** > **▶️ EXECUTAR TODOS OS TESTES**
4. Aguarde 2-5 minutos
5. Verifique resultado:
   - Se **15/15 passaram**: ✅ Deploy bem-sucedido!
   - Se **algum falhou**: ❌ Veja logs e corrija

### Cenário: Testar Apenas Estoque Reservado

1. Menu: **Sistema de Pedidos** > **🧪 Testes** > **🔒 Teste 04: Estoque Reservado**
2. Veja resultado: Estrutura OK?
3. **Teste manual**:
   - Crie um pedido → Veja RESERVA em Movimentações
   - Cancele pedido → Veja LIBERACAO_RESERVA
   - Conclua pedido → Veja SAIDA

### Cenário: Verificar Performance do Cache

1. Menu: **Sistema de Pedidos** > **🧪 Testes** > **🗑️ Limpar Cache (Reset)**
2. Menu: **Sistema de Pedidos** > **🧪 Testes** > **⚡ Teste 09: Performance e Cache**
3. Veja logs:
   ```
   getUserContext - SEM CACHE: 234ms
   getUserContext - COM CACHE: 12ms
   ✅ Ganho de 19.5x em performance
   ```

---

## 📖 Documentação Completa

Para testes manuais detalhados e casos de uso avançados, consulte:

- **[GUIA_TESTES_V16.0_COMPLETO.md](GUIA_TESTES_V16.0_COMPLETO.md)** - Guia completo com 25+ testes

---

## ❓ Dúvidas Frequentes

### P: Por que o Teste 04 não testa reserva/liberação/baixa?

**R**: Essas operações requerem criar/cancelar/concluir pedidos, o que modifica dados reais da planilha. Por segurança, esses testes são **manuais** (veja GUIA_TESTES_V16.0_COMPLETO.md seções 4.2, 4.3, 4.4).

### P: Posso executar testes em produção?

**R**: Sim! Os testes automatizados são **somente leitura** (exceto cache). Eles **NÃO** modificam dados da planilha.

### P: O que fazer se todos os testes falharem?

**R**:
1. Verifique se fez `clasp push` recente
2. Recarregue a planilha (F5)
3. Tente: Menu > Sistema de Pedidos > 🔄 Recarregar Sistema
4. Veja logs detalhados em "Ver Logs do Último Teste"

### P: Posso adicionar meus próprios testes?

**R**: Sim! Edite o arquivo `11.testes_sistema.js` e adicione novas funções. Depois, inclua no menu em `01.setup.js` função `onOpen()`.

---

**Versão**: 16.0
**Arquivo**: 11.testes_sistema.js
**Data**: 2025-12-01

🤖 Generated with [Claude Code](https://claude.com/claude-code)
