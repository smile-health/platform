import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/dashboards/consumption-supply-api.md
var __pageData = JSON.parse("{\"title\":\"Consumption Supply API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/dashboards/consumption-supply-api.md\",\"filePath\":\"architecture/dashboards/consumption-supply-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/dashboards/consumption-supply-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="consumption-supply-api-documentation" tabindex="-1">Consumption Supply API Documentation <a class="header-anchor" href="#consumption-supply-api-documentation" aria-label="Permalink to &quot;Consumption Supply API Documentation&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Consumption Supply API provides comprehensive functionality for tracking and analyzing consumption and supply data across different time periods, locations, entities, and materials. It supports both overview and detailed reporting with Excel export capabilities.</p><h2 id="core-functionality" tabindex="-1">Core Functionality <a class="header-anchor" href="#core-functionality" aria-label="Permalink to &quot;Core Functionality&quot;">​</a></h2><ul><li><strong>Consumption &amp; Supply Tracking</strong>: Monitor consumption and supply quantities over time</li><li><strong>Multi-dimensional Analysis</strong>: Analyze data by location, entity, material, and time periods</li><li><strong>Flexible Time Periods</strong>: Support for daily and monthly reporting</li><li><strong>Excel Export</strong>: Generate downloadable Excel reports with filtering</li><li><strong>Real-time Data</strong>: Access to last updated timestamps</li><li><strong>Comparative Analysis</strong>: Above/below threshold comparisons</li></ul><h2 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h2><h3 id="_1-consumption-supply-all" tabindex="-1">1. <code>/consumption-supply/all</code> <a class="header-anchor" href="#_1-consumption-supply-all" aria-label="Permalink to &quot;1. \`/consumption-supply/all\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Retrieve overview consumption and supply data across time periods</li><li><strong>Features</strong>: <ul><li>Time-based aggregation (daily/monthly)</li><li>Consumption vs supply comparison</li><li>Position indicators (ABOVE/BELOW)</li><li>Supports filtering by information type</li></ul></li></ul><h3 id="_2-consumption-supply-all-download" tabindex="-1">2. <code>/consumption-supply/all/download</code> <a class="header-anchor" href="#_2-consumption-supply-all-download" aria-label="Permalink to &quot;2. \`/consumption-supply/all/download\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Download Excel report for overview data</li><li><strong>Features</strong>: <ul><li>Excel template with overview format</li><li>Filtered data export</li><li>Localization support (ID/EN)</li></ul></li></ul><h3 id="_3-consumption-supply-location" tabindex="-1">3. <code>/consumption-supply/location</code> <a class="header-anchor" href="#_3-consumption-supply-location" aria-label="Permalink to &quot;3. \`/consumption-supply/location\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Retrieve consumption and supply data by location</li><li><strong>Features</strong>: <ul><li>Location-based breakdown</li><li>Province and regency information</li><li>Pagination support</li><li>Time series data per location</li></ul></li></ul><h3 id="_4-consumption-supply-location-download" tabindex="-1">4. <code>/consumption-supply/location/download</code> <a class="header-anchor" href="#_4-consumption-supply-location-download" aria-label="Permalink to &quot;4. \`/consumption-supply/location/download\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Download Excel report for location-based data</li><li><strong>Features</strong>: <ul><li>Location-specific Excel template</li><li>Comprehensive filtering</li></ul></li></ul><h3 id="_5-consumption-supply-entity" tabindex="-1">5. <code>/consumption-supply/entity</code> <a class="header-anchor" href="#_5-consumption-supply-entity" aria-label="Permalink to &quot;5. \`/consumption-supply/entity\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Retrieve consumption and supply data by entity</li><li><strong>Features</strong>: <ul><li>Entity-based analysis</li><li>Entity details with location context</li><li>Pagination and filtering</li></ul></li></ul><h3 id="_6-consumption-supply-entity-download" tabindex="-1">6. <code>/consumption-supply/entity/download</code> <a class="header-anchor" href="#_6-consumption-supply-entity-download" aria-label="Permalink to &quot;6. \`/consumption-supply/entity/download\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Download Excel report for entity-based data</li></ul><h3 id="_7-consumption-supply-material" tabindex="-1">7. <code>/consumption-supply/material</code> <a class="header-anchor" href="#_7-consumption-supply-material" aria-label="Permalink to &quot;7. \`/consumption-supply/material\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Retrieve consumption and supply data by material</li><li><strong>Features</strong>: <ul><li>Material-based breakdown</li><li>Material-specific analysis</li></ul></li></ul><h3 id="_8-consumption-supply-material-download" tabindex="-1">8. <code>/consumption-supply/material/download</code> <a class="header-anchor" href="#_8-consumption-supply-material-download" aria-label="Permalink to &quot;8. \`/consumption-supply/material/download\`&quot;">​</a></h3><ul><li><strong>Method</strong>: GET</li><li><strong>Purpose</strong>: Download Excel report for material-based data</li></ul><h2 id="database-tables" tabindex="-1">Database Tables <a class="header-anchor" href="#database-tables" aria-label="Permalink to &quot;Database Tables&quot;">​</a></h2><h3 id="primary-transaction-tables" tabindex="-1">Primary Transaction Tables <a class="header-anchor" href="#primary-transaction-tables" aria-label="Permalink to &quot;Primary Transaction Tables&quot;">​</a></h3><ul><li><strong><code>datamart_transactions</code></strong>: Main transaction data with consumption/supply quantities</li><li><strong><code>dim_orders</code></strong>: Order information and transaction context</li><li><strong><code>dim_entity_activity_date</code></strong>: Entity activity date relationships</li></ul><h3 id="dimension-tables" tabindex="-1">Dimension Tables <a class="header-anchor" href="#dimension-tables" aria-label="Permalink to &quot;Dimension Tables&quot;">​</a></h3><ul><li><strong><code>dim_entities</code></strong>: Entity master data (hospitals, clinics, etc.)</li><li><strong><code>dim_entity_entity_tags</code></strong>: Entity tag relationships</li><li><strong><code>dim_entity_tags</code></strong>: Entity tag definitions</li><li><strong><code>dim_provinces</code></strong>: Province master data</li><li><strong><code>dim_regencies</code></strong>: Regency/city master data</li><li><strong><code>dim_master_materials</code></strong>: Material master data</li><li><strong><code>dim_master_material_has_activities</code></strong>: Material-activity relationships</li><li><strong><code>dim_batches</code></strong>: Batch information</li><li><strong><code>dim_sub_districts</code></strong>: Sub-district data</li></ul><h2 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h2><h3 id="time-parameters" tabindex="-1">Time Parameters <a class="header-anchor" href="#time-parameters" aria-label="Permalink to &quot;Time Parameters&quot;">​</a></h3><ul><li><strong><code>from</code></strong>: Start date (YYYY-MM-DD format)</li><li><strong><code>to</code></strong>: End date (YYYY-MM-DD format)</li><li><strong><code>period</code></strong>: Time aggregation (&#39;daily&#39; or &#39;monthly&#39;)</li><li><strong><code>currentDate</code></strong>: Reference date for calculations</li></ul><h3 id="location-parameters" tabindex="-1">Location Parameters <a class="header-anchor" href="#location-parameters" aria-label="Permalink to &quot;Location Parameters&quot;">​</a></h3><ul><li><strong><code>provinceId</code></strong>: Filter by province ID</li><li><strong><code>regencyId</code></strong>: Filter by regency/city ID</li><li><strong><code>subDistrictId</code></strong>: Filter by sub-district ID</li></ul><h3 id="entity-parameters" tabindex="-1">Entity Parameters <a class="header-anchor" href="#entity-parameters" aria-label="Permalink to &quot;Entity Parameters&quot;">​</a></h3><ul><li><strong><code>entityId</code></strong>: Filter by specific entity IDs (array)</li><li><strong><code>entityType</code></strong>: Filter by entity type (1=hospital, etc.)</li><li><strong><code>entityTags</code></strong>: Filter by entity tag IDs (array)</li></ul><h3 id="material-parameters" tabindex="-1">Material Parameters <a class="header-anchor" href="#material-parameters" aria-label="Permalink to &quot;Material Parameters&quot;">​</a></h3><ul><li><strong><code>masterMaterialId</code></strong>: Filter by material IDs (array)</li><li><strong><code>activityId</code></strong>: Filter by activity IDs (array)</li><li><strong><code>isVaccine</code></strong>: Filter by vaccine status (array: [0,1])</li></ul><h3 id="report-parameters" tabindex="-1">Report Parameters <a class="header-anchor" href="#report-parameters" aria-label="Permalink to &quot;Report Parameters&quot;">​</a></h3><ul><li><strong><code>informationType</code></strong>: Data type (&#39;consumption&#39;, &#39;supply&#39;, or both)</li><li><strong><code>page</code></strong>: Page number for pagination</li><li><strong><code>limit</code></strong>: Records per page</li></ul><h2 id="response-structure" tabindex="-1">Response Structure <a class="header-anchor" href="#response-structure" aria-label="Permalink to &quot;Response Structure&quot;">​</a></h2><h3 id="overview-response-all" tabindex="-1">Overview Response (<code>/all</code>) <a class="header-anchor" href="#overview-response-all" aria-label="Permalink to &quot;Overview Response (\`/all\`)&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;intervalPeriod&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-02&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;column&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024 Jan&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}, {</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024 Feb&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subColumn&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;consumption&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;supply&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;overview&quot;</span><span style="${ssrRenderStyle({
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
	})}">      &quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;consumption&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;supply&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1200</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;consumptionPosition&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BELOW&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;supplyPosition&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ABOVE&quot;</span></span>
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
	})}">&quot;2024-01-15T10:30:00Z&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="detailed-response-location-entity-material" tabindex="-1">Detailed Response (<code>/location</code>, <code>/entity</code>, <code>/material</code>) <a class="header-anchor" href="#detailed-response-location-entity-material" aria-label="Permalink to &quot;Detailed Response (\`/location\`, \`/entity\`, \`/material\`)&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;intervalPeriod&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-02&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;column&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024 Jan&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}, {</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024 Feb&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subColumn&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;consumption&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;supply&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
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
	})}">  &quot;page&quot;</span><span style="${ssrRenderStyle({
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
	})}">  &quot;perPage&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
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
	})}">      &quot;id&quot;</span><span style="${ssrRenderStyle({
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
	})}">      &quot;name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Entity/Location/Material Name&quot;</span><span style="${ssrRenderStyle({
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
	})}">      &quot;overview&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">          &quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">          &quot;consumption&quot;</span><span style="${ssrRenderStyle({
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
	})}">          &quot;supply&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">120</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">          &quot;consumptionPosition&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BELOW&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">          &quot;supplyPosition&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ABOVE&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      ]</span></span>
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
	})}">&quot;2024-01-15T10:30:00Z&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="core-functions" tabindex="-1">Core Functions <a class="header-anchor" href="#core-functions" aria-label="Permalink to &quot;Core Functions&quot;">​</a></h2><h3 id="controller-functions" tabindex="-1">Controller Functions <a class="header-anchor" href="#controller-functions" aria-label="Permalink to &quot;Controller Functions&quot;">​</a></h3><ul><li><strong><code>all(req, res, next)</code></strong>: Handle overview consumption/supply data</li><li><strong><code>masterOfProcess({req, res, next, usedFor})</code></strong>: Generic processor for location/entity/material endpoints</li><li><strong><code>location(req, res, next)</code></strong>: Handle location-based data</li><li><strong><code>entity(req, res, next)</code></strong>: Handle entity-based data</li><li><strong><code>material(req, res, next)</code></strong>: Handle material-based data</li></ul><h3 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h3><ul><li><strong><code>generateQueryParam(param)</code></strong>: Standardize and validate query parameters</li><li><strong><code>getIntervalPeriod(param)</code></strong>: Generate time interval arrays</li><li><strong><code>aboveOrBelow({comparingFor, supply, consumption})</code></strong>: Calculate position indicators</li><li><strong><code>periodSwitcher(period)</code></strong>: Convert period format</li><li><strong><code>lastUpdated()</code></strong>: Get last data update timestamp</li></ul><h2 id="database-query-functions" tabindex="-1">Database Query Functions <a class="header-anchor" href="#database-query-functions" aria-label="Permalink to &quot;Database Query Functions&quot;">​</a></h2><h3 id="from-consumptionsupplyqueries-js" tabindex="-1">From consumptionSupplyQueries.js <a class="header-anchor" href="#from-consumptionsupplyqueries-js" aria-label="Permalink to &quot;From consumptionSupplyQueries.js&quot;">​</a></h3><ul><li><strong><code>countConsumptionSupply({queryParam, usedFor})</code></strong>: Main query for consumption/supply data</li><li><strong><code>getLocationList({queryParam, isDownload, usedForConsumptionSupply})</code></strong>: Retrieve location data</li><li><strong><code>getEntityList(param, paginate)</code></strong>: Retrieve entity data with pagination</li><li><strong><code>totalEntity(param)</code></strong>: Get total entity count</li><li><strong><code>getExportFilterConsumptionSupply(queryParam)</code></strong>: Generate export filter data</li><li><strong><code>locationVitalQuery(params)</code></strong>: Dynamic location query builder</li><li><strong><code>selectTheId(params, usedFor)</code></strong>: Dynamic ID selection</li></ul><h3 id="from-rawqueries-js" tabindex="-1">From rawQueries.js <a class="header-anchor" href="#from-rawqueries-js" aria-label="Permalink to &quot;From rawQueries.js&quot;">​</a></h3><ul><li><strong><code>getMaterialList(param, paginate)</code></strong>: Retrieve material data with pagination</li><li><strong><code>totalMaterial(param)</code></strong>: Get total material count</li><li><strong><code>getLastUpdated(attribute, table)</code></strong>: Get last update timestamp</li><li><strong><code>materialListQuery({param, paginate, forTotal})</code></strong>: Core material query function</li></ul><h2 id="technical-details" tabindex="-1">Technical Details <a class="header-anchor" href="#technical-details" aria-label="Permalink to &quot;Technical Details&quot;">​</a></h2><h3 id="database-technology" tabindex="-1">Database Technology <a class="header-anchor" href="#database-technology" aria-label="Permalink to &quot;Database Technology&quot;">​</a></h3><ul><li><strong>ClickHouse</strong>: Primary database for analytics and reporting</li><li><strong>Real-time Indexing</strong>: Maintains up-to-date data state</li><li><strong>Optimized Queries</strong>: Uses <code>final</code> keyword for ClickHouse optimization</li></ul><h3 id="query-building" tabindex="-1">Query Building <a class="header-anchor" href="#query-building" aria-label="Permalink to &quot;Query Building&quot;">​</a></h3><ul><li><strong>Dynamic SQL Construction</strong>: Builds queries based on provided parameters</li><li><strong>Conditional Filtering</strong>: Applies filters only when parameters are provided</li><li><strong>Join Optimization</strong>: Efficient joins across dimension tables</li><li><strong>Parameterized Queries</strong>: Prevents SQL injection with parameter binding</li></ul><h3 id="performance-considerations" tabindex="-1">Performance Considerations <a class="header-anchor" href="#performance-considerations" aria-label="Permalink to &quot;Performance Considerations&quot;">​</a></h3><ul><li><strong>Pagination</strong>: Implements limit/offset for large datasets</li><li><strong>Selective Columns</strong>: Only retrieves necessary columns</li><li><strong>Index Usage</strong>: Leverages database indexes for filtering</li><li><strong>Caching</strong>: Potential for query result caching</li></ul><h3 id="excel-export-features" tabindex="-1">Excel Export Features <a class="header-anchor" href="#excel-export-features" aria-label="Permalink to &quot;Excel Export Features&quot;">​</a></h3><ul><li><strong>Template-based Generation</strong>: Uses predefined Excel templates</li><li><strong>Localization</strong>: Supports multiple languages (ID/EN)</li><li><strong>Streaming</strong>: Efficient memory usage for large exports</li><li><strong>Custom Formatting</strong>: Applies business-specific formatting</li><li><strong>Filter Information</strong>: Includes applied filters in export</li></ul><h3 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h3><ul><li><strong>Try-Catch Blocks</strong>: Comprehensive error catching</li><li><strong>Next Middleware</strong>: Proper error forwarding</li><li><strong>Validation</strong>: Parameter validation and sanitization</li><li><strong>Graceful Degradation</strong>: Handles missing or invalid data</li></ul><h3 id="data-processing" tabindex="-1">Data Processing <a class="header-anchor" href="#data-processing" aria-label="Permalink to &quot;Data Processing&quot;">​</a></h3><ul><li><strong>Time Series Aggregation</strong>: Groups data by time periods</li><li><strong>Comparative Analysis</strong>: Calculates above/below thresholds</li><li><strong>Multi-dimensional Grouping</strong>: Supports grouping by various dimensions</li><li><strong>Real-time Calculations</strong>: Performs calculations on-the-fly</li></ul><h2 id="entity-types" tabindex="-1">Entity Types <a class="header-anchor" href="#entity-types" aria-label="Permalink to &quot;Entity Types&quot;">​</a></h2><ul><li><strong>Type 1</strong>: Hospital/Healthcare facilities</li><li><strong>Type 0</strong>: Excluded from certain queries</li><li><strong>Vendor Entities</strong>: Entities marked as vendors (<code>is_vendor=1</code>)</li><li><strong>Active Entities</strong>: Only active entities (<code>status = ACTIVE</code>)</li></ul><h2 id="constants-and-configurations" tabindex="-1">Constants and Configurations <a class="header-anchor" href="#constants-and-configurations" aria-label="Permalink to &quot;Constants and Configurations&quot;">​</a></h2><ul><li><strong><code>ENTITY_STATUS.ACTIVE</code></strong>: Active entity status constant</li><li><strong><code>ENTITY_TYPE_LABEL</code></strong>: Entity type label mappings</li><li><strong>Date Formats</strong>: Standardized date formatting across the system</li><li><strong>Timezone</strong>: Uses &#39;Asia/Jakarta&#39; timezone for date operations</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/dashboards/consumption-supply-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var consumption_supply_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, consumption_supply_api_default as default };
