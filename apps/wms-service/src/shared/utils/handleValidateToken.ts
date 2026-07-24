import { UserTokenServiceImpl } from '../../infrastructure/cache/repositories/UserCache';
import { CheckToken } from '../../application/use-cases/CheckToken';
import { UserInfo } from '../types/userInfo';
import PartnershipModel from '../../infrastructure/database/models/PartnershipModel';
import { Op, QueryTypes } from 'sequelize';
import UserFcmTokenModel from '../../infrastructure/database/models/UserFcmTokenModel';
import UsersModel from '../../infrastructure/database/models/UsersModel';
import EntitiesModel from '../../infrastructure/database/models/EntitiesModel';
import { sequelize } from '../../infrastructure/database/db.connection';

function parseJson(value: any): object | undefined {
  if (!value) return undefined;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export default async function handleValidateToken(token: string): Promise<UserInfo | null> {
  // Auth cutover: this used to call an external SMILE_BE_URL + ENDPOINT_VALIDATION_TOKEN
  // (smile-platform.badr.co.id) over the public domain. Now that this service lives in the
  // monorepo, it calls apps/core directly over the internal network, the same way
  // apps/warehouse-service's AuthKeycloakMiddleware does (CORE_API_URL + /account/profile).
  if (!process.env.CORE_API_URL) {
    throw new Error('CORE_API_URL environment variable is not set');
  }

  const URL = process.env.CORE_API_URL + '/account/profile';
  const repo = new UserTokenServiceImpl();
  const useCaseToken = new CheckToken(repo);

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'accept-language': 'en',
        'device-type': 'web',
      },
    });

    if (!response.ok) {
      return null;
    }

    const jsonData = await response.json();
    const dataInput = jsonData as UserInfo;

    const userData = await UsersModel.findOne({
      where: { id: dataInput.id },
      attributes: ['username', 'is_active', 'user_uuid'],
    });

    if (!userData) {
      await UsersModel.create({
        id: dataInput.id,
        user_uuid: dataInput.user_uuid,
        entity_id: dataInput.entity_id,
        firstname: dataInput.firstname,
        lastname: dataInput.lastname,
        email: dataInput.email,
        username: dataInput.username,
        mobile_phone: dataInput.mobile_phone,
        gender: dataInput.gender,
        gender_label: dataInput.gender_label,
        date_of_birth: dataInput.date_of_birth,
        role: dataInput.role,
        role_id: dataInput.role_id,
        role_label: dataInput.role_label,
        view_only: dataInput.view_only === 1 ? true : false,
        status: dataInput.status,
        last_device: dataInput.last_device,
        integration_client_id: dataInput.integration_client_id,
        keycloak_uuid: dataInput.keycloak_uuid,
        external_roles: dataInput.external_roles.toString() ?? '',
        external_properties: dataInput.external_properties
          ? { ...dataInput.external_properties }
          : {},
        address: dataInput.address,
        manufacture_id: dataInput.manufacture_id,
        village_id: dataInput.village_id,
        last_login: dataInput.last_login,
        deleted_at: dataInput.deleted_at,
        created_at: dataInput.created_at,
        updated_at: dataInput.updated_at,
        created_by: dataInput.created_by,
        updated_by: dataInput.updated_by,
        deleted_by: dataInput.deleted_by,
      });
    } else {
      await UsersModel.update(
        {
          entity_id: dataInput.entity_id,
          username: dataInput.username,
          firstname: dataInput.firstname,
          lastname: dataInput.lastname,
          view_only: dataInput.view_only === 1 ? true : false,
          external_properties: dataInput.external_properties
            ? { ...dataInput.external_properties }
            : {},
          external_roles: dataInput.external_roles.toString() ?? '',
        },
        {
          where: {
            id: dataInput.id,
          },
        },
      );
    }

    const dataEntity = dataInput.entity;
    const entityData = await EntitiesModel.findOne({
      where: { id: dataInput.entity_id },
      attributes: ['id', 'is_active'],
    });

    if (!entityData) {
      // Auth cutover: was SMILE_BE_URL + /core/entities/:id (external). apps/core mounts its
      // entity module at /entities (see apps/core/src/wire.ts:1060), so this now calls it
      // directly. TODO: confirm entity.module.ts#getDetail's response still has `code`,
      // `id_satu_sehat`, and a `locations[]` array in this order (province/regency/district)
      // before relying on this in production — that shape hasn't been diffed field-by-field.
      const detailEntities = await fetch(
        process.env.CORE_API_URL + `/entities/${dataEntity.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'accept-language': 'en',
            'device-type': 'web',
          },
        },
      );

      const resultEntities = await detailEntities.json();

      await EntitiesModel.create({
        id: dataEntity.id,
        name: dataEntity.name,
        type: dataEntity.type,
        address: dataEntity.address,
        code: resultEntities.code,
        id_satu_sehat: resultEntities?.id_satu_sehat,
        tag: dataEntity.tag,
        latitude: resultEntities.lat == '' ? null : resultEntities.lat,
        longitude: resultEntities.lng == '' ? null : resultEntities.lng,
        province_id: dataEntity.province_id,
        regency_id: dataEntity.regency_id,
        sub_district_id: dataEntity.sub_district_id,
        village_id: dataEntity.village_id,
        integration_type: dataEntity.integration_type,
        integration_client_id: dataEntity.integration_client_id,
        location: dataEntity.location,
        entity_type_id: dataEntity.entity_type.id,
        entity_type_name: dataEntity.entity_type.name,
        entity_type_integration_type: dataEntity.entity_type.integration_type,
        entity_type_external_properties: dataEntity.entity_type.external_properties,
        province_name: resultEntities.locations[0]?.name ?? 'PROV. DKI JAKARTA',
        regency_name: resultEntities.locations[1]?.name ?? 'KOTA JAKARTA PUSAT',
        district_name: resultEntities.locations[2]?.name,
      });
    } else {
      // Auth cutover: was SMILE_BE_URL + /core/entities/:id (external). apps/core mounts its
      // entity module at /entities (see apps/core/src/wire.ts:1060), so this now calls it
      // directly. TODO: confirm entity.module.ts#getDetail's response still has `code`,
      // `id_satu_sehat`, and a `locations[]` array in this order (province/regency/district)
      // before relying on this in production — that shape hasn't been diffed field-by-field.
      const detailEntities = await fetch(
        process.env.CORE_API_URL + `/entities/${dataEntity.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'accept-language': 'en',
            'device-type': 'web',
          },
        },
      );

      const resultEntities = await detailEntities.json();

      await EntitiesModel.update(
        {
          tag: dataEntity.tag,
          entity_type_id: dataEntity.entity_type.id,
          entity_type_name: dataEntity.entity_type.name,
          code: resultEntities.code,
          province_id: resultEntities.province_id,
          regency_id: resultEntities.regency_id,
          id_satu_sehat: resultEntities?.id_satu_sehat,
          province_name: resultEntities.locations[0]?.name ?? 'PROV. DKI JAKARTA',
          regency_name: resultEntities.locations[1]?.name ?? 'KOTA JAKARTA PUSAT',
          district_name: resultEntities.locations[2]?.name,
        },
        {
          where: {
            id: dataEntity.id,
          },
        },
      );
    }

    const dataPartnership: any = await PartnershipModel.findOne({
      where: {
        providerId: jsonData?.entity_id,
        providerType: {
          [Op.in]: [
            'TRANSPORTER',
            'TRANSPORTER_RECYCLER',
            'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER_LANDFILL',
            'TRANSPORTER_TREATMENT_PROVIDER',
            'TRANSPORTER_TREATMENT',
            'TRANSPORTER_GOVERNMENT',
            'SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER_GOVERNMENT_WASTE_BANK',
          ],
        },
      },
    });

    const sql = `SELECT
        CONCAT_WS(', ',
        GROUP_CONCAT(DISTINCT p.provider_type ORDER BY p.provider_type SEPARATOR ', '),
        case when pt.provider_type IS NOT NULL then "GOVERNMENT_WASTE_BANK" ELSE NULL END
        ) AS provider_types
        FROM partnership p
        LEFT JOIN partnership pt ON pt.provider_id = p.transporter_id AND pt.consumer_id = p.consumer_id
        AND pt.provider_type = "TRANSPORTER_GOVERNMENT_WASTE_BANK" AND pt.partnership_status = 'ACTIVE'
        AND p.partnership_status = 'ACTIVE'
        WHERE p.provider_id = :providerId`;

    const replacements = { providerId: dataEntity.id };

    const dataProviderTypes: any = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const dataFcmToken = await UserFcmTokenModel.findOne({
      where: {
        userId: jsonData?.id,
        userUuid: jsonData?.user_uuid,
      },
      attributes: ['token'],
    });

    await useCaseToken.executeCache({ token: token, ttl: Number(process.env.EXPIRED_TOKEN) });
    const data: UserInfo = {
      ...jsonData,
      fcm_token: dataFcmToken?.get('token') || dataFcmToken?.token,
      providerType: dataPartnership?.providerType ?? null,
      providerTypes: dataProviderTypes?.[0]?.provider_types,
      user_is_active: userData?.dataValues?.is_active ?? true,
      entity_is_active: entityData?.dataValues?.is_active ?? true,
      user_uuid_wms: userData?.dataValues?.user_uuid ?? dataInput.user_uuid, // because user_uuid from token validation response is not always same with user_uuid from user table
    };

    return data;
  } catch (error) {
    console.error(
      'Token validation failed:',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
