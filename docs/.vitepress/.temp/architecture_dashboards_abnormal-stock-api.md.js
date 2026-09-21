import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/dashboards/abnormal-stock-api.md
var __pageData = JSON.parse("{\"title\":\"Abnormal Stock API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/dashboards/abnormal-stock-api.md\",\"filePath\":\"architecture/dashboards/abnormal-stock-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/dashboards/abnormal-stock-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="abnormal-stock-api-documentation" tabindex="-1">Abnormal Stock API Documentation <a class="header-anchor" href="#abnormal-stock-api-documentation" aria-label="Permalink to &quot;Abnormal Stock API Documentation&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Abnormal Stock API provides comprehensive analytics and reporting capabilities for tracking stock availability anomalies across the healthcare supply chain. This API enables monitoring of stock conditions that deviate from normal availability patterns, helping identify potential supply chain issues and optimize inventory management.</p><h2 id="core-functionalities" tabindex="-1">Core Functionalities <a class="header-anchor" href="#core-functionalities" aria-label="Permalink to &quot;Core Functionalities&quot;">​</a></h2><h3 id="_1-stock-availability-analysis" tabindex="-1">1. Stock Availability Analysis <a class="header-anchor" href="#_1-stock-availability-analysis" aria-label="Permalink to &quot;1. Stock Availability Analysis&quot;">​</a></h3><ul><li><strong>Multi-dimensional Analysis</strong>: Track abnormal stock patterns by material, entity, location, and time periods</li><li><strong>Threshold-based Detection</strong>: Identify stock levels below minimum thresholds or above maximum limits</li><li><strong>Trend Analysis</strong>: Monitor stock availability trends over configurable time periods (daily, weekly, monthly, quarterly)</li><li><strong>Comparative Analytics</strong>: Compare current stock levels against historical averages and expected ranges</li></ul><h3 id="_2-data-export-and-reporting" tabindex="-1">2. Data Export and Reporting <a class="header-anchor" href="#_2-data-export-and-reporting" aria-label="Permalink to &quot;2. Data Export and Reporting&quot;">​</a></h3><ul><li><strong>Excel Export</strong>: Generate detailed reports in Excel format with customizable templates</li><li><strong>Filtered Downloads</strong>: Export specific data subsets based on location, material, entity, or time range filters</li><li><strong>Overview Reports</strong>: Summary-level reports for executive dashboards and high-level monitoring</li></ul><h3 id="_3-real-time-monitoring" tabindex="-1">3. Real-time Monitoring <a class="header-anchor" href="#_3-real-time-monitoring" aria-label="Permalink to &quot;3. Real-time Monitoring&quot;">​</a></h3><ul><li><strong>Last Updated Tracking</strong>: Monitor data freshness with automatic timestamp tracking</li><li><strong>Dynamic Filtering</strong>: Real-time filtering capabilities across multiple dimensions</li><li><strong>Pagination Support</strong>: Efficient data retrieval for large datasets</li></ul><h2 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h2><h3 id="overview-endpoints" tabindex="-1">Overview Endpoints <a class="header-anchor" href="#overview-endpoints" aria-label="Permalink to &quot;Overview Endpoints&quot;">​</a></h3><ul><li><code>GET /abnormal-stock/overview</code> - Retrieve abnormal stock overview data</li><li><code>GET /abnormal-stock/overview/download</code> - Download overview data in Excel format</li></ul><h3 id="material-based-analysis" tabindex="-1">Material-based Analysis <a class="header-anchor" href="#material-based-analysis" aria-label="Permalink to &quot;Material-based Analysis&quot;">​</a></h3><ul><li><code>GET /abnormal-stock/material</code> - Get abnormal stock data grouped by material</li><li><code>GET /abnormal-stock/material/download</code> - Download material-based abnormal stock data</li></ul><h3 id="entity-based-analysis" tabindex="-1">Entity-based Analysis <a class="header-anchor" href="#entity-based-analysis" aria-label="Permalink to &quot;Entity-based Analysis&quot;">​</a></h3><ul><li><code>GET /abnormal-stock/entity</code> - Get abnormal stock data grouped by entity</li><li><code>GET /abnormal-stock/entity/download</code> - Download entity-based abnormal stock data</li></ul><h3 id="location-based-analysis" tabindex="-1">Location-based Analysis <a class="header-anchor" href="#location-based-analysis" aria-label="Permalink to &quot;Location-based Analysis&quot;">​</a></h3><ul><li><code>GET /abnormal-stock/location</code> - Get abnormal stock data grouped by location (province/regency)</li></ul><h3 id="export-and-download" tabindex="-1">Export and Download <a class="header-anchor" href="#export-and-download" aria-label="Permalink to &quot;Export and Download&quot;">​</a></h3><ul><li><code>GET /abnormal-stock/download</code> - Download detailed abnormal stock data with filters</li><li><code>GET /abnormal-stock/export-filter</code> - Get available export filter options</li></ul><h2 id="database-tables-and-schema" tabindex="-1">Database Tables and Schema <a class="header-anchor" href="#database-tables-and-schema" aria-label="Permalink to &quot;Database Tables and Schema&quot;">​</a></h2><h3 id="primary-transaction-tables" tabindex="-1">Primary Transaction Tables <a class="header-anchor" href="#primary-transaction-tables" aria-label="Permalink to &quot;Primary Transaction Tables&quot;">​</a></h3><ul><li><strong>datamart_transactions (dt)</strong>: Core transaction data with stock movements and changes</li><li><strong>dim_orders (do)</strong>: Order information linked to transactions</li><li><strong>dim_batches (db)</strong>: Batch tracking for expiration and quality control</li></ul><h3 id="dimension-tables" tabindex="-1">Dimension Tables <a class="header-anchor" href="#dimension-tables" aria-label="Permalink to &quot;Dimension Tables&quot;">​</a></h3><h4 id="material-dimensions" tabindex="-1">Material Dimensions <a class="header-anchor" href="#material-dimensions" aria-label="Permalink to &quot;Material Dimensions&quot;">​</a></h4><ul><li><strong>dim_master_materials (dmm)</strong>: Master material catalog with specifications</li><li><strong>dim_master_material_has_activities (dmmha)</strong>: Material-activity relationships</li><li><strong>dim_mapping_master_materials (dmmm)</strong>: Material mapping and categorization</li><li><strong>dim_entity_master_material_activities (demma)</strong>: Entity-material-activity associations with min/max thresholds</li></ul><h4 id="entity-and-location-dimensions" tabindex="-1">Entity and Location Dimensions <a class="header-anchor" href="#entity-and-location-dimensions" aria-label="Permalink to &quot;Entity and Location Dimensions&quot;">​</a></h4><ul><li><strong>dim_entities (de)</strong>: Healthcare entities (hospitals, clinics, warehouses)</li><li><strong>dim_entity_has_master_material (dehmm)</strong>: Entity-material relationships</li><li><strong>dim_entity_activity_date (dead)</strong>: Entity activity periods and operational dates</li><li><strong>dim_provinces (dp)</strong>: Provincial administrative boundaries</li><li><strong>dim_regencies (dr)</strong>: Regency/city administrative boundaries</li><li><strong>dim_entity_tags (det)</strong>: Entity classification tags</li><li><strong>dim_entity_entity_tags (deet)</strong>: Entity-tag associations</li></ul><h4 id="activity-and-operational-dimensions" tabindex="-1">Activity and Operational Dimensions <a class="header-anchor" href="#activity-and-operational-dimensions" aria-label="Permalink to &quot;Activity and Operational Dimensions&quot;">​</a></h4><ul><li><strong>dim_master_activities (dma)</strong>: Master activity definitions</li><li><strong>dim_entity_master_material_activities (demma)</strong>: Complex relationships between entities, materials, and activities</li></ul><h3 id="database-connections" tabindex="-1">Database Connections <a class="header-anchor" href="#database-connections" aria-label="Permalink to &quot;Database Connections&quot;">​</a></h3><ul><li><strong>Primary Database</strong>: Uses <code>officialClientJson</code> for main data warehouse queries</li><li><strong>Logistic Database</strong>: Uses <code>officialLogisticClientJson</code> for logistics-specific data</li><li><strong>Source Determination</strong>: Automatically selects appropriate database based on URL path (logistic vs immunization)</li></ul><h2 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h2><h3 id="time-and-period-filters" tabindex="-1">Time and Period Filters <a class="header-anchor" href="#time-and-period-filters" aria-label="Permalink to &quot;Time and Period Filters&quot;">​</a></h3><ul><li><code>period</code>: Time period for analysis (daily, weekly, monthly, quarterly)</li><li><code>from</code>: Start date for data range</li><li><code>to</code>: End date for data range</li></ul><h3 id="location-filters" tabindex="-1">Location Filters <a class="header-anchor" href="#location-filters" aria-label="Permalink to &quot;Location Filters&quot;">​</a></h3><ul><li><code>provinceId</code>: Filter by specific province(s)</li><li><code>regencyId</code>: Filter by specific regency/city</li><li><code>subDistrictId</code>: Filter by sub-district</li></ul><h3 id="material-and-entity-filters" tabindex="-1">Material and Entity Filters <a class="header-anchor" href="#material-and-entity-filters" aria-label="Permalink to &quot;Material and Entity Filters&quot;">​</a></h3><ul><li><code>masterMaterialId</code>: Filter by specific material(s)</li><li><code>entityId</code>: Filter by specific entity/entities</li><li><code>entityType</code>: Filter by entity type</li><li><code>entityTags</code>: Filter by entity classification tags</li><li><code>activityId</code>: Filter by specific activities</li></ul><h3 id="analysis-parameters" tabindex="-1">Analysis Parameters <a class="header-anchor" href="#analysis-parameters" aria-label="Permalink to &quot;Analysis Parameters&quot;">​</a></h3><ul><li><code>informationType</code>: Type of information to retrieve</li><li><code>transactionType</code>: Specific transaction types to analyze</li><li><code>kfa_level</code>: KFA (Key Performance Area) level for analysis</li></ul><h3 id="pagination-and-output" tabindex="-1">Pagination and Output <a class="header-anchor" href="#pagination-and-output" aria-label="Permalink to &quot;Pagination and Output&quot;">​</a></h3><ul><li><code>page</code>: Page number for paginated results</li><li><code>limit</code>: Number of records per page</li></ul><h2 id="response-data-structure" tabindex="-1">Response Data Structure <a class="header-anchor" href="#response-data-structure" aria-label="Permalink to &quot;Response Data Structure&quot;">​</a></h2><h3 id="overview-response" tabindex="-1">Overview Response <a class="header-anchor" href="#overview-response" aria-label="Permalink to &quot;Overview Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
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
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-03&quot;</span><span style="${ssrRenderStyle({
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
	})}">      &quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;availability&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">85.5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;count&quot;</span><span style="${ssrRenderStyle({
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
	})}">        &quot;total_entities&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">200</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
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
	})}">  &quot;column&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;availability&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subColumn&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
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
	})}">}</span></span></code></pre></div><h3 id="material-entity-response" tabindex="-1">Material/Entity Response <a class="header-anchor" href="#material-entity-response" aria-label="Permalink to &quot;Material/Entity Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
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
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;availability&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
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
	})}">123</span><span style="${ssrRenderStyle({
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
	})}">&quot;Vaccine A&quot;</span><span style="${ssrRenderStyle({
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
	})}">          &quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">            &quot;availability&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">75.2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">            &quot;count&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">45</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">          }</span></span>
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
	})}">  &quot;subColumn&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
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
	})}">20</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
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
	})}">}</span></span></code></pre></div><h2 id="key-features" tabindex="-1">Key Features <a class="header-anchor" href="#key-features" aria-label="Permalink to &quot;Key Features&quot;">​</a></h2><h3 id="stock-availability-calculation" tabindex="-1">Stock Availability Calculation <a class="header-anchor" href="#stock-availability-calculation" aria-label="Permalink to &quot;Stock Availability Calculation&quot;">​</a></h3><ul><li><strong>Threshold Analysis</strong>: Compares current stock levels against predefined minimum and maximum thresholds</li><li><strong>Percentage Calculation</strong>: Calculates availability percentages based on stock-to-threshold ratios</li><li><strong>Duration Tracking</strong>: Monitors how long stock levels remain in abnormal states</li><li><strong>Frequency Analysis</strong>: Tracks frequency of abnormal stock occurrences</li></ul><h3 id="multi-database-support" tabindex="-1">Multi-Database Support <a class="header-anchor" href="#multi-database-support" aria-label="Permalink to &quot;Multi-Database Support&quot;">​</a></h3><ul><li><strong>Immunization Program</strong>: Uses immunization-specific database tables</li><li><strong>Logistics Program</strong>: Uses logistics-specific database tables with <code>LOGISTIC_</code> prefixed constants</li><li><strong>Automatic Routing</strong>: Determines database based on request URL path</li></ul><h3 id="advanced-filtering" tabindex="-1">Advanced Filtering <a class="header-anchor" href="#advanced-filtering" aria-label="Permalink to &quot;Advanced Filtering&quot;">​</a></h3><ul><li><strong>User Role-based Filtering</strong>: Automatically applies location filters based on user permissions</li><li><strong>Dynamic Query Building</strong>: Constructs complex queries based on multiple filter combinations</li><li><strong>Efficient Pagination</strong>: Optimized pagination for large datasets</li></ul><h3 id="excel-export-features" tabindex="-1">Excel Export Features <a class="header-anchor" href="#excel-export-features" aria-label="Permalink to &quot;Excel Export Features&quot;">​</a></h3><ul><li><strong>Template-based Generation</strong>: Uses predefined Excel templates for consistent formatting</li><li><strong>Multi-sheet Reports</strong>: Generates reports with multiple data sheets</li><li><strong>Custom Styling</strong>: Applies organization-specific styling and branding</li><li><strong>Data Validation</strong>: Includes data validation and formatting rules</li></ul><h2 id="technical-implementation" tabindex="-1">Technical Implementation <a class="header-anchor" href="#technical-implementation" aria-label="Permalink to &quot;Technical Implementation&quot;">​</a></h2><h3 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h3><ul><li><strong>stockAvailabilityQueries.js</strong>: Core query building and execution</li><li><strong>listDimensionsQueries.js</strong>: Dimension data retrieval (legacy)</li><li><strong>listDimensionsV2Queries.js</strong>: Enhanced dimension data retrieval</li><li><strong>rawQueries.js</strong>: Raw SQL query execution and data processing</li><li><strong>stockAvailability.js</strong>: Stock calculation and analysis logic</li><li><strong>excel.js</strong>: Excel template generation and formatting</li></ul><h3 id="data-processing" tabindex="-1">Data Processing <a class="header-anchor" href="#data-processing" aria-label="Permalink to &quot;Data Processing&quot;">​</a></h3><ul><li><strong>Grouping and Aggregation</strong>: Groups data by multiple dimensions (time, location, material, entity)</li><li><strong>Statistical Calculations</strong>: Performs statistical analysis on stock availability metrics</li><li><strong>Data Transformation</strong>: Transforms raw transaction data into meaningful analytics</li><li><strong>Caching Strategy</strong>: Implements efficient caching for frequently accessed dimension data</li></ul><h3 id="performance-optimizations" tabindex="-1">Performance Optimizations <a class="header-anchor" href="#performance-optimizations" aria-label="Permalink to &quot;Performance Optimizations&quot;">​</a></h3><ul><li><strong>Indexed Queries</strong>: Utilizes database indexes for optimal query performance</li><li><strong>Batch Processing</strong>: Processes large datasets in manageable batches</li><li><strong>Memory Management</strong>: Efficient memory usage for large data exports</li><li><strong>Connection Pooling</strong>: Manages database connections efficiently</li></ul><h2 id="security-and-access-control" tabindex="-1">Security and Access Control <a class="header-anchor" href="#security-and-access-control" aria-label="Permalink to &quot;Security and Access Control&quot;">​</a></h2><ul><li><strong>Role-based Access</strong>: Restricts data access based on user roles (ADMIN, SUPERADMIN, regular users)</li><li><strong>Location-based Filtering</strong>: Automatically filters data based on user&#39;s assigned location</li><li><strong>Data Sanitization</strong>: Validates and sanitizes all input parameters</li><li><strong>Error Handling</strong>: Comprehensive error handling with appropriate HTTP status codes</li></ul><h2 id="monitoring-and-maintenance" tabindex="-1">Monitoring and Maintenance <a class="header-anchor" href="#monitoring-and-maintenance" aria-label="Permalink to &quot;Monitoring and Maintenance&quot;">​</a></h2><ul><li><strong>Last Updated Tracking</strong>: Monitors data freshness across all endpoints</li><li><strong>Error Logging</strong>: Comprehensive error logging for debugging and monitoring</li><li><strong>Performance Metrics</strong>: Tracks query performance and response times</li><li><strong>Data Quality Checks</strong>: Validates data integrity and consistency</li></ul><p>This API serves as a critical component of the healthcare supply chain management system, providing essential insights into stock availability patterns and helping prevent stockouts and overstock situations.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/dashboards/abnormal-stock-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var abnormal_stock_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, abnormal_stock_api_default as default };
