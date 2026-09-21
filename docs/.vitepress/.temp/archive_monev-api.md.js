import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/monev-api.md
var __pageData = JSON.parse("{\"title\":\"Monev API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/monev-api.md\",\"filePath\":\"archive/monev-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/monev-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="monev-api-documentation" tabindex="-1">Monev API Documentation <a class="header-anchor" href="#monev-api-documentation" aria-label="Permalink to &quot;Monev API Documentation&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Tidak ada route <code>/monev</code> di <code>wire.ts</code> manapun; hanya tabel EMONEV yang tersisa di migrasi. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Monev (Monitoring and Evaluation) API provides comprehensive monitoring capabilities for healthcare supply chain management, focusing on stock tracking, distribution monitoring, and receipt status evaluation across different administrative levels (Province, Regency/City, Healthcare Facilities).</p><h3 id="core-functionalities" tabindex="-1">Core Functionalities <a class="header-anchor" href="#core-functionalities" aria-label="Permalink to &quot;Core Functionalities&quot;">​</a></h3><ul><li><strong>Stock Monitoring</strong>: Track current stock levels and availability</li><li><strong>Receipt Tracking</strong>: Monitor items not yet received (in-transit status)</li><li><strong>Multi-level Analysis</strong>: Support for Province, Regency/City, and Healthcare Facility levels</li><li><strong>Excel Export</strong>: Generate detailed reports with filtering capabilities</li><li><strong>Real-time Updates</strong>: Provide last updated timestamps for data freshness</li></ul><h2 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Method</th><th>Endpoint</th><th>Controller Function</th><th>Description</th></tr></thead><tbody><tr><td>GET</td><td><code>/monev/stock</code></td><td><code>stock()</code></td><td>Retrieve current stock levels and availability data</td></tr><tr><td>GET</td><td><code>/monev/not-received</code></td><td><code>notReceived()</code></td><td>Get items not yet received (in-transit status)</td></tr><tr><td>GET</td><td><code>/monev/download</code></td><td><code>download()</code></td><td>Export comprehensive Excel report with filtering</td></tr></tbody></table><h2 id="database-tables" tabindex="-1">Database Tables <a class="header-anchor" href="#database-tables" aria-label="Permalink to &quot;Database Tables&quot;">​</a></h2><h3 id="primary-data-tables" tabindex="-1">Primary Data Tables <a class="header-anchor" href="#primary-data-tables" aria-label="Permalink to &quot;Primary Data Tables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Table Name</th><th>Purpose</th><th>Key Fields</th></tr></thead><tbody><tr><td><code>datamart_transactions</code></td><td>Core transaction data for all supply chain activities</td><td><code>transactions_entity_id</code>, <code>transactions_activity_id</code>, <code>transactions_master_material_id</code>, <code>transactions_createdAt_date</code>, <code>entities_entity_tag_id</code>, <code>master_materials_is_vaccine</code></td></tr></tbody></table><h3 id="dimension-tables" tabindex="-1">Dimension Tables <a class="header-anchor" href="#dimension-tables" aria-label="Permalink to &quot;Dimension Tables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Table Name</th><th>Purpose</th><th>Key Fields</th></tr></thead><tbody><tr><td><code>dim_provinces</code></td><td>Province master data</td><td><code>id</code>, <code>name</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_regencies</code></td><td>Regency/City master data</td><td><code>id</code>, <code>name</code>, <code>province_id</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_entities</code></td><td>Healthcare facilities and entities</td><td><code>id</code>, <code>name</code>, <code>code</code>, <code>province_id</code>, <code>regency_id</code>, <code>status</code>, <code>is_puskesmas</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_master_materials</code></td><td>Material master data</td><td><code>id</code>, <code>name</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_master_activities</code></td><td>Activity types</td><td><code>id</code>, <code>name</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_entity_tags</code></td><td>Entity classification tags</td><td><code>id</code>, <code>title</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_entity_entity_tags</code></td><td>Entity-tag relationships</td><td><code>entity_id</code>, <code>entity_tag_id</code></td></tr><tr><td><code>dim_entity_activity_date</code></td><td>Entity activity date ranges</td><td><code>entity_id</code>, <code>activity_id</code>, <code>join_date</code>, <code>end_date</code></td></tr><tr><td><code>dim_batches</code></td><td>Batch information</td><td><code>batches_id</code>, <code>batches_code</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_sub_districts</code></td><td>Sub-district data</td><td><code>id</code>, <code>name</code>, <code>deleted_at</code></td></tr><tr><td><code>dim_orders</code></td><td>Order information</td><td>Used in transaction joins</td></tr></tbody></table><h2 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h2><h3 id="common-parameters" tabindex="-1">Common Parameters <a class="header-anchor" href="#common-parameters" aria-label="Permalink to &quot;Common Parameters&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr></thead><tbody><tr><td><code>to</code></td><td>Date</td><td>End date for data filtering</td><td>Current date</td></tr><tr><td><code>page</code></td><td>Integer</td><td>Page number for pagination</td><td>1</td></tr><tr><td><code>paginate</code></td><td>Integer</td><td>Items per page</td><td>10</td></tr><tr><td><code>type</code></td><td>Integer</td><td>Entity type (1=Province, 2=City, 3=Faskes)</td><td>-</td></tr></tbody></table><h3 id="filtering-parameters" tabindex="-1">Filtering Parameters <a class="header-anchor" href="#filtering-parameters" aria-label="Permalink to &quot;Filtering Parameters&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>provinceIds</code></td><td>Array[Int]</td><td>Filter by specific province IDs</td></tr><tr><td><code>regencyIds</code></td><td>Array[Int]</td><td>Filter by specific regency IDs</td></tr><tr><td><code>entityIds</code></td><td>Array[Int]</td><td>Filter by specific entity IDs</td></tr><tr><td><code>activityId</code></td><td>Array[Int]</td><td>Filter by activity types</td></tr><tr><td><code>masterMaterialId</code></td><td>Array[Int]</td><td>Filter by specific materials</td></tr><tr><td><code>entityTags</code></td><td>Array[Int]</td><td>Filter by entity tags</td></tr><tr><td><code>isVaccine</code></td><td>Array[Int]</td><td>Filter by vaccine status (0=Non-vaccine, 1=Vaccine)</td></tr><tr><td><code>batch</code></td><td>Array[Int]</td><td>Filter by batch IDs</td></tr><tr><td><code>startExpiredDate</code></td><td>Date</td><td>Start date for expiration filtering</td></tr><tr><td><code>endExpiredDate</code></td><td>Date</td><td>End date for expiration filtering</td></tr></tbody></table><h2 id="response-data-structure" tabindex="-1">Response Data Structure <a class="header-anchor" href="#response-data-structure" aria-label="Permalink to &quot;Response Data Structure&quot;">​</a></h2><h3 id="stock-not-received-response" tabindex="-1">Stock/Not Received Response <a class="header-anchor" href="#stock-not-received-response" aria-label="Permalink to &quot;Stock/Not Received Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;total&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">150</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;current_page&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;total_page&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">15</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;summary&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">150</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;list&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;row_number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;entity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Entity Name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;province&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Province Name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;regency&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Regency Name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;stock&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;stock_in_transit&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">25</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;entity_tag&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Tag Name&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;last_updated&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-01-15 10:30:00&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="download-response" tabindex="-1">Download Response <a class="header-anchor" href="#download-response" aria-label="Permalink to &quot;Download Response&quot;">​</a></h3><ul><li><strong>Content-Type</strong>: <code>application/vnd.openxmlformats-officedocument.spreadsheetml.sheet</code></li><li><strong>Headers</strong>: <ul><li><code>Content-Disposition</code>: <code>attachment; filename=&quot;filename.xlsx&quot;</code></li><li><code>Filename</code>: Excel file name</li><li><code>Access-Control-Expose-Headers</code>: <code>Filename</code></li></ul></li></ul><h2 id="entity-types" tabindex="-1">Entity Types <a class="header-anchor" href="#entity-types" aria-label="Permalink to &quot;Entity Types&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Type</th><th>Value</th><th>Description</th><th>Additional Columns</th></tr></thead><tbody><tr><td>Province</td><td>1</td><td>Provincial level analysis</td><td>Base columns only</td></tr><tr><td>City/Regency</td><td>2</td><td>City/Regency level analysis</td><td>+ Province column</td></tr><tr><td>Healthcare Facility</td><td>3</td><td>Facility level analysis</td><td>+ Regency + Entity Tag columns</td></tr></tbody></table><h2 id="core-functions" tabindex="-1">Core Functions <a class="header-anchor" href="#core-functions" aria-label="Permalink to &quot;Core Functions&quot;">​</a></h2><h3 id="main-controller-functions" tabindex="-1">Main Controller Functions <a class="header-anchor" href="#main-controller-functions" aria-label="Permalink to &quot;Main Controller Functions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Function</th><th>Purpose</th><th>Parameters</th></tr></thead><tbody><tr><td><code>stock()</code></td><td>Get current stock data</td><td><code>req</code>, <code>res</code>, <code>next</code></td></tr><tr><td><code>notReceived()</code></td><td>Get not-received items data</td><td><code>req</code>, <code>res</code>, <code>next</code></td></tr><tr><td><code>download()</code></td><td>Export Excel report</td><td><code>req</code>, <code>res</code>, <code>next</code></td></tr></tbody></table><h3 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Function</th><th>Source File</th><th>Purpose</th></tr></thead><tbody><tr><td><code>calculatingMonev()</code></td><td><code>monevQueries.js</code></td><td>Core data calculation with complex joins</td></tr><tr><td><code>getLastUpdated()</code></td><td><code>rawQueries.js</code></td><td>Get last update timestamp</td></tr><tr><td><code>generateQueryParam()</code></td><td>Internal</td><td>Standardize query parameters</td></tr><tr><td><code>processor()</code></td><td>Internal</td><td>Process requests for both stock and not-received</td></tr><tr><td><code>excelFilterColumns()</code></td><td>Internal</td><td>Generate Excel filter metadata</td></tr><tr><td><code>excelMaterialColumns()</code></td><td>Internal</td><td>Generate Excel material filter metadata</td></tr></tbody></table><h3 id="dimension-helper-functions" tabindex="-1">Dimension Helper Functions <a class="header-anchor" href="#dimension-helper-functions" aria-label="Permalink to &quot;Dimension Helper Functions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Function</th><th>Source File</th><th>Purpose</th><th>Tables Queried</th></tr></thead><tbody><tr><td><code>getWholeProvinces()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get province details</td><td><code>dim_provinces</code></td></tr><tr><td><code>getWholeRegencies()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get regency details</td><td><code>dim_regencies</code></td></tr><tr><td><code>getWholeHospital()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get healthcare facility details</td><td><code>dim_entities</code></td></tr><tr><td><code>getMaterialDetail()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get material details</td><td><code>dim_master_materials</code></td></tr><tr><td><code>getActivityDetail()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get activity details</td><td><code>dim_master_activities</code></td></tr><tr><td><code>getWholeBatches()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get batch details</td><td><code>dim_batches</code></td></tr><tr><td><code>getWholeEntityTags()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get entity tag details</td><td><code>dim_entity_tags</code></td></tr><tr><td><code>getEntityDetail()</code></td><td><code>detailDimensionsQueries.js</code></td><td>Get detailed entity info with joins</td><td><code>dim_entities</code>, <code>datamart_transactions</code>, <code>dim_entity_activity_date</code></td></tr></tbody></table><h2 id="technical-details" tabindex="-1">Technical Details <a class="header-anchor" href="#technical-details" aria-label="Permalink to &quot;Technical Details&quot;">​</a></h2><h3 id="database-technology" tabindex="-1">Database Technology <a class="header-anchor" href="#database-technology" aria-label="Permalink to &quot;Database Technology&quot;">​</a></h3><ul><li><strong>Database</strong>: ClickHouse</li><li><strong>Connection</strong>: <code>officialClient</code> from <code>@/database/connection</code></li><li><strong>Query Style</strong>: Parameterized queries with ClickHouse-specific syntax</li></ul><h3 id="key-features" tabindex="-1">Key Features <a class="header-anchor" href="#key-features" aria-label="Permalink to &quot;Key Features&quot;">​</a></h3><ul><li><strong>Dynamic Query Building</strong>: Queries are constructed dynamically based on filters</li><li><strong>Complex Joins</strong>: Multi-table joins across dimension and fact tables</li><li><strong>Pagination Support</strong>: Built-in pagination for large datasets</li><li><strong>Excel Export</strong>: Comprehensive Excel generation with multiple sheets</li><li><strong>Date Filtering</strong>: Flexible date range filtering with default values</li><li><strong>Entity Hierarchy</strong>: Support for multi-level administrative hierarchy</li></ul><h3 id="performance-considerations" tabindex="-1">Performance Considerations <a class="header-anchor" href="#performance-considerations" aria-label="Permalink to &quot;Performance Considerations&quot;">​</a></h3><ul><li>Uses <code>FINAL</code> modifier for ClickHouse optimization</li><li>Parameterized queries to prevent SQL injection</li><li>Efficient pagination implementation</li><li>Conditional joins based on requirements</li></ul><h3 id="constants-and-enums" tabindex="-1">Constants and Enums <a class="header-anchor" href="#constants-and-enums" aria-label="Permalink to &quot;Constants and Enums&quot;">​</a></h3><ul><li><code>ENTITY_TYPE</code>: Province (1), City (2), Faskes (3)</li><li><code>ENTITY_STATUS.ACTIVE</code>: Active entity status filter</li><li><code>MONEV_FIELD</code>: Field mappings for monev calculations</li></ul><h3 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h3><ul><li>Try-catch blocks in all main functions</li><li>Error propagation to Express error handler via <code>next(err)</code></li><li>Graceful handling of missing parameters with defaults</li></ul><h3 id="excel-export-features" tabindex="-1">Excel Export Features <a class="header-anchor" href="#excel-export-features" aria-label="Permalink to &quot;Excel Export Features&quot;">​</a></h3><ul><li><strong>Multiple Sheets</strong>: Separate sheets for different data types</li><li><strong>Dynamic Columns</strong>: Columns adjust based on entity type</li><li><strong>Filter Summary</strong>: Comprehensive filter information in export</li><li><strong>Metadata</strong>: Export timestamp and totals included</li><li><strong>Regional Naming</strong>: Dynamic file naming based on selected regions</li></ul><h2 id="data-flow" tabindex="-1">Data Flow <a class="header-anchor" href="#data-flow" aria-label="Permalink to &quot;Data Flow&quot;">​</a></h2><ol><li><strong>Request Processing</strong>: Parameters validated and standardized</li><li><strong>Query Execution</strong>: Dynamic SQL construction and execution</li><li><strong>Data Processing</strong>: Results formatted with pagination and metadata</li><li><strong>Response</strong>: JSON response or Excel file download</li><li><strong>Timestamp</strong>: Last updated information included for data freshness</li></ol></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/monev-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var monev_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, monev_api_default as default };
