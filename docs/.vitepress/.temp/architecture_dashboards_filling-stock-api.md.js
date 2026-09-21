import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/dashboards/filling-stock-api.md
var __pageData = JSON.parse("{\"title\":\"Stock Recovery Tracking API Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/dashboards/filling-stock-api.md\",\"filePath\":\"architecture/dashboards/filling-stock-api.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/dashboards/filling-stock-api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="stock-recovery-tracking-api-documentation" tabindex="-1">Stock Recovery Tracking API Documentation <a class="header-anchor" href="#stock-recovery-tracking-api-documentation" aria-label="Permalink to &quot;Stock Recovery Tracking API Documentation&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Stock Recovery Tracking module measures how long it takes for stock to recover from a <strong>zero state</strong> (out of stock) back to a <strong>normal state</strong> (adequate stock levels). This provides critical insights into supply chain resilience and restocking efficiency.</p><p><strong>Transaction Type</strong>: <code>normal</code><br><strong>Module</strong>: Stock Inventory Query System<br><strong>Purpose</strong>: Track recovery duration and frequency from stockouts to normal inventory levels</p><hr><h2 id="core-concept" tabindex="-1">Core Concept <a class="header-anchor" href="#core-concept" aria-label="Permalink to &quot;Core Concept&quot;">​</a></h2><h3 id="what-is-stock-recovery" tabindex="-1">What is Stock Recovery? <a class="header-anchor" href="#what-is-stock-recovery" aria-label="Permalink to &quot;What is Stock Recovery?&quot;">​</a></h3><p>A <strong>recovery period</strong> is defined as the time span from when stock reaches zero until it returns to a normal state (within EMA min/max thresholds).</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Timeline: zero → min → max → normal</span></span>
<span class="line"><span>          ^_____Recovery Period_____^</span></span></code></pre></div><h3 id="key-metrics" tabindex="-1">Key Metrics <a class="header-anchor" href="#key-metrics" aria-label="Permalink to &quot;Key Metrics&quot;">​</a></h3><ol><li><strong>Recovery Duration</strong>: Total time (in seconds) spent recovering from zero to normal</li><li><strong>Recovery Frequency</strong>: Number of completed recovery cycles in the period</li></ol><hr><h2 id="business-logic" tabindex="-1">Business Logic <a class="header-anchor" href="#business-logic" aria-label="Permalink to &quot;Business Logic&quot;">​</a></h2><h3 id="stock-state-classification" tabindex="-1">Stock State Classification <a class="header-anchor" href="#stock-state-classification" aria-label="Permalink to &quot;Stock State Classification&quot;">​</a></h3><p>Each transaction&#39;s stock balance is classified into one of five states:</p><table tabindex="0"><thead><tr><th>State</th><th>Condition</th><th>Description</th></tr></thead><tbody><tr><td><code>zero</code></td><td>balance ≤ 0</td><td>Out of stock</td></tr><tr><td><code>min</code></td><td>0 &lt; balance &lt; EMA_min</td><td>Below minimum threshold</td></tr><tr><td><code>max</code></td><td>balance &gt; EMA_max</td><td>Above maximum threshold</td></tr><tr><td><code>normal</code></td><td>EMA_min ≤ balance ≤ EMA_max</td><td>Optimal stock level</td></tr><tr><td><code>available</code></td><td>balance &gt; 0 (no thresholds)</td><td>Stock exists but no EMA defined</td></tr></tbody></table><h3 id="recovery-tracking-rules" tabindex="-1">Recovery Tracking Rules <a class="header-anchor" href="#recovery-tracking-rules" aria-label="Permalink to &quot;Recovery Tracking Rules&quot;">​</a></h3><h4 id="rule-1-track-each-zero-to-normal-recovery" tabindex="-1">Rule 1: Track Each Zero-to-Normal Recovery <a class="header-anchor" href="#rule-1-track-each-zero-to-normal-recovery" aria-label="Permalink to &quot;Rule 1: Track Each Zero-to-Normal Recovery&quot;">​</a></h4><p>Each time stock enters zero state and subsequently reaches normal state, it counts as one recovery period.</p><p><strong>Example:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>zero → min → normal → max → zero → min → normal</span></span>
<span class="line"><span>^___Recovery 1_____^         ^___Recovery 2_____^</span></span></code></pre></div><ul><li><strong>Recovery 1</strong>: 3 transactions, duration = T1→T2 + T2→T3</li><li><strong>Recovery 2</strong>: 3 transactions, duration = T5→T6 + T6→T7</li><li><strong>Total Frequency</strong>: 2</li></ul><h4 id="rule-2-ignore-subsequent-zeros-during-active-recovery" tabindex="-1">Rule 2: Ignore Subsequent Zeros During Active Recovery <a class="header-anchor" href="#rule-2-ignore-subsequent-zeros-during-active-recovery" aria-label="Permalink to &quot;Rule 2: Ignore Subsequent Zeros During Active Recovery&quot;">​</a></h4><p>If stock enters zero again before completing the current recovery, ignore the subsequent zero.</p><p><strong>Example:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>zero → min → zero → max → normal</span></span>
<span class="line"><span>^_________Recovery 1__________^</span></span>
<span class="line"><span>          (T3 ignored)</span></span></code></pre></div><ul><li><strong>Recovery 1</strong>: Tracks from first zero (T1) to first normal (T5)</li><li><strong>T3 (second zero)</strong>: Ignored because recovery from T1 is still in progress</li><li><strong>Total Frequency</strong>: 1</li></ul><h4 id="rule-3-multiple-recoveries-per-period" tabindex="-1">Rule 3: Multiple Recoveries Per Period <a class="header-anchor" href="#rule-3-multiple-recoveries-per-period" aria-label="Permalink to &quot;Rule 3: Multiple Recoveries Per Period&quot;">​</a></h4><p>A single time period (day/week/month) can contain multiple independent recovery cycles.</p><p><strong>Example:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>zero → normal → max → zero → normal</span></span>
<span class="line"><span>^_Recovery 1_^         ^_Recovery 2_^</span></span></code></pre></div><ul><li><strong>Recovery 1</strong>: T1 → T2</li><li><strong>Recovery 2</strong>: T4 → T5</li><li><strong>Total Frequency</strong>: 2</li></ul><hr><h2 id="technical-implementation" tabindex="-1">Technical Implementation <a class="header-anchor" href="#technical-implementation" aria-label="Permalink to &quot;Technical Implementation&quot;">​</a></h2><h3 id="query-architecture" tabindex="-1">Query Architecture <a class="header-anchor" href="#query-architecture" aria-label="Permalink to &quot;Query Architecture&quot;">​</a></h3><p>The recovery tracking uses a multi-stage CTE (Common Table Expression) pipeline:</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WITH</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  transactions_with_state </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Classify each transaction&#39;s stock condition</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  transactions_with_recovery_base </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Track cumulative counts of &#39;normal&#39; and &#39;zero&#39; states</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  transactions_with_recovery </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Create recovery groups</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  transactions_with_recovery_flags </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Mark recovery start/end and in-progress flags</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  aggregated_by_period </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Aggregate metrics by entity-material-period</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ...</span></span></code></pre></div><h3 id="recovery-group-algorithm" tabindex="-1">Recovery Group Algorithm <a class="header-anchor" href="#recovery-group-algorithm" aria-label="Permalink to &quot;Recovery Group Algorithm&quot;">​</a></h3><p><strong>Step 1: Track State Counts</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">normal_count_before </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(normal states </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">before</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> current </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">transaction</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">zero_entry_count_before </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(zero entries </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">before</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> current </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">transaction</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><p><strong>Step 2: Increment Recovery Group</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">IF</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  previous_condition </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;zero&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> current_condition </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;zero&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> normal_count_before </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> zero_entry_count_before</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">THEN</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  recovery_group</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">++</span></span></code></pre></div><p><strong>Logic</strong>: Only increment when entering zero AND the previous recovery has completed (reached normal).</p><p><strong>Step 3: Mark Recovery Boundaries</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">recovery_start_txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> MIN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> condition </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;zero&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> IN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_group)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">recovery_end_txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> MIN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> condition </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;normal&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> IN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_group)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">recovery_in_progress </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">BETWEEN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_start_txn_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_end_txn_id)</span></span></code></pre></div><h3 id="missing-data-filling-algorithm" tabindex="-1">Missing Data Filling Algorithm <a class="header-anchor" href="#missing-data-filling-algorithm" aria-label="Permalink to &quot;Missing Data Filling Algorithm&quot;">​</a></h3><p><strong>Function</strong>: <code>fillAndCalculateMissingData()</code></p><p><strong>Purpose</strong>: Ensures continuous time-series data by filling gaps in periods where no transactions occurred for an entity-material combination. This is critical for accurate duration calculations across incomplete datasets.</p><p><strong>Key Responsibilities</strong>:</p><ol><li><strong>Gap Detection</strong>: Identifies missing periods in the time series for each entity-material group</li><li><strong>Data Interpolation</strong>: Creates synthetic data points for missing periods based on the last known state</li><li><strong>Duration Propagation</strong>: Calculates appropriate duration values for missing periods based on transaction type and stock conditions</li><li><strong>State Continuity</strong>: Maintains stock condition state across gaps to ensure accurate recovery tracking</li></ol><p><strong>Algorithm Steps</strong>:</p><p><strong>Step 1: Group by Composite Key</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">compositeKey </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> \`\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">entity_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}_\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">master_material_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">groupedData </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> groupBy</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(stockData, compositeKey);</span></span></code></pre></div><p><strong>Step 2: Initialize Period Array</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Add baseline period (1970-01-01 or 1970-01) to track historical state</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">copyPeriods </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;1970-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">actualPeriods];</span></span></code></pre></div><p><strong>Step 3: Iterate Through All Periods</strong></p><p>For each period in the complete timeline:</p><ul><li><p><strong>Case A: First Period (1970 baseline)</strong></p><ul><li>Create a &quot;past data&quot; entry with all metrics set to <code>null</code></li><li>Set <code>total_duration_seconds = -1</code> and <code>total_frequency = -1</code> to indicate historical data</li><li>Preserve <code>opening_previous_stock_condition</code> from first actual transaction</li></ul></li><li><p><strong>Case B: Missing Period (no transaction data)</strong></p><ul><li>Clone the latest existing entry</li><li>Update <code>period</code> to the missing period identifier</li><li>Set all opening/middle/closing metrics to <code>null</code></li><li>Calculate <code>total_duration_seconds</code> based on transaction type: <ul><li>If previous closing condition matches transaction type criteria → duration = period duration</li><li>Otherwise → duration = 0</li></ul></li><li>Set <code>total_frequency = 0</code> (no new events in missing period)</li></ul></li><li><p><strong>Case C: Existing Period (has transaction data)</strong></p><ul><li>Use actual data from query results</li><li>Update <code>future_immediate_balance_condition</code> to link to next period&#39;s opening state</li><li>Remove from processing queue to avoid duplication</li></ul></li></ul><p><strong>Step 4: Duration Calculation Logic for Missing Data</strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  checkPreviousEhmmBalance</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    closing_current_stock_condition,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    future_immediate_balance_condition,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    transactionType</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  total_duration_seconds </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> periodDuration; </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Full period duration</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">else</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  total_duration_seconds </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">; </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Condition not met</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Transaction Type Rules</strong>:</p><table tabindex="0"><thead><tr><th>Transaction Type</th><th>Duration Assigned When</th></tr></thead><tbody><tr><td><code>zero</code></td><td>Previous closing state is <code>zero</code></td></tr><tr><td><code>min</code></td><td>Previous closing state is <code>min</code></td></tr><tr><td><code>max</code></td><td>Previous closing state is <code>max</code></td></tr><tr><td><code>normal</code></td><td>Previous closing is <code>zero</code> AND next opening is <code>normal</code> (recovery complete)</td></tr><tr><td><code>availability</code></td><td>Previous closing state is NOT <code>zero</code></td></tr></tbody></table><p><strong>Example Scenario</strong>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Actual Data:</span></span>
<span class="line"><span>  2025-01: zero → normal (recovery completed)</span></span>
<span class="line"><span>  2025-03: normal → max</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Missing Period: 2025-02</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Filled Data for 2025-02:</span></span>
<span class="line"><span>  - period: &#39;2025-02&#39;</span></span>
<span class="line"><span>  - opening_ehmm_balance: null</span></span>
<span class="line"><span>  - closing_current_stock_condition: &#39;normal&#39; (from 2025-01 closing)</span></span>
<span class="line"><span>  - future_immediate_balance_condition: &#39;normal&#39; (from 2025-03 opening)</span></span>
<span class="line"><span>  - total_duration_seconds: 0 (no active recovery in Feb)</span></span>
<span class="line"><span>  - total_frequency: 0</span></span></code></pre></div><p><strong>Why This Matters</strong>:</p><ul><li><strong>Accurate Aggregations</strong>: Frontend can sum durations across all periods without gaps</li><li><strong>Trend Visualization</strong>: Charts display continuous lines instead of broken segments</li><li><strong>State Tracking</strong>: Recovery states persist correctly across time gaps</li><li><strong>Null Semantics</strong>: <code>null</code> values indicate &quot;no transaction data&quot; vs <code>0</code> which means &quot;measured as zero&quot;</li></ul><h3 id="duration-calculation" tabindex="-1">Duration Calculation <a class="header-anchor" href="#duration-calculation" aria-label="Permalink to &quot;Duration Calculation&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">middle_duration </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> SUM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  dateDiff</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;second&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, current_txn_time, next_txn_time)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_in_progress </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><h3 id="frequency-calculation" tabindex="-1">Frequency Calculation <a class="header-anchor" href="#frequency-calculation" aria-label="Permalink to &quot;Frequency Calculation&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">middle_frequency </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> current_condition </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;normal&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> recovery_start_flag </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><hr><h2 id="detailed-example-walkthrough" tabindex="-1">Detailed Example Walkthrough <a class="header-anchor" href="#detailed-example-walkthrough" aria-label="Permalink to &quot;Detailed Example Walkthrough&quot;">​</a></h2><h3 id="scenario-multiple-recoveries-with-ignored-zero" tabindex="-1">Scenario: Multiple Recoveries with Ignored Zero <a class="header-anchor" href="#scenario-multiple-recoveries-with-ignored-zero" aria-label="Permalink to &quot;Scenario: Multiple Recoveries with Ignored Zero&quot;">​</a></h3><p><strong>Input Transactions:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>T1: zero (balance=0)</span></span>
<span class="line"><span>T2: min (balance=5, EMA_min=10)</span></span>
<span class="line"><span>T3: zero (balance=0)  ← Should be ignored</span></span>
<span class="line"><span>T4: normal (balance=15, EMA_min=10, EMA_max=50)</span></span>
<span class="line"><span>T5: normal (balance=20)</span></span>
<span class="line"><span>T6: min (balance=8)</span></span>
<span class="line"><span>T7: max (balance=55, EMA_max=50)</span></span>
<span class="line"><span>T8: zero (balance=0)</span></span>
<span class="line"><span>T9: min (balance=7)</span></span>
<span class="line"><span>T10: normal (balance=18)</span></span></code></pre></div><h3 id="processing-steps" tabindex="-1">Processing Steps <a class="header-anchor" href="#processing-steps" aria-label="Permalink to &quot;Processing Steps&quot;">​</a></h3><p><strong>Step 1: Classify States</strong></p><table tabindex="0"><thead><tr><th>Txn</th><th>Balance</th><th>State</th><th>Previous State</th></tr></thead><tbody><tr><td>T1</td><td>0</td><td>zero</td><td>(initial)</td></tr><tr><td>T2</td><td>5</td><td>min</td><td>zero</td></tr><tr><td>T3</td><td>0</td><td>zero</td><td>min</td></tr><tr><td>T4</td><td>15</td><td>normal</td><td>zero</td></tr><tr><td>T5</td><td>20</td><td>normal</td><td>normal</td></tr><tr><td>T6</td><td>8</td><td>min</td><td>normal</td></tr><tr><td>T7</td><td>55</td><td>max</td><td>min</td></tr><tr><td>T8</td><td>0</td><td>zero</td><td>max</td></tr><tr><td>T9</td><td>7</td><td>min</td><td>zero</td></tr><tr><td>T10</td><td>18</td><td>normal</td><td>min</td></tr></tbody></table><p><strong>Step 2: Calculate Counts</strong></p><table tabindex="0"><thead><tr><th>Txn</th><th>normal_count_before</th><th>zero_entry_count_before</th></tr></thead><tbody><tr><td>T1</td><td>0</td><td>0</td></tr><tr><td>T2</td><td>0</td><td>1</td></tr><tr><td>T3</td><td>0</td><td>1</td></tr><tr><td>T4</td><td>0</td><td>1</td></tr><tr><td>T5</td><td>1</td><td>1</td></tr><tr><td>T6</td><td>2</td><td>1</td></tr><tr><td>T7</td><td>2</td><td>1</td></tr><tr><td>T8</td><td>2</td><td>1</td></tr><tr><td>T9</td><td>2</td><td>2</td></tr><tr><td>T10</td><td>2</td><td>2</td></tr></tbody></table><p><strong>Step 3: Determine Recovery Groups</strong></p><table tabindex="0"><thead><tr><th>Txn</th><th>Condition Check</th><th>Recovery Group</th></tr></thead><tbody><tr><td>T1</td><td>prev != &#39;zero&#39; AND curr == &#39;zero&#39; AND 0 &gt;= 0 → <strong>TRUE</strong></td><td>1</td></tr><tr><td>T2</td><td>FALSE</td><td>1</td></tr><tr><td>T3</td><td>prev != &#39;zero&#39; AND curr == &#39;zero&#39; AND 0 &gt;= 1 → <strong>FALSE</strong></td><td>1 ✓ (ignored!)</td></tr><tr><td>T4</td><td>FALSE</td><td>1</td></tr><tr><td>T5</td><td>FALSE</td><td>1</td></tr><tr><td>T6</td><td>FALSE</td><td>1</td></tr><tr><td>T7</td><td>FALSE</td><td>1</td></tr><tr><td>T8</td><td>prev != &#39;zero&#39; AND curr == &#39;zero&#39; AND 2 &gt;= 1 → <strong>TRUE</strong></td><td>2</td></tr><tr><td>T9</td><td>FALSE</td><td>2</td></tr><tr><td>T10</td><td>FALSE</td><td>2</td></tr></tbody></table><p><strong>Step 4: Mark Recovery Flags</strong></p><table tabindex="0"><thead><tr><th>Txn</th><th>recovery_in_progress</th><th>recovery_start_flag</th></tr></thead><tbody><tr><td>T1</td><td>1</td><td>0</td></tr><tr><td>T2</td><td>1</td><td>0</td></tr><tr><td>T3</td><td>1</td><td>0</td></tr><tr><td>T4</td><td>1</td><td><strong>1</strong> (first normal in group 1)</td></tr><tr><td>T5</td><td>0</td><td>0</td></tr><tr><td>T6</td><td>0</td><td>0</td></tr><tr><td>T7</td><td>0</td><td>0</td></tr><tr><td>T8</td><td>1</td><td>0</td></tr><tr><td>T9</td><td>1</td><td>0</td></tr><tr><td>T10</td><td>1</td><td><strong>1</strong> (first normal in group 2)</td></tr></tbody></table><p><strong>Step 5: Calculate Metrics</strong></p><p><strong>Duration:</strong></p><ul><li>Group 1: (T1→T2) + (T2→T3) + (T3→T4) = 3 intervals</li><li>Group 2: (T8→T9) + (T9→T10) = 2 intervals</li><li><strong>Total</strong>: 5 intervals worth of seconds</li></ul><p><strong>Frequency:</strong></p><ul><li>T4: recovery_start_flag = 1 → Count 1</li><li>T10: recovery_start_flag = 1 → Count 1</li><li><strong>Total</strong>: 2 recoveries</li></ul><hr><h2 id="api-response-structure" tabindex="-1">API Response Structure <a class="header-anchor" href="#api-response-structure" aria-label="Permalink to &quot;API Response Structure&quot;">​</a></h2><h3 id="query-parameters" tabindex="-1">Query Parameters <a class="header-anchor" href="#query-parameters" aria-label="Permalink to &quot;Query Parameters&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: DateTime,              </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Start date (Asia/Jakarta timezone)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  to</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: DateTime,                </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// End date (Asia/Jakarta timezone)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  period</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;day&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;week&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;month&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  province_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  regency_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  entity_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  entity_tag_ids</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number[],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  material_ids</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number[],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  material_level_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// KFA_LEVEL_CODE.TEMPLATE | VARIANT</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  material_type_ids</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number[],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  activity_ids</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> number[]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="response-data-structure" tabindex="-1">Response Data Structure <a class="header-anchor" href="#response-data-structure" aria-label="Permalink to &quot;Response Data Structure&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  province_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  regency_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  entity_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  location_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Dynamic based on filters</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  master_material_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  period</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: string,               </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// &#39;YYYY-MM&#39; | &#39;YYYY-WW&#39; | &#39;YYYY-MM-DD&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Opening snapshot (first transaction)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_ehmm_balance</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_change_qty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_ehmm_min</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_ehmm_max</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_previous_stock_condition</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: string,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_current_stock_condition</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: string,</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Middle metrics (during period)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  middle_ehmm_duration</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,      </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Recovery duration in seconds</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  middle_ehmm_frequency</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Number of recoveries</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Closing snapshot (last transaction)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_ehmm_balance</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_change_qty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_ehmm_min</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_ehmm_max</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_current_stock_condition</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: string,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_previous_stock_condition</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: string,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_recovery_in_progress</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// 0 or 1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_recovery_start_flag</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// 0 or 1</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Offset calculations</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_offset_duration</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Seconds from period start to first txn</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_offset_duration</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Seconds from last txn to period end</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  opening_offset_frequency</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// 0 or 1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  closing_offset_frequency</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// 0 or 1</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Totals</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  total_duration_seconds</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number,    </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Sum of all recovery durations</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  total_frequency</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: number            </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Total number of recoveries</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h2 id="use-cases-and-insights" tabindex="-1">Use Cases and Insights <a class="header-anchor" href="#use-cases-and-insights" aria-label="Permalink to &quot;Use Cases and Insights&quot;">​</a></h2><h3 id="_1-supply-chain-performance" tabindex="-1">1. Supply Chain Performance <a class="header-anchor" href="#_1-supply-chain-performance" aria-label="Permalink to &quot;1. Supply Chain Performance&quot;">​</a></h3><p><strong>Question</strong>: How quickly can entities restock after running out?</p><p><strong>Metric</strong>: Average recovery duration</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">AVG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(total_duration_seconds) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 3600</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  -- Convert to hours</span></span></code></pre></div><p><strong>Insight</strong>: Entities with shorter recovery times have more efficient supply chains.</p><h3 id="_2-stockout-frequency" tabindex="-1">2. Stockout Frequency <a class="header-anchor" href="#_2-stockout-frequency" aria-label="Permalink to &quot;2. Stockout Frequency&quot;">​</a></h3><p><strong>Question</strong>: How often do entities experience stockouts?</p><p><strong>Metric</strong>: Recovery frequency</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">SUM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(total_frequency) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DISTINCT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entity_id)</span></span></code></pre></div><p><strong>Insight</strong>: Higher frequency indicates recurring stockout issues.</p><h3 id="_3-material-specific-challenges" tabindex="-1">3. Material-Specific Challenges <a class="header-anchor" href="#_3-material-specific-challenges" aria-label="Permalink to &quot;3. Material-Specific Challenges&quot;">​</a></h3><p><strong>Question</strong>: Which materials have the longest recovery times?</p><p><strong>Metric</strong>: Recovery duration by material</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GROUP BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> master_material_id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> AVG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(total_duration_seconds) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DESC</span></span></code></pre></div><p><strong>Insight</strong>: Materials with long recovery times may need buffer stock or alternative suppliers.</p><h3 id="_4-geographic-performance" tabindex="-1">4. Geographic Performance <a class="header-anchor" href="#_4-geographic-performance" aria-label="Permalink to &quot;4. Geographic Performance&quot;">​</a></h3><p><strong>Question</strong>: Which regions recover fastest from stockouts?</p><p><strong>Metric</strong>: Recovery duration by location</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GROUP BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> province_id, regency_id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> AVG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(total_duration_seconds) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ASC</span></span></code></pre></div><p><strong>Insight</strong>: Identifies regions with efficient vs. problematic logistics.</p><h3 id="_5-trend-analysis" tabindex="-1">5. Trend Analysis <a class="header-anchor" href="#_5-trend-analysis" aria-label="Permalink to &quot;5. Trend Analysis&quot;">​</a></h3><p><strong>Question</strong>: Are recovery times improving over time?</p><p><strong>Metric</strong>: Period-over-period comparison</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  period</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  AVG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(total_duration_seconds) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> avg_recovery_time</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">GROUP BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> period</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> period</span></span></code></pre></div><p><strong>Insight</strong>: Tracks effectiveness of supply chain improvements.</p><hr><h2 id="edge-cases-and-handling" tabindex="-1">Edge Cases and Handling <a class="header-anchor" href="#edge-cases-and-handling" aria-label="Permalink to &quot;Edge Cases and Handling&quot;">​</a></h2><h3 id="case-1-period-starts-with-zero" tabindex="-1">Case 1: Period Starts with Zero <a class="header-anchor" href="#case-1-period-starts-with-zero" aria-label="Permalink to &quot;Case 1: Period Starts with Zero&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Period: Jan 1 - Jan 31</span></span>
<span class="line"><span>First Transaction: Jan 1, 00:00 (zero state)</span></span></code></pre></div><p><strong>Handling</strong>: <code>opening_offset_duration</code> captures time from period start to first transaction if recovery is in progress.</p><h3 id="case-2-period-ends-before-recovery-completes" tabindex="-1">Case 2: Period Ends Before Recovery Completes <a class="header-anchor" href="#case-2-period-ends-before-recovery-completes" aria-label="Permalink to &quot;Case 2: Period Ends Before Recovery Completes&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Last Transaction: Jan 28 (zero state)</span></span>
<span class="line"><span>Period End: Jan 31, 23:59:59</span></span></code></pre></div><p><strong>Handling</strong>: <code>closing_offset_duration</code> captures time from last transaction to period end if recovery is in progress.</p><h3 id="case-3-no-recovery-in-period" tabindex="-1">Case 3: No Recovery in Period <a class="header-anchor" href="#case-3-no-recovery-in-period" aria-label="Permalink to &quot;Case 3: No Recovery in Period&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>All transactions: zero → min → max (never reaches normal)</span></span></code></pre></div><p><strong>Handling</strong>:</p><ul><li><code>total_frequency</code> = 0</li><li><code>total_duration_seconds</code> = 0</li><li><code>recovery_in_progress</code> may be 1 if still recovering</li></ul><h3 id="case-4-immediate-recovery" tabindex="-1">Case 4: Immediate Recovery <a class="header-anchor" href="#case-4-immediate-recovery" aria-label="Permalink to &quot;Case 4: Immediate Recovery&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>zero → normal (single transition)</span></span></code></pre></div><p><strong>Handling</strong>:</p><ul><li><code>total_frequency</code> = 1</li><li><code>total_duration_seconds</code> = time between two transactions</li></ul><h3 id="case-5-no-zero-state-in-period" tabindex="-1">Case 5: No Zero State in Period <a class="header-anchor" href="#case-5-no-zero-state-in-period" aria-label="Permalink to &quot;Case 5: No Zero State in Period&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>All transactions: normal → max → normal</span></span></code></pre></div><p><strong>Handling</strong>:</p><ul><li><code>total_frequency</code> = 0</li><li><code>total_duration_seconds</code> = 0</li><li>No recovery groups created</li></ul><hr><h2 id="comparison-with-other-transaction-types" tabindex="-1">Comparison with Other Transaction Types <a class="header-anchor" href="#comparison-with-other-transaction-types" aria-label="Permalink to &quot;Comparison with Other Transaction Types&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Transaction Type</th><th>What It Tracks</th><th>Duration Meaning</th><th>Frequency Meaning</th></tr></thead><tbody><tr><td><code>availability</code></td><td>Stock available (not zero)</td><td>Time spent with stock</td><td>Times stock became available</td></tr><tr><td><code>zero</code></td><td>Out of stock</td><td>Time spent at zero</td><td>Times stock ran out (24hr+)</td></tr><tr><td><code>min</code></td><td>Below minimum</td><td>Time spent below min</td><td>Times dropped below min (24hr+)</td></tr><tr><td><code>max</code></td><td>Above maximum</td><td>Time spent above max</td><td>Times exceeded max (24hr+)</td></tr><tr><td><strong><code>normal</code></strong></td><td><strong>Recovery to normal</strong></td><td><strong>Time to recover from zero</strong></td><td><strong>Number of recoveries</strong></td></tr></tbody></table><p><strong>Key Difference</strong>: <code>normal</code> type tracks the <strong>journey</strong> from zero to normal, while other types track <strong>time spent in a state</strong>.</p><hr><h2 id="version-history" tabindex="-1">Version History <a class="header-anchor" href="#version-history" aria-label="Permalink to &quot;Version History&quot;">​</a></h2><ul><li><strong>v1.0</strong> (Nov 2025): Initial implementation with multi-recovery support <ul><li>Track multiple recoveries per period</li><li>Ignore subsequent zeros during active recovery</li><li>Support for day/week/month periods</li><li>Opening/closing offset calculations</li></ul></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/dashboards/filling-stock-api.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var filling_stock_api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, filling_stock_api_default as default };
