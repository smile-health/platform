import fs from 'fs';
import axios from 'axios';
import { authenticateDatabase, sequelize } from '../../../infrastructure/database/db.connection';
import { Op, QueryTypes } from 'sequelize';
import HealthcareAssetModel from '../../../infrastructure/database/models/HealthcareAssetModel';

interface assetInfo {
  id: number;
  asset_id: string;
  entity_id: number;
}

const smileApi = axios.create({
  baseURL: process.env.SMILE_BE_URL,
});

let token: string | null = null;
let loginPromise: Promise<string> | null = null;

async function loginToSmile() {
  const formData = new URLSearchParams();

  formData.append('username', process.env.SMILE_USERNAME || 'albian');

  formData.append('password', process.env.SMILE_PASSWORD || 'Smile12*');

  const response = await axios.post(`${process.env.SMILE_BE_URL}/auth/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.authDetails.access_token;
}

async function getToken() {
  if (token) {
    return token;
  }

  if (!loginPromise) {
    loginPromise = loginToSmile()
      .then((newToken) => {
        token = newToken;
        return newToken;
      })
      .finally(() => {
        loginPromise = null;
      });
  }

  return loginPromise;
}

// Auto inject token
smileApi.interceptors.request.use(async (config) => {
  const accessToken = await getToken();

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

// Auto login ulang jika 401
smileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      token = null;

      const newToken = await getToken();

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return smileApi(originalRequest);
    }

    return Promise.reject(error);
  },
);

const arrayToObj = (assets: assetInfo[]) => {
  const result: Record<number, assetInfo[]> = {};
  assets.forEach((asset) => {
    if (!result[asset.entity_id]) {
      result[asset.entity_id] = [];
    }
    result[asset.entity_id].push(asset);
  });
  return result;
};

const arrayAssetToObj = (assets: assetInfo[]) => {
  const result: Record<number, assetInfo> = {};
  assets.forEach((asset) => {
    result[asset.id] = asset;
  });
  return result;
};

async function getSmileAssetInventoryIds(entityId: number): Promise<number[]> {
  const paginate = 100;
  let page = 1;
  let totalPage = 1;

  const ids = [];

  do {
    const { data } = await smileApi.get('/core/asset-inventories', {
      params: {
        page: 1,
        paginate,
        health_center_id: entityId,
        asset_type_ids: '40', // Waste Scale
      },
    });

    totalPage = data.total_page;

    ids.push(...(data.data || []).map((item: { id: number }) => item.id));

    page++;
  } while (page <= totalPage);

  return ids;
}

function generateActions(
  assetSmileIds: number[],
  assetWMSIds: number[],
  sameAssets: number[],
  missingAssets: number[],
  assetObj: Record<number, assetInfo>,
) {
  const actions = [];

  // RULE A
  if (sameAssets.length === 0 && assetSmileIds.length === missingAssets.length) {
    for (let i = 0; i < missingAssets.length; i++) {
      actions.push({
        type: 'replace_id',
        oldId: missingAssets[i],
        newId: assetSmileIds[i],
      });
    }

    return actions;
  }

  // RULE B
  const sourceAssets = missingAssets
    .map((id) => ({
      id,
      asset_id: assetObj[id]?.asset_id,
    }))
    .filter((item) => item.asset_id);

  const targetAssets = sameAssets.filter((id) => !assetObj[id]?.asset_id);

  const count = Math.min(sourceAssets.length, targetAssets.length);

  for (let i = 0; i < count; i++) {
    actions.push({
      type: 'update_asset_id',
      id: targetAssets[i],
      asset_id: sourceAssets[i].asset_id,
    });
  }

  if (missingAssets.length) {
    actions.push({
      type: 'delete',
      ids: missingAssets,
    });
  }

  return actions;
}

async function executeActions(
  actions: {
    type: string;
    ids?: number[];
    newId?: number;
    oldId?: number;
    asset_id?: string;
    id?: number;
  }[],
  transaction: any,
) {
  for (const action of actions) {
    switch (action.type) {
      case 'delete':
        await HealthcareAssetModel.destroy({
          where: {
            id: {
              [Op.in]: action.ids,
            },
          },
          transaction,
        });
        break;

      case 'replace_id':
        await HealthcareAssetModel.update(
          {
            id: action.newId,
          },
          {
            where: {
              id: action.oldId,
            },
            transaction,
          },
        );
        break;

      case 'update_asset_id':
        await HealthcareAssetModel.update(
          {
            assetId: action.asset_id?.toString(),
          },
          {
            where: {
              id: action.id,
            },
            transaction,
          },
        );
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}

const processCleanse = async (transaction: any, assetsWms: assetInfo[]) => {
  // const logFile = 'process-cleanse-log.txt';

  const assetObj = arrayToObj(assetsWms);

  for (const [entityId, assets] of Object.entries(assetObj)) {
    const separator = '====================================================================';

    console.log(separator);

    const assetMap = arrayAssetToObj(assets);
    const assetSmileIds = await getSmileAssetInventoryIds(Number(entityId));
    const sameAssets = assets.filter((asset) => assetSmileIds.includes(asset.id));
    const missingAssets = assets.filter((asset) => !assetSmileIds.includes(asset.id));

    const logData = {
      entityId,
      assetSmileIds,
      assetWMSIds: assets.map((a) => a.id),
      sameAssets: sameAssets.map((a) => a.id),
      missingAssets: missingAssets.map((a) => a.id),
      assetObj: assetMap,
    };

    console.log(logData);

    const actions = await generateActions(
      assetSmileIds,
      assets.map((a) => a.id),
      sameAssets.map((a) => a.id),
      missingAssets.map((a) => a.id),
      assetMap,
    );

    await executeActions(actions, transaction);

    console.log(actions);
    console.log(separator);

    // const logText = [
    //   separator,
    //   JSON.stringify(logData, null, 2),
    //   JSON.stringify(actions, null, 2),
    //   separator,
    //   '',
    // ].join('\n');

    // fs.appendFileSync(logFile, logText);
  }
};

export const cleanseAssetDongleWasteScale = async (entityIds?: number[]) => {
  const transaction = await sequelize.transaction();
  await authenticateDatabase();
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const whereEntity =
      entityIds && entityIds.length > 0
        ? `AND healthcare_facility_id IN (${entityIds.join(',')})`
        : '';
    const query = `
      SELECT id, asset_id, entity_id FROM healthcare_asset ha
      WHERE ha.asset_type_name = 'Waste Scale'
      ${whereEntity}
      ORDER BY entity_id ASC
      LIMIT :limit OFFSET :offset
    `;
    const assets: assetInfo[] = await sequelize.query<assetInfo>(query, {
      type: QueryTypes.SELECT,
      replacements: { limit, offset },
    });

    if (assets.length === 0) {
      hasMore = false;
      break;
    }

    await processCleanse(transaction, assets);

    offset += limit;
  }

  await transaction.commit();
};
