# 📋 CHANGELOG v16.0 - FASE 3.1: Correções Críticas do Sistema de Estoque Reservado

## 🎯 Resumo da FASE 3.1

Correções críticas para garantir que o sistema de estoque reservado registre todas as movimentações corretamente.

**Data**: 2025-11-28
**Status**: ✅ Deployed

---

## 🐛 Problemas Identificados

### 1. ❌ Movimentações Não Sendo Registradas

**Sintoma**:
- Reserva de estoque funcionava (coluna Qtd Reservada atualizava)
- MAS nenhuma movimentação era registrada na aba "Movimentações Estoque"
- Nem RESERVA, nem LIBERACAO_RESERVA, nem SAIDA apareciam

**Causa Raiz**:
`registrarMovimentacao()` em [05.controleEstoque.js:620](05.controleEstoque.js#L620) só aceitava 3 tipos:
```javascript
const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE'];
```

As chamadas para registrar 'RESERVA' e 'LIBERACAO_RESERVA' eram **rejeitadas silenciosamente**!

---

### 2. ❌ Baixa de Estoque Não Funcionava

**Sintoma**:
- Ao alterar status de pedido para "Concluído", nada acontecia
- Estoque não era baixado
- Nenhuma movimentação SAIDA era criada

**Causa Raiz**:
[01.config.js:185-196](01.config.js#L185-L196) tinha:
```javascript
STATUS_PEDIDO: {
  FINALIZADO: 'Finalizado'  // ❌ ERRADO
}
```

Mas o sistema real usa `'Concluído'` (com acento), não `'Finalizado'`!

O código em [04.gerenciamentoPedidos.js:536](04.gerenciamentoPedidos.js#L536) verificava:
```javascript
if (novoStatus === CONFIG.STATUS_PEDIDO.FINALIZADO) // 'Finalizado'
```

Mas o status real era `'Concluído'`, então **nunca entrava** na condição!

---

## 🔧 Correções Implementadas

### Correção 1: Tipos de Movimentação Expandidos

**Arquivo**: [05.controleEstoque.js:620-626](05.controleEstoque.js#L620-L626)

**ANTES**:
```javascript
const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE'];
if (!tiposValidos.includes(dados.tipo)) {
  return {
    success: false,
    error: 'Tipo inválido. Use: ENTRADA, SAIDA ou AJUSTE'
  };
}
```

**DEPOIS**:
```javascript
// v16.0: Adicionados tipos RESERVA, LIBERACAO_RESERVA e INVENTARIO
const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA', 'INVENTARIO'];
if (!tiposValidos.includes(dados.tipo)) {
  return {
    success: false,
    error: 'Tipo inválido. Use: ENTRADA, SAIDA, AJUSTE, RESERVA, LIBERACAO_RESERVA ou INVENTARIO'
  };
}
```

**Benefício**: Agora aceita todos os 6 tipos de movimentação!

---

### Correção 2: Lógica de Atualização de Estoque

**Arquivo**: [05.controleEstoque.js:698-731](05.controleEstoque.js#L698-L731)

**PROBLEMA**:
A função `registrarMovimentacao()` estava tentando atualizar `qtdAtual` para RESERVA e LIBERACAO_RESERVA, mas essas operações só devem atualizar `qtdReservada`.

**SOLUÇÃO**:
```javascript
// 3. Calcular novo estoque
let novoEstoque = estoqueAtualAntes;

// v16.0: RESERVA e LIBERACAO_RESERVA não alteram qtdAtual
// (isso é feito nas funções específicas reservarEstoquePedido/liberarEstoquePedido/baixarEstoquePedido)
if (dados.tipo === 'ENTRADA') {
  novoEstoque += Math.abs(dados.quantidade);
} else if (dados.tipo === 'SAIDA') {
  novoEstoque -= Math.abs(dados.quantidade);
} else if (dados.tipo === 'AJUSTE') {
  // Para ajuste, a quantidade pode ser positiva ou negativa
  novoEstoque += dados.quantidade;
} else if (dados.tipo === 'INVENTARIO') {
  // Inventário define o valor absoluto
  novoEstoque = Math.abs(dados.quantidade);
}
// RESERVA e LIBERACAO_RESERVA não alteram qtdAtual, apenas registram a movimentação

// Não permitir estoque negativo (exceto para RESERVA/LIBERACAO_RESERVA que não alteram estoque)
if (novoEstoque < 0 && !['RESERVA', 'LIBERACAO_RESERVA'].includes(dados.tipo)) {
  Logger.log(`⚠️ Estoque ficaria negativo: ${novoEstoque}`);
  return {
    success: false,
    error: `Estoque insuficiente. Disponível: ${estoqueAtualAntes}, Solicitado: ${Math.abs(dados.quantidade)}`
  };
}

// 4. Atualizar estoque (v16.0: RESERVA e LIBERACAO_RESERVA não atualizam qtdAtual)
if (!['RESERVA', 'LIBERACAO_RESERVA'].includes(dados.tipo)) {
  abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL).setValue(novoEstoque);
  abaEstoque.getRange(linhaEstoque, CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL).setValue(novoEstoque);
}
```

**Benefício**:
- RESERVA/LIBERACAO_RESERVA **registram a movimentação** mas **não alteram qtdAtual**
- A atualização de qtdReservada continua sendo feita nas funções específicas
- INVENTARIO agora suportado (define valor absoluto)

---

### Correção 3: Status "Concluído" vs "Finalizado"

**Arquivo**: [01.config.js:179-198](01.config.js#L179-L198)

**ANTES**:
```javascript
STATUS_PEDIDOS: {
  SOLICITADO: 'Solicitado',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  EM_COMPRA: 'Em Compra',
  AGUARDANDO_ENTREGA: 'Aguardando Entrega',
  FINALIZADO: 'Finalizado',  // ❌ ERRADO
  CANCELADO: 'Cancelado'
},
```

**DEPOIS**:
```javascript
STATUS_PEDIDOS: {
  SOLICITADO: 'Solicitado',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  EM_COMPRA: 'Em Compra',
  AGUARDANDO_ENTREGA: 'Aguardando Entrega',
  FINALIZADO: 'Concluído',      // v16.0: Corrigido de 'Finalizado' para 'Concluído'
  CANCELADO: 'Cancelado'
},
```

**Benefício**: Agora o código reconhece corretamente quando um pedido está "Concluído" e aciona a baixa de estoque!

---

## 🔄 Fluxo Corrigido

### Cenário: Pedido de 5 unidades do Produto X

**Estado Inicial**:
```
Produto X:
  qtdAtual: 20
  qtdReservada: 0
  qtdDisponivel: 20
```

### 1️⃣ Criar Pedido (Status: Solicitado)

**Ação**: `reservarEstoquePedido()`

**Estoque Após**:
```
Produto X:
  qtdAtual: 20
  qtdReservada: 5
  qtdDisponivel: 15
```

**Movimentação Registrada**: ✅ AGORA FUNCIONA!
```
ID: MOV-1234567890
Tipo: RESERVA
Quantidade: 5
Pedido ID: PED-2025-001
Estoque Anterior: 20
Estoque Atual: 20 (não mudou)
```

---

### 2️⃣ Opção A: Cancelar Pedido

**Ação**: `liberarEstoquePedido()`

**Estoque Após**:
```
Produto X:
  qtdAtual: 20
  qtdReservada: 0
  qtdDisponivel: 20
```

**Movimentação Registrada**: ✅ AGORA FUNCIONA!
```
Tipo: LIBERACAO_RESERVA
Quantidade: 5
Pedido ID: PED-2025-001
```

---

### 2️⃣ Opção B: Concluir Pedido (Status: Concluído)

**Ação**: `baixarEstoquePedido()` - ✅ AGORA DISPARA!

**Estoque Após**:
```
Produto X:
  qtdAtual: 15 (diminuiu)
  qtdReservada: 0
  qtdDisponivel: 15
```

**Movimentação Registrada**: ✅ AGORA FUNCIONA!
```
Tipo: SAIDA
Quantidade: 5
Pedido ID: PED-2025-001
Estoque Anterior: 20
Estoque Atual: 15
```

---

## 📊 Tipos de Movimentação Suportados

Agora o sistema suporta **6 tipos**:

| Tipo | Altera qtdAtual | Altera qtdReservada | Quando Usar |
|------|----------------|---------------------|-------------|
| **ENTRADA** | ✅ Aumenta | ❌ Não | Compra de produtos, devolução |
| **SAIDA** | ✅ Diminui | ❌ Não | Finalização de pedido |
| **AJUSTE** | ✅ +/- | ❌ Não | Correção manual de estoque |
| **INVENTARIO** | ✅ Define valor | ❌ Não | Contagem física de estoque |
| **RESERVA** | ❌ Não | ✅ Aumenta | Criação de pedido |
| **LIBERACAO_RESERVA** | ❌ Não | ✅ Diminui | Cancelamento de pedido |

---

## 🧪 Como Testar (Atualizado)

### Teste 1: Criar Pedido e Verificar Movimentação

1. Vá em **Estoque**, anote qtdAtual, qtdReservada, qtdDisponivel
2. Crie **Novo Pedido** com 3 unidades de um produto
3. Volte em **Estoque**:
   - ✅ qtdAtual: inalterada
   - ✅ qtdReservada: +3
   - ✅ qtdDisponivel: -3
4. Vá em **Movimentações Estoque**:
   - ✅ **NOVA LINHA** aparece!
   - ✅ Tipo: **RESERVA**
   - ✅ Quantidade: 3
   - ✅ Pedido ID: PED-xxxx
   - ✅ Estoque Anterior = Estoque Atual (não mudou)

---

### Teste 2: Cancelar Pedido

1. Com pedido criado no Teste 1
2. Vá em **Pedidos** → **Cancelar Pedido**
3. Vá em **Movimentações Estoque**:
   - ✅ **NOVA LINHA** aparece!
   - ✅ Tipo: **LIBERACAO_RESERVA**
   - ✅ Quantidade: 3
4. Volte em **Estoque**:
   - ✅ qtdReservada: voltou a 0
   - ✅ qtdDisponivel: voltou ao valor original

---

### Teste 3: Concluir Pedido

1. Crie **Novo Pedido** com 5 unidades
2. Anote qtdAtual do estoque (ex: 20)
3. Como **Gestor**, vá em **Pedidos**
4. Altere status para **Concluído**
5. Vá em **Movimentações Estoque**:
   - ✅ **NOVA LINHA** aparece!
   - ✅ Tipo: **SAIDA**
   - ✅ Quantidade: 5
   - ✅ Estoque Anterior: 20
   - ✅ Estoque Atual: 15
6. Volte em **Estoque**:
   - ✅ qtdAtual: 15 (diminuiu 5)
   - ✅ qtdReservada: 0
   - ✅ qtdDisponivel: 15

---

## 📦 Arquivos Modificados

### Backend
- ✅ [01.config.js:179-198](01.config.js#L179-L198) - Corrigido STATUS_PEDIDO.FINALIZADO
- ✅ [05.controleEstoque.js:620-731](05.controleEstoque.js#L620-L731) - Tipos válidos + lógica RESERVA

### Documentação
- ✅ [CHANGELOG_V16.0_FASE3.1.md](CHANGELOG_V16.0_FASE3.1.md) (NOVO)

---

## ✅ Checklist de Validação FASE 3.1

- [x] registrarMovimentacao() aceita RESERVA
- [x] registrarMovimentacao() aceita LIBERACAO_RESERVA
- [x] registrarMovimentacao() aceita INVENTARIO
- [x] RESERVA não altera qtdAtual
- [x] LIBERACAO_RESERVA não altera qtdAtual
- [x] CONFIG.STATUS_PEDIDO.FINALIZADO = 'Concluído'
- [x] Baixa de estoque dispara ao alterar para Concluído
- [x] Deploy realizado

---

## 🚨 Impacto das Correções

### Antes (v16.0 FASE 3)
- ❌ Nenhuma movimentação registrada
- ❌ Aba "Movimentações Estoque" vazia
- ❌ Impossível rastrear histórico
- ❌ Status "Concluído" não baixava estoque

### Depois (v16.0 FASE 3.1)
- ✅ Todas movimentações registradas
- ✅ RESERVA registrada ao criar pedido
- ✅ LIBERACAO_RESERVA registrada ao cancelar
- ✅ SAIDA registrada ao concluir
- ✅ Histórico completo de todas operações
- ✅ Status "Concluído" funciona corretamente

---

**Versão**: 16.0 FASE 3.1
**Data**: 2025-11-28
**Status**: ✅ Deployed e Testado

🤖 Generated with [Claude Code](https://claude.com/claude-code)
