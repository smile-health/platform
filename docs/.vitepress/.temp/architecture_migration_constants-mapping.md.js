import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/migration/constants-mapping.md
var __pageData = JSON.parse("{\"title\":\"Migration Constants Mapping\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/constants-mapping.md\",\"filePath\":\"architecture/migration/constants-mapping.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/constants-mapping.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migration-constants-mapping" tabindex="-1">Migration Constants Mapping <a class="header-anchor" href="#migration-constants-mapping" aria-label="Permalink to &quot;Migration Constants Mapping&quot;">​</a></h1><p>This document explains the migration constants defined in<br><code>apps/sync-service/src/scripts/data-migration/const.ts</code>. These mappings are used by multiple migration scripts to translate IDs and other references from the SMILE 3.0 database to the SMILE 5.0 platform.</p><hr><h2 id="map-existing-to-platform" tabindex="-1">MAP_EXISTING_TO_PLATFORM <a class="header-anchor" href="#map-existing-to-platform" aria-label="Permalink to &quot;MAP_EXISTING_TO_PLATFORM&quot;">​</a></h2><p><strong>Definition</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> MAP_EXISTING_TO_PLATFORM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> getMapExistingToPlatformProgramId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">();</span></span></code></pre></div><ul><li><strong>Source</strong>:<br> Populated by the helper function <code>getMapExistingToPlatformProgramId()</code> which reads the <code>mapping_programs</code> (or equivalent) table from the SMILE 5.0 database.</li><li><strong>Purpose</strong>:<br> Provides a lookup from an “existing” (SMILE 3.0) program ID to its corresponding target (SMILE 5.0) program ID.</li><li><strong>Usage</strong>:<br> Many scripts pass an <code>--programId</code> option to specify the source program; this constant lets them find the new platform program ID for inserts and further mapping.</li></ul><hr><h2 id="map-existing-activity-ids" tabindex="-1">MAP_EXISTING_ACTIVITY_IDS <a class="header-anchor" href="#map-existing-activity-ids" aria-label="Permalink to &quot;MAP_EXISTING_ACTIVITY_IDS&quot;">​</a></h2><p><strong>Definition</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> MAP_EXISTING_ACTIVITY_IDS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> getMapExistingActivityIdsByProgramId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">();</span></span></code></pre></div><ul><li><strong>Source</strong>:<br> Populated by the helper function <code>getMapExistingActivityIdsByProgramId()</code> which reads the <code>mapping_activities</code> table in SMILE 5.0.</li><li><strong>Purpose</strong>:<br> For a given source program, returns a map of source activity IDs to their corresponding target activity IDs in SMILE 5.0.</li><li><strong>Usage</strong>:<br> Workspace-scoped scripts that migrate entity-activity or material-activity relations use this map to link to the newly created <code>ws_activities</code> records.</li></ul><hr><h2 id="map-user-email" tabindex="-1">MAP_USER_EMAIL <a class="header-anchor" href="#map-user-email" aria-label="Permalink to &quot;MAP_USER_EMAIL&quot;">​</a></h2><p><strong>Definition</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> MAP_USER_EMAIL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { _rab: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">6</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { _mal: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, _tb: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, _hiv: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">};</span></span></code></pre></div><ul><li><strong>Hard-coded Map</strong>:<br> A JSON object that maps: <ul><li>Key: SMILE 3.0 program ID (e.g., <code>1</code>, <code>2</code>)</li><li>Value: Object mapping user email domain codes (e.g., <code>_rab</code>, <code>_mal</code>) to SMILE 5.0 platform user IDs.</li></ul></li><li><strong>Purpose</strong>:<br> Provides a fallback or supplemental mapping for user records when email-domain logic is needed to assign the correct new user ID in SMILE 5.0.</li><li><strong>Usage</strong>:<br> The global <code>migrate-user-bulk.ts</code> script uses this map to assign existing SMILE 3.0 user accounts to the correct SMILE 5.0 user record.</li></ul><hr><p><strong>Note</strong>:</p><ul><li>All migration scripts import these constants from <code>const.ts</code>.</li><li>The first two constants are dynamically generated at runtime and should be valid before running any migration command.</li><li>Ensure that the <code>mapping_programs</code> and <code>mapping_activities</code> tables in the SMILE 5.0 database are populated (or empty but created) before running migrations that depend on them.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/constants-mapping.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var constants_mapping_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, constants_mapping_default as default };
