import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/diagrams/auth-service-components.md
var __pageData = JSON.parse("{\"title\":\"Auth Service - Component Diagram\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/auth-service-components.md\",\"filePath\":\"architecture/diagrams/auth-service-components.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/auth-service-components.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="auth-service-component-diagram" tabindex="-1">Auth Service - Component Diagram <a class="header-anchor" href="#auth-service-component-diagram" aria-label="Permalink to &quot;Auth Service - Component Diagram&quot;">​</a></h1>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-3",
				class: "mermaid",
				graph: "C4Component%0Atitle%20Auth%20Service%20-%20Components%0A%0AContainer(auth%2C%20%22Auth%20Service%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22Handles%20authentication%20and%20user%20management%20via%20Keycloak%22)%0A%0AComponent(OpenAPIApp%2C%20%22OpenAPI%20App%22%2C%20%22OpenAPIHono%22%2C%20%22Registers%20routes%2C%20middleware%2C%20and%20docs%22)%0AComponent(AuthController%2C%20%22AuthController%22%2C%20%22src%2Fcontrollers%2FauthController.ts%22%2C%20%22Implements%20login%2C%20logout%2C%20and%20token%20validation%20endpoints%22)%0AComponent(UserController%2C%20%22UserController%22%2C%20%22src%2Fcontrollers%2FuserController.ts%22%2C%20%22Implements%20user%20profile%20endpoints%22)%0AComponent(KeycloakClient%2C%20%22KeycloakClient%22%2C%20%22src%2FkeycloakClient.ts%22%2C%20%22Interacts%20with%20Keycloak%20Admin%20and%20Token%20endpoints%22)%0AComponent(UserServiceClient%2C%20%22UserServiceClient%22%2C%20%22src%2FuserServiceClient.ts%22%2C%20%22Calls%20external%20User%20Service%20API%20for%20last-login%20updates%22)%0AComponent(HTTPLogger%2C%20%22HTTP%20Logger%22%2C%20%22%40smile-health%2Flib%2Flogger%22%2C%20%22Logs%20HTTP%20requests%20and%20application%20events%22)%0AComponent(RequestMiddleware%2C%20%22Request%20Middleware%22%2C%20%22%40smile-health%2Flib%2Fmiddlewares%22%2C%20%22Validates%20and%20enriches%20incoming%20requests%22)%0AComponent(SwaggerUI%2C%20%22Swagger%20UI%22%2C%20%22%40hono%2Fswagger-ui%22%2C%20%22Renders%20OpenAPI%20documentation%22)%0A%0ARel(OpenAPIApp%2C%20HTTPLogger%2C%20%22Uses%22)%0ARel(OpenAPIApp%2C%20RequestMiddleware%2C%20%22Uses%22)%0ARel(OpenAPIApp%2C%20SwaggerUI%2C%20%22Serves%20UI%22)%0ARel(AuthController%2C%20KeycloakClient%2C%20%22Calls%22)%0ARel(UserController%2C%20KeycloakClient%2C%20%22Calls%22)%0ARel(AuthController%2C%20UserServiceClient%2C%20%22Calls%22)%0ARel(UserController%2C%20UserServiceClient%2C%20%22Calls%22)%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/auth-service-components.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var auth_service_components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, auth_service_components_default as default };
