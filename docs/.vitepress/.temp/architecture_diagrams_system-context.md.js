import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/diagrams/system-context.md
var __pageData = JSON.parse("{\"title\":\"System Context Diagram\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/system-context.md\",\"filePath\":\"architecture/diagrams/system-context.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/system-context.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="system-context-diagram" tabindex="-1">System Context Diagram <a class="header-anchor" href="#system-context-diagram" aria-label="Permalink to &quot;System Context Diagram&quot;">​</a></h1>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-3",
				class: "mermaid",
				graph: "C4Context%0Atitle%20SMILE%20Platform%20-%20System%20Context%0A%0APerson(user%2C%20%22User%22%2C%20%22A%20user%20of%20the%20SMILE%20Platform%22)%0ASystem(core%2C%20%22Core%20Service%22%2C%20%22Handles%20core%2C%20shared%20business%20logic%20and%20background%20processing%22)%0ASystem(main%2C%20%22Main%20Service%22%2C%20%22Workspace%20management%20and%20migration%20workflows%22)%0ASystem(auth%2C%20%22Auth%20Service%22%2C%20%22Authentication%20and%20user%20management%20via%20Keycloak%22)%0ASystem(warehouse%2C%20%22Warehouse%20Service%22%2C%20%22Warehouse%20and%20inventory%20operations%22)%0ASystem_Ext(db%2C%20%22MySQL%20Database%22%2C%20%22Stores%20persistent%20data%20for%20all%20services%22)%0ASystem_Ext(redis%2C%20%22Redis%20Cache%22%2C%20%22Distributed%20cache%20for%20performance%20and%20locks%22)%0ASystem_Ext(rabbitmq%2C%20%22RabbitMQ%22%2C%20%22Message%20broker%20for%20event-driven%20communication%22)%0ASystem_Ext(elasticsearch%2C%20%22Elasticsearch%22%2C%20%22Search%20and%20analytics%20engine%22)%0ASystem_Ext(keycloak%2C%20%22Keycloak%22%2C%20%22Identity%20provider%20and%20SSO%22)%0A%0ARel(user%2C%20core%2C%20%22Uses%20REST%20API%22)%0ARel(user%2C%20main%2C%20%22Uses%20REST%20API%22)%0ARel(user%2C%20warehouse%2C%20%22Uses%20REST%20API%22)%0ARel(user%2C%20auth%2C%20%22Authenticates%20and%20manages%20session%22)%0ARel(core%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%2FJDBC%22)%0ARel(main%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%2FJDBC%22)%0ARel(warehouse%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%2FJDBC%22)%0ARel(core%2C%20redis%2C%20%22Caches%20data%20and%20manages%20locks%22%2C%20%22Redis%20protocol%22)%0ARel(core%2C%20rabbitmq%2C%20%22Publishes%20and%20subscribes%20events%22%2C%20%22AMQP%22)%0ARel(warehouse%2C%20rabbitmq%2C%20%22Publishes%20and%20subscribes%20events%22%2C%20%22AMQP%22)%0ARel(core%2C%20elasticsearch%2C%20%22Indexes%20logs%20and%20metrics%22%2C%20%22HTTP%2FREST%22)%0ARel(main%2C%20elasticsearch%2C%20%22Indexes%20workspace%20data%22%2C%20%22HTTP%2FREST%22)%0ARel(auth%2C%20keycloak%2C%20%22Delegates%20user%20authentication%22%2C%20%22OpenID%20Connect%22)%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/system-context.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var system_context_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, system_context_default as default };
