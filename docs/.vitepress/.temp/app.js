import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { renderToString, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderVNode } from "vue/server-renderer";
import { Fragment, computed, createBlock, createCommentVNode, createSSRApp, createTextVNode, createVNode, customRef, defineAsyncComponent, defineComponent, getCurrentInstance, getCurrentScope, h, hasInjectionContext, inject, isRef, markRaw, mergeProps, nextTick, onBeforeUnmount, onMounted, onScopeDispose, onUnmounted, onUpdated, openBlock, provide, reactive, readonly, ref, renderList, renderSlot, resolveComponent, resolveDynamicComponent, shallowRef, toDisplayString, toHandlers, toRaw, toRef, toValue, unref, useSSRContext, useSlots, watch, watchEffect, watchPostEffect, withCtx, withKeys } from "vue";
import mermaid from "mermaid";
//#region ../node_modules/.pnpm/vitepress-plugin-mermaid@2.0.17_mermaid@11.17.2_vitepress@1.6.4_@algolia+client-search@5.59.0_zvtaqim3kemfsi2hx2gr2vmzge/node_modules/vitepress-plugin-mermaid/dist/mermaid.ts
var init = async (externalDiagrams) => {
	try {
		if (mermaid.registerExternalDiagrams) await mermaid.registerExternalDiagrams(externalDiagrams);
	} catch (e) {
		console.error(e);
	}
};
var render$1 = async (id, code, config) => {
	mermaid.initialize(config);
	const { svg } = await mermaid.render(id, code);
	return svg;
};
//#endregion
//#region ../../../../../../../@siteData
function deserializeFunctions(r) {
	return Array.isArray(r) ? r.map(deserializeFunctions) : typeof r == "object" && r !== null ? Object.keys(r).reduce((t, n) => (t[n] = deserializeFunctions(r[n]), t), {}) : typeof r == "string" && r.startsWith("_vp-fn_") ? new Function(`return ${r.slice(7)}`)() : r;
}
var _siteData_default = deserializeFunctions(JSON.parse("{\"lang\":\"en-US\",\"dir\":\"ltr\",\"title\":\"SMILE Platform Docs\",\"description\":\"Architecture, data model, and design documentation for the SMILE Platform.\",\"base\":\"/docs/\",\"head\":[],\"router\":{\"prefetchLinks\":true},\"appearance\":true,\"themeConfig\":{\"nav\":[{\"text\":\"Home\",\"link\":\"/\"},{\"text\":\"ERD\",\"link\":\"/ERD\"},{\"text\":\"Architecture\",\"link\":\"/architecture/platform-overview\"},{\"text\":\"Archive\",\"link\":\"/archive/documentation-audit-2025\"}],\"sidebar\":[{\"text\":\"SMILE Platform — Entity Relationship Diagram (ERD)\",\"link\":\"/ERD\"},{\"text\":\"Architecture\",\"items\":[{\"text\":\"Audit Trail Implementation Plan\",\"link\":\"/architecture/audit-trail\"},{\"text\":\"Cursor-Based Pagination Implementation Guide\",\"link\":\"/architecture/cursor-pagination\"},{\"text\":\"Race Condition Analysis — apps/main Backend\",\"link\":\"/architecture/race-conditions\"},{\"text\":\"Race Condition Analysis — Delayed / Irregular-Interval Duplication\",\"link\":\"/architecture/race-conditions-delayed\"},{\"text\":\"SAD — PEP Insertion | SMILE 5.0\",\"link\":\"/architecture/sad-pep-insertion\"},{\"text\":\"SMILE Platform Architecture Documentation\",\"link\":\"/architecture/platform-overview\"},{\"text\":\"Software Architecture Document: Cutoff Stock Opname\",\"link\":\"/architecture/cutoff-stock-opname-architecture\"},{\"text\":\"Auth\",\"items\":[{\"text\":\"Architecture Decision Record: Authentication and Authorization Management (RBAC)\",\"link\":\"/architecture/auth/authentication-rbac-en\"},{\"text\":\"Architecture Decision Record: Manajemen Autentikasi dan Otorisasi (RBAC)\",\"link\":\"/architecture/auth/authentication-rbac\"},{\"text\":\"Authentication\",\"link\":\"/architecture/auth/authentication\"}],\"collapsed\":true},{\"text\":\"Dashboards\",\"items\":[{\"text\":\"Abnormal Stock API Documentation\",\"link\":\"/architecture/dashboards/abnormal-stock-api\"},{\"text\":\"Consumption Supply API Documentation\",\"link\":\"/architecture/dashboards/consumption-supply-api\"},{\"text\":\"Stock Recovery Tracking API Documentation\",\"link\":\"/architecture/dashboards/filling-stock-api\"}],\"collapsed\":true},{\"text\":\"Database\",\"items\":[{\"text\":\"DB cleanup notes — Indonesia-only module removal\",\"link\":\"/architecture/database/db-cleanup-indonesia-only-removal\"},{\"text\":\"Migrations\",\"items\":[{\"text\":\"Database Migration Changelog\",\"link\":\"/architecture/database/migrations/core\"},{\"text\":\"Main App Database Migration Changelog\",\"link\":\"/architecture/database/migrations/main\"}],\"collapsed\":true}],\"collapsed\":true},{\"text\":\"Diagrams\",\"items\":[{\"text\":\"Auth Service - Component Diagram\",\"link\":\"/architecture/diagrams/auth-service-components\"},{\"text\":\"Container Diagram\",\"link\":\"/architecture/diagrams/containers\"},{\"text\":\"Core Service - Component Diagram\",\"link\":\"/architecture/diagrams/core-components\"},{\"text\":\"Executive Auth Flow Diagram\",\"link\":\"/architecture/diagrams/auth-executive-flow\"},{\"text\":\"Main Service - Component Diagram\",\"link\":\"/architecture/diagrams/main-components\"},{\"text\":\"System Context Diagram\",\"link\":\"/architecture/diagrams/system-context\"},{\"text\":\"Warehouse Service - Component Diagram\",\"link\":\"/architecture/diagrams/warehouse-service-components\"}],\"collapsed\":true,\"link\":\"/architecture/diagrams/index\"},{\"text\":\"Erd\",\"items\":[],\"collapsed\":true,\"link\":\"/architecture/erd/index\"},{\"text\":\"Feature Flags\",\"items\":[{\"text\":\"Feature Flags Implementation Flow\",\"link\":\"/architecture/feature-flags/feature-flags-diagram\"},{\"text\":\"Simple Feature Flags Implementation\",\"link\":\"/architecture/feature-flags/feature-flags-docs\"}],\"collapsed\":true},{\"text\":\"Interop Layer\",\"items\":[{\"text\":\"Adding a New Event or Downstream System\",\"link\":\"/architecture/interop-layer/adding-new-event\"},{\"text\":\"Configuration Reference\",\"link\":\"/architecture/interop-layer/configuration-reference\"},{\"text\":\"Interop Layer Architecture\",\"link\":\"/architecture/interop-layer/architecture\"},{\"text\":\"Operations Guide\",\"link\":\"/architecture/interop-layer/operations\"}],\"collapsed\":true,\"link\":\"/architecture/interop-layer/index\"},{\"text\":\"Migration\",\"items\":[{\"text\":\"Data Migration Overview\",\"link\":\"/architecture/migration/overview\"},{\"text\":\"Migration Constants Mapping\",\"link\":\"/architecture/migration/constants-mapping\"},{\"text\":\"SMILE 3.0 to 5.0 Data Migration Execution Order\",\"link\":\"/architecture/migration/migration-execution-order\"},{\"text\":\"SMILE 3.0 to 5.0 Database Migration - Source and Target Mapping\",\"link\":\"/architecture/migration/source-target-database-mapping\"},{\"text\":\"Global\",\"items\":[{\"text\":\"migrate-activity.ts\",\"link\":\"/architecture/migration/global/migrate-activity\"},{\"text\":\"migrate-budget-source.ts\",\"link\":\"/architecture/migration/global/migrate-budget-source\"},{\"text\":\"migrate-entity-bulk.ts\",\"link\":\"/architecture/migration/global/migrate-entity-bulk\"},{\"text\":\"migrate-location.ts\",\"link\":\"/architecture/migration/global/migrate-location\"},{\"text\":\"migrate-manufacture.ts\",\"link\":\"/architecture/migration/global/migrate-manufacture\"},{\"text\":\"migrate-material.ts\",\"link\":\"/architecture/migration/global/migrate-material\"},{\"text\":\"migrate-user-bulk.ts\",\"link\":\"/architecture/migration/global/migrate-user-bulk\"}],\"collapsed\":true},{\"text\":\"Workspace\",\"items\":[{\"text\":\"migrate-batches.ts\",\"link\":\"/architecture/migration/workspace/migrate-batches\"},{\"text\":\"migrate-patients.ts\",\"link\":\"/architecture/migration/workspace/migrate-patients\"},{\"text\":\"migrate-stock-opnames.ts\",\"link\":\"/architecture/migration/workspace/migrate-stock-opnames\"}],\"collapsed\":true}],\"collapsed\":true,\"link\":\"/architecture/migration/index\"},{\"text\":\"Operations\",\"items\":[{\"text\":\"Enhanced Infrastructure Observability\",\"link\":\"/architecture/operations/infrastructure-monitoring\"},{\"text\":\"Version Control Workflow\",\"link\":\"/architecture/operations/version-control-workflow\"}],\"collapsed\":true},{\"text\":\"Prd\",\"items\":[{\"text\":\"Set Material For So\",\"link\":\"/architecture/prd/set-material-for-so\"}],\"collapsed\":true},{\"text\":\"Shared Packages\",\"items\":[{\"text\":\"@smile-health/lib Package Documentation\",\"link\":\"/architecture/shared-packages/lib-documentation\"},{\"text\":\"Shared Packages\",\"link\":\"/architecture/shared-packages/shared-packages\"}],\"collapsed\":true},{\"text\":\"Special Endpoint\",\"items\":[{\"text\":\"Excel Export/Import Endpoints Documentation\",\"link\":\"/architecture/special-endpoint/excel-endpoints\"}],\"collapsed\":true},{\"text\":\"Testing\",\"items\":[{\"text\":\"AI API Testing Guidelines for Microservices\",\"link\":\"/architecture/testing/api-testing-mocha\"},{\"text\":\"Warehouse API Testing with Playwright\",\"link\":\"/architecture/testing/warehouse-playwright-api-tests\"}],\"collapsed\":true}],\"collapsed\":false},{\"text\":\"Archive\",\"items\":[{\"text\":\"ADR: processDataColdstorage Function Analysis\",\"link\":\"/archive/process-data-coldstorage-analysis\"},{\"text\":\"Count Transaction API Documentation\",\"link\":\"/archive/count-transaction-api\"},{\"text\":\"Dashboard Routine API Documentation\",\"link\":\"/archive/dashboard-routine-api\"},{\"text\":\"Database Models Used in Order Controller\",\"link\":\"/archive/database-models-sequelize\"},{\"text\":\"Database Models Used in Transaction Controller\",\"link\":\"/archive/database-models-transaction-sequelize\"},{\"text\":\"ETIMEDOUT Error Troubleshooting Guide\",\"link\":\"/archive/timeout-troubleshooting-sync-service\"},{\"text\":\"Monev API Documentation\",\"link\":\"/archive/monev-api\"},{\"text\":\"Service Status Dashboard\",\"link\":\"/archive/service-statuses\"},{\"text\":\"SMILE Platform Documentation Audit\",\"link\":\"/archive/documentation-audit-2025\"},{\"text\":\"Sync Service Database Migration Changelog\",\"link\":\"/archive/database-migrations-sync-service\"},{\"text\":\"Biofarma Order V3\",\"items\":[{\"text\":\"ADR: Biofarma Order Controller Cron Job Execution (v3.0)\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-cron.en\"},{\"text\":\"ADR: Eksekusi Cron Job Biofarma Order Controller (v3.0)\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-cron.id\"},{\"text\":\"Biofarma Order Integration via Interop Layer\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-interop\"},{\"text\":\"Documentation: Process Flow of Biofarma Order Controller (v3.0)\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-controller-process.en\"},{\"text\":\"Dokumentasi: Alur Proses Biofarma Order Controller (v3.0)\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-controller-process.id\"},{\"text\":\"Migration Guide: Implementing Biofarma Order Controller v3.0 to v5.0\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-v3-to-v5.en\"},{\"text\":\"Panduan Migrasi: Implementasi Biofarma Order Controller v3.0 ke v5.0\",\"link\":\"/archive/biofarma-order-v3/biofarma-order-v3-to-v5.id\"}],\"collapsed\":true},{\"text\":\"Siha Sitb\",\"items\":[{\"text\":\"SIHA/SITB Integration API – Technical Documentation (v1.0)\",\"link\":\"/archive/siha-sitb/siha-sitb-api-v1.0\"}],\"collapsed\":true}],\"collapsed\":false,\"link\":\"/archive/index\"}],\"search\":{\"provider\":\"local\"},\"outline\":[2,3],\"docFooter\":{\"prev\":\"Previous\",\"next\":\"Next\"},\"footer\":{\"message\":\"SMILE Platform — internal documentation\",\"copyright\":\"© 2026 SMILE Health\"}},\"locales\":{},\"scrollOffset\":134,\"cleanUrls\":false}"));
//#endregion
//#region ../node_modules/.pnpm/@vueuse+shared@12.8.2_typescript@5.9.3/node_modules/@vueuse/shared/index.mjs
function tryOnScopeDispose(fn) {
	if (getCurrentScope()) {
		onScopeDispose(fn);
		return true;
	}
	return false;
}
var localProvidedStateMap = /* @__PURE__ */ new WeakMap();
var injectLocal = (...args) => {
	var _a;
	const key = args[0];
	const instance = (_a = getCurrentInstance()) == null ? void 0 : _a.proxy;
	if (instance == null && !hasInjectionContext()) throw new Error("injectLocal must be called in setup");
	if (instance && localProvidedStateMap.has(instance) && key in localProvidedStateMap.get(instance)) return localProvidedStateMap.get(instance)[key];
	return inject(...args);
};
var isClient = typeof window !== "undefined" && typeof document !== "undefined";
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
var notNullish = (val) => val != null;
var toString = Object.prototype.toString;
var isObject = (val) => toString.call(val) === "[object Object]";
var noop = () => {};
var isIOS = /* @__PURE__ */ getIsIOS();
function getIsIOS() {
	var _a, _b;
	return isClient && ((_a = window == null ? void 0 : window.navigator) == null ? void 0 : _a.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((_b = window == null ? void 0 : window.navigator) == null ? void 0 : _b.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window == null ? void 0 : window.navigator.userAgent));
}
function createFilterWrapper(filter, fn) {
	function wrapper(...args) {
		return new Promise((resolve, reject) => {
			Promise.resolve(filter(() => fn.apply(this, args), {
				fn,
				thisArg: this,
				args
			})).then(resolve).catch(reject);
		});
	}
	return wrapper;
}
var bypassFilter = (invoke) => {
	return invoke();
};
function debounceFilter(ms, options = {}) {
	let timer;
	let maxTimer;
	let lastRejector = noop;
	const _clearTimeout = (timer2) => {
		clearTimeout(timer2);
		lastRejector();
		lastRejector = noop;
	};
	let lastInvoker;
	const filter = (invoke) => {
		const duration = toValue(ms);
		const maxDuration = toValue(options.maxWait);
		if (timer) _clearTimeout(timer);
		if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
			if (maxTimer) {
				_clearTimeout(maxTimer);
				maxTimer = null;
			}
			return Promise.resolve(invoke());
		}
		return new Promise((resolve, reject) => {
			lastRejector = options.rejectOnCancel ? reject : resolve;
			lastInvoker = invoke;
			if (maxDuration && !maxTimer) maxTimer = setTimeout(() => {
				if (timer) _clearTimeout(timer);
				maxTimer = null;
				resolve(lastInvoker());
			}, maxDuration);
			timer = setTimeout(() => {
				if (maxTimer) _clearTimeout(maxTimer);
				maxTimer = null;
				resolve(invoke());
			}, duration);
		});
	};
	return filter;
}
function throttleFilter(...args) {
	let lastExec = 0;
	let timer;
	let isLeading = true;
	let lastRejector = noop;
	let lastValue;
	let ms;
	let trailing;
	let leading;
	let rejectOnCancel;
	if (!isRef(args[0]) && typeof args[0] === "object") ({delay: ms, trailing = true, leading = true, rejectOnCancel = false} = args[0]);
	else [ms, trailing = true, leading = true, rejectOnCancel = false] = args;
	const clear = () => {
		if (timer) {
			clearTimeout(timer);
			timer = void 0;
			lastRejector();
			lastRejector = noop;
		}
	};
	const filter = (_invoke) => {
		const duration = toValue(ms);
		const elapsed = Date.now() - lastExec;
		const invoke = () => {
			return lastValue = _invoke();
		};
		clear();
		if (duration <= 0) {
			lastExec = Date.now();
			return invoke();
		}
		if (elapsed > duration && (leading || !isLeading)) {
			lastExec = Date.now();
			invoke();
		} else if (trailing) lastValue = new Promise((resolve, reject) => {
			lastRejector = rejectOnCancel ? reject : resolve;
			timer = setTimeout(() => {
				lastExec = Date.now();
				isLeading = true;
				resolve(invoke());
				clear();
			}, Math.max(0, duration - elapsed));
		});
		if (!leading && !timer) timer = setTimeout(() => isLeading = true, duration);
		isLeading = false;
		return lastValue;
	};
	return filter;
}
function pausableFilter(extendFilter = bypassFilter, options = {}) {
	const { initialState = "active" } = options;
	const isActive = toRef$1(initialState === "active");
	function pause() {
		isActive.value = false;
	}
	function resume() {
		isActive.value = true;
	}
	const eventFilter = (...args) => {
		if (isActive.value) extendFilter(...args);
	};
	return {
		isActive: readonly(isActive),
		pause,
		resume,
		eventFilter
	};
}
function pxValue(px) {
	return px.endsWith("rem") ? Number.parseFloat(px) * 16 : Number.parseFloat(px);
}
function getLifeCycleTarget(target) {
	return target || getCurrentInstance();
}
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
function toRef$1(...args) {
	if (args.length !== 1) return toRef(...args);
	const r = args[0];
	return typeof r === "function" ? readonly(customRef(() => ({
		get: r,
		set: noop
	}))) : ref(r);
}
function useDebounceFn(fn, ms = 200, options = {}) {
	return createFilterWrapper(debounceFilter(ms, options), fn);
}
function useThrottleFn(fn, ms = 200, trailing = false, leading = true, rejectOnCancel = false) {
	return createFilterWrapper(throttleFilter(ms, trailing, leading, rejectOnCancel), fn);
}
function watchWithFilter(source, cb, options = {}) {
	const { eventFilter = bypassFilter, ...watchOptions } = options;
	return watch(source, createFilterWrapper(eventFilter, cb), watchOptions);
}
function watchPausable(source, cb, options = {}) {
	const { eventFilter: filter, initialState = "active", ...watchOptions } = options;
	const { eventFilter, pause, resume, isActive } = pausableFilter(filter, { initialState });
	return {
		stop: watchWithFilter(source, cb, {
			...watchOptions,
			eventFilter
		}),
		pause,
		resume,
		isActive
	};
}
function tryOnMounted(fn, sync = true, target) {
	if (getLifeCycleTarget()) onMounted(fn, target);
	else if (sync) fn();
	else nextTick(fn);
}
function watchDebounced(source, cb, options = {}) {
	const { debounce = 0, maxWait = void 0, ...watchOptions } = options;
	return watchWithFilter(source, cb, {
		...watchOptions,
		eventFilter: debounceFilter(debounce, { maxWait })
	});
}
function watchImmediate(source, cb, options) {
	return watch(source, cb, {
		...options,
		immediate: true
	});
}
//#endregion
//#region ../node_modules/.pnpm/@vueuse+core@12.8.2_typescript@5.9.3/node_modules/@vueuse/core/index.mjs
function computedAsync(evaluationCallback, initialState, optionsOrRef) {
	let options;
	if (isRef(optionsOrRef)) options = { evaluating: optionsOrRef };
	else options = optionsOrRef || {};
	const { lazy = false, evaluating = void 0, shallow = true, onError = noop } = options;
	const started = shallowRef(!lazy);
	const current = shallow ? shallowRef(initialState) : ref(initialState);
	let counter = 0;
	watchEffect(async (onInvalidate) => {
		if (!started.value) return;
		counter++;
		const counterAtBeginning = counter;
		let hasFinished = false;
		if (evaluating) Promise.resolve().then(() => {
			evaluating.value = true;
		});
		try {
			const result = await evaluationCallback((cancelCallback) => {
				onInvalidate(() => {
					if (evaluating) evaluating.value = false;
					if (!hasFinished) cancelCallback();
				});
			});
			if (counterAtBeginning === counter) current.value = result;
		} catch (e) {
			onError(e);
		} finally {
			if (evaluating && counterAtBeginning === counter) evaluating.value = false;
			hasFinished = true;
		}
	});
	if (lazy) return computed(() => {
		started.value = true;
		return current.value;
	});
	else return current;
}
var defaultWindow = isClient ? window : void 0;
isClient && window.document;
isClient && window.navigator;
isClient && window.location;
function unrefElement(elRef) {
	var _a;
	const plain = toValue(elRef);
	return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}
function useEventListener(...args) {
	const cleanups = [];
	const cleanup = () => {
		cleanups.forEach((fn) => fn());
		cleanups.length = 0;
	};
	const register = (el, event, listener, options) => {
		el.addEventListener(event, listener, options);
		return () => el.removeEventListener(event, listener, options);
	};
	const firstParamTargets = computed(() => {
		const test = toArray(toValue(args[0])).filter((e) => e != null);
		return test.every((e) => typeof e !== "string") ? test : void 0;
	});
	const stopWatch = watchImmediate(() => {
		var _a, _b;
		return [
			(_b = (_a = firstParamTargets.value) == null ? void 0 : _a.map((e) => unrefElement(e))) != null ? _b : [defaultWindow].filter((e) => e != null),
			toArray(toValue(firstParamTargets.value ? args[1] : args[0])),
			toArray(unref(firstParamTargets.value ? args[2] : args[1])),
			toValue(firstParamTargets.value ? args[3] : args[2])
		];
	}, ([raw_targets, raw_events, raw_listeners, raw_options]) => {
		cleanup();
		if (!(raw_targets == null ? void 0 : raw_targets.length) || !(raw_events == null ? void 0 : raw_events.length) || !(raw_listeners == null ? void 0 : raw_listeners.length)) return;
		const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
		cleanups.push(...raw_targets.flatMap((el) => raw_events.flatMap((event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone)))));
	}, { flush: "post" });
	const stop = () => {
		stopWatch();
		cleanup();
	};
	tryOnScopeDispose(cleanup);
	return stop;
}
function useMounted() {
	const isMounted = shallowRef(false);
	const instance = getCurrentInstance();
	if (instance) onMounted(() => {
		isMounted.value = true;
	}, instance);
	return isMounted;
}
function useSupported(callback) {
	const isMounted = useMounted();
	return computed(() => {
		isMounted.value;
		return Boolean(callback());
	});
}
function createKeyPredicate(keyFilter) {
	if (typeof keyFilter === "function") return keyFilter;
	else if (typeof keyFilter === "string") return (event) => event.key === keyFilter;
	else if (Array.isArray(keyFilter)) return (event) => keyFilter.includes(event.key);
	return () => true;
}
function onKeyStroke(...args) {
	let key;
	let handler;
	let options = {};
	if (args.length === 3) {
		key = args[0];
		handler = args[1];
		options = args[2];
	} else if (args.length === 2) if (typeof args[1] === "object") {
		key = true;
		handler = args[0];
		options = args[1];
	} else {
		key = args[0];
		handler = args[1];
	}
	else {
		key = true;
		handler = args[0];
	}
	const { target = defaultWindow, eventName = "keydown", passive = false, dedupe = false } = options;
	const predicate = createKeyPredicate(key);
	const listener = (e) => {
		if (e.repeat && toValue(dedupe)) return;
		if (predicate(e)) handler(e);
	};
	return useEventListener(target, eventName, listener, passive);
}
var ssrWidthSymbol = Symbol("vueuse-ssr-width");
function useSSRWidth() {
	const ssrWidth = hasInjectionContext() ? injectLocal(ssrWidthSymbol, null) : null;
	return typeof ssrWidth === "number" ? ssrWidth : void 0;
}
function useMediaQuery(query, options = {}) {
	const { window = defaultWindow, ssrWidth = useSSRWidth() } = options;
	const isSupported = useSupported(() => window && "matchMedia" in window && typeof window.matchMedia === "function");
	const ssrSupport = shallowRef(typeof ssrWidth === "number");
	const mediaQuery = shallowRef();
	const matches = shallowRef(false);
	const handler = (event) => {
		matches.value = event.matches;
	};
	watchEffect(() => {
		if (ssrSupport.value) {
			ssrSupport.value = !isSupported.value;
			const queryStrings = toValue(query).split(",");
			matches.value = queryStrings.some((queryString) => {
				const not = queryString.includes("not all");
				const minWidth = queryString.match(/\(\s*min-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
				const maxWidth = queryString.match(/\(\s*max-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
				let res = Boolean(minWidth || maxWidth);
				if (minWidth && res) res = ssrWidth >= pxValue(minWidth[1]);
				if (maxWidth && res) res = ssrWidth <= pxValue(maxWidth[1]);
				return not ? !res : res;
			});
			return;
		}
		if (!isSupported.value) return;
		mediaQuery.value = window.matchMedia(toValue(query));
		matches.value = mediaQuery.value.matches;
	});
	useEventListener(mediaQuery, "change", handler, { passive: true });
	return computed(() => matches.value);
}
var _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var globalKey = "__vueuse_ssr_handlers__";
var handlers = /* @__PURE__ */ getHandlers();
function getHandlers() {
	if (!(globalKey in _global)) _global[globalKey] = _global[globalKey] || {};
	return _global[globalKey];
}
function getSSRHandler(key, fallback) {
	return handlers[key] || fallback;
}
function usePreferredDark(options) {
	return useMediaQuery("(prefers-color-scheme: dark)", options);
}
function guessSerializerType(rawInit) {
	return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
}
var StorageSerializers = {
	boolean: {
		read: (v) => v === "true",
		write: (v) => String(v)
	},
	object: {
		read: (v) => JSON.parse(v),
		write: (v) => JSON.stringify(v)
	},
	number: {
		read: (v) => Number.parseFloat(v),
		write: (v) => String(v)
	},
	any: {
		read: (v) => v,
		write: (v) => String(v)
	},
	string: {
		read: (v) => v,
		write: (v) => String(v)
	},
	map: {
		read: (v) => new Map(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v.entries()))
	},
	set: {
		read: (v) => new Set(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v))
	},
	date: {
		read: (v) => new Date(v),
		write: (v) => v.toISOString()
	}
};
var customStorageEventName = "vueuse-storage";
function useStorage(key, defaults, storage, options = {}) {
	var _a;
	const { flush = "pre", deep = true, listenToStorageChanges = true, writeDefaults = true, mergeDefaults = false, shallow, window = defaultWindow, eventFilter, onError = (e) => {
		console.error(e);
	}, initOnMounted } = options;
	const data = (shallow ? shallowRef : ref)(typeof defaults === "function" ? defaults() : defaults);
	const keyComputed = computed(() => toValue(key));
	if (!storage) try {
		storage = getSSRHandler("getDefaultStorage", () => {
			var _a2;
			return (_a2 = defaultWindow) == null ? void 0 : _a2.localStorage;
		})();
	} catch (e) {
		onError(e);
	}
	if (!storage) return data;
	const rawInit = toValue(defaults);
	const type = guessSerializerType(rawInit);
	const serializer = (_a = options.serializer) != null ? _a : StorageSerializers[type];
	const { pause: pauseWatch, resume: resumeWatch } = watchPausable(data, () => write(data.value), {
		flush,
		deep,
		eventFilter
	});
	watch(keyComputed, () => update(), { flush });
	if (window && listenToStorageChanges) tryOnMounted(() => {
		if (storage instanceof Storage) useEventListener(window, "storage", update, { passive: true });
		else useEventListener(window, customStorageEventName, updateFromCustomEvent);
		if (initOnMounted) update();
	});
	if (!initOnMounted) update();
	function dispatchWriteEvent(oldValue, newValue) {
		if (window) {
			const payload = {
				key: keyComputed.value,
				oldValue,
				newValue,
				storageArea: storage
			};
			window.dispatchEvent(storage instanceof Storage ? new StorageEvent("storage", payload) : new CustomEvent(customStorageEventName, { detail: payload }));
		}
	}
	function write(v) {
		try {
			const oldValue = storage.getItem(keyComputed.value);
			if (v == null) {
				dispatchWriteEvent(oldValue, null);
				storage.removeItem(keyComputed.value);
			} else {
				const serialized = serializer.write(v);
				if (oldValue !== serialized) {
					storage.setItem(keyComputed.value, serialized);
					dispatchWriteEvent(oldValue, serialized);
				}
			}
		} catch (e) {
			onError(e);
		}
	}
	function read(event) {
		const rawValue = event ? event.newValue : storage.getItem(keyComputed.value);
		if (rawValue == null) {
			if (writeDefaults && rawInit != null) storage.setItem(keyComputed.value, serializer.write(rawInit));
			return rawInit;
		} else if (!event && mergeDefaults) {
			const value = serializer.read(rawValue);
			if (typeof mergeDefaults === "function") return mergeDefaults(value, rawInit);
			else if (type === "object" && !Array.isArray(value)) return {
				...rawInit,
				...value
			};
			return value;
		} else if (typeof rawValue !== "string") return rawValue;
		else return serializer.read(rawValue);
	}
	function update(event) {
		if (event && event.storageArea !== storage) return;
		if (event && event.key == null) {
			data.value = rawInit;
			return;
		}
		if (event && event.key !== keyComputed.value) return;
		pauseWatch();
		try {
			if ((event == null ? void 0 : event.newValue) !== serializer.write(data.value)) data.value = read(event);
		} catch (e) {
			onError(e);
		} finally {
			if (event) nextTick(resumeWatch);
			else resumeWatch();
		}
	}
	function updateFromCustomEvent(event) {
		update(event.detail);
	}
	return data;
}
var CSS_DISABLE_TRANS = "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
function useColorMode(options = {}) {
	const { selector = "html", attribute = "class", initialValue = "auto", window = defaultWindow, storage, storageKey = "vueuse-color-scheme", listenToStorageChanges = true, storageRef, emitAuto, disableTransition = true } = options;
	const modes = {
		auto: "",
		light: "light",
		dark: "dark",
		...options.modes || {}
	};
	const preferredDark = usePreferredDark({ window });
	const system = computed(() => preferredDark.value ? "dark" : "light");
	const store = storageRef || (storageKey == null ? toRef$1(initialValue) : useStorage(storageKey, initialValue, storage, {
		window,
		listenToStorageChanges
	}));
	const state = computed(() => store.value === "auto" ? system.value : store.value);
	const updateHTMLAttrs = getSSRHandler("updateHTMLAttrs", (selector2, attribute2, value) => {
		const el = typeof selector2 === "string" ? window == null ? void 0 : window.document.querySelector(selector2) : unrefElement(selector2);
		if (!el) return;
		const classesToAdd = /* @__PURE__ */ new Set();
		const classesToRemove = /* @__PURE__ */ new Set();
		let attributeToChange = null;
		if (attribute2 === "class") {
			const current = value.split(/\s/g);
			Object.values(modes).flatMap((i) => (i || "").split(/\s/g)).filter(Boolean).forEach((v) => {
				if (current.includes(v)) classesToAdd.add(v);
				else classesToRemove.add(v);
			});
		} else attributeToChange = {
			key: attribute2,
			value
		};
		if (classesToAdd.size === 0 && classesToRemove.size === 0 && attributeToChange === null) return;
		let style;
		if (disableTransition) {
			style = window.document.createElement("style");
			style.appendChild(document.createTextNode(CSS_DISABLE_TRANS));
			window.document.head.appendChild(style);
		}
		for (const c of classesToAdd) el.classList.add(c);
		for (const c of classesToRemove) el.classList.remove(c);
		if (attributeToChange) el.setAttribute(attributeToChange.key, attributeToChange.value);
		if (disableTransition) {
			window.getComputedStyle(style).opacity;
			document.head.removeChild(style);
		}
	});
	function defaultOnChanged(mode) {
		var _a;
		updateHTMLAttrs(selector, attribute, (_a = modes[mode]) != null ? _a : mode);
	}
	function onChanged(mode) {
		if (options.onChanged) options.onChanged(mode, defaultOnChanged);
		else defaultOnChanged(mode);
	}
	watch(state, onChanged, {
		flush: "post",
		immediate: true
	});
	tryOnMounted(() => onChanged(state.value));
	const auto = computed({
		get() {
			return emitAuto ? store.value : state.value;
		},
		set(v) {
			store.value = v;
		}
	});
	return Object.assign(auto, {
		store,
		system,
		state
	});
}
function useDark(options = {}) {
	const { valueDark = "dark", valueLight = "" } = options;
	const mode = useColorMode({
		...options,
		onChanged: (mode2, defaultHandler) => {
			var _a;
			if (options.onChanged) (_a = options.onChanged) == null || _a.call(options, mode2 === "dark", defaultHandler, mode2);
			else defaultHandler(mode2);
		},
		modes: {
			dark: valueDark,
			light: valueLight
		}
	});
	const system = computed(() => mode.system.value);
	return computed({
		get() {
			return mode.value === "dark";
		},
		set(v) {
			const modeVal = v ? "dark" : "light";
			if (system.value === modeVal) mode.value = "auto";
			else mode.value = modeVal;
		}
	});
}
function resolveElement(el) {
	if (typeof Window !== "undefined" && el instanceof Window) return el.document.documentElement;
	if (typeof Document !== "undefined" && el instanceof Document) return el.documentElement;
	return el;
}
var ARRIVED_STATE_THRESHOLD_PIXELS = 1;
function useScroll(element, options = {}) {
	const { throttle = 0, idle = 200, onStop = noop, onScroll = noop, offset = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}, eventListenerOptions = {
		capture: false,
		passive: true
	}, behavior = "auto", window = defaultWindow, onError = (e) => {
		console.error(e);
	} } = options;
	const internalX = shallowRef(0);
	const internalY = shallowRef(0);
	const x = computed({
		get() {
			return internalX.value;
		},
		set(x2) {
			scrollTo(x2, void 0);
		}
	});
	const y = computed({
		get() {
			return internalY.value;
		},
		set(y2) {
			scrollTo(void 0, y2);
		}
	});
	function scrollTo(_x, _y) {
		var _a, _b, _c, _d;
		if (!window) return;
		const _element = toValue(element);
		if (!_element) return;
		(_c = _element instanceof Document ? window.document.body : _element) == null || _c.scrollTo({
			top: (_a = toValue(_y)) != null ? _a : y.value,
			left: (_b = toValue(_x)) != null ? _b : x.value,
			behavior: toValue(behavior)
		});
		const scrollContainer = ((_d = _element == null ? void 0 : _element.document) == null ? void 0 : _d.documentElement) || (_element == null ? void 0 : _element.documentElement) || _element;
		if (x != null) internalX.value = scrollContainer.scrollLeft;
		if (y != null) internalY.value = scrollContainer.scrollTop;
	}
	const isScrolling = shallowRef(false);
	const arrivedState = reactive({
		left: true,
		right: false,
		top: true,
		bottom: false
	});
	const directions = reactive({
		left: false,
		right: false,
		top: false,
		bottom: false
	});
	const onScrollEnd = (e) => {
		if (!isScrolling.value) return;
		isScrolling.value = false;
		directions.left = false;
		directions.right = false;
		directions.top = false;
		directions.bottom = false;
		onStop(e);
	};
	const onScrollEndDebounced = useDebounceFn(onScrollEnd, throttle + idle);
	const setArrivedState = (target) => {
		var _a;
		if (!window) return;
		const el = ((_a = target == null ? void 0 : target.document) == null ? void 0 : _a.documentElement) || (target == null ? void 0 : target.documentElement) || unrefElement(target);
		const { display, flexDirection, direction } = getComputedStyle(el);
		const directionMultipler = direction === "rtl" ? -1 : 1;
		const scrollLeft = el.scrollLeft;
		directions.left = scrollLeft < internalX.value;
		directions.right = scrollLeft > internalX.value;
		const left = Math.abs(scrollLeft * directionMultipler) <= (offset.left || 0);
		const right = Math.abs(scrollLeft * directionMultipler) + el.clientWidth >= el.scrollWidth - (offset.right || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;
		if (display === "flex" && flexDirection === "row-reverse") {
			arrivedState.left = right;
			arrivedState.right = left;
		} else {
			arrivedState.left = left;
			arrivedState.right = right;
		}
		internalX.value = scrollLeft;
		let scrollTop = el.scrollTop;
		if (target === window.document && !scrollTop) scrollTop = window.document.body.scrollTop;
		directions.top = scrollTop < internalY.value;
		directions.bottom = scrollTop > internalY.value;
		const top = Math.abs(scrollTop) <= (offset.top || 0);
		const bottom = Math.abs(scrollTop) + el.clientHeight >= el.scrollHeight - (offset.bottom || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;
		if (display === "flex" && flexDirection === "column-reverse") {
			arrivedState.top = bottom;
			arrivedState.bottom = top;
		} else {
			arrivedState.top = top;
			arrivedState.bottom = bottom;
		}
		internalY.value = scrollTop;
	};
	const onScrollHandler = (e) => {
		var _a;
		if (!window) return;
		const eventTarget = (_a = e.target.documentElement) != null ? _a : e.target;
		setArrivedState(eventTarget);
		isScrolling.value = true;
		onScrollEndDebounced(e);
		onScroll(e);
	};
	useEventListener(element, "scroll", throttle ? useThrottleFn(onScrollHandler, throttle, true, false) : onScrollHandler, eventListenerOptions);
	tryOnMounted(() => {
		try {
			const _element = toValue(element);
			if (!_element) return;
			setArrivedState(_element);
		} catch (e) {
			onError(e);
		}
	});
	useEventListener(element, "scrollend", onScrollEnd, eventListenerOptions);
	return {
		x,
		y,
		isScrolling,
		arrivedState,
		directions,
		measure() {
			const _element = toValue(element);
			if (window && _element) setArrivedState(_element);
		}
	};
}
function useLocalStorage(key, initialValue, options = {}) {
	const { window = defaultWindow } = options;
	return useStorage(key, initialValue, window == null ? void 0 : window.localStorage, options);
}
function checkOverflowScroll(ele) {
	const style = window.getComputedStyle(ele);
	if (style.overflowX === "scroll" || style.overflowY === "scroll" || style.overflowX === "auto" && ele.clientWidth < ele.scrollWidth || style.overflowY === "auto" && ele.clientHeight < ele.scrollHeight) return true;
	else {
		const parent = ele.parentNode;
		if (!parent || parent.tagName === "BODY") return false;
		return checkOverflowScroll(parent);
	}
}
function preventDefault(rawEvent) {
	const e = rawEvent || window.event;
	const _target = e.target;
	if (checkOverflowScroll(_target)) return false;
	if (e.touches.length > 1) return true;
	if (e.preventDefault) e.preventDefault();
	return false;
}
var elInitialOverflow = /* @__PURE__ */ new WeakMap();
function useScrollLock(element, initialState = false) {
	const isLocked = shallowRef(initialState);
	let stopTouchMoveListener = null;
	let initialOverflow = "";
	watch(toRef$1(element), (el) => {
		const target = resolveElement(toValue(el));
		if (target) {
			const ele = target;
			if (!elInitialOverflow.get(ele)) elInitialOverflow.set(ele, ele.style.overflow);
			if (ele.style.overflow !== "hidden") initialOverflow = ele.style.overflow;
			if (ele.style.overflow === "hidden") return isLocked.value = true;
			if (isLocked.value) return ele.style.overflow = "hidden";
		}
	}, { immediate: true });
	const lock = () => {
		const el = resolveElement(toValue(element));
		if (!el || isLocked.value) return;
		if (isIOS) stopTouchMoveListener = useEventListener(el, "touchmove", (e) => {
			preventDefault(e);
		}, { passive: false });
		el.style.overflow = "hidden";
		isLocked.value = true;
	};
	const unlock = () => {
		const el = resolveElement(toValue(element));
		if (!el || !isLocked.value) return;
		if (isIOS) stopTouchMoveListener?.();
		el.style.overflow = initialOverflow;
		elInitialOverflow.delete(el);
		isLocked.value = false;
	};
	tryOnScopeDispose(unlock);
	return computed({
		get() {
			return isLocked.value;
		},
		set(v) {
			if (v) lock();
			else unlock();
		}
	});
}
function useSessionStorage(key, initialValue, options = {}) {
	const { window = defaultWindow } = options;
	return useStorage(key, initialValue, window == null ? void 0 : window.sessionStorage, options);
}
Number.POSITIVE_INFINITY;
function useWindowScroll(options = {}) {
	const { window = defaultWindow, ...rest } = options;
	return useScroll(window, rest);
}
function useWindowSize(options = {}) {
	const { window = defaultWindow, initialWidth = Number.POSITIVE_INFINITY, initialHeight = Number.POSITIVE_INFINITY, listenOrientation = true, includeScrollbar = true, type = "inner" } = options;
	const width = shallowRef(initialWidth);
	const height = shallowRef(initialHeight);
	const update = () => {
		if (window) if (type === "outer") {
			width.value = window.outerWidth;
			height.value = window.outerHeight;
		} else if (type === "visual" && window.visualViewport) {
			const { width: visualViewportWidth, height: visualViewportHeight, scale } = window.visualViewport;
			width.value = Math.round(visualViewportWidth * scale);
			height.value = Math.round(visualViewportHeight * scale);
		} else if (includeScrollbar) {
			width.value = window.innerWidth;
			height.value = window.innerHeight;
		} else {
			width.value = window.document.documentElement.clientWidth;
			height.value = window.document.documentElement.clientHeight;
		}
	};
	update();
	tryOnMounted(update);
	const listenerOptions = { passive: true };
	useEventListener("resize", update, listenerOptions);
	if (window && type === "visual" && window.visualViewport) useEventListener(window.visualViewport, "resize", update, listenerOptions);
	if (listenOrientation) {
		const matches = useMediaQuery("(orientation: portrait)");
		watch(matches, () => update());
	}
	return {
		width,
		height
	};
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/shared.js
var EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
var APPEARANCE_KEY = "vitepress-theme-appearance";
var HASH_RE = /#.*$/;
var HASH_OR_QUERY_RE = /[?#].*$/;
var INDEX_OR_EXT_RE = /(?:(^|\/)index)?\.(?:md|html)$/;
var inBrowser = typeof document !== "undefined";
var notFoundPageData = {
	relativePath: "404.md",
	filePath: "",
	title: "404",
	description: "Not Found",
	headers: [],
	frontmatter: {
		sidebar: false,
		layout: "page"
	},
	lastUpdated: 0,
	isNotFound: true
};
function isActive(currentPath, matchPath, asRegex = false) {
	if (matchPath === void 0) return false;
	currentPath = normalize(`/${currentPath}`);
	if (asRegex) return new RegExp(matchPath).test(currentPath);
	if (normalize(matchPath) !== currentPath) return false;
	const hashMatch = matchPath.match(HASH_RE);
	if (hashMatch) return (inBrowser ? location.hash : "") === hashMatch[0];
	return true;
}
function normalize(path) {
	return decodeURI(path).replace(HASH_OR_QUERY_RE, "").replace(INDEX_OR_EXT_RE, "$1");
}
function isExternal(path) {
	return EXTERNAL_URL_RE.test(path);
}
function getLocaleForPath(siteData, relativePath) {
	return Object.keys(siteData?.locales || {}).find((key) => key !== "root" && !isExternal(key) && isActive(relativePath, `/${key}/`, true)) || "root";
}
/**
* this merges the locales data to the main data by the route
*/
function resolveSiteDataByRoute(siteData, relativePath) {
	const localeIndex = getLocaleForPath(siteData, relativePath);
	return Object.assign({}, siteData, {
		localeIndex,
		lang: siteData.locales[localeIndex]?.lang ?? siteData.lang,
		dir: siteData.locales[localeIndex]?.dir ?? siteData.dir,
		title: siteData.locales[localeIndex]?.title ?? siteData.title,
		titleTemplate: siteData.locales[localeIndex]?.titleTemplate ?? siteData.titleTemplate,
		description: siteData.locales[localeIndex]?.description ?? siteData.description,
		head: mergeHead(siteData.head, siteData.locales[localeIndex]?.head ?? []),
		themeConfig: {
			...siteData.themeConfig,
			...siteData.locales[localeIndex]?.themeConfig
		}
	});
}
/**
* Create the page title string based on config.
*/
function createTitle(siteData, pageData) {
	const title = pageData.title || siteData.title;
	const template = pageData.titleTemplate ?? siteData.titleTemplate;
	if (typeof template === "string" && template.includes(":title")) return template.replace(/:title/g, title);
	const templateString = createTitleTemplate(siteData.title, template);
	if (title === templateString.slice(3)) return title;
	return `${title}${templateString}`;
}
function createTitleTemplate(siteTitle, template) {
	if (template === false) return "";
	if (template === true || template === void 0) return ` | ${siteTitle}`;
	if (siteTitle === template) return "";
	return ` | ${template}`;
}
function hasTag(head, tag) {
	const [tagType, tagAttrs] = tag;
	if (tagType !== "meta") return false;
	const keyAttr = Object.entries(tagAttrs)[0];
	if (keyAttr == null) return false;
	return head.some(([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]);
}
function mergeHead(prev, curr) {
	return [...prev.filter((tagAttrs) => !hasTag(curr, tagAttrs)), ...curr];
}
var INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
var DRIVE_LETTER_REGEX = /^[a-z]:/i;
function sanitizeFileName(name) {
	const match = DRIVE_LETTER_REGEX.exec(name);
	const driveLetter = match ? match[0] : "";
	return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "_").replace(/(^|\/)_+(?=[^/]*$)/, "$1");
}
var KNOWN_EXTENSIONS = /* @__PURE__ */ new Set();
function treatAsHtml(filename) {
	if (KNOWN_EXTENSIONS.size === 0) {
		const extraExts = typeof process === "object" && process.env?.VITE_EXTRA_EXTENSIONS || "";
		("3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,yaml,yml,zip" + (extraExts && typeof extraExts === "string" ? "," + extraExts : "")).split(",").forEach((ext) => KNOWN_EXTENSIONS.add(ext));
	}
	const ext = filename.split(".").pop();
	return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}
function escapeRegExp(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/data.js
var dataSymbol = Symbol();
var siteDataRef = shallowRef(_siteData_default);
function initData(route) {
	const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath));
	const appearance = site.value.appearance;
	const isDark = appearance === "force-dark" ? ref(true) : appearance === "force-auto" ? usePreferredDark() : appearance ? useDark({
		storageKey: APPEARANCE_KEY,
		initialValue: () => appearance === "dark" ? "dark" : "auto",
		...typeof appearance === "object" ? appearance : {}
	}) : ref(false);
	const hashRef = ref(inBrowser ? location.hash : "");
	if (inBrowser) window.addEventListener("hashchange", () => {
		hashRef.value = location.hash;
	});
	watch(() => route.data, () => {
		hashRef.value = inBrowser ? location.hash : "";
	});
	return {
		site,
		theme: computed(() => site.value.themeConfig),
		page: computed(() => route.data),
		frontmatter: computed(() => route.data.frontmatter),
		params: computed(() => route.data.params),
		lang: computed(() => site.value.lang),
		dir: computed(() => route.data.frontmatter.dir || site.value.dir),
		localeIndex: computed(() => site.value.localeIndex || "root"),
		title: computed(() => createTitle(site.value, route.data)),
		description: computed(() => route.data.description || site.value.description),
		isDark,
		hash: computed(() => hashRef.value)
	};
}
function useData$1() {
	const data = inject(dataSymbol);
	if (!data) throw new Error("vitepress data not properly injected in app");
	return data;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/utils.js
/**
* Join two paths by resolving the slash collision.
*/
function joinPath(base, path) {
	return `${base}${path}`.replace(/\/+/g, "/");
}
/**
* Append base to internal (non-relative) urls
*/
function withBase(path) {
	return EXTERNAL_URL_RE.test(path) || !path.startsWith("/") ? path : joinPath(siteDataRef.value.base, path);
}
/**
* Converts a url path to the corresponding js chunk filename.
*/
function pathToFile(path) {
	let pagePath = path.replace(/\.html$/, "");
	pagePath = decodeURIComponent(pagePath);
	pagePath = pagePath.replace(/\/$/, "/index");
	if (inBrowser) {
		const base = "/docs/";
		pagePath = sanitizeFileName(pagePath.slice(6).replace(/\//g, "_") || "index") + ".md";
		let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		if (!pageHash) {
			pagePath = pagePath.endsWith("_index.md") ? pagePath.slice(0, -9) + ".md" : pagePath.slice(0, -3) + "_index.md";
			pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		}
		if (!pageHash) return null;
		pagePath = `${base}assets/${pagePath}.${pageHash}.js`;
	} else pagePath = `./${sanitizeFileName(pagePath.slice(1).replace(/\//g, "_"))}.md.js`;
	return pagePath;
}
var contentUpdatedCallbacks = [];
/**
* Register callback that is called every time the markdown content is updated
* in the DOM.
*/
function onContentUpdated(fn) {
	contentUpdatedCallbacks.push(fn);
	onUnmounted(() => {
		contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn);
	});
}
function getScrollOffset() {
	let scrollOffset = siteDataRef.value.scrollOffset;
	let offset = 0;
	let padding = 24;
	if (typeof scrollOffset === "object" && "padding" in scrollOffset) {
		padding = scrollOffset.padding;
		scrollOffset = scrollOffset.selector;
	}
	if (typeof scrollOffset === "number") offset = scrollOffset;
	else if (typeof scrollOffset === "string") offset = tryOffsetSelector(scrollOffset, padding);
	else if (Array.isArray(scrollOffset)) for (const selector of scrollOffset) {
		const res = tryOffsetSelector(selector, padding);
		if (res) {
			offset = res;
			break;
		}
	}
	return offset;
}
function tryOffsetSelector(selector, padding) {
	const el = document.querySelector(selector);
	if (!el) return 0;
	const bot = el.getBoundingClientRect().bottom;
	if (bot < 0) return 0;
	return bot + padding;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/router.js
var RouterSymbol = Symbol();
var fakeHost = "http://a.com";
var getDefaultRoute = () => ({
	path: "/",
	component: null,
	data: notFoundPageData
});
function createRouter(loadPageModule, fallbackComponent) {
	const route = reactive(getDefaultRoute());
	const router = {
		route,
		go
	};
	async function go(href = inBrowser ? location.href : "/") {
		href = normalizeHref(href);
		if (await router.onBeforeRouteChange?.(href) === false) return;
		if (inBrowser && href !== normalizeHref(location.href)) {
			history.replaceState({ scrollPosition: window.scrollY }, "");
			history.pushState({}, "", href);
		}
		await loadPage(href);
		await (router.onAfterRouteChange ?? router.onAfterRouteChanged)?.(href);
	}
	let latestPendingPath = null;
	async function loadPage(href, scrollPosition = 0, isRetry = false) {
		if (await router.onBeforePageLoad?.(href) === false) return;
		const targetLoc = new URL(href, fakeHost);
		const pendingPath = latestPendingPath = targetLoc.pathname;
		try {
			let page = await loadPageModule(pendingPath);
			if (!page) throw new Error(`Page not found: ${pendingPath}`);
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				const { default: comp, __pageData } = page;
				if (!comp) throw new Error(`Invalid route component: ${comp}`);
				await router.onAfterPageLoad?.(href);
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = markRaw(comp);
				route.data = markRaw(__pageData);
				if (inBrowser) nextTick(() => {
					let actualPathname = siteDataRef.value.base + __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, "$1");
					if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith("/")) actualPathname += ".html";
					if (actualPathname !== targetLoc.pathname) {
						targetLoc.pathname = actualPathname;
						href = actualPathname + targetLoc.search + targetLoc.hash;
						history.replaceState({}, "", href);
					}
					if (targetLoc.hash && !scrollPosition) {
						let target = null;
						try {
							target = document.getElementById(decodeURIComponent(targetLoc.hash).slice(1));
						} catch (e) {
							console.warn(e);
						}
						if (target) {
							scrollTo(target, targetLoc.hash);
							return;
						}
					}
					window.scrollTo(0, scrollPosition);
				});
			}
		} catch (err) {
			if (!/fetch|Page not found/.test(err.message) && !/^\/404(\.html|\/)?$/.test(href)) console.error(err);
			if (!isRetry) try {
				const res = await fetch(siteDataRef.value.base + "hashmap.json");
				window.__VP_HASH_MAP__ = await res.json();
				await loadPage(href, scrollPosition, true);
				return;
			} catch (e) {}
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = fallbackComponent ? markRaw(fallbackComponent) : null;
				const relativePath = inBrowser ? pendingPath.replace(/(^|\/)$/, "$1index").replace(/(\.html)?$/, ".md").replace(/^\//, "") : "404.md";
				route.data = {
					...notFoundPageData,
					relativePath
				};
			}
		}
	}
	if (inBrowser) {
		if (history.state === null) history.replaceState({}, "");
		window.addEventListener("click", (e) => {
			if (e.defaultPrevented || !(e.target instanceof Element) || e.target.closest("button") || e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
			const link = e.target.closest("a");
			if (!link || link.closest(".vp-raw") || link.hasAttribute("download") || link.hasAttribute("target")) return;
			const linkHref = link.getAttribute("href") ?? (link instanceof SVGAElement ? link.getAttribute("xlink:href") : null);
			if (linkHref == null) return;
			const { href, origin, pathname, hash, search } = new URL(linkHref, link.baseURI);
			const currentUrl = new URL(location.href);
			if (origin === currentUrl.origin && treatAsHtml(pathname)) {
				e.preventDefault();
				if (pathname === currentUrl.pathname && search === currentUrl.search) {
					if (hash !== currentUrl.hash) {
						history.pushState({}, "", href);
						window.dispatchEvent(new HashChangeEvent("hashchange", {
							oldURL: currentUrl.href,
							newURL: href
						}));
					}
					if (hash) scrollTo(link, hash, link.classList.contains("header-anchor"));
					else window.scrollTo(0, 0);
				} else go(href);
			}
		}, { capture: true });
		window.addEventListener("popstate", async (e) => {
			if (e.state === null) return;
			const href = normalizeHref(location.href);
			await loadPage(href, e.state && e.state.scrollPosition || 0);
			await (router.onAfterRouteChange ?? router.onAfterRouteChanged)?.(href);
		});
		window.addEventListener("hashchange", (e) => {
			e.preventDefault();
		});
	}
	return router;
}
function useRouter() {
	const router = inject(RouterSymbol);
	if (!router) throw new Error("useRouter() is called without provider.");
	return router;
}
function useRoute() {
	return useRouter().route;
}
function scrollTo(el, hash, smooth = false) {
	let target = null;
	try {
		target = el.classList.contains("header-anchor") ? el : document.getElementById(decodeURIComponent(hash).slice(1));
	} catch (e) {
		console.warn(e);
	}
	if (target) {
		const targetPadding = parseInt(window.getComputedStyle(target).paddingTop, 10);
		const targetTop = window.scrollY + target.getBoundingClientRect().top - getScrollOffset() + targetPadding;
		function scrollToTarget() {
			if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) window.scrollTo(0, targetTop);
			else window.scrollTo({
				left: 0,
				top: targetTop,
				behavior: "smooth"
			});
		}
		requestAnimationFrame(scrollToTarget);
	}
}
function normalizeHref(href) {
	const url = new URL(href, fakeHost);
	url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, "$1");
	if (siteDataRef.value.cleanUrls) url.pathname = url.pathname.replace(/\.html$/, "");
	else if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) url.pathname += ".html";
	return url.pathname + url.search + url.hash;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/components/Content.js
var runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn());
var Content = defineComponent({
	name: "VitePressContent",
	props: { as: {
		type: [Object, String],
		default: "div"
	} },
	setup(props) {
		const route = useRoute();
		const { frontmatter, site } = useData$1();
		watch(frontmatter, runCbs, {
			deep: true,
			flush: "post"
		});
		return () => h(props.as, site.value.contentProps ?? { style: { position: "relative" } }, [route.component ? h(route.component, {
			onVnodeMounted: runCbs,
			onVnodeUpdated: runCbs,
			onVnodeUnmounted: runCbs
		}) : "404 Page Not Found"]);
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress-plugin-mermaid@2.0.17_mermaid@11.17.2_vitepress@1.6.4_@algolia+client-search@5.59.0_zvtaqim3kemfsi2hx2gr2vmzge/node_modules/vitepress-plugin-mermaid/dist/Mermaid.vue
var _sfc_main$5 = {
	__name: "Mermaid",
	__ssrInlineRender: true,
	props: {
		graph: {
			type: String,
			required: true
		},
		id: {
			type: String,
			required: true
		},
		class: {
			type: String,
			required: false,
			default: "mermaid"
		}
	},
	setup(__props) {
		const pluginSettings = ref({
			securityLevel: "loose",
			startOnLoad: false,
			externalDiagrams: []
		});
		const { page } = useData$1();
		const { frontmatter } = toRaw(page.value);
		const mermaidPageTheme = frontmatter.mermaidTheme || "";
		const props = __props;
		const svg = ref(null);
		let mut = null;
		onMounted(async () => {
			await init(pluginSettings.value.externalDiagrams);
			let settings = await import("./virtual_mermaid-config.B98_bZ95.js");
			if (settings?.default) pluginSettings.value = settings.default;
			mut = new MutationObserver(async () => await renderChart());
			mut.observe(document.documentElement, { attributes: true });
			await renderChart();
			if (/<img([\w\W]+?)>/.exec(decodeURIComponent(props.graph))?.length > 0) setTimeout(() => {
				let imgElements = document.getElementsByTagName("img");
				let imgs = Array.from(imgElements);
				if (imgs.length) Promise.all(imgs.filter((img) => !img.complete).map((img) => new Promise((resolve) => {
					img.onload = img.onerror = resolve;
				}))).then(async () => {
					await renderChart();
				});
			}, 100);
		});
		onUnmounted(() => mut.disconnect());
		const renderChart = async () => {
			const hasDarkClass = document.documentElement.classList.contains("dark");
			let mermaidConfig = { ...pluginSettings.value };
			if (mermaidPageTheme) mermaidConfig.theme = mermaidPageTheme;
			if (hasDarkClass) mermaidConfig.theme = "dark";
			let svgCode = await render$1(props.id, decodeURIComponent(props.graph), mermaidConfig);
			const salt = Math.random().toString(36).substring(7);
			svg.value = `${svgCode} <span style="display: none">${salt}</span>`;
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: props.class }, _attrs))}>${svg.value ?? ""}</div>`);
		};
	}
};
var _sfc_setup$69 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress-plugin-mermaid@2.0.17_mermaid@11.17.2_vitepress@1.6.4_@algolia+client-search@5.59.0_zvtaqim3kemfsi2hx2gr2vmzge/node_modules/vitepress-plugin-mermaid/dist/Mermaid.vue");
	return _sfc_setup$69 ? _sfc_setup$69(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue?vue&type=script&setup=true&lang.ts
var VPBadge_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPBadge",
	__ssrInlineRender: true,
	props: {
		text: {},
		type: { default: "tip" }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({ class: ["VPBadge", __props.type] }, _attrs))}>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, () => {
				_push(`${ssrInterpolate(__props.text)}`);
			}, _push, _parent);
			_push(`</span>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue
var _sfc_setup$68 = VPBadge_vue_vue_type_script_setup_true_lang_default.setup;
VPBadge_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue");
	return _sfc_setup$68 ? _sfc_setup$68(props, ctx) : void 0;
};
var VPBadge_default = VPBadge_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue?vue&type=script&setup=true&lang.ts
var VPBackdrop_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPBackdrop",
	__ssrInlineRender: true,
	props: { show: { type: Boolean } },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.show) _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPBackdrop" }, _attrs))} data-v-21d370cf></div>`);
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue
var _sfc_setup$67 = VPBackdrop_vue_vue_type_script_setup_true_lang_default.setup;
VPBackdrop_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue");
	return _sfc_setup$67 ? _sfc_setup$67(props, ctx) : void 0;
};
var VPBackdrop_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPBackdrop_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-21d370cf"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/data.js
var useData = useData$1;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/support/utils.js
function throttleAndDebounce(fn, delay) {
	let timeoutId;
	let called = false;
	return () => {
		if (timeoutId) clearTimeout(timeoutId);
		if (!called) {
			fn();
			(called = true) && setTimeout(() => called = false, delay);
		} else timeoutId = setTimeout(fn, delay);
	};
}
function ensureStartingSlash(path) {
	return path.startsWith("/") ? path : `/${path}`;
}
function normalizeLink$1(url) {
	const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
	if (isExternal(url) || url.startsWith("#") || !protocol.startsWith("http") || !treatAsHtml(pathname)) return url;
	const { site } = useData();
	return withBase(pathname.endsWith("/") || pathname.endsWith(".html") ? url : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")}${search}${hash}`));
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/langs.js
function useLangs({ correspondingLink = false } = {}) {
	const { site, localeIndex, page, theme, hash } = useData();
	const currentLang = computed(() => ({
		label: site.value.locales[localeIndex.value]?.label,
		link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === "root" ? "/" : `/${localeIndex.value}/`)
	}));
	return {
		localeLinks: computed(() => Object.entries(site.value.locales).flatMap(([key, value]) => currentLang.value.label === value.label ? [] : {
			text: value.label,
			link: normalizeLink(value.link || (key === "root" ? "/" : `/${key}/`), theme.value.i18nRouting !== false && correspondingLink, page.value.relativePath.slice(currentLang.value.link.length - 1), !site.value.cleanUrls) + hash.value
		})),
		currentLang
	};
}
function normalizeLink(link, addPath, path, addExt) {
	return addPath ? link.replace(/\/$/, "") + ensureStartingSlash(path.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, addExt ? ".html" : "")) : link;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/NotFound.vue?vue&type=script&setup=true&lang.ts
var NotFound_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "NotFound",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { currentLang } = useLangs();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "NotFound" }, _attrs))} data-v-6f724c54><p class="code" data-v-6f724c54>${ssrInterpolate(unref(theme).notFound?.code ?? "404")}</p><h1 class="title" data-v-6f724c54>${ssrInterpolate(unref(theme).notFound?.title ?? "PAGE NOT FOUND")}</h1><div class="divider" data-v-6f724c54></div><blockquote class="quote" data-v-6f724c54>${ssrInterpolate(unref(theme).notFound?.quote ?? "But if you don't change your direction, and if you keep looking, you may end up where you are heading.")}</blockquote><div class="action" data-v-6f724c54><a class="link"${ssrRenderAttr("href", unref(withBase)(unref(currentLang).link))}${ssrRenderAttr("aria-label", unref(theme).notFound?.linkLabel ?? "go to home")} data-v-6f724c54>${ssrInterpolate(unref(theme).notFound?.linkText ?? "Take me home")}</a></div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/NotFound.vue
var _sfc_setup$66 = NotFound_vue_vue_type_script_setup_true_lang_default.setup;
NotFound_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/NotFound.vue");
	return _sfc_setup$66 ? _sfc_setup$66(props, ctx) : void 0;
};
var NotFound_default = /*#__PURE__*/ _plugin_vue_export_helper_default(NotFound_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6f724c54"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/support/sidebar.js
/**
* Get the `Sidebar` from sidebar option. This method will ensure to get correct
* sidebar config from `MultiSideBarConfig` with various path combinations such
* as matching `guide/` and `/guide/`. If no matching config was found, it will
* return empty array.
*/
function getSidebar(_sidebar, path) {
	if (Array.isArray(_sidebar)) return addBase(_sidebar);
	if (_sidebar == null) return [];
	path = ensureStartingSlash(path);
	const dir = Object.keys(_sidebar).sort((a, b) => {
		return b.split("/").length - a.split("/").length;
	}).find((dir) => {
		return path.startsWith(ensureStartingSlash(dir));
	});
	const sidebar = dir ? _sidebar[dir] : [];
	return Array.isArray(sidebar) ? addBase(sidebar) : addBase(sidebar.items, sidebar.base);
}
/**
* Get or generate sidebar group from the given sidebar items.
*/
function getSidebarGroups(sidebar) {
	const groups = [];
	let lastGroupIndex = 0;
	for (const index in sidebar) {
		const item = sidebar[index];
		if (item.items) {
			lastGroupIndex = groups.push(item);
			continue;
		}
		if (!groups[lastGroupIndex]) groups.push({ items: [] });
		groups[lastGroupIndex].items.push(item);
	}
	return groups;
}
function getFlatSideBarLinks(sidebar) {
	const links = [];
	function recursivelyExtractLinks(items) {
		for (const item of items) {
			if (item.text && item.link) links.push({
				text: item.text,
				link: item.link,
				docFooterText: item.docFooterText
			});
			if (item.items) recursivelyExtractLinks(item.items);
		}
	}
	recursivelyExtractLinks(sidebar);
	return links;
}
/**
* Check if the given sidebar item contains any active link.
*/
function hasActiveLink(path, items) {
	if (Array.isArray(items)) return items.some((item) => hasActiveLink(path, item));
	return isActive(path, items.link) ? true : items.items ? hasActiveLink(path, items.items) : false;
}
function addBase(items, _base) {
	return [...items].map((_item) => {
		const item = { ..._item };
		const base = item.base || _base;
		if (base && item.link) item.link = base + item.link;
		if (item.items) item.items = addBase(item.items, base);
		return item;
	});
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/sidebar.js
function useSidebar() {
	const { frontmatter, page, theme } = useData();
	const is960 = useMediaQuery("(min-width: 960px)");
	const isOpen = ref(false);
	const _sidebar = computed(() => {
		const sidebarConfig = theme.value.sidebar;
		const relativePath = page.value.relativePath;
		return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
	});
	const sidebar = ref(_sidebar.value);
	watch(_sidebar, (next, prev) => {
		if (JSON.stringify(next) !== JSON.stringify(prev)) sidebar.value = _sidebar.value;
	});
	const hasSidebar = computed(() => {
		return frontmatter.value.sidebar !== false && sidebar.value.length > 0 && frontmatter.value.layout !== "home";
	});
	const leftAside = computed(() => {
		if (hasAside) return frontmatter.value.aside == null ? theme.value.aside === "left" : frontmatter.value.aside === "left";
		return false;
	});
	const hasAside = computed(() => {
		if (frontmatter.value.layout === "home") return false;
		if (frontmatter.value.aside != null) return !!frontmatter.value.aside;
		return theme.value.aside !== false;
	});
	const isSidebarEnabled = computed(() => hasSidebar.value && is960.value);
	const sidebarGroups = computed(() => {
		return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
	});
	function open() {
		isOpen.value = true;
	}
	function close() {
		isOpen.value = false;
	}
	function toggle() {
		isOpen.value ? close() : open();
	}
	return {
		isOpen,
		sidebar,
		sidebarGroups,
		hasSidebar,
		hasAside,
		leftAside,
		isSidebarEnabled,
		open,
		close,
		toggle
	};
}
/**
* a11y: cache the element that opened the Sidebar (the menu button) then
* focus that button again when Menu is closed with Escape key.
*/
function useCloseSidebarOnEscape(isOpen, close) {
	let triggerElement;
	watchEffect(() => {
		triggerElement = isOpen.value ? document.activeElement : void 0;
	});
	onMounted(() => {
		window.addEventListener("keyup", onEscape);
	});
	onUnmounted(() => {
		window.removeEventListener("keyup", onEscape);
	});
	function onEscape(e) {
		if (e.key === "Escape" && isOpen.value) {
			close();
			triggerElement?.focus();
		}
	}
}
function useSidebarControl(item) {
	const { page, hash } = useData();
	const collapsed = ref(false);
	const collapsible = computed(() => {
		return item.value.collapsed != null;
	});
	const isLink = computed(() => {
		return !!item.value.link;
	});
	const isActiveLink = ref(false);
	const updateIsActiveLink = () => {
		isActiveLink.value = isActive(page.value.relativePath, item.value.link);
	};
	watch([
		page,
		item,
		hash
	], updateIsActiveLink);
	onMounted(updateIsActiveLink);
	const hasActiveLink$1 = computed(() => {
		if (isActiveLink.value) return true;
		return item.value.items ? hasActiveLink(page.value.relativePath, item.value.items) : false;
	});
	const hasChildren = computed(() => {
		return !!(item.value.items && item.value.items.length);
	});
	watchEffect(() => {
		collapsed.value = !!(collapsible.value && item.value.collapsed);
	});
	watchPostEffect(() => {
		(isActiveLink.value || hasActiveLink$1.value) && (collapsed.value = false);
	});
	function toggle() {
		if (collapsible.value) collapsed.value = !collapsed.value;
	}
	return {
		collapsed,
		collapsible,
		isLink,
		isActiveLink,
		hasActiveLink: hasActiveLink$1,
		hasChildren,
		toggle
	};
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/aside.js
function useAside() {
	const { hasSidebar } = useSidebar();
	const is960 = useMediaQuery("(min-width: 960px)");
	const is1280 = useMediaQuery("(min-width: 1280px)");
	return { isAsideEnabled: computed(() => {
		if (!is1280.value && !is960.value) return false;
		return hasSidebar.value ? is1280.value : is960.value;
	}) };
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/outline.js
var ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;
var resolvedHeaders = [];
function resolveTitle(theme) {
	return typeof theme.outline === "object" && !Array.isArray(theme.outline) && theme.outline.label || theme.outlineTitle || "On this page";
}
function getHeaders(range) {
	return resolveHeaders([...document.querySelectorAll(".VPDoc :where(h1,h2,h3,h4,h5,h6)")].filter((el) => el.id && el.hasChildNodes()).map((el) => {
		const level = Number(el.tagName[1]);
		return {
			element: el,
			title: serializeHeader(el),
			link: "#" + el.id,
			level
		};
	}), range);
}
function serializeHeader(h) {
	let ret = "";
	for (const node of h.childNodes) if (node.nodeType === 1) {
		if (ignoreRE.test(node.className)) continue;
		ret += node.textContent;
	} else if (node.nodeType === 3) ret += node.textContent;
	return ret.trim();
}
function resolveHeaders(headers, range) {
	if (range === false) return [];
	const levelsRange = (typeof range === "object" && !Array.isArray(range) ? range.level : range) || 2;
	const [high, low] = typeof levelsRange === "number" ? [levelsRange, levelsRange] : levelsRange === "deep" ? [2, 6] : levelsRange;
	return buildTree(headers, high, low);
}
function useActiveAnchor(container, marker) {
	const { isAsideEnabled } = useAside();
	const onScroll = throttleAndDebounce(setActiveLink, 100);
	let prevActiveLink = null;
	onMounted(() => {
		requestAnimationFrame(setActiveLink);
		window.addEventListener("scroll", onScroll);
	});
	onUpdated(() => {
		activateLink(location.hash);
	});
	onUnmounted(() => {
		window.removeEventListener("scroll", onScroll);
	});
	function setActiveLink() {
		if (!isAsideEnabled.value) return;
		const scrollY = window.scrollY;
		const innerHeight = window.innerHeight;
		const offsetHeight = document.body.offsetHeight;
		const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1;
		const headers = resolvedHeaders.map(({ element, link }) => ({
			link,
			top: getAbsoluteTop(element)
		})).filter(({ top }) => !Number.isNaN(top)).sort((a, b) => a.top - b.top);
		if (!headers.length) {
			activateLink(null);
			return;
		}
		if (scrollY < 1) {
			activateLink(null);
			return;
		}
		if (isBottom) {
			activateLink(headers[headers.length - 1].link);
			return;
		}
		let activeLink = null;
		for (const { link, top } of headers) {
			if (top > scrollY + getScrollOffset() + 4) break;
			activeLink = link;
		}
		activateLink(activeLink);
	}
	function activateLink(hash) {
		if (prevActiveLink) prevActiveLink.classList.remove("active");
		if (hash == null) prevActiveLink = null;
		else prevActiveLink = container.value.querySelector(`a[href="${decodeURIComponent(hash)}"]`);
		const activeLink = prevActiveLink;
		if (activeLink) {
			activeLink.classList.add("active");
			marker.value.style.top = activeLink.offsetTop + 39 + "px";
			marker.value.style.opacity = "1";
		} else {
			marker.value.style.top = "33px";
			marker.value.style.opacity = "0";
		}
	}
}
function getAbsoluteTop(element) {
	let offsetTop = 0;
	while (element !== document.body) {
		if (element === null) return NaN;
		offsetTop += element.offsetTop;
		element = element.offsetParent;
	}
	return offsetTop;
}
function buildTree(data, min, max) {
	resolvedHeaders.length = 0;
	const result = [];
	const stack = [];
	data.forEach((item) => {
		const node = {
			...item,
			children: []
		};
		let parent = stack[stack.length - 1];
		while (parent && parent.level >= node.level) {
			stack.pop();
			parent = stack[stack.length - 1];
		}
		if (node.element.classList.contains("ignore-header") || parent && "shouldIgnore" in parent) {
			stack.push({
				level: node.level,
				shouldIgnore: true
			});
			return;
		}
		if (node.level > max || node.level < min) return;
		resolvedHeaders.push({
			element: node.element,
			link: node.link
		});
		if (parent) parent.children.push(node);
		else result.push(node);
		stack.push(node);
	});
	return result;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue?vue&type=script&setup=true&lang.ts
var VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocOutlineItem",
	__ssrInlineRender: true,
	props: {
		headers: {},
		root: { type: Boolean }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPDocOutlineItem = resolveComponent("VPDocOutlineItem", true);
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: ["VPDocOutlineItem", __props.root ? "root" : "nested"] }, _attrs))} data-v-761c1cb3><!--[-->`);
			ssrRenderList(__props.headers, ({ children, link, title }) => {
				_push(`<li data-v-761c1cb3><a class="outline-link"${ssrRenderAttr("href", link)}${ssrRenderAttr("title", title)} data-v-761c1cb3>${ssrInterpolate(title)}</a>`);
				if (children?.length) _push(ssrRenderComponent(_component_VPDocOutlineItem, { headers: children }, null, _parent));
				else _push(`<!---->`);
				_push(`</li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue
var _sfc_setup$65 = VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default.setup;
VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue");
	return _sfc_setup$65 ? _sfc_setup$65(props, ctx) : void 0;
};
var VPDocOutlineItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-761c1cb3"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideOutline",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter, theme } = useData();
		const headers = shallowRef([]);
		onContentUpdated(() => {
			headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
		});
		const container = ref();
		useActiveAnchor(container, ref());
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<nav${ssrRenderAttrs(mergeProps({
				"aria-labelledby": "doc-outline-aria-label",
				class: ["VPDocAsideOutline", { "has-outline": headers.value.length > 0 }],
				ref_key: "container",
				ref: container
			}, _attrs))} data-v-3afc8cbe><div class="content" data-v-3afc8cbe><div class="outline-marker" data-v-3afc8cbe></div><div aria-level="2" class="outline-title" id="doc-outline-aria-label" role="heading" data-v-3afc8cbe>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</div>`);
			_push(ssrRenderComponent(VPDocOutlineItem_default, {
				headers: headers.value,
				root: true
			}, null, _parent));
			_push(`</div></nav>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue
var _sfc_setup$64 = VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue");
	return _sfc_setup$64 ? _sfc_setup$64(props, ctx) : void 0;
};
var VPDocAsideOutline_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3afc8cbe"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideCarbonAds",
	__ssrInlineRender: true,
	props: { carbonAds: {} },
	setup(__props) {
		const VPCarbonAds = () => null;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideCarbonAds" }, _attrs))}>`);
			_push(ssrRenderComponent(unref(VPCarbonAds), { "carbon-ads": __props.carbonAds }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue
var _sfc_setup$63 = VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue");
	return _sfc_setup$63 ? _sfc_setup$63(props, ctx) : void 0;
};
var VPDocAsideCarbonAds_default = VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue?vue&type=script&setup=true&lang.ts
var VPDocAside_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAside",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAside" }, _attrs))} data-v-9cc38f13>`);
			ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPDocAsideOutline_default, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent);
			_push(`<div class="spacer" data-v-9cc38f13></div>`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent);
			if (unref(theme).carbonAds) _push(ssrRenderComponent(VPDocAsideCarbonAds_default, { "carbon-ads": unref(theme).carbonAds }, null, _parent));
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue
var _sfc_setup$62 = VPDocAside_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAside_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue");
	return _sfc_setup$62 ? _sfc_setup$62(props, ctx) : void 0;
};
var VPDocAside_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocAside_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9cc38f13"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/edit-link.js
function useEditLink() {
	const { theme, page } = useData();
	return computed(() => {
		const { text = "Edit this page", pattern = "" } = theme.value.editLink || {};
		let url;
		if (typeof pattern === "function") url = pattern(page.value);
		else url = pattern.replace(/:path/g, page.value.filePath);
		return {
			url,
			text
		};
	});
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/prev-next.js
function usePrevNext() {
	const { page, theme, frontmatter } = useData();
	return computed(() => {
		const candidates = uniqBy(getFlatSideBarLinks(getSidebar(theme.value.sidebar, page.value.relativePath)), (link) => link.link.replace(/[?#].*$/, ""));
		const index = candidates.findIndex((link) => {
			return isActive(page.value.relativePath, link.link);
		});
		const hidePrev = theme.value.docFooter?.prev === false && !frontmatter.value.prev || frontmatter.value.prev === false;
		const hideNext = theme.value.docFooter?.next === false && !frontmatter.value.next || frontmatter.value.next === false;
		return {
			prev: hidePrev ? void 0 : {
				text: (typeof frontmatter.value.prev === "string" ? frontmatter.value.prev : typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.text : void 0) ?? candidates[index - 1]?.docFooterText ?? candidates[index - 1]?.text,
				link: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.link : void 0) ?? candidates[index - 1]?.link
			},
			next: hideNext ? void 0 : {
				text: (typeof frontmatter.value.next === "string" ? frontmatter.value.next : typeof frontmatter.value.next === "object" ? frontmatter.value.next.text : void 0) ?? candidates[index + 1]?.docFooterText ?? candidates[index + 1]?.text,
				link: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.link : void 0) ?? candidates[index + 1]?.link
			}
		};
	});
}
function uniqBy(array, keyFn) {
	const seen = /* @__PURE__ */ new Set();
	return array.filter((item) => {
		const k = keyFn(item);
		return seen.has(k) ? false : seen.add(k);
	});
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue?vue&type=script&setup=true&lang.ts
var VPLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLink",
	__ssrInlineRender: true,
	props: {
		tag: {},
		href: {},
		noIcon: { type: Boolean },
		target: {},
		rel: {}
	},
	setup(__props) {
		const props = __props;
		const tag = computed(() => props.tag ?? (props.href ? "a" : "span"));
		const isExternal = computed(() => props.href && EXTERNAL_URL_RE.test(props.href) || props.target === "_blank");
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tag.value), mergeProps({
				class: ["VPLink", {
					link: __props.href,
					"vp-external-link-icon": isExternal.value,
					"no-icon": __props.noIcon
				}],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: __props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: __props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}), _parent);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue
var _sfc_setup$61 = VPLink_vue_vue_type_script_setup_true_lang_default.setup;
VPLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue");
	return _sfc_setup$61 ? _sfc_setup$61(props, ctx) : void 0;
};
var VPLink_default = VPLink_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue?vue&type=script&setup=true&lang.ts
var VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocFooterLastUpdated",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, lang } = useData();
		const date = computed(() => new Date(page.value.lastUpdated));
		const isoDatetime = computed(() => date.value.toISOString());
		const datetime = ref("");
		onMounted(() => {
			watchEffect(() => {
				datetime.value = new Intl.DateTimeFormat(theme.value.lastUpdated?.formatOptions?.forceLocale ? lang.value : void 0, theme.value.lastUpdated?.formatOptions ?? {
					dateStyle: "short",
					timeStyle: "short"
				}).format(date.value);
			});
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<p${ssrRenderAttrs(mergeProps({ class: "VPLastUpdated" }, _attrs))} data-v-a53d6cad>${ssrInterpolate(unref(theme).lastUpdated?.text || unref(theme).lastUpdatedText || "Last updated")}: <time${ssrRenderAttr("datetime", isoDatetime.value)} data-v-a53d6cad>${ssrInterpolate(datetime.value)}</time></p>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue
var _sfc_setup$60 = VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default.setup;
VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue");
	return _sfc_setup$60 ? _sfc_setup$60(props, ctx) : void 0;
};
var VPDocFooterLastUpdated_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a53d6cad"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue?vue&type=script&setup=true&lang.ts
var VPDocFooter_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, frontmatter } = useData();
		const editLink = useEditLink();
		const control = usePrevNext();
		const hasEditLink = computed(() => theme.value.editLink && frontmatter.value.editLink !== false);
		const hasLastUpdated = computed(() => page.value.lastUpdated);
		const showFooter = computed(() => hasEditLink.value || hasLastUpdated.value || control.value.prev || control.value.next);
		return (_ctx, _push, _parent, _attrs) => {
			if (showFooter.value) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: "VPDocFooter" }, _attrs))} data-v-271e65a2>`);
				ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent);
				if (hasEditLink.value || hasLastUpdated.value) {
					_push(`<div class="edit-info" data-v-271e65a2>`);
					if (hasEditLink.value) {
						_push(`<div class="edit-link" data-v-271e65a2>`);
						_push(ssrRenderComponent(VPLink_default, {
							class: "edit-link-button",
							href: unref(editLink).url,
							"no-icon": true
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<span class="vpi-square-pen edit-link-icon" data-v-271e65a2${_scopeId}></span> ${ssrInterpolate(unref(editLink).text)}`);
								else return [createVNode("span", { class: "vpi-square-pen edit-link-icon" }), createTextVNode(" " + toDisplayString(unref(editLink).text), 1)];
							}),
							_: 1
						}, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					if (hasLastUpdated.value) {
						_push(`<div class="last-updated" data-v-271e65a2>`);
						_push(ssrRenderComponent(VPDocFooterLastUpdated_default, null, null, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				if (unref(control).prev?.link || unref(control).next?.link) {
					_push(`<nav class="prev-next" aria-labelledby="doc-footer-aria-label" data-v-271e65a2><span class="visually-hidden" id="doc-footer-aria-label" data-v-271e65a2>Pager</span><div class="pager" data-v-271e65a2>`);
					if (unref(control).prev?.link) _push(ssrRenderComponent(VPLink_default, {
						class: "pager-link prev",
						href: unref(control).prev.link
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-271e65a2${_scopeId}>${(unref(theme).docFooter?.prev || "Previous page") ?? ""}</span><span class="title" data-v-271e65a2${_scopeId}>${unref(control).prev.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.prev || "Previous page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).prev.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div><div class="pager" data-v-271e65a2>`);
					if (unref(control).next?.link) _push(ssrRenderComponent(VPLink_default, {
						class: "pager-link next",
						href: unref(control).next.link
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-271e65a2${_scopeId}>${(unref(theme).docFooter?.next || "Next page") ?? ""}</span><span class="title" data-v-271e65a2${_scopeId}>${unref(control).next.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.next || "Next page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).next.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div></nav>`);
				} else _push(`<!---->`);
				_push(`</footer>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue
var _sfc_setup$59 = VPDocFooter_vue_vue_type_script_setup_true_lang_default.setup;
VPDocFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue");
	return _sfc_setup$59 ? _sfc_setup$59(props, ctx) : void 0;
};
var VPDocFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocFooter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-271e65a2"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue?vue&type=script&setup=true&lang.ts
var VPDoc_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDoc",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const { hasSidebar, hasAside, leftAside } = useSidebar();
		const pageName = computed(() => route.path.replace(/[./]+/g, "_").replace(/_html$/, ""));
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPDoc", {
				"has-sidebar": unref(hasSidebar),
				"has-aside": unref(hasAside)
			}] }, _attrs))} data-v-ca964f62>`);
			ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent);
			_push(`<div class="container" data-v-ca964f62>`);
			if (unref(hasAside)) {
				_push(`<div class="${ssrRenderClass([{ "left-aside": unref(leftAside) }, "aside"])}" data-v-ca964f62><div class="aside-curtain" data-v-ca964f62></div><div class="aside-container" data-v-ca964f62><div class="aside-content" data-v-ca964f62>`);
				_push(ssrRenderComponent(VPDocAside_default, null, {
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="content" data-v-ca964f62><div class="content-container" data-v-ca964f62>`);
			ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent);
			_push(`<main class="main" data-v-ca964f62>`);
			_push(ssrRenderComponent(_component_Content, { class: ["vp-doc", [pageName.value, unref(theme).externalLinkIcon && "external-link-icon-enabled"]] }, null, _parent));
			_push(`</main>`);
			_push(ssrRenderComponent(VPDocFooter_default, null, {
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent);
			_push(`</div></div></div>`);
			ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue
var _sfc_setup$58 = VPDoc_vue_vue_type_script_setup_true_lang_default.setup;
VPDoc_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue");
	return _sfc_setup$58 ? _sfc_setup$58(props, ctx) : void 0;
};
var VPDoc_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDoc_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ca964f62"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue?vue&type=script&setup=true&lang.ts
var VPButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPButton",
	__ssrInlineRender: true,
	props: {
		tag: {},
		size: { default: "medium" },
		theme: { default: "brand" },
		text: {},
		href: {},
		target: {},
		rel: {}
	},
	setup(__props) {
		const props = __props;
		const isExternal = computed(() => props.href && EXTERNAL_URL_RE.test(props.href));
		const component = computed(() => {
			return props.tag || (props.href ? "a" : "button");
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(component.value), mergeProps({
				class: ["VPButton", [__props.size, __props.theme]],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(__props.text)}`);
					else return [createTextVNode(toDisplayString(__props.text), 1)];
				}),
				_: 1
			}), _parent);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue
var _sfc_setup$57 = VPButton_vue_vue_type_script_setup_true_lang_default.setup;
VPButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue");
	return _sfc_setup$57 ? _sfc_setup$57(props, ctx) : void 0;
};
var VPButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-20f062eb"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue?vue&type=script&setup=true&lang.ts
var VPImage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "VPImage",
	__ssrInlineRender: true,
	props: {
		image: {},
		alt: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPImage = resolveComponent("VPImage", true);
			if (__props.image) {
				_push(`<!--[-->`);
				if (typeof __props.image === "string" || "src" in __props.image) _push(`<img${ssrRenderAttrs(mergeProps({ class: "VPImage" }, typeof __props.image === "string" ? _ctx.$attrs : {
					...__props.image,
					..._ctx.$attrs
				}, {
					src: unref(withBase)(typeof __props.image === "string" ? __props.image : __props.image.src),
					alt: __props.alt ?? (typeof __props.image === "string" ? "" : __props.image.alt || "")
				}))} data-v-2c9996ab>`);
				else {
					_push(`<!--[-->`);
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "dark",
						image: __props.image.dark,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "light",
						image: __props.image.light,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(`<!--]-->`);
				}
				_push(`<!--]-->`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue
var _sfc_setup$56 = VPImage_vue_vue_type_script_setup_true_lang_default.setup;
VPImage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue");
	return _sfc_setup$56 ? _sfc_setup$56(props, ctx) : void 0;
};
var VPImage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPImage_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-2c9996ab"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue?vue&type=script&setup=true&lang.ts
var VPHero_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHero",
	__ssrInlineRender: true,
	props: {
		name: {},
		text: {},
		tagline: {},
		image: {},
		actions: {}
	},
	setup(__props) {
		const heroImageSlotExists = inject("hero-image-slot-exists");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHero", { "has-image": __props.image || unref(heroImageSlotExists) }] }, _attrs))} data-v-c2a42eb4><div class="container" data-v-c2a42eb4><div class="main" data-v-c2a42eb4>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, () => {
				_push(`<h1 class="heading" data-v-c2a42eb4>`);
				if (__props.name) _push(`<span class="name clip" data-v-c2a42eb4>${__props.name ?? ""}</span>`);
				else _push(`<!---->`);
				if (__props.text) _push(`<span class="text" data-v-c2a42eb4>${__props.text ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`</h1>`);
				if (__props.tagline) _push(`<p class="tagline" data-v-c2a42eb4>${__props.tagline ?? ""}</p>`);
				else _push(`<!---->`);
			}, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent);
			if (__props.actions) {
				_push(`<div class="actions" data-v-c2a42eb4><!--[-->`);
				ssrRenderList(__props.actions, (action) => {
					_push(`<div class="action" data-v-c2a42eb4>`);
					_push(ssrRenderComponent(VPButton_default, {
						tag: "a",
						size: "medium",
						theme: action.theme,
						text: action.text,
						href: action.link,
						target: action.target,
						rel: action.rel
					}, null, _parent));
					_push(`</div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent);
			_push(`</div>`);
			if (__props.image || unref(heroImageSlotExists)) {
				_push(`<div class="image" data-v-c2a42eb4><div class="image-container" data-v-c2a42eb4><div class="image-bg" data-v-c2a42eb4></div>`);
				ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, () => {
					if (__props.image) _push(ssrRenderComponent(VPImage_default, {
						class: "image-src",
						image: __props.image
					}, null, _parent));
					else _push(`<!---->`);
				}, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue
var _sfc_setup$55 = VPHero_vue_vue_type_script_setup_true_lang_default.setup;
VPHero_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue");
	return _sfc_setup$55 ? _sfc_setup$55(props, ctx) : void 0;
};
var VPHero_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHero_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c2a42eb4"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue?vue&type=script&setup=true&lang.ts
var VPHomeHero_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeHero",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).hero) _push(ssrRenderComponent(VPHero_default, mergeProps({
				class: "VPHomeHero",
				name: unref(fm).hero.name,
				text: unref(fm).hero.text,
				tagline: unref(fm).hero.tagline,
				image: unref(fm).hero.image,
				actions: unref(fm).hero.actions
			}, _attrs), {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before")];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info")];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after")];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after")];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image")];
				}),
				_: 3
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue
var _sfc_setup$54 = VPHomeHero_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeHero_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue");
	return _sfc_setup$54 ? _sfc_setup$54(props, ctx) : void 0;
};
var VPHomeHero_default = VPHomeHero_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue?vue&type=script&setup=true&lang.ts
var VPFeature_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFeature",
	__ssrInlineRender: true,
	props: {
		icon: {},
		title: {},
		details: {},
		link: {},
		linkText: {},
		rel: {},
		target: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: "VPFeature",
				href: __props.link,
				rel: __props.rel,
				target: __props.target,
				"no-icon": true,
				tag: __props.link ? "a" : "div"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<article class="box" data-v-205acbd6${_scopeId}>`);
						if (typeof __props.icon === "object" && __props.icon.wrap) {
							_push(`<div class="icon" data-v-205acbd6${_scopeId}>`);
							_push(ssrRenderComponent(VPImage_default, {
								image: __props.icon,
								alt: __props.icon.alt,
								height: __props.icon.height || 48,
								width: __props.icon.width || 48
							}, null, _parent, _scopeId));
							_push(`</div>`);
						} else if (typeof __props.icon === "object") _push(ssrRenderComponent(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, _parent, _scopeId));
						else if (__props.icon) _push(`<div class="icon" data-v-205acbd6${_scopeId}>${__props.icon ?? ""}</div>`);
						else _push(`<!---->`);
						_push(`<h2 class="title" data-v-205acbd6${_scopeId}>${__props.title ?? ""}</h2>`);
						if (__props.details) _push(`<p class="details" data-v-205acbd6${_scopeId}>${__props.details ?? ""}</p>`);
						else _push(`<!---->`);
						if (__props.linkText) _push(`<div class="link-text" data-v-205acbd6${_scopeId}><p class="link-text-value" data-v-205acbd6${_scopeId}>${ssrInterpolate(__props.linkText)} <span class="vpi-arrow-right link-text-icon" data-v-205acbd6${_scopeId}></span></p></div>`);
						else _push(`<!---->`);
						_push(`</article>`);
					} else return [createVNode("article", { class: "box" }, [
						typeof __props.icon === "object" && __props.icon.wrap ? (openBlock(), createBlock("div", {
							key: 0,
							class: "icon"
						}, [createVNode(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])])) : typeof __props.icon === "object" ? (openBlock(), createBlock(VPImage_default, {
							key: 1,
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])) : __props.icon ? (openBlock(), createBlock("div", {
							key: 2,
							class: "icon",
							innerHTML: __props.icon
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						createVNode("h2", {
							class: "title",
							innerHTML: __props.title
						}, null, 8, ["innerHTML"]),
						__props.details ? (openBlock(), createBlock("p", {
							key: 3,
							class: "details",
							innerHTML: __props.details
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						__props.linkText ? (openBlock(), createBlock("div", {
							key: 4,
							class: "link-text"
						}, [createVNode("p", { class: "link-text-value" }, [createTextVNode(toDisplayString(__props.linkText) + " ", 1), createVNode("span", { class: "vpi-arrow-right link-text-icon" })])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue
var _sfc_setup$53 = VPFeature_vue_vue_type_script_setup_true_lang_default.setup;
VPFeature_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue");
	return _sfc_setup$53 ? _sfc_setup$53(props, ctx) : void 0;
};
var VPFeature_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFeature_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-205acbd6"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue?vue&type=script&setup=true&lang.ts
var VPFeatures_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFeatures",
	__ssrInlineRender: true,
	props: { features: {} },
	setup(__props) {
		const props = __props;
		const grid = computed(() => {
			const length = props.features.length;
			if (!length) return;
			else if (length === 2) return "grid-2";
			else if (length === 3) return "grid-3";
			else if (length % 3 === 0) return "grid-6";
			else if (length > 3) return "grid-4";
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.features) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPFeatures" }, _attrs))} data-v-ab6f7b6a><div class="container" data-v-ab6f7b6a><div class="items" data-v-ab6f7b6a><!--[-->`);
				ssrRenderList(__props.features, (feature) => {
					_push(`<div class="${ssrRenderClass([[grid.value], "item"])}" data-v-ab6f7b6a>`);
					_push(ssrRenderComponent(VPFeature_default, {
						icon: feature.icon,
						title: feature.title,
						details: feature.details,
						link: feature.link,
						"link-text": feature.linkText,
						rel: feature.rel,
						target: feature.target
					}, null, _parent));
					_push(`</div>`);
				});
				_push(`<!--]--></div></div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue
var _sfc_setup$52 = VPFeatures_vue_vue_type_script_setup_true_lang_default.setup;
VPFeatures_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue");
	return _sfc_setup$52 ? _sfc_setup$52(props, ctx) : void 0;
};
var VPFeatures_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFeatures_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ab6f7b6a"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue?vue&type=script&setup=true&lang.ts
var VPHomeFeatures_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeFeatures",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).features) _push(ssrRenderComponent(VPFeatures_default, mergeProps({
				class: "VPHomeFeatures",
				features: unref(fm).features
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue
var _sfc_setup$51 = VPHomeFeatures_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeFeatures_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue");
	return _sfc_setup$51 ? _sfc_setup$51(props, ctx) : void 0;
};
var VPHomeFeatures_default = VPHomeFeatures_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue?vue&type=script&setup=true&lang.ts
var VPHomeContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeContent",
	__ssrInlineRender: true,
	setup(__props) {
		const { width: vw } = useWindowSize({
			initialWidth: 0,
			includeScrollbar: false
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "vp-doc container",
				style: unref(vw) ? { "--vp-offset": `calc(50% - ${unref(vw) / 2}px)` } : {}
			}, _attrs))} data-v-dd431939>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue
var _sfc_setup$50 = VPHomeContent_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue");
	return _sfc_setup$50 ? _sfc_setup$50(props, ctx) : void 0;
};
var VPHomeContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHomeContent_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-dd431939"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue?vue&type=script&setup=true&lang.ts
var VPHome_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHome",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter, theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHome", { "external-link-icon-enabled": unref(theme).externalLinkIcon }] }, _attrs))} data-v-71848935>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPHomeHero_default, null, {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPHomeFeatures_default, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent);
			if (unref(frontmatter).markdownStyles !== false) _push(ssrRenderComponent(VPHomeContent_default, null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_Content, null, null, _parent, _scopeId));
					else return [createVNode(_component_Content)];
				}),
				_: 1
			}, _parent));
			else _push(ssrRenderComponent(_component_Content, null, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue
var _sfc_setup$49 = VPHome_vue_vue_type_script_setup_true_lang_default.setup;
VPHome_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue");
	return _sfc_setup$49 ? _sfc_setup$49(props, ctx) : void 0;
};
var VPHome_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHome_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-71848935"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue
var _sfc_main$4 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
	const _component_Content = resolveComponent("Content");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPPage" }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent);
	_push(ssrRenderComponent(_component_Content, null, null, _parent));
	ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$48 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue");
	return _sfc_setup$48 ? _sfc_setup$48(props, ctx) : void 0;
};
var VPPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$4, [["ssrRender", _sfc_ssrRender$1]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue?vue&type=script&setup=true&lang.ts
var VPContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPContent",
	__ssrInlineRender: true,
	setup(__props) {
		const { page, frontmatter } = useData();
		const { hasSidebar } = useSidebar();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: ["VPContent", {
					"has-sidebar": unref(hasSidebar),
					"is-home": unref(frontmatter).layout === "home"
				}],
				id: "VPContent"
			}, _attrs))} data-v-4c39d267>`);
			if (unref(page).isNotFound) ssrRenderSlot(_ctx.$slots, "not-found", {}, () => {
				_push(ssrRenderComponent(NotFound_default, null, null, _parent));
			}, _push, _parent);
			else if (unref(frontmatter).layout === "page") _push(ssrRenderComponent(VPPage_default, null, {
				"page-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
				}),
				"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if (unref(frontmatter).layout === "home") _push(ssrRenderComponent(VPHome_default, null, {
				"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
				}),
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
				}),
				"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
				}),
				"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if (unref(frontmatter).layout && unref(frontmatter).layout !== "doc") ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(frontmatter).layout), null, null), _parent);
			else _push(ssrRenderComponent(VPDoc_default, null, {
				"doc-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
				}),
				"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
				}),
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				"doc-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
				}),
				"doc-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
				}),
				"aside-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
				}),
				"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
				}),
				"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
				}),
				"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
				}),
				"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
				}),
				"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue
var _sfc_setup$47 = VPContent_vue_vue_type_script_setup_true_lang_default.setup;
VPContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue");
	return _sfc_setup$47 ? _sfc_setup$47(props, ctx) : void 0;
};
var VPContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPContent_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4c39d267"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue?vue&type=script&setup=true&lang.ts
var VPFooter_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, frontmatter } = useData();
		const { hasSidebar } = useSidebar();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).footer && unref(frontmatter).footer !== false) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: ["VPFooter", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-4336637d><div class="container" data-v-4336637d>`);
				if (unref(theme).footer.message) _push(`<p class="message" data-v-4336637d>${unref(theme).footer.message ?? ""}</p>`);
				else _push(`<!---->`);
				if (unref(theme).footer.copyright) _push(`<p class="copyright" data-v-4336637d>${unref(theme).footer.copyright ?? ""}</p>`);
				else _push(`<!---->`);
				_push(`</div></footer>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue
var _sfc_setup$46 = VPFooter_vue_vue_type_script_setup_true_lang_default.setup;
VPFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue");
	return _sfc_setup$46 ? _sfc_setup$46(props, ctx) : void 0;
};
var VPFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFooter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4336637d"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/local-nav.js
function useLocalNav() {
	const { theme, frontmatter } = useData();
	const headers = shallowRef([]);
	const hasLocalNav = computed(() => {
		return headers.value.length > 0;
	});
	onContentUpdated(() => {
		headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
	});
	return {
		headers,
		hasLocalNav
	};
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue?vue&type=script&setup=true&lang.ts
var VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLocalNavOutlineDropdown",
	__ssrInlineRender: true,
	props: {
		headers: {},
		navHeight: {}
	},
	setup(__props) {
		const { theme } = useData();
		const open = ref(false);
		const vh = ref(0);
		const main = ref();
		ref();
		function closeOnClickOutside(e) {
			if (!main.value?.contains(e.target)) open.value = false;
		}
		watch(open, (value) => {
			if (value) {
				document.addEventListener("click", closeOnClickOutside);
				return;
			}
			document.removeEventListener("click", closeOnClickOutside);
		});
		onKeyStroke("Escape", () => {
			open.value = false;
		});
		onContentUpdated(() => {
			open.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "VPLocalNavOutlineDropdown",
				style: { "--vp-vh": vh.value + "px" },
				ref_key: "main",
				ref: main
			}, _attrs))} data-v-b2268c71>`);
			if (__props.headers.length > 0) _push(`<button class="${ssrRenderClass({ open: open.value })}" data-v-b2268c71><span class="menu-text" data-v-b2268c71>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</span><span class="vpi-chevron-right icon" data-v-b2268c71></span></button>`);
			else _push(`<button data-v-b2268c71>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</button>`);
			if (open.value) {
				_push(`<div class="items" data-v-b2268c71><div class="header" data-v-b2268c71><a class="top-link" href="#" data-v-b2268c71>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</a></div><div class="outline" data-v-b2268c71>`);
				_push(ssrRenderComponent(VPDocOutlineItem_default, { headers: __props.headers }, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue
var _sfc_setup$45 = VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default.setup;
VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue");
	return _sfc_setup$45 ? _sfc_setup$45(props, ctx) : void 0;
};
var VPLocalNavOutlineDropdown_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b2268c71"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue?vue&type=script&setup=true&lang.ts
var VPLocalNav_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLocalNav",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	emits: ["open-menu"],
	setup(__props) {
		const { theme, frontmatter } = useData();
		const { hasSidebar } = useSidebar();
		const { headers } = useLocalNav();
		const { y } = useWindowScroll();
		const navHeight = ref(0);
		onMounted(() => {
			navHeight.value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--vp-nav-height"));
		});
		onContentUpdated(() => {
			headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
		});
		const empty = computed(() => {
			return headers.value.length === 0;
		});
		const emptyAndNoSidebar = computed(() => {
			return empty.value && !hasSidebar.value;
		});
		const classes = computed(() => {
			return {
				VPLocalNav: true,
				"has-sidebar": hasSidebar.value,
				empty: empty.value,
				fixed: emptyAndNoSidebar.value
			};
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(frontmatter).layout !== "home" && (!emptyAndNoSidebar.value || unref(y) >= navHeight.value)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: classes.value }, _attrs))} data-v-bbd3d55c><div class="container" data-v-bbd3d55c>`);
				if (unref(hasSidebar)) _push(`<button class="menu"${ssrRenderAttr("aria-expanded", __props.open)} aria-controls="VPSidebarNav" data-v-bbd3d55c><span class="vpi-align-left menu-icon" data-v-bbd3d55c></span><span class="menu-text" data-v-bbd3d55c>${ssrInterpolate(unref(theme).sidebarMenuLabel || "Menu")}</span></button>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPLocalNavOutlineDropdown_default, {
					headers: unref(headers),
					navHeight: navHeight.value
				}, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue
var _sfc_setup$44 = VPLocalNav_vue_vue_type_script_setup_true_lang_default.setup;
VPLocalNav_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue");
	return _sfc_setup$44 ? _sfc_setup$44(props, ctx) : void 0;
};
var VPLocalNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPLocalNav_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-bbd3d55c"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/nav.js
function useNav() {
	const isScreenOpen = ref(false);
	function openScreen() {
		isScreenOpen.value = true;
		window.addEventListener("resize", closeScreenOnTabletWindow);
	}
	function closeScreen() {
		isScreenOpen.value = false;
		window.removeEventListener("resize", closeScreenOnTabletWindow);
	}
	function toggleScreen() {
		isScreenOpen.value ? closeScreen() : openScreen();
	}
	/**
	* Close screen when the user resizes the window wider than tablet size.
	*/
	function closeScreenOnTabletWindow() {
		window.outerWidth >= 768 && closeScreen();
	}
	const route = useRoute();
	watch(() => route.path, closeScreen);
	return {
		isScreenOpen,
		openScreen,
		closeScreen,
		toggleScreen
	};
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue
var _sfc_main$3 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
	_push(`<button${ssrRenderAttrs(mergeProps({
		class: "VPSwitch",
		type: "button",
		role: "switch"
	}, _attrs))} data-v-5b5ea172><span class="check" data-v-5b5ea172>`);
	if (_ctx.$slots.default) {
		_push(`<span class="icon" data-v-5b5ea172>`);
		ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
		_push(`</span>`);
	} else _push(`<!---->`);
	_push(`</span></button>`);
}
var _sfc_setup$43 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue");
	return _sfc_setup$43 ? _sfc_setup$43(props, ctx) : void 0;
};
var VPSwitch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$3, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-5b5ea172"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue?vue&type=script&setup=true&lang.ts
var VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSwitchAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { isDark, theme } = useData();
		const toggleAppearance = inject("toggle-appearance", () => {
			isDark.value = !isDark.value;
		});
		const switchTitle = ref("");
		watchPostEffect(() => {
			switchTitle.value = isDark.value ? theme.value.lightModeSwitchTitle || "Switch to light theme" : theme.value.darkModeSwitchTitle || "Switch to dark theme";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPSwitch_default, mergeProps({
				title: switchTitle.value,
				class: "VPSwitchAppearance",
				"aria-checked": unref(isDark),
				onClick: unref(toggleAppearance)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="vpi-sun sun" data-v-93684259${_scopeId}></span><span class="vpi-moon moon" data-v-93684259${_scopeId}></span>`);
					else return [createVNode("span", { class: "vpi-sun sun" }), createVNode("span", { class: "vpi-moon moon" })];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue
var _sfc_setup$42 = VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue");
	return _sfc_setup$42 ? _sfc_setup$42(props, ctx) : void 0;
};
var VPSwitchAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-93684259"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue?vue&type=script&setup=true&lang.ts
var VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { site } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarAppearance" }, _attrs))} data-v-17b35179>`);
				_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue
var _sfc_setup$41 = VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue");
	return _sfc_setup$41 ? _sfc_setup$41(props, ctx) : void 0;
};
var VPNavBarAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-17b35179"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/flyout.js
var focusedElement = ref();
var active = false;
var listeners = 0;
function useFlyout(options) {
	const focus = ref(false);
	if (inBrowser) {
		!active && activateFocusTracking();
		listeners++;
		const unwatch = watch(focusedElement, (el) => {
			if (el === options.el.value || options.el.value?.contains(el)) {
				focus.value = true;
				options.onFocus?.();
			} else {
				focus.value = false;
				options.onBlur?.();
			}
		});
		onUnmounted(() => {
			unwatch();
			listeners--;
			if (!listeners) deactivateFocusTracking();
		});
	}
	return readonly(focus);
}
function activateFocusTracking() {
	document.addEventListener("focusin", handleFocusIn);
	active = true;
	focusedElement.value = document.activeElement;
}
function deactivateFocusTracking() {
	document.removeEventListener("focusin", handleFocusIn);
}
function handleFocusIn() {
	focusedElement.value = document.activeElement;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPMenuLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const { page } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuLink" }, _attrs))} data-v-36243d37>`);
			_push(ssrRenderComponent(VPLink_default, {
				class: { active: unref(isActive)(unref(page).relativePath, __props.item.activeMatch || __props.item.link, !!__props.item.activeMatch) },
				href: __props.item.link,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-36243d37${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue
var _sfc_setup$40 = VPMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue");
	return _sfc_setup$40 ? _sfc_setup$40(props, ctx) : void 0;
};
var VPMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-36243d37"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPMenuGroup",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuGroup" }, _attrs))} data-v-3130561f>`);
			if (__props.text) _push(`<p class="title" data-v-3130561f>${ssrInterpolate(__props.text)}</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<!--[-->`);
				if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue
var _sfc_setup$39 = VPMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue");
	return _sfc_setup$39 ? _sfc_setup$39(props, ctx) : void 0;
};
var VPMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenuGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3130561f"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue?vue&type=script&setup=true&lang.ts
var VPMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPMenu",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenu" }, _attrs))} data-v-54d1a80e>`);
			if (__props.items) {
				_push(`<div class="items" data-v-54d1a80e><!--[-->`);
				ssrRenderList(__props.items, (item) => {
					_push(`<!--[-->`);
					if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
					else _push(ssrRenderComponent(VPMenuGroup_default, {
						text: item.text,
						items: item.items
					}, null, _parent));
					_push(`<!--]-->`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue
var _sfc_setup$38 = VPMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue");
	return _sfc_setup$38 ? _sfc_setup$38(props, ctx) : void 0;
};
var VPMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenu_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-54d1a80e"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue?vue&type=script&setup=true&lang.ts
var VPFlyout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFlyout",
	__ssrInlineRender: true,
	props: {
		icon: {},
		button: {},
		label: {},
		items: {}
	},
	setup(__props) {
		const open = ref(false);
		const el = ref();
		useFlyout({
			el,
			onBlur
		});
		function onBlur() {
			open.value = false;
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "VPFlyout",
				ref_key: "el",
				ref: el
			}, _attrs))} data-v-4ea67799><button type="button" class="button" aria-haspopup="true"${ssrRenderAttr("aria-expanded", open.value)}${ssrRenderAttr("aria-label", __props.label)} data-v-4ea67799>`);
			if (__props.button || __props.icon) {
				_push(`<span class="text" data-v-4ea67799>`);
				if (__props.icon) _push(`<span class="${ssrRenderClass([__props.icon, "option-icon"])}" data-v-4ea67799></span>`);
				else _push(`<!---->`);
				if (__props.button) _push(`<span data-v-4ea67799>${__props.button ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`<span class="vpi-chevron-down text-icon" data-v-4ea67799></span></span>`);
			} else _push(`<span class="vpi-more-horizontal icon" data-v-4ea67799></span>`);
			_push(`</button><div class="menu" data-v-4ea67799>`);
			_push(ssrRenderComponent(VPMenu_default, { items: __props.items }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue
var _sfc_setup$37 = VPFlyout_vue_vue_type_script_setup_true_lang_default.setup;
VPFlyout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue");
	return _sfc_setup$37 ? _sfc_setup$37(props, ctx) : void 0;
};
var VPFlyout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFlyout_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4ea67799"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue?vue&type=script&setup=true&lang.ts
var VPSocialLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSocialLink",
	__ssrInlineRender: true,
	props: {
		icon: {},
		link: {},
		ariaLabel: {}
	},
	setup(__props) {
		const props = __props;
		const el = ref();
		onMounted(async () => {
			await nextTick();
			const span = el.value?.children[0];
			if (span instanceof HTMLElement && span.className.startsWith("vpi-social-") && (getComputedStyle(span).maskImage || getComputedStyle(span).webkitMaskImage) === "none") span.style.setProperty("--icon", `url('https://api.iconify.design/simple-icons/${props.icon}.svg')`);
		});
		const svg = computed(() => {
			if (typeof props.icon === "object") return props.icon.svg;
			return `<span class="vpi-social-${props.icon}"></span>`;
		});
		typeof props.icon === "string" && useSSRContext()?.vpSocialIcons.add(props.icon);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				ref_key: "el",
				ref: el,
				class: "VPSocialLink no-icon",
				href: __props.link,
				"aria-label": __props.ariaLabel ?? (typeof __props.icon === "string" ? __props.icon : ""),
				target: "_blank",
				rel: "noopener"
			}, _attrs))} data-v-4502101c>${svg.value ?? ""}</a>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue
var _sfc_setup$36 = VPSocialLink_vue_vue_type_script_setup_true_lang_default.setup;
VPSocialLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue");
	return _sfc_setup$36 ? _sfc_setup$36(props, ctx) : void 0;
};
var VPSocialLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSocialLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4502101c"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSocialLinks",
	__ssrInlineRender: true,
	props: { links: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPSocialLinks" }, _attrs))} data-v-8ecc6215><!--[-->`);
			ssrRenderList(__props.links, ({ link, icon, ariaLabel }) => {
				_push(ssrRenderComponent(VPSocialLink_default, {
					key: link,
					icon,
					link,
					ariaLabel
				}, null, _parent));
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue
var _sfc_setup$35 = VPSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue");
	return _sfc_setup$35 ? _sfc_setup$35(props, ctx) : void 0;
};
var VPSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSocialLinks_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8ecc6215"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue?vue&type=script&setup=true&lang.ts
var VPNavBarExtra_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarExtra",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
		const hasExtraContent = computed(() => localeLinks.value.length && currentLang.value.label || site.value.appearance || theme.value.socialLinks);
		return (_ctx, _push, _parent, _attrs) => {
			if (hasExtraContent.value) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: "VPNavBarExtra",
				label: "extra navigation"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(localeLinks).length && unref(currentLang).label) {
							_push(`<div class="group translations" data-v-4be6bd77${_scopeId}><p class="trans-title" data-v-4be6bd77${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</p><!--[-->`);
							ssrRenderList(unref(localeLinks), (locale) => {
								_push(ssrRenderComponent(VPMenuLink_default, { item: locale }, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						} else _push(`<!---->`);
						if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
							_push(`<div class="group" data-v-4be6bd77${_scopeId}><div class="item appearance" data-v-4be6bd77${_scopeId}><p class="label" data-v-4be6bd77${_scopeId}>${ssrInterpolate(unref(theme).darkModeSwitchLabel || "Appearance")}</p><div class="appearance-action" data-v-4be6bd77${_scopeId}>`);
							_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent, _scopeId));
							_push(`</div></div></div>`);
						} else _push(`<!---->`);
						if (unref(theme).socialLinks) {
							_push(`<div class="group" data-v-4be6bd77${_scopeId}><div class="item social-links" data-v-4be6bd77${_scopeId}>`);
							_push(ssrRenderComponent(VPSocialLinks_default, {
								class: "social-links-list",
								links: unref(theme).socialLinks
							}, null, _parent, _scopeId));
							_push(`</div></div>`);
						} else _push(`<!---->`);
					} else return [
						unref(localeLinks).length && unref(currentLang).label ? (openBlock(), createBlock("div", {
							key: 0,
							class: "group translations"
						}, [createVNode("p", { class: "trans-title" }, toDisplayString(unref(currentLang).label), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
							return openBlock(), createBlock(VPMenuLink_default, {
								key: locale.link,
								item: locale
							}, null, 8, ["item"]);
						}), 128))])) : createCommentVNode("", true),
						unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto" ? (openBlock(), createBlock("div", {
							key: 1,
							class: "group"
						}, [createVNode("div", { class: "item appearance" }, [createVNode("p", { class: "label" }, toDisplayString(unref(theme).darkModeSwitchLabel || "Appearance"), 1), createVNode("div", { class: "appearance-action" }, [createVNode(VPSwitchAppearance_default)])])])) : createCommentVNode("", true),
						unref(theme).socialLinks ? (openBlock(), createBlock("div", {
							key: 2,
							class: "group"
						}, [createVNode("div", { class: "item social-links" }, [createVNode(VPSocialLinks_default, {
							class: "social-links-list",
							links: unref(theme).socialLinks
						}, null, 8, ["links"])])])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue
var _sfc_setup$34 = VPNavBarExtra_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarExtra_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue");
	return _sfc_setup$34 ? _sfc_setup$34(props, ctx) : void 0;
};
var VPNavBarExtra_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarExtra_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4be6bd77"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue?vue&type=script&setup=true&lang.ts
var VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarHamburger",
	__ssrInlineRender: true,
	props: { active: { type: Boolean } },
	emits: ["click"],
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: ["VPNavBarHamburger", { active: __props.active }],
				"aria-label": "mobile navigation",
				"aria-expanded": __props.active,
				"aria-controls": "VPNavScreen"
			}, _attrs))} data-v-29017437><span class="container" data-v-29017437><span class="top" data-v-29017437></span><span class="middle" data-v-29017437></span><span class="bottom" data-v-29017437></span></span></button>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue
var _sfc_setup$33 = VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue");
	return _sfc_setup$33 ? _sfc_setup$33(props, ctx) : void 0;
};
var VPNavBarHamburger_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-29017437"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenuLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const { page } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: {
					VPNavBarMenuLink: true,
					active: unref(isActive)(unref(page).relativePath, __props.item.activeMatch || __props.item.link, !!__props.item.activeMatch)
				},
				href: __props.item.link,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				tabindex: "0"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-9b49baf5${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue
var _sfc_setup$32 = VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue");
	return _sfc_setup$32 ? _sfc_setup$32(props, ctx) : void 0;
};
var VPNavBarMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9b49baf5"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenuGroup",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const props = __props;
		const { page } = useData();
		const isChildActive = (navItem) => {
			if ("component" in navItem) return false;
			if ("link" in navItem) return isActive(page.value.relativePath, navItem.link, !!props.item.activeMatch);
			return navItem.items.some(isChildActive);
		};
		const childrenActive = computed(() => isChildActive(props.item));
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: {
					VPNavBarMenuGroup: true,
					active: unref(isActive)(unref(page).relativePath, __props.item.activeMatch, !!__props.item.activeMatch) || childrenActive.value
				},
				button: __props.item.text,
				items: __props.item.items
			}, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue
var _sfc_setup$31 = VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue");
	return _sfc_setup$31 ? _sfc_setup$31(props, ctx) : void 0;
};
var VPNavBarMenuGroup_default = VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenu",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).nav) {
				_push(`<nav${ssrRenderAttrs(mergeProps({
					"aria-labelledby": "main-nav-aria-label",
					class: "VPNavBarMenu"
				}, _attrs))} data-v-a5573501><span id="main-nav-aria-label" class="visually-hidden" data-v-a5573501> Main Navigation </span><!--[-->`);
				ssrRenderList(unref(theme).nav, (item) => {
					_push(`<!--[-->`);
					if ("link" in item) _push(ssrRenderComponent(VPNavBarMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
					else _push(ssrRenderComponent(VPNavBarMenuGroup_default, { item }, null, _parent));
					_push(`<!--]-->`);
				});
				_push(`<!--]--></nav>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue
var _sfc_setup$30 = VPNavBarMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue");
	return _sfc_setup$30 ? _sfc_setup$30(props, ctx) : void 0;
};
var VPNavBarMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarMenu_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a5573501"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/support/translation.js
/**
* @param themeObject Can be an object with `translations` and `locales` properties
*/
function createSearchTranslate(defaultTranslations) {
	const { localeIndex, theme } = useData();
	function translate(key) {
		const keyPath = key.split(".");
		const themeObject = theme.value.search?.options;
		const isObject = themeObject && typeof themeObject === "object";
		const locales = isObject && themeObject.locales?.[localeIndex.value]?.translations || null;
		const translations = isObject && themeObject.translations || null;
		let localeResult = locales;
		let translationResult = translations;
		let defaultResult = defaultTranslations;
		const lastKey = keyPath.pop();
		for (const k of keyPath) {
			let fallbackResult = null;
			const foundInFallback = defaultResult?.[k];
			if (foundInFallback) fallbackResult = defaultResult = foundInFallback;
			const foundInTranslation = translationResult?.[k];
			if (foundInTranslation) fallbackResult = translationResult = foundInTranslation;
			const foundInLocale = localeResult?.[k];
			if (foundInLocale) fallbackResult = localeResult = foundInLocale;
			if (!foundInFallback) defaultResult = fallbackResult;
			if (!foundInTranslation) translationResult = fallbackResult;
			if (!foundInLocale) localeResult = fallbackResult;
		}
		return localeResult?.[lastKey] ?? translationResult?.[lastKey] ?? defaultResult?.[lastKey] ?? "";
	}
	return translate;
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSearchButton",
	__ssrInlineRender: true,
	setup(__props) {
		const translate = createSearchTranslate({ button: {
			buttonText: "Search",
			buttonAriaLabel: "Search"
		} });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: "DocSearch DocSearch-Button",
				"aria-label": unref(translate)("button.buttonAriaLabel")
			}, _attrs))}><span class="DocSearch-Button-Container"><span class="vp-icon DocSearch-Search-Icon"></span><span class="DocSearch-Button-Placeholder">${ssrInterpolate(unref(translate)("button.buttonText"))}</span></span><span class="DocSearch-Button-Keys"><kbd class="DocSearch-Button-Key"></kbd><kbd class="DocSearch-Button-Key">K</kbd></span></button>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue
var _sfc_setup$29 = VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue");
	return _sfc_setup$29 ? _sfc_setup$29(props, ctx) : void 0;
};
var VPNavBarSearchButton_default = VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSearch_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSearch",
	__ssrInlineRender: true,
	setup(__props) {
		const VPLocalSearchBox = defineAsyncComponent(() => import("./VPLocalSearchBox.B0sD1MLw.js"));
		const VPAlgoliaSearchBox = () => null;
		const { theme } = useData();
		const loaded = ref(false);
		const actuallyLoaded = ref(false);
		onMounted(() => {});
		function load() {
			if (!loaded.value) {
				loaded.value = true;
				setTimeout(poll, 16);
			}
		}
		function poll() {
			const e = new Event("keydown");
			e.key = "k";
			e.metaKey = true;
			window.dispatchEvent(e);
			setTimeout(() => {
				if (!document.querySelector(".DocSearch-Modal")) poll();
			}, 16);
		}
		function isEditingContent(event) {
			const element = event.target;
			const tagName = element.tagName;
			return element.isContentEditable || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
		}
		const showSearch = ref(false);
		onKeyStroke("k", (event) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		onKeyStroke("/", (event) => {
			if (!isEditingContent(event)) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		const provider = "local";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarSearch" }, _attrs))}>`);
			if (unref(provider) === "local") {
				_push(`<!--[-->`);
				if (showSearch.value) _push(ssrRenderComponent(unref(VPLocalSearchBox), { onClose: ($event) => showSearch.value = false }, null, _parent));
				else _push(`<!---->`);
				_push(`<div id="local-search">`);
				_push(ssrRenderComponent(VPNavBarSearchButton_default, { onClick: ($event) => showSearch.value = true }, null, _parent));
				_push(`</div><!--]-->`);
			} else if (unref(provider) === "algolia") {
				_push(`<!--[-->`);
				if (loaded.value) _push(ssrRenderComponent(unref(VPAlgoliaSearchBox), {
					algolia: unref(theme).search?.options ?? unref(theme).algolia,
					onVnodeBeforeMount: ($event) => actuallyLoaded.value = true
				}, null, _parent));
				else _push(`<!---->`);
				if (!actuallyLoaded.value) {
					_push(`<div id="docsearch">`);
					_push(ssrRenderComponent(VPNavBarSearchButton_default, { onClick: load }, null, _parent));
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue
var _sfc_setup$28 = VPNavBarSearch_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSearch_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue");
	return _sfc_setup$28 ? _sfc_setup$28(props, ctx) : void 0;
};
var VPNavBarSearch_default = VPNavBarSearch_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSocialLinks",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).socialLinks) _push(ssrRenderComponent(VPSocialLinks_default, mergeProps({
				class: "VPNavBarSocialLinks",
				links: unref(theme).socialLinks
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue
var _sfc_setup$27 = VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue");
	return _sfc_setup$27 ? _sfc_setup$27(props, ctx) : void 0;
};
var VPNavBarSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1bfa5035"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue?vue&type=script&setup=true&lang.ts
var VPNavBarTitle_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarTitle",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		const { hasSidebar } = useSidebar();
		const { currentLang } = useLangs();
		const link = computed(() => typeof theme.value.logoLink === "string" ? theme.value.logoLink : theme.value.logoLink?.link);
		const rel = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.rel);
		const target = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.target);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBarTitle", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-a4b27cc1><a class="title"${ssrRenderAttr("href", link.value ?? unref(normalizeLink$1)(unref(currentLang).link))}${ssrRenderAttr("rel", rel.value)}${ssrRenderAttr("target", target.value)} data-v-a4b27cc1>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent);
			if (unref(theme).logo) _push(ssrRenderComponent(VPImage_default, {
				class: "logo",
				image: unref(theme).logo
			}, null, _parent));
			else _push(`<!---->`);
			if (unref(theme).siteTitle) _push(`<span data-v-a4b27cc1>${unref(theme).siteTitle ?? ""}</span>`);
			else if (unref(theme).siteTitle === void 0) _push(`<span data-v-a4b27cc1>${ssrInterpolate(unref(site).title)}</span>`);
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent);
			_push(`</a></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue
var _sfc_setup$26 = VPNavBarTitle_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarTitle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue");
	return _sfc_setup$26 ? _sfc_setup$26(props, ctx) : void 0;
};
var VPNavBarTitle_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarTitle_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a4b27cc1"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue?vue&type=script&setup=true&lang.ts
var VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarTranslations",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(localeLinks).length && unref(currentLang).label) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: "VPNavBarTranslations",
				icon: "vpi-languages",
				label: unref(theme).langMenuLabel || "Change language"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="items" data-v-609d90bc${_scopeId}><p class="title" data-v-609d90bc${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</p><!--[-->`);
						ssrRenderList(unref(localeLinks), (locale) => {
							_push(ssrRenderComponent(VPMenuLink_default, { item: locale }, null, _parent, _scopeId));
						});
						_push(`<!--]--></div>`);
					} else return [createVNode("div", { class: "items" }, [createVNode("p", { class: "title" }, toDisplayString(unref(currentLang).label), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
						return openBlock(), createBlock(VPMenuLink_default, {
							key: locale.link,
							item: locale
						}, null, 8, ["item"]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue
var _sfc_setup$25 = VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue");
	return _sfc_setup$25 ? _sfc_setup$25(props, ctx) : void 0;
};
var VPNavBarTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-609d90bc"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue?vue&type=script&setup=true&lang.ts
var VPNavBar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBar",
	__ssrInlineRender: true,
	props: { isScreenOpen: { type: Boolean } },
	emits: ["toggle-screen"],
	setup(__props) {
		const props = __props;
		const { y } = useWindowScroll();
		const { hasSidebar } = useSidebar();
		const { frontmatter } = useData();
		const classes = ref({});
		watchPostEffect(() => {
			classes.value = {
				"has-sidebar": hasSidebar.value,
				"home": frontmatter.value.layout === "home",
				"top": y.value === 0,
				"screen-open": props.isScreenOpen
			};
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBar", classes.value] }, _attrs))} data-v-92e3ef6d><div class="wrapper" data-v-92e3ef6d><div class="container" data-v-92e3ef6d><div class="title" data-v-92e3ef6d>`);
			_push(ssrRenderComponent(VPNavBarTitle_default, null, {
				"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
				}),
				"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div><div class="content" data-v-92e3ef6d><div class="content-body" data-v-92e3ef6d>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarSearch_default, { class: "search" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarMenu_default, { class: "menu" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarTranslations_default, { class: "translations" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarAppearance_default, { class: "appearance" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarSocialLinks_default, { class: "social-links" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarExtra_default, { class: "extra" }, null, _parent));
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarHamburger_default, {
				class: "hamburger",
				active: __props.isScreenOpen,
				onClick: ($event) => _ctx.$emit("toggle-screen")
			}, null, _parent));
			_push(`</div></div></div></div><div class="divider" data-v-92e3ef6d><div class="divider-line" data-v-92e3ef6d></div></div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue
var _sfc_setup$24 = VPNavBar_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue");
	return _sfc_setup$24 ? _sfc_setup$24(props, ctx) : void 0;
};
var VPNavBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-92e3ef6d"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenAppearance" }, _attrs))} data-v-429b4127><p class="text" data-v-429b4127>${ssrInterpolate(unref(theme).darkModeSwitchLabel || "Appearance")}</p>`);
				_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue
var _sfc_setup$23 = VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue");
	return _sfc_setup$23 ? _sfc_setup$23(props, ctx) : void 0;
};
var VPNavScreenAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-429b4127"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const closeScreen = inject("close-screen");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: "VPNavScreenMenuLink",
				href: __props.item.link,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick: unref(closeScreen)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-5c02c15a${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue
var _sfc_setup$22 = VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
var VPNavScreenMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5c02c15a"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroupLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const closeScreen = inject("close-screen");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: "VPNavScreenMenuGroupLink",
				href: __props.item.link,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick: unref(closeScreen)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-3768fb3f${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue
var _sfc_setup$21 = VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var VPNavScreenMenuGroupLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3768fb3f"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroupSection",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenuGroupSection" }, _attrs))} data-v-0902de14>`);
			if (__props.text) _push(`<p class="title" data-v-0902de14>${ssrInterpolate(__props.text)}</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(ssrRenderComponent(VPNavScreenMenuGroupLink_default, {
					key: item.text,
					item
				}, null, _parent));
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue
var _sfc_setup$20 = VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var VPNavScreenMenuGroupSection_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0902de14"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroup",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		const props = __props;
		const isOpen = ref(false);
		const groupId = computed(() => `NavScreenGroup-${props.text.replace(" ", "-").toLowerCase()}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavScreenMenuGroup", { open: isOpen.value }] }, _attrs))} data-v-5cfb8b56><button class="button"${ssrRenderAttr("aria-controls", groupId.value)}${ssrRenderAttr("aria-expanded", isOpen.value)} data-v-5cfb8b56><span class="button-text" data-v-5cfb8b56>${__props.text ?? ""}</span><span class="vpi-plus button-icon" data-v-5cfb8b56></span></button><div${ssrRenderAttr("id", groupId.value)} class="items" data-v-5cfb8b56><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<!--[-->`);
				if ("link" in item) {
					_push(`<div class="item" data-v-5cfb8b56>`);
					_push(ssrRenderComponent(VPNavScreenMenuGroupLink_default, { item }, null, _parent));
					_push(`</div>`);
				} else if ("component" in item) {
					_push(`<div class="item" data-v-5cfb8b56>`);
					ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
					_push(`</div>`);
				} else {
					_push(`<div class="group" data-v-5cfb8b56>`);
					_push(ssrRenderComponent(VPNavScreenMenuGroupSection_default, {
						text: item.text,
						items: item.items
					}, null, _parent));
					_push(`</div>`);
				}
				_push(`<!--]-->`);
			});
			_push(`<!--]--></div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue
var _sfc_setup$19 = VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var VPNavScreenMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5cfb8b56"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenu",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).nav) {
				_push(`<nav${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenu" }, _attrs))}><!--[-->`);
				ssrRenderList(unref(theme).nav, (item) => {
					_push(`<!--[-->`);
					if ("link" in item) _push(ssrRenderComponent(VPNavScreenMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
					else _push(ssrRenderComponent(VPNavScreenMenuGroup_default, {
						text: item.text || "",
						items: item.items
					}, null, _parent));
					_push(`<!--]-->`);
				});
				_push(`<!--]--></nav>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue
var _sfc_setup$18 = VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
var VPNavScreenMenu_default = VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenSocialLinks",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).socialLinks) _push(ssrRenderComponent(VPSocialLinks_default, mergeProps({
				class: "VPNavScreenSocialLinks",
				links: unref(theme).socialLinks
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue
var _sfc_setup$17 = VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
var VPNavScreenSocialLinks_default = VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenTranslations",
	__ssrInlineRender: true,
	setup(__props) {
		const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
		const isOpen = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(localeLinks).length && unref(currentLang).label) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavScreenTranslations", { open: isOpen.value }] }, _attrs))} data-v-99ff14be><button class="title" data-v-99ff14be><span class="vpi-languages icon lang" data-v-99ff14be></span> ${ssrInterpolate(unref(currentLang).label)} <span class="vpi-chevron-down icon chevron" data-v-99ff14be></span></button><ul class="list" data-v-99ff14be><!--[-->`);
				ssrRenderList(unref(localeLinks), (locale) => {
					_push(`<li class="item" data-v-99ff14be>`);
					_push(ssrRenderComponent(VPLink_default, {
						class: "link",
						href: locale.link
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`${ssrInterpolate(locale.text)}`);
							else return [createTextVNode(toDisplayString(locale.text), 1)];
						}),
						_: 2
					}, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue
var _sfc_setup$16 = VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var VPNavScreenTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-99ff14be"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue?vue&type=script&setup=true&lang.ts
var VPNavScreen_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreen",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	setup(__props) {
		const screen = ref(null);
		useScrollLock(inBrowser ? document.body : null);
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.open) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					class: "VPNavScreen",
					ref_key: "screen",
					ref: screen,
					id: "VPNavScreen"
				}, _attrs))} data-v-76397b7c><div class="container" data-v-76397b7c>`);
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPNavScreenMenu_default, { class: "menu" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenTranslations_default, { class: "translations" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenAppearance_default, { class: "appearance" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenSocialLinks_default, { class: "social-links" }, null, _parent));
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue
var _sfc_setup$15 = VPNavScreen_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreen_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
var VPNavScreen_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreen_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-76397b7c"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue?vue&type=script&setup=true&lang.ts
var VPNav_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNav",
	__ssrInlineRender: true,
	setup(__props) {
		const { isScreenOpen, closeScreen, toggleScreen } = useNav();
		const { frontmatter } = useData();
		const hasNavbar = computed(() => {
			return frontmatter.value.navbar !== false;
		});
		provide("close-screen", closeScreen);
		watchEffect(() => {
			if (inBrowser) document.documentElement.classList.toggle("hide-nav", !hasNavbar.value);
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (hasNavbar.value) {
				_push(`<header${ssrRenderAttrs(mergeProps({ class: "VPNav" }, _attrs))} data-v-7aa84382>`);
				_push(ssrRenderComponent(VPNavBar_default, {
					"is-screen-open": unref(isScreenOpen),
					onToggleScreen: unref(toggleScreen)
				}, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPNavScreen_default, { open: unref(isScreenOpen) }, {
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</header>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue
var _sfc_setup$14 = VPNav_vue_vue_type_script_setup_true_lang_default.setup;
VPNav_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var VPNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNav_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7aa84382"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue?vue&type=script&setup=true&lang.ts
var VPSidebarItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebarItem",
	__ssrInlineRender: true,
	props: {
		item: {},
		depth: {}
	},
	setup(__props) {
		const props = __props;
		const { collapsed, collapsible, isLink, isActiveLink, hasActiveLink, hasChildren, toggle } = useSidebarControl(computed(() => props.item));
		const sectionTag = computed(() => hasChildren.value ? "section" : `div`);
		const linkTag = computed(() => isLink.value ? "a" : "div");
		const textTag = computed(() => {
			return !hasChildren.value ? "p" : props.depth + 2 === 7 ? "p" : `h${props.depth + 2}`;
		});
		const itemRole = computed(() => isLink.value ? void 0 : "button");
		const classes = computed(() => [
			[`level-${props.depth}`],
			{ collapsible: collapsible.value },
			{ collapsed: collapsed.value },
			{ "is-link": isLink.value },
			{ "is-active": isActiveLink.value },
			{ "has-active": hasActiveLink.value }
		]);
		function onItemInteraction(e) {
			if ("key" in e && e.key !== "Enter") return;
			!props.item.link && toggle();
		}
		function onCaretClick() {
			props.item.link && toggle();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPSidebarItem = resolveComponent("VPSidebarItem", true);
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(sectionTag.value), mergeProps({ class: ["VPSidebarItem", classes.value] }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.item.text) {
							_push(`<div class="item"${ssrRenderAttr("role", itemRole.value)}${ssrRenderAttr("tabindex", __props.item.items && 0)} data-v-f3f890c8${_scopeId}><div class="indicator" data-v-f3f890c8${_scopeId}></div>`);
							if (__props.item.link) _push(ssrRenderComponent(VPLink_default, {
								tag: linkTag.value,
								class: "link",
								href: __props.item.link,
								rel: __props.item.rel,
								target: __props.item.target
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
									else return [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
										class: "text",
										innerHTML: __props.item.text
									}, null, 8, ["innerHTML"]))];
								}),
								_: 1
							}, _parent, _scopeId));
							else ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
							if (__props.item.collapsed != null && __props.item.items && __props.item.items.length) _push(`<div class="caret" role="button" aria-label="toggle section" tabindex="0" data-v-f3f890c8${_scopeId}><span class="vpi-chevron-right caret-icon" data-v-f3f890c8${_scopeId}></span></div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (__props.item.items && __props.item.items.length) {
							_push(`<div class="items" data-v-f3f890c8${_scopeId}>`);
							if (__props.depth < 5) {
								_push(`<!--[-->`);
								ssrRenderList(__props.item.items, (i) => {
									_push(ssrRenderComponent(_component_VPSidebarItem, {
										key: i.text,
										item: i,
										depth: __props.depth + 1
									}, null, _parent, _scopeId));
								});
								_push(`<!--]-->`);
							} else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [__props.item.text ? (openBlock(), createBlock("div", mergeProps({
						key: 0,
						class: "item",
						role: itemRole.value
					}, toHandlers(__props.item.items ? {
						click: onItemInteraction,
						keydown: onItemInteraction
					} : {}, true), { tabindex: __props.item.items && 0 }), [
						createVNode("div", { class: "indicator" }),
						__props.item.link ? (openBlock(), createBlock(VPLink_default, {
							key: 0,
							tag: linkTag.value,
							class: "link",
							href: __props.item.link,
							rel: __props.item.rel,
							target: __props.item.target
						}, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
								class: "text",
								innerHTML: __props.item.text
							}, null, 8, ["innerHTML"]))]),
							_: 1
						}, 8, [
							"tag",
							"href",
							"rel",
							"target"
						])) : (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
							key: 1,
							class: "text",
							innerHTML: __props.item.text
						}, null, 8, ["innerHTML"])),
						__props.item.collapsed != null && __props.item.items && __props.item.items.length ? (openBlock(), createBlock("div", {
							key: 2,
							class: "caret",
							role: "button",
							"aria-label": "toggle section",
							onClick: onCaretClick,
							onKeydown: withKeys(onCaretClick, ["enter"]),
							tabindex: "0"
						}, [createVNode("span", { class: "vpi-chevron-right caret-icon" })], 32)) : createCommentVNode("", true)
					], 16, ["role", "tabindex"])) : createCommentVNode("", true), __props.item.items && __props.item.items.length ? (openBlock(), createBlock("div", {
						key: 1,
						class: "items"
					}, [__props.depth < 5 ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(__props.item.items, (i) => {
						return openBlock(), createBlock(_component_VPSidebarItem, {
							key: i.text,
							item: i,
							depth: __props.depth + 1
						}, null, 8, ["item", "depth"]);
					}), 128)) : createCommentVNode("", true)])) : createCommentVNode("", true)];
				}),
				_: 1
			}), _parent);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue
var _sfc_setup$13 = VPSidebarItem_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebarItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var VPSidebarItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebarItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f3f890c8"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue?vue&type=script&setup=true&lang.ts
var VPSidebarGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebarGroup",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		const disableTransition = ref(true);
		let timer = null;
		onMounted(() => {
			timer = setTimeout(() => {
				timer = null;
				disableTransition.value = false;
			}, 300);
		});
		onBeforeUnmount(() => {
			if (timer != null) {
				clearTimeout(timer);
				timer = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<div class="${ssrRenderClass([{ "no-transition": disableTransition.value }, "group"])}" data-v-24a406a0>`);
				_push(ssrRenderComponent(VPSidebarItem_default, {
					item,
					depth: 0
				}, null, _parent));
				_push(`</div>`);
			});
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue
var _sfc_setup$12 = VPSidebarGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebarGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var VPSidebarGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebarGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-24a406a0"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue?vue&type=script&setup=true&lang.ts
var VPSidebar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebar",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	setup(__props) {
		const { sidebarGroups, hasSidebar } = useSidebar();
		const props = __props;
		const navEl = ref(null);
		const isLocked = useScrollLock(inBrowser ? document.body : null);
		watch([props, navEl], () => {
			if (props.open) {
				isLocked.value = true;
				navEl.value?.focus();
			} else isLocked.value = false;
		}, {
			immediate: true,
			flush: "post"
		});
		const key = ref(0);
		watch(sidebarGroups, () => {
			key.value += 1;
		}, { deep: true });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(hasSidebar)) {
				_push(`<aside${ssrRenderAttrs(mergeProps({
					class: ["VPSidebar", { open: __props.open }],
					ref_key: "navEl",
					ref: navEl
				}, _attrs))} data-v-68a43c63><div class="curtain" data-v-68a43c63></div><nav class="nav" id="VPSidebarNav" aria-labelledby="sidebar-aria-label" tabindex="-1" data-v-68a43c63><span class="visually-hidden" id="sidebar-aria-label" data-v-68a43c63> Sidebar Navigation </span>`);
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSidebarGroup_default, {
					items: unref(sidebarGroups),
					key: key.value
				}, null, _parent));
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent);
				_push(`</nav></aside>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue
var _sfc_setup$11 = VPSidebar_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var VPSidebar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-68a43c63"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue?vue&type=script&setup=true&lang.ts
var VPSkipLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSkipLink",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const backToTop = ref();
		watch(() => route.path, () => backToTop.value.focus());
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><span tabindex="-1" data-v-16511787></span><a href="#VPContent" class="VPSkipLink visually-hidden" data-v-16511787>${ssrInterpolate(unref(theme).skipToContentLabel || "Skip to content")}</a><!--]-->`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue
var _sfc_setup$10 = VPSkipLink_vue_vue_type_script_setup_true_lang_default.setup;
VPSkipLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var VPSkipLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSkipLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-16511787"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/Layout.vue?vue&type=script&setup=true&lang.ts
var Layout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Layout",
	__ssrInlineRender: true,
	setup(__props) {
		const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar();
		const route = useRoute();
		watch(() => route.path, closeSidebar);
		useCloseSidebarOnEscape(isSidebarOpen, closeSidebar);
		const { frontmatter } = useData();
		const slots = useSlots();
		const heroImageSlotExists = computed(() => !!slots["home-hero-image"]);
		provide("hero-image-slot-exists", heroImageSlotExists);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			if (unref(frontmatter).layout !== false) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["Layout", unref(frontmatter).pageClass] }, _attrs))} data-v-f66205cd>`);
				ssrRenderSlot(_ctx.$slots, "layout-top", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSkipLink_default, null, null, _parent));
				_push(ssrRenderComponent(VPBackdrop_default, {
					class: "backdrop",
					show: unref(isSidebarOpen),
					onClick: unref(closeSidebar)
				}, null, _parent));
				_push(ssrRenderComponent(VPNav_default, null, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPLocalNav_default, {
					open: unref(isSidebarOpen),
					onOpenMenu: unref(openSidebar)
				}, null, _parent));
				_push(ssrRenderComponent(VPSidebar_default, { open: unref(isSidebarOpen) }, {
					"sidebar-nav-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true)];
					}),
					"sidebar-nav-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPContent_default, null, {
					"page-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
					}),
					"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
					}),
					"not-found": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "not-found", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "not-found", {}, void 0, true)];
					}),
					"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
					}),
					"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
					}),
					"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
					}),
					"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
					}),
					"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
					}),
					"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
					}),
					"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
					}),
					"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
					}),
					"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
					}),
					"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
					}),
					"doc-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
					}),
					"doc-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
					}),
					"doc-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
					}),
					"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
					}),
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPFooter_default, null, null, _parent));
				ssrRenderSlot(_ctx.$slots, "layout-bottom", {}, null, _push, _parent);
				_push(`</div>`);
			} else _push(ssrRenderComponent(_component_Content, _attrs, null, _parent));
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/Layout.vue
var _sfc_setup$9 = Layout_vue_vue_type_script_setup_true_lang_default.setup;
Layout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/Layout.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var Layout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(Layout_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f66205cd"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/composables/sponsor-grid.js
/**
* Defines grid configuration for each sponsor size in tuple.
*
* [Screen width, Column size]
*
* It sets grid size on matching screen size. For example, `[768, 5]` will
* set 5 columns when screen size is bigger or equal to 768px.
*
* Column will set only when item size is bigger than the column size. For
* example, even we define 5 columns, if we only have 1 sponsor yet, we would
* like to show it in 1 column to make it stand out.
*/
var GridSettings = {
	xmini: [[0, 2]],
	mini: [],
	small: [
		[920, 6],
		[768, 5],
		[640, 4],
		[480, 3],
		[0, 2]
	],
	medium: [
		[960, 5],
		[832, 4],
		[640, 3],
		[480, 2]
	],
	big: [[832, 3], [640, 2]]
};
function useSponsorsGrid({ el, size = "medium" }) {
	const onResize = throttleAndDebounce(manage, 100);
	onMounted(() => {
		manage();
		window.addEventListener("resize", onResize);
	});
	onUnmounted(() => {
		window.removeEventListener("resize", onResize);
	});
	function manage() {
		adjustSlots(el.value, size);
	}
}
function adjustSlots(el, size) {
	const tsize = el.children.length;
	const asize = el.querySelectorAll(".vp-sponsor-grid-item:not(.empty)").length;
	manageSlots(el, setGrid(el, size, asize), tsize, asize);
}
function setGrid(el, size, items) {
	const settings = GridSettings[size];
	const screen = window.innerWidth;
	let grid = 1;
	settings.some(([breakpoint, value]) => {
		if (screen >= breakpoint) {
			grid = items < value ? items : value;
			return true;
		}
	});
	setGridData(el, grid);
	return grid;
}
function setGridData(el, value) {
	el.dataset.vpGrid = String(value);
}
function manageSlots(el, grid, tsize, asize) {
	const diff = tsize - asize;
	const rem = asize % grid;
	neutralizeSlots(el, (rem === 0 ? rem : grid - rem) - diff);
}
function neutralizeSlots(el, count) {
	if (count === 0) return;
	count > 0 ? addSlots(el, count) : removeSlots(el, count * -1);
}
function addSlots(el, count) {
	for (let i = 0; i < count; i++) {
		const slot = document.createElement("div");
		slot.classList.add("vp-sponsor-grid-item", "empty");
		el.append(slot);
	}
}
function removeSlots(el, count) {
	for (let i = 0; i < count; i++) el.removeChild(el.lastElementChild);
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue?vue&type=script&setup=true&lang.ts
var VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSponsorsGrid",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		data: {}
	},
	setup(__props) {
		const props = __props;
		const el = ref(null);
		useSponsorsGrid({
			el,
			size: props.size
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: ["VPSponsorsGrid vp-sponsor-grid", [__props.size]],
				ref_key: "el",
				ref: el
			}, _attrs))}><!--[-->`);
			ssrRenderList(__props.data, (sponsor) => {
				_push(`<div class="vp-sponsor-grid-item"><a class="vp-sponsor-grid-link"${ssrRenderAttr("href", sponsor.url)} target="_blank" rel="sponsored noopener"><article class="vp-sponsor-grid-box"><h4 class="visually-hidden">${ssrInterpolate(sponsor.name)}</h4><img class="vp-sponsor-grid-image"${ssrRenderAttr("src", sponsor.img)}${ssrRenderAttr("alt", sponsor.name)}></article></a></div>`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue
var _sfc_setup$8 = VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default.setup;
VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var VPSponsorsGrid_default = VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue?vue&type=script&setup=true&lang.ts
var VPSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSponsors",
	__ssrInlineRender: true,
	props: {
		mode: { default: "normal" },
		tier: {},
		size: {},
		data: {}
	},
	setup(__props) {
		const props = __props;
		const sponsors = computed(() => {
			if (props.data.some((s) => {
				return "items" in s;
			})) return props.data;
			return [{
				tier: props.tier,
				size: props.size,
				items: props.data
			}];
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPSponsors vp-sponsor", [__props.mode]] }, _attrs))}><!--[-->`);
			ssrRenderList(sponsors.value, (sponsor, index) => {
				_push(`<section class="vp-sponsor-section">`);
				if (sponsor.tier) _push(`<h3 class="vp-sponsor-tier">${ssrInterpolate(sponsor.tier)}</h3>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPSponsorsGrid_default, {
					size: sponsor.size,
					data: sponsor.items
				}, null, _parent));
				_push(`</section>`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue
var _sfc_setup$7 = VPSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var VPSponsors_default = VPSponsors_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideSponsors",
	__ssrInlineRender: true,
	props: {
		tier: {},
		size: {},
		data: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideSponsors" }, _attrs))}>`);
			_push(ssrRenderComponent(VPSponsors_default, {
				mode: "aside",
				tier: __props.tier,
				size: __props.size,
				data: __props.data
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue
var _sfc_setup$6 = VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue?vue&type=script&setup=true&lang.ts
var VPHomeSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeSponsors",
	__ssrInlineRender: true,
	props: {
		message: {},
		actionText: { default: "Become a sponsor" },
		actionLink: {},
		data: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({ class: "VPHomeSponsors" }, _attrs))} data-v-71b10d43><div class="container" data-v-71b10d43><div class="header" data-v-71b10d43><div class="love" data-v-71b10d43><span class="vpi-heart icon" data-v-71b10d43></span></div>`);
			if (__props.message) _push(`<h2 class="message" data-v-71b10d43>${ssrInterpolate(__props.message)}</h2>`);
			else _push(`<!---->`);
			_push(`</div><div class="sponsors" data-v-71b10d43>`);
			_push(ssrRenderComponent(VPSponsors_default, { data: __props.data }, null, _parent));
			_push(`</div>`);
			if (__props.actionLink) {
				_push(`<div class="action" data-v-71b10d43>`);
				_push(ssrRenderComponent(VPButton_default, {
					theme: "sponsor",
					text: __props.actionText,
					href: __props.actionLink
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></section>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue
var _sfc_setup$5 = VPHomeSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue?vue&type=script&setup=true&lang.ts
var VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPTeamMembersItem",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		member: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<article${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembersItem", [__props.size]] }, _attrs))} data-v-8dc3746a><div class="profile" data-v-8dc3746a><figure class="avatar" data-v-8dc3746a><img class="avatar-img"${ssrRenderAttr("src", __props.member.avatar)}${ssrRenderAttr("alt", __props.member.name)} data-v-8dc3746a></figure><div class="data" data-v-8dc3746a><h1 class="name" data-v-8dc3746a>${ssrInterpolate(__props.member.name)}</h1>`);
			if (__props.member.title || __props.member.org) {
				_push(`<p class="affiliation" data-v-8dc3746a>`);
				if (__props.member.title) _push(`<span class="title" data-v-8dc3746a>${ssrInterpolate(__props.member.title)}</span>`);
				else _push(`<!---->`);
				if (__props.member.title && __props.member.org) _push(`<span class="at" data-v-8dc3746a> @ </span>`);
				else _push(`<!---->`);
				if (__props.member.org) _push(ssrRenderComponent(VPLink_default, {
					class: ["org", { link: __props.member.orgLink }],
					href: __props.member.orgLink,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(__props.member.org)}`);
						else return [createTextVNode(toDisplayString(__props.member.org), 1)];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</p>`);
			} else _push(`<!---->`);
			if (__props.member.desc) _push(`<p class="desc" data-v-8dc3746a>${__props.member.desc ?? ""}</p>`);
			else _push(`<!---->`);
			if (__props.member.links) {
				_push(`<div class="links" data-v-8dc3746a>`);
				_push(ssrRenderComponent(VPSocialLinks_default, { links: __props.member.links }, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (__props.member.sponsor) {
				_push(`<div class="sp" data-v-8dc3746a>`);
				_push(ssrRenderComponent(VPLink_default, {
					class: "sp-link",
					href: __props.member.sponsor,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<span class="vpi-heart sp-icon" data-v-8dc3746a${_scopeId}></span> ${ssrInterpolate(__props.member.actionText || "Sponsor")}`);
						else return [createVNode("span", { class: "vpi-heart sp-icon" }), createTextVNode(" " + toDisplayString(__props.member.actionText || "Sponsor"), 1)];
					}),
					_: 1
				}, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</article>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue
var _sfc_setup$4 = VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default.setup;
VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var VPTeamMembersItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8dc3746a"]]);
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue?vue&type=script&setup=true&lang.ts
var VPTeamMembers_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPTeamMembers",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		members: {}
	},
	setup(__props) {
		const props = __props;
		const classes = computed(() => [props.size, `count-${props.members.length}`]);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembers", classes.value] }, _attrs))} data-v-aeb3f40e><div class="container" data-v-aeb3f40e><!--[-->`);
			ssrRenderList(__props.members, (member) => {
				_push(`<div class="item" data-v-aeb3f40e>`);
				_push(ssrRenderComponent(VPTeamMembersItem_default, {
					size: __props.size,
					member
				}, null, _parent));
				_push(`</div>`);
			});
			_push(`<!--]--></div></div>`);
		};
	}
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue
var _sfc_setup$3 = VPTeamMembers_vue_vue_type_script_setup_true_lang_default.setup;
VPTeamMembers_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue
var _sfc_main$2 = {};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue
var _sfc_main$1 = {};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue
var _sfc_main = {};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/theme-default/without-fonts.js
var theme = {
	Layout: Layout_default,
	enhanceApp: ({ app }) => {
		app.component("Badge", VPBadge_default);
	}
};
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/components/ClientOnly.js
var ClientOnly = defineComponent({ setup(_, { slots }) {
	const show = ref(false);
	onMounted(() => {
		show.value = true;
	});
	return () => show.value && slots.default ? slots.default() : null;
} });
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/composables/codeGroups.js
function useCodeGroups() {
	if (inBrowser) window.addEventListener("click", (e) => {
		const el = e.target;
		if (el.matches(".vp-code-group input")) {
			const group = el.parentElement?.parentElement;
			if (!group) return;
			const i = Array.from(group.querySelectorAll("input")).indexOf(el);
			if (i < 0) return;
			const blocks = group.querySelector(".blocks");
			if (!blocks) return;
			const current = Array.from(blocks.children).find((child) => child.classList.contains("active"));
			if (!current) return;
			const next = blocks.children[i];
			if (!next || current === next) return;
			current.classList.remove("active");
			next.classList.add("active");
			(group?.querySelector(`label[for="${el.id}"]`))?.scrollIntoView({ block: "nearest" });
		}
	});
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/composables/copyCode.js
function useCopyCode() {
	if (inBrowser) {
		const timeoutIdMap = /* @__PURE__ */ new WeakMap();
		window.addEventListener("click", (e) => {
			const el = e.target;
			if (el.matches("div[class*=\"language-\"] > button.copy")) {
				const parent = el.parentElement;
				const sibling = el.nextElementSibling?.nextElementSibling;
				if (!parent || !sibling) return;
				const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(parent.className);
				const ignoredNodes = [".vp-copy-ignore", ".diff.remove"];
				const clone = sibling.cloneNode(true);
				clone.querySelectorAll(ignoredNodes.join(",")).forEach((node) => node.remove());
				let text = clone.textContent || "";
				if (isShell) text = text.replace(/^ *(\$|>) /gm, "").trim();
				copyToClipboard(text).then(() => {
					el.classList.add("copied");
					clearTimeout(timeoutIdMap.get(el));
					const timeoutId = setTimeout(() => {
						el.classList.remove("copied");
						el.blur();
						timeoutIdMap.delete(el);
					}, 2e3);
					timeoutIdMap.set(el, timeoutId);
				});
			}
		});
	}
}
async function copyToClipboard(text) {
	try {
		return navigator.clipboard.writeText(text);
	} catch {
		const element = document.createElement("textarea");
		const previouslyFocusedElement = document.activeElement;
		element.value = text;
		element.setAttribute("readonly", "");
		element.style.contain = "strict";
		element.style.position = "absolute";
		element.style.left = "-9999px";
		element.style.fontSize = "12pt";
		const selection = document.getSelection();
		const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;
		document.body.appendChild(element);
		element.select();
		element.selectionStart = 0;
		element.selectionEnd = text.length;
		document.execCommand("copy");
		document.body.removeChild(element);
		if (originalRange) {
			selection.removeAllRanges();
			selection.addRange(originalRange);
		}
		if (previouslyFocusedElement) previouslyFocusedElement.focus();
	}
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/composables/head.js
function useUpdateHead(route, siteDataByRouteRef) {
	let isFirstUpdate = true;
	let managedHeadElements = [];
	const updateHeadTags = (newTags) => {
		if (isFirstUpdate) {
			isFirstUpdate = false;
			newTags.forEach((tag) => {
				const headEl = createHeadElement(tag);
				for (const el of document.head.children) if (el.isEqualNode(headEl)) {
					managedHeadElements.push(el);
					return;
				}
			});
			return;
		}
		const newElements = newTags.map(createHeadElement);
		managedHeadElements.forEach((oldEl, oldIndex) => {
			const matchedIndex = newElements.findIndex((newEl) => newEl?.isEqualNode(oldEl ?? null));
			if (matchedIndex !== -1) delete newElements[matchedIndex];
			else {
				oldEl?.remove();
				delete managedHeadElements[oldIndex];
			}
		});
		newElements.forEach((el) => el && document.head.appendChild(el));
		managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
	};
	watchEffect(() => {
		const pageData = route.data;
		const siteData = siteDataByRouteRef.value;
		const pageDescription = pageData && pageData.description;
		const frontmatterHead = pageData && pageData.frontmatter.head || [];
		const title = createTitle(siteData, pageData);
		if (title !== document.title) document.title = title;
		const description = pageDescription || siteData.description;
		let metaDescriptionElement = document.querySelector(`meta[name=description]`);
		if (metaDescriptionElement) {
			if (metaDescriptionElement.getAttribute("content") !== description) metaDescriptionElement.setAttribute("content", description);
		} else createHeadElement(["meta", {
			name: "description",
			content: description
		}]);
		updateHeadTags(mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead)));
	});
}
function createHeadElement([tag, attrs, innerHTML]) {
	const el = document.createElement(tag);
	for (const key in attrs) el.setAttribute(key, attrs[key]);
	if (innerHTML) el.innerHTML = innerHTML;
	if (tag === "script" && attrs.async == null) el.async = false;
	return el;
}
function isMetaDescription(headConfig) {
	return headConfig[0] === "meta" && headConfig[1] && headConfig[1].name === "description";
}
function filterOutHeadDescription(head) {
	return head.filter((h) => !isMetaDescription(h));
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/composables/preFetch.js
var hasFetched = /* @__PURE__ */ new Set();
var createLink = () => document.createElement("link");
var viaDOM = (url) => {
	const link = createLink();
	link.rel = `prefetch`;
	link.href = url;
	document.head.appendChild(link);
};
var viaXHR = (url) => {
	const req = new XMLHttpRequest();
	req.open("GET", url, req.withCredentials = true);
	req.send();
};
var link;
var doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
	if (!inBrowser) return;
	if (!window.IntersectionObserver) return;
	let conn;
	if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) return;
	const rIC = window.requestIdleCallback || setTimeout;
	let observer = null;
	const observeLinks = () => {
		if (observer) observer.disconnect();
		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const link = entry.target;
					observer.unobserve(link);
					const { pathname } = link;
					if (!hasFetched.has(pathname)) {
						hasFetched.add(pathname);
						const pageChunkPath = pathToFile(pathname);
						if (pageChunkPath) doFetch(pageChunkPath);
					}
				}
			});
		});
		rIC(() => {
			document.querySelectorAll("#app a").forEach((link) => {
				const { hostname, pathname } = new URL(link.href instanceof SVGAnimatedString ? link.href.animVal : link.href, link.baseURI);
				const extMatch = pathname.match(/\.\w+$/);
				if (extMatch && extMatch[0] !== ".html") return;
				if (link.target !== "_blank" && hostname === location.hostname) if (pathname !== location.pathname) observer.observe(link);
				else hasFetched.add(pathname);
			});
		});
	};
	onMounted(observeLinks);
	const route = useRoute();
	watch(() => route.path, observeLinks);
	onUnmounted(() => {
		observer && observer.disconnect();
	});
}
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/index.js
function resolveThemeExtends(theme) {
	if (theme.extends) {
		const base = resolveThemeExtends(theme.extends);
		return {
			...base,
			...theme,
			async enhanceApp(ctx) {
				if (base.enhanceApp) await base.enhanceApp(ctx);
				if (theme.enhanceApp) await theme.enhanceApp(ctx);
			}
		};
	}
	return theme;
}
var Theme = resolveThemeExtends(theme);
var VitePressApp = defineComponent({
	name: "VitePressApp",
	setup() {
		const { site, lang, dir } = useData$1();
		onMounted(() => {
			watchEffect(() => {
				document.documentElement.lang = lang.value;
				document.documentElement.dir = dir.value;
			});
		});
		if (site.value.router.prefetchLinks) usePrefetch();
		useCopyCode();
		useCodeGroups();
		if (Theme.setup) Theme.setup();
		return () => h(Theme.Layout);
	}
});
async function createApp$1() {
	globalThis.__VITEPRESS__ = true;
	const router = newRouter();
	const app = newApp();
	app.provide(RouterSymbol, router);
	const data = initData(router.route);
	app.provide(dataSymbol, data);
	app.component("Mermaid", _sfc_main$5);
	app.component("Content", Content);
	app.component("ClientOnly", ClientOnly);
	Object.defineProperties(app.config.globalProperties, {
		$frontmatter: { get() {
			return data.frontmatter.value;
		} },
		$params: { get() {
			return data.page.value.params;
		} }
	});
	if (Theme.enhanceApp) await Theme.enhanceApp({
		app,
		router,
		siteData: siteDataRef
	});
	return {
		app,
		router,
		data
	};
}
function newApp() {
	return createSSRApp(VitePressApp);
}
function newRouter() {
	let isInitialPageLoad = inBrowser;
	return createRouter((path) => {
		let pageFilePath = pathToFile(path);
		let pageModule = null;
		if (pageFilePath) {
			if (isInitialPageLoad) pageFilePath = pageFilePath.replace(/\.js$/, ".lean.js");
			pageModule = import(
				/*@vite-ignore*/
				pageFilePath
);
		}
		if (inBrowser) isInitialPageLoad = false;
		return pageModule;
	}, Theme.NotFound);
}
if (inBrowser) createApp$1().then(({ app, router, data }) => {
	router.go().then(() => {
		useUpdateHead(router.route, data.site);
		app.mount("#app");
	});
});
//#endregion
//#region ../node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_@types+node@25.9.5_@types+react@18.3.1_axios@1._voac4fxuzdchehijxtz3comnpi/node_modules/vitepress/dist/client/app/ssr.js
async function render(path) {
	const { app, router } = await createApp$1();
	await router.go(path);
	const ctx = {
		content: "",
		vpSocialIcons: /* @__PURE__ */ new Set()
	};
	ctx.content = await renderToString(app, ctx);
	return ctx;
}
//#endregion
export { tryOnScopeDispose as _, dataSymbol as a, computedAsync as c, useEventListener as d, useLocalStorage as f, toArray as g, notNullish as h, pathToFile as i, onKeyStroke as l, useSessionStorage as m, useData as n, escapeRegExp as o, useScrollLock as p, useRouter as r, render, inBrowser as s, createSearchTranslate as t, unrefElement as u, watchDebounced as v };
