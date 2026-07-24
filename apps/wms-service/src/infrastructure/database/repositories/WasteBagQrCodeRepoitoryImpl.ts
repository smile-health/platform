import WasteBagQrCode from '../../../domain/entities/WasteBagQrCode';
import { WasteBagQrCodeModel, WasteBagQrCodeAttributes } from '../models/WasteBagQrCodeModel';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteSourceModel from '../models/WasteSourceModel';
import { WasteSourceAttributes } from '../models/WasteSourceModel';
import { WasteClassificationModel } from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../models/WasteHierarchyModel';
import WasteBagModel from '../models/WasteBagModel';
import redis from '../../cache/redis.client';
export default class WasteBagQrCodeRepositoryImpl implements WasteBagQrCodeRepository {
  async createWasteBagQrCode(data: WasteBagQrCode): Promise<number> {
    try {
      const now = new Date();

      const dateKey = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      const redisKey = `wastebag_qrcode_counter:${dateKey}`;

      const nextId = await redis.incr(redisKey);

      redis.expire(redisKey, 60 * 60 * 48); // 48 jam

      const newIdDigit = nextId.toString().padStart(4, '0');

      const formattedDate = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${now.getFullYear()}`;

      const newQrCode = `${newIdDigit}${formattedDate}`;

      const createModelObj: WasteBagQrCodeAttributes = {
        createdBy: data.createdBy,
        healthcareFacilityId: data.healthcareFacilityId,
        wasteClassificationId: data.wasteClassificationId,
        wasteSourceId: data.wasteSourceId,
        qrCode: newQrCode,
      };

      const response = await WasteBagQrCodeModel.create(createModelObj);

      if (response.id === undefined || response.id === null) {
        throw new Error('Error creating Waste bag qr code');
      }

      return response.id;
    } catch (error) {
      console.error('Error creating Waste bag qr code:', error);
      throw new Error('Error creating Waste bag qr code');
    }
  }

  async getWasteBagQrCodeAfterCreateByIds(ids: number[]): Promise<WasteBagQrCode[]> {
    try {
      let existingDatas = await WasteBagQrCodeModel.findAll({
        attributes: ['id', 'qrCode'],
        where: {
          id: ids,
        },
        include: [
          {
            model: WasteSourceModel,
            as: 'wasteSource',
            required: false,
            attributes: [
              'sourceType',
              'internalSourceName',
              'internalTreatmentName',
              'externalHealthcareFacilityName',
            ],
          },
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: false,
            attributes: ['minimunDecayDay'],
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                attributes: ['id', 'name', 'nameEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                attributes: ['id', 'name', 'nameEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                attributes: ['id', 'name', 'nameEn'],
                required: false,
              },
            ],
          },
        ],
      });

      return existingDatas.map((data) => {
        const existingData = data.get({ plain: true });
        const externalData = existingData.wasteSource as WasteSourceAttributes | null;
        const externalDataWasteClassification = existingData.wasteClassification as any | null;
        return {
          id: existingData.id as number | undefined,
          qrCode: existingData.qrCode,
          wasteSource: externalData ? existingData.wasteSource : undefined,
          wasteClassification: externalDataWasteClassification
            ? externalDataWasteClassification
            : undefined,
        };
      }) as WasteBagQrCode[];
    } catch (error) {
      console.error('Error retrieving waste bag qr code:', error);
      throw new Error('Error retrieving waste bag qr code');
    }
  }

  async getWasteBagQrCodeById(
    id: string,
    entityId: number,
  ): Promise<WasteBagQrCode | null | string> {
    try {
      const checkWastebag = await WasteBagModel.findOne({
        where: {
          wasteBagQrCodeId: id,
        },
        include: [
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: false,
            attributes: ['tempStorageMaxHours', 'minimunDecayDay'],
          },
        ],
        attributes: ['id', 'scheduledStorageEndDatetime'],
      });

      if (checkWastebag && checkWastebag !== null) {
        const classWaste = checkWastebag.dataValues.wasteClassification as any;
        const decayDay = classWaste.dataValues?.minimunDecayDay;

        if (!decayDay) {
          return 'ALREADY_REGISTERED';
        } else {
          const nowDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
          const endDate = new Date(
            checkWastebag.dataValues?.scheduledStorageEndDatetime as Date,
          ).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

          if (nowDate < endDate) {
            return 'RADIOACTIVE_STILL_IN_STORAGE';
          }
        }
      }

      let existingDatas = await WasteBagQrCodeModel.findOne({
        attributes: [
          'id',
          'qrCode',
          'wasteSourceId',
          'wasteClassificationId',
          'healthcareFacilityId',
          'createdAt',
          'createdBy',
        ],
        where: {
          qrCode: id,
          healthcareFacilityId: entityId,
        },
        include: [
          {
            model: WasteSourceModel,
            as: 'wasteSource',
            required: false,
            attributes: [
              'id',
              'healthcareFacilityId',
              'sourceType',
              'internalSourceName',
              'internalTreatmentName',
              'externalHealthcareFacilityId',
              'externalHealthcareFacilityName',
              'isActive',
            ],
          },
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: false,
            attributes: [
              'id',
              'regionId',
              'effectiveFrom',
              'effectiveTo',
              'wasteTypeId',
              'wasteGroupId',
              'wasteCharacteristicsId',
              'wasteCode',
              'wasteBagColorCode',
              'storageRuleType',
              'useColdStorage',
              'coldStorageMinHours',
              'coldStorageMaxHours',
              'tempStorageMinHours',
              'tempStorageMaxHours',
              'minimunDecayDay',
              'storageRule',
              'allowHealthcareFacilityTreatment',
              'hasMultipleTransporters',
              'treatmentMethod',
              'disposalMethod',
              'allowedVehicleTypes',
            ],
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
                required: false,
              },
            ],
          },
        ],
      });

      if (!existingDatas) {
        return 'NOT_FOUND';
      }

      const existingData = existingDatas.get({ plain: true });
      const externalData = existingData.wasteSource as WasteSourceAttributes | null;
      const externalDataWasteClassification = existingData.wasteClassification as any | null;

      return new WasteBagQrCode({
        id: existingData.id as number | undefined,
        createdBy: existingData.createdBy,
        createdAt: existingData.createdAt,
        healthcareFacilityId: existingData.healthcareFacilityId,
        wasteSourceId: existingData.wasteSourceId,
        wasteClassificationId: existingData.wasteClassificationId,
        qrCode: existingData.qrCode,
        wasteSource: externalData
          ? {
              id: externalData.id,
              healthcareFacilityId: externalData.healthcareFacilityId,
              sourceType: externalData.sourceType,
              internalSourceName: externalData.internalSourceName,
              internalTreatmentName: externalData.internalTreatmentName,
              externalHealthcareFacilityId: externalData.externalHealthcareFacilityId,
              externalHealthcareFacilityName: externalData.externalHealthcareFacilityName,
              isActive: externalData.isActive,
              isResidue: externalData.isResidue,
            }
          : undefined,
        wasteClassification: externalDataWasteClassification
          ? {
              id: externalDataWasteClassification.id,
              regionId: externalDataWasteClassification.regionId,
              effectiveFrom: externalDataWasteClassification.effectiveFrom,
              effectiveTo: externalDataWasteClassification.effectiveTo,
              wasteTypeId: externalDataWasteClassification.wasteTypeId,
              wasteGroupId: externalDataWasteClassification.wasteGroupId,
              wasteCharacteristicsId: externalDataWasteClassification.wasteCharacteristicsId,
              wasteCode: externalDataWasteClassification.wasteCode,
              wasteBagColorCode: externalDataWasteClassification.wasteBagColorCode,
              storageRuleType: externalDataWasteClassification.storageRuleType,
              useColdStorage: externalDataWasteClassification.useColdStorage,
              coldStorageMinHours: externalDataWasteClassification.coldStorageMinHours,
              coldStorageMaxHours: externalDataWasteClassification.coldStorageMaxHours,
              tempStorageMinHours: externalDataWasteClassification.tempStorageMinHours,
              tempStorageMaxHours: externalDataWasteClassification.tempStorageMaxHours,
              minimunDecayDay: externalDataWasteClassification.minimunDecayDay,
              storageRule: externalDataWasteClassification.storageRule,
              allowHealthcareFacilityTreatment:
                externalDataWasteClassification.allowHealthcareFacilityTreatment,
              treatmentMethod: externalDataWasteClassification.treatmentMethod,
              hasMultipleTransporters: externalDataWasteClassification.hasMultipleTransporters,
              disposalMethod: externalDataWasteClassification.disposalMethod,
              allowedVehicleTypes: externalDataWasteClassification.allowedVehicleTypes,
              wasteType: {
                id: externalDataWasteClassification.wasteType.id,
                name: externalDataWasteClassification.wasteType.name,
                description: externalDataWasteClassification.wasteType.description,
                nameEn: externalDataWasteClassification.wasteType.nameEn,
                descriptionEn: externalDataWasteClassification.wasteType.descriptionEn,
                parentHierarchyId: externalDataWasteClassification.wasteType.parentHierarchyId,
              },
              wasteGroup: {
                id: externalDataWasteClassification.wasteGroup.id,
                name: externalDataWasteClassification.wasteGroup.name,
                description: externalDataWasteClassification.wasteGroup.description,
                nameEn: externalDataWasteClassification.wasteGroup.nameEn,
                descriptionEn: externalDataWasteClassification.wasteGroup.descriptionEn,
                parentHierarchyId: externalDataWasteClassification.wasteGroup.parentHierarchyId,
              },
              wasteCharacteristics: {
                id: externalDataWasteClassification.wasteCharacteristics.id,
                name: externalDataWasteClassification.wasteCharacteristics.name,
                description: externalDataWasteClassification.wasteCharacteristics.description,
                nameEn: externalDataWasteClassification.wasteCharacteristics.nameEn,
                descriptionEn: externalDataWasteClassification.wasteCharacteristics.descriptionEn,
                isResidue: externalDataWasteClassification.wasteCharacteristics.isResidue,
                parentHierarchyId:
                  externalDataWasteClassification.wasteCharacteristics.parentHierarchyId,
              },
            }
          : undefined,
        scheduledStorageEndDatetime: checkWastebag?.dataValues?.scheduledStorageEndDatetime,
      });
    } catch (error) {
      console.error('Error retrieving waste bag qr code:', error);
      throw new Error('Error retrieving waste bag qr code');
    }
  }

  async getOneByWasteSourceId(id: number): Promise<number | undefined> {
    try {
      const existingData = await WasteBagQrCodeModel.findOne({
        where: {
          wasteSourceId: id,
        },
        attributes: ['id'],
      });

      return existingData?.get('id') as number | undefined;
    } catch (error) {
      console.error('Error fetching WasteBags by Transport Group ID:', error);
      throw new Error('Database error');
    }
  }

  async getAllWasteBagQrCodes(
    limit: number,
    page: number,
    entity_id: string | number | undefined,
    search: string | undefined = undefined,
  ): Promise<{
    data: WasteBagQrCode[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      const facilityId = typeof entity_id === 'string' ? parseInt(entity_id, 10) : entity_id;

      const { count, rows } = await WasteBagQrCodeModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id',
          'qrCode',
          'wasteSourceId',
          'wasteClassificationId',
          'healthcareFacilityId',
          'createdBy',
        ],
        distinct: true,
        where: {
          healthcareFacilityId: facilityId,
          // ...(search && {
          //     waste_characteristic_name: { [Op.like]: `%${search}%` },
          // }),
        },
        include: [
          {
            model: WasteSourceModel,
            as: 'wasteSource',
            required: false,
            attributes: [
              'id',
              'healthcareFacilityId',
              'sourceType',
              'internalSourceName',
              'internalTreatmentName',
              'externalHealthcareFacilityId',
              'externalHealthcareFacilityName',
              'isActive',
            ],
          },
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: false,
            attributes: [
              'id',
              'regionId',
              'effectiveFrom',
              'effectiveTo',
              'wasteTypeId',
              'wasteGroupId',
              'wasteCharacteristicsId',
              'wasteCode',
              'wasteBagColorCode',
              'storageRuleType',
              'useColdStorage',
              'coldStorageMinHours',
              'coldStorageMaxHours',
              'tempStorageMinHours',
              'tempStorageMaxHours',
              'storageRule',
              'allowHealthcareFacilityTreatment',
              'hasMultipleTransporters',
              'treatmentMethod',
              'disposalMethod',
              'allowedVehicleTypes',
            ],
          },
        ],
      });

      return paginationUtils.formatPaginationResult(
        rows.map((m: WasteBagQrCodeModel) => {
          const result = m.get({ plain: true });

          const externalData = result.wasteSource as WasteSourceAttributes | null;
          const externalData2 = result.wasteClassification as any;

          return new WasteBagQrCode({
            id: result.id ?? (m.get('id') as number | undefined),
            createdBy: result.createdBy,
            createdAt: result.createdAt as Date,
            healthcareFacilityId: result.healthcareFacilityId,
            wasteSourceId: result.wasteSourceId,
            wasteClassificationId: result.wasteClassificationId,
            qrCode: result.qrCode,
            wasteSource: externalData
              ? {
                  id: externalData.id,
                  healthcareFacilityId: externalData.healthcareFacilityId,
                  sourceType: externalData.sourceType,
                  internalSourceName: externalData.internalSourceName,
                  internalTreatmentName: externalData.internalTreatmentName,
                  externalHealthcareFacilityId: externalData.externalHealthcareFacilityId,
                  externalHealthcareFacilityName: externalData.externalHealthcareFacilityName,
                  isActive: externalData.isActive,
                  isResidue: externalData.isResidue,
                }
              : undefined,
            wasteClassification: externalData2
              ? {
                  id: externalData2.id,
                  regionId: externalData2.regionId,
                  effectiveFrom: externalData2.effectiveFrom,
                  effectiveTo: externalData2.effectiveTo,
                  wasteTypeId: externalData2.wasteTypeId,
                  wasteGroupId: externalData2.wasteGroupId,
                  wasteCharacteristicsId: externalData2.wasteCharacteristicsId,
                  wasteCode: externalData2.wasteCode,
                  wasteBagColorCode: externalData2.wasteBagColorCode,
                  storageRuleType: externalData2.storageRuleType,
                  useColdStorage: externalData2.useColdStorage,
                  coldStorageMinHours: externalData2.coldStorageMinHours,
                  coldStorageMaxHours: externalData2.coldStorageMaxHours,
                  tempStorageMinHours: externalData2.tempStorageMinHours,
                  tempStorageMaxHours: externalData2.tempStorageMaxHours,
                  storage_rule: externalData2.storageRule,
                  allowHealthcareFacilityTreatment: externalData2.allowHealthcareFacilityTreatment,
                  hasMultipleTransporters: externalData2.hasMultipleTransporters,
                  treatmentMethod: externalData2.treatmentMethod,
                  disposalMethod: externalData2.disposalMethod,
                  allowedVehicleTypes: externalData2.allowedVehicleTypes,
                }
              : undefined,
          });
        }),
        Number(count),
        safeLimit,
        safePage,
      );
    } catch (error) {
      console.error('Error retrieving waste bag qr codes:', error);
      throw new Error('Error retrieving waste bag qr codes');
    }
  }

  async updateWasteBagQrCode(WasteBagQrCode: WasteBagQrCode): Promise<void | null> {
    try {
      if (!WasteBagQrCode.id) {
        throw new Error('Missing required fields for WasteBagQrCode update');
      }

      const existingData = (await checkExistingData(WasteBagQrCodeModel, WasteBagQrCode.id)) as any;

      if (!existingData) {
        console.error(`Waste Bag Qr Code with ID ${WasteBagQrCode.id} not found`);
        return null;
      }

      const updateModelObj = {
        healthcareFacilityId: WasteBagQrCode.healthcareFacilityId,
        wasteClassificationId: WasteBagQrCode.wasteClassificationId,
        wasteSourceId: WasteBagQrCode.wasteSourceId,
        qrCode: WasteBagQrCode.qrCode,
      };

      await WasteBagQrCodeModel.update(updateModelObj, {
        where: { id: WasteBagQrCode.id },
      });
      console.log('Waste Bag Qr Code updated successfully');
    } catch (error) {
      console.error('Error updating Waste Bag Qr Code:', error);
      throw new Error('Error updating Waste Bag Qr Code');
    }
  }

  async deleteWasteBagQrCode(id: string, deletedBy?: number): Promise<boolean | string> {
    try {
      const existingData = (await checkExistingData(WasteBagQrCodeModel, id)) as any;

      if (!existingData) {
        return 'NOT_FOUND';
      }

      if (deletedBy) await existingData.update({ deletedBy });
      await existingData.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting Waste Bag Qr Code:', error);
      throw new Error('Error deleting Waste Bag Qr Code');
    }
  }

  async getWasteBagQrCodeByTransaction(
    wasteSourceId: number,
    wasteClassificationId: number,
    healthcareFacilityId: number,
  ): Promise<WasteBagQrCode[] | string> {
    try {
      let existingData = await WasteBagQrCodeModel.findAll({
        where: {
          wasteSourceId: wasteSourceId,
          wasteClassificationId: wasteClassificationId,
          healthcareFacilityId: healthcareFacilityId,
        },
        include: [
          {
            model: WasteSourceModel,
            as: 'wasteSource',
            attributes: [
              'id',
              'healthcareFacilityId',
              'sourceType',
              'internalSourceName',
              'internalTreatmentName',
              'externalHealthcareFacilityId',
              'externalHealthcareFacilityName',
              'isActive',
            ],
          },
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: false,
            attributes: [
              'id',
              'regionId',
              'effectiveFrom',
              'effectiveTo',
              'wasteTypeId',
              'wasteGroupId',
              'wasteCharacteristicsId',
              'wasteCode',
              'wasteBagColorCode',
              'storageRuleType',
              'useColdStorage',
              'coldStorageMinHours',
              'coldStorageMaxHours',
              'tempStorageMinHours',
              'tempStorageMaxHours',
              'storageRule',
              'allowHealthcareFacilityTreatment',
              'hasMultipleTransporters',
              'treatmentMethod',
              'disposalMethod',
              'allowedVehicleTypes',
            ],
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                required: false,
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
                required: false,
              },
            ],
          },
        ],
      });

      if (!existingData) {
        return 'NOT_FOUND_CLASSIFICATION';
      }

      return existingData.map((m: WasteBagQrCodeModel) => {
        const result = m.get({ plain: true });
        const externalData = result.wasteSource as WasteSourceAttributes | null;
        const externalData2 = result.wasteClassification as any | null;

        return new WasteBagQrCode({
          id: result.id ?? (m.get('id') as number | undefined),
          createdBy: result.createdBy,
          createdAt: result.createdAt,
          healthcareFacilityId: result.healthcareFacilityId,
          wasteSourceId: result.wasteSourceId,
          wasteClassificationId: result.wasteClassificationId,
          qrCode: result.qrCode,
          wasteSource: externalData
            ? {
                id: externalData.id,
                healthcareFacilityId: externalData.healthcareFacilityId,
                sourceType: externalData.sourceType,
                internalSourceName: externalData.internalSourceName,
                internalTreatmentName: externalData.internalTreatmentName,
                externalHealthcareFacilityId: externalData.externalHealthcareFacilityId,
                externalHealthcareFacilityName: externalData.externalHealthcareFacilityName,
                isActive: externalData.isActive,
                isResidue: externalData.isResidue,
              }
            : undefined,
          wasteClassification: externalData2
            ? {
                id: externalData2.id,
                regionId: externalData2.regionId,
                effectiveFrom: externalData2.effectiveFrom,
                effectiveTo: externalData2.effectiveTo,
                wasteTypeId: externalData2.wasteTypeId,
                wasteGroupId: externalData2.wasteGroupId,
                wasteCharacteristicsId: externalData2.wasteCharacteristicsId,
                wasteCode: externalData2.wasteCode,
                wasteBagColorCode: externalData2.wasteBagColorCode,
                storageRuleType: externalData2.storageRuleType,
                useColdStorage: externalData2.useColdStorage,
                coldStorageMinHours: externalData2.coldStorageMinHours,
                coldStorageMaxHours: externalData2.coldStorageMaxHours,
                tempStorageMinHours: externalData2.tempStorageMinHours,
                tempStorageMaxHours: externalData2.tempStorageMaxHours,
                storage_rule: externalData2.storageRule,
                allowHealthcareFacilityTreatment: externalData2.allowHealthcareFacilityTreatment,
                treatmentMethod: externalData2.treatmentMethod,
                hasMultipleTransporters: externalData2.hasMultipleTransporters,
                disposalMethod: externalData2.disposalMethod,
                allowedVehicleTypes: externalData2.allowedVehicleTypes,
                wasteType: externalData2?.wasteType
                  ? {
                      id: externalData2.wasteType.id,
                      name: externalData2.wasteType.name,
                      description: externalData2.wasteType.description,
                      nameEn: externalData2.wasteType.nameEn,
                      descriptionEn: externalData2.wasteType.descriptionEn,
                      parentHierarchyId: externalData2.wasteType.parentHierarchyId,
                    }
                  : undefined,
                wasteGroup: externalData2?.wasteGroup
                  ? {
                      id: externalData2.wasteGroup.id,
                      name: externalData2.wasteGroup.name,
                      description: externalData2.wasteGroup.description,
                      nameEn: externalData2.wasteGroup.nameEn,
                      descriptionEn: externalData2.wasteGroup.descriptionEn,
                      parentHierarchyId: externalData2.wasteGroup.parentHierarchyId,
                    }
                  : undefined,
                wasteCharacteristics: externalData2?.wasteCharacteristics
                  ? {
                      id: externalData2.wasteCharacteristics.id,
                      name: externalData2.wasteCharacteristics.name,
                      description: externalData2.wasteCharacteristics.description,
                      nameEn: externalData2.wasteCharacteristics.nameEn,
                      descriptionEn: externalData2.wasteCharacteristics.descriptionEn,
                      isResidue: externalData2.wasteCharacteristics.isResidue,
                      parentHierarchyId: externalData2.wasteCharacteristics.parentHierarchyId,
                    }
                  : undefined,
              }
            : undefined,
        });
      });
    } catch (error) {
      console.error('Error retrieving waste bag qr code:', error); // Cannot read properties of undefined (reading 'wasteType')
      throw new Error('Error retrieving waste bag qr code');
    }
  }
}
