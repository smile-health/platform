import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/race-conditions-delayed.md
var __pageData = JSON.parse("{\"title\":\"Race Condition Analysis — Delayed / Irregular-Interval Duplication\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/race-conditions-delayed.md\",\"filePath\":\"architecture/race-conditions-delayed.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/race-conditions-delayed.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="race-condition-analysis-—-delayed-irregular-interval-duplication" tabindex="-1">Race Condition Analysis — Delayed / Irregular-Interval Duplication <a class="header-anchor" href="#race-condition-analysis-—-delayed-irregular-interval-duplication" aria-label="Permalink to &quot;Race Condition Analysis — Delayed / Irregular-Interval Duplication&quot;">​</a></h1><p><strong>Date:</strong> 2026-04-29 <strong>Scope:</strong> <code>apps/main/src/modules/</code> + <code>packages/lib/middlewares/</code><strong>Companion to:</strong> <a href="./race-conditions.html"><code>race-conditions.md</code></a> (RC-001 … RC-005, near-simultaneous races) <strong>Severity legend:</strong> 🔴 Critical · 🟠 High · 🟡 Medium</p><hr><h2 id="why-a-separate-report" tabindex="-1">Why a separate report <a class="header-anchor" href="#why-a-separate-report" aria-label="Permalink to &quot;Why a separate report&quot;">​</a></h2><p>The 5 races in <code>race-conditions.md</code> (RC-001 … RC-005) all assume <strong>two near-simultaneous requests</strong>. They cannot explain the symptom the team is actually seeing in production:</p><blockquote><p>Data sometimes appears duplicated, but the gap between the original write and the duplicate ranges from minutes to hours, with <strong>no consistent pattern</strong>.</p></blockquote><p>That irregular-delay shape is produced by a different family of bugs: dual writes, redelivery on consumer crashes, cron overlap on multi-replica deploys, and notification crons that re-fire while the source condition is still true.</p><p>The five mechanisms that produce irregular timing:</p><table tabindex="0"><thead><tr><th>Mechanism</th><th>Why the delay is irregular</th></tr></thead><tbody><tr><td><strong>RabbitMQ redelivery after consumer crash</strong></td><td>Delay = however long the pod was down (seconds → hours, depends on crash-loop / scheduler).</td></tr><tr><td><strong>HTTP client retries on commit-then-publish</strong></td><td>Delay = client/proxy retry timing (Nginx upstream timeout, mobile-network retry, user-tap-twice).</td></tr><tr><td><strong>Cron without distributed lock on multi-replica deploys</strong></td><td>Two pods fire the same cron at the same scheduled time, but DB writes interleave at slightly different points — and one replica&#39;s GC pause shifts its write minutes later.</td></tr><tr><td><strong>External-API workers without idempotency key</strong></td><td>Each redelivery hits the downstream system again; downstream creates a new record; gap = redelivery interval.</td></tr><tr><td><strong>Notification crons that don&#39;t track &quot;already sent&quot;</strong></td><td>Every cron tick re-emits while the source condition (low stock, near-expiry) is still true. Gap = cron schedule.</td></tr></tbody></table><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;Summary&quot;">​</a></h2><table tabindex="0"><thead><tr><th>#</th><th>Module</th><th>Severity</th><th>Type</th></tr></thead><tbody><tr><td><a href="#rc-006-eventmiddleware--dual-write-without-outbox-or-idempotency">RC-006</a></td><td><code>packages/lib/middlewares/event.middleware</code></td><td>🔴 Critical</td><td>Dual-write / no outbox</td></tr><tr><td><a href="#rc-007-order-integration-worker--external-api-replay-on-redelivery">RC-007</a></td><td><code>order-integration.worker</code></td><td>🔴 Critical</td><td>Non-idempotent external call</td></tr><tr><td><a href="#rc-008-crons-run-without-distributed-lock">RC-008</a></td><td><code>stock.cron</code>, <code>export-history.cron</code>, <code>entity.cron</code>, <code>patient.cron</code>, report crons</td><td>🟠 High</td><td>Multi-replica cron overlap</td></tr><tr><td><a href="#rc-010-stock-notification-crons--no-already-sent-dedup">RC-010</a></td><td><code>stock.cron</code></td><td>🟡 Medium</td><td>Repeated notification emission</td></tr><tr><td><a href="#rc-011-orderintegrationworker-doretry--updates-id0-but-still-fires-external-call">RC-011</a></td><td><code>order-integration.worker</code></td><td>🟡 Medium</td><td>Lost log + external duplicate</td></tr></tbody></table><hr><h2 id="rc-006-eventmiddleware-—-dual-write-without-outbox-or-idempotency" tabindex="-1">RC-006: EventMiddleware — Dual-Write Without Outbox or Idempotency <a class="header-anchor" href="#rc-006-eventmiddleware-—-dual-write-without-outbox-or-idempotency" aria-label="Permalink to &quot;RC-006: EventMiddleware — Dual-Write Without Outbox or Idempotency&quot;">​</a></h2><p><strong>File:</strong> <a href="https://github.com/smile-health/platform/blob/main/packages/lib/middlewares/event.middleware.ts#L8" target="_blank" rel="noreferrer"><code>event.middleware.ts:8-18</code></a><strong>Caller pattern:</strong> <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/order/order.publisher.ts#L74" target="_blank" rel="noreferrer"><code>order.publisher.ts:74</code></a> (<code>c.addEvent(TOPIC.ORDER_CREATED, …)</code>) and every other publisher that uses <code>c.addEvent</code><strong>Severity:</strong> 🔴 Critical</p><h3 id="what-happens" tabindex="-1">What happens <a class="header-anchor" href="#what-happens" aria-label="Permalink to &quot;What happens&quot;">​</a></h3><p>The middleware publishes to RabbitMQ <strong>after</strong> the controller has returned — i.e., after MySQL has already committed. There is no outbox table, no idempotency key on the event, and no idempotency key on the originating endpoint.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// packages/lib/middlewares/event.middleware.ts</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">public </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">handle</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">next</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> next</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()                    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// ← controller commits to MySQL here</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> events</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> c.var.events </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> []</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">c.var.error </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&amp;&amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> events.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">length</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> event</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> of</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> events) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">      await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.publisher.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">publish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(event.topic, event.payload)   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// ← publishes here</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>Two distinct failure modes, both producing <strong>delayed duplicates with no fixed interval</strong>:</p><p><strong>Mode A — Client / proxy retry on slow request</strong> A mobile client or Nginx upstream times out <em>after</em> MySQL committed but <em>before</em> publish completed. The client retries the same <code>POST /orders</code>. The retry runs the controller again, MySQL inserts a <em>second</em> order row, the second event is also published. Duplicate gap = client retry policy (often 30 s, 60 s, exponential backoff up to several minutes).</p><p><strong>Mode B — Process crash / OOM between commit and publish</strong> DB committed; pod restarted before <code>publisher.publish()</code> fired. The event is <strong>lost</strong> (different bug). Operators commonly mitigate by replaying from logs or re-triggering, and that manual replay arrives hours later → looks like a delayed duplicate of the database row.</p><h3 id="diagram" tabindex="-1">Diagram <a class="header-anchor" href="#diagram" aria-label="Permalink to &quot;Diagram&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-197",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20C%20as%20Mobile%20Client%0A%20%20%20%20participant%20N%20as%20Nginx%0A%20%20%20%20participant%20API%20as%20Hono%20Controller%0A%20%20%20%20participant%20DB%20as%20MySQL%0A%20%20%20%20participant%20MQ%20as%20RabbitMQ%0A%0A%20%20%20%20C-%3E%3EN%3A%20POST%20%2Forders%20%7Bidempotency%3A%20none%7D%0A%20%20%20%20N-%3E%3EAPI%3A%20forward%0A%20%20%20%20API-%3E%3EDB%3A%20BEGIN%3B%20INSERT%20orders%3B%20COMMIT%0A%20%20%20%20Note%20over%20API%2CMQ%3A%20slow%20publish%20(backpressure%2C%20GC%20pause%2C%20network)%0A%20%20%20%20N--xC%3A%20504%20upstream%20timeout%0A%20%20%20%20C-%3E%3EN%3A%20retry%20POST%20%2Forders%20(same%20body)%20%E2%80%94%20minutes%20later%0A%20%20%20%20N-%3E%3EAPI%3A%20forward%0A%20%20%20%20API-%3E%3EDB%3A%20BEGIN%3B%20INSERT%20orders%20%E2%86%90%20duplicate%20row%2C%20new%20id%0A%20%20%20%20API-%3E%3EMQ%3A%20publish%20ORDER_CREATED%20%E2%86%90%20duplicate%20event%0A%20%20%20%20Note%20over%20DB%3A%202%20orders%20for%201%20user%20intent%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="how-to-reproduce" tabindex="-1">How to Reproduce <a class="header-anchor" href="#how-to-reproduce" aria-label="Permalink to &quot;How to Reproduce&quot;">​</a></h3><ol><li>Set Nginx <code>proxy_read_timeout</code> to 5 s.</li><li>Slow down RabbitMQ publish (e.g., simulate broker pause).</li><li>POST a create-order request from a client that auto-retries on 504.</li><li>Observe two <code>orders</code> rows + two <code>ORDER_CREATED</code> messages, separated by the client&#39;s retry delay.</li></ol><h3 id="fix" tabindex="-1">Fix <a class="header-anchor" href="#fix" aria-label="Permalink to &quot;Fix&quot;">​</a></h3><p><strong>Idempotency key at the boundary (recommended):</strong></p><p>Require an <code>Idempotency-Key</code> header on all mutating endpoints, persist <code>(idempotency_key, route, response_hash)</code> for 24 h, and short-circuit duplicate keys.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> key</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> c.req.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">header</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Idempotency-Key&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">key) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">throw</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BadRequestError</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Idempotency-Key required&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> cached</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idempotencyRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">find</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(key, route)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (cached) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> c.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">json</span><span style="${ssrRenderStyle({
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
	})}">parse</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(cached.response), cached.status)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// …run handler…</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idempotencyRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">insert</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({ key, route, response, status })</span></span></code></pre></div><p><strong>Transactional outbox (for the publish leg):</strong></p><p>Inside the same DB transaction that creates the order, insert into an <code>outbox</code> table; a separate process drains <code>outbox</code> → RabbitMQ. This makes commit-and-enqueue atomic.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">transaction</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">trx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">create</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(trx, orderData)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> trx.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">insertInto</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;outbox&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">values</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    topic: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">TOPIC</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">ORDER_CREATED</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    payload: </span><span style="${ssrRenderStyle({
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
	})}">(payload),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    dedupe_key: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\`order_created:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">createdOrderId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span></code></pre></div><p>The dedupe key on the consumer side then makes redelivery + retry both safe.</p><hr><h2 id="rc-007-order-integration-worker-—-external-api-replay-on-redelivery" tabindex="-1">RC-007: Order-Integration Worker — External API Replay on Redelivery <a class="header-anchor" href="#rc-007-order-integration-worker-—-external-api-replay-on-redelivery" aria-label="Permalink to &quot;RC-007: Order-Integration Worker — External API Replay on Redelivery&quot;">​</a></h2><p><strong>File:</strong> <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/order-integration/order-integration.worker.ts#L28" target="_blank" rel="noreferrer"><code>order-integration.worker.ts:28-70</code></a><strong>Severity:</strong> 🔴 Critical</p><h3 id="what-happens-1" tabindex="-1">What happens <a class="header-anchor" href="#what-happens-1" aria-label="Permalink to &quot;What happens&quot;">​</a></h3><p>The worker handles <code>ORDER_STATUS_ORDER_VALIDATED</code>, <code>…_FULFILLED</code>, <code>…_CANCEL</code> and immediately calls the external gateway (<code>client.validateOrder / receiveOrder / cancelOrder</code>). There is <strong>no check</strong> whether this <code>(order_id, action)</code> was already sent. RabbitMQ provides at-least-once; on consumer crash before ack, the broker redelivers — and the external system receives a second request. Most external systems (DIN, Biofarma, etc.) don&#39;t enforce idempotency on inbound calls either, so they create a second downstream order/receipt.</p><p>The redelivery delay is bounded by the consumer&#39;s <code>prefetch</code> heartbeat / <code>consumer_timeout</code> (typically 30 min on RabbitMQ default) but in practice can be hours when:</p><ul><li>a pod is in a CrashLoopBackOff,</li><li>the queue has unacked messages and the connection is reset on broker restart,</li><li>a deploy rollover happens.</li></ul><h3 id="diagram-1" tabindex="-1">Diagram <a class="header-anchor" href="#diagram-1" aria-label="Permalink to &quot;Diagram&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-279",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20MQ%20as%20RabbitMQ%0A%20%20%20%20participant%20W%20as%20order-integration.worker%0A%20%20%20%20participant%20DIN%20as%20External%20DIN%20Gateway%0A%0A%20%20%20%20MQ-%3E%3EW%3A%20ORDER_STATUS_ORDER_FULFILLED%20%7Border_id%3A%2042%7D%0A%20%20%20%20W-%3E%3EDIN%3A%20POST%20%2Freceive%20%7Border%3A%2042%7D%0A%20%20%20%20Note%20over%20W%3A%20pod%20OOM-killed%20before%20ack%0A%20%20%20%20Note%20over%20MQ%3A%20heartbeat%20lost%20%E2%86%92%20message%20requeued%0A%20%20%20%20Note%20over%20MQ%2CW%3A%20...30%20min%20%E2%80%93%204%20h%20later%20(k8s%20restart%20loop)...%0A%20%20%20%20MQ-%3E%3EW%3A%20redeliver%20same%20message%0A%20%20%20%20W-%3E%3EDIN%3A%20POST%20%2Freceive%20%7Border%3A%2042%7D%20%E2%86%90%20duplicate%20at%20DIN%0A%20%20%20%20Note%20over%20DIN%3A%202%20receipts%2C%20only%201%20SMILE%20order%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="how-to-reproduce-1" tabindex="-1">How to Reproduce <a class="header-anchor" href="#how-to-reproduce-1" aria-label="Permalink to &quot;How to Reproduce&quot;">​</a></h3><ol><li>Set the consumer to <code>prefetch=1</code>, send a single fulfill event.</li><li>While <code>client.receiveOrder</code> is in flight, <code>kill -9</code> the worker process.</li><li>Restart it. The message will redeliver. Observe the external system receives the call twice.</li></ol><h3 id="fix-1" tabindex="-1">Fix <a class="header-anchor" href="#fix-1" aria-label="Permalink to &quot;Fix&quot;">​</a></h3><p>Track a server-side dedupe row keyed by <code>(order_id, action, attempt_id)</code> <em>before</em> calling the external API:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> dedupeKey</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> \`\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">action</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">order_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">attempt_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> inserted</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">tryInsertIntegrationLock</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, dedupeKey)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">inserted) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // already processed (or in flight); skip</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  return</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> res</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">doAction</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(client, action, req)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">markIntegrationLockDone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, dedupeKey, res)</span></span></code></pre></div><p>Use <code>INSERT … ON DUPLICATE KEY UPDATE attempts = attempts + 1</code> on a unique key so concurrent redeliveries collapse to one execution. Combine with RC-006&#39;s outbox so each domain event has a stable <code>event_id</code> that flows into <code>attempt_id</code>.</p><hr><h2 id="rc-008-crons-run-without-distributed-lock" tabindex="-1">RC-008: Crons Run Without Distributed Lock <a class="header-anchor" href="#rc-008-crons-run-without-distributed-lock" aria-label="Permalink to &quot;RC-008: Crons Run Without Distributed Lock&quot;">​</a></h2><p><strong>Files:</strong></p><ul><li><a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/stock/stock.cron.ts#L27" target="_blank" rel="noreferrer"><code>stock.cron.ts:27</code></a> (<code>handleNotifEdStock</code>, <code>handleNotifStock</code>)</li><li><a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/export-history/export-history.cron.ts" target="_blank" rel="noreferrer"><code>export-history.cron.ts</code></a></li><li><a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/entity/entity.cron.ts" target="_blank" rel="noreferrer"><code>entity.cron.ts</code></a></li><li><a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/transaction/patient/patient.cron.ts" target="_blank" rel="noreferrer"><code>patient.cron.ts</code></a></li><li><a href="https://github.com/smile-health/platform/blob/main/apps/core/src/modules/asset-inventory/asset-inventory.cron.ts" target="_blank" rel="noreferrer"><code>asset-inventory.cron.ts</code></a></li><li>the 7 report crons under <a href="https://github.com/smile-health/platform/blob/main/apps/warehouse-service/src/modules/download-report/cron" target="_blank" rel="noreferrer"><code>apps/warehouse-service/src/modules/download-report/cron/</code></a></li></ul><blockquote><p>The original report also cited <code>bias-immunization-logistics.cron</code>, <code>non-bias-immunization-logistics.cron</code>, <code>targets.cron</code> and <code>biofarma.cron</code>. Those modules were removed with the Indonesia-only cleanup — see <a href="./database/db-cleanup-indonesia-only-removal.html">DB cleanup notes</a>. The defect class below is unchanged and still applies to every cron listed above.</p></blockquote><p><strong>Severity:</strong> 🟠 High</p><h3 id="what-happens-2" tabindex="-1">What happens <a class="header-anchor" href="#what-happens-2" aria-label="Permalink to &quot;What happens&quot;">​</a></h3><p>These cron handlers do not acquire any distributed lock (Redis, MySQL <code>GET_LOCK</code>, advisory key). When the deployment runs more than one replica of <code>apps/main</code>, the schedule fires once <em>per replica</em>. Both replicas:</p><ul><li>iterate the same entities / stock rows / report ranges,</li><li>compute the same target snapshot,</li><li>emit the same notifications and write the same report rows.</li></ul><p>Where the write is an upsert, the writes overwrite each other — visible as flapping numbers and odd <code>updated_at</code> timing. Where the write is a plain <code>INSERT</code>, duplicate rows actually appear.</p><p>The delay between the two writes equals the scheduler skew between replicas (sub-second to minutes on clock drift) — but if one replica is slow / paused / GC&#39;ing, the second write can land minutes-to-hours later, producing the irregular pattern the user sees.</p><h3 id="diagram-2" tabindex="-1">Diagram <a class="header-anchor" href="#diagram-2" aria-label="Permalink to &quot;Diagram&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-389",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20K8s%20as%20k8s%20CronJob%20%2F%20scheduler%0A%20%20%20%20participant%20P1%20as%20main-pod-A%0A%20%20%20%20participant%20P2%20as%20main-pod-B%0A%20%20%20%20participant%20DB%20as%20MySQL%0A%0A%20%20%20%20K8s-%3E%3EP1%3A%20tick%2002%3A00%0A%20%20%20%20K8s-%3E%3EP2%3A%20tick%2002%3A00%0A%20%20%20%20par%0A%20%20%20%20%20%20P1-%3E%3EDB%3A%20process%20entity%20%23500%0A%20%20%20%20and%0A%20%20%20%20%20%20P2-%3E%3EDB%3A%20process%20entity%20%23500%0A%20%20%20%20end%0A%20%20%20%20Note%20over%20DB%3A%20writes%20interleave%3B%20later%20write%20wins%0A%20%20%20%20Note%20over%20P2%3A%20GC%20pause%2012%20min%0A%20%20%20%20P2-%3E%3EDB%3A%20finally%20writes%20entity%20%23500%20%E2%86%90%20arrives%2012%20min%20later%0A%20%20%20%20Note%20over%20DB%3A%20looks%20like%20delayed%20duplicate%20write%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="fix-2" tabindex="-1">Fix <a class="header-anchor" href="#fix-2" aria-label="Permalink to &quot;Fix&quot;">​</a></h3><p>Wrap every cron entrypoint in a Redis lock (Redis is already imported via <code>@/common/infrastructure/redis</code>):</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">public readonly </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">handleNotifStock</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> lockKey</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;cron:stock:notif&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> token</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> randomUUID</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> acquired</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> redis.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(lockKey, token, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;EX&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1800</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;NX&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">acquired) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    console.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">log</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;[StockCron] another replica holds the lock, skipping&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  try</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // …existing body…</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">finally</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // release only if we still own it</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> redis.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      \`if redis.call(&quot;get&quot;, KEYS[1]) == ARGV[1] then return redis.call(&quot;del&quot;, KEYS[1]) end\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lockKey, token,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>TTL must comfortably exceed the worst-case run time. Apply uniformly to every cron entrypoint listed above.</p><hr><h2 id="rc-010-stock-notification-crons-—-no-already-sent-dedup" tabindex="-1">RC-010: Stock Notification Crons — No &quot;Already Sent&quot; Dedup <a class="header-anchor" href="#rc-010-stock-notification-crons-—-no-already-sent-dedup" aria-label="Permalink to &quot;RC-010: Stock Notification Crons — No &quot;Already Sent&quot; Dedup&quot;">​</a></h2><p><strong>File:</strong> <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/stock/stock.cron.ts#L27" target="_blank" rel="noreferrer"><code>stock.cron.ts:27-113</code></a> (<code>handleNotifEdStock</code>), <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/stock/stock.cron.ts#L115" target="_blank" rel="noreferrer"><code>stock.cron.ts:115-152</code></a> (<code>handleNotifStock</code>) <strong>Severity:</strong> 🟡 Medium</p><h3 id="what-happens-3" tabindex="-1">What happens <a class="header-anchor" href="#what-happens-3" aria-label="Permalink to &quot;What happens&quot;">​</a></h3><p>Each cron tick iterates <strong>all</strong> stocks that match the condition (near expiry, below min, zero) and publishes a notification per matching <code>(entity, material, batch)</code> regardless of whether the same notification was already sent in a previous tick. The condition often persists for days. Recipients see <strong>the same notification re-arriving</strong> at each cron interval. Because:</p><ul><li>different notification channels (WA, email, FCM) have independent delivery latencies,</li><li>batch sizes shift the per-row processing time,</li><li>the cron can be retried after a failure,</li></ul><p>the user-perceived gap between duplicate notifications is irregular (minutes if the cron is on a 5-minute schedule, hours if it&#39;s daily, longer when stuck on slow channels).</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// stock.cron.ts handleNotifEdStock — no last_notified_at check</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> stock</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> of</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> stocks) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // …builds payload…</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">sendNotifToUser</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, …)   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// fires every run</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="how-to-reproduce-2" tabindex="-1">How to Reproduce <a class="header-anchor" href="#how-to-reproduce-2" aria-label="Permalink to &quot;How to Reproduce&quot;">​</a></h3><ol><li>Create a stock row that satisfies <code>getStockExpired</code> (expires within 30 days).</li><li>Run <code>handleNotifEdStock</code> twice in succession.</li><li>Observe the same recipient receives the same WA / email / FCM message twice; the gap equals the cron interval.</li></ol><h3 id="fix-3" tabindex="-1">Fix <a class="header-anchor" href="#fix-3" aria-label="Permalink to &quot;Fix&quot;">​</a></h3><p>Persist a <code>notification_dedupe</code> row keyed by <code>(event_type, entity_id, material_id, batch_id, day_bucket)</code> and check it before publishing:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> key</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> \`ed-\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">number_of_days</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">entity_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">material_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">batch_number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}:\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">moment</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">format</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;YYYY-MM-DD&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> inserted</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">tryInsertNotifDedupe</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, key)   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// INSERT IGNORE on unique key</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">inserted) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">continue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">   // already sent today</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">sendNotifToUser</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, …)</span></span></code></pre></div><p><code>day_bucket</code> granularity is a product decision (per-day for ED warnings, per-hour for zero-stock, etc.) but the table-level unique key + <code>INSERT IGNORE</code> is what kills the duplication.</p><hr><h2 id="rc-011-orderintegrationworker-doretry-—-updates-id-0-but-still-fires-external-call" tabindex="-1">RC-011: <code>OrderIntegrationWorker.doRetry</code> — Updates id=0 but Still Fires External Call <a class="header-anchor" href="#rc-011-orderintegrationworker-doretry-—-updates-id-0-but-still-fires-external-call" aria-label="Permalink to &quot;RC-011: \`OrderIntegrationWorker.doRetry\` — Updates id=0 but Still Fires External Call&quot;">​</a></h2><p><strong>File:</strong> <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/order-integration/order-integration.worker.ts#L106" target="_blank" rel="noreferrer"><code>order-integration.worker.ts:106-143</code></a><strong>Severity:</strong> 🟡 Medium</p><h3 id="what-happens-4" tabindex="-1">What happens <a class="header-anchor" href="#what-happens-4" aria-label="Permalink to &quot;What happens&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">updateLog</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, payload.id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, update)</span></span></code></pre></div><p>When the retry payload doesn&#39;t include the original log <code>id</code> (or it&#39;s <code>0</code> / <code>undefined</code>), the update silently affects <code>id=0</code> (no row, or a sentinel row), and the integration log for <em>this</em> attempt is never recorded. <strong>But <code>doAction</code> still fires the external API call beforehand.</strong> So every retry of this kind:</p><ol><li>Hits the external system again → potential downstream duplicate.</li><li>Leaves no audit trail → operators can&#39;t see how many duplicates were created.</li></ol><p>Because retries are scheduled by an upstream component (often <code>processRetryIntegrationLog</code> from <code>order.publisher.ts</code>, which copies <code>data.id</code> into the payload), a misconfigured retry source produces an unbounded series of external calls separated by the retry interval — exactly the &quot;irregular minutes-to-hours&quot; pattern.</p><h3 id="fix-4" tabindex="-1">Fix <a class="header-anchor" href="#fix-4" aria-label="Permalink to &quot;Fix&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">private readonly </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">doRetry</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">action</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">payload.id) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    logger.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">error</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({ payload }, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;[OrderIntegration] retry without log id, refusing to fire external call&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // …existing body…</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>And combine with RC-007&#39;s dedupe key so even a misrouted retry collapses to a no-op at the gateway boundary.</p><hr><h2 id="priority-—-combined-with-rc-001-rc-005" tabindex="-1">Priority — combined with RC-001…RC-005 <a class="header-anchor" href="#priority-—-combined-with-rc-001-rc-005" aria-label="Permalink to &quot;Priority — combined with RC-001…RC-005&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-504",
				class: "mermaid",
				graph: "gantt%0A%20%20%20%20title%20Fix%20Priority%20%E2%80%94%20including%20delayed-duplication%20races%0A%20%20%20%20dateFormat%20%20X%0A%20%20%20%20axisFormat%20sp%25s%0A%0A%20%20%20%20section%20%F0%9F%94%B4%20Critical%20%E2%80%94%20Fix%20first%0A%20%20%20%20RC-001%20Wrap%20fulfilled%2Bcancel%20in%20db.transaction()%20%20%20%20%20%20%3Acrit%2C%20rc1%2C%200%2C%203%0A%20%20%20%20RC-002%20Add%20SELECT%20FOR%20UPDATE%20on%20stock%20reads%20%20%20%20%20%20%20%20%20%20%20%3Acrit%2C%20rc2%2C%200%2C%202%0A%20%20%20%20RC-006%20Outbox%20%2B%20Idempotency-Key%20on%20mutating%20endpoints%20%3Acrit%2C%20rc6%2C%200%2C%205%0A%20%20%20%20RC-007%20Dedupe%20key%20on%20order-integration%20consumer%20%20%20%20%20%20%20%3Acrit%2C%20rc7%2C%203%2C%202%0A%0A%20%20%20%20section%20%F0%9F%9F%A0%20High%20%E2%80%94%20Fix%20next%20sprint%0A%20%20%20%20RC-004%20Wrap%20order.create()%20in%20db.transaction()%20%20%20%20%20%20%20%20%3Arc4%2C%205%2C%201%0A%20%20%20%20RC-003%20Unique%20constraint%20%2B%20ON%20DUPLICATE%20KEY%20%20%20%20%20%20%20%20%20%20%20%3Arc3%2C%205%2C%202%0A%20%20%20%20RC-008%20Distributed%20cron%20locks%20(Redis)%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Arc8%2C%206%2C%202%0A%0A%20%20%20%20section%20%F0%9F%9F%A1%20Medium%20%E2%80%94%20Backlog%0A%20%20%20%20RC-005%20Idempotent%20ClickHouse%20sync%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Arc5%2C%208%2C%202%0A%20%20%20%20RC-010%20Notification%20dedupe%20table%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Arc10%2C%208%2C%202%0A%20%20%20%20RC-011%20doRetry%20refuses%20payload.id%3D0%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Arc11%2C%209%2C%201%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Mapping the new findings back to the user-reported symptom:</strong></p><ul><li><strong>RC-006</strong> is the most likely root cause for &quot;duplicate orders, gap = minutes/hours, no pattern&quot;. The delay tracks client retry timing, not anything inside the backend.</li><li><strong>RC-007</strong> explains duplicate downstream integrations even when the SMILE DB looks correct.</li><li><strong>RC-008</strong> explains duplicates that appear at roughly cron-multiple intervals but skewed by replica timing.</li><li><strong>RC-010</strong> explains duplicate notifications specifically.</li><li><strong>RC-011</strong> explains &quot;I clicked retry once and the customer got hit 5 times&quot;.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/race-conditions-delayed.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var race_conditions_delayed_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, race_conditions_delayed_default as default };
