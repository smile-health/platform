import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/global/migrate-budget-source.md
var __pageData = JSON.parse("{\"title\":\"migrate-budget-source.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/global/migrate-budget-source.md\",\"filePath\":\"architecture/migration/global/migrate-budget-source.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/global/migrate-budget-source.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-budget-source-ts" tabindex="-1">migrate-budget-source.ts <a class="header-anchor" href="#migrate-budget-source-ts" aria-label="Permalink to &quot;migrate-budget-source.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates budget-source data from the SMILE 3.0 <code>source_materials</code> table into SMILE 5.0 global and workspace budget sources, recording mappings for downstream processes.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-budget-source</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [--reset] [--limit </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">] [--programId </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">programId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>source_materials</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Primary key of the source budget source</td></tr><tr><td><code>name</code></td><td>Budget source name</td></tr><tr><td><code>description</code></td><td>Optional description</td></tr><tr><td><code>created_at</code></td><td>Creation timestamp</td></tr><tr><td><code>created_by</code></td><td>Creator user ID</td></tr><tr><td><code>updated_at</code></td><td>Last update timestamp</td></tr><tr><td><code>updated_by</code></td><td>Updater user ID</td></tr></tbody></table><hr><h2 id="target-tables-after-–-smile-5-0" tabindex="-1">Target Tables (After – SMILE 5.0) <a class="header-anchor" href="#target-tables-after-–-smile-5-0" aria-label="Permalink to &quot;Target Tables (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Global Budget Sources</strong><br> Table: <code>budget_sources</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Auto-generated primary key</td></tr><tr><td><code>name</code></td><td>Migrated <code>name</code></td></tr><tr><td><code>description</code></td><td>Migrated <code>description</code></td></tr><tr><td><code>created_at</code></td><td>Preserved timestamp</td></tr><tr><td><code>created_by</code></td><td>Preserved creator ID</td></tr><tr><td><code>updated_at</code></td><td>Preserved or defaulted timestamp</td></tr><tr><td><code>updated_by</code></td><td>Preserved updater ID</td></tr></tbody></table></li><li><p><strong>Workspace Budget Sources</strong><br> Table: <code>budget_source_workspaces</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Auto-generated primary key</td></tr><tr><td><code>budget_source_id</code></td><td>Reference to <code>budget_sources.id</code></td></tr><tr><td><code>workspace_id</code></td><td>Target workspace (program) ID</td></tr></tbody></table></li><li><p><strong>Mapping Table</strong><br> Utilizes helper <code>insertTableMapping(&quot;budget_sources&quot;, progId, { sourceId: wsId })</code><br> Records mapping in the <code>mapping_budget_sources</code> table:</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_budget_source_id</code></td><td>Original SMILE 3.0 <code>source_materials.id</code></td></tr><tr><td><code>platform_budget_source_id</code></td><td>New <code>budget_source_workspaces.id</code></td></tr><tr><td><code>program_id</code></td><td>Target workspace ID</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--reset</code>: Sets Redis key <code>current_budget_source_id</code> to 0 to restart from the first record.</li><li><code>--limit &lt;number&gt;</code>: Maximum number of rows to process in this invocation.</li><li><code>--programId &lt;programId&gt;</code>: Source SMILE 3.0 program ID (also drives workspace ID mapping); default = 1.</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_TO_PLATFORM</code> (maps source programId to array of target workspace IDs)</li></ul></li><li><strong>Helpers</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB connection</li><li><code>db</code> for inserts into platform tables</li><li><code>redis</code> for cursor management (<code>current_budget_source_id</code>)</li><li><code>insertTableMapping</code> to record ID mappings in <code>mapping_budget_sources</code></li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Cursor Reset</strong> (if <code>--reset</code>):<br> Clears Redis cursor key to restart.</p></li><li><p><strong>Fetch Batch IDs</strong>:<br> Queries <code>source_materials.id &gt; current_cursor</code> ordered by <code>id</code>, applying <code>limit</code> if specified.</p></li><li><p><strong>Per-Row Processing</strong>:</p><ul><li>Fetch full <code>source_materials</code> record by <code>id</code>.</li><li><strong>Global Insert</strong>: <ul><li>If a <code>budget_sources</code> record with the same <code>name</code> exists, reuse its <code>id</code>; otherwise insert a new record and capture <code>insertId</code>.</li></ul></li><li><strong>Workspace Inserts</strong>: <ul><li>For each target workspace ID from <code>MAP_EXISTING_TO_PLATFORM[programId]</code>: <ul><li>If no <code>budget_source_workspaces</code> entry exists for <code>(budget_source_id, workspace_id)</code>, insert it and capture its <code>insertId</code>.</li><li>Call <code>insertTableMapping(&quot;budget_sources&quot;, workspaceId, { [sourceId]: wsId })</code>.</li></ul></li></ul></li><li>Update Redis cursor to the processed <code>id</code>.</li></ul></li><li><p><strong>Completion</strong>:<br> Logs finish and exits process.</p></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-398",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE%203.0%20DB%0A%20%20%20%20S3_Source%5B%22source_materials%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Constants%0A%20%20%20%20MAP%5B%22MAP_EXISTING_TO_PLATFORM%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Fetch%20IDs%20%3E%20cursor%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20record%22%5D%0A%20%20%20%20C%5B%22Upsert%20into%20budget_sources%22%5D%0A%20%20%20%20D%5B%22Loop%20workspace%20IDs%20from%20MAP%22%5D%0A%20%20%20%20E%5B%22Upsert%20into%20budget_source_workspaces%22%5D%0A%20%20%20%20F%5B%22Record%20mapping%20via%20insertTableMapping%22%5D%0A%20%20%20%20G%5B%22Update%20Redis%20cursor%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE%205.0%20DB%0A%20%20%20%20GS%5B%22budget_sources%22%5D%0A%20%20%20%20WS%5B%22budget_source_workspaces%22%5D%0A%20%20%20%20MS%5B%22mapping_budget_sources%22%5D%0A%20%20end%0A%0A%20%20S3_Source%20--%3E%20A%0A%20%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%0A%20%20C%20--%3E%20GS%0A%20%20C%20--%3E%20D%0A%20%20D%20--%3E%20E%0A%20%20E%20--%3E%20WS%0A%20%20E%20--%3E%20F%0A%20%20F%20--%3E%20MS%0A%20%20F%20--%3E%20G%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/global/migrate-budget-source.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_budget_source_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_budget_source_default as default };
