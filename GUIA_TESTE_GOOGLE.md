# 🚀 Guia de Teste no Google Apps Script

## Sistema Neoformula v6.0.1 - Instruções de Deploy e Teste

---

## 📋 PRÉ-REQUISITOS

1. Conta Google Workspace ou Gmail
2. Planilha Google Sheets configurada
3. Acesso ao Google Apps Script
4. Permissões de administrador (para algumas funcionalidades)

---

## 🔧 PASSO 1: FAZER UPLOAD DOS ARQUIVOS

### Opção A: Via Interface Web do Google Apps Script

1. Abra sua planilha do Google Sheets
2. Clique em **Extensões** > **Apps Script**
3. Você verá os arquivos existentes na lateral esquerda
4. Para cada arquivo modificado:
   - Clique no arquivo existente
   - Selecione todo o código (Ctrl+A)
   - Delete
   - Copie o novo código do arquivo correspondente
   - Cole no editor
   - Salve (Ctrl+S)

**Arquivos modificados (v6.0.1):**
- ✅ `02.autenticacao.js`
- ✅ `03.gerenciamentoProdutos.js`
- ✅ `04.gerenciamentoPedidos.js`
- ✅ `05.controleEstoque.js`
- ✅ `06.dashboard.js`
- ✅ `10.gerenciamentoImagens.js`

### Opção B: Via Google Clasp (CLI)

```bash
# Instalar clasp (uma vez)
npm install -g @google/clasp

# Login no Google
clasp login

# Na pasta do projeto
clasp push
```

---

## ✅ PASSO 2: VERIFICAR CONFIGURAÇÃO

### 2.1 Verificar Abas da Planilha

Execute no Apps Script:

```javascript
function verificarAbas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = ss.getSheets().map(s => s.getName());

  Logger.log('Abas encontradas:', abas);

  const abasNecessarias = [
    'Configurações',
    'Usuários',
    'Produtos',
    'Pedidos',
    'Estoque',
    'Movimentações Estoque'
  ];

  abasNecessarias.forEach(nome => {
    if (abas.includes(nome)) {
      Logger.log('✅', nome);
    } else {
      Logger.log('❌ FALTANDO:', nome);
    }
  });
}
```

### 2.2 Configurar ID da Pasta do Drive

1. Crie uma pasta no Google Drive para as imagens
2. Abra a pasta e copie o ID da URL:
   ```
   https://drive.google.com/drive/folders/1ABC...XYZ
                                          ^^^^^^^^
                                          Copie este ID
   ```
3. Cole na planilha **Configurações** > `PASTA_IMAGENS_ID`

---

## 🧪 PASSO 3: EXECUTAR TESTES

### Teste 1: Cache de Usuários

```javascript
function teste01_CacheUsuarios() {
  Logger.log('=== TESTE 1: Cache de Usuários ===');

  // Primeira chamada (sem cache)
  console.time('Primeira chamada');
  const resultado1 = getUserContext();
  console.timeEnd('Primeira chamada');

  // Segunda chamada (com cache)
  console.time('Segunda chamada (com cache)');
  const resultado2 = getUserContext();
  console.timeEnd('Segunda chamada (com cache)');

  if (resultado1.success && resultado2.success) {
    Logger.log('✅ Cache funcionando!');
    Logger.log('Usuário:', resultado1.user.email);
  } else {
    Logger.log('❌ Erro no cache');
  }
}
```

**Resultado esperado:**
```
Segunda chamada deve ser 10-50x mais rápida
✅ Usuário recuperado do cache: seu@email.com
```

---

### Teste 2: Validação de Pedido

```javascript
function teste02_ValidacaoPedido() {
  Logger.log('=== TESTE 2: Validação de Pedido ===');

  // Teste 1: Dados inválidos
  const pedidoInvalido = {
    tipo: 'TipoInexistente',
    produtos: []
  };

  const r1 = criarPedido(pedidoInvalido);
  Logger.log('Teste com tipo inválido:', r1.success ? '❌ FALHOU' : '✅ BLOQUEOU');
  Logger.log('Mensagem:', r1.error);

  // Teste 2: Quantidade negativa
  const pedidoQtdInvalida = {
    tipo: 'Papelaria',
    produtos: [
      { produtoId: 'qualquer-id', quantidade: -5 }
    ]
  };

  const r2 = criarPedido(pedidoQtdInvalida);
  Logger.log('Teste com quantidade negativa:', r2.success ? '❌ FALHOU' : '✅ BLOQUEOU');
  Logger.log('Mensagem:', r2.error);

  // Teste 3: Muitos produtos
  const muitosProdutos = {
    tipo: 'Papelaria',
    produtos: []
  };

  for (let i = 0; i < 51; i++) {
    muitosProdutos.produtos.push({ produtoId: 'id-' + i, quantidade: 1 });
  }

  const r3 = criarPedido(muitosProdutos);
  Logger.log('Teste com muitos produtos:', r3.success ? '❌ FALHOU' : '✅ BLOQUEOU');
  Logger.log('Mensagem:', r3.error);
}
```

**Resultado esperado:**
```
✅ BLOQUEOU - Tipo de pedido inválido
✅ BLOQUEOU - Quantidade deve ser um número positivo
✅ BLOQUEOU - Número máximo de produtos por pedido é 50
```

---

### Teste 3: Race Condition (Números Únicos)

```javascript
function teste03_RaceCondition() {
  Logger.log('=== TESTE 3: Race Condition ===');

  const numeros = [];

  // Gerar 10 números rapidamente
  for (let i = 0; i < 10; i++) {
    const numero = gerarNumeroPedido();
    numeros.push(numero);
    Logger.log(i + 1, numero);
  }

  // Verificar duplicados
  const unicos = new Set(numeros);

  if (unicos.size === numeros.length) {
    Logger.log('✅ Todos os números são únicos!');
  } else {
    Logger.log('❌ Encontrados duplicados!');
    Logger.log('Total:', numeros.length, 'Únicos:', unicos.size);
  }
}
```

**Resultado esperado:**
```
1 PED20251030-001
2 PED20251030-002
3 PED20251030-003
...
✅ Todos os números são únicos!
```

---

### Teste 4: Rate Limiting de Email

```javascript
function teste04_RateLimitEmail() {
  Logger.log('=== TESTE 4: Rate Limiting Email ===');

  const destinatario = Session.getActiveUser().getEmail();
  const dadosEmail = {
    numeroPedido: 'TEST-001',
    solicitante: 'Sistema de Testes',
    tipo: 'Papelaria',
    valorTotal: 150.00,
    produtos: ['Caneta', 'Caderno']
  };

  // Envio 1 - deve funcionar
  const r1 = enviarNotificacaoPedido(destinatario, dadosEmail);
  Logger.log('Envio 1:', r1 ? '✅ ENVIADO' : '❌ BLOQUEADO');

  // Aguardar 2 segundos
  Utilities.sleep(2000);

  // Envio 2 - deve bloquear (menos de 5 minutos)
  const r2 = enviarNotificacaoPedido(destinatario, dadosEmail);
  Logger.log('Envio 2 (imediato):', r2 ? '❌ DEVERIA BLOQUEAR' : '✅ BLOQUEADO');

  Logger.log('');
  Logger.log('Aguarde 5 minutos e execute novamente para testar timeout');
}
```

**Resultado esperado:**
```
Envio 1: ✅ ENVIADO
⚠️ Rate limit atingido: Aguarde X minutos...
Envio 2 (imediato): ✅ BLOQUEADO
```

---

### Teste 5: Validação de Datas no Dashboard

```javascript
function teste05_ValidacaoDatas() {
  Logger.log('=== TESTE 5: Validação de Datas ===');

  // Teste 1: Data início > data fim
  const filtro1 = {
    dataInicio: '2025-12-31',
    dataFim: '2025-01-01'
  };

  const r1 = getDashboardData(filtro1);
  Logger.log('Data início > fim:', r1.success ? '❌ FALHOU' : '✅ BLOQUEOU');
  Logger.log('Mensagem:', r1.error);

  // Teste 2: Intervalo muito grande
  const filtro2 = {
    dataInicio: '2020-01-01',
    dataFim: '2025-12-31'
  };

  const r2 = getDashboardData(filtro2);
  Logger.log('Intervalo > 2 anos:', r2.success ? '❌ FALHOU' : '✅ BLOQUEOU');
  Logger.log('Mensagem:', r2.error);

  // Teste 3: Datas válidas
  const filtro3 = {
    dataInicio: '2025-01-01',
    dataFim: '2025-12-31'
  };

  const r3 = getDashboardData(filtro3);
  Logger.log('Datas válidas:', r3.success ? '✅ PASSOU' : '❌ FALHOU');
}
```

**Resultado esperado:**
```
✅ BLOQUEOU - Data de início deve ser anterior ou igual à data de fim
✅ BLOQUEOU - Intervalo de datas muito grande (máximo 2 anos)
✅ PASSOU
```

---

### Teste 6: Performance do Cache

```javascript
function teste06_PerformanceCache() {
  Logger.log('=== TESTE 6: Performance do Cache ===');

  // Limpar cache antes de testar
  limparCacheUsuarios();
  limparCacheProdutos();

  // Criar lista de IDs de produtos para testar
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaProdutos = ss.getSheetByName('Produtos');
  const lastRow = abaProdutos.getLastRow();

  if (lastRow < 2) {
    Logger.log('❌ Nenhum produto para testar');
    return;
  }

  const produtoIds = abaProdutos.getRange(2, 1, Math.min(10, lastRow - 1), 1).getValues();

  // Teste SEM cache
  console.time('SEM CACHE (10 buscas)');
  limparCacheProdutos();
  produtoIds.forEach(id => {
    buscarProduto(id[0]);
  });
  console.timeEnd('SEM CACHE (10 buscas)');

  // Teste COM cache
  console.time('COM CACHE (10 buscas)');
  produtoIds.forEach(id => {
    buscarProduto(id[0]);
  });
  console.timeEnd('COM CACHE (10 buscas)');

  Logger.log('✅ Teste de performance concluído');
  Logger.log('Esperado: Cache deve ser 10-50x mais rápido');
}
```

---

## 🐛 PASSO 4: DEBUGGING

### Ver Logs

1. **Logs Simples:**
   - Clique no ícone de execução (▶️)
   - Veja os logs em **Executar** > **Visualizar logs**

2. **Logs Avançados:**
   - Clique em **Visualizar** > **Stackdriver Logging**
   - Filtre por nível (INFO, WARNING, ERROR)

### Debugger

1. Adicione breakpoints clicando ao lado do número da linha
2. Clique em **Depurar** (🐛)
3. Use F10 para avançar linha por linha

### Console de Execução

```javascript
function debugarSistema() {
  // Verificar configuração
  const status = checkSystemStatus();
  Logger.log('Status:', JSON.stringify(status, null, 2));

  // Verificar usuário
  const user = getUserContext();
  Logger.log('Usuário:', JSON.stringify(user, null, 2));

  // Verificar dados iniciais
  const inicial = getInitialData();
  Logger.log('Dados iniciais:', JSON.stringify(inicial, null, 2));
}
```

---

## 📊 PASSO 5: MONITORAR PERFORMANCE

### Criar Dashboard de Performance

```javascript
function monitorarPerformance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Testar operações críticas
  const testes = [];

  // Teste 1: Buscar usuário
  console.time('getUserContext');
  getUserContext();
  console.timeEnd('getUserContext');

  // Teste 2: Listar pedidos
  console.time('listarPedidos');
  const pedidos = listarPedidos();
  console.timeEnd('listarPedidos');
  testes.push({ operacao: 'listarPedidos', total: pedidos.pedidos.length });

  // Teste 3: Dashboard
  console.time('getDashboardData');
  getDashboardData();
  console.timeEnd('getDashboardData');

  // Teste 4: Listar produtos
  console.time('listarProdutos');
  const produtos = listarProdutos();
  console.timeEnd('listarProdutos');
  testes.push({ operacao: 'listarProdutos', total: produtos.produtos.length });

  Logger.log('Resumo dos testes:', JSON.stringify(testes, null, 2));
}
```

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "ReferenceError: CONFIG is not defined"
**Solução:** Certifique-se de que `01.setup.js` está carregado primeiro

### Problema 2: "TypeError: Cannot read property 'getSheetByName'"
**Solução:** Verifique se está executando no contexto correto (planilha aberta)

### Problema 3: Cache não funciona
**Solução:** Cache é válido apenas durante a sessão. Execute duas vezes seguidas para testar.

### Problema 4: Emails não são enviados
**Solução:**
1. Verifique autorização do Gmail em Apps Script
2. Verifique quota diária (100 emails/dia para contas gratuitas)
3. Veja logs de rate limiting

### Problema 5: Race condition ainda ocorre
**Solução:** O lock funciona apenas no mesmo processo. Para testes reais, use múltiplos usuários.

---

## ✅ CHECKLIST FINAL

- [ ] Todos os arquivos foram atualizados
- [ ] Teste 1 (Cache) passou
- [ ] Teste 2 (Validação) passou
- [ ] Teste 3 (Race condition) passou
- [ ] Teste 4 (Rate limiting) passou
- [ ] Teste 5 (Validação datas) passou
- [ ] Teste 6 (Performance) passou
- [ ] Sistema está funcionando no ambiente
- [ ] Logs não mostram erros críticos
- [ ] Performance melhorou visivelmente

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique os logs** primeiro
2. **Execute os testes** individuais
3. **Consulte o CHANGELOG** para detalhes técnicos
4. **Documente o erro** com print screen dos logs

---

**Versão:** v6.0.1
**Data:** 30/10/2025
**Última atualização:** 30/10/2025
