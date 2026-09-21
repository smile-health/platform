import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/interop-layer/adding-new-event.md
var __pageData = JSON.parse("{\"title\":\"Adding a New Event or Downstream System\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/interop-layer/adding-new-event.md\",\"filePath\":\"architecture/interop-layer/adding-new-event.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/interop-layer/adding-new-event.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adding-a-new-event-or-downstream-system" tabindex="-1">Adding a New Event or Downstream System <a class="header-anchor" href="#adding-a-new-event-or-downstream-system" aria-label="Permalink to &quot;Adding a New Event or Downstream System&quot;">​</a></h1><p>This guide covers the two most common integration tasks:</p><ul><li><strong>Scenario A</strong> — A new SMILE business event needs to flow out to external systems</li><li><strong>Scenario B</strong> — An existing event needs to also reach a new downstream system</li></ul><hr><h2 id="decision-tree" tabindex="-1">Decision Tree <a class="header-anchor" href="#decision-tree" aria-label="Permalink to &quot;Decision Tree&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>New requirement?</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── New event type from SMILE? (e.g. stock.adjusted)</span></span>
<span class="line"><span>│   └── → Follow Scenario A (all steps)</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── Existing event, new downstream target? (e.g. order.created → also DHIS2)</span></span>
<span class="line"><span>    └── → Follow Scenario B (DB-only, no code change)</span></span></code></pre></div><hr><h2 id="scenario-a-new-smile-event" tabindex="-1">Scenario A: New SMILE Event <a class="header-anchor" href="#scenario-a-new-smile-event" aria-label="Permalink to &quot;Scenario A: New SMILE Event&quot;">​</a></h2><h3 id="step-1-—-confirm-the-rabbitmq-topic-name" tabindex="-1">Step 1 — Confirm the RabbitMQ Topic Name <a class="header-anchor" href="#step-1-—-confirm-the-rabbitmq-topic-name" aria-label="Permalink to &quot;Step 1 — Confirm the RabbitMQ Topic Name&quot;">​</a></h3><p>Get the exact topic string from the SMILE service that publishes it. The interop-service consumes from a single queue and dispatches by topic key. Mismatched topic names result in silently dropped messages.</p><p>Common naming patterns in SMILE:</p><ul><li><code>order.created</code></li><li><code>order.status.order.confirm</code></li><li><code>stock.adjusted</code></li><li><code>patient.registered</code></li></ul><blockquote><p>Note: Some topics contain typos that are intentional (e.g. <code>order.status.order.fullfilled</code>) — always verify against the publishing service.</p></blockquote><hr><h3 id="step-2-—-insert-a-route-mapping" tabindex="-1">Step 2 — Insert a Route Mapping <a class="header-anchor" href="#step-2-—-insert-a-route-mapping" aria-label="Permalink to &quot;Step 2 — Insert a Route Mapping&quot;">​</a></h3><p>This tells <code>interop-service</code> which OpenHIM channel to forward events on this topic to. Insert into <code>openhim_route_mappings</code> in the <code>smile_interop</code> database:</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> openhim_route_mappings (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  rabbitmq_topic,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  openhim_channel_id,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  openhim_channel_name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  http_method,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  request_path,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  headers_json,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  include_context,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  auth_type,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  max_retries,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  retry_backoff_ms,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  retry_backoff_multiplier,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  expected_status_codes,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  created_by</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;stock.adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,                            </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- exact RabbitMQ topic key</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,                                           </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- enabled</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;smile-stock-adjusted-channel&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,             </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- OpenHIM channel ID (must match Step 3)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;SMILE Stock Adjusted Channel&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,             </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- human-readable name</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;POST&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;/pub/smile/stock/stock-adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- URL pattern of the OpenHIM channel</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  JSON_OBJECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Content-Type&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;application/json&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Accept&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;application/json&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- 1 = embed program_id, user_id, workspace_id as CloudEvent extensions</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;basic&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- max retries</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,       </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- initial backoff ms</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- backoff multiplier (1s → 2s → 4s)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;200,201,202,204&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;system&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span></code></pre></div><p>Add this to <a href="https://github.com/smile-health/platform/blob/main/apps/interop-service/db-scripts/route-mapping-insert.sql" target="_blank" rel="noreferrer">apps/interop-service/db-scripts/route-mapping-insert.sql</a> for version control.</p><p><strong>Key fields explained:</strong></p><table tabindex="0"><thead><tr><th>Field</th><th>Notes</th></tr></thead><tbody><tr><td><code>rabbitmq_topic</code></td><td>Must exactly match what SMILE publishes</td></tr><tr><td><code>openhim_channel_id</code></td><td>Arbitrary identifier — must match the channel you create in Step 3</td></tr><tr><td><code>request_path</code></td><td>Must match the OpenHIM channel&#39;s URL pattern</td></tr><tr><td><code>include_context</code></td><td>Set <code>1</code> to forward <code>program_id</code>, <code>user_id</code>, <code>user_email</code>, <code>request_id</code> as CloudEvent extension attributes. Set <code>0</code> for events where context is irrelevant</td></tr><tr><td><code>expected_status_codes</code></td><td>If OpenHIM returns a code NOT in this list, the call is treated as a failure and retried</td></tr></tbody></table><hr><h3 id="step-3-—-create-the-openhim-channel" tabindex="-1">Step 3 — Create the OpenHIM Channel <a class="header-anchor" href="#step-3-—-create-the-openhim-channel" aria-label="Permalink to &quot;Step 3 — Create the OpenHIM Channel&quot;">​</a></h3><p>In the OpenHIM console or via the OpenHIM REST API, create a new channel:</p><table tabindex="0"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><code>SMILE Stock Adjusted Channel</code></td></tr><tr><td>URL Pattern</td><td><code>/pub/smile/stock/stock-adjusted</code> (must match <code>request_path</code> in Step 2)</td></tr><tr><td>Type</td><td>HTTP</td></tr><tr><td>Status</td><td>Enabled</td></tr><tr><td>Allowed clients</td><td><code>smile-app</code></td></tr><tr><td>Route</td><td>Point to <code>rule-router</code> mediator host/port, path <code>/route</code></td></tr></tbody></table><p>The channel ID in OpenHIM does not need to match <code>openhim_channel_id</code> exactly — the <code>openhim_channel_id</code> column is used for audit logging only. What matters is the URL pattern matching.</p><hr><h3 id="step-4-—-insert-routing-rules" tabindex="-1">Step 4 — Insert Routing Rules <a class="header-anchor" href="#step-4-—-insert-routing-rules" aria-label="Permalink to &quot;Step 4 — Insert Routing Rules&quot;">​</a></h3><p>This tells <code>rule-router</code> which downstream system(s) receive this event and under what conditions. Insert into <code>integration_routing_rules</code> in the <code>smile_interop</code> database:</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Route to SITB adapter for TB program (program_id = 4)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;stock.adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;program_id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;4&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/sitb/stock&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;Program 4 (TB) - Stock Adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    FALSE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Route to SIHA adapter by client key</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;stock.adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;client_key&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;siha&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/siha/stock&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;SIHA - Stock Adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    FALSE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Default fallback: catch-all when no specific rule matches</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;stock.adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;program_id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- value is irrelevant when is_default = TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/default/stock&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;Default - Stock Adjusted&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    TRUE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">99</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span></code></pre></div><p>Add these to <a href="https://github.com/smile-health/platform/blob/main/apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql" target="_blank" rel="noreferrer">apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql</a>.</p><p><strong>Rule evaluation logic:</strong></p><ol><li>All specific rules (<code>is_default = FALSE</code>) are evaluated first</li><li>If one or more match → forward to all matched targets in parallel</li><li>If none match → fall back to <code>is_default = TRUE</code> rules</li><li>If no rules exist for the topic → return 200 &quot;no routing configured&quot; (not an error)</li></ol><p><strong>Filter key options:</strong></p><table tabindex="0"><thead><tr><th>Filter Key</th><th>What it matches</th></tr></thead><tbody><tr><td><code>program_id</code></td><td>CloudEvent extension <code>program_id</code> or <code>data.program_id</code></td></tr><tr><td><code>client_key</code></td><td>CloudEvent extension <code>client_key</code> or <code>X-Integration-Client</code> header</td></tr><tr><td><code>header:x-some-header</code></td><td>HTTP header (case-insensitive)</td></tr><tr><td><code>data.some.nested.field</code></td><td>Dot-path traversal of CloudEvent <code>data</code></td></tr><tr><td>Any other string</td><td>CloudEvent top-level extension attribute</td></tr></tbody></table><p><strong>Operator options:</strong> <code>eq</code>, <code>neq</code>, <code>contains</code>, <code>starts_with</code>, <code>regex</code></p><hr><h3 id="step-5-—-optional-write-a-custom-transformer" tabindex="-1">Step 5 — (Optional) Write a Custom Transformer <a class="header-anchor" href="#step-5-—-optional-write-a-custom-transformer" aria-label="Permalink to &quot;Step 5 — (Optional) Write a Custom Transformer&quot;">​</a></h3><p>Skip this step if the raw SMILE payload can be forwarded as-is. The <code>PassThroughTransformer</code> wraps any payload in a CloudEvent automatically.</p><p>Only write a transformer when you need to:</p><ul><li>Rename or restructure fields (e.g. map <code>id</code> → <code>stock_id</code>)</li><li>Validate required fields and fail fast with a clear error</li><li>Compute derived fields before forwarding</li></ul><p><strong>Create the transformer class</strong> in <a href="https://github.com/smile-health/platform/blob/main/apps/interop-service/src/modules/transformers/transformer.base.ts" target="_blank" rel="noreferrer">apps/interop-service/src/modules/transformers/transformer.base.ts</a>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> StockAdjustedTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> extends</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BaseTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> topic</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;stock.adjusted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> cloudEventType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;com.smile.stock.adjusted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  transform</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">    payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">    context</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> MessageContext</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> CloudEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Record</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;&gt; {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // Validate required fields — throws on missing fields</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">requireFields</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload, [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;item_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;quantity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]);</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> obj</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> payload </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Record</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">createCloudEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        stock_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">String</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(obj.id),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        item_id: obj.item_id,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        quantity: obj.quantity,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        adjusted_at: obj.adjusted_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">toISOString</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">extractSubject</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      context,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    );</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  extractSubject</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">getField</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> ?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> \`stock_\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Register the transformer</strong> in <a href="https://github.com/smile-health/platform/blob/main/apps/interop-service/src/modules/transformers/registry.ts" target="_blank" rel="noreferrer">apps/interop-service/src/modules/transformers/registry.ts</a>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Inside initializeDefaultTransformers():</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">register</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;stock.adjusted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> StockAdjustedTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">());</span></span></code></pre></div><blockquote><p>If <code>ENABLE_PAYLOAD_TRANSFORMATION=false</code> (the default), the registry is bypassed entirely and <code>PassThroughTransformer</code> is always used regardless of registrations. Set to <code>true</code> to activate topic-specific transformers.</p></blockquote><hr><h3 id="step-6-—-reload-without-restarting" tabindex="-1">Step 6 — Reload Without Restarting <a class="header-anchor" href="#step-6-—-reload-without-restarting" aria-label="Permalink to &quot;Step 6 — Reload Without Restarting&quot;">​</a></h3><p>For DB-only changes (Steps 2 and 4), no deployment is needed. Reload the in-memory caches:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Reload interop-service route mappings</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -X</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> POST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4004/admin/refresh-routes</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Reload rule-router routing rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -X</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> POST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4005/admin/refresh-rules</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Verify the new event is registered</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4004/admin/routes</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> jq</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;[.routes[] | .rabbitmq_topic]&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4005/admin/rules</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> jq</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;[.rules[] | {topic: .topic, target: .target_name}]&#39;</span></span></code></pre></div><hr><h3 id="step-7-—-redeploy-if-code-changed" tabindex="-1">Step 7 — Redeploy (if code changed) <a class="header-anchor" href="#step-7-—-redeploy-if-code-changed" aria-label="Permalink to &quot;Step 7 — Redeploy (if code changed)&quot;">​</a></h3><p>Only required if you added a transformer (Step 5):</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Docker Compose</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> compose</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> up</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> interop-service</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Kubernetes</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> apps/interop-service/Dockerfile</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -t</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> your-registry/interop-service:v1.x</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> .</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> push</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> your-registry/interop-service:v1.x</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">kubectl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> image</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> deployment/interop-service</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> interop-service=your-registry/interop-service:v1.x</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">kubectl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> rollout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> status</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> deployment/interop-service</span></span></code></pre></div><hr><h2 id="scenario-b-new-downstream-system-for-an-existing-event" tabindex="-1">Scenario B: New Downstream System for an Existing Event <a class="header-anchor" href="#scenario-b-new-downstream-system-for-an-existing-event" aria-label="Permalink to &quot;Scenario B: New Downstream System for an Existing Event&quot;">​</a></h2><p>No code changes required. Only Step 4 and Step 6 from Scenario A are needed.</p><p><strong>Example</strong>: Also send <code>order.created</code> to DHIS2 for program_id=7:</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;order.created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;program_id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;7&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/dhis2/orders&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;Program 7 - DHIS2 Order Created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    FALSE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span></code></pre></div><p>Then reload:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -X</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> POST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4005/admin/refresh-rules</span></span></code></pre></div><p>No OpenHIM channel changes needed. No <code>interop-service</code> changes needed. The existing <code>order.created</code> channel already points to <code>rule-router</code>, and <code>rule-router</code> now has an additional rule.</p><hr><h2 id="complete-checklist" tabindex="-1">Complete Checklist <a class="header-anchor" href="#complete-checklist" aria-label="Permalink to &quot;Complete Checklist&quot;">​</a></h2><h3 id="scenario-a-—-new-event" tabindex="-1">Scenario A — New Event <a class="header-anchor" href="#scenario-a-—-new-event" aria-label="Permalink to &quot;Scenario A — New Event&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>□ 1. Confirm exact RabbitMQ topic name from SMILE team</span></span>
<span class="line"><span>□ 2. Insert row into openhim_route_mappings</span></span>
<span class="line"><span>□    └── Add to db-scripts/route-mapping-insert.sql (version control)</span></span>
<span class="line"><span>□ 3. Create OpenHIM channel with matching URL pattern</span></span>
<span class="line"><span>□    └── Set allowed client: smile-app</span></span>
<span class="line"><span>□    └── Set route: rule-router host:4005/route</span></span>
<span class="line"><span>□ 4. Insert routing rule(s) into integration_routing_rules</span></span>
<span class="line"><span>□    └── Add to db-scripts/routing-rules-insert.sql (version control)</span></span>
<span class="line"><span>□    └── Add is_default=TRUE fallback if needed</span></span>
<span class="line"><span>□ 5. (Optional) Write custom transformer if field mapping is needed</span></span>
<span class="line"><span>□    └── Extend BaseTransformer</span></span>
<span class="line"><span>□    └── Register in TransformerRegistry.initializeDefaultTransformers()</span></span>
<span class="line"><span>□ 6. Reload caches</span></span>
<span class="line"><span>□    └── POST /admin/refresh-routes (interop-service)</span></span>
<span class="line"><span>□    └── POST /admin/refresh-rules (rule-router)</span></span>
<span class="line"><span>□ 7. Verify with GET /admin/routes and GET /admin/rules</span></span>
<span class="line"><span>□ 8. Rebuild and redeploy interop-service if transformer was added</span></span>
<span class="line"><span>□ 9. Test end-to-end by publishing a test message to RabbitMQ</span></span>
<span class="line"><span>□    └── Check openhim_route_execution_logs for success audit entry</span></span></code></pre></div><h3 id="scenario-b-—-new-downstream-system" tabindex="-1">Scenario B — New Downstream System <a class="header-anchor" href="#scenario-b-—-new-downstream-system" aria-label="Permalink to &quot;Scenario B — New Downstream System&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>□ 1. Confirm target adapter URL (OpenHIM path)</span></span>
<span class="line"><span>□ 2. Insert row into integration_routing_rules</span></span>
<span class="line"><span>□    └── Add to db-scripts/routing-rules-insert.sql (version control)</span></span>
<span class="line"><span>□ 3. POST /admin/refresh-rules (rule-router)</span></span>
<span class="line"><span>□ 4. Verify with GET /admin/rules</span></span>
<span class="line"><span>□ 5. Test end-to-end</span></span></code></pre></div><hr><h2 id="testing-end-to-end" tabindex="-1">Testing End-to-End <a class="header-anchor" href="#testing-end-to-end" aria-label="Permalink to &quot;Testing End-to-End&quot;">​</a></h2><p>After making changes, publish a test message to RabbitMQ manually to verify the full pipeline:</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Using amqplib (Node.js)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> message</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  topic: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;stock.adjusted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  payload: { id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">99</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, item_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, quantity: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">50</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, program_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  context: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    program_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_email: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;test@example.com&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;test-req-001&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  headers: {}</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">};</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">channel.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">publish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;smile.events&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;stock.adjusted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, Buffer.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">JSON</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">stringify</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(message)));</span></span></code></pre></div><p>Then check:</p><ol><li><code>interop-service</code> logs for the event being processed</li><li>OpenHIM console for the transaction record</li><li><code>rule-router</code> logs for routing decision</li><li><code>openhim_route_execution_logs</code> for the audit entry:</li></ol><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> *</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> openhim_route_execution_logs</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> rabbitmq_topic </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;stock.adjusted&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> created_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DESC</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">LIMIT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/interop-layer/adding-new-event.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var adding_new_event_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, adding_new_event_default as default };
