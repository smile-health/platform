import { Op } from 'sequelize';
import SpeedTransportGroup, {
  SpeedTransportGroupBag,
  SpeedTransportGroupPartnershipSide,
} from '../../../domain/entities/SpeedTransportGroup';
import SpeedOperator from '../../../domain/entities/SpeedOperator';
import SpeedTreatmentProvider from '../../../domain/entities/SpeedTreatmentProvider';
import SpeedHandoverRepository, {
  HandoverToTransporterInput,
  HandoverToTreatmentInput,
  SpeedOperatorFilter,
  SpeedTransportGroupListFilter,
  SpeedTreatmentProviderFilter,
} from '../../../domain/repositories/SpeedHandoverRepository';
import WasteTransportationExternalGroupModel from '../models/WasteTransportationExternalGroupModel';
import WasteBagModel from '../models/WasteBagModel';
import { WasteBagAuditTrailModel } from '../models/WasteBagAuditTrailModel';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../models/WasteHierarchyModel';
import EntitiesModel from '../models/EntitiesModel';
import { EntityLocationModel } from '../models/EntityLocationModel';
import PartnershipModel from '../models/PartnershipModel';
import PartnershipOperatorMapModel from '../models/PartnershipOperatorMapModel';
import UsersModel from '../models/UsersModel';
import { UserRoleModel } from '../models/UserRoleModel';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteBagRepositoryImpl from './WasteBagRepositoryImpl';
import S3FileServiceRepositoryImpl from './S3FileServiceRepositoryImpl';

const WASTE_CLASSIFICATION_INCLUDE = {
  model: WasteClassificationModel,
  as: 'wasteClassification',
  required: false,
  attributes: [
    'id',
    'wasteTypeId',
    'wasteGroupId',
    'wasteCharacteristicsId',
    'wasteCode',
    'wasteBagColorCode',
    'useColdStorage',
  ],
  include: [
    { model: WasteHierarchyModel, as: 'wasteType', attributes: ['name'], required: false },
    { model: WasteHierarchyModel, as: 'wasteGroup', attributes: ['name'], required: false },
    {
      model: WasteHierarchyModel,
      as: 'wasteCharacteristics',
      attributes: ['name'],
      required: false,
    },
  ],
};

// Date-only input (no time component) needs an explicit start/end-of-day boundary — same fix
// as the one applied to `/limbah/agregat` (SpeedWasteRepositoryImpl.getAggregate): otherwise
// records created later on the same `endDate` day are silently excluded.
function normalizeStartDate(value: string): Date {
  return value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00.000`);
}
function normalizeEndDate(value: string): Date {
  return value.includes('T') ? new Date(value) : new Date(`${value}T23:59:59.999`);
}

async function resolveEntityIdByNib(nib: string): Promise<number | null> {
  const entity = await EntitiesModel.findOne({ where: { nib }, attributes: ['id'] });
  return entity ? (entity.get('id') as number) : null;
}

// `id_entitas`/`nib` are alternatives that identify the same thing two different ways — `nib`
// wins if both are sent, same rule used throughout the rest of SPEED (SpeedWasteRepositoryImpl).
async function resolveEntityId(entityId?: number, nib?: string): Promise<number | undefined | null> {
  if (nib) return resolveEntityIdByNib(nib);
  return entityId;
}

async function resolveGroupCodesToIds(groupCodes: string[]): Promise<number[] | null> {
  if (!groupCodes.length) return null;
  const rows = await WasteTransportationExternalGroupModel.findAll({
    where: { groupId: { [Op.in]: groupCodes } },
    attributes: ['id'],
  });
  if (rows.length !== groupCodes.length) return null;
  return rows.map((row) => row.get('id') as number);
}

// Operator role (id_peran/nama_peran/tipe_peran) isn't a column on partnership_operator_map —
// it lives on the user's own role assignment (UsersModel -> UserRoleModel), resolved locally
// first (same DB `getUsersDetail` already reads from) without needing an external API round trip.
async function fetchOperatorsForProvider(providerId: number | null | undefined): Promise<SpeedOperator[]> {
  if (!providerId) return [];

  const maps = await PartnershipOperatorMapModel.findAll({
    include: [
      {
        model: PartnershipModel,
        as: 'partnership',
        attributes: [],
        where: { providerId },
        required: true,
      },
    ],
    attributes: ['operator_id'],
    group: ['operator_id'],
  });

  const operatorIds = maps.map((row) => row.get('operator_id') as string);
  if (!operatorIds.length) return [];

  const users = await UsersModel.findAll({
    where: { user_uuid: { [Op.in]: operatorIds } },
    attributes: ['user_uuid', 'firstname', 'lastname', 'email'],
    include: [{ model: UserRoleModel, as: 'userRole', attributes: ['id', 'name', 'type'] }],
  });
  const userByUuid = new Map(users.map((user) => [user.get('user_uuid') as string, user]));

  return operatorIds.map((operatorId) => {
    const user = userByUuid.get(operatorId);
    const plain = user?.get({ plain: true }) as any;
    const name = plain ? [plain.firstname, plain.lastname].filter(Boolean).join(' ') || null : null;
    return new SpeedOperator({
      id: operatorId,
      name,
      email: plain?.email ?? null,
      roleId: plain?.userRole?.id ?? null,
      roleName: plain?.userRole?.name ?? null,
      roleType: plain?.userRole?.type ?? null,
    });
  });
}

function mapBags(bags: WasteBagModel[]): SpeedTransportGroupBag[] {
  return bags.map((bag) => {
    const plain = bag.get({ plain: true }) as any;
    const logHistoryRows = (plain.logHistory ?? []) as any[];
    return {
      id: plain.id,
      wasteBagCode: plain.wasteBagQrCodeId,
      wasteStatus: plain.wasteStatus,
      weightInKgs: plain.weightInKgs ?? null,
      createdAt: plain.createdAt,
      entityId: plain.healthcareFacilityId,
      entityName: plain.healthcareFacilityName ?? null,
      wasteStatusUpdatedAt: plain.wasteStatusUpdatedAt ?? null,
      ...(plain.logHistory !== undefined && {
        logHistory: logHistoryRows
          .map((entry) => ({
            status: entry.waste_bag_status as string,
            action: entry.event as string,
            date: entry.created_at as Date,
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime()),
      }),
    };
  });
}

async function buildSpeedTransportGroup(
  row: WasteTransportationExternalGroupModel,
  includeLogHistory: boolean,
): Promise<SpeedTransportGroup> {
  const plain = row.get({ plain: true }) as any;
  const bags = (plain.wasteBags ?? []) as any[];
  const firstBag = bags[0];

  const relevantEntityIds = [
    firstBag?.healthcareFacilityId,
    plain.transporterId,
    plain.treatmentProviderId,
  ].filter((id): id is number => !!id);
  const entities = relevantEntityIds.length
    ? await EntitiesModel.findAll({
        where: { id: { [Op.in]: relevantEntityIds } },
        attributes: ['id', 'name', 'nib'],
      })
    : [];
  const entityById = new Map(entities.map((entity) => [entity.get('id') as number, entity]));

  const entityEntry = firstBag ? entityById.get(firstBag.healthcareFacilityId) : undefined;
  const transporterEntry = plain.transporterId ? entityById.get(plain.transporterId) : undefined;
  const treatmentEntry = plain.treatmentProviderId
    ? entityById.get(plain.treatmentProviderId)
    : undefined;

  const [transportOperators, treatmentOperators] = await Promise.all([
    fetchOperatorsForProvider(plain.transporterId),
    fetchOperatorsForProvider(plain.treatmentProviderId),
  ]);

  const transportSide: SpeedTransportGroupPartnershipSide = {
    providerId: plain.transporterId ?? null,
    providerName: (transporterEntry?.get('name') as string) ?? null,
    operators: transportOperators,
  };
  const treatmentSide: SpeedTransportGroupPartnershipSide = {
    providerId: plain.treatmentProviderId ?? null,
    providerName: (treatmentEntry?.get('name') as string) ?? null,
    operators: treatmentOperators,
  };

  const classification = firstBag?.wasteClassification;

  return new SpeedTransportGroup({
    id: plain.id,
    groupCode: plain.groupId,
    entityId: firstBag?.healthcareFacilityId,
    entityName: (entityEntry?.get('name') as string) ?? firstBag?.healthcareFacilityName ?? null,
    entityNib: (entityEntry?.get('nib') as string) ?? null,
    totalBags: plain.totalBagsCount,
    totalWeightInKgs: plain.totalWeightInKgs,
    totalWeightInTons: plain.totalWeightInKgs != null ? Number(plain.totalWeightInKgs) / 1000 : 0,
    wasteStatus: plain.transportationStatus,
    transporterId: plain.transporterId ?? null,
    transporterName: (transporterEntry?.get('name') as string) ?? null,
    // See note above — this model's timestamp attribute is `created_at`, not `createdAt`.
    createdAt: plain.created_at,
    bags: mapBags(row.get('wasteBags') as WasteBagModel[]),
    wasteClassification: classification
      ? {
          id: classification.id,
          wasteTypeId: classification.wasteTypeId,
          wasteTypeName: classification.wasteType?.name ?? null,
          wasteGroupId: classification.wasteGroupId,
          wasteGroupName: classification.wasteGroup?.name ?? null,
          wasteCharacteristicId: classification.wasteCharacteristicsId,
          wasteCharacteristicName: classification.wasteCharacteristics?.name ?? null,
          wasteCode: classification.wasteCode,
          wasteBagColorCode: classification.wasteBagColorCode,
          useColdStorage: classification.useColdStorage,
        }
      : null,
    partnership: { transport: transportSide, treatment: treatmentSide },
  });
}

export default class SpeedHandoverRepositoryImpl implements SpeedHandoverRepository {
  async getAllTransportGroups(filter: SpeedTransportGroupListFilter) {
    try {
      const { limit, page } = paginationUtils.sanitizePaginationParams({
        limit: filter.limit,
        page: filter.page,
      });

      const entityId = await resolveEntityId(filter.entityId, filter.nib);
      if (filter.nib && entityId === null) {
        return paginationUtils.formatPaginationResult<SpeedTransportGroup>([], 0, limit, page);
      }

      const groupWhere: Record<string, any> = {};
      if (filter.wasteStatus) groupWhere.transportationStatus = filter.wasteStatus;
      if (filter.startDate || filter.endDate) {
        // `WasteTransportationExternalGroupModel`'s timestamp attribute is literally named
        // `created_at` (snake_case) — unlike almost every other model in this codebase, it was
        // NOT declared with the usual `createdAt` (camelCase, mapped via `field:`).
        groupWhere.created_at = {
          ...(filter.startDate && { [Op.gte]: normalizeStartDate(filter.startDate) }),
          ...(filter.endDate && { [Op.lte]: normalizeEndDate(filter.endDate) }),
        };
      }

      const { count, rows } = await WasteTransportationExternalGroupModel.findAndCountAll({
        where: groupWhere,
        limit,
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']],
        distinct: true,
        include: [
          {
            model: WasteBagModel,
            as: 'wasteBags',
            required: true,
            ...(entityId && { where: { healthcareFacilityId: entityId } }),
            include: [WASTE_CLASSIFICATION_INCLUDE],
          },
        ],
      });

      const data = await Promise.all(rows.map((row) => buildSpeedTransportGroup(row, false)));
      return paginationUtils.formatPaginationResult(data, count, limit, page);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED transport groups: ${error.message}`
          : 'Unknown error occurred while fetching SPEED transport groups',
      );
    }
  }

  async getTransportGroupByCode(groupCode: string): Promise<SpeedTransportGroup | null> {
    try {
      const row = await WasteTransportationExternalGroupModel.findOne({
        where: { groupId: groupCode },
        include: [
          {
            model: WasteBagModel,
            as: 'wasteBags',
            required: false,
            include: [
              WASTE_CLASSIFICATION_INCLUDE,
              { model: WasteBagAuditTrailModel, as: 'logHistory' },
            ],
          },
        ],
      });
      if (!row) return null;

      return await buildSpeedTransportGroup(row, true);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED transport group by code: ${error.message}`
          : 'Unknown error occurred while fetching SPEED transport group by code',
      );
    }
  }

  async getAllOperators(filter: SpeedOperatorFilter): Promise<SpeedOperator[]> {
    try {
      const entityId = await resolveEntityId(filter.entityId, filter.nib);
      if (!entityId) return [];

      const operators = await fetchOperatorsForProvider(entityId);
      if (!filter.role) return operators;

      const role = filter.role.toLowerCase();
      return operators.filter(
        (operator) =>
          operator.roleType?.toLowerCase() === role ||
          operator.roleName?.toLowerCase().includes(role),
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED operators: ${error.message}`
          : 'Unknown error occurred while fetching SPEED operators',
      );
    }
  }

  async getAllTreatmentProviders(filter: SpeedTreatmentProviderFilter) {
    try {
      const { limit, page } = paginationUtils.sanitizePaginationParams({
        limit: filter.limit,
        page: filter.page,
      });

      // "Pengolah/pihak ketiga" isn't its own table — it's an EntitiesModel row that operates at
      // least one TREATMENT-type location. This is a cleaner, unambiguous signal than trying to
      // enumerate partnership providerType strings (which mix transporter/treatment variants).
      const treatmentLocationRows = await EntityLocationModel.findAll({
        where: { locationType: 'TREATMENT' },
        attributes: ['entityId'],
        group: ['entityId'],
      });
      const treatmentEntityIds = treatmentLocationRows.map((row) => row.get('entityId') as number);
      if (!treatmentEntityIds.length) {
        return paginationUtils.formatPaginationResult<SpeedTreatmentProvider>([], 0, limit, page);
      }

      const entityWhere: Record<string, any> = { id: { [Op.in]: treatmentEntityIds } };
      if (filter.keyword) entityWhere.name = { [Op.like]: `%${filter.keyword}%` };
      if (filter.nib) entityWhere.nib = filter.nib;

      const { count, rows } = await EntitiesModel.findAndCountAll({
        where: entityWhere,
        limit,
        offset: (page - 1) * limit,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'nib'],
      });

      const entityIds = rows.map((row) => row.get('id') as number);
      const locations = entityIds.length
        ? await EntityLocationModel.findAll({
            where: { entityId: { [Op.in]: entityIds }, locationType: 'TREATMENT' },
            attributes: ['id', 'entityId', 'locationName', 'address'],
          })
        : [];
      const locationsByEntityId = new Map<number, typeof locations>();
      for (const location of locations) {
        const entityId = location.get('entityId') as number;
        const existing = locationsByEntityId.get(entityId) ?? [];
        existing.push(location);
        locationsByEntityId.set(entityId, existing);
      }

      const data = rows.map((row) => {
        const id = row.get('id') as number;
        const entityLocations = locationsByEntityId.get(id) ?? [];
        return new SpeedTreatmentProvider({
          id,
          name: row.get('name') as string,
          nib: (row.get('nib') as string) ?? null,
          locations: entityLocations.map((location) => ({
            id: location.get('id') as number,
            name: location.get('locationName') as string,
            address: (location.get('address') as string) ?? null,
          })),
        });
      });

      return paginationUtils.formatPaginationResult(data, count, limit, page);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED treatment providers: ${error.message}`
          : 'Unknown error occurred while fetching SPEED treatment providers',
      );
    }
  }

  async handoverToTransporter(input: HandoverToTransporterInput): Promise<string[] | string> {
    try {
      const groupIds = await resolveGroupCodesToIds(input.groupCodes);
      if (!groupIds) return 'INVALID_GROUP_IDS';

      const entityId = await resolveEntityId(input.entityId, input.nib);
      if (!entityId) return 'NOT_FOUND';

      const wasteBagRepository = new WasteBagRepositoryImpl();

      const handoverResult = await wasteBagRepository.createHandoverTransportExternalWasteBag(
        groupIds,
        entityId,
        input.latitude ?? 0,
        input.longitude ?? 0,
        input.vehicleNumber,
        input.handoverTimestamp,
        input.manifestDocNumber ?? '',
        input.transporterUpdatedBy,
        input.transporterOperatorId,
        undefined,
        undefined,
        input.isReadOnly,
      );
      if (typeof handoverResult === 'string') return handoverResult;

      // Manifest file is mandatory in the internal mobile/web flow (HandoverTransportExternalWasteBagUseCase
      // enforces it at the controller level) — SPEED makes it optional by simply skipping the
      // upload step entirely when no file is sent, instead of changing that shared requirement.
      if (input.manifestFile) {
        const s3 = new S3FileServiceRepositoryImpl();
        const { doc_number, document_path } = await s3.uploadImage(
          input.manifestFile,
          input.manifestDocNumber ?? String(input.handoverTimestamp.getTime()),
          String(entityId),
          'speed-handover',
        );
        await wasteBagRepository.updateFilePath(groupIds, doc_number, document_path);
      }

      const pickupResult = await wasteBagRepository.createPickUpTransportExternalWasteBag(
        groupIds,
        entityId,
        input.latitude ?? 0,
        input.longitude ?? 0,
        input.transporterUpdatedBy,
        input.transporterOperatorId ?? '',
        input.transporterId,
        undefined,
        undefined,
        input.isReadOnly,
      );
      if (typeof pickupResult === 'string') return pickupResult;

      return pickupResult.wasteBagQrCodeId;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error handing over SPEED waste to transporter: ${error.message}`
          : 'Unknown error occurred while handing over SPEED waste to transporter',
      );
    }
  }

  async handoverToTreatment(input: HandoverToTreatmentInput): Promise<string[] | string> {
    try {
      const groupIds = await resolveGroupCodesToIds(input.groupCodes);
      if (!groupIds) return 'INVALID_GROUP_IDS';

      const thirdPartyId = await resolveEntityId(input.thirdPartyId, input.nib);
      if (!thirdPartyId) return 'NOT_FOUND';

      const wasteBagRepository = new WasteBagRepositoryImpl();
      const result = await wasteBagRepository.createHandoverTreatmentExternalWasteBag(
        groupIds,
        thirdPartyId,
        input.updatedBy,
        input.startTime,
        input.endTime,
        input.treatmentLocationId,
        thirdPartyId,
      );
      if (typeof result === 'string') return result;

      // `createHandoverTreatmentExternalWasteBag` doesn't persist any operator field at all —
      // this is additive, SPEED-only bookkeeping on top of it, not a modification of that shared
      // method, so it can't collide with the internal mobile/web treatment-handover flow.
      if (input.transporterOperatorId) {
        await WasteTransportationExternalGroupModel.update(
          { transporterOperatorId: input.transporterOperatorId },
          { where: { id: { [Op.in]: groupIds } } },
        );
      }

      return result.wasteBagQrCodeIds;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error handing over SPEED waste to treatment: ${error.message}`
          : 'Unknown error occurred while handing over SPEED waste to treatment',
      );
    }
  }
}
