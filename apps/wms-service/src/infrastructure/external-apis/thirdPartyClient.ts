import axios from 'axios';
import EntitiesModel from '../database/models/EntitiesModel';
import { Op } from 'sequelize';
import UsersModel from '../database/models/UsersModel';
import redis from '../cache/redis.client';

export async function getEntityDetail(entityId: number, token: string) {
  const infoRedis = await redis.get(`entity_id:${entityId}`);

  if (infoRedis) return JSON.parse(infoRedis);

  const checkData = await EntitiesModel.findByPk(entityId);

  const oneDay = 24 * 60 * 60; // 86400 detik
  const ttl = (1 * oneDay) / 2;

  if (checkData) {
    const result = checkData.get({ plain: true });
    const pattern = `entity_id:${entityId}`;
    await redis.set(pattern, JSON.stringify(result), 'EX', ttl);
    return result;
  }

  const baseUrl = process.env.SMILE_BE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.get(`${baseUrl}/core/entities/${entityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const pattern = `entity_id:${entityId}`;
    await redis.set(pattern, JSON.stringify(response.data), 'EX', ttl);
    return response.data;
  } catch (error: any) {
    console.error(
      `Failed to fetch entity details for entityId ${entityId}:`,
      error?.message || error,
    ); //Unknown column 'id_satu_sehat' in 'field list'
  }
}

export async function getUsersDetail(userId: string | undefined, token: string) {
  if (!userId) return undefined;

  const infoRedis = await redis.get(`user_id:${userId}`);

  if (infoRedis) return JSON.parse(infoRedis);

  const isNumber = typeof userId === 'number' || !isNaN(Number(userId));
  const checkData = await UsersModel.findOne({
    where: isNumber ? { id: Number(userId) } : { user_uuid: userId },
    include: {
      model: EntitiesModel,
      as: 'entity',
      attributes: ['id', 'name'],
    },
  });

  const oneDay = 24 * 60 * 60; // 86400 detik
  const ttl = (1 * oneDay) / 2;
  if (checkData) {
    const result = checkData.get({ plain: true });
    const pattern = `user_id:${userId}`;
    await redis.set(pattern, JSON.stringify(result), 'EX', ttl);
    return result;
  }

  const baseUrl = process.env.SMILE_BE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.get(`${baseUrl}/core/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const pattern = `user_id:${userId}`;
    await redis.set(pattern, JSON.stringify(response.data), 'EX', ttl);

    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch users details for userId ${userId}:`, error?.message || error);
  }
}

export async function getListUsersByEntity(entityId: number, token: string) {
  const baseUrl = process.env.SMILE_BE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.get(`${baseUrl}/core/users?entity_id=${entityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Failed to fetch users details for entityId ${entityId}:`,
      error?.message || error,
    );
  }
}

export async function rejectedDisposalBast(token: string, bastNo: string, comment: string) {
  const baseUrl = process.env.SMILE_BE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.put(
      `${baseUrl}/wms/disposal/cancellation`,
      {
        bast_no: bastNo,
        comment: comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(`Failed to put bast number ${bastNo}:`, error?.message || error);
  }
}

export async function getAssetInventoriesById(id: number, token: string, lang?: string) {
  const baseUrl = process.env.SMILE_BE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.get(`${baseUrl}/core/asset-inventories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept-language': lang || 'id',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch asset-inventories by ${id}:`, error?.message || error);
  }
}

export async function getAssetInventories(
  params: {
    page?: number;
    paginate?: number;
    keyword?: string;
    health_center_id?: number;
    asset_type_ids?: string;
    status?: string;
    working_status_id?: string;
  },
  token: string,
  lang = 'id',
) {
  const baseUrl = process.env.SMILE_BE_URL;

  if (!baseUrl) {
    throw new Error('Environment variable for SMILE backend URL is not set');
  }

  try {
    const response = await axios.get(`${baseUrl}/core/asset-inventories`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        'accept-language': lang,
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      'Failed to fetch asset inventories:',
      error?.response?.data || error?.message || error,
    );
    throw error;
  }
}

const ONE_DAY = 24 * 60 * 60;
const TTL = ONE_DAY / 2;

export async function getBulkEntityDetails(
  entityIds: number[],
  token: string,
): Promise<Map<number, any>> {
  const uniqueIds = [...new Set(entityIds.filter(Boolean))];
  const result = new Map<number, any>();
  if (uniqueIds.length === 0) return result;

  console.time('bulkEntity:mget');
  const redisKeys = uniqueIds.map((id) => `entity_id:${id}`);
  const cached = await redis.mget(...redisKeys);
  console.timeEnd('bulkEntity:mget');

  const missingIds: number[] = [];
  for (let i = 0; i < uniqueIds.length; i++) {
    if (cached[i]) {
      result.set(uniqueIds[i], JSON.parse(cached[i]!));
    } else {
      missingIds.push(uniqueIds[i]);
    }
  }

  if (missingIds.length > 0) {
    console.time('bulkEntity:dbQuery');
    const dbRows = (await EntitiesModel.findAll({
      where: { id: { [Op.in]: missingIds } },
      raw: true,
    })) as any[];
    console.timeEnd('bulkEntity:dbQuery');

    const dbMap = new Map<number, any>();
    for (const row of dbRows) {
      dbMap.set(row.id, row);
    }

    const pipe = redis.pipeline();
    const stillMissingIds: number[] = [];
    for (const id of missingIds) {
      const dbData = dbMap.get(id);
      if (dbData) {
        result.set(id, dbData);
        pipe.set(`entity_id:${id}`, JSON.stringify(dbData), 'EX', TTL);
      } else {
        stillMissingIds.push(id);
      }
    }
    await pipe.exec();

    if (stillMissingIds.length > 0) {
      const baseUrl = process.env.SMILE_BE_URL;
      if (baseUrl) {
        console.time('bulkEntity:httpFallback');
        const httpResults = await Promise.allSettled(
          stillMissingIds.map((id) =>
            axios.get(`${baseUrl}/core/entities/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        );
        console.timeEnd('bulkEntity:httpFallback');

        const httpPipe = redis.pipeline();
        for (let i = 0; i < httpResults.length; i++) {
          const r = httpResults[i];
          if (r.status === 'fulfilled' && r.value?.data) {
            result.set(stillMissingIds[i], r.value.data);
            httpPipe.set(
              `entity_id:${stillMissingIds[i]}`,
              JSON.stringify(r.value.data),
              'EX',
              TTL,
            );
          }
        }
        await httpPipe.exec();
      }
    }
  }

  return result;
}

export async function getBulkUsersDetails(
  userIds: (string | undefined)[],
  token: string,
): Promise<Map<string, any>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))] as string[];
  const result = new Map<string, any>();
  if (uniqueIds.length === 0) return result;

  console.time('bulkUsers:mget');
  const redisKeys = uniqueIds.map((id) => `user_id:${id}`);
  const cached = await redis.mget(...redisKeys);
  console.timeEnd('bulkUsers:mget');

  const missingIds: string[] = [];
  for (let i = 0; i < uniqueIds.length; i++) {
    if (cached[i]) {
      result.set(uniqueIds[i], JSON.parse(cached[i]!));
    } else {
      missingIds.push(uniqueIds[i]);
    }
  }

  if (missingIds.length > 0) {
    console.time('bulkUsers:dbQuery');
    const numericIds = missingIds.filter((id) => !isNaN(Number(id)));
    const uuidIds = missingIds.filter((id) => isNaN(Number(id)));

    const conditions: any[] = [];
    if (numericIds.length > 0) {
      conditions.push({ id: { [Op.in]: numericIds.map(Number) } });
    }
    if (uuidIds.length > 0) {
      conditions.push({ user_uuid: { [Op.in]: uuidIds } });
    }

    const dbRows = (await UsersModel.findAll({
      where: conditions.length === 1 ? conditions[0] : { [Op.or]: conditions },
      include: {
        model: EntitiesModel,
        as: 'entity',
        attributes: ['id', 'name'],
      },
      raw: true,
      nest: true,
    })) as any[];
    console.timeEnd('bulkUsers:dbQuery');

    const dbMap = new Map<string, any>();
    for (const row of dbRows) {
      if (row.id) dbMap.set(String(row.id), row);
      if (row.user_uuid) dbMap.set(row.user_uuid, row);
    }

    const pipe = redis.pipeline();
    const stillMissingIds: string[] = [];
    for (const id of missingIds) {
      const dbData = dbMap.get(id);
      if (dbData) {
        result.set(id, dbData);
        pipe.set(`user_id:${id}`, JSON.stringify(dbData), 'EX', TTL);
      } else {
        stillMissingIds.push(id);
      }
    }
    await pipe.exec();

    if (stillMissingIds.length > 0) {
      const baseUrl = process.env.SMILE_BE_URL;
      if (baseUrl) {
        console.time('bulkUsers:httpFallback');
        const httpResults = await Promise.allSettled(
          stillMissingIds.map((id) =>
            axios.get(`${baseUrl}/core/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        );
        console.timeEnd('bulkUsers:httpFallback');

        const httpPipe = redis.pipeline();
        for (let i = 0; i < httpResults.length; i++) {
          const r = httpResults[i];
          if (r.status === 'fulfilled' && r.value?.data) {
            result.set(stillMissingIds[i], r.value.data);
            httpPipe.set(`user_id:${stillMissingIds[i]}`, JSON.stringify(r.value.data), 'EX', TTL);
          }
        }
        await httpPipe.exec();
      }
    }
  }

  return result;
}
