import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/diagrams/index.md
var __pageData = JSON.parse("{\"title\":\"Architecture Diagrams\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/index.md\",\"filePath\":\"architecture/diagrams/index.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="architecture-diagrams" tabindex="-1">Architecture Diagrams <a class="header-anchor" href="#architecture-diagrams" aria-label="Permalink to &quot;Architecture Diagrams&quot;">​</a></h1><p>This directory contains Mermaid C4 diagrams for the SMILE microservices:</p><ul><li>system-context.md</li><li>containers.md</li><li>core-components.md</li><li>main-components.md</li><li>auth-service-components.md</li><li>warehouse-service-components.md</li><li>auth-executive-flow.md</li></ul><p>Each file uses Mermaid C4 notation (components) or Mermaid sequence/flowchart notation (flows) to illustrate the respective architectural view.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var diagrams_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, diagrams_default as default };
