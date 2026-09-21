import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/dashboard-routine-api.md
var __pageData = JSON.parse("{\"title\":\"Dashboard Routine API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/dashboard-routine-api.md\",\"filePath\":\"archive/dashboard-routine-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/dashboard-routine-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="dashboard-routine-api-documentation" tabindex="-1">Dashboard Routine API Documentation <a class="header-anchor" href="#dashboard-routine-api-documentation" aria-label="Permalink to &quot;Dashboard Routine API Documentation&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong><code>datamart_rutin_inventory</code> tidak dirujuk di mana pun dalam <code>apps/</code>. Disimpan sebagai rujukan historis saja.</p></blockquote><p>This document provides comprehensive documentation for the Dashboard Routine API endpoints and their underlying database structure.</p><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Dashboard Routine API provides three main functionalities:</p><ol><li><strong>Inventory Management</strong> - Track stock levels and statuses</li><li><strong>Asset Monitoring</strong> - Monitor temperature and status of assets</li><li><strong>Activity Tracking</strong> - Monitor entity activity and transaction patterns</li></ol><h2 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Endpoint</th><th>Method</th><th>Controller Function</th><th>Description</th></tr></thead><tbody><tr><td><code>/inventory/overview</code></td><td>GET</td><td><code>inventoryOverview</code></td><td>Get inventory status overview with pie chart data</td></tr><tr><td><code>/inventory/location</code></td><td>GET</td><td><code>inventoryLocation</code></td><td>Get inventory status by location (province/regency/entity)</td></tr><tr><td><code>/asset/overview</code></td><td>GET</td><td><code>assetOverview</code></td><td>Get asset status overview with pie chart data</td></tr><tr><td><code>/asset/location</code></td><td>GET</td><td><code>assetLocation</code></td><td>Get asset status by location</td></tr><tr><td><code>/activity/overview</code></td><td>GET</td><td><code>activityOverview</code></td><td>Get entity activity overview (active/inactive)</td></tr><tr><td><code>/activity/location</code></td><td>GET</td><td><code>activityLocation</code></td><td>Get entity activity by location</td></tr></tbody></table><h2 id="database-tables" tabindex="-1">Database Tables <a class="header-anchor" href="#database-tables" aria-label="Permalink to &quot;Database Tables&quot;">​</a></h2><h3 id="primary-data-tables" tabindex="-1">Primary Data Tables <a class="header-anchor" href="#primary-data-tables" aria-label="Permalink to &quot;Primary Data Tables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Table Name</th><th>Alias</th><th>Purpose</th><th>Key Fields</th></tr></thead><tbody><tr><td><code>datamart_rutin_inventory</code></td><td>dri, dri1, dri2</td><td>Stores routine inventory data</td><td><code>transactions_createdAt_as_date</code>, <code>entities_id</code>, <code>master_materials_id</code>, <code>transactions_activity_id</code>, <code>status</code></td></tr><tr><td><code>datamart_suhu_asset</code></td><td>dsa</td><td>Stores asset temperature and status</td><td><code>assets_parent_id</code>, <code>assets_temp</code>, <code>temp_status</code>, <code>entities_province_id</code>, <code>logger_histories_updated_at</code></td></tr><tr><td><code>datamart_transactions</code></td><td>dt</td><td>Stores transaction data for activity tracking</td><td><code>entities_id</code>, <code>transactions_createdAt</code>, <code>transactions_transaction_type_id</code>, <code>entities_status</code></td></tr></tbody></table><h3 id="dimension-tables" tabindex="-1">Dimension Tables <a class="header-anchor" href="#dimension-tables" aria-label="Permalink to &quot;Dimension Tables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Table Name</th><th>Alias</th><th>Purpose</th><th>Key Fields</th></tr></thead><tbody><tr><td><code>dim_entities</code></td><td>de</td><td>Entity master data</td><td><code>id</code>, <code>name</code>, <code>type</code>, <code>province_id</code>, <code>regency_id</code>, <code>is_vendor</code>, <code>status</code></td></tr><tr><td><code>dim_entity_activity_date</code></td><td>dead</td><td>Entity activity date relationships</td><td><code>entity_id</code>, <code>activity_id</code>, <code>join_date</code>, <code>end_date</code></td></tr><tr><td><code>dim_entity_entity_tags</code></td><td>deet</td><td>Entity tags junction table</td><td><code>entity_id</code>, <code>entity_tag_id</code></td></tr></tbody></table><h2 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h2><h3 id="common-parameters" tabindex="-1">Common Parameters <a class="header-anchor" href="#common-parameters" aria-label="Permalink to &quot;Common Parameters&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Example</th></tr></thead><tbody><tr><td><code>from</code></td><td>Date</td><td>Start date filter</td><td><code>2024-01-01</code></td></tr><tr><td><code>to</code></td><td>Date</td><td>End date filter</td><td><code>2024-12-31</code></td></tr><tr><td><code>province</code></td><td>String</td><td>Province IDs (comma-separated)</td><td><code>1,2,3</code></td></tr><tr><td><code>regency</code></td><td>String</td><td>Regency IDs (comma-separated)</td><td><code>101,102</code></td></tr><tr><td><code>material</code></td><td>String</td><td>Material IDs (comma-separated)</td><td><code>1,2,3</code></td></tr><tr><td><code>masterMaterialId</code></td><td>String</td><td>Master Material IDs (comma-separated)</td><td><code>10,20,30</code></td></tr><tr><td><code>vendorTag</code></td><td>String</td><td>Vendor tag IDs (comma-separated)</td><td><code>1,2</code></td></tr><tr><td><code>isVaccine</code></td><td>String</td><td>Vaccine filter (comma-separated)</td><td><code>0,1</code></td></tr><tr><td><code>activityId</code></td><td>String</td><td>Activity IDs (comma-separated)</td><td><code>1,2,3</code></td></tr><tr><td><code>active</code></td><td>Boolean</td><td>Filter for active entities</td><td><code>true</code></td></tr><tr><td><code>asset</code></td><td>Boolean</td><td>Asset-specific filtering</td><td><code>true</code></td></tr></tbody></table><h2 id="response-data-structures" tabindex="-1">Response Data Structures <a class="header-anchor" href="#response-data-structures" aria-label="Permalink to &quot;Response Data Structures&quot;">​</a></h2><h3 id="inventory-overview-response" tabindex="-1">Inventory Overview Response <a class="header-anchor" href="#inventory-overview-response" aria-label="Permalink to &quot;Inventory Overview Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;current_time&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DD/MM/YYYY h:mm&quot;</span><span style="${ssrRenderStyle({
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
	})}">&quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;group_by&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;entities&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;province_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;regency_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;map_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;pie&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;inventories&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Normal|&lt; Min|&gt; Max|Habis&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;color&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#hex_color&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;percent&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;percentage&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;toolText&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;description&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="asset-overview-response" tabindex="-1">Asset Overview Response <a class="header-anchor" href="#asset-overview-response" aria-label="Permalink to &quot;Asset Overview Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;current_time&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DD/MM/YYYY h:mm&quot;</span><span style="${ssrRenderStyle({
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
	})}">&quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;group_by&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;entities&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;province_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;regency_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;map_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;string&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;pie&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;asset&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Normal|Low|High|unknown&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;color&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#hex_color&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;percent&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;percentage&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;toolText&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;description&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="activity-overview-response" tabindex="-1">Activity Overview Response <a class="header-anchor" href="#activity-overview-response" aria-label="Permalink to &quot;Activity Overview Response&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;last_updated&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;yAxisName&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Activity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;categories&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;category&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [{ </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;label&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;dataset&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;seriesname&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Active|Inactive&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;data&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">          {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">            &quot;value&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">            &quot;toolText&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;description&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">            &quot;color&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#hex_color&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">          }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span></code></pre></div><h2 id="status-classifications" tabindex="-1">Status Classifications <a class="header-anchor" href="#status-classifications" aria-label="Permalink to &quot;Status Classifications&quot;">​</a></h2><h3 id="inventory-status" tabindex="-1">Inventory Status <a class="header-anchor" href="#inventory-status" aria-label="Permalink to &quot;Inventory Status&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Status</th><th>Color</th><th>Description</th></tr></thead><tbody><tr><td>Normal</td><td>#00B050</td><td>Stock within normal range</td></tr><tr><td>&lt; Min</td><td>#FFC002</td><td>Stock below minimum threshold</td></tr><tr><td>&gt; Max</td><td>#00B0F0</td><td>Stock above maximum threshold</td></tr><tr><td>Habis</td><td>#ED1B23</td><td>Out of stock</td></tr></tbody></table><h3 id="asset-status" tabindex="-1">Asset Status <a class="header-anchor" href="#asset-status" aria-label="Permalink to &quot;Asset Status&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Status</th><th>Color</th><th>Description</th></tr></thead><tbody><tr><td>normal</td><td>#00B050</td><td>Asset operating normally</td></tr><tr><td>&lt; min</td><td>#1BA8DF</td><td>Asset temperature below minimum</td></tr><tr><td>&gt; max</td><td>#EE1D23</td><td>Asset temperature above maximum</td></tr><tr><td>unknown</td><td>#7F7F7F</td><td>Asset status unknown</td></tr></tbody></table><h3 id="activity-status" tabindex="-1">Activity Status <a class="header-anchor" href="#activity-status" aria-label="Permalink to &quot;Activity Status&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Status</th><th>Color</th><th>Description</th></tr></thead><tbody><tr><td>Active</td><td>#00b050</td><td>Entity has recent transactions</td></tr><tr><td>Inactive</td><td>#ed1b23</td><td>Entity has no recent transactions</td></tr></tbody></table><h2 id="database-technology" tabindex="-1">Database Technology <a class="header-anchor" href="#database-technology" aria-label="Permalink to &quot;Database Technology&quot;">​</a></h2><p>The system uses <strong>ClickHouse</strong> database, evidenced by:</p><ul><li>Use of <code>final</code> keyword in queries</li><li>Array functions like <code>arrayExists</code></li><li>Specific ClickHouse SQL syntax patterns</li></ul><h2 id="key-functions" tabindex="-1">Key Functions <a class="header-anchor" href="#key-functions" aria-label="Permalink to &quot;Key Functions&quot;">​</a></h2><h3 id="core-functions" tabindex="-1">Core Functions <a class="header-anchor" href="#core-functions" aria-label="Permalink to &quot;Core Functions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Function</th><th>Purpose</th><th>Returns</th></tr></thead><tbody><tr><td><code>getValidatedFilter()</code></td><td>Validates and processes query parameters</td><td>Validated filter object</td></tr><tr><td><code>getInventory()</code></td><td>Retrieves inventory data with filters</td><td>Array of inventory records</td></tr><tr><td><code>getAssetStatus()</code></td><td>Retrieves asset status data</td><td>Array of asset records</td></tr><tr><td><code>getActiveEntities()</code></td><td>Gets entities with recent activity</td><td>Array of active entities</td></tr><tr><td><code>getInActiveEntities()</code></td><td>Gets entities without recent activity</td><td>Array of inactive entities</td></tr><tr><td><code>dateValidation()</code></td><td>Validates and formats date parameters</td><td>Formatted date object</td></tr><tr><td><code>colorSchema()</code></td><td>Determines color scheme based on percentage</td><td>Color configuration object</td></tr></tbody></table><h3 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h3><p>The controller uses external helper functions from <code>../helpers/partial-queries/listDimensionsQueries</code>:</p><ul><li><code>getEntityList()</code> - Retrieves entity dimension data</li><li><code>getMasterMaterialList()</code> - Retrieves material dimension data</li><li><code>getProvinceList()</code> - Retrieves province dimension data</li><li><code>getRegencyList()</code> - Retrieves regency dimension data</li></ul><h2 id="location-hierarchy" tabindex="-1">Location Hierarchy <a class="header-anchor" href="#location-hierarchy" aria-label="Permalink to &quot;Location Hierarchy&quot;">​</a></h2><p>The system supports a three-level location hierarchy:</p><ol><li><strong>Province Level</strong> - Top-level administrative division</li><li><strong>Regency Level</strong> - Second-level administrative division</li><li><strong>Entity Level</strong> - Individual facilities/locations</li></ol><p>Location data is filtered and displayed based on user permissions and selected hierarchy level.</p><h2 id="performance-considerations" tabindex="-1">Performance Considerations <a class="header-anchor" href="#performance-considerations" aria-label="Permalink to &quot;Performance Considerations&quot;">​</a></h2><ul><li>Queries use date range filtering to limit data scope</li><li>Entity activity date joins ensure only active relationships are considered</li><li>Aggregation is performed at the database level for better performance</li><li>Results are grouped and sorted for optimal frontend rendering</li></ul><h2 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h2><p>All endpoints implement consistent error handling:</p><ul><li>Input validation for date ranges and parameters</li><li>Database connection error handling</li><li>Standardized error response format using <code>errorResponse()</code> helper</li><li>HTTP 500 status codes for server errors</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/dashboard-routine-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var dashboard_routine_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, dashboard_routine_api_default as default };
