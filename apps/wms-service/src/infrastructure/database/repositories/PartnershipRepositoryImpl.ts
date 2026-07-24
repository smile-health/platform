import Partnership, {
  HealthcareSelectDTO,
  PartnershipSelectDTO,
  PartnershipWasteClassification,
  WasteClassificationSelectDTO,
} from '../../../domain/entities/Partnership';
import { PartnershipModel, PartnershipAttributes } from '../models/PartnershipModel';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import axios from 'axios';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import { getEntityDetail, getUsersDetail, getBulkEntityDetails, getBulkUsersDetails } from '../../external-apis/thirdPartyClient';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../models/WasteHierarchyModel';
import { sequelize } from '../db.connection';
import EntitiesModel from '../models/EntitiesModel';
import PartnershipOperatorMapModel from '../models/PartnershipOperatorMapModel';
export default class PartnershipRepositoryImpl implements PartnershipRepository {
  async createPartnership(data: Partnership): Promise<Partnership> {
    try {
      const requiredFields: Array<keyof Partnership> = ['partnershipStatus'];

      const missingFields = requiredFields.filter((field) => !data[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for Partnership: ${missingFields.join(', ')}`);
      }

      const createModelObj: PartnershipAttributes = {
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        contractId: data.contractId,
        partnershipStatus: data.partnershipStatus,
        hasIncinerator: data.hasIncinerator,
        hasAutoclave: data.hasAutoclave,
        consumerId: data.consumerId,
        consumerType: data.consumerType,
        providerId: data.providerId,
        providerType: data.providerType,
        wasteClassificationId: data.wasteClassificationId,
        picName: data.picName,
        picPosition: data.picPosition,
        picPhoneNumber: data.picPhoneNumber,
        pricePerKg: data.pricePerKg,
        transporterId: data.transporterId,
      };

      console.log('createModelObj:', createModelObj);
      const payload = await PartnershipModel.create(createModelObj);
      console.log('Partnership created successfully');

      const result = await payload.get({ plain: true });

      return new Partnership({
        id: result.id,
        createdBy: result.createdBy as string,
        updatedBy: result.createdBy as string,
        createdAt: result.createdAt as Date,
        updatedAt: result.updatedAt as Date,
        contractStartDate: result.contractStartDate as Date,
        contractEndDate: result.contractEndDate as Date,
        contractId: result.contractId,
        partnershipStatus: result.partnershipStatus,
        hasIncinerator: result.hasIncinerator,
        hasAutoclave: result.hasAutoclave,
        consumerId: result.consumerId,
        consumerType: result.consumerType,
        providerId: result.providerId,
        providerType: result.providerType,
        wasteClassificationId: result.wasteClassificationId,
        picName: result.picName,
        picPosition: result.picPosition,
        picPhoneNumber: result.picPhoneNumber,
        pricePerKg: result.pricePerKg,
        transporterId: result.transporterId,
      });
    } catch (error) {
      console.error('Error creating Partnership:', error);
      throw new Error('Error creating Partnership');
    }
  }

  async getPartnershipById(id: string, token: string): Promise<Partnership | null> {
    try {
      const partnership = await PartnershipModel.findOne({
        include: [
          {
            model: EntitiesModel,
            as: 'entities',
            required: false,
            attributes: ['id', 'nib'],
          },
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: true,
            attributes: [
              'id',
              'wasteTypeId',
              'wasteGroupId',
              'wasteCharacteristicsId',
              'wasteCode',
            ],
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                required: true,
                attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
              },
            ],
          },
        ],
        where: {
          id: id,
        },
      });

      if (partnership === null) {
        console.error(`existingData with ID ${id} not found`);
        return null;
      }

      const existingData = partnership.get({ plain: true }) as any;

      if (existingData === null) {
        console.error(`existingData with ID ${id} not found`);
        return null;
      }

      const consumerId = existingData.consumerId;
      const providerId = existingData.providerId;

      let consumerDetail = null;
      let providerDetail = null;

      if (consumerId) {
        const dataEntity = await getEntityDetail(consumerId, token);
        consumerDetail = dataEntity;
      }

      if (providerId) {
        const dataEntity = await getEntityDetail(providerId, token);
        providerDetail = dataEntity;
      }
      console.log(consumerDetail);
      console.log(providerDetail);
      //get comapany
      const treatmentCompany: any = await PartnershipModel.findOne({
        where: {
          consumerId: existingData.consumerId,
          providerType: {
            [Op.in]: ['TREATMENT_PROVIDER'],
          },
        },
      });

      let landfilCompany: any = await PartnershipModel.findOne({
        where: {
          consumerId: existingData.consumerId,
          providerType: 'LANDFILLER',
        },
      });

      const recycleCompany: any = await PartnershipModel.findOne({
        where: {
          consumerId: existingData.consumerId,
          providerType: 'RECYCLER',
        },
      });
      let landfilCompanyName = '-';
      let treatmentCompanyName = '-';
      let recycleCompanyName = '-';
      if (treatmentCompany) {
        const dataEntity = await getEntityDetail(treatmentCompany.providerId, token);
        treatmentCompanyName = dataEntity?.name;
      }
      if (landfilCompany) {
        const dataEntity = await getEntityDetail(landfilCompany.providerId, token);
        landfilCompanyName = dataEntity?.name;
      }
      if (recycleCompany) {
        const dataEntity = await getEntityDetail(recycleCompany.providerId, token);
        recycleCompanyName = dataEntity?.name;
      }

      const dataWasteClassification: any = existingData.wasteClassification;
      const dataWasteType: any = dataWasteClassification.wasteType;
      const dataWasteGroup: any = dataWasteClassification.wasteGroup;
      const dataWasteCharacteristics: any = dataWasteClassification.wasteCharacteristics;
      const dataEntities: any = existingData.entities;

      return new Partnership({
        id: existingData.id as number | undefined,
        createdBy: existingData.createdBy,
        updatedBy: existingData.updatedBy,
        createdAt: existingData.created_at,
        updatedAt: existingData.updated_at,
        contractStartDate: existingData.contractStartDate as Date,
        contractEndDate: existingData.contractEndDate as Date,
        contractId: existingData.contractId,
        nib: dataEntities?.nib,
        partnershipStatus: existingData.partnershipStatus,
        providerType: existingData.providerType,
        hasIncinerator: existingData.hasIncinerator,
        hasAutoclave: existingData.hasAutoclave,
        consumerId: existingData.consumerId,
        consumerType: existingData.consumerType,
        wasteClassificationId: existingData.wasteClassificationId,
        providerId: existingData.providerId,
        picName: existingData.picName,
        picPosition: existingData.picPosition,
        picPhoneNumber: existingData.picPhoneNumber,
        pricePerKg: existingData.pricePerKg,
        transporterId: existingData.transporterId,
        treatmentCompanyName: treatmentCompanyName,
        landfilCompanyName: landfilCompanyName,
        recycleCompanyName: recycleCompanyName,
        consumerDetail,
        providerDetail,
        wasteClassification: dataWasteClassification
          ? {
              wasteTypeId: dataWasteClassification.wasteTypeId,
              wasteGroupId: dataWasteClassification.wasteGroupId,
              wasteCharacteristicsId: dataWasteClassification.wasteCharacteristicsId,
              wasteCode: dataWasteClassification.wasteCode,
              wasteType: {
                id: dataWasteType.id,
                name: dataWasteType.name,
                description: dataWasteType.description,
                nameEn: dataWasteType.nameEn,
                descriptionEn: dataWasteType.descriptionEn,
              },
              wasteGroup: {
                id: dataWasteGroup.id,
                name: dataWasteGroup.name,
                description: dataWasteGroup.description,
                nameEn: dataWasteGroup.nameEn,
                descriptionEn: dataWasteGroup.descriptionEn,
              },
              wasteCharacteristics: {
                id: dataWasteCharacteristics.id,
                name: dataWasteCharacteristics.name,
                description: dataWasteCharacteristics.description,
                nameEn: dataWasteCharacteristics.nameEn,
                descriptionEn: dataWasteCharacteristics.descriptionEn,
              },
            }
          : undefined,
      });
    } catch (error) {
      console.error('Error retrieving Partnership:', error);
      throw new Error('Error retrieving Partnership');
    }
  }

  async updateStatusPartnreship(
    id: number,
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED',
  ): Promise<Partnership | null> {
    try {
      const existingData = await PartnershipModel.findByPk(id);

      if (!existingData) {
        console.error(`Partnership with ID ${id} not found`);
        return null;
      }

      existingData.set('partnershipStatus', status);

      await existingData.save();
      return existingData.get({ plain: true }) as Partnership;
    } catch (error) {
      console.error('Error update Partnership:', error);
      throw new Error('Error update Partnership');
    }
  }

  async getPartnershipByIdScheduler(id: number): Promise<Partnership | null> {
    try {
      const existingData = (await checkExistingData(PartnershipModel, id)) as any;

      if (!existingData) {
        console.error(`Partnership with ID ${id} not found`);
        return null;
      }

      return new Partnership({
        id: existingData.get('id'),
        createdBy: existingData.createdBy,
        updatedBy: existingData.updatedBy,
        createdAt: existingData.get('created_at'),
        updatedAt: existingData.get('updated_at'),
        contractStartDate: existingData.contractStartDate,
        contractEndDate: existingData.contractEndDate,
        contractId: existingData.contractId,
        partnershipStatus: existingData.partnershipStatus,
        providerType: existingData.providerType,
        hasIncinerator: existingData.hasIncinerator,
        hasAutoclave: existingData.hasAutoclave,
        consumerId: existingData.consumerId,
        consumerType: existingData.consumerType,
        wasteClassificationId: existingData.wasteClassificationId,
        providerId: existingData.providerId,
        picName: existingData.picName,
        picPosition: existingData.picPosition,
        picPhoneNumber: existingData.picPhoneNumber,
        pricePerKg: existingData.pricePerKg,
      });
    } catch (error) {
      console.error('Error retrieving Partnership by ID:', error);
      throw new Error('Error retrieving Partnership by ID');
    }
  }

  async getAllPartnershipByUserId(
    limit: number = 10,
    page: number = 1,
    entityId: number | undefined,
    entityTag: string | undefined,
    token: string,
    search?: string,
    providerId?: number,
    consumerId?: number,
    wasteClassificationId?: number,
    partnershipStatus?: string,
  ): Promise<{
    data: Partnership[];
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
      const whereClause: any = {};

      if (entityId && entityTag) {
        if (entityTag === 'hospital') {
          whereClause.consumer_id = entityId;
          whereClause.transporter_id = {
            [Op.is]: null,
          };
        } else if (entityTag === 'super-admin') {
          whereClause.transporter_id = {
            [Op.is]: null,
          };
        } else {
          whereClause.transporter_id = entityId;
        }
      }

      const { count, rows } = await PartnershipModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['updated_at', 'DESC']],
        distinct: true,
        where: {
          ...whereClause,
          ...(search && {
            [Op.or]: [
              { partnershipStatus: { [Op.like]: `%${search}%` } },
              { contractId: { [Op.like]: `%${search}%` } },
            ],
          }),
          ...(providerId && {
            providerId: providerId,
          }),
          ...(consumerId && {
            consumerId: consumerId,
          }),
          ...(wasteClassificationId && {
            wasteClassificationId: wasteClassificationId,
          }),
          ...(partnershipStatus && {
            partnershipStatus: partnershipStatus,
          }),
        },
        include: [
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: true,
            attributes: [
              'id',
              'wasteTypeId',
              'wasteGroupId',
              'wasteCharacteristicsId',
              'wasteCode',
            ],
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                required: true,
                attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
              },
            ],
          },
        ],
      });

      return paginationUtils.formatPaginationResult(
        await Promise.all(
          rows.map(async (item: any) => {
            const consumerId = item.consumerId;
            const providerId = item.providerId;

            let consumerDetail = null;
            let providerDetail = null;

            try {
              if (consumerId) {
                // Same /core/entities/:id lookup as handleValidateToken.ts — moved to
                // CORE_API_URL for the same reason (see that file for the auth-cutover note).
                const consumerRes = await axios.get(
                  `${process.env.CORE_API_URL}/entities/${consumerId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );
                consumerDetail = consumerRes.data;
              }

              if (providerId) {
                const providerRes = await axios.get(
                  `${process.env.CORE_API_URL}/entities/${providerId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );
                providerDetail = providerRes.data;
              }
            } catch (error) {
              console.error(
                `Failed to fetch entity detail for partnership ID ${item.get('id')}:`,
                error,
              );
            }

            const wasteClassification: any = item.wasteClassification;
            const dataWasteClassification = wasteClassification.get({ plain: true });
            const dataWasteType: any = dataWasteClassification.wasteType;
            const dataWasteGroup: any = dataWasteClassification.wasteGroup;
            const dataWasteCharacteristics: any = dataWasteClassification.wasteCharacteristics;

            return new Partnership({
              id: item.get('id'),
              createdBy: item.createdBy,
              updatedBy: item.updatedBy,
              createdAt: item.get('created_at'),
              updatedAt: item.get('updated_at'),
              contractStartDate: item.contractStartDate,
              contractEndDate: item.contractEndDate,
              contractId: item.contractId,
              partnershipStatus: item.partnershipStatus,
              providerType: item.providerType,
              hasIncinerator: item.hasIncinerator,
              hasAutoclave: item.hasAutoclave,
              consumerId,
              consumerType: item.consumerType,
              wasteClassificationId: item.wasteClassificationId,
              providerId,
              picName: item.picName,
              picPosition: item.picPosition,
              picPhoneNumber: item.picPhoneNumber,
              pricePerKg: item.pricePerKg,
              transporterId: item.transporterId,
              providerName: providerDetail?.name,
              consumerName: consumerDetail?.name,
              consumerProvinceName: consumerDetail?.locations?.[0]?.name,
              consumerCityName: consumerDetail?.locations?.[1]?.name,
              wasteClassification: dataWasteClassification
                ? {
                    wasteTypeId: dataWasteClassification.wasteTypeId,
                    wasteGroupId: dataWasteClassification.wasteGroupId,
                    wasteCharacteristicsId: dataWasteClassification.wasteCharacteristicsId,
                    wasteCode: dataWasteClassification.wasteCode,
                    wasteType: {
                      id: dataWasteType.id,
                      name: dataWasteType.name,
                      description: dataWasteType.description,
                      nameEn: dataWasteType.nameEn,
                      descriptionEn: dataWasteType.descriptionEn,
                    },
                    wasteGroup: {
                      id: dataWasteGroup.id,
                      name: dataWasteGroup.name,
                      description: dataWasteGroup.description,
                      nameEn: dataWasteGroup.nameEn,
                      descriptionEn: dataWasteGroup.descriptionEn,
                    },
                    wasteCharacteristics: {
                      id: dataWasteCharacteristics.id,
                      name: dataWasteCharacteristics.name,
                      description: dataWasteCharacteristics.description,
                      nameEn: dataWasteCharacteristics.nameEn,
                      descriptionEn: dataWasteCharacteristics.descriptionEn,
                    },
                  }
                : undefined,
            });
          }),
        ),
        Number(count),
        safeLimit,
        safePage,
      );
    } catch (error) {
      console.error('Error retrieving Partnership:', error);
      throw new Error('Error retrieving Partnership');
    }
  }

  async updatePartnership(data: Partnership): Promise<void | null> {
    try {
      if (!data.id || !data.updatedBy) {
        throw new Error('Missing required fields for Partnership update');
      }

      const existingData = (await checkExistingData(PartnershipModel, data.id)) as any;

      if (!existingData) {
        console.error(`Partnership with ID ${data.id} not found`);
        return null;
      }

      const allowedProviderTypes = [
        'TRANSPORTER_RECYCLER',
        'TRANSPORTER_TREATMENT',
        'TRANSPORTER_LANDFILL',
        'SPECIALIZED_TREATMENT_PROVIDER',
        'TRANSPORTER_GOVERNMENT',
      ];

      const shouldSyncDateToParent =
        allowedProviderTypes.includes(existingData.providerType) &&
        (existingData.contractStartDate !== data.contractStartDate ||
          existingData.contractEndDate !== data.contractEndDate);

      if (shouldSyncDateToParent) {
        const partnershipSomeCompany = await PartnershipModel.findOne({
          where: {
            providerId: existingData.providerId,
            wasteClassificationId: existingData.wasteClassificationId,
            consumerId: existingData.consumerId,
            partnershipStatus: 'ACTIVE',
            transporterId: {
              [Op.not]: null, // IS NOT NULL
            },
          },
        });

        if (partnershipSomeCompany) {
          await partnershipSomeCompany.update({
            contractStartDate: data.contractStartDate,
            contractEndDate: data.contractEndDate,
          });
        }
      }

      const updateModelObj: PartnershipAttributes = {
        updatedBy: data.updatedBy,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        contractId: data.contractId,
        partnershipStatus: data.partnershipStatus,
        hasIncinerator: data.hasIncinerator,
        hasAutoclave: data.hasAutoclave,
        consumerId: data.consumerId,
        consumerType: data.consumerType,
        providerId: data.providerId,
        providerType: data.providerType,
        wasteClassificationId: data.wasteClassificationId,
        picName: data.picName,
        picPosition: data.picPosition,
        picPhoneNumber: data.picPhoneNumber,
        pricePerKg: data.pricePerKg,
      };

      await existingData.update(updateModelObj);
      console.log('Partnership updated successfully');
    } catch (error) {
      console.error('Error updating Partnership:', error);
      throw new Error('Error updating Partnership');
    }
  }

  async deletePartnership(id: string, deletedBy?: number): Promise<boolean> {
    try {
      const existingData = (await checkExistingData(PartnershipModel, id)) as any;

      if (!existingData) {
        console.error(`Partnership with ID ${id} not found`);
        return false;
      }

      const partnershipOperator = await PartnershipOperatorMapModel.findOne({
        where: {
          partnership_id: id,
        },
      });

      if (partnershipOperator) {
        console.error(`Partnership with ID ${id} not deleted`);
        return false;
      }

      if (deletedBy) await existingData.update({ deletedBy });
      console.log('Partnership deleted successfully');
      return await existingData.destroy();
    } catch (error) {
      console.error('Error deleting Partnership:', error);
      throw new Error('Error deleting Partnership');
    }
  }

  async getHealthcareByThirdPartyAdmin(
    token: string,
    entityId: number,
  ): Promise<HealthcareSelectDTO[]> {
    try {
      const dataPartnership = await PartnershipModel.findAll({
        where: {
          providerId: entityId,
        },
        group: ['consumerId'],
      });

      const dataHealthcare = await Promise.all(
        dataPartnership.map(async (item: any) => {
          //get information entity
          const dataEntity = await getEntityDetail(item.consumerId, token);
          return new HealthcareSelectDTO({
            id: item.id,
            consumerId: item.consumerId,
            consumerName: dataEntity?.name,
          });
        }),
      );

      console.log('partnership retrieved successfully:', dataHealthcare);
      return dataHealthcare;
    } catch (error) {
      console.error('Error retrieving partnership:', error);
      throw new Error('Error retrieving partnership');
    }
  }

  async getPartnershipByThirdPartyAdmin(
    token: string,
    entityId: number,
    entityTag?: string,
  ): Promise<PartnershipSelectDTO[]> {
    try {
      const whereClause: any = {};
      if (entityId && entityTag) {
        const tag = entityTag.toLowerCase();
        if (tag.includes('hospital')) {
          whereClause.consumer_id = entityId;
        } else {
          whereClause.transporter_id = entityId;
        }
      }
      const dataPartnership: any = await PartnershipModel.findAll({
        attributes: ['id', 'providerId'],
        where: whereClause,
        group: ['providerId'],
      });

      const data = await Promise.all(
        dataPartnership.map(async (item: any) => {
          //get information entity
          const dataEntity = await getEntityDetail(item.providerId, token);
          return new PartnershipSelectDTO({
            id: item.id,
            providerId: item.providerId,
            providerName: dataEntity?.name,
          });
        }),
      );

      console.log('partnership retrieved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error retrieving partnership:', error);
      throw new Error('Error retrieving partnership');
    }
  }

  async getWasteClassificationByHealthcare(
    consumerId: number,
    providerId: number,
    isSameCompany?: number,
  ): Promise<WasteClassificationSelectDTO[]> {
    try {
      let filterisSameCompany = `a.provider_type IN ('TRANSPORTER','TRANSPORTER_GOVERNMENT_WASTE_BANK')`;
      if (isSameCompany == 1) {
        filterisSameCompany = ` a.provider_type IN ('TRANSPORTER_RECYCLER','TRANSPORTER_LANDFILL','TRANSPORTER_TREATMENT_PROVIDER',
                'TRANSPORTER_TREATMENT','SPECIALIZED_TREATMENT_PROVIDER','TRANSPORTER_GOVERNMENT') `;
      }
      const sql =
        `
            SELECT
            a.id,
            a.waste_classification_id AS "wasteClassificationId",
            a.provider_type AS "providerType",
            c.name AS "wasteCharacteristicName",
            a.contract_id "contractId",
            a.contract_start_date "contractStartDate",
            a.contract_end_date "contractEndDate",
            b.waste_code "wasteCode"
            FROM partnership a
            JOIN waste_classification b ON b.id = a.waste_classification_id
            JOIN waste_hierarchy c ON c.id = b.waste_characteristics_id
            WHERE c.is_active = 1 AND a.consumer_id = :consumerId AND a.provider_id = :providerId and ` +
        filterisSameCompany +
        `
            GROUP BY a.waste_classification_id
        `;

      const dataPartnership = await sequelize.query(sql, {
        replacements: { consumerId, providerId },
        type: QueryTypes.SELECT,
      });

      const data = dataPartnership.map((item: any) => {
        return new WasteClassificationSelectDTO({
          id: item.id,
          wasteClassificationId: item.wasteClassificationId,
          wasteCharacteristicName: item.wasteCharacteristicName,
          providerType: item.providerType,
          contractStartDate: item.contractStartDate,
          contractEndDate: item.contractEndDate,
          contractId: item.contractId,
          wasteCode: item.wasteCode,
        });
      });

      console.log('partnership retrieved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error retrieving partnership:', error);
      throw new Error('Error retrieving partnership');
    }
  }

  async findPartnershipByCondition(whereClause: WhereOptions<any>): Promise<Partnership | null> {
    const item = await PartnershipModel.findOne({
      where: whereClause,
    });

    if (!item) {
      return null;
    }

    const result = item.get({ plain: true });

    return new Partnership({
      id: result.id,
      createdBy: result.createdBy,
      updatedBy: result.updatedBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      contractStartDate: result.contractStartDate as Date,
      contractEndDate: result.contractEndDate as Date,
      contractId: result.contractId,
      partnershipStatus: result.partnershipStatus,
      providerType: result.providerType,
      hasIncinerator: result.hasIncinerator,
      hasAutoclave: result.hasAutoclave,
      consumerId: result.consumerId,
      consumerType: result.consumerType,
      wasteClassificationId: result.wasteClassificationId,
      providerId: result.providerId,
      picName: result.picName,
      picPosition: result.picPosition,
      picPhoneNumber: result.picPhoneNumber,
      pricePerKg: result.pricePerKg,
      transporterId: result.transporterId,
    });
  }

  async findAllPartnershipByCondition(
    whereClause: WhereOptions<any>,
  ): Promise<Partnership[] | null> {
    const item = await PartnershipModel.findAll({
      where: whereClause,
    });

    if (!item) {
      return null;
    }

    return item.map((data) => {
      const result = data.get({ plain: true });
      return new Partnership({
        id: result.id,
        createdBy: result.createdBy,
        updatedBy: result.updatedBy,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        contractStartDate: result.contractStartDate as Date,
        contractEndDate: result.contractEndDate as Date,
        contractId: result.contractId,
        partnershipStatus: result.partnershipStatus,
        providerType: result.providerType,
        hasIncinerator: result.hasIncinerator,
        hasAutoclave: result.hasAutoclave,
        consumerId: result.consumerId,
        consumerType: result.consumerType,
        wasteClassificationId: result.wasteClassificationId,
        providerId: result.providerId,
        picName: result.picName,
        picPosition: result.picPosition,
        picPhoneNumber: result.picPhoneNumber,
        pricePerKg: result.pricePerKg,
        transporterId: result.transporterId,
      });
    });
  }

  async getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId(
    token: string,
    healthcareFacilityId: number,
    wasteClassificationId: number,
    transporterId?: number,
    thirdPartyId?: number,
  ) {
    const transporterCondition = {
      consumerId: healthcareFacilityId,
      wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      ...(transporterId && {
        providerId: transporterId,
      }),
      transporterId: {
        [Op.is]: null,
      },
    };

    const treatmentCondition = {
      consumerId: healthcareFacilityId,
      wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      ...(thirdPartyId && {
        providerId: thirdPartyId,
      }),
      transporterId: {
        [Op.not]: null,
      },
    };

    const [transporterIdPartnership, treatmentIdPartnership] = await Promise.all([
      this.findPartnershipByCondition(transporterCondition),
      this.findPartnershipByCondition(treatmentCondition),
    ]);

    if (!transporterIdPartnership || !treatmentIdPartnership) {
      return 'No transporter partnership found for the given consumer and waste classification';
    }

    const sql = `
    SELECT operator_id
    FROM partnership_operator_map pom
    WHERE pom.partnership_id IN (
      SELECT p.id
      FROM partnership p
      WHERE p.provider_id = :providerId
        AND p.consumer_id = :healthcareFacilityId
        AND p.transporter_id IS NULL
    )
  `;

    const sql2 = `
    SELECT operator_id
    FROM partnership_operator_map pom
    WHERE pom.partnership_id IN (
      SELECT p.id
      FROM partnership p
      WHERE p.provider_id = :providerId
        AND p.consumer_id = :healthcareFacilityId
        AND p.transporter_id IS NOT NULL
    )
  `;

    const [
      partnershipOperatorTransportMap,
      partnershipOperatorTreatmentMap,
      dataEntityTransport,
      dataEntityTreatment,
    ] = await Promise.all([
      sequelize.query(sql, {
        replacements: {
          providerId: transporterIdPartnership.providerId,
          healthcareFacilityId,
        },
        type: QueryTypes.SELECT,
      }),

      sequelize.query(sql2, {
        replacements: {
          providerId: treatmentIdPartnership.providerId,
          healthcareFacilityId,
        },
        type: QueryTypes.SELECT,
      }),

      getEntityDetail(transporterIdPartnership.providerId, token),

      getEntityDetail(treatmentIdPartnership.providerId, token),
    ]);

    const buildOperator = async (operatorId: string | undefined) => {
      const operatorDetail = await getUsersDetail(operatorId, token);

      return {
        id: operatorId,
        operatorName:
          [operatorDetail?.firstname, operatorDetail?.lastname].filter(Boolean).join(' ') || null,
        role: operatorDetail?.external_properties,
      };
    };

    const [partnershipOperatorsTransport, partnershipOperatorsTreatment] = await Promise.all([
      Promise.all(
        (partnershipOperatorTransportMap as any[]).map((item) => buildOperator(item.operator_id)),
      ),
      Promise.all(
        (partnershipOperatorTreatmentMap as any[]).map((item) => buildOperator(item.operator_id)),
      ),
    ]);

    return {
      transportPartnership: {
        providerId: transporterIdPartnership.providerId,
        providerName: dataEntityTransport?.name,
        partnershipOperatorsTransport,
      },

      treatmentPartnership: {
        providerId: treatmentIdPartnership.providerId,
        providerName: dataEntityTreatment?.name,
        partnershipOperatorsTreatment,
      },
    };
  }

  async getBulkPartnershipData(
    token: string,
    lookups: Array<{
      healthcareFacilityId: number;
      wasteClassificationId: number;
      transporterId?: number;
      thirdPartyId?: number;
    }>,
  ): Promise<
    Map<
      string,
      {
        transportPartnership: {
          providerId: number | undefined;
          providerName: string | undefined;
          partnershipOperatorsTransport: Array<{
            id: string | undefined;
            operatorName: string | null;
            role: any;
          }>;
        };
        treatmentPartnership: {
          providerId: number | undefined;
          providerName: string | undefined;
          partnershipOperatorsTreatment: Array<{
            id: string | undefined;
            operatorName: string | null;
            role: any;
          }>;
        };
      }
    >
  > {
    const uniqueKeys = new Set<string>();
    const uniqueLookups: typeof lookups = [];

    for (const l of lookups) {
      const key = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}-${l.thirdPartyId || ''}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        uniqueLookups.push(l);
      }
    }

    if (uniqueLookups.length === 0) {
      return new Map();
    }

    const transporterConditions = uniqueLookups.map((l) => ({
      consumerId: l.healthcareFacilityId,
      wasteClassificationId: l.wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      ...(l.transporterId && { providerId: l.transporterId }),
      transporterId: { [Op.is]: null },
    }));

    const treatmentConditions = uniqueLookups.map((l) => ({
      consumerId: l.healthcareFacilityId,
      wasteClassificationId: l.wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      ...(l.thirdPartyId && { providerId: l.thirdPartyId }),
      transporterId: { [Op.not]: null },
    }));

    console.time('bulk:findAllPartnerships');
    const [transporterPartnerships, treatmentPartnerships] = await Promise.all([
      PartnershipModel.findAll({
        where: { [Op.or]: transporterConditions },
      }),
      PartnershipModel.findAll({
        where: { [Op.or]: treatmentConditions },
      }),
    ]);
    console.timeEnd('bulk:findAllPartnerships');

    const transporterMap = new Map<string, any>();
    for (const p of transporterPartnerships) {
      const r = p.get({ plain: true });
      const key = `${r.consumerId}-${r.wasteClassificationId}-${r.providerId || ''}`;
      if (!transporterMap.has(key)) {
        transporterMap.set(key, r);
      }
    }

    const treatmentMap = new Map<string, any>();
    for (const p of treatmentPartnerships) {
      const r = p.get({ plain: true });
      const key = `${r.consumerId}-${r.wasteClassificationId}-${r.providerId || ''}`;
      if (!treatmentMap.has(key)) {
        treatmentMap.set(key, r);
      }
    }

    const operatorPairs: Array<{
      providerId: number;
      consumerId: number;
    }> = [];

    for (const l of uniqueLookups) {
      const tKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}`;
      const trKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.thirdPartyId || ''}`;
      const tp = transporterMap.get(tKey);
      const trp = treatmentMap.get(trKey);
      if (tp) {
        operatorPairs.push({ providerId: tp.providerId, consumerId: l.healthcareFacilityId });
      }
      if (trp) {
        operatorPairs.push({ providerId: trp.providerId, consumerId: l.healthcareFacilityId });
      }
    }

    if (operatorPairs.length === 0) {
      const resultMap = new Map();
      for (const l of uniqueLookups) {
        const mapKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}-${l.thirdPartyId || ''}`;
        resultMap.set(mapKey, {
          transportPartnership: { providerId: undefined, providerName: undefined, partnershipOperatorsTransport: [] },
          treatmentPartnership: { providerId: undefined, providerName: undefined, partnershipOperatorsTreatment: [] },
        });
      }
      return resultMap;
    }

    const uniqueProviderIds = [...new Set(operatorPairs.map((p) => p.providerId))];
    const uniqueConsumerIds = [...new Set(operatorPairs.map((p) => p.consumerId))];

    const operatorSql = `
      SELECT pom.operator_id, p.provider_id, p.consumer_id
      FROM partnership_operator_map pom
      JOIN partnership p ON p.id = pom.partnership_id
      WHERE p.provider_id IN (:providerIds) AND p.consumer_id IN (:consumerIds)
    `;

    console.time('bulk:operatorSql');
    const allOperatorRows = (await sequelize.query(operatorSql, {
      replacements: {
        providerIds: uniqueProviderIds,
        consumerIds: uniqueConsumerIds,
      },
      type: QueryTypes.SELECT,
    })) as any[];
    console.timeEnd('bulk:operatorSql');

    const entityIds = new Set<number>();
    for (const l of uniqueLookups) {
      const tKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}`;
      const trKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.thirdPartyId || ''}`;
      const tp = transporterMap.get(tKey);
      const trp = treatmentMap.get(trKey);
      if (tp) entityIds.add(tp.providerId);
      if (trp) entityIds.add(trp.providerId);
    }

    console.time('bulk:entityDetails');
    const entityMap = await getBulkEntityDetails([...entityIds], token);
    console.timeEnd('bulk:entityDetails');
    const entityNameMap = new Map<number, string | undefined>();
    for (const id of entityIds) {
      entityNameMap.set(id, entityMap.get(id)?.name);
    }

    console.time('bulk:userDetails');
    const allOperatorIds = [...new Set(allOperatorRows.map((r) => r.operator_id).filter(Boolean))];
    const userMap = await getBulkUsersDetails(allOperatorIds, token);
    console.timeEnd('bulk:userDetails');

    const operatorByProviderConsumer = new Map<string, string[]>();
    for (const row of allOperatorRows) {
      const key = `${row.provider_id}-${row.consumer_id}`;
      if (!operatorByProviderConsumer.has(key)) {
        operatorByProviderConsumer.set(key, []);
      }
      operatorByProviderConsumer.get(key)!.push(row.operator_id);
    }

    const buildOperatorList = (providerId: number, consumerId: number) => {
      const key = `${providerId}-${consumerId}`;
      const operatorIds = operatorByProviderConsumer.get(key) || [];
      return operatorIds.map((operatorId) => {
        const detail = userMap.get(operatorId);
        return {
          id: operatorId,
          operatorName: [detail?.firstname, detail?.lastname].filter(Boolean).join(' ') || null,
          role: detail?.external_properties,
        };
      });
    };

    const resultMap = new Map<
      string,
      {
        transportPartnership: {
          providerId: number | undefined;
          providerName: string | undefined;
          partnershipOperatorsTransport: Array<{
            id: string | undefined;
            operatorName: string | null;
            role: any;
          }>;
        };
        treatmentPartnership: {
          providerId: number | undefined;
          providerName: string | undefined;
          partnershipOperatorsTreatment: Array<{
            id: string | undefined;
            operatorName: string | null;
            role: any;
          }>;
        };
      }
    >();

    for (const l of uniqueLookups) {
      const mapKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}-${l.thirdPartyId || ''}`;
      const tKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.transporterId || ''}`;
      const trKey = `${l.healthcareFacilityId}-${l.wasteClassificationId}-${l.thirdPartyId || ''}`;
      const tp = transporterMap.get(tKey);
      const trp = treatmentMap.get(trKey);

      resultMap.set(mapKey, {
        transportPartnership: {
          providerId: tp?.providerId,
          providerName: tp ? entityNameMap.get(tp.providerId) : undefined,
          partnershipOperatorsTransport: tp
            ? buildOperatorList(tp.providerId, l.healthcareFacilityId)
            : [],
        },
        treatmentPartnership: {
          providerId: trp?.providerId,
          providerName: trp ? entityNameMap.get(trp.providerId) : undefined,
          partnershipOperatorsTreatment: trp
            ? buildOperatorList(trp.providerId, l.healthcareFacilityId)
            : [],
        },
      });
    }

    return resultMap;
  }

  async getProviderNameByHfIdAndwasteClassificationId(
    token: string,
    healthcareFacilityId: number,
    wasteClassificationId: number,
  ) {
    const transporterIdPartnership = await this.findPartnershipByCondition({
      consumerId: healthcareFacilityId,
      wasteClassificationId: wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      transporterId: {
        [Op.is]: null,
      },
    });

    const treatmentIdPartnership = await this.findPartnershipByCondition({
      consumerId: healthcareFacilityId,
      wasteClassificationId: wasteClassificationId,
      partnershipStatus: 'ACTIVE',
      transporterId: {
        [Op.not]: null,
      },
    });

    if (!transporterIdPartnership || !treatmentIdPartnership) {
      return 'No transporter partnership found for the given consumer and waste classification';
    }

    let responsePartnership: any = null;

    const sql = `SELECT operator_id
            FROM partnership_operator_map pom
            WHERE pom.partnership_id IN (
                SELECT p.id
                FROM partnership p
                WHERE p.provider_id = :providerId
                AND p.consumer_id = :healthcareFacilityId
                AND p.transporter_id is null
            );`;

    const sql2 = `SELECT operator_id
            FROM partnership_operator_map pom
            WHERE pom.partnership_id IN (
                SELECT p.id
                FROM partnership p
                WHERE p.provider_id = :providerId
                AND p.consumer_id = :healthcareFacilityId
                AND p.transporter_id is not null
            );`;

    const partnershipOperatorTransportMap = await sequelize.query(sql, {
      replacements: {
        providerId: transporterIdPartnership.providerId,
        healthcareFacilityId: healthcareFacilityId,
      },
      type: QueryTypes.SELECT,
    });

    const partnershipOperatorTreatmentMap = await sequelize.query(sql2, {
      replacements: {
        providerId: treatmentIdPartnership.providerId,
        healthcareFacilityId: healthcareFacilityId,
      },
      type: QueryTypes.SELECT,
    });

    const dataEntityTransport = await getEntityDetail(transporterIdPartnership.providerId, token);

    const dataEntityTreatment = await getEntityDetail(treatmentIdPartnership.providerId, token);

    const transportPartnership = {
      providerId: transporterIdPartnership.providerId,
      providerName: dataEntityTransport?.name,
    };

    const treatmentPartnership = {
      providerId: treatmentIdPartnership.providerId,
      providerName: dataEntityTreatment?.name,
    };

    responsePartnership = {
      transportPartnership,
      treatmentPartnership,
    };

    return responsePartnership;
  }

  async getWasteClassificationByConsumerIdAndProviderId(
    limit: number,
    page: number,
    providerId: number,
    consumerId: number,
  ): Promise<{
    data: PartnershipWasteClassification[];
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

      const baseSql = `
            FROM partnership p
            JOIN waste_classification wc ON wc.id = p.waste_classification_id
            JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
            WHERE p.consumer_id = :consumerId
            AND p.provider_id = :providerId
            AND p.transporter_id IS NULL
            GROUP BY p.waste_classification_id
        `;

      const dataSql = `
            SELECT
                p.waste_classification_id AS "wasteClassificationId",
                wch.name AS "wasteCharacteristicsName",
                wch.name_en AS "wasteCharacteristicsNameEn",
                wc.waste_code AS "wasteCode",
                p.price_per_kg AS "price",
                p.contract_start_date AS contractStartDate,
                p.contract_end_date AS contractEndDate,
                p.contract_id AS contractId,
                p.partnership_status AS partnershipStatus,
                p.provider_type AS providerType
            ${baseSql}
            LIMIT :limit OFFSET :offset
        `;

      const countSql = `
            SELECT COUNT(DISTINCT p.waste_classification_id) AS total
            ${baseSql.replace(`GROUP BY p.waste_classification_id`, ``)}
        `;

      const replacements = {
        providerId,
        consumerId: consumerId,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      };

      const [partnershipData, countResult] = await Promise.all([
        sequelize.query(dataSql, {
          replacements,
          type: QueryTypes.SELECT,
        }),
        sequelize.query(countSql, {
          replacements,
          type: QueryTypes.SELECT,
        }),
      ]);

      const total = Number((countResult[0] as any).total);

      return paginationUtils.formatPaginationResult(
        partnershipData.map((m: any) => {
          return {
            wasteClassificationId: m.wasteClassificationId,
            wasteCharacteristicsName: m.wasteCharacteristicsName,
            wasteCode: m.wasteCode,
            price: m.price,
            contractStartDate: m.contractStartDate,
            contractEndDate: m.contractEndDate,
            contractId: m.contractId,
            partnershipStatus: m.partnershipStatus,
            providerType: m.providerType,
          } as any;
        }),
        total,
        safeLimit,
        safePage,
      );
    } catch (error) {
      console.error('Error retrieving Partnership OperatorMaps:', error);
      throw new Error('Error retrieving Partnership OperatorMaps');
    }
  }

  async getHasMultiplePartnership(healthcareFacilityId: number, wasteClassificationId: number[]) {
    const sql = `
        SELECT
            e.id   AS transporterId,
            e.name AS transporterName,
            MIN(p.contract_start_date) AS contractStartDate,
            MAX(p.contract_end_date) AS contractEndDate
        FROM partnership p
        INNER JOIN waste_classification wc
            ON wc.id = p.waste_classification_id
        INNER JOIN entities e
            ON e.id = p.provider_id
        WHERE p.consumer_id = :healthcareFacilityId
          AND p.waste_classification_id IN (:wasteClassificationId)
          AND wc.has_multiple_transporters = 1
          AND p.transporter_id IS null
          AND p.contract_end_date >= CURRENT_DATE
          AND p.partnership_status = 'ACTIVE'
        GROUP BY e.id, e.name
    `;

    return sequelize.query(sql, {
      replacements: {
        healthcareFacilityId,
        wasteClassificationId,
      },
      type: QueryTypes.SELECT,
    });
  }

  async findOneThirdParty(
    healthcareFacilityId: number,
    transporterId: number,
    wasteClassificationId: number[],
  ) {
    const sql = `
    SELECT
        e.id   AS thirdPartyId,
        e.name AS thirdPartyName,
        p.contract_start_date AS contractStartDate,
        p.contract_end_date AS contractEndDate
    FROM partnership p
    INNER JOIN waste_classification wc
        ON wc.id = p.waste_classification_id
    INNER JOIN entities e
        ON e.id = p.provider_id
    WHERE p.consumer_id = :healthcareFacilityId
      AND p.transporter_id = :transporterId
      AND p.waste_classification_id IN (:wasteClassificationId)
      AND wc.has_multiple_transporters = 1
      AND p.transporter_id IS NOT NULL
      AND p.partnership_status = 'ACTIVE'
    ORDER BY p.contract_end_date DESC, p.updated_at DESC
    LIMIT 1
  `;

    const result: any[] = await sequelize.query(sql, {
      replacements: {
        healthcareFacilityId,
        transporterId,
        wasteClassificationId,
      },
      type: QueryTypes.SELECT,
    });

    return result[0] ?? null;
  }
}
