import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region archive/biofarma-order-v3/biofarma-order-controller-process.en.md
var __pageData = JSON.parse("{\"title\":\"Documentation: Process Flow of Biofarma Order Controller (v3.0)\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/biofarma-order-v3/biofarma-order-controller-process.en.md\",\"filePath\":\"archive/biofarma-order-v3/biofarma-order-controller-process.en.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/biofarma-order-v3/biofarma-order-controller-process.en.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="documentation-process-flow-of-biofarma-order-controller-v3-0" tabindex="-1">Documentation: Process Flow of Biofarma Order Controller (v3.0) <a class="header-anchor" href="#documentation-process-flow-of-biofarma-order-controller-v3-0" aria-label="Permalink to &quot;Documentation: Process Flow of Biofarma Order Controller (v3.0)&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Dokumentasi controller Sequelize Biofarma SMILE 3.0; kodenya sudah dicabut. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Biofarma Order Controller (<code>biofarmaOrderController.js</code>) is responsible for synchronizing order data from Biofarma with the Smile platform. It fetches order data from Biofarma APIs, processes and formats the data, and creates or updates orders in Smile via API calls. This process is designed to run periodically via cron jobs.</p><hr><h2 id="process-flow" tabindex="-1">Process Flow <a class="header-anchor" href="#process-flow" aria-label="Permalink to &quot;Process Flow&quot;">​</a></h2><h3 id="_1-fetching-biofarma-order-data" tabindex="-1">1. Fetching Biofarma Order Data <a class="header-anchor" href="#_1-fetching-biofarma-order-data" aria-label="Permalink to &quot;1. Fetching Biofarma Order Data&quot;">​</a></h3><ul><li>The controller authenticates with the Biofarma API using credentials stored in environment variables.</li><li>It fetches order data from different endpoints depending on the order type (<code>provinsi</code> or <code>hub</code>).</li><li>Pagination and filtering are applied to retrieve all relevant data, including support for monthly or custom date ranges.</li></ul><h3 id="_2-data-filtering-and-preparation" tabindex="-1">2. Data Filtering and Preparation <a class="header-anchor" href="#_2-data-filtering-and-preparation" aria-label="Permalink to &quot;2. Data Filtering and Preparation&quot;">​</a></h3><ul><li>Orders with null delivery order numbers (<code>no_do</code>) are filtered out.</li><li>Orders with excluded product names (e.g., certain COVID-19 vaccines) are filtered out.</li><li>The remaining orders are grouped by delivery order number (<code>no_do</code>).</li></ul><h3 id="_3-mapping-biofarma-data-to-smile-format" tabindex="-1">3. Mapping Biofarma Data to Smile Format <a class="header-anchor" href="#_3-mapping-biofarma-data-to-smile-format" aria-label="Permalink to &quot;3. Mapping Biofarma Data to Smile Format&quot;">​</a></h3><ul><li>Each Biofarma order is mapped to the Smile order format using the <code>mapBiofarmaToSmile</code> function.</li><li>Some area codes are adjusted based on predefined mappings.</li><li>Additional data enrichment is performed, such as handling materials classified as &quot;pelarut&quot; (solvent) to adjust dosage quantities.</li></ul><h3 id="_4-preparing-orders-for-smile" tabindex="-1">4. Preparing Orders for Smile <a class="header-anchor" href="#_4-preparing-orders-for-smile" aria-label="Permalink to &quot;4. Preparing Orders for Smile&quot;">​</a></h3><ul><li>Orders are prepared in batches, grouping items by delivery order number.</li><li>For each order, batches are formatted with details like batch code, expiration date, quantity, and manufacturer.</li><li>Two preparation methods exist: <code>prepareOrderSmile</code> for v3 orders and <code>prepareOrderSmileV2</code> for v5-compatible orders, which include activity IDs and version flags.</li></ul><h3 id="_5-creating-or-updating-orders-in-smile" tabindex="-1">5. Creating or Updating Orders in Smile <a class="header-anchor" href="#_5-creating-or-updating-orders-in-smile" aria-label="Permalink to &quot;5. Creating or Updating Orders in Smile&quot;">​</a></h3><ul><li>The controller checks if an order already exists in Smile and whether the quantities match.</li><li>If the order exists but quantities differ, it attempts to update the order by canceling the existing one and creating a new one.</li><li>If the order does not exist, it creates a new order in Smile via API calls.</li><li>Duplicate orders are tracked to avoid repeated processing.</li></ul><h3 id="_6-transaction-management" tabindex="-1">6. Transaction Management <a class="header-anchor" href="#_6-transaction-management" aria-label="Permalink to &quot;6. Transaction Management&quot;">​</a></h3><ul><li>Biofarma orders are bulk inserted into the local database with duplicate handling.</li><li>Sequelize transactions are used to ensure data integrity during bulk operations.</li></ul><h3 id="_7-additional-functionalities" tabindex="-1">7. Additional Functionalities <a class="header-anchor" href="#_7-additional-functionalities" aria-label="Permalink to &quot;7. Additional Functionalities&quot;">​</a></h3><ul><li>The controller supports fetching and processing Biofarma SMDV (vaccine dashboard) data.</li><li>It provides functions to delete Biofarma orders that no longer exist in the source data.</li><li>Logging is extensively used to track the process flow, successes, and errors.</li></ul><hr><h2 id="key-components" tabindex="-1">Key Components <a class="header-anchor" href="#key-components" aria-label="Permalink to &quot;Key Components&quot;">​</a></h2><ul><li><strong>Authentication:</strong> Obtains access tokens from Biofarma API for secure requests.</li><li><strong>Data Mapping:</strong> Converts Biofarma order fields to Smile order schema.</li><li><strong>Order Creation/Update:</strong> Handles order lifecycle in Smile, including cancellation and recreation.</li><li><strong>Batch Formatting:</strong> Prepares batch details for order items.</li><li><strong>Filtering:</strong> Excludes specific products and invalid data.</li><li><strong>Version Handling:</strong> Supports both v3 and v5 order formats with version flags.</li><li><strong>Error Handling:</strong> Logs errors and continues processing to avoid blocking.</li></ul><hr><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;Summary&quot;">​</a></h2><p>The Biofarma Order Controller automates the synchronization of vaccine orders from Biofarma to Smile, ensuring data consistency and timely updates. It handles complex data transformations, API interactions, and transactional database operations to maintain accurate order records.</p><p>This process is critical for maintaining up-to-date vaccine distribution data and is designed to be run regularly via scheduled cron jobs.</p><hr><h2 id="process-flow-diagrams" tabindex="-1">Process Flow Diagrams <a class="header-anchor" href="#process-flow-diagrams" aria-label="Permalink to &quot;Process Flow Diagrams&quot;">​</a></h2><p>Below are multiple flow diagrams in MermaidJS format illustrating key flows within the Biofarma Order Controller.</p><h3 id="_1-fetching-and-preparing-biofarma-orders" tabindex="-1">1. Fetching and Preparing Biofarma Orders <a class="header-anchor" href="#_1-fetching-and-preparing-biofarma-orders" aria-label="Permalink to &quot;1. Fetching and Preparing Biofarma Orders&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-219",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BStart%3A%20Trigger%20Cron%20Job%5D%20--%3E%20B%5BAuthenticate%20with%20Biofarma%20API%5D%0A%20%20B%20--%3E%20C%5BFetch%20Order%20Data%20provinsi%20hub%5D%0A%20%20C%20--%3E%20D%5BFilter%20Orders%3A%20Remove%20null%20no_do%20and%20excluded%20products%5D%0A%20%20D%20--%3E%20E%5BGroup%20Orders%20by%20no_do%5D%0A%20%20E%20--%3E%20F%5BMap%20Biofarma%20Data%20to%20Smile%20Format%5D%0A%20%20F%20--%3E%20G%5BPrepare%20Orders%20for%20Smile%20v3%20or%20v5%5D%0A%20%20G%20--%3E%20H%5BProceed%20to%20Order%20Creation%2FUpdate%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_2-creating-or-updating-orders-in-smile" tabindex="-1">2. Creating or Updating Orders in Smile <a class="header-anchor" href="#_2-creating-or-updating-orders-in-smile" aria-label="Permalink to &quot;2. Creating or Updating Orders in Smile&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-223",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BReceive%20Prepared%20Order%5D%20--%3E%20B%7BOrder%20Exists%20in%20Smile%3F%7D%0A%20%20B%20--%20Yes%20--%3E%20C%7BQuantities%20Match%3F%7D%0A%20%20C%20--%20Yes%20--%3E%20D%5BSkip%20Order%20Creation%5D%0A%20%20C%20--%20No%20--%3E%20E%5BCancel%20Existing%20Smile%20Order%5D%0A%20%20E%20--%3E%20F%5BCreate%20New%20Smile%20Order%5D%0A%20%20B%20--%20No%20--%3E%20F%5BCreate%20New%20Smile%20Order%5D%0A%20%20F%20--%3E%20G%5BLog%20Success%20or%20Error%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_3-batch-formatting-and-material-handling" tabindex="-1">3. Batch Formatting and Material Handling <a class="header-anchor" href="#_3-batch-formatting-and-material-handling" aria-label="Permalink to &quot;3. Batch Formatting and Material Handling&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-227",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BStart%20Batch%20Formatting%5D%20--%3E%20B%5BIs%20Material%20Pelarut%3F%5D%0A%20%20B%20--%20Yes%20--%3E%20C%5BAdjust%20Dosage%20Quantity%20Based%20on%20Pieces%20Per%20Unit%5D%0A%20%20B%20--%20No%20--%3E%20D%5BUse%20Original%20Dosage%20Quantity%5D%0A%20%20C%20--%3E%20E%5BFormat%20Batch%20Details%5D%0A%20%20D%20--%3E%20E%5BFormat%20Batch%20Details%5D%0A%20%20E%20--%3E%20F%5BAdd%20Batch%20to%20Order%20Items%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_4-transaction-management-and-database-operations" tabindex="-1">4. Transaction Management and Database Operations <a class="header-anchor" href="#_4-transaction-management-and-database-operations" aria-label="Permalink to &quot;4. Transaction Management and Database Operations&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-231",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BStart%20Database%20Transaction%5D%20--%3E%20B%5BBulk%20Insert%20Biofarma%20Orders%5D%0A%20%20B%20--%3E%20C%7BInsert%20Successful%3F%7D%0A%20%20C%20--%20Yes%20--%3E%20D%5BCommit%20Transaction%5D%0A%20%20C%20--%20No%20--%3E%20E%5BRollback%20Transaction%5D%0A%20%20D%20--%3E%20F%5BEnd%20Process%5D%0A%20%20E%20--%3E%20F%5BEnd%20Process%20with%20Error%5D%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/biofarma-order-v3/biofarma-order-controller-process.en.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var biofarma_order_controller_process_en_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, biofarma_order_controller_process_en_default as default };
