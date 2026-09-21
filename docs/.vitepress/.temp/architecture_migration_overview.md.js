import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/migration/overview.md
var __pageData = JSON.parse("{\"title\":\"Data Migration Overview\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/overview.md\",\"filePath\":\"architecture/migration/overview.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/overview.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="data-migration-overview" tabindex="-1">Data Migration Overview <a class="header-anchor" href="#data-migration-overview" aria-label="Permalink to &quot;Data Migration Overview&quot;">​</a></h1><h2 id="logistics-data-migration" tabindex="-1">Logistics Data Migration <a class="header-anchor" href="#logistics-data-migration" aria-label="Permalink to &quot;Logistics Data Migration&quot;">​</a></h2><ol><li>Migrate locations: &lt; 1 minute</li><li>Migrate activities: &lt; 1 minute</li><li>Migrate entities: +- 6 minutes</li><li>Migrate materials: +- 5 minutes</li><li>Migrate users: +- 2 minutes</li></ol></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/overview.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var overview_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, overview_default as default };
