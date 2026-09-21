import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/global/migrate-manufacture.md
var __pageData = JSON.parse("{\"title\":\"migrate-manufacture.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/global/migrate-manufacture.md\",\"filePath\":\"architecture/migration/global/migrate-manufacture.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/global/migrate-manufacture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-manufacture-ts" tabindex="-1">migrate-manufacture.ts <a class="header-anchor" href="#migrate-manufacture-ts" aria-label="Permalink to &quot;migrate-manufacture.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates “manufacture” records from SMILE 3.0 (<code>manufactures</code> table) into SMILE 5.0 global <code>manufactures</code> and workspace <code>manufacture_workspaces</code>, recording ID mappings.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-manufacture</span><span style="${ssrRenderStyle({
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
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>manufactures</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Legacy manufacture primary key</td></tr><tr><td><code>name</code></td><td>Manufacture name</td></tr><tr><td><code>address</code></td><td>Optional address</td></tr><tr><td><code>email</code></td><td>Contact email</td></tr><tr><td><code>contact_name</code></td><td>Contact person</td></tr><tr><td><code>description</code></td><td>Optional description</td></tr><tr><td><code>phone_number</code></td><td>Contact phone number</td></tr><tr><td><code>reference_id</code></td><td>Legacy reference identifier</td></tr><tr><td><code>status</code>, <code>type</code></td><td>Integer flags</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Timestamps</td></tr><tr><td><code>created_by</code>, <code>deleted_by</code>, <code>updated_by</code></td><td>User IDs</td></tr><tr><td><code>deleted_at</code></td><td>Null = active</td></tr></tbody></table><hr><h2 id="target-tables-after-–-smile-5-0" tabindex="-1">Target Tables (After – SMILE 5.0) <a class="header-anchor" href="#target-tables-after-–-smile-5-0" aria-label="Permalink to &quot;Target Tables (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Global Manufactures</strong><br> Table: <code>manufactures</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Auto-generated primary key</td></tr><tr><td><code>name</code></td><td>Migrated name</td></tr><tr><td><code>address</code></td><td>Migrated</td></tr><tr><td><code>email</code></td><td>Migrated</td></tr><tr><td><code>contact_name</code></td><td>Migrated</td></tr><tr><td><code>description</code></td><td>Migrated</td></tr><tr><td><code>phone_number</code></td><td>Migrated</td></tr><tr><td><code>reference_id</code></td><td>Migrated</td></tr><tr><td><code>status</code>, <code>type</code></td><td>Migrated</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Preserved</td></tr><tr><td><code>created_by</code>, <code>deleted_by</code>, <code>updated_by</code></td><td>Preserved</td></tr></tbody></table></li><li><p><strong>Workspace Manufactures</strong><br> Table: <code>manufacture_workspaces</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Auto-generated primary key</td></tr><tr><td><code>manufacture_id</code></td><td>Reference to <code>manufactures.id</code></td></tr><tr><td><code>workspace_id</code></td><td>Target workspace (program) ID</td></tr></tbody></table></li><li><p><strong>Mapping Table</strong><br> Uses helper <code>insertTableMapping(&quot;manufactures&quot;, progId, { legacyId: wsId })</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_manufacture_id</code></td><td>Legacy <code>manufactures.id</code></td></tr><tr><td><code>platform_manufacture_id</code></td><td>New <code>manufacture_workspaces.id</code></td></tr><tr><td><code>program_id</code></td><td>Target workspace (program) ID</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--reset</code>: Clears Redis key <code>current_manufacture_id</code> to restart from first record.</li><li><code>--limit &lt;number&gt;</code>: Max rows per migration batch.</li><li><code>--programId &lt;programId&gt;</code>: Legacy program ID (default = 1).</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_TO_PLATFORM</code> (maps legacy program to platform workspace IDs)</li></ul></li><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB</li><li><code>db.transaction()</code> for transactional inserts</li><li><code>insertTableMapping</code> for mapping table writes</li><li><code>redis</code> for cursor management (<code>current_manufacture_id</code>)</li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Cursor Reset</strong> (if <code>--reset</code>):<br> Sets Redis key to 0.</p></li><li><p><strong>Transactional Batch</strong>:</p><ul><li>Fetch rows from <code>manufactures</code> where <code>id &gt; cursor</code> and <code>deleted_at IS NULL</code>, limited if specified.</li><li>For each row: <ul><li>Fetch full record by <code>id</code>.</li><li><strong>Global Upsert</strong>: <ul><li>If <code>manufactures.name</code> exists globally, reuse its <code>id</code>; otherwise insert a new record.</li></ul></li><li><strong>Workspace Upsert</strong>: <ul><li>For each workspace ID in <code>MAP_EXISTING_TO_PLATFORM[programId]</code>: <ul><li>If no <code>manufacture_workspaces</code> entry for <code>(manufacture_id, workspace_id)</code>, insert it.</li><li>Call <code>insertTableMapping</code> to record legacy→workspace mapping.</li></ul></li></ul></li><li>Update Redis cursor to processed <code>id</code>.</li></ul></li></ul></li><li><p><strong>Completion</strong>:<br> Logs finish and exits; errors cause exit code 1.</p></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-477",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20M3%5B%22manufactures%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Constants%0A%20%20%20%20MAP%5B%22MAP_EXISTING_TO_PLATFORM%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Fetch%20rows%20%3E%20cursor%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20record%22%5D%0A%20%20%20%20C%5B%22Upsert%20global%20manufactures%22%5D%0A%20%20%20%20D%5B%22Loop%20workspace%20IDs%22%5D%0A%20%20%20%20E%5B%22Upsert%20manufacture_workspaces%22%5D%0A%20%20%20%20F%5B%22insertTableMapping%22%5D%0A%20%20%20%20G%5B%22Update%20Redis%20cursor%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20GM%5B%22manufactures%22%5D%0A%20%20%20%20WM%5B%22manufacture_workspaces%22%5D%0A%20%20%20%20MM%5B%22mapping_manufactures%22%5D%0A%20%20end%0A%0A%20%20M3%20--%3E%20A%0A%20%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%0A%20%20C%20--%3E%20GM%0A%20%20C%20--%3E%20D%0A%20%20D%20--%3E%20E%0A%20%20E%20--%3E%20WM%0A%20%20E%20--%3E%20F%0A%20%20F%20--%3E%20MM%0A%20%20F%20--%3E%20G%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>manufactures</code></td><td><code>id</code>, <code>name</code>, <code>address</code>, ..., <code>updated_by</code></td></tr><tr><td>After (Global)</td><td><code>manufactures</code></td><td><code>id</code>, <code>name</code>, <code>address</code>, ..., <code>updated_by</code></td></tr><tr><td>After (Workspace)</td><td><code>manufacture_workspaces</code></td><td><code>manufacture_id</code>, <code>workspace_id</code></td></tr><tr><td>Mapping</td><td><code>mapping_manufactures</code></td><td><code>existing_manufacture_id</code>, <code>platform_manufacture_id</code>, <code>program_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/global/migrate-manufacture.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_manufacture_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_manufacture_default as default };
