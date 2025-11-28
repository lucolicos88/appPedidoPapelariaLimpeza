# 📋 PLANEJAMENTO v16.0 - Correções Críticas e Melhorias

## 🎯 Objetivos da Versão

### Problemas Críticos a Corrigir

1. **Dashboard com KPIs Zerados**
   - KPIs de Estoque estão zerados mesmo com 14 produtos
   - Causa: Cálculos usando índices de coluna incorretos após mudança para 18 colunas

2. **Erro ao Abrir Novo Pedido**
   - Erro: "catalogoAgrupado is not iterable"
   - Causa: `response.produtosAgrupados` pode ser objeto em vez de array

3. **Sistema de Estoque Reservado**
   - Implementar reserva automática quando pedido é criado
   - Liberar reserva quando pedido é cancelado
   - Baixar do estoque quando pedido é concluído

### Melhorias Solicitadas

4. **Sistema de Debug Melhorado**
   - Centralizar logs com níveis (INFO, WARN, ERROR, DEBUG)
   - Adicionar timestamps automáticos
   - Facilitar rastreamento de problemas

5. **Limpeza de Código**
   - Remover código obsoleto e não usado
   - Remover funções duplicadas
   - Remover módulos antigos

6. **Guia de Testes Completo**
   - Criar checklist de todas funcionalidades
   - Passo a passo para validação
   - Casos de teste para cada módulo

---

## 🔧 TAREFA 1: Corrigir KPIs Dashboard Zerados

### Problema
Os índices de coluna em `calcularKPIsEstoque()` estão errados após mudança para 18 colunas.

### Código Atual (ERRADO)
```javascript
// linha 435-438 de 06.dashboard_consolidado.js
const estoqueMinimo = parseFloat(produto[7]) || 0;  // ❌ ERRADO
const pontoPedido = parseFloat(produto[8]) || 0;     // ❌ ERRADO
const precoUnitario = parseFloat(produto[6]) || 0;   // ❌ ERRADO
const dataCadastro = produto[12] ? new Date(produto[12]) : null; // ❌ ERRADO
```

### Índices Corretos (CONFIG.COLUNAS_PRODUTOS)
```
PRECO_UNITARIO: 10 (coluna J) - índice 9
ESTOQUE_MINIMO: 11 (coluna K) - índice 10
PONTO_PEDIDO: 12 (coluna L) - índice 11
DATA_CADASTRO: 16 (coluna P) - índice 15
```

### Solução
```javascript
const estoqueMinimo = parseFloat(produto[CONFIG.COLUNAS_PRODUTOS.ESTOQUE_MINIMO - 1]) || 0;
const pontoPedido = parseFloat(produto[CONFIG.COLUNAS_PRODUTOS.PONTO_PEDIDO - 1]) || 0;
const precoUnitario = parseFloat(produto[CONFIG.COLUNAS_PRODUTOS.PRECO_UNITARIO - 1]) || 0;
const dataCadastro = produto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1] ? new Date(produto[CONFIG.COLUNAS_PRODUTOS.DATA_CADASTRO - 1]) : null;
```

---

## 🔧 TAREFA 2: Corrigir Erro "catalogoAgrupado is not iterable"

### Problema
`listarProdutosAgrupadosPorNeo()` pode retornar objeto em vez de array.

### Código Atual (03.gerenciamentoProdutos.js linha 904)
```javascript
function listarProdutosAgrupadosPorNeo() {
  // ...
  return agrupados; // ❌ Retorna objeto { "PAP-001": {...}, "LIM-001": {...} }
}
```

### Solução
```javascript
// Converter objeto para array no final
return Object.values(agrupados);
```

### No Wrapper (00.funcoes_wrapper.js)
```javascript
const produtosAgrupados = listarProdutosAgrupadosPorNeo();
// Garantir que é array
if (!Array.isArray(produtosAgrupados)) {
  produtosAgrupados = Object.values(produtosAgrupados);
}
```

---

## 🔧 TAREFA 3: Sistema de Estoque Reservado

### Fluxo Completo

#### 1. Criar Pedido (Status: SOLICITADO)
```javascript
// Ao criar pedido:
for (cada produto no pedido) {
  registrarMovimentacao({
    tipo: 'RESERVA',
    produtoId: produto.id,
    quantidade: quantidade,
    pedidoId: pedidoId
  });

  atualizarEstoque({
    produtoId: produto.id,
    reservar: quantidade  // Aumenta qtdReservada, diminui qtdDisponivel
  });
}
```

#### 2. Cancelar Pedido (Status: CANCELADO)
```javascript
// Ao cancelar pedido:
for (cada produto no pedido) {
  registrarMovimentacao({
    tipo: 'LIBERACAO_RESERVA',
    produtoId: produto.id,
    quantidade: quantidade,
    pedidoId: pedidoId
  });

  atualizarEstoque({
    produtoId: produto.id,
    liberar: quantidade  // Diminui qtdReservada, aumenta qtdDisponivel
  });
}
```

#### 3. Concluir Pedido (Status: FINALIZADO)
```javascript
// Ao concluir pedido:
for (cada produto no pedido) {
  registrarMovimentacao({
    tipo: 'SAIDA',
    produtoId: produto.id,
    quantidade: quantidade,
    pedidoId: pedidoId
  });

  atualizarEstoque({
    produtoId: produto.id,
    baixar: quantidade  // Diminui qtdReservada, diminui qtdAtual
  });
}
```

### Arquivos a Modificar
- `04.gerenciamentoPedidos.js` - Adicionar lógica de reserva/liberação
- `05.controleEstoque.js` - Funções `reservarEstoque()`, `liberarEstoque()`, `baixarEstoque()`

---

## 🔧 TAREFA 4: Sistema de Debug Melhorado

### Criar Módulo Centralizado: `00.debug_logger.js`

```javascript
/**
 * Sistema de Logging Centralizado v16.0
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS.INFO; // Configurável

function log(level, moduleName, message, data) {
  if (level < CURRENT_LOG_LEVEL) return;

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss.SSS');
  const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
  const emoji = { DEBUG: '🔍', INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' }[levelName];

  const logMessage = `${emoji} [${timestamp}] [${levelName}] [${moduleName}] ${message}`;

  Logger.log(logMessage);
  if (data) {
    Logger.log('   Data: ' + JSON.stringify(data, null, 2));
  }
}

// Funções de conveniência
function logDebug(module, message, data) { log(LOG_LEVELS.DEBUG, module, message, data); }
function logInfo(module, message, data) { log(LOG_LEVELS.INFO, module, message, data); }
function logWarn(module, message, data) { log(LOG_LEVELS.WARN, message, data); }
function logError(module, message, error) {
  log(LOG_LEVELS.ERROR, module, message);
  if (error) {
    Logger.log('   Error: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
  }
}
```

### Uso
```javascript
// Antes:
Logger.log('🔄 __getDashboardAvancado chamado');

// Depois:
logInfo('Dashboard', 'getDashboardAvancado chamado', { filtros: filtros });
```

---

## 🔧 TAREFA 5: Limpeza de Código

### Arquivos a Revisar

1. **99.dados_ficticios.js** - Verificar se ainda é usado
2. **99.dados_ficticios_v2.js** - Consolidar com o anterior ou remover
3. **99.teste_debug.js** - Mover para pasta de testes
4. **Funções duplicadas** em diferentes módulos

### Buscar e Remover
- Funções declaradas mas nunca chamadas
- Variáveis globais não utilizadas
- Comentários de debug antigos (console.log comentados)
- Código comentado (// código antigo)

---

## 🔧 TAREFA 6: Guia de Testes v16.0

Criar arquivo: `GUIA_TESTES_V16.0.md`

### Estrutura
1. **Pré-requisitos**
2. **Testes de Produtos**
3. **Testes de Fornecedores**
4. **Testes de Pedidos (com Estoque)**
5. **Testes de Estoque**
6. **Testes de Dashboard**
7. **Testes de Relatórios**
8. **Testes de Notas Fiscais**

Cada seção com:
- ✅ Checklist passo a passo
- 📊 Resultado esperado
- ❌ Problemas conhecidos
- 🔄 Como reportar bugs

---

## 📦 Resumo de Arquivos Modificados

### Backend
- ✅ `00.debug_logger.js` (NOVO) - Sistema de logging
- ✅ `00.funcoes_wrapper.js` - Fix catalogoAgrupado
- ✅ `03.gerenciamentoProdutos.js` - Fix listarProdutosAgrupadosPorNeo
- ✅ `04.gerenciamentoPedidos.js` - Sistema de reserva de estoque
- ✅ `05.controleEstoque.js` - Funções reservar/liberar/baixar
- ✅ `06.dashboard_consolidado.js` - Fix índices de colunas

### Frontend
- ✅ `Index.html` - Fix error handling catalogoAgrupado

### Documentação
- ✅ `GUIA_TESTES_V16.0.md` (NOVO)
- ✅ `CHANGELOG_V16.0.md` (NOVO)

---

## ⏱️ Estimativa de Tempo

| Tarefa | Tempo Estimado |
|--------|----------------|
| 1. Fix KPIs Dashboard | 30 min |
| 2. Fix catalogoAgrupado | 15 min |
| 3. Sistema Estoque Reservado | 2h |
| 4. Sistema Debug | 1h |
| 5. Limpeza Código | 1h |
| 6. Guia Testes | 1h |
| **TOTAL** | **~6 horas** |

---

## ✅ Checklist Final v16.0

- [ ] KPIs Dashboard mostrando valores corretos
- [ ] Novo pedido abre sem erro
- [ ] Estoque reserva ao criar pedido
- [ ] Estoque libera ao cancelar pedido
- [ ] Estoque baixa ao concluir pedido
- [ ] Sistema de debug funcionando
- [ ] Código limpo sem obsoletos
- [ ] Guia de testes completo
- [ ] Deploy realizado
- [ ] Documentação atualizada

---

**Versão**: 16.0
**Data Planejamento**: 2025-11-28
**Status**: 🚧 Em Desenvolvimento
