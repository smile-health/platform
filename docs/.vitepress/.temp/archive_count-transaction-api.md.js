import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/count-transaction-api.md
var __pageData = JSON.parse("{\"title\":\"Count Transaction API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/count-transaction-api.md\",\"filePath\":\"archive/count-transaction-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/count-transaction-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="count-transaction-api-documentation" tabindex="-1">Count Transaction API Documentation <a class="header-anchor" href="#count-transaction-api-documentation" aria-label="Permalink to &quot;Count Transaction API Documentation&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Nol kemunculan <code>countTransaction</code> / <code>count-transaction</code> di <code>apps/</code>. Model role-nya (<code>MANAGER(3)</code>, <code>SATUSEHAT(13)</code>) era SMILE 3.0. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Count Transaction API provides comprehensive transaction counting and reporting functionality for the warehouse management system. It offers various endpoints to retrieve transaction data aggregated by different dimensions (overview, material, entity, location) with support for Excel export functionality.</p><h2 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h2><h3 id="base-url" tabindex="-1">Base URL <a class="header-anchor" href="#base-url" aria-label="Permalink to &quot;Base URL&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/dashboard/count-transaction</span></span></code></pre></div><h3 id="authentication-authorization" tabindex="-1">Authentication &amp; Authorization <a class="header-anchor" href="#authentication-authorization" aria-label="Permalink to &quot;Authentication &amp; Authorization&quot;">​</a></h3><p>All endpoints require:</p><ul><li>Authentication: <code>isAuthenticate</code> middleware</li><li>Role-based access: <code>dashboardRoleAccess</code> with roles: <ul><li><code>MANAGER</code> (3)</li><li><code>ADMIN</code> (2)</li><li><code>SUPERADMIN</code> (1)</li><li><code>SATUSEHAT</code> (13)</li></ul></li></ul><h3 id="endpoints" tabindex="-1">Endpoints <a class="header-anchor" href="#endpoints" aria-label="Permalink to &quot;Endpoints&quot;">​</a></h3><h4 id="_1-count-transaction-overview" tabindex="-1">1. Count Transaction Overview <a class="header-anchor" href="#_1-count-transaction-overview" aria-label="Permalink to &quot;1. Count Transaction Overview&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/all</span></span></code></pre></div><p><strong>Description:</strong> Retrieves transaction count overview data grouped by time periods.</p><p><strong>Features:</strong></p><ul><li>Redis caching enabled (<code>cacheMiddleware</code>)</li><li>Groups transactions by period (day, week, month, year)</li><li>Calculates total transaction counts and percentages</li><li>Returns data for chart visualization</li></ul><p><strong>Controller Function:</strong> <code>countTransactionOveriew</code></p><h4 id="_2-count-transaction-overview-download" tabindex="-1">2. Count Transaction Overview Download <a class="header-anchor" href="#_2-count-transaction-overview-download" aria-label="Permalink to &quot;2. Count Transaction Overview Download&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/all/download</span></span></code></pre></div><p><strong>Description:</strong> Downloads Excel report for transaction overview data.</p><p><strong>Features:</strong></p><ul><li>Generates Excel file using <code>excelTemplateCountTransaction</code></li><li>Includes filter information and period-based data</li><li>Returns file download response</li></ul><p><strong>Controller Function:</strong> <code>countTransactionOveriewDownload</code></p><h4 id="_3-count-transaction-by-material" tabindex="-1">3. Count Transaction by Material <a class="header-anchor" href="#_3-count-transaction-by-material" aria-label="Permalink to &quot;3. Count Transaction by Material&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/material</span></span></code></pre></div><p><strong>Description:</strong> Retrieves transaction counts grouped by material.</p><p><strong>Features:</strong></p><ul><li>Redis caching enabled</li><li>Groups data by material ID</li><li>Supports transaction type filtering</li><li>Returns material-specific transaction statistics</li></ul><p><strong>Controller Function:</strong> <code>countTransactionMaterial</code></p><h4 id="_4-count-transaction-material-download" tabindex="-1">4. Count Transaction Material Download <a class="header-anchor" href="#_4-count-transaction-material-download" aria-label="Permalink to &quot;4. Count Transaction Material Download&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/material/download</span></span></code></pre></div><p><strong>Description:</strong> Downloads Excel report for material-based transaction data.</p><p><strong>Controller Function:</strong> <code>countTransactionDownload</code></p><h4 id="_5-count-transaction-by-entity" tabindex="-1">5. Count Transaction by Entity <a class="header-anchor" href="#_5-count-transaction-by-entity" aria-label="Permalink to &quot;5. Count Transaction by Entity&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/entity</span></span></code></pre></div><p><strong>Description:</strong> Retrieves transaction counts grouped by entity.</p><p><strong>Features:</strong></p><ul><li>Redis caching enabled</li><li>Groups data by entity ID</li><li>Includes entity hierarchy (province, regency)</li><li>Returns entity-specific transaction statistics</li></ul><p><strong>Controller Function:</strong> <code>countTransactionEntity</code></p><h4 id="_6-count-transaction-entity-download" tabindex="-1">6. Count Transaction Entity Download <a class="header-anchor" href="#_6-count-transaction-entity-download" aria-label="Permalink to &quot;6. Count Transaction Entity Download&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/entity/download</span></span></code></pre></div><p><strong>Description:</strong> Downloads Excel report for entity-based transaction data.</p><p><strong>Controller Function:</strong> <code>countTransactionDownload</code></p><h4 id="_7-count-transaction-by-location" tabindex="-1">7. Count Transaction by Location <a class="header-anchor" href="#_7-count-transaction-by-location" aria-label="Permalink to &quot;7. Count Transaction by Location&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/location</span></span></code></pre></div><p><strong>Description:</strong> Retrieves transaction counts grouped by location (province/regency).</p><p><strong>Features:</strong></p><ul><li>Redis caching enabled</li><li>Groups data by location ID</li><li>Supports province and regency level aggregation</li><li>Returns location-specific transaction statistics</li></ul><p><strong>Controller Function:</strong> <code>countTransactionLocation</code></p><h4 id="_8-count-transaction-location-download" tabindex="-1">8. Count Transaction Location Download <a class="header-anchor" href="#_8-count-transaction-location-download" aria-label="Permalink to &quot;8. Count Transaction Location Download&quot;">​</a></h4><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/location/download</span></span></code></pre></div><p><strong>Description:</strong> Downloads Excel report for location-based transaction data.</p><p><strong>Controller Function:</strong> <code>countTransactionDownload</code></p><h2 id="database-schema" tabindex="-1">Database Schema <a class="header-anchor" href="#database-schema" aria-label="Permalink to &quot;Database Schema&quot;">​</a></h2><h3 id="primary-tables" tabindex="-1">Primary Tables <a class="header-anchor" href="#primary-tables" aria-label="Permalink to &quot;Primary Tables&quot;">​</a></h3><h4 id="_1-datamart-transactions" tabindex="-1">1. datamart_transactions <a class="header-anchor" href="#_1-datamart-transactions" aria-label="Permalink to &quot;1. datamart_transactions&quot;">​</a></h4><p><strong>Description:</strong> Main transaction data table</p><p><strong>Key Columns:</strong></p><ul><li><code>transactions_createdAt</code>: Transaction creation timestamp</li><li><code>master_materials_id</code>: Material identifier</li><li><code>entities_id</code>: Entity identifier</li><li><code>transactions_activity_id</code>: Activity identifier</li><li><code>period</code>: Time period grouping</li><li><code>location_id</code>: Location identifier</li><li><code>change_qty</code>: Quantity change</li><li><code>frequency</code>: Transaction frequency count</li></ul><h4 id="_2-dim-entity-activity-date" tabindex="-1">2. dim_entity_activity_date <a class="header-anchor" href="#_2-dim-entity-activity-date" aria-label="Permalink to &quot;2. dim_entity_activity_date&quot;">​</a></h4><p><strong>Description:</strong> Entity activity date mapping</p><p><strong>Key Columns:</strong></p><ul><li><code>entity_id</code>: Entity identifier</li><li><code>activity_id</code>: Activity identifier</li><li><code>join_date</code>: Entity join date</li><li><code>end_date</code>: Entity end date</li></ul><h4 id="_3-supporting-dimension-tables" tabindex="-1">3. Supporting Dimension Tables <a class="header-anchor" href="#_3-supporting-dimension-tables" aria-label="Permalink to &quot;3. Supporting Dimension Tables&quot;">​</a></h4><ul><li><code>dim_provinces</code>: Province master data</li><li><code>dim_regencies</code>: Regency master data</li><li><code>dim_entities</code>: Entity master data</li><li><code>dim_master_materials</code>: Material master data</li><li><code>dim_master_activities</code>: Activity master data</li><li><code>dim_entity_tags</code>: Entity tag classifications</li><li><code>dim_entity_entity_tags</code>: Entity-tag relationships</li><li><code>dim_transaction_reasons</code>: Transaction reason codes</li></ul><h2 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h2><h3 id="common-parameters" tabindex="-1">Common Parameters <a class="header-anchor" href="#common-parameters" aria-label="Permalink to &quot;Common Parameters&quot;">​</a></h3><ul><li><code>isVaccine</code>: Filter by vaccine/non-vaccine materials (boolean)</li><li><code>activityId</code>: Filter by specific activity ID</li><li><code>entityId</code>: Filter by specific entity ID</li><li><code>entityTags</code>: Filter by entity tag IDs (array)</li><li><code>entityType</code>: Filter by entity type</li><li><code>masterMaterialId</code>: Filter by material ID</li><li><code>provinceId</code>: Filter by province ID</li><li><code>regencyId</code>: Filter by regency ID</li><li><code>transactionType</code>: Filter by transaction type ID</li><li><code>period</code>: Time period grouping (day, week, month, year)</li><li><code>from</code>: Start date (YYYY-MM-DD)</li><li><code>to</code>: End date (YYYY-MM-DD)</li><li><code>page</code>: Pagination page number</li><li><code>limit</code>: Pagination limit</li><li><code>currentDate</code>: Current date for calculations</li></ul><h2 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h2><h3 id="core-helper-functions" tabindex="-1">Core Helper Functions <a class="header-anchor" href="#core-helper-functions" aria-label="Permalink to &quot;Core Helper Functions&quot;">​</a></h3><h4 id="_1-getcounttransactionparam-req" tabindex="-1">1. <code>getCountTransactionParam(req)</code> <a class="header-anchor" href="#_1-getcounttransactionparam-req" aria-label="Permalink to &quot;1. \`getCountTransactionParam(req)\`&quot;">​</a></h4><p><strong>File:</strong> <code>transaction.js</code><strong>Purpose:</strong> Parses and standardizes request parameters</p><p><strong>Features:</strong></p><ul><li>Parameter validation and type conversion</li><li>User role-based filtering for province/regency</li><li>Date range validation</li><li>Default value assignment</li></ul><h4 id="_2-getsrccounttransactiondata-queryparam" tabindex="-1">2. <code>getSrcCountTransactionData(queryParam)</code> <a class="header-anchor" href="#_2-getsrccounttransactiondata-queryparam" aria-label="Permalink to &quot;2. \`getSrcCountTransactionData(queryParam)\`&quot;">​</a></h4><p><strong>File:</strong> <code>countTransactionQueries.js</code><strong>Purpose:</strong> Executes main transaction data query</p><p><strong>Features:</strong></p><ul><li>Dynamic WHERE clause construction</li><li>Date range filtering on <code>transactions_createdAt</code></li><li>Entity activity date filtering via subquery</li><li>Groups by material, entity, activity, period, and location</li></ul><h4 id="_3-getotalcounttransaction-data-informationtype" tabindex="-1">3. <code>geTotalCountTransaction(data, informationType)</code> <a class="header-anchor" href="#_3-getotalcounttransaction-data-informationtype" aria-label="Permalink to &quot;3. \`geTotalCountTransaction(data, informationType)\`&quot;">​</a></h4><p><strong>File:</strong> <code>transaction.js</code><strong>Purpose:</strong> Calculates total transaction count or quantity</p><p><strong>Parameters:</strong></p><ul><li><code>data</code>: Transaction data array</li><li><code>informationType</code>: &#39;frequency&#39; or &#39;quantity&#39;</li></ul><h4 id="_4-getcounttransactionvalue-data-column-informationtype" tabindex="-1">4. <code>getCountTransactionValue(data, column, informationType)</code> <a class="header-anchor" href="#_4-getcounttransactionvalue-data-column-informationtype" aria-label="Permalink to &quot;4. \`getCountTransactionValue(data, column, informationType)\`&quot;">​</a></h4><p><strong>File:</strong> <code>transaction.js</code><strong>Purpose:</strong> Sums values from transaction data</p><p><strong>Parameters:</strong></p><ul><li><code>data</code>: Transaction data array</li><li><code>column</code>: Column to sum</li><li><code>informationType</code>: &#39;frequency&#39; or &#39;quantity&#39;</li></ul><h4 id="_5-gettransactiontypeseries-transactiontype" tabindex="-1">5. <code>getTransactionTypeSeries(transactionType)</code> <a class="header-anchor" href="#_5-gettransactiontypeseries-transactiontype" aria-label="Permalink to &quot;5. \`getTransactionTypeSeries(transactionType)\`&quot;">​</a></h4><p><strong>File:</strong> <code>transaction.js</code><strong>Purpose:</strong> Provides transaction type metadata</p><p><strong>Returns:</strong> Array of transaction types with:</p><ul><li><code>id</code>: Transaction type ID</li><li><code>label</code>: Display label</li><li><code>column</code>: Database column name</li><li><code>color</code>: Chart color</li></ul><h3 id="excel-export-functions" tabindex="-1">Excel Export Functions <a class="header-anchor" href="#excel-export-functions" aria-label="Permalink to &quot;Excel Export Functions&quot;">​</a></h3><h4 id="_1-exceltemplatecounttransaction-options" tabindex="-1">1. <code>excelTemplateCountTransaction(options)</code> <a class="header-anchor" href="#_1-exceltemplatecounttransaction-options" aria-label="Permalink to &quot;1. \`excelTemplateCountTransaction(options)\`&quot;">​</a></h4><p><strong>File:</strong> <code>excel.js</code><strong>Purpose:</strong> Generates Excel reports for count transaction data</p><p><strong>Features:</strong></p><ul><li>Dynamic column generation based on transaction types</li><li>Multi-language support (Indonesian/English)</li><li>Period-based data organization</li><li>Entity hierarchy support (province, regency, entity)</li><li>Custom styling and formatting</li></ul><h4 id="_2-createworkbook-options" tabindex="-1">2. <code>createWorkbook(options)</code> <a class="header-anchor" href="#_2-createworkbook-options" aria-label="Permalink to &quot;2. \`createWorkbook(options)\`&quot;">​</a></h4><p><strong>File:</strong> <code>excel.js</code><strong>Purpose:</strong> Creates Excel workbook with headers and formatting</p><p><strong>Features:</strong></p><ul><li>Title and filter information</li><li>Dynamic column headers</li><li>Cell merging for period grouping</li><li>Styling and alignment</li></ul><h2 id="transaction-types" tabindex="-1">Transaction Types <a class="header-anchor" href="#transaction-types" aria-label="Permalink to &quot;Transaction Types&quot;">​</a></h2><h3 id="supported-transaction-types" tabindex="-1">Supported Transaction Types <a class="header-anchor" href="#supported-transaction-types" aria-label="Permalink to &quot;Supported Transaction Types&quot;">​</a></h3><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">TRANSACTION_TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  STOCK_COUNT: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Hitung Stok</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ISSUES: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Pengeluaran</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  RECEIPTS: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,        </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Penerimaan</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  DISCARDS: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,        </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Pembuangan</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  RETURN: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Pengembalian</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  OPENED_RECEIVES: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">6</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Penerimaan Buka</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  STOCK_ADD: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">7</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,       </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Tambah Stok</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  STOCK_REMOVE: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">8</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Kurangi Stok</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  CANCEL_DISCARD: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">11</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Batal Pembuangan</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="transaction-type-series-configuration" tabindex="-1">Transaction Type Series Configuration <a class="header-anchor" href="#transaction-type-series-configuration" aria-label="Permalink to &quot;Transaction Type Series Configuration&quot;">​</a></h3><p>Each transaction type includes:</p><ul><li><strong>Label:</strong> Human-readable name</li><li><strong>Column:</strong> Database column for quantity/count</li><li><strong>Color:</strong> Visualization color code</li></ul><h2 id="entity-types" tabindex="-1">Entity Types <a class="header-anchor" href="#entity-types" aria-label="Permalink to &quot;Entity Types&quot;">​</a></h2><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">ENTITY_TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  PROVINCE: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,           </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Dinkes Provinsi</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  CITY: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,              </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Dinkes Kabupaten/Kota</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  FASKES: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,            </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Faskes</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  VACCINE_CENTER: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Pusat Vaksin</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  INSTALASI_FARMASI: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">95</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Instalasi Farmasi</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  KEMENKES_RI: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">97</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,      </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Kemenkes RI</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  GUDANG_VAKSIN: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">98</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">     // Gudang Vaksin</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="export-types" tabindex="-1">Export Types <a class="header-anchor" href="#export-types" aria-label="Permalink to &quot;Export Types&quot;">​</a></h2><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">EXPORT_TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  COUNT_TRANSACTION: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Hitung Transaksi&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">EXPORT_DETAIL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  OVERVIEW: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Keseluruhan&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  MATERIAL: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Material&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ENTITY: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Entitas&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  LOCATION: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Lokasi&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="data-flow" tabindex="-1">Data Flow <a class="header-anchor" href="#data-flow" aria-label="Permalink to &quot;Data Flow&quot;">​</a></h2><h3 id="_1-request-processing" tabindex="-1">1. Request Processing <a class="header-anchor" href="#_1-request-processing" aria-label="Permalink to &quot;1. Request Processing&quot;">​</a></h3><ol><li>Authentication and authorization check</li><li>Parameter parsing via <code>getCountTransactionParam()</code></li><li>Cache check (for cached endpoints)</li><li>Query execution via <code>getSrcCountTransactionData()</code></li></ol><h3 id="_2-data-processing" tabindex="-1">2. Data Processing <a class="header-anchor" href="#_2-data-processing" aria-label="Permalink to &quot;2. Data Processing&quot;">​</a></h3><ol><li>Raw data retrieval from ClickHouse</li><li>Data grouping by specified dimension</li><li>Calculation of totals and percentages</li><li>Series data generation for charts</li></ol><h3 id="_3-response-generation" tabindex="-1">3. Response Generation <a class="header-anchor" href="#_3-response-generation" aria-label="Permalink to &quot;3. Response Generation&quot;">​</a></h3><ol><li>JSON response for API endpoints</li><li>Excel file generation for download endpoints</li><li>Cache storage (for cached endpoints)</li></ol><h2 id="performance-considerations" tabindex="-1">Performance Considerations <a class="header-anchor" href="#performance-considerations" aria-label="Permalink to &quot;Performance Considerations&quot;">​</a></h2><h3 id="caching-strategy" tabindex="-1">Caching Strategy <a class="header-anchor" href="#caching-strategy" aria-label="Permalink to &quot;Caching Strategy&quot;">​</a></h3><ul><li>Redis caching enabled for data retrieval endpoints</li><li>Cache key based on request parameters</li><li>Improves response time for frequently accessed data</li></ul><h3 id="database-optimization" tabindex="-1">Database Optimization <a class="header-anchor" href="#database-optimization" aria-label="Permalink to &quot;Database Optimization&quot;">​</a></h3><ul><li>Uses ClickHouse for analytical queries</li><li>Optimized date range filtering</li><li>Efficient grouping and aggregation</li><li>Subquery optimization for entity activity dates</li></ul><h3 id="query-optimization" tabindex="-1">Query Optimization <a class="header-anchor" href="#query-optimization" aria-label="Permalink to &quot;Query Optimization&quot;">​</a></h3><ul><li>Dynamic WHERE clause construction</li><li>Indexed columns for filtering</li><li>Efficient JOIN operations</li><li>Pagination support for large datasets</li></ul><h2 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h2><h3 id="common-error-scenarios" tabindex="-1">Common Error Scenarios <a class="header-anchor" href="#common-error-scenarios" aria-label="Permalink to &quot;Common Error Scenarios&quot;">​</a></h3><ol><li><strong>Invalid Parameters:</strong> Parameter validation in helper functions</li><li><strong>Database Errors:</strong> Connection and query execution errors</li><li><strong>Authorization Errors:</strong> Role-based access control</li><li><strong>Cache Errors:</strong> Redis connection issues</li></ol><h3 id="error-response-format" tabindex="-1">Error Response Format <a class="header-anchor" href="#error-response-format" aria-label="Permalink to &quot;Error Response Format&quot;">​</a></h3><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &quot;error&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Error message&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &quot;code&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ERROR_CODE&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &quot;details&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Additional error details&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="usage-examples" tabindex="-1">Usage Examples <a class="header-anchor" href="#usage-examples" aria-label="Permalink to &quot;Usage Examples&quot;">​</a></h2><h3 id="_1-get-transaction-overview" tabindex="-1">1. Get Transaction Overview <a class="header-anchor" href="#_1-get-transaction-overview" aria-label="Permalink to &quot;1. Get Transaction Overview&quot;">​</a></h3><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/all?from=2024-01-01&amp;to=2024-01-31&amp;period=day&amp;activityId=1</span></span></code></pre></div><h3 id="_2-get-material-based-transactions" tabindex="-1">2. Get Material-based Transactions <a class="header-anchor" href="#_2-get-material-based-transactions" aria-label="Permalink to &quot;2. Get Material-based Transactions&quot;">​</a></h3><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/material?provinceId=11&amp;isVaccine=true&amp;transactionType=3</span></span></code></pre></div><h3 id="_3-download-entity-report" tabindex="-1">3. Download Entity Report <a class="header-anchor" href="#_3-download-entity-report" aria-label="Permalink to &quot;3. Download Entity Report&quot;">​</a></h3><div class="language-http vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">http</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GET</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /dashboard/count-transaction/entity/download?entityType=3&amp;from=2024-01-01&amp;to=2024-01-31</span></span></code></pre></div><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><h3 id="external-libraries" tabindex="-1">External Libraries <a class="header-anchor" href="#external-libraries" aria-label="Permalink to &quot;External Libraries&quot;">​</a></h3><ul><li><strong>Express.js:</strong> Web framework</li><li><strong>Lodash:</strong> Utility functions</li><li><strong>ExcelJS:</strong> Excel file generation</li><li><strong>Moment.js:</strong> Date manipulation</li><li><strong>Redis:</strong> Caching</li></ul><h3 id="internal-dependencies" tabindex="-1">Internal Dependencies <a class="header-anchor" href="#internal-dependencies" aria-label="Permalink to &quot;Internal Dependencies&quot;">​</a></h3><ul><li><strong>Database Connection:</strong> ClickHouse client</li><li><strong>Authentication Middleware:</strong> User authentication</li><li><strong>Role Middleware:</strong> Authorization</li><li><strong>Cache Middleware:</strong> Redis caching</li></ul><h2 id="file-structure" tabindex="-1">File Structure <a class="header-anchor" href="#file-structure" aria-label="Permalink to &quot;File Structure&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>warehouse-api/</span></span>
<span class="line"><span>├── app/</span></span>
<span class="line"><span>│   ├── controllers/</span></span>
<span class="line"><span>│   │   └── countTransactionController.js    # Main controller</span></span>
<span class="line"><span>│   ├── routes/</span></span>
<span class="line"><span>│   │   └── dashboard/</span></span>
<span class="line"><span>│   │       ├── index.js                     # Dashboard router</span></span>
<span class="line"><span>│   │       └── countTransaction.js          # Count transaction routes</span></span>
<span class="line"><span>│   └── helpers/</span></span>
<span class="line"><span>│       ├── constants.js                     # Application constants</span></span>
<span class="line"><span>│       ├── transaction.js                   # Transaction helper functions</span></span>
<span class="line"><span>│       └── partial-queries/</span></span>
<span class="line"><span>│           ├── countTransactionQueries.js   # Database queries</span></span>
<span class="line"><span>│           └── excel.js                     # Excel generation</span></span></code></pre></div><h2 id="maintenance-notes" tabindex="-1">Maintenance Notes <a class="header-anchor" href="#maintenance-notes" aria-label="Permalink to &quot;Maintenance Notes&quot;">​</a></h2><h3 id="regular-maintenance-tasks" tabindex="-1">Regular Maintenance Tasks <a class="header-anchor" href="#regular-maintenance-tasks" aria-label="Permalink to &quot;Regular Maintenance Tasks&quot;">​</a></h3><ol><li><strong>Cache Management:</strong> Monitor Redis memory usage</li><li><strong>Query Performance:</strong> Review slow query logs</li><li><strong>Data Validation:</strong> Verify data integrity</li><li><strong>Error Monitoring:</strong> Track error rates and patterns</li></ol><h3 id="future-enhancements" tabindex="-1">Future Enhancements <a class="header-anchor" href="#future-enhancements" aria-label="Permalink to &quot;Future Enhancements&quot;">​</a></h3><ol><li><strong>Real-time Updates:</strong> WebSocket support for live data</li><li><strong>Advanced Filtering:</strong> Additional filter options</li><li><strong>Custom Reports:</strong> User-defined report templates</li><li><strong>API Versioning:</strong> Support for multiple API versions</li></ol><hr><p><em>Last Updated: January 2025</em><em>Version: 1.0</em></p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/count-transaction-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var count_transaction_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, count_transaction_api_default as default };
