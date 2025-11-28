# 📋 CHANGELOG v16.0 - FASE 2

## 🎯 Resumo da FASE 2

Correções adicionais para KPIs do Dashboard e sistema de catálogo de produtos.

**Data**: 2025-11-28
**Status**: ✅ Deployed

---

## 🔧 Correções Implementadas

### 1. ✅ Catálogo de Produtos - Removido Filtro Restritivo

**Arquivo**: [00.funcoes_wrapper.js:293-327](00.funcoes_wrapper.js#L293-L327)

**Problema**:
- Catálogo exigia `codigoNeoPreenchido: true` e `descricaoNeoPreenchida: true`
- Isso filtrava TODOS os produtos que não tinham códigos NEO cadastrados
- Modal abria mas mostrava "Nenhum produto encontrado"

**Solução**:
```javascript
// ANTES (v16.0 FASE 1):
const filtros = {
  ativo: 'Sim',
  codigoNeoPreenchido: true,      // ❌ Filtro muito restritivo
  descricaoNeoPreenchida: true    // ❌ Filtro muito restritivo
};

// DEPOIS (v16.0 FASE 2):
const filtros = {
  ativo: 'Sim'  // ✅ Lista TODOS os produtos ativos
};
```

**Benefício**:
- Produtos sem código NEO agora aparecem normalmente no catálogo
- Compatibilidade com produtos antigos da v14.x
- Sistema de múltiplos fornecedores funciona para produtos com NEO preenchido
- Produtos sem NEO funcionam como antes (1 fornecedor = 1 produto)

---

### 2. ✅ Dashboard - Corrigidos TODOS os Índices Hardcoded

#### 2.1. Função `calcularKPIsFinanceiros()`

**Arquivo**: [06.dashboard_consolidado.js:174-205](06.dashboard_consolidado.js#L174-L205)

**Problema**: Índices hardcoded ao processar pedidos

**Solução**:
```javascript
// ANTES:
const valor = parseFloat(pedido[8]) || 0;
const tipo = pedido[2];
const setor = pedido[5];
const status = pedido[9];
const data = new Date(pedido[10]);
const produtos = (pedido[6] || '').toString().split('; ');
const quantidades = (pedido[7] || '').toString().split('; ');

// DEPOIS:
const valor = parseFloat(pedido[CONFIG.COLUNAS_PEDIDOS.VALOR_TOTAL - 1]) || 0;
const tipo = pedido[CONFIG.COLUNAS_PEDIDOS.TIPO - 1];
const setor = pedido[CONFIG.COLUNAS_PEDIDOS.SETOR - 1];
const status = pedido[CONFIG.COLUNAS_PEDIDOS.STATUS - 1];
const data = new Date(pedido[CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1]);
const produtos = (pedido[CONFIG.COLUNAS_PEDIDOS.PRODUTOS - 1] || '').toString().split('; ');
const quantidades = (pedido[CONFIG.COLUNAS_PEDIDOS.QUANTIDADES - 1] || '').toString().split('; ');
```

#### 2.2. Função `calcularKPIsLogisticos()`

**Arquivo**: [06.dashboard_consolidado.js:315-322](06.dashboard_consolidado.js#L315-L322)

**Problema**: Índices hardcoded ao processar datas e solicitantes

**Solução**:
```javascript
// ANTES:
const status = pedido[9];
const dataSolicitacao = new Date(pedido[10]);
const dataCompra = pedido[11] ? new Date(pedido[11]) : null;
const dataFinalizacao = pedido[12] ? new Date(pedido[12]) : null;
const prazoEntrega = pedido[13] ? new Date(pedido[13]) : null;
const solicitante = pedido[3];

// DEPOIS:
const status = pedido[CONFIG.COLUNAS_PEDIDOS.STATUS - 1];
const dataSolicitacao = new Date(pedido[CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1]);
const dataCompra = pedido[CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA - 1] ? new Date(pedido[CONFIG.COLUNAS_PEDIDOS.DATA_COMPRA - 1]) : null;
const dataFinalizacao = pedido[CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO - 1] ? new Date(pedido[CONFIG.COLUNAS_PEDIDOS.DATA_FINALIZACAO - 1]) : null;
const prazoEntrega = pedido[CONFIG.COLUNAS_PEDIDOS.PRAZO_ENTREGA - 1] ? new Date(pedido[CONFIG.COLUNAS_PEDIDOS.PRAZO_ENTREGA - 1]) : null;
const solicitante = pedido[CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_EMAIL - 1];
```

#### 2.3. Função `calcularKPIsEstoque()`

**Arquivo**: [06.dashboard_consolidado.js:491-494](06.dashboard_consolidado.js#L491-L494)

**Problema**: Índices hardcoded ao processar produtos por pedido

**Solução**:
```javascript
// ANTES:
const produtos = (pedido[6] || '').toString().split('; ');
const quantidades = (pedido[7] || '').toString().split('; ');

// DEPOIS:
const produtos = (pedido[CONFIG.COLUNAS_PEDIDOS.PRODUTOS - 1] || '').toString().split('; ');
const quantidades = (pedido[CONFIG.COLUNAS_PEDIDOS.QUANTIDADES - 1] || '').toString().split('; ');
```

#### 2.4. Função `calcularPrevisaoReposicao()`

**Arquivo**: [06.dashboard_consolidado.js:625-630](06.dashboard_consolidado.js#L625-L630)

**Problema**: Índices hardcoded ao buscar dados de produtos

**Solução**:
```javascript
// ANTES:
const produtoId = produto[0];
const produtoNome = produto[1];

// DEPOIS:
const produtoId = produto[CONFIG.COLUNAS_PRODUTOS.ID - 1];
const descricaoNeo = produto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_NEOFORMULA - 1];
const descricaoFornecedor = produto[CONFIG.COLUNAS_PRODUTOS.DESCRICAO_FORNECEDOR - 1];
const produtoNome = descricaoNeo || descricaoFornecedor || 'Sem descrição';
```

---

### 3. ✅ Logs de Debug Aprimorados

**Arquivo**: [00.funcoes_wrapper.js:295-327](00.funcoes_wrapper.js#L295-L327)

**Adicionados Logs Detalhados**:
```javascript
Logger.log('🔍 v16.0: Carregando todos os produtos ativos...');
Logger.log(`📦 Produtos ativos carregados: ${resultadoProdutos.produtos.length}`);
Logger.log('🔄 Agrupando produtos por código NEO...');
Logger.log(`✅ Produtos agrupados: ${produtosAgrupados.length}`);

if (produtosAgrupados.length > 0) {
  Logger.log('📋 Primeiro produto agrupado: ' + JSON.stringify(produtosAgrupados[0]));
} else {
  Logger.log('⚠️ ATENÇÃO: Array de produtos agrupados está vazio!');
}
```

**Benefício**:
- Rastreamento completo do carregamento do catálogo
- Identificação imediata de problemas com produtos agrupados
- Debug mais fácil para futuras manutenções

---

## 📊 Impacto das Correções

### Dashboard KPIs
✅ **KPIs Financeiros** - Todos os índices corrigidos
✅ **KPIs Logísticos** - Todos os índices corrigidos
✅ **KPIs Estoque** - Já corrigidos na FASE 1
✅ **Previsão de Reposição** - Índices corrigidos

### Catálogo de Produtos
✅ **Produtos sem NEO** - Agora aparecem normalmente
✅ **Produtos com NEO** - Agrupamento por fornecedor funcional
✅ **Compatibilidade** - v14.x e v15.x totalmente compatíveis

---

## 🔍 Mapeamento de Índices (CONFIG)

### COLUNAS_PEDIDOS (15 colunas - A até O)
```javascript
ID: 1                    // A
NUMERO_PEDIDO: 2         // B
TIPO: 3                  // C
SOLICITANTE_EMAIL: 4     // D
SOLICITANTE_NOME: 5      // E
SETOR: 6                 // F
PRODUTOS: 7              // G
QUANTIDADES: 8           // H
VALOR_TOTAL: 9           // I
STATUS: 10               // J
DATA_SOLICITACAO: 11     // K
DATA_COMPRA: 12          // L
DATA_FINALIZACAO: 13     // M
PRAZO_ENTREGA: 14        // N
OBSERVACOES: 15          // O
```

### COLUNAS_PRODUTOS (18 colunas - A até R)
```javascript
ID: 1                       // A
CODIGO_FORNECEDOR: 2        // B
DESCRICAO_FORNECEDOR: 3     // C
FORNECEDOR_ID: 4            // D
CODIGO_NEOFORMULA: 5        // E (v15.0)
DESCRICAO_NEOFORMULA: 6     // F (v15.0)
TIPO: 7                     // G
CATEGORIA: 8                // H
UNIDADE: 9                  // I
PRECO_UNITARIO: 10          // J
ESTOQUE_MINIMO: 11          // K
PONTO_PEDIDO: 12            // L
IMAGEM_URL: 13              // M
NCM: 14                     // N
ATIVO: 15                   // O
DATA_CADASTRO: 16           // P
ORIGEM: 17                  // Q
DADOS_COMPLETOS: 18         // R
```

---

## ✅ Checklist de Validação FASE 2

- [x] Dashboard carrega sem null
- [x] KPIs Financeiros calculando valores corretos
- [x] KPIs Logísticos calculando valores corretos
- [x] KPIs Estoque calculando valores corretos
- [x] Previsão de reposição usando nomes corretos
- [x] Catálogo de pedidos abre sem erro
- [x] Produtos aparecem no catálogo
- [x] Produtos sem NEO funcionam normalmente
- [x] Produtos com NEO agrupam por fornecedor
- [x] Logs de debug informativos
- [x] Deploy realizado com sucesso

---

## 🚀 Próximos Passos (v16.0 FASE 3)

1. **Sistema de Estoque Reservado**
   - Reservar estoque ao criar pedido (SOLICITADO)
   - Liberar estoque ao cancelar pedido
   - Baixar estoque ao concluir pedido (FINALIZADO)

2. **Sistema de Debug Centralizado**
   - Criar módulo `00.debug_logger.js`
   - Implementar níveis de log (DEBUG, INFO, WARN, ERROR)
   - Timestamps automáticos

3. **Limpeza de Código**
   - Remover `99.dados_ficticios.js` e `99.dados_ficticios_v2.js`
   - Revisar módulos obsoletos
   - Remover código comentado

4. **Guia de Testes Completo**
   - Criar `GUIA_TESTES_V16.0.md`
   - Checklist de todas funcionalidades
   - Casos de teste detalhados

---

**Versão**: 16.0 FASE 2
**Data**: 2025-11-28
**Status**: ✅ Deployed e Testado

🤖 Generated with [Claude Code](https://claude.com/claude-code)
