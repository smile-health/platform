import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/interop-layer/architecture.md
var __pageData = JSON.parse("{\"title\":\"Interop Layer Architecture\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/interop-layer/architecture.md\",\"filePath\":\"architecture/interop-layer/architecture.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/interop-layer/architecture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="interop-layer-architecture" tabindex="-1">Interop Layer Architecture <a class="header-anchor" href="#interop-layer-architecture" aria-label="Permalink to &quot;Interop Layer Architecture&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The interop layer is a two-stage pipeline that connects SMILE&#39;s internal event bus (RabbitMQ) to external health information systems. OpenHIM acts as the integration middleware hub between the two stages.</p><p>The current implementation supports <strong>outbound communication only</strong> — SMILE publishes events that flow out to external systems. Inbound communication (external systems calling back into SMILE) is not yet implemented.</p><h3 id="communication-direction" tabindex="-1">Communication Direction <a class="header-anchor" href="#communication-direction" aria-label="Permalink to &quot;Communication Direction&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Direction</th><th>Definition</th><th>Status</th></tr></thead><tbody><tr><td><strong>Outbound</strong></td><td>SMILE → external system (e.g. SIHA, SITB, DHIS2)</td><td>Implemented</td></tr><tr><td><strong>Inbound</strong></td><td>External system → SMILE (e.g. acknowledgement, status update)</td><td>Not yet implemented</td></tr></tbody></table><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>                         ◄─── INBOUND (not yet implemented)</span></span>
<span class="line"><span>                         ──── OUTBOUND (implemented) ───►</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         SMILE Platform                              │</span></span>
<span class="line"><span>│  (Main Service, Warehouse Service, etc.)                            │</span></span>
<span class="line"><span>└──────────────────────────────┬──────────────────────────────────────┘</span></span>
<span class="line"><span>                               │ [OUTBOUND] Publishes events</span></span>
<span class="line"><span>                               ▼</span></span>
<span class="line"><span>                         ┌──────────┐</span></span>
<span class="line"><span>                         │ RabbitMQ │</span></span>
<span class="line"><span>                         └────┬─────┘</span></span>
<span class="line"><span>                              │ [OUTBOUND] Consumes (topic-filtered)</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>              ┌───────────────────────────────┐</span></span>
<span class="line"><span>              │        interop-service        │  Stage 1</span></span>
<span class="line"><span>              │  • Validates message          │</span></span>
<span class="line"><span>              │  • Looks up route mapping     │</span></span>
<span class="line"><span>              │  • Transforms → CloudEvent    │</span></span>
<span class="line"><span>              │  • Sends to OpenHIM channel   │</span></span>
<span class="line"><span>              │  • Retries on failure         │</span></span>
<span class="line"><span>              │  • Writes audit log           │</span></span>
<span class="line"><span>              └───────────────┬───────────────┘</span></span>
<span class="line"><span>                              │ [OUTBOUND] HTTP POST (CloudEvent JSON)</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>                     ┌─────────────────┐</span></span>
<span class="line"><span>                     │   OpenHIM Core  │</span></span>
<span class="line"><span>                     │  (API Gateway)  │</span></span>
<span class="line"><span>                     └────────┬────────┘</span></span>
<span class="line"><span>                              │ [OUTBOUND] Routes to registered mediator</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>              ┌───────────────────────────────┐</span></span>
<span class="line"><span>              │       rule-router             │  Stage 2</span></span>
<span class="line"><span>              │  (OpenHIM Mediator)           │</span></span>
<span class="line"><span>              │  • Parses CloudEvent          │</span></span>
<span class="line"><span>              │  • Evaluates routing rules    │</span></span>
<span class="line"><span>              │  • Fan-out to targets         │</span></span>
<span class="line"><span>              │  • Returns orchestrations     │</span></span>
<span class="line"><span>              └───────┬──────────────┬────────┘</span></span>
<span class="line"><span>                      │              │  [OUTBOUND] Forward to targets</span></span>
<span class="line"><span>             ┌────────▼───┐   ┌──────▼──────┐</span></span>
<span class="line"><span>             │    SIHA    │   │    SITB     │  ... other systems</span></span>
<span class="line"><span>             │  Adapter   │   │  Adapter    │</span></span>
<span class="line"><span>             └────────────┘   └─────────────┘</span></span></code></pre></div><h2 id="stage-1-interop-service" tabindex="-1">Stage 1: <code>interop-service</code> <a class="header-anchor" href="#stage-1-interop-service" aria-label="Permalink to &quot;Stage 1: \`interop-service\`&quot;">​</a></h2><h3 id="responsibility" tabindex="-1">Responsibility <a class="header-anchor" href="#responsibility" aria-label="Permalink to &quot;Responsibility&quot;">​</a></h3><p>Bridges RabbitMQ and OpenHIM. It owns <strong>topic-level routing</strong> — determining which OpenHIM channel a given event type maps to.</p><h3 id="processing-pipeline-per-message" tabindex="-1">Processing Pipeline (per message) <a class="header-anchor" href="#processing-pipeline-per-message" aria-label="Permalink to &quot;Processing Pipeline (per message)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RabbitMQ Message</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 1</span></span>
<span class="line"><span>  Validate message envelope</span></span>
<span class="line"><span>  (Zod schema: topic, payload, context, headers)</span></span>
<span class="line"><span>      │ fail → log + discard</span></span>
<span class="line"><span>      ▼ Step 2</span></span>
<span class="line"><span>  Look up route mapping from in-memory cache</span></span>
<span class="line"><span>  (openhim_route_mappings table, keyed by rabbitmq_topic)</span></span>
<span class="line"><span>      │ miss or disabled → log + discard</span></span>
<span class="line"><span>      ▼ Step 3</span></span>
<span class="line"><span>  Build RouterContext</span></span>
<span class="line"><span>  (executionId, traceId from headers, requestId, messageContext)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 4</span></span>
<span class="line"><span>  Transform payload → CloudEvent</span></span>
<span class="line"><span>  ┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ ENABLE_PAYLOAD_TRANSFORMATION = false   │ → PassThroughTransformer (always)</span></span>
<span class="line"><span>  │ ENABLE_PAYLOAD_TRANSFORMATION = true    │ → TransformerRegistry.get(topic)</span></span>
<span class="line"><span>  │   Registry has specific transformer?    │   → use it</span></span>
<span class="line"><span>  │   Registry has no transformer?          │   → PassThroughTransformer (fallback)</span></span>
<span class="line"><span>  └─────────────────────────────────────────┘</span></span>
<span class="line"><span>      │ error → audit log failure + discard</span></span>
<span class="line"><span>      ▼ Step 5</span></span>
<span class="line"><span>  Send CloudEvent to OpenHIM via HTTP POST</span></span>
<span class="line"><span>  (with retry + exponential backoff)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 6</span></span>
<span class="line"><span>  Write audit log to openhim_route_execution_logs</span></span>
<span class="line"><span>  (success or failure with full metadata)</span></span></code></pre></div><h3 id="key-design-decisions" tabindex="-1">Key Design Decisions <a class="header-anchor" href="#key-design-decisions" aria-label="Permalink to &quot;Key Design Decisions&quot;">​</a></h3><p><strong>In-memory cache for route mappings</strong> Route mappings are loaded from MySQL at startup into a <code>Map&lt;topic, RouteMapping&gt;</code>. A lightweight <code>MAX(updated_at) + COUNT(*)</code> poll runs every 90 seconds (configurable) to detect changes without a full reload. The admin <code>POST /admin/refresh-routes</code> forces an immediate reload.</p><p><strong>Two-layer transformation</strong> The global <code>ENABLE_PAYLOAD_TRANSFORMATION</code> flag lets the entire transformation layer be bypassed for pass-through mode. When enabled, the <code>TransformerRegistry</code> provides per-topic transformers with <code>PassThroughTransformer</code> as the automatic fallback for unregistered topics.</p><p><strong>CloudEvent wrapping</strong> Every payload leaving <code>interop-service</code> is a valid <a href="https://cloudevents.io/" target="_blank" rel="noreferrer">CloudEvents 1.0</a> JSON document:</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;specversion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;1.0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;com.smile.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;source&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;urn:smile:orders&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;&lt;uuid&gt;&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;time&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;&lt;ISO8601&gt;&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;datacontenttype&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;application/json&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subject&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;order_42&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;4&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;7&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;data&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}">...original</span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}"> SMILE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}"> payload...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Retry with exponential backoff</strong> Per-route configuration (<code>max_retries</code>, <code>retry_backoff_ms</code>, <code>retry_backoff_multiplier</code>) overrides the global defaults. All attempts are audit-logged.</p><h3 id="http-api" tabindex="-1">HTTP API <a class="header-anchor" href="#http-api" aria-label="Permalink to &quot;HTTP API&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead><tbody><tr><td>GET</td><td><code>/health</code></td><td>Full health check (DB, RabbitMQ, OpenHIM, cache)</td></tr><tr><td>GET</td><td><code>/ready</code></td><td>Readiness probe — 200 only when route cache is loaded</td></tr><tr><td>GET</td><td><code>/live</code></td><td>Liveness probe — always 200</td></tr><tr><td>GET</td><td><code>/info</code></td><td>Service metadata + list of active topics</td></tr><tr><td>GET</td><td><code>/admin/routes</code></td><td>List all enabled route mappings from cache</td></tr><tr><td>POST</td><td><code>/admin/refresh-routes</code></td><td>Force reload route mappings from DB</td></tr></tbody></table><h3 id="infrastructure-dependencies" tabindex="-1">Infrastructure Dependencies <a class="header-anchor" href="#infrastructure-dependencies" aria-label="Permalink to &quot;Infrastructure Dependencies&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Dependency</th><th>Usage</th></tr></thead><tbody><tr><td>MySQL (<code>smile_interop</code>)</td><td>Route mappings + audit logs</td></tr><tr><td>RabbitMQ</td><td>Source of all SMILE events</td></tr><tr><td>Redis</td><td>Available but currently used for caching (not core routing)</td></tr><tr><td>OpenHIM Core</td><td>HTTP destination for transformed events</td></tr></tbody></table><hr><h2 id="stage-2-rule-router-openhim-mediator" tabindex="-1">Stage 2: <code>rule-router</code> (OpenHIM Mediator) <a class="header-anchor" href="#stage-2-rule-router-openhim-mediator" aria-label="Permalink to &quot;Stage 2: \`rule-router\` (OpenHIM Mediator)&quot;">​</a></h2><h3 id="responsibility-1" tabindex="-1">Responsibility <a class="header-anchor" href="#responsibility-1" aria-label="Permalink to &quot;Responsibility&quot;">​</a></h3><p>Registered with OpenHIM as a mediator (<code>urn:mediator:smile-rule-router</code>). It owns <strong>client/program-level routing</strong> — determining which downstream system(s) to send each CloudEvent to, and handling fan-out.</p><h3 id="processing-pipeline-per-http-request-from-openhim" tabindex="-1">Processing Pipeline (per HTTP request from OpenHIM) <a class="header-anchor" href="#processing-pipeline-per-http-request-from-openhim" aria-label="Permalink to &quot;Processing Pipeline (per HTTP request from OpenHIM)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>POST /route (CloudEvent JSON from interop-service)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 1</span></span>
<span class="line"><span>  Parse request body as CloudEvent JSON</span></span>
<span class="line"><span>  Extract topic from CloudEvent type</span></span>
<span class="line"><span>  (strips &#39;com.smile.&#39; prefix → topic e.g. &#39;order.created&#39;)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 2</span></span>
<span class="line"><span>  Build IncomingEvent</span></span>
<span class="line"><span>  (id, type, topic, source, data, all headers, client_key, program_id)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 3</span></span>
<span class="line"><span>  Load rules from cache for this topic</span></span>
<span class="line"><span>  (specific rules + default rules separately)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 4</span></span>
<span class="line"><span>  Evaluate specific rules via routing engine</span></span>
<span class="line"><span>  (filter_key + filter_operator + filter_value against IncomingEvent)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ├── matched rules found → use matched rules</span></span>
<span class="line"><span>      ├── no matches + default rules exist → use default rules</span></span>
<span class="line"><span>      └── no rules at all → return 200 &quot;no routing configured&quot;</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 5</span></span>
<span class="line"><span>  Forward to ALL target rules in parallel</span></span>
<span class="line"><span>  (HTTP POST with Basic auth, forwarded trace headers)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼ Step 6</span></span>
<span class="line"><span>  Build OpenHIM mediator response</span></span>
<span class="line"><span>  (status: Successful/Failed, orchestrations array per target)</span></span>
<span class="line"><span>  Return to OpenHIM → OpenHIM returns to interop-service</span></span></code></pre></div><h3 id="routing-engine" tabindex="-1">Routing Engine <a class="header-anchor" href="#routing-engine" aria-label="Permalink to &quot;Routing Engine&quot;">​</a></h3><p>The engine evaluates filter rules against the <code>IncomingEvent</code>. Filter key resolution:</p><table tabindex="0"><thead><tr><th>Filter Key</th><th>Resolves to</th></tr></thead><tbody><tr><td><code>client_key</code></td><td><code>event.client_key</code> or <code>X-Integration-Client</code> header</td></tr><tr><td><code>program_id</code></td><td><code>event.program_id</code> or <code>event.data.program_id</code></td></tr><tr><td><code>header:&lt;name&gt;</code></td><td>HTTP header value (case-insensitive)</td></tr><tr><td><code>data.&lt;dot.path&gt;</code></td><td>Nested field inside CloudEvent <code>data</code> object</td></tr><tr><td><code>&lt;anything else&gt;</code></td><td>CloudEvent top-level extension attribute</td></tr></tbody></table><p>Supported operators: <code>eq</code>, <code>neq</code>, <code>contains</code>, <code>starts_with</code>, <code>regex</code></p><p><strong>Fan-out failure policy</strong>: if ANY forwarded call fails, the overall status is <code>Failed</code>. OpenHIM returns non-2xx to <code>interop-service</code>, which retries via its configured backoff.</p><h3 id="openhim-registration" tabindex="-1">OpenHIM Registration <a class="header-anchor" href="#openhim-registration" aria-label="Permalink to &quot;OpenHIM Registration&quot;">​</a></h3><p>On startup, <code>rule-router</code> calls <code>registerMediator()</code> from <code>openhim-mediator-utils</code>. Registration is non-fatal — the service continues serving requests even if OpenHIM is temporarily unreachable. A heartbeat interval is activated after successful registration so the mediator appears online in the OpenHIM console.</p><h3 id="http-api-1" tabindex="-1">HTTP API <a class="header-anchor" href="#http-api-1" aria-label="Permalink to &quot;HTTP API&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead><tbody><tr><td>POST</td><td><code>/route</code></td><td>Main mediator endpoint (called by OpenHIM)</td></tr><tr><td>GET</td><td><code>/health</code></td><td>Health check (DB + rules cache status)</td></tr><tr><td>GET</td><td><code>/ready</code></td><td>Readiness probe</td></tr><tr><td>GET</td><td><code>/live</code></td><td>Liveness probe</td></tr><tr><td>GET</td><td><code>/admin/rules</code></td><td>List all enabled routing rules from cache</td></tr><tr><td>POST</td><td><code>/admin/refresh-rules</code></td><td>Force reload routing rules from DB</td></tr></tbody></table><h3 id="infrastructure-dependencies-1" tabindex="-1">Infrastructure Dependencies <a class="header-anchor" href="#infrastructure-dependencies-1" aria-label="Permalink to &quot;Infrastructure Dependencies&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Dependency</th><th>Usage</th></tr></thead><tbody><tr><td>MySQL (<code>smile_interop</code>)</td><td><code>integration_routing_rules</code> table</td></tr><tr><td>OpenHIM Core</td><td>Registration, heartbeat, and receives all inbound traffic</td></tr></tbody></table><hr><h2 id="database-schema" tabindex="-1">Database Schema <a class="header-anchor" href="#database-schema" aria-label="Permalink to &quot;Database Schema&quot;">​</a></h2><p>Both services share the <code>smile_interop</code> MySQL database.</p><h3 id="openhim-route-mappings-owned-by-interop-service" tabindex="-1"><code>openhim_route_mappings</code> (owned by <code>interop-service</code>) <a class="header-anchor" href="#openhim-route-mappings-owned-by-interop-service" aria-label="Permalink to &quot;\`openhim_route_mappings\` (owned by \`interop-service\`)&quot;">​</a></h3><p>Maps a RabbitMQ topic to an OpenHIM channel. One row per topic.</p><table tabindex="0"><thead><tr><th>Column</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>rabbitmq_topic</code></td><td>VARCHAR</td><td>RabbitMQ topic key e.g. <code>order.created</code></td></tr><tr><td><code>enabled</code></td><td>BOOLEAN</td><td>Whether this mapping is active</td></tr><tr><td><code>openhim_channel_id</code></td><td>VARCHAR</td><td>OpenHIM channel identifier</td></tr><tr><td><code>openhim_channel_name</code></td><td>VARCHAR</td><td>Human-readable channel name</td></tr><tr><td><code>request_path</code></td><td>VARCHAR</td><td>URL path on OpenHIM e.g. <code>/pub/smile/orders/order-created</code></td></tr><tr><td><code>http_method</code></td><td>VARCHAR</td><td>Always <code>POST</code></td></tr><tr><td><code>include_context</code></td><td>BOOLEAN</td><td>Whether to embed <code>program_id</code>, <code>user_id</code> etc. as CloudEvent extensions</td></tr><tr><td><code>max_retries</code></td><td>INT</td><td>Per-route retry limit (overrides env default)</td></tr><tr><td><code>retry_backoff_ms</code></td><td>INT</td><td>Initial backoff in ms</td></tr><tr><td><code>retry_backoff_multiplier</code></td><td>DECIMAL</td><td>Exponential multiplier</td></tr><tr><td><code>expected_status_codes</code></td><td>VARCHAR</td><td>Comma-separated accepted HTTP codes e.g. <code>200,201,202,204</code></td></tr></tbody></table><h3 id="openhim-route-execution-logs-owned-by-interop-service" tabindex="-1"><code>openhim_route_execution_logs</code> (owned by <code>interop-service</code>) <a class="header-anchor" href="#openhim-route-execution-logs-owned-by-interop-service" aria-label="Permalink to &quot;\`openhim_route_execution_logs\` (owned by \`interop-service\`)&quot;">​</a></h3><p>Full audit trail of every event processed.</p><table tabindex="0"><thead><tr><th>Column</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>rabbitmq_topic</code></td><td>VARCHAR</td><td>Source topic</td></tr><tr><td><code>order_id</code></td><td>VARCHAR</td><td>Extracted from payload</td></tr><tr><td><code>program_id</code></td><td>VARCHAR</td><td>Extracted from CloudEvent context</td></tr><tr><td><code>openhim_channel_id</code></td><td>VARCHAR</td><td>Target channel</td></tr><tr><td><code>openhim_endpoint</code></td><td>VARCHAR</td><td>Full URL called</td></tr><tr><td><code>status</code></td><td>ENUM</td><td><code>success</code>, <code>failure</code>, <code>retry</code></td></tr><tr><td><code>http_status_code</code></td><td>INT</td><td>Response HTTP code</td></tr><tr><td><code>execution_time_ms</code></td><td>INT</td><td>Total time including retries</td></tr><tr><td><code>attempt_number</code></td><td>INT</td><td>Which retry attempt this was</td></tr><tr><td><code>request_payload</code></td><td>TEXT</td><td>CloudEvent JSON sent (truncated at 65k)</td></tr><tr><td><code>response_payload</code></td><td>TEXT</td><td>OpenHIM response (failures only)</td></tr><tr><td><code>error_message</code></td><td>TEXT</td><td>Error description on failure</td></tr><tr><td><code>trace_id</code></td><td>VARCHAR</td><td>W3C traceparent propagated from SMILE</td></tr><tr><td><code>request_id</code></td><td>VARCHAR</td><td>Originating request ID from SMILE</td></tr></tbody></table><h3 id="integration-routing-rules-owned-by-rule-router" tabindex="-1"><code>integration_routing_rules</code> (owned by <code>rule-router</code>) <a class="header-anchor" href="#integration-routing-rules-owned-by-rule-router" aria-label="Permalink to &quot;\`integration_routing_rules\` (owned by \`rule-router\`)&quot;">​</a></h3><p>Rule-based fan-out configuration. Multiple rows per topic.</p><table tabindex="0"><thead><tr><th>Column</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>topic</code></td><td>VARCHAR</td><td>Event topic e.g. <code>order.created</code></td></tr><tr><td><code>filter_key</code></td><td>VARCHAR</td><td>Field to evaluate e.g. <code>program_id</code>, <code>client_key</code>, <code>data.item_id</code></td></tr><tr><td><code>filter_operator</code></td><td>VARCHAR</td><td><code>eq</code>, <code>neq</code>, <code>contains</code>, <code>starts_with</code>, <code>regex</code></td></tr><tr><td><code>filter_value</code></td><td>VARCHAR</td><td>Expected value</td></tr><tr><td><code>target_url</code></td><td>VARCHAR</td><td>Path on OpenHIM to forward to e.g. <code>/adapter/sitb/orders</code></td></tr><tr><td><code>target_name</code></td><td>VARCHAR</td><td>Human label for orchestration logs</td></tr><tr><td><code>is_default</code></td><td>BOOLEAN</td><td>Used when no specific rules match</td></tr><tr><td><code>priority</code></td><td>INT</td><td>Lower = higher priority (for display/ordering)</td></tr><tr><td><code>enabled</code></td><td>BOOLEAN</td><td>Whether this rule is active</td></tr></tbody></table><hr><h2 id="communication-patterns" tabindex="-1">Communication Patterns <a class="header-anchor" href="#communication-patterns" aria-label="Permalink to &quot;Communication Patterns&quot;">​</a></h2><h3 id="outbound-smile-→-external-systems" tabindex="-1">Outbound (SMILE → External Systems) <a class="header-anchor" href="#outbound-smile-→-external-systems" aria-label="Permalink to &quot;Outbound (SMILE → External Systems)&quot;">​</a></h3><p>The currently implemented direction. SMILE publishes a business event internally; the interop layer picks it up and delivers it to one or more external health systems.</p><p><strong>Trigger</strong>: A business action in SMILE (order created, order confirmed, stock adjusted, etc.) causes an internal service to publish a message to RabbitMQ.</p><p><strong>Message format at each stage:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Stage          Format                    Protocol</span></span>
<span class="line"><span>─────────────────────────────────────────────────────────────</span></span>
<span class="line"><span>SMILE → MQ     Raw SMILE event JSON      RabbitMQ AMQP</span></span>
<span class="line"><span>MQ → interop   RabbitMQ message          AMQP consumer</span></span>
<span class="line"><span>interop → OHM  CloudEvent JSON           HTTP POST (Basic auth)</span></span>
<span class="line"><span>OHM → router   CloudEvent JSON           HTTP POST (Basic auth)</span></span>
<span class="line"><span>router → ext   CloudEvent JSON           HTTP POST (Basic auth)</span></span></code></pre></div><p><strong>Sample outbound RabbitMQ message</strong> (what SMILE publishes):</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;topic&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;payload&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">42</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;customer_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">7</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;order_items&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;item_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">101</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;quantity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;unit&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;vial&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;created_at&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:00.000Z&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;created_by&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;context&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;user_email&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;pharmacist@example.com&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;request_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;req-abc-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;trace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;client_key&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;sitb&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;headers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;traceparent&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Sample CloudEvent</strong> (what <code>interop-service</code> sends to OpenHIM):</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;specversion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;1.0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;com.smile.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;source&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;urn:smile:orders&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;550e8400-e29b-41d4-a716-446655440000&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;time&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:01.123Z&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;datacontenttype&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;application/json&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subject&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;order_42&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;4&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;3&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;user_email&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;pharmacist@example.com&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;request_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;req-abc-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;trace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;client_key&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;sitb&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;data&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">42</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;customer_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">7</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">4</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;order_items&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;item_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">101</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;quantity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;unit&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;vial&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;created_at&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:00.000Z&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;created_by&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>HTTP request from <code>interop-service</code> to OpenHIM:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>POST https://openhim-core:5000/pub/smile/orders/order-created HTTP/1.1</span></span>
<span class="line"><span>Authorization: Basic c21pbGUtYXBwOjxzZWNyZXQ+</span></span>
<span class="line"><span>Content-Type: application/json</span></span>
<span class="line"><span>X-Trace-ID: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01</span></span>
<span class="line"><span>X-Request-ID: req-abc-001</span></span>
<span class="line"><span>X-Integration-Client: sitb</span></span>
<span class="line"><span></span></span>
<span class="line"><span>{ ...CloudEvent JSON above... }</span></span></code></pre></div><p><strong>HTTP request from <code>rule-router</code> to downstream system (SITB adapter):</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>POST https://openhim-core:5000/adapter/sitb/orders HTTP/1.1</span></span>
<span class="line"><span>Authorization: Basic c21pbGUtYXBwOjxzZWNyZXQ+</span></span>
<span class="line"><span>Content-Type: application/json</span></span>
<span class="line"><span>X-Trace-ID: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01</span></span>
<span class="line"><span>X-Request-ID: req-abc-001</span></span>
<span class="line"><span>X-Integration-Client: sitb</span></span>
<span class="line"><span></span></span>
<span class="line"><span>{ ...same CloudEvent JSON forwarded as-is... }</span></span></code></pre></div><p><strong>OpenHIM mediator response</strong> (what <code>rule-router</code> returns to OpenHIM):</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;x-mediator-urn&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;urn:mediator:smile-rule-router&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Successful&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;response&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">200</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;headers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;content-type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;application/json&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;body&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">routed</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:true,</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">topic</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">order.created</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">,</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">targets</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:[{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Program 4 (TB) - Order Created</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">,</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">status</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:200}]}&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:01.500Z&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;orchestrations&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Program 4 (TB) - Order Created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;request&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;path&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;/adapter/sitb/orders&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;headers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;content-type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;application/json&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;x-trace-id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf...&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;body&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;{ ...CloudEvent JSON... }&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;method&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;POST&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:01.400Z&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;response&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">200</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;headers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {},</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;body&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">received</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">\\&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">:true}&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T08:00:01.490Z&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="inbound-external-systems-→-smile-—-not-yet-implemented" tabindex="-1">Inbound (External Systems → SMILE) — Not Yet Implemented <a class="header-anchor" href="#inbound-external-systems-→-smile-—-not-yet-implemented" aria-label="Permalink to &quot;Inbound (External Systems → SMILE) — Not Yet Implemented&quot;">​</a></h3><p>Inbound communication would allow external systems (SIHA, SITB, DHIS2) to push data or acknowledgements back into SMILE. This direction is not currently implemented.</p><p><strong>Planned approach</strong> (when needed):</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>External System</span></span>
<span class="line"><span>      │ HTTP POST</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>  OpenHIM Core          ← receives and authenticates the call</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>  Inbound Mediator      ← validates, transforms to SMILE format (to be built)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>  SMILE API / Queue     ← processes the inbound data</span></span></code></pre></div><p>When implementing inbound:</p><ol><li>Create a new OpenHIM channel for each inbound endpoint</li><li>Build a new mediator (or extend <code>rule-router</code>) to handle inbound validation and transformation</li><li>Forward to the appropriate SMILE API endpoint or publish to RabbitMQ for async processing</li><li>Return a standard acknowledgement response to the external system</li></ol><hr><h2 id="request-flow-end-to-end" tabindex="-1">Request Flow: End to End <a class="header-anchor" href="#request-flow-end-to-end" aria-label="Permalink to &quot;Request Flow: End to End&quot;">​</a></h2><p>The following trace shows <code>order.created</code> for program_id=4 (TB program) flowing to SITB:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. SMILE Main Service</span></span>
<span class="line"><span>   publishes → RabbitMQ topic: &quot;order.created&quot;</span></span>
<span class="line"><span>   payload: { id: 42, customer_id: 7, program_id: 4, ... }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. interop-service consumes message</span></span>
<span class="line"><span>   route mapping lookup: &quot;order.created&quot; → &quot;smile-order-created-channel&quot;</span></span>
<span class="line"><span>   transformer: PassThroughTransformer (or OrderCreatedTransformer)</span></span>
<span class="line"><span>   CloudEvent built:</span></span>
<span class="line"><span>     type: &quot;com.smile.order.created&quot;</span></span>
<span class="line"><span>     program_id: &quot;4&quot;      ← from message context</span></span>
<span class="line"><span>     client_key: &quot;siha&quot;   ← from message context</span></span>
<span class="line"><span>     data: { id: 42, ... }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. interop-service → OpenHIM (HTTP POST)</span></span>
<span class="line"><span>   POST https://openhim-core:5000/pub/smile/orders/order-created</span></span>
<span class="line"><span>   Headers: X-Trace-ID, X-Request-ID, X-Integration-Client: siha</span></span>
<span class="line"><span>   Body: &lt;CloudEvent JSON&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. OpenHIM Core</span></span>
<span class="line"><span>   authenticates client &quot;smile-app&quot;</span></span>
<span class="line"><span>   matches channel &quot;SMILE Order Created Channel&quot;</span></span>
<span class="line"><span>   routes to mediator &quot;rule-router&quot; → POST /route</span></span>
<span class="line"><span></span></span>
<span class="line"><span>5. rule-router evaluates rules for topic &quot;order.created&quot;</span></span>
<span class="line"><span>   rule: program_id eq &quot;4&quot; → target: /adapter/sitb/orders</span></span>
<span class="line"><span>   → forwards CloudEvent to /adapter/sitb/orders</span></span>
<span class="line"><span></span></span>
<span class="line"><span>6. SITB Adapter receives CloudEvent, processes order</span></span>
<span class="line"><span></span></span>
<span class="line"><span>7. rule-router returns OpenHIM mediator response</span></span>
<span class="line"><span>   { status: &quot;Successful&quot;, orchestrations: [{ name: &quot;Program 4 (TB) - Order Created&quot;, ... }] }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>8. interop-service receives 200 → writes success audit log</span></span></code></pre></div><hr><h2 id="sequence-diagram" tabindex="-1">Sequence Diagram <a class="header-anchor" href="#sequence-diagram" aria-label="Permalink to &quot;Sequence Diagram&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SMILE        RabbitMQ   interop-service      OpenHIM     rule-router    SITB</span></span>
<span class="line"><span>  │              │             │                │               │          │</span></span>
<span class="line"><span>  │─publish────►│             │                │               │          │</span></span>
<span class="line"><span>  │              │─consume────►│                │               │          │</span></span>
<span class="line"><span>  │              │             │─validate────►  │               │          │</span></span>
<span class="line"><span>  │              │             │─transform───►  │               │          │</span></span>
<span class="line"><span>  │              │             │─POST /pub/──►  │               │          │</span></span>
<span class="line"><span>  │              │             │                │─POST /route──►│          │</span></span>
<span class="line"><span>  │              │             │                │               │─eval─────│</span></span>
<span class="line"><span>  │              │             │                │               │─POST ───►│</span></span>
<span class="line"><span>  │              │             │                │               │◄─200─────│</span></span>
<span class="line"><span>  │              │             │                │◄──200─────────│          │</span></span>
<span class="line"><span>  │              │             │◄──200──────────│               │          │</span></span>
<span class="line"><span>  │              │             │─audit log──►DB │               │          │</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/interop-layer/architecture.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var architecture_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, architecture_default as default };
