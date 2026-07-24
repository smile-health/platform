import { Op } from 'sequelize';
import SpeedWaste from '../../../domain/entities/SpeedWaste';
import SpeedWasteRepository, {
  SpeedWasteAggregate,
  SpeedWasteAggregateTransaksi,
  SpeedWasteListFilter,
} from '../../../domain/repositories/SpeedWasteRepository';
import WasteBagModel from '../models/WasteBagModel';
import EntitiesModel from '../models/EntitiesModel';
import { WasteBagAuditTrailModel } from '../models/WasteBagAuditTrailModel';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../models/WasteHierarchyModel';
import WasteTransportationGroupModel from '../models/WasteTransportationGroupModel';
import WasteTransportationExternalGroupModel from '../models/WasteTransportationExternalGroupModel';
import { PartnerVehicleModel } from '../models/PartnerVehicleModel';
import { paginationUtils } from '../../../shared/utils/pagination';
import { sequelize } from '../db.connection';

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

const TRANSPORT_GROUP_INCLUDES = [
  {
    model: WasteTransportationExternalGroupModel,
    as: 'transportationExternalGroup',
    required: false,
    attributes: ['id'],
    include: [
      {
        model: PartnerVehicleModel,
        as: 'partnerVehicle',
        attributes: ['vehicleNumber'],
        required: false,
      },
    ],
  },
  {
    model: WasteTransportationGroupModel,
    as: 'transportationGroup',
    required: false,
    attributes: ['transporterVehicleId'],
  },
];

async function resolveVehicleNumbers(rows: WasteBagModel[]): Promise<Map<number, string>> {
  const internalVehicleIds = [
    ...new Set(
      rows
        .map((row) => (row as any).transportationGroup?.transporterVehicleId as number | undefined)
        .filter((id): id is number => !!id),
    ),
  ];
  if (!internalVehicleIds.length) return new Map();

  const vehicles = await PartnerVehicleModel.findAll({
    where: { id: internalVehicleIds },
    attributes: ['id', 'vehicleNumber'],
  });
  return new Map(vehicles.map((v) => [v.get('id') as number, v.get('vehicleNumber') as string]));
}

function mapRowToSpeedWaste(
  row: WasteBagModel,
  vehicleNumberById: Map<number, string>,
  logHistory?: SpeedWaste['logHistory'],
  entityNib?: string | null,
): SpeedWaste {
  const plain = row.get({ plain: true }) as any;
  const classification = plain.wasteClassification;

  const vehicleNumber =
    plain.transportationExternalGroup?.partnerVehicle?.vehicleNumber ??
    (plain.transportationGroup?.transporterVehicleId
      ? (vehicleNumberById.get(plain.transportationGroup.transporterVehicleId) ?? null)
      : null);

  return new SpeedWaste({
    id: plain.id,
    wasteBagCode: plain.wasteBagQrCodeId,
    entityId: plain.healthcareFacilityId,
    entityName: plain.healthcareFacilityName ?? null,
    entityNib,
    location: {
      provinceId: plain.provinceId ?? null,
      provinceName: plain.provinceName ?? null,
      regencyId: plain.regencyId ?? null,
      regencyName: plain.regencyName ?? null,
      districtId: plain.districtId ?? null,
      districtName: plain.districtName ?? null,
    },
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
    transporterId: plain.transporterId ?? null,
    transporterName: plain.transporterName ?? null,
    thirdPartyId: plain.thirdPartyId ?? null,
    thirdPartyName: plain.thirdPartyName ?? null,
    vehicleNumber,
    ownedBy: plain.ownedBy,
    weightInKgs: plain.weightInKgs ?? null,
    weightInTons: plain.weightInKgs != null ? Number(plain.weightInKgs) / 1000 : null,
    wasteStatus: plain.wasteStatus,
    wasteStatusUpdatedAt: plain.wasteStatusUpdatedAt ?? null,
    wasteStatusUpdatedBy: plain.wasteStatusUpdatedBy ?? null,
    transportationStatus: plain.transportationStatus ?? null,
    transportationStatusUpdatedAt: plain.transportationStatusUpdatedAt ?? null,
    transportationStatusUpdatedBy: plain.transportationStatusUpdatedBy ?? null,
    createdAt: plain.createdAt,
    createdBy: plain.createdBy,
    updatedAt: plain.updatedAt ?? null,
    updatedBy: plain.updatedBy ?? null,
    scaleMethod: plain.scaleMethod,
    storageStartTimestamp: plain.storageStartTimestamp ?? null,
    scheduledStorageEndDatetime: plain.scheduledStorageEndDatetime ?? null,
    actualStorageEndDatetime: plain.actualStorageEndTimestamp ?? null,
    maxStorageHours: plain.maxStorageHours ?? null,
    minimumStorageHours: plain.minStorageHours ?? null,
    isTreated: plain.isTreated,
    isDisposed: plain.isDisposed,
    binNumber: plain.binNumber ?? null,
    iotMethod: plain.iotMethod ?? null,
    manifestDocNumber: plain.manifestDocNumber ?? null,
    manifestDocPath: plain.manifestDocPath ?? null,
    treatmentStartTime: plain.treatmentStartTime ?? null,
    treatmentEndTime: plain.treatmentEndTime ?? null,
    treatmentLocationId: plain.treatmentLocationId ?? null,
    bastNo: plain.bastNo ?? null,
    logHistory,
  });
}

export default class SpeedWasteRepositoryImpl implements SpeedWasteRepository {
  async getAllWaste(filter: SpeedWasteListFilter) {
    try {
      const { limit, page } = paginationUtils.sanitizePaginationParams({
        limit: filter.limit,
        page: filter.page,
      });

      const where: Record<string, any> = {};
      if (filter.id) where.id = filter.id;
      if (filter.entityId) where.healthcareFacilityId = filter.entityId;

      if (filter.nib) {
        // nib takes precedence over entityId if both are sent — they identify the same
        // healthcare facility two different ways, so nib "wins" rather than being AND-ed
        // (which would just silently return zero rows if a caller mismatched them).
        const entity = await EntitiesModel.findOne({
          where: { nib: filter.nib },
          attributes: ['id'],
        });
        if (!entity) {
          return paginationUtils.formatPaginationResult<SpeedWaste>([], 0, limit, page);
        }
        where.healthcareFacilityId = entity.get('id');
      }

      if (filter.transporterId) where.transporterId = filter.transporterId;
      if (filter.thirdPartyId) where.thirdPartyId = filter.thirdPartyId;
      // `!== undefined` (not `?.length`) so an explicit empty array really filters to zero
      // rows via Op.in: [] — only "param not sent at all" should mean "no filter".
      if (filter.wasteClassificationId !== undefined)
        where.wasteClassificationId = { [Op.in]: filter.wasteClassificationId };
      if (filter.ownedBy) where.ownedBy = filter.ownedBy;
      if (filter.wasteStatus) where.wasteStatus = filter.wasteStatus;
      if (filter.wasteBagCode) where.wasteBagQrCodeId = filter.wasteBagCode;

      const needsClassificationFilter =
        filter.wasteTypeId !== undefined ||
        filter.wasteGroupId !== undefined ||
        filter.wasteCharacteristicsId !== undefined;

      const classificationInclude = needsClassificationFilter
        ? {
            ...WASTE_CLASSIFICATION_INCLUDE,
            required: true,
            where: {
              ...(filter.wasteTypeId !== undefined && {
                wasteTypeId: { [Op.in]: filter.wasteTypeId },
              }),
              ...(filter.wasteGroupId !== undefined && {
                wasteGroupId: { [Op.in]: filter.wasteGroupId },
              }),
              ...(filter.wasteCharacteristicsId !== undefined && {
                wasteCharacteristicsId: { [Op.in]: filter.wasteCharacteristicsId },
              }),
            },
          }
        : WASTE_CLASSIFICATION_INCLUDE;

      const { count, rows } = await WasteBagModel.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['id', 'DESC']],
        include: [classificationInclude, ...TRANSPORT_GROUP_INCLUDES],
      });

      const vehicleNumberById = await resolveVehicleNumbers(rows);
      const data = rows.map((row) => mapRowToSpeedWaste(row, vehicleNumberById));

      return paginationUtils.formatPaginationResult(data, count, limit, page);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED waste: ${error.message}`
          : 'Unknown error occurred while fetching SPEED waste',
      );
    }
  }

  async getWasteById(wasteBagCode: string): Promise<SpeedWaste | null> {
    try {
      const bag = await WasteBagModel.findOne({
        where: { wasteBagQrCodeId: wasteBagCode },
        include: [
          WASTE_CLASSIFICATION_INCLUDE,
          ...TRANSPORT_GROUP_INCLUDES,
          { model: WasteBagAuditTrailModel, as: 'logHistory' },
        ],
      });
      if (!bag) return null;

      const vehicleNumberById = await resolveVehicleNumbers([bag]);

      const entity = await EntitiesModel.findOne({
        where: { id: bag.get('healthcareFacilityId') },
        attributes: ['nib'],
      });
      const entityNib = (entity?.get('nib') as string) ?? null;

      const logHistoryRows = ((bag as any).logHistory ?? []) as WasteBagAuditTrailModel[];
      const logHistory = logHistoryRows
        .map((entry) => ({
          status: entry.get('waste_bag_status') as string,
          action: entry.get('event') as string,
          date: entry.get('created_at') as Date,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return mapRowToSpeedWaste(bag, vehicleNumberById, logHistory, entityNib);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED waste by ID: ${error.message}`
          : 'Unknown error occurred while fetching SPEED waste by ID',
      );
    }
  }

  async getAggregate(
    startDate?: string,
    endDate?: string,
    entityId?: number,
    nib?: string,
  ): Promise<SpeedWasteAggregate> {
    try {
      let effectiveEntityId = entityId;
      if (nib) {
        // nib takes precedence over entityId if both are sent — same "identifies the same
        // facility two different ways" rule as getAllWaste.
        const entity = await EntitiesModel.findOne({ where: { nib }, attributes: ['id'] });
        if (!entity) {
          return { total_berat: 0, total_transaksi: 0, transaksi: [] };
        }
        effectiveEntityId = entity.get('id') as number;
      }

      const replacements: Record<string, any> = {};
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('wb.created_at >= :startDate');
        // date-only input (no time component) means "start of that day" — without this,
        // `new Date('2026-03-03')` parses to 00:00:00 UTC which can shift a day depending on
        // server timezone, but more importantly pairs incorrectly with endDate below if not
        // made explicit here too.
        replacements.startDate = startDate.includes('T')
          ? new Date(startDate)
          : new Date(`${startDate}T00:00:00.000`);
      }
      if (endDate) {
        conditions.push('wb.created_at <= :endDate');
        // date-only input must mean "end of that day", not midnight at its start — otherwise
        // this excludes every record created later that same day (the reported bug).
        replacements.endDate = endDate.includes('T')
          ? new Date(endDate)
          : new Date(`${endDate}T23:59:59.999`);
      }
      if (effectiveEntityId) {
        conditions.push('wb.healthcare_facility_id = :entityId');
        replacements.entityId = effectiveEntityId;
      }
      const extraWhere = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

      const rows = (await sequelize.query(
        `
                SELECT
                    wt.id AS waste_type_id,
                    wt.name AS waste_type_name,
                    wg.id AS waste_group_id,
                    wg.name AS waste_group_name,
                    COUNT(wb.id) AS total_transactions,
                    COALESCE(SUM(wb.weight_in_kgs), 0) AS total_weight
                FROM waste_bag wb
                INNER JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                INNER JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
                INNER JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
                WHERE wb.deleted_at IS NULL ${extraWhere}
                GROUP BY wt.id, wt.name, wg.id, wg.name
                ORDER BY wt.id, wg.id
                `,
        { replacements, type: 'SELECT' },
      )) as any[];

      const typeMap = new Map<number, SpeedWasteAggregateTransaksi>();
      for (const row of rows) {
        const typeId = Number(row.waste_type_id);
        if (!typeMap.has(typeId)) {
          typeMap.set(typeId, {
            id_jenis_limbah: typeId,
            nama_jenis_limbah: row.waste_type_name ?? null,
            total_transaksi: 0,
            total_berat: 0,
            rincian: [],
          });
        }
        const entry = typeMap.get(typeId)!;
        const groupTransactions = Number(row.total_transactions);
        const groupWeight = Number(row.total_weight);
        entry.total_transaksi += groupTransactions;
        entry.total_berat += groupWeight;
        entry.rincian.push({
          id_kelompok_limbah: Number(row.waste_group_id),
          nama_kelompok_limbah: row.waste_group_name ?? null,
          total_transaksi: groupTransactions,
          total_berat: groupWeight,
        });
      }

      const transaksi = [...typeMap.values()];
      return {
        total_berat: transaksi.reduce((sum, t) => sum + t.total_berat, 0),
        total_transaksi: transaksi.reduce((sum, t) => sum + t.total_transaksi, 0),
        transaksi,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Error fetching SPEED waste aggregate: ${error.message}`
          : 'Unknown error occurred while fetching SPEED waste aggregate',
      );
    }
  }
}
