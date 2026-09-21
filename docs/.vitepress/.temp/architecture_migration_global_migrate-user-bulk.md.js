import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/global/migrate-user-bulk.md
var __pageData = JSON.parse("{\"title\":\"migrate-user-bulk.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/global/migrate-user-bulk.md\",\"filePath\":\"architecture/migration/global/migrate-user-bulk.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/global/migrate-user-bulk.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-user-bulk-ts" tabindex="-1">migrate-user-bulk.ts <a class="header-anchor" href="#migrate-user-bulk-ts" aria-label="Permalink to &quot;migrate-user-bulk.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Bulk-migrates user accounts from SMILE 3.0 (<code>users</code> table) into SMILE 5.0 global <code>users</code>, populates workspace-specific <code>user_workspaces</code>, and records ID mappings in <code>mapping_users</code>.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-user-bulk</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --batchSize</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">numbe</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">r</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [--programId </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">programI</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">d</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>users</code> (aliased <code>e</code>)</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Legacy user primary key</td></tr><tr><td><code>username</code>, <code>email</code></td><td>Login credentials</td></tr><tr><td><code>firstname</code>, <code>lastname</code></td><td>Personal names</td></tr><tr><td><code>date_of_birth</code>, <code>gender</code></td><td>Optional profile fields</td></tr><tr><td><code>mobile_phone</code>, <code>address</code></td><td>Contact info</td></tr><tr><td><code>entity_id</code></td><td>FK to <code>entities</code></td></tr><tr><td><code>role</code>, <code>status</code></td><td>Access flags</td></tr><tr><td><code>timezone_id</code>, <code>village_id</code></td><td>Optional IDs</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Timestamps</td></tr><tr><td><code>deleted_at</code></td><td>Null = active</td></tr><tr><td>Other metadata columns</td><td>e.g., <code>password</code>, <code>permission</code>, etc.</td></tr></tbody></table><hr><h2 id="target-tables-after-–-smile-5-0" tabindex="-1">Target Tables (After – SMILE 5.0) <a class="header-anchor" href="#target-tables-after-–-smile-5-0" aria-label="Permalink to &quot;Target Tables (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Global Users</strong><br> Table: <code>users</code><br> Migrated fields include:<br><code>username</code>, <code>email</code>, <code>firstname</code>, <code>lastname</code>, <code>date_of_birth</code>, <code>gender</code>,<br><code>mobile_phone</code>, <code>address</code>, <code>entity_id</code> (mapped to platform entity_workspaces),<br><code>role</code>, <code>status</code>, <code>timezone_id</code>, <code>village_id</code>, <code>password</code>, plus metadata timestamps.</p></li><li><p><strong>Workspace Users</strong><br> Table: <code>user_workspaces</code><br> Columns:<br><code>existing_user_id</code>, <code>user_id</code> (platform user ID), <code>workspace_id</code>, <code>status</code></p></li><li><p><strong>Mapping Table</strong><br> Table: <code>mapping_users</code><br> Records:<br><code>program_id</code>, <code>platorm_user_id</code>, <code>existing_user_id</code></p></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--batchSize &lt;number&gt;</code>: Rows per batch transaction.</li><li><code>--programId &lt;programId&gt;</code>: Legacy program ID (default = 1).</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_TO_PLATFORM</code> (maps legacy program to workspace IDs)</li></ul></li><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB</li><li><code>db.transaction()</code> for batch operations</li><li><code>collect</code>, <code>associateField</code>, <code>partition</code> (utility functions)</li><li><code>getMapEntityIds()</code> to preload workspace entity IDs</li><li><code>insertTableMapping()</code> for mapping writes</li><li><code>syncDB</code> for final mapping insert into <code>mapping_users</code></li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Batch Loop</strong></p><ul><li>Page through <code>users.id</code> in batches of <code>batchSize</code> until no more rows.</li></ul></li><li><p><strong>Per-Batch Transaction</strong></p><ul><li>Fetch full user rows by IDs.</li><li><strong>Detect Existing vs New</strong>: <ul><li>Query platform <code>users</code> by matching <code>username</code>.</li><li>Partition into <code>existingUsers</code> and <code>users</code> (new).</li></ul></li><li><strong>Create Platform Users</strong>: <ul><li>Insert new <code>users</code> records and capture <code>insertId</code> range.</li></ul></li><li><strong>Prepare Workspace Rows</strong>: <ul><li>For each new and existing user, determine target <code>workspace_id</code>s: <ul><li>Use email-domain heuristics (<code>MAP_USER_EMAIL</code>) when applicable.</li><li>Otherwise apply <code>MAP_EXISTING_TO_PLATFORM[programId]</code>.</li></ul></li></ul></li><li><strong>Insert Workspace Entries</strong>: <ul><li>Bulk-insert <code>user_workspaces</code>.</li><li>Capture returned IDs.</li></ul></li><li><strong>Record Mappings</strong>: <ul><li>Insert into <code>mapping_users</code> per row mapping <code>(program_id, platorm_user_id, existing_user_id)</code>.</li></ul></li></ul></li><li><p><strong>Exit</strong></p><ul><li>Logs finish and <code>process.exit(0)</code>.</li></ul></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-339",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20U3%5B%22users%20(batch)%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Preparations%0A%20%20%20%20CONST%5B%22MAP_EXISTING_TO_PLATFORM%22%5D%0A%20%20%20%20EMAILMAP%5B%22MAP_USER_EMAIL%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Fetch%20batch%20IDs%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20user%20rows%22%5D%0A%20%20%20%20C%5B%22Detect%20existing%20vs%20new%22%5D%0A%20%20%20%20D%5B%22Insert%20new%20users%22%5D%0A%20%20%20%20E%5B%22Build%20workspace%20rows%22%5D%0A%20%20%20%20F%5B%22Insert%20user_workspaces%22%5D%0A%20%20%20%20G%5B%22Insert%20mapping_users%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20GU%5B%22users%22%5D%0A%20%20%20%20UW%5B%22user_workspaces%22%5D%0A%20%20%20%20MU%5B%22mapping_users%22%5D%0A%20%20end%0A%0A%20%20U3%20--%3E%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%0A%20%20C%20--%3E%7Cnew%7C%20D%20--%3E%20GU%0A%20%20C%20--%3E%7Call%7C%20E%20--%3E%20F%20--%3E%20UW%0A%20%20F%20--%3E%20G%20--%3E%20MU%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>users</code></td><td><code>id</code>, <code>username</code>, <code>entity_id</code>, <code>status</code>, ...</td></tr><tr><td>After (Global)</td><td><code>users</code></td><td><code>id</code>, <code>username</code>, <code>email</code>, <code>entity_id</code>, <code>status</code>, ...</td></tr><tr><td>After (Workspace)</td><td><code>user_workspaces</code></td><td><code>existing_user_id</code>, <code>user_id</code>, <code>workspace_id</code>, <code>status</code></td></tr><tr><td>Mapping</td><td><code>mapping_users</code></td><td><code>program_id</code>, <code>platorm_user_id</code>, <code>existing_user_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/global/migrate-user-bulk.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_user_bulk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_user_bulk_default as default };
