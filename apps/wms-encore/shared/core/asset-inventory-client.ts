// Mirrors apps/wms-service's infrastructure/external-apis/thirdPartyClient.ts's
// getAssetInventoriesById/getAssetInventories, migrated to the same
// internal-network convention shared/auth/authHandler.ts already uses for
// apps/core (CORE_API_URL, no `/core` prefix, plain `fetch`) rather than the
// legacy external SMILE_BE_URL + `/core/...` convention — apps/core mounts
// this module at /asset-inventories (see apps/core/src/wire.ts and
// apps/core/src/modules/asset-inventory/asset-inventory.controller.ts),
// same GET /:id and GET / shape the original expected.
//
// Unlike jobs/cleanse-asset-dongle.service.ts's blocked SMILE-client TODO
// (a cron job with no per-request caller to borrow a token from), every
// caller of this module is a real HTTP handler that already has the
// caller's own bearer token on hand — so this just forwards that same
// token apps/core already validated, rather than inventing a new
// service-account credential flow.
import log from "encore.dev/log";

export interface AssetInventory {
  id: number;
  asset_id?: string | null;
  asset_type?: { id: number; name: string };
  entity?: { id: number };
  working_status?: { id: number; name?: string };
  status?: { id: number };
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

function coreApiUrl(): string | undefined {
  return process.env.CORE_API_URL;
}

// Mirrors getAssetInventoriesById: fetch a single asset-inventory row by id.
// Returns undefined (matching the original's swallow-error-and-return-undefined
// behavior) rather than throwing, since callers use this to enrich/reconcile
// a local row and shouldn't hard-fail the whole request over a transient
// upstream error.
export async function getAssetInventoryById(
  id: number,
  token: string,
  lang = "id",
): Promise<AssetInventory | undefined> {
  const baseUrl = coreApiUrl();
  if (!baseUrl) {
    log.error("CORE_API_URL environment variable is not set");
    return undefined;
  }

  try {
    const response = await fetch(`${baseUrl}/asset-inventories/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "accept-language": lang,
      },
    });
    if (!response.ok) {
      log.error("asset-inventory lookup failed", { id, status: response.status });
      return undefined;
    }
    return (await response.json()) as AssetInventory;
  } catch (error) {
    log.error("failed to fetch asset-inventory by id", {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

export interface GetAssetInventoriesParams {
  page?: number;
  paginate?: number;
  keyword?: string;
  health_center_id?: number;
  asset_type_ids?: string;
  status?: string;
  working_status_id?: string;
}

export interface AssetInventoriesPage {
  data: AssetInventory[];
  total_page?: number;
  [key: string]: unknown;
}

// Mirrors getAssetInventories: paginated list, used by the (currently
// blocked, see jobs/cleanse-asset-dongle.service.ts) reconciliation job for
// entities that DO have a bearer token available (none currently do — kept
// here for the day a per-request caller needs the list form too).
export async function getAssetInventories(
  params: GetAssetInventoriesParams,
  token: string,
  lang = "id",
): Promise<AssetInventoriesPage | undefined> {
  const baseUrl = coreApiUrl();
  if (!baseUrl) {
    log.error("CORE_API_URL environment variable is not set");
    return undefined;
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }

  try {
    const response = await fetch(`${baseUrl}/asset-inventories?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "accept-language": lang,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      log.error("asset-inventories list failed", { status: response.status });
      return undefined;
    }
    return (await response.json()) as AssetInventoriesPage;
  } catch (error) {
    log.error("failed to fetch asset-inventories", {
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}
