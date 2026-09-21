import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/migration/source-target-database-mapping.md
var __pageData = JSON.parse("{\"title\":\"SMILE 3.0 to 5.0 Database Migration - Source and Target Mapping\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/source-target-database-mapping.md\",\"filePath\":\"architecture/migration/source-target-database-mapping.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/source-target-database-mapping.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="smile-3-0-to-5-0-database-migration-source-and-target-mapping" tabindex="-1">SMILE 3.0 to 5.0 Database Migration - Source and Target Mapping <a class="header-anchor" href="#smile-3-0-to-5-0-database-migration-source-and-target-mapping" aria-label="Permalink to &quot;SMILE 3.0 to 5.0 Database Migration - Source and Target Mapping&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>This document provides a comprehensive mapping of source databases (SMILE 3.0) to target databases (SMILE 5.0) for the data migration process.</p><h2 id="database-configuration" tabindex="-1">Database Configuration <a class="header-anchor" href="#database-configuration" aria-label="Permalink to &quot;Database Configuration&quot;">​</a></h2><h3 id="source-databases-smile-3-0" tabindex="-1">Source Databases (SMILE 3.0) <a class="header-anchor" href="#source-databases-smile-3-0" aria-label="Permalink to &quot;Source Databases (SMILE 3.0)&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Program ID</th><th>Database</th><th>Environment Variable</th><th>Description</th></tr></thead><tbody><tr><td>1</td><td>IMUN_DB</td><td><code>IMUN_DB_NAME</code></td><td>Immunization program database</td></tr><tr><td>2</td><td>LOGISTIK_DB</td><td><code>LOGISTIK_DB_NAME</code></td><td>Logistics program database</td></tr></tbody></table><h3 id="target-databases-smile-5-0" tabindex="-1">Target Databases (SMILE 5.0) <a class="header-anchor" href="#target-databases-smile-5-0" aria-label="Permalink to &quot;Target Databases (SMILE 5.0)&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Database</th><th>Environment Variable</th><th>Description</th></tr></thead><tbody><tr><td>PLATFORM_DB</td><td><code>PLATFORM_DB_NAME</code></td><td>Main platform database</td></tr><tr><td>MIGRATION_DB</td><td><code>MIGRATION_DB_NAME</code></td><td>Migration tracking database</td></tr></tbody></table><h2 id="global-migration-mappings" tabindex="-1">Global Migration Mappings <a class="header-anchor" href="#global-migration-mappings" aria-label="Permalink to &quot;Global Migration Mappings&quot;">​</a></h2><h3 id="location-migration" tabindex="-1">Location Migration <a class="header-anchor" href="#location-migration" aria-label="Permalink to &quot;Location Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>provinces</code>, <code>regencies</code>, <code>sub_districts</code>, <code>villages</code></li><li><strong>Target</strong>: <code>locations</code></li><li><strong>Script</strong>: <code>global/migrate-location.ts</code></li></ul><h3 id="activity-migration" tabindex="-1">Activity Migration <a class="header-anchor" href="#activity-migration" aria-label="Permalink to &quot;Activity Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>master_activities</code></li><li><strong>Target</strong>: <code>ws_activities</code></li><li><strong>Mapping Table</strong>: <code>mapping_activities</code></li><li><strong>Script</strong>: <code>global/migrate-activity.ts</code></li></ul><h3 id="user-migration" tabindex="-1">User Migration <a class="header-anchor" href="#user-migration" aria-label="Permalink to &quot;User Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>users</code></li><li><strong>Target</strong>: <code>users</code>, <code>user_workspaces</code></li><li><strong>Mapping Table</strong>: <code>mapping_users</code></li><li><strong>Script</strong>: <code>global/migrate-user-bulk.ts</code></li></ul><h3 id="entity-migration" tabindex="-1">Entity Migration <a class="header-anchor" href="#entity-migration" aria-label="Permalink to &quot;Entity Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>entities</code>, <code>entity_entity_tags</code></li><li><strong>Target</strong>: <code>entities</code>, <code>entity_workspaces</code></li><li><strong>Mapping Table</strong>: <code>mapping_entities</code></li><li><strong>Script</strong>: <code>global/migrate-entity-bulk.ts</code></li></ul><h3 id="material-migration" tabindex="-1">Material Migration <a class="header-anchor" href="#material-migration" aria-label="Permalink to &quot;Material Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>master_materials</code></li><li><strong>Target</strong>: <code>materials</code>, <code>material_workspaces</code>, <code>material_relations</code></li><li><strong>Mapping Table</strong>: <code>mapping_materials</code></li><li><strong>Script</strong>: <code>global/migrate-material.ts</code></li></ul><h3 id="manufacture-migration" tabindex="-1">Manufacture Migration <a class="header-anchor" href="#manufacture-migration" aria-label="Permalink to &quot;Manufacture Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>manufactures</code></li><li><strong>Target</strong>: <code>manufactures</code>, <code>manufacture_workspaces</code></li><li><strong>Mapping Table</strong>: <code>mapping_manufactures</code></li><li><strong>Script</strong>: <code>global/migrate-manufacture.ts</code></li></ul><h3 id="budget-source-migration" tabindex="-1">Budget Source Migration <a class="header-anchor" href="#budget-source-migration" aria-label="Permalink to &quot;Budget Source Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>budget_sources</code></li><li><strong>Target</strong>: <code>budget_sources</code>, <code>budget_source_workspaces</code></li><li><strong>Mapping Table</strong>: <code>mapping_budget_sources</code></li><li><strong>Script</strong>: <code>global/migrate-budget-source.ts</code></li></ul><h2 id="workspace-specific-migration-mappings" tabindex="-1">Workspace-Specific Migration Mappings <a class="header-anchor" href="#workspace-specific-migration-mappings" aria-label="Permalink to &quot;Workspace-Specific Migration Mappings&quot;">​</a></h2><h3 id="patient-migration" tabindex="-1">Patient Migration <a class="header-anchor" href="#patient-migration" aria-label="Permalink to &quot;Patient Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>patients</code></li><li><strong>Target</strong>: <code>ws_patients</code></li><li><strong>Mapping Table</strong>: <code>mapping_patients</code></li><li><strong>Script</strong>: <code>workspace/migrate-patients.ts</code></li></ul><h3 id="stock-migration" tabindex="-1">Stock Migration <a class="header-anchor" href="#stock-migration" aria-label="Permalink to &quot;Stock Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>stocks</code>, <code>entity_has_master_materials</code></li><li><strong>Target</strong>: <code>ws_stocks</code></li><li><strong>Mapping Table</strong>: <code>mapping_stocks</code></li><li><strong>Script</strong>: <code>workspace/migrate-stock/stocks.ts</code></li></ul><h3 id="batch-migration" tabindex="-1">Batch Migration <a class="header-anchor" href="#batch-migration" aria-label="Permalink to &quot;Batch Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>batches</code></li><li><strong>Target</strong>: <code>ws_batches</code></li><li><strong>Mapping Table</strong>: <code>mapping_batches</code></li><li><strong>Script</strong>: <code>workspace/migrate-batches.ts</code></li></ul><h3 id="order-migration" tabindex="-1">Order Migration <a class="header-anchor" href="#order-migration" aria-label="Permalink to &quot;Order Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>orders</code>, <code>order_items</code>, <code>order_histories</code>, <code>order_comments</code></li><li><strong>Target</strong>: <code>ws_orders</code>, <code>ws_order_items</code>, <code>ws_order_histories</code>, <code>ws_order_comments</code></li><li><strong>Mapping Tables</strong>: <code>mapping_orders</code>, <code>mapping_order_items</code></li><li><strong>Script</strong>: <code>workspace/migrate-order/index.ts</code></li></ul><h3 id="transaction-migration" tabindex="-1">Transaction Migration <a class="header-anchor" href="#transaction-migration" aria-label="Permalink to &quot;Transaction Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>transactions</code>, <code>purchases</code>, <code>consumptions</code></li><li><strong>Target</strong>: <code>ws_transactions</code></li><li><strong>Mapping Table</strong>: <code>mapping_transactions</code></li><li><strong>Script</strong>: <code>workspace/migrate-transaction/index.ts</code></li></ul><h3 id="transaction-reasons-migration" tabindex="-1">Transaction Reasons Migration <a class="header-anchor" href="#transaction-reasons-migration" aria-label="Permalink to &quot;Transaction Reasons Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>transaction_reasons</code></li><li><strong>Target</strong>: <code>ws_transaction_reasons</code></li><li><strong>Mapping Table</strong>: <code>mapping_transaction_reasons</code></li><li><strong>Script</strong>: <code>workspace/migrate-transaction-reasons.ts</code></li></ul><h3 id="stock-opname-migration" tabindex="-1">Stock Opname Migration <a class="header-anchor" href="#stock-opname-migration" aria-label="Permalink to &quot;Stock Opname Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>stock_opnames</code></li><li><strong>Target</strong>: <code>ws_stock_opnames</code></li><li><strong>Mapping Table</strong>: <code>mapping_stock_opnames</code></li><li><strong>Script</strong>: <code>workspace/migrate-stock-opnames.ts</code></li></ul><h3 id="reconciliation-migration" tabindex="-1">Reconciliation Migration <a class="header-anchor" href="#reconciliation-migration" aria-label="Permalink to &quot;Reconciliation Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>reconciliations</code></li><li><strong>Target</strong>: <code>ws_reconciliations</code></li><li><strong>Mapping Table</strong>: <code>mapping_reconciliations</code></li><li><strong>Script</strong>: <code>workspace/migrate-reconciliations.ts</code></li></ul><h3 id="entity-relations-migration" tabindex="-1">Entity Relations Migration <a class="header-anchor" href="#entity-relations-migration" aria-label="Permalink to &quot;Entity Relations Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>customer_vendors</code>, <code>entity_activities</code>, <code>entity_material_activities</code></li><li><strong>Target</strong>: <code>ws_entity_activities</code>, <code>ws_entity_material_activities</code></li><li><strong>Script</strong>: <code>workspace/migrate-entity/index.ts</code></li></ul><h3 id="material-relations-migration" tabindex="-1">Material Relations Migration <a class="header-anchor" href="#material-relations-migration" aria-label="Permalink to &quot;Material Relations Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>material_activities</code>, <code>material_companions</code>, <code>material_conditions</code>, <code>material_manufactures</code></li><li><strong>Target</strong>: <code>ws_material_activities</code>, <code>ws_material_companions</code>, <code>ws_material_conditions</code>, <code>ws_material_manufactures</code></li><li><strong>Script</strong>: <code>workspace/migrate-material/index.ts</code></li></ul><h3 id="disposal-migration" tabindex="-1">Disposal Migration <a class="header-anchor" href="#disposal-migration" aria-label="Permalink to &quot;Disposal Migration&quot;">​</a></h3><ul><li><strong>Source</strong>: <code>disposal_stocks</code>, <code>disposal_transactions</code></li><li><strong>Target</strong>: <code>ws_disposal_stocks</code>, <code>ws_disposal_transactions</code></li><li><strong>Script</strong>: <code>workspace/migrate-disposal/index.ts</code></li></ul><h2 id="key-migration-patterns" tabindex="-1">Key Migration Patterns <a class="header-anchor" href="#key-migration-patterns" aria-label="Permalink to &quot;Key Migration Patterns&quot;">​</a></h2><h3 id="global-vs-workspace-tables" tabindex="-1">Global vs Workspace Tables <a class="header-anchor" href="#global-vs-workspace-tables" aria-label="Permalink to &quot;Global vs Workspace Tables&quot;">​</a></h3><ul><li><strong>Global Tables</strong>: Shared across all workspaces (e.g., <code>locations</code>, <code>users</code>, <code>entities</code>)</li><li><strong>Workspace Tables</strong>: Program-specific data with <code>ws_</code> prefix (e.g., <code>ws_stocks</code>, <code>ws_orders</code>)</li></ul><h3 id="mapping-tables" tabindex="-1">Mapping Tables <a class="header-anchor" href="#mapping-tables" aria-label="Permalink to &quot;Mapping Tables&quot;">​</a></h3><ul><li>All migrations create mapping tables to track legacy ID to platform ID relationships</li><li>Format: <code>mapping_{table_name}</code></li><li>Contains: <code>existing_{table}_id</code>, <code>platform_{table}_id</code>, <code>program_id</code></li></ul><h3 id="database-connections" tabindex="-1">Database Connections <a class="header-anchor" href="#database-connections" aria-label="Permalink to &quot;Database Connections&quot;">​</a></h3><ul><li><strong>Source Connection</strong>: <code>getMigrationDB(programId)</code> - connects to SMILE 3.0 databases</li><li><strong>Target Connection</strong>: <code>db</code> - connects to SMILE 5.0 platform database</li><li><strong>Sync Connection</strong>: <code>syncDB</code> - connects to migration tracking database</li></ul><h2 id="environment-variables-required" tabindex="-1">Environment Variables Required <a class="header-anchor" href="#environment-variables-required" aria-label="Permalink to &quot;Environment Variables Required&quot;">​</a></h2><h3 id="source-database-smile-3-0" tabindex="-1">Source Database (SMILE 3.0) <a class="header-anchor" href="#source-database-smile-3-0" aria-label="Permalink to &quot;Source Database (SMILE 3.0)&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Immunization Database (Program ID 1)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">IMUN_DB_NAME</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">IMUN_DB_HOST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">IMUN_DB_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">IMUN_DB_PORT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">IMUN_DB_PASSWORD</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Logistics Database (Program ID 2)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">LOGISTIK_DB_NAME</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">LOGISTIK_DB_HOST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">LOGISTIK_DB_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">LOGISTIK_DB_PORT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">LOGISTIK_DB_PASSWORD</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span></code></pre></div><h3 id="target-database-smile-5-0" tabindex="-1">Target Database (SMILE 5.0) <a class="header-anchor" href="#target-database-smile-5-0" aria-label="Permalink to &quot;Target Database (SMILE 5.0)&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Platform Database</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">PLATFORM_DB_NAME</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">PLATFORM_DB_HOST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">PLATFORM_DB_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">PLATFORM_DB_PORT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">PLATFORM_DB_PASSWORD</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Migration Tracking Database</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">MIGRATION_DB_NAME</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">MIGRATION_DB_HOST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">MIGRATION_DB_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">MIGRATION_DB_PORT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">MIGRATION_DB_PASSWORD</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/source-target-database-mapping.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var source_target_database_mapping_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, source_target_database_mapping_default as default };
