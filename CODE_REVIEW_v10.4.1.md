# Code Review & Documentation - v10.4.1

Prepared on behalf of the Neoformula Google Apps Script workspace after rolling back the codebase to commit `a8a2492` (tag v10.4.1). The goal is to document what every module/HTML file does in plain language, highlight risks, and capture improvements before redeploying.

---

## Scope & Method

- Reviewed every `.js` module, `Index.html`, and project configuration files (`appsscript.json`, `.clasp.json`).
- Cross-referenced function boundaries via `function_map.json` to keep explanations tied to concrete line numbers.
- Looked for bugs, security issues (credentials, Drive exposure, XSS), performance bottlenecks (full-sheet scans, repeated `getDataRange()`), and deviations from clean-code practices.
- Verified deployment settings and supporting documentation inside the repo.

---

## Critical & High-Risk Findings

| # | Severity | Location | Problem | Impact | Recommended Fix |
|---|----------|----------|---------|--------|-----------------|
| 1 | **Critical** | `appsscript.json:5-10` | WebApp is deployed as `USER_DEPLOYING` with access `MYSELF`, yet the code assumes `Session.getActiveUser()` returns each employee. | Only the owner can execute the WebApp, and even then `Session.getActiveUser()` always resolves to the owner. All permission checks/logs therefore run under the wrong identity, so multi-user auditing and access control are broken. | Redeploy the WebApp with `"executeAs": "USER_ACCESSING"` and `"access": "ANYONE_WITH_LINK"` (or the appropriate domain policy). Re-test all permission flows once the server can actually read the caller's identity. |
| 2 | **High** | `Index.html:3550-3566` and multiple other `innerHTML` assignments | User-generated fields (e.g., `pedido.observacoes`, supplier names) are interpolated directly into `innerHTML` without escaping. | Any user can inject HTML/JS into Sheets fields that later render in the admin UI, leading to stored XSS. Sensitive data and session tokens can leak. | Create a tiny escaping helper (e.g., `function escapeHTML(str)`) and apply it to all template literals that output sheet content. Prefer `textContent` where possible. |
| 3 | **High** | `04.gerenciamentoPedidos.js:992-1009` | `buscarProdutos` only retrieves columns up to `CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL` (col 11) but later reads column 12 (`ATIVO`). | The `ativo` flag is always `undefined`, so inactive products appear in every catalog/search result. This breaks stock governance and can expose discontinued SKUs. | Change the `getRange` width to at least `CONFIG.COLUNAS_PRODUTOS.ATIVO` (12) or simply use `abaProdutos.getRange(2, 1, lastRow - 1, CONFIG.COLUNAS_PRODUTOS.MAPEAMENTO_CODIGOS)` to capture all mapped columns. |
| 4 | **High** | `10.gerenciamentoImagens.js:29-86` | `uploadImagemDrive` uploads every product image and immediately sets sharing to `ANYONE_WITH_LINK`. | All product photos (often containing internal SKU hints) become publicly accessible. Links can leak externally and are indexed by crawlers. | Restrict permissions to the organization (e.g., `DriveApp.Access.DOMAIN_WITH_LINK`) or leave private and serve via `DriveApp.createFile().getDownloadUrl()` proxied through Apps Script. Audit existing files and revoke public sharing. |
| 5 | **High** | `02.autenticacao.js:192-233` | `criarUsuarioAutomatico` silently appends any email that hits the WebApp into the Users sheet with full access to submit/store orders. | Anyone with the URL can self-provision and start writing to operational sheets without approval or onboarding. | Require admin approval before inserting, or at least restrict by domain (e.g., ensure `email.endsWith('@neoformula.com.br')`). Add throttling/logging for unexpected domains. |
| 6 | **Medium** | `00.utils_serialization.js:53` | Regex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$` misses an escaped dot before milliseconds. | Non-ISO strings such as `2025-10-10T01:02:03X123Z` still match and are turned into `Date` objects, leading to wrong timestamps and subtle bugs. | Escape the dot (`\\.`) and allow optional timezone offsets using `Z|[+-]\d{2}:\d{2}` if needed. |
| 7 | **Medium** | `00.funcoes_wrapper.js:26-120`, `03.gerenciamentoProdutos.js:33-120`, etc. | Extensive `Logger.log(JSON.stringify(...))` statements persist PII (emails, order contents) in execution logs. | Logs are retained in Stackdriver and can leak sensitive purchasing info to anyone with project access. | Replace with redacted summaries or wrap logging behind a debug flag that you disable in production. |
| 8 | **Low** | `01.config.js:247-286` | `CONFIG.VERSAO` is still `"10.1"` even though this repo was rolled back to `v10.4.1`. | UI and logs display the wrong version, making incident tracking confusing. | Update `CONFIG.VERSAO` and `CHANGELOG` entries to reflect the actual deployed baseline. |

---

## Performance & Clean-Code Observations

- Many read operations (`listarProdutos`, `getEstoqueAtual`, dashboards) fetch entire sheets via `getDataRange()`. Consider limiting selected columns, caching via `CacheService`, or materializing filtered views to reduce execution time.
- Functions that mutate sheets (`registrarMovimentacaoEstoque`, `processarNFComCustoMedio`) do not acquire `LockService`. Concurrent submissions can overwrite each other.
- Front-end JS (inside `Index.html`) mixes DOM logic, formatting, and permission checks in single functions >200 lines. Extract helper modules or at minimum break them into smaller functions for maintainability.
- There is no automated test coverage (`99.teste_debug.js` only logs results). Consider converting these helpers into ` clasp run`-friendly unit tests.

---

## Module-by-Module Explanation

Below is a human-readable walkthrough of every code unit. Line numbers reference the state of the repository at commit `a8a2492`.

### 00.funcoes_wrapper.js

This file contains all server-side wrapper functions exposed to the front-end (`google.script.run`). Each wrapper logs inputs, delegates to the real business function defined elsewhere, serializes dates via `serializarParaFrontend`, and enforces consistent error objects.

| Lines / Function | Plain-language explanation |
|------------------|---------------------------|
| 1-24 | Comment banner explaining why wrappers exist (to fix Date serialization issues in Apps Script). |
| `__listarPedidos` (26) | Receives filter options from the UI, logs them for troubleshooting, calls `listarPedidos`, serializes the result, and returns either the list of orders or a safe fallback with `success: false`. |
| `__getDetalhesPedido` (48) & `__getPedidoById` (70) | Resolve a specific order by ID, ensuring any nested Dates are turned into ISO strings before hitting the browser. |
| `__darBaixaPedido` (87) | Wraps `darBaixaPedido` (mark order as fulfilled), records whether the backend succeeded, and relays the status. |
| `__atualizarStatusPedido` (105-188) | Implements front-line authorization: it pulls the active user via `Session`, fetches their profile with `obterPerfilUsuario`, ensures they are Admin/Gestor (case-insensitive), writes status updates, and logs denials in case of insufficient privilege. |
| `__getMinhasSolicitacoes` (191) | Filters the orders sheet by the requester's email and returns only their latest submissions. |
| `__listarProdutos`, `__buscarProduto`, `__buscarProdutos`, `__obterCatalogoProdutosComEstoque` (213-345) | Provide multiple product catalog entry points: list everything, fetch one record, search by criteria, or assemble a stock-aware catalog for the storefront. |
| `__getEstoqueAtual`, `__getAnaliseProdutos` (346-422) | Bridge to inventory analytics such as current balance, low-stock alerts, and consumption projections. |
| `__getDashboardData`, `__getDashboardAvancado`, `__getRelatorio`, `__exportarRelatorio` (423-514) | Aggregate dashboards and downloadable reports. They funnel through dedicated modules (`06.dashboard_consolidado.js`, `09.relatorios_avancados.js`). |
| `__uploadImagemDrive`, `__deletarImagemDrive`, `__atualizarImagemProduto`, `atualizarProduto` (515-612) | Handle Drive uploads/deletions and updates the product record with the resulting URL. |
| `__inserirDadosFicticios`, `__limparDadosFicticios` (614-662) | Support the "seed data" buttons available to admins in the UI. |
| `__getConfig`, `__obterTodasConfiguracoes`, `__getUsuarios`, `__salvarConfigSistema`, `__getConfigSistema` (663-781) | Read/write the configuration sheet, allowing the front-end to display current settings and persist changes. |
| `testeRetornoSimples` (782) | Minimal function used to verify `google.script.run` connectivity; returns a static object. |
| `__listarUsuarios` (800), `__buscarPedidoPorId` (853), `__atualizarPedido` (927) | Read/write helpers for admins to edit orders and review the user registry. |
| `__exportarProdutosCSV` (1036) | Generates a CSV string with all products and returns it to the browser for download. |

### 00.utils_serialization.js

Provides two pure functions that convert Apps Script Dates into browser-friendly strings and back.

| Function | Explanation |
|----------|-------------|
| `serializarParaFrontend` (13) | Recursively walks any value, turning Date objects into ISO strings while leaving primitives untouched. Used before returning data through `google.script.run`. |
| `deserializarDoFrontend` (46) | Reverse operation for client-side use: identifies ISO-looking strings and rebuilds Date objects, ensuring arrays and nested objects are processed recursively. |

### 01.config.js

Defines every constant used throughout the system: sheet names, column indexes, status labels, and metadata shown in the UI.

| Section | Explanation |
|---------|-------------|
| Lines 1-309 | Map each sheet tab (`ABAS`) and column index (`COLUNAS_*`). These indexes drive every `getRange` call to guarantee consistent reads/writes. |
| Lines 310-244 | Enumerate business statuses (`STATUS_PEDIDOS`), product types, permission roles, upload constraints, reporting presets, UI colors, logos, and changelog strings. |
| `getIndiceColuna` (310) | Helper that returns the numeric column index when given an "Aba" and logical column name, preventing magic numbers. |
| `isStatusValido`, `isTipoProdutoValido`, `isPerfilValido`, `temPermissao` (335-370) | Thin validators used by other modules before mutating data or exposing features. |

### 01.setup.js

Orchestrates the initial spreadsheet creation, admin menus, and maintenance utilities (backup/reset).

| Section / Function | Plain-language explanation |
|--------------------|---------------------------|
| `setupPlanilhaManual` / `setupPlanilha` (28-208) | Entry points triggered from the Apps Script editor or the spreadsheet menu. They detect whether the system is already configured, prompt the operator for confirmation, and call the creation helpers. |
| `criarAbaConfiguracoes` … `criarAbaIndicadores` (213-463) | Each helper creates one sheet tab, sets headers, formatting, column widths, and default rows. |
| `criarEstruturaPastas` (492) | Builds the Drive folder hierarchy that will eventually hold product images and attachments. |
| `popularDadosTeste` (605) | Seeds demo products, orders, stock, and users to help first-time deployments verify the interface. |
| `aplicarFormatacao` (809) | Applies consistent header styles, filters, and conditional formatting across sheets. |
| `obterConfiguracao` (858) | Reads a key/value from the Config sheet so other modules (Drive uploads, delivery times) can reuse it. |
| `onOpen`, `abrirSistema`, `verificarStatus`, `mostrarAjuda` (884-1188) | Hook into the spreadsheet UI to add custom menus, open the web app, and show helpers. |
| `corrigirURLsImagensMenu`, `recarregarSistema`, `limparCache` (1194-1331) | Maintenance items accessible from the menu to fix Drive URLs or flush caches. |
| `gerarRelatorioDados`, `criarBackup` (1326-1453) | Export the full dataset into a timestamped backup sheet/file. |
| `factoryReset` (1455-1608) | High-risk utility that deletes every sheet (after multiple prompts), recreates the structure, and repopulates baseline data. |

### 02.autenticacao.js

Manages user context, caching, permissions, and CRUD operations for the Users sheet.

| Function | Explanation |
|----------|-------------|
| `getUserContext` (24) | Reads the active user email, validates it, checks the in-memory cache, then scans the Users sheet. If the user does not exist, it delegates to `criarUsuarioAutomatico`. Returns `{ success, user }`. |
| `obterPerfilUsuario` (136) | Lightweight helper to fetch only the profile (Admin/Gestor/etc.) for permission gates, again falling back to automatic creation if missing. |
| `limparCacheUsuarios` (178) | Clears the in-memory cache either globally or per-email, useful after edits. |
| `criarUsuarioAutomatico` (192) | Appends a default user row (`USUARIO`, "Sem Setor") when an unknown email hits the system. |
| `verificarPermissao` (243) | Compares the requester's hierarchy level against the required role (Admin > Gestor > Usuario > Visualizador) to protect high-impact operations. |
| `listarUsuarios`, `adicionarUsuario`, `atualizarUsuario`, `removerUsuario` (279-488) | CRUD endpoints for the admin UI. `removerUsuario` performs a soft-delete by marking `ativo = 'Não'`. |
| `atualizarConfiguracao`, `obterTodasConfiguracoes` (509-612) | Expose config operations under Admin-only gates. |

### 03.gerenciamentoProdutos.js

Provides product catalog operations, caching, stock thresholds, and the automatic creation used by NF ingestion.

| Function / Section | Explanation |
|--------------------|-------------|
| `listarProdutos` (24) | Streams the Products sheet into JS objects, applying optional filters (type, category, free-text). |
| `buscarProduto` (120) | Looks up a product by ID/code with cache support to avoid repeated sheet scans. |
| `buscarProdutos` (198) | Returns multiple products given an array of IDs, used when editing orders. |
| `salvarProduto`, `atualizarProduto`, `removerProduto` (250-430) | CRUD helpers that also keep cache entries in sync. |
| `validarProduto`, `gerarCodigoProduto`, `criarHistoricoProduto` (430-520) | Business rules around SKU formats and version history. |
| `cadastrarProdutoAutomatico` (586) | Called from the NF parser to register brand-new items with sane defaults (stock min, code prefix derived from type) and create an initial stock row. |

### 04.gerenciamentoPedidos.js

Implements all order lifecycle actions (create, validate, list, update, notify).

| Function | Explanation |
|----------|-------------|
| `validarProdutoPedido` (13) | Ensures each item in a new order carries product ID and quantity with safe limits. |
| `criarPedido` (34) | Validates inputs, generates order numbers, calculates totals, writes to the Orders sheet, and optionally notifies via email. |
| `gerarNumeroPedido` (190) | Builds sequential IDs using timestamps to keep them unique. |
| `listarPedidos`, `getDetalhesPedido`, `getPedidoById` (220-370) | Provide various filtered views for dashboards and detail pages. |
| `atualizarStatusPedido`, `darBaixaPedido` (400-570) | Enforce profile permissions before changing status, log the change, and manipulate stock if needed. |
| `atualizarPedido` (610) | Allows Admin/Gestor to edit metadata (type, sector, status, delivery dates, notes). |
| `buscarProdutos` (992) | Supplies the front-end search modal with up to 20 matching products along with stock/price info. |
| `getMinhasSolicitacoes` (1024) | Returns the last 10 orders created by the active user. |
| Email helpers at the bottom | Wrap `MailApp` to send notifications (approval, cancellation) using templates. |

### 05.controleEstoque.js

Tracks inventory levels, registers movements, and calculates availability.

| Function | Explanation |
|----------|-------------|
| `getEstoqueAtual` (13) | Reads the Stock sheet, optionally filtering by product or only items below minimal levels. |
| `registrarEntradaEstoque` / `registrarSaidaEstoque` (80-270) | Admin/Gestor-only operations that validate quantities, update stock rows, and log movements. |
| `reservarEstoqueParaPedido`, `liberarReservaEstoque` (270-420) | Reserved quantities so pending orders do not oversell. |
| `registrarMovimentacaoEstoque` (450) | Consolidated routine invoked by NF processing and manual adjustments; calculates new totals, prevents negatives, records a movement row, and logs metadata (NF ID, cost). |
| `getHistoricoMovimentacoes`, `gerarRelatorioEstoque` (650+) | Provide analytical snapshots for dashboards. |

### 06.dashboard_consolidado.js

Calculates more than 30 KPIs for management dashboards.

| Section | Explanation |
|---------|-------------|
| `getDashboardAvancado` (13) | Loads data from all relevant tabs, applies optional filters, and orchestrates KPI calculations. |
| `aplicarFiltrosPedidos` (56) | Centralized filtering logic (type/status/sector/date). |
| `calcularKPIsFinanceiros`, `calcularKPIsLogisticos`, `calcularKPIsEstoque` (150-380) | Compute metrics such as ticket médio, SLAs, stockouts, giro de estoque, products below minimum, forecasted ruptures, etc. |
| Helper functions (`agruparPorMes`, `calcularConsumoMedioDiario`, etc.) | Reusable math for grouping values per month, determining inactive products, and forecasting restocking windows. |

### 07.funcoesAuxiliares.js

Utility functions shared across modules.

| Function | Explanation |
|----------|-------------|
| `registrarLog` (13) | Appends a row to the Logs sheet containing timestamp, user, action, and status. |
| `formatarMoeda`, `formatarData` (36-70) | Presentation helpers for consistent currency/date formatting. |
| `validarEmail`, `gerarId` (75-85) | Basic validation and UUID generation. |
| `limparLogsAntigos` (90) | Deletes logs older than 90 days to keep the sheet lightweight. |
| `getListaUsuarios`, `getListaSetores` (124-180) | Build unique lists for filter dropdowns. |
| `exportarParaCSV` (196) | Converts an array of objects into a CSV string, quoting values with commas. |

### 08.interfaceWeb.js

Server-side entry point for the HTML UI.

| Function | Explanation |
|----------|-------------|
| `doGet` (17) | Validates that the WebApp has a URL, loads `Index.html` through `HtmlTemplate`, injects logo/version info, and sets the window title/favicon. |
| `include` (45) | Utility to include other HTML snippets from the Apps Script project (currently unused). |
| `getUserInfo` (52) | Wraps `getUserContext`, falling back to a minimal user object if the backend fails. |
| `getSystemConfig`, `checkSystemStatus` (72-132) | Provide configuration/status data to the front-end splash screen. |
| `getInitialData` (146) | Fetches user/config/status in parallel and returns a consolidated payload for the SPA bootstrapping code. |
| `testConnection` (210) | Simple health-check endpoint returning server time and version. |

### 09.relatorios_avancados.js

Generates eight analytical reports exposed in the dashboards.

| Function | Explanation |
|----------|-------------|
| `getRelatorio` (24) | Dispatches to one of the eight report generators based on `tipo`. |
| `getRelatorioVisaoGeral` … `getRelatorioComparativo` (56-470) | Each function loads the required data (orders, products, stock), computes KPIs, builds alert/recommendation lists, and packages chart-friendly structures. |
| Helper functions (`gerarDadosGrafico*`, `gerarEvolucaoMensal`, `getPedidosFiltrados`) | Common logic for grouping values by status/type/month and retrieving filtered orders (currently proxying to `getAllPedidos`). |

### 10.gerenciamentoImagens.js

Encapsulates Drive uploads for product photos and clean-up scripts.

| Function | Explanation |
|----------|-------------|
| `uploadImagemDrive` (17) | Accepts a base64 payload from the browser, uploads to Drive under the configured folder (per product type), makes it public, and returns the thumbnail URL. |
| `obterPastaImagensPorTipo` (59) | Ensures the Drive folder structure exists (Papelaria/Limpeza subfolders) and returns the Folder handle. |
| `deletarImagemDrive`, `limparImagensOrfas` (94-210) | Remove assets when products are deleted and optionally clean orphaned files. |
| `atualizarImagemProduto` / `uploadImagemProduto` (216-360) | Combine Drive uploads with sheet updates to keep the product record in sync. |
| `corrigirURLsImagensAntigas`, `testeUploadImagem`, `testeLimparOrfas` (377-430) | Admin tools for migrating legacy URLs and verifying Drive connectivity. |

### 11.notasFiscais.js

Handles NF-e ingestion, mapping products, updating costs, and logging history.

| Section | Explanation |
|---------|-------------|
| `criarAbaNotasFiscais`, `criarAbaHistoricoCustos`, `criarAbaItensNotasFiscais` (13-210) | Create the supporting sheets with headers, formatting, and column widths if they do not exist yet. |
| `importarNotaFiscal`, `processarNotaFiscal`, `registrarNotaFiscal` (210-520) | Receive uploaded XMLs, parse supplier/data items, store JSON columns in the NF sheet, and trigger downstream stock updates. |
| `mapearProdutosNF`, `sugerirProdutosSemelhantes` (520-840) | Attempt to match NF items to existing SKUs via similarity scores (Levenshtein style) and highlight unmapped entries. |
| `vincularNFaoEstoque`, `registrarMovimentacaoNF`, `processarNFComCustoMedio` (840-1150) | Apply weighted-average cost updates, raise stock quantities, and log both NF and movement IDs for traceability. |
| `atualizarCustoMedioProduto`, `registrarHistoricoCusto`, `registrarItemNF` (1150-1365) | Persist cost history per product and append each NF line to the Items sheet for audit trails. |

### 99.dados_ficticios.js & 99.dados_ficticios_v2.js

Contain helpers to seed and purge demo data during onboarding.

| Function | Explanation |
|----------|-------------|
| `testarInsercaoDadosFicticios`, `testarLimpezaDadosFicticios` | Simple orchestrators that call the individual inserters/removers and log success. |
| `inserirProdutosFicticios`, `inserirEstoqueFicticio`, `inserirPedidosFicticios`, `inserirMovimentacoesFicticias` | Populate each sheet with deterministic sample data. |
| `removerLinhasPorIds` | Utility to delete rows containing known IDs (PED-001, PROD-021, etc.). |
| v2 file adds `criarOuAtualizarAbaMetadados`, `salvarMetadadosFicticios`, `gerarIdProdutoFicticio` for more advanced scenarios. |

### 99.teste_debug.js

Provides manual smoke tests callable from the Apps Script editor.

| Function | Explanation |
|----------|-------------|
| `teste_01_VerificarCONFIG` … `teste_07_GetInitialData` | Each function calls a backend endpoint and logs whether it returned successfully. |
| `executarTodosOsTestes` | Runs the entire suite sequentially and reports consolidated status. |
| `testeSimples` | Minimal health check for logging pipelines. |

### Index.html

Single-page application containing all UI markup, CSS, and JavaScript.

| Section | Explanation |
|---------|-------------|
| Lines 1-2200 (HTML/CSS) | Defines the responsive layout: header with logo/user info, navigation tabs (Dashboard, Pedidos, Produtos, Estoque, NF, Configurações), cards/grids for KPIs, modals for creating/editing entities, and admin-only maintenance panels. |
| Line 2220 | Loads Chart.js via CDN to render dashboards. |
| Lines 2222-6718 (inline `<script>`) | Implements the SPA logic: bootstrapping with `getInitialData`, rendering charts/tables, managing navigation state, handling modals/forms, performing client validation, previewing images, invoking `google.script.run` wrappers, rendering maintenance widgets (dado fictício, NF upload), and applying role-based UI toggles. Each `google.script.run` call maps to a wrapper in `00.funcoes_wrapper.js`. |
| Major functions | `initApp()`, `carregarDashboard()`, `renderPedidosTable()`, `openPedidoModal()`, `submitNovoPedido()`, `loadProdutos()`, `submitNovoProduto()`, `submitAlterarStatus()`, `carregarNotasFiscais()`, `processarXMLNF()`, `corrigirURLsImagens()`, etc.—all orchestrate DOM updates and RPC calls. |

### Configuration Files

- `.clasp.json` stores the Apps Script `scriptId`, project ID, and file-extension mapping used by `clasp`. No secrets are embedded, but keep it private to avoid leaking the Script ID.
- `appsscript.json` defines runtime parameters (timezone, exception logging). As noted earlier, the `webapp` block needs to be updated to match the intended audience/impersonation strategy.

---

## Suggested Remediation Plan

1. **Fix deployment configuration** (Finding #1) and confirm `Session.getActiveUser()` now reflects real users. Re-run the smoke tests in `99.teste_debug.js`.
2. **Sanitize all HTML output** in `Index.html` by introducing an `escapeHTML` helper and using `textContent` for purely textual nodes.
3. **Adjust `buscarProdutos`** to fetch the full column range so inactive products stay hidden.
4. **Lock down Drive permissions** for product images and retroactively revoke public links.
5. **Tighten user provisioning** by restricting domains or requiring admin approval.
6. **Patch the ISO date regex** in `00.utils_serialization.js`.
7. **Update `CONFIG.VERSAO`** to 10.4.1 so UI/tooling show the correct build.
8. **Optimize sheet access** by replacing repeated `getDataRange()` calls with column-specific ranges and caching.

---

## Deployment Commands

After incorporating the above documentation, run:

```bash
clasp push
git add .
git commit -m "Code review and improvements: security, performance, documentation"
git push
```

Outputs from these commands should be captured in the change log or deployment notes for future traceability.

---

Please reach out if you need deeper dives into any module or help prioritizing the remediation backlog.
