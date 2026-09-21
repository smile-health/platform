import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/feature-flags/feature-flags-diagram.md
var __pageData = JSON.parse("{\"title\":\"Feature Flags Implementation Flow\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/feature-flags/feature-flags-diagram.md\",\"filePath\":\"architecture/feature-flags/feature-flags-diagram.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/feature-flags/feature-flags-diagram.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="feature-flags-implementation-flow" tabindex="-1">Feature Flags Implementation Flow <a class="header-anchor" href="#feature-flags-implementation-flow" aria-label="Permalink to &quot;Feature Flags Implementation Flow&quot;">​</a></h1><h2 id="implementation-steps" tabindex="-1">Implementation Steps <a class="header-anchor" href="#implementation-steps" aria-label="Permalink to &quot;Implementation Steps&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-6",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20Dev%20as%20Developer%0A%20%20%20%20participant%20Service%20as%20Service%20Code%0A%20%20%20%20participant%20Env%20as%20Environment%0A%20%20%20%20participant%20GB%20as%20GrowthBook%20API%0A%20%20%20%20participant%20Webhook%20as%20Webhook%20Endpoint%0A%0A%20%20%20%20Note%20over%20Dev%2CWebhook%3A%201.%20Initial%20Setup%0A%20%20%20%20Dev-%3E%3EEnv%3A%20Set%20GROWTHBOOK_*%20variables%0A%20%20%20%20Dev-%3E%3EService%3A%20Add%20featureFlagsMiddleware%0A%20%20%20%20Dev-%3E%3EService%3A%20Add%20webhook%20endpoints%0A%20%20%20%20%0A%20%20%20%20Note%20over%20Dev%2CWebhook%3A%202.%20Service%20Startup%0A%20%20%20%20Service-%3E%3EEnv%3A%20Load%20configuration%0A%20%20%20%20Service-%3E%3EGB%3A%20Initialize%20%26%20load%20features%0A%20%20%20%20GB--%3E%3EService%3A%20Return%20feature%20definitions%0A%20%20%20%20%0A%20%20%20%20Note%20over%20Dev%2CWebhook%3A%203.%20Runtime%20Usage%0A%20%20%20%20Service-%3E%3EService%3A%20Process%20request%0A%20%20%20%20Service-%3E%3EService%3A%20Check%20feature%20flags%0A%20%20%20%20Service-%3E%3EService%3A%20Execute%20business%20logic%0A%20%20%20%20%0A%20%20%20%20Note%20over%20Dev%2CWebhook%3A%204.%20Real-time%20Updates%0A%20%20%20%20Dev-%3E%3EGB%3A%20Change%20feature%20flag%0A%20%20%20%20GB-%3E%3EWebhook%3A%20Send%20webhook%20event%0A%20%20%20%20Webhook-%3E%3EWebhook%3A%20Verify%20signature%0A%20%20%20%20Webhook-%3E%3EGB%3A%20Refresh%20features%0A%20%20%20%20GB--%3E%3EWebhook%3A%20Return%20updated%20features%0A%20%20%20%20Webhook-%3E%3EService%3A%20Update%20local%20cache%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="service-integration-diagram" tabindex="-1">Service Integration Diagram <a class="header-anchor" href="#service-integration-diagram" aria-label="Permalink to &quot;Service Integration Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-10",
				class: "mermaid",
				graph: "flowchart%20TB%0A%20%20%20%20subgraph%20Setup%5B%22Service%20Setup%22%5D%0A%20%20%20%20%20%20%20%20A%5BService%20Startup%5D%20--%3E%20B%5BLoad%20Environment%20Variables%5D%0A%20%20%20%20%20%20%20%20B%20--%3E%20C%5BInitialize%20GrowthBookService%5D%0A%20%20%20%20%20%20%20%20C%20--%3E%20D%5BLoad%20Feature%20Flags%20from%20API%5D%0A%20%20%20%20%20%20%20%20D%20--%3E%20E%5BApply%20featureFlagsMiddleware%5D%0A%20%20%20%20%20%20%20%20E%20--%3E%20F%5BService%20Ready%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Request%5B%22Request%20Flow%22%5D%0A%20%20%20%20%20%20%20%20G%5BIncoming%20Request%5D%20--%3E%20H%5BMiddleware%20Execution%5D%0A%20%20%20%20%20%20%20%20H%20--%3E%20I%5BSet%20User%20Attributes%5D%0A%20%20%20%20%20%20%20%20I%20--%3E%20J%5BInject%20Feature%20Flag%20Functions%5D%0A%20%20%20%20%20%20%20%20J%20--%3E%20K%5BController%2FHandler%5D%0A%20%20%20%20%20%20%20%20K%20--%3E%20L%7BUse%20Feature%20Flag%3F%7D%0A%20%20%20%20%20%20%20%20L%20--%3E%7CYes%7C%20M%5BGet%20Feature%20Flag%20Value%5D%0A%20%20%20%20%20%20%20%20L%20--%3E%7CNo%7C%20N%5BNormal%20Processing%5D%0A%20%20%20%20%20%20%20%20M%20--%3E%20O%5BSynchronous%20Flag%20Check%5D%0A%20%20%20%20%20%20%20%20O%20--%3E%20P%5BBusiness%20Logic%5D%0A%20%20%20%20%20%20%20%20N%20--%3E%20P%0A%20%20%20%20%20%20%20%20P%20--%3E%20Q%5BResponse%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Updates%5B%22Real-time%20Updates%22%5D%0A%20%20%20%20%20%20%20%20R%5BGrowthBook%20Dashboard%5D%20--%3E%20S%5BFeature%20Flag%20Change%5D%0A%20%20%20%20%20%20%20%20S%20--%3E%20T%5BWebhook%20Triggered%5D%0A%20%20%20%20%20%20%20%20T%20--%3E%20U%5BPOST%20%2Fwebhooks%2Fgrowthbook%5D%0A%20%20%20%20%20%20%20%20U%20--%3E%20V%5BVerify%20HMAC%20Signature%5D%0A%20%20%20%20%20%20%20%20V%20--%3E%7CValid%7C%20W%5BParse%20Event%20Type%5D%0A%20%20%20%20%20%20%20%20V%20--%3E%7CInvalid%7C%20X%5BReject%20Request%5D%0A%20%20%20%20%20%20%20%20W%20--%3E%20Y%7BRelevant%20Event%3F%7D%0A%20%20%20%20%20%20%20%20Y%20--%3E%7CYes%7C%20Z%5BRefresh%20Feature%20Flags%5D%0A%20%20%20%20%20%20%20%20Y%20--%3E%7CNo%7C%20AA%5BLog%20%26%20Ignore%5D%0A%20%20%20%20%20%20%20%20Z%20--%3E%20BB%5BUpdate%20Local%20Cache%5D%0A%20%20%20%20%20%20%20%20BB%20--%3E%20CC%5BReady%20for%20Next%20Request%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Manual%5B%22Manual%20Refresh%22%5D%0A%20%20%20%20%20%20%20%20DD%5BAdmin%20Request%5D%20--%3E%20EE%5BPOST%20%2Fadmin%2Ffeature-flags%2Frefresh%5D%0A%20%20%20%20%20%20%20%20EE%20--%3E%20FF%5BTrigger%20Manual%20Refresh%5D%0A%20%20%20%20%20%20%20%20FF%20--%3E%20Z%0A%20%20%20%20end%0A%0A%20%20%20%20F%20--%3E%20G%0A%20%20%20%20CC%20--%3E%20G%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="architecture-components" tabindex="-1">Architecture Components <a class="header-anchor" href="#architecture-components" aria-label="Permalink to &quot;Architecture Components&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-14",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20subgraph%20%22Service%20Layer%22%0A%20%20%20%20%20%20%20%20A%5BHono%20App%5D%20--%3E%20B%5BFeature%20Flags%20Middleware%5D%0A%20%20%20%20%20%20%20%20B%20--%3E%20C%5BRequest%20Handlers%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Feature%20Flags%20Layer%22%0A%20%20%20%20%20%20%20%20D%5BGrowthBookService%5D%20--%3E%20E%5BFeature%20Cache%5D%0A%20%20%20%20%20%20%20%20F%5BWebhook%20Handler%5D%20--%3E%20D%0A%20%20%20%20%20%20%20%20G%5BManual%20Refresh%5D%20--%3E%20D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22External%20Services%22%0A%20%20%20%20%20%20%20%20H%5BGrowthBook%20API%5D%20--%3E%20D%0A%20%20%20%20%20%20%20%20I%5BGrowthBook%20Dashboard%5D%20--%3E%20F%0A%20%20%20%20end%0A%0A%20%20%20%20B%20--%3E%20D%0A%20%20%20%20C%20--%3E%20E%0A%20%20%20%20H%20-.-%3E%7CInitial%20Load%7C%20E%0A%20%20%20%20I%20-.-%3E%7CReal-time%20Updates%7C%20F%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="code-integration-points" tabindex="-1">Code Integration Points <a class="header-anchor" href="#code-integration-points" aria-label="Permalink to &quot;Code Integration Points&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-18",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20%20%20A%5Bwire.ts%5D%20--%3E%20B%5BAdd%20Middleware%5D%0A%20%20%20%20A%20--%3E%20C%5BAdd%20Webhook%20Routes%5D%0A%20%20%20%20%0A%20%20%20%20B%20--%3E%20D%5BfeatureFlagsMiddleware%5D%0A%20%20%20%20C%20--%3E%20E%5BcreateWebhookHandler%5D%0A%20%20%20%20C%20--%3E%20F%5BcreateRefreshHandler%5D%0A%20%20%20%20%0A%20%20%20%20D%20--%3E%20G%5BController%2FHandler%5D%0A%20%20%20%20G%20--%3E%20H%5BGet%20Feature%20Enabled%5D%0A%20%20%20%20G%20--%3E%20I%5BGet%20Feature%20Flags%5D%0A%20%20%20%20%0A%20%20%20%20J%5B.env%5D%20--%3E%20K%5BGROWTHBOOK_CLIENT_KEY%5D%0A%20%20%20%20J%20--%3E%20L%5BGROWTHBOOK_WEBHOOK_SECRET%5D%0A%20%20%20%20J%20--%3E%20M%5BGROWTHBOOK_API_HOST%5D%0A%20%20%20%20%0A%20%20%20%20K%20--%3E%20D%0A%20%20%20%20L%20--%3E%20E%0A%20%20%20%20M%20--%3E%20D%0A%20%20%20%20%0A%20%20%20%20style%20A%20fill%3A%23e1f5fe%0A%20%20%20%20style%20J%20fill%3A%23f3e5f5%0A%20%20%20%20style%20G%20fill%3A%23e8f5e8%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/feature-flags/feature-flags-diagram.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var feature_flags_diagram_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, feature_flags_diagram_default as default };
