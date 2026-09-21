import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/timeout-troubleshooting-sync-service.md
var __pageData = JSON.parse("{\"title\":\"ETIMEDOUT Error Troubleshooting Guide\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/timeout-troubleshooting-sync-service.md\",\"filePath\":\"archive/timeout-troubleshooting-sync-service.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/timeout-troubleshooting-sync-service.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="etimedout-error-troubleshooting-guide" tabindex="-1">ETIMEDOUT Error Troubleshooting Guide <a class="header-anchor" href="#etimedout-error-troubleshooting-guide" aria-label="Permalink to &quot;ETIMEDOUT Error Troubleshooting Guide&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Seluruh isinya menargetkan <code>apps/sync-service</code>, yang sudah dihapus dari repo. Berisi juga path absolut ke checkout lama (<code>platform-backend2</code>). Disimpan sebagai rujukan historis saja.</p></blockquote><p>This guide helps you identify which service is causing the <code>ETIMEDOUT</code> connection error in the sync-service.</p><h2 id="enhanced-logging-added" tabindex="-1">Enhanced Logging Added <a class="header-anchor" href="#enhanced-logging-added" aria-label="Permalink to &quot;Enhanced Logging Added&quot;">​</a></h2><p>The following files have been enhanced with detailed timeout logging:</p><h3 id="_1-database-connection-src-common-infrastructure-database-index-ts" tabindex="-1">1. Database Connection (<code>src/common/infrastructure/database/index.ts</code>) <a class="header-anchor" href="#_1-database-connection-src-common-infrastructure-database-index-ts" aria-label="Permalink to &quot;1. Database Connection (\`src/common/infrastructure/database/index.ts\`)&quot;">​</a></h3><ul><li>✅ MySQL connection attempts</li><li>✅ Connection pool events (acquire, release, error)</li><li>✅ Specific ETIMEDOUT error detection</li><li>✅ Connection timeout configuration (60 seconds)</li></ul><h3 id="_2-rabbitmq-connection-src-common-infrastructure-mq-index-ts" tabindex="-1">2. RabbitMQ Connection (<code>src/common/infrastructure/mq/index.ts</code>) <a class="header-anchor" href="#_2-rabbitmq-connection-src-common-infrastructure-mq-index-ts" aria-label="Permalink to &quot;2. RabbitMQ Connection (\`src/common/infrastructure/mq/index.ts\`)&quot;">​</a></h3><ul><li>✅ RabbitMQ connection attempts with 30-second timeout</li><li>✅ Connection URL logging (without credentials)</li><li>✅ Specific ETIMEDOUT error detection</li><li>✅ Connection state management</li><li>✅ Troubleshooting steps in error messages</li></ul><h3 id="_3-redis-connection-src-common-infrastructure-redis-ts" tabindex="-1">3. Redis Connection (<code>src/common/infrastructure/redis.ts</code>) <a class="header-anchor" href="#_3-redis-connection-src-common-infrastructure-redis-ts" aria-label="Permalink to &quot;3. Redis Connection (\`src/common/infrastructure/redis.ts\`)&quot;">​</a></h3><ul><li>✅ Redis connection attempts</li><li>✅ Connection state events (connect, ready, close, reconnecting)</li><li>✅ Specific ETIMEDOUT error detection</li><li>✅ Connection timeout configuration (30 seconds)</li><li>✅ Authentication error detection</li></ul><h3 id="_4-http-requests-src-index-ts" tabindex="-1">4. HTTP Requests (<code>src/index.ts</code>) <a class="header-anchor" href="#_4-http-requests-src-index-ts" aria-label="Permalink to &quot;4. HTTP Requests (\`src/index.ts\`)&quot;">​</a></h3><ul><li>✅ Axios timeout error detection</li><li>✅ External API timeout logging</li><li>✅ Request details logging</li><li>✅ Worker startup error handling</li></ul><h2 id="how-to-use-the-enhanced-logging" tabindex="-1">How to Use the Enhanced Logging <a class="header-anchor" href="#how-to-use-the-enhanced-logging" aria-label="Permalink to &quot;How to Use the Enhanced Logging&quot;">​</a></h2><ol><li><p><strong>Start the sync-service</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">cd</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> /c/laragon/www/platform-backend2/apps/sync-service</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div></li><li><p><strong>Watch the console output</strong> for these indicators:</p><h3 id="mysql-issues" tabindex="-1">MySQL Issues: <a class="header-anchor" href="#mysql-issues" aria-label="Permalink to &quot;MySQL Issues:&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>🔌 Attempting to connect to MySQL database at localhost:3306/dbname...</span></span>
<span class="line"><span>❌ MySQL connection error to localhost:3306: connect ETIMEDOUT</span></span>
<span class="line"><span>⏰ MySQL connection TIMEOUT to localhost:3306 - Check if MySQL server is running and accessible</span></span></code></pre></div><h3 id="rabbitmq-issues" tabindex="-1">RabbitMQ Issues: <a class="header-anchor" href="#rabbitmq-issues" aria-label="Permalink to &quot;RabbitMQ Issues:&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>🔌 Attempting to connect to RabbitMQ at amqp://localhost:5672...</span></span>
<span class="line"><span>❌ Failed to connect to RabbitMQ at localhost:5672: connect ETIMEDOUT</span></span>
<span class="line"><span>⏰ RabbitMQ connection TIMEOUT - This is likely the source of your ETIMEDOUT error</span></span></code></pre></div><h3 id="redis-issues" tabindex="-1">Redis Issues: <a class="header-anchor" href="#redis-issues" aria-label="Permalink to &quot;Redis Issues:&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>🔌 Attempting to connect to Redis at localhost:6379...</span></span>
<span class="line"><span>❌ Redis connection error to localhost:6379: connect ETIMEDOUT</span></span>
<span class="line"><span>⏰ Redis connection TIMEOUT - This could be the source of your ETIMEDOUT error</span></span></code></pre></div><h3 id="http-api-issues" tabindex="-1">HTTP API Issues: <a class="header-anchor" href="#http-api-issues" aria-label="Permalink to &quot;HTTP API Issues:&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>⏰ HTTP Request TIMEOUT - External API call timed out</span></span>
<span class="line"><span>🔍 Request details: { url: &#39;http://example.com/api&#39;, method: &#39;GET&#39;, timeout: 5000 }</span></span></code></pre></div></li></ol><h2 id="quick-fixes" tabindex="-1">Quick Fixes <a class="header-anchor" href="#quick-fixes" aria-label="Permalink to &quot;Quick Fixes&quot;">​</a></h2><h3 id="_1-create-env-file" tabindex="-1">1. Create .env file <a class="header-anchor" href="#_1-create-env-file" aria-label="Permalink to &quot;1. Create .env file&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">cp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> .env.example</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> .env</span></span></code></pre></div><h3 id="_2-check-docker-services" tabindex="-1">2. Check Docker Services <a class="header-anchor" href="#_2-check-docker-services" aria-label="Permalink to &quot;2. Check Docker Services&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Check if services are running</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ps</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Start infrastructure services</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker-compose</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ../../infra/compose-database.yml</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> up</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -d</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker-compose</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ../../infra/compose-message.yml</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> up</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -d</span></span></code></pre></div><h3 id="_3-test-individual-connections" tabindex="-1">3. Test Individual Connections <a class="header-anchor" href="#_3-test-individual-connections" aria-label="Permalink to &quot;3. Test Individual Connections&quot;">​</a></h3><p><strong>MySQL:</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">mysql</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> localhost</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -P</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 3306</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -u</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> your_user</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -p</span></span></code></pre></div><p><strong>RabbitMQ:</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Check if RabbitMQ is accessible</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -u</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> guest:guest</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:15672/api/overview</span></span></code></pre></div><p><strong>Redis:</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">redis-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> localhost</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 6379</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ping</span></span></code></pre></div><h2 id="environment-configuration" tabindex="-1">Environment Configuration <a class="header-anchor" href="#environment-configuration" aria-label="Permalink to &quot;Environment Configuration&quot;">​</a></h2><p>Ensure your <code>.env</code> file has correct values:</p><div class="language-env vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">env</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Database</span></span>
<span class="line"><span>DB_HOST=localhost</span></span>
<span class="line"><span>DB_USER=your_db_user</span></span>
<span class="line"><span>DB_PORT=3306</span></span>
<span class="line"><span>DB_PASSWORD=your_db_password</span></span>
<span class="line"><span>DB_NAME=your_db_name</span></span>
<span class="line"><span></span></span>
<span class="line"><span># RabbitMQ</span></span>
<span class="line"><span>RABBITMQ_PROTOCOL=amqp</span></span>
<span class="line"><span>RABBITMQ_HOST=localhost</span></span>
<span class="line"><span>RABBITMQ_PORT=5672</span></span>
<span class="line"><span>RABBITMQ_USERNAME=guest</span></span>
<span class="line"><span>RABBITMQ_PASSWORD=guest</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Redis</span></span>
<span class="line"><span>REDIS_HOST=localhost</span></span>
<span class="line"><span>REDIS_PORT=6379</span></span>
<span class="line"><span>REDIS_PASSWORD=</span></span></code></pre></div><h2 id="common-issues-and-solutions" tabindex="-1">Common Issues and Solutions <a class="header-anchor" href="#common-issues-and-solutions" aria-label="Permalink to &quot;Common Issues and Solutions&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Error Pattern</th><th>Likely Cause</th><th>Solution</th></tr></thead><tbody><tr><td><code>MySQL connection TIMEOUT</code></td><td>MySQL server not running</td><td>Start MySQL: <code>docker-compose up mysql</code></td></tr><tr><td><code>RabbitMQ connection TIMEOUT</code></td><td>RabbitMQ server not running</td><td>Start RabbitMQ: <code>docker-compose up rabbitmq</code></td></tr><tr><td><code>Redis connection TIMEOUT</code></td><td>Redis server not running</td><td>Start Redis: <code>docker-compose up redis</code></td></tr><tr><td><code>HTTP Request TIMEOUT</code></td><td>External API unreachable</td><td>Check network/API endpoint</td></tr><tr><td><code>WORKER STARTUP TIMEOUT</code></td><td>Multiple services down</td><td>Check all infrastructure services</td></tr></tbody></table><h2 id="next-steps" tabindex="-1">Next Steps <a class="header-anchor" href="#next-steps" aria-label="Permalink to &quot;Next Steps&quot;">​</a></h2><ol><li>Run the sync-service with the enhanced logging</li><li>Identify which service is timing out from the console output</li><li>Follow the specific troubleshooting steps provided in the error messages</li><li>Ensure all required services are running and accessible</li><li>Verify your <code>.env</code> configuration matches your actual service setup</li></ol></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/timeout-troubleshooting-sync-service.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var timeout_troubleshooting_sync_service_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, timeout_troubleshooting_sync_service_default as default };
