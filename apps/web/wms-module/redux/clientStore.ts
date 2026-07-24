import { Context } from 'next-redux-wrapper';
import { makeStore } from './store';

// The original wms app used next-redux-wrapper's `wrapper.withRedux(MyApp)` at the
// top level of its own _app.tsx for SSR-hydrated state. apps/web already has its own
// _app.js for the rest of the platform, so WMS pages instead get a single plain client
// store, mounted only under /wms routes by WmsProviders — no SSR hydration, but these
// are client-rendered, auth-gated dashboards to begin with.
export const wmsStore = makeStore({} as Context);
