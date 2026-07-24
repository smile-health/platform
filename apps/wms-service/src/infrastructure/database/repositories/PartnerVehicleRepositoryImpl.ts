import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import { PartnerVehicleModel, PartnerVehicleAttributes } from '../models/PartnerVehicleModel';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { UniqueConstraintError } from 'sequelize';
import { Op } from 'sequelize';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';
import ExcelJS from 'exceljs';
import WasteTransportationExternalGroupModel from '../models/WasteTransportationExternalGroupModel';

export default class PartnerVehicleRepositoryImpl implements PartnerVehicleRepository {
  async createPartnerVehicle(partnerVehicle: PartnerVehicle): Promise<void> {
    try {
      if (
        !partnerVehicle.createdBy ||
        !partnerVehicle.vehicleType ||
        !partnerVehicle.vehicleNumber ||
        !partnerVehicle.capacityInKgs
      ) {
        throw new Error('Missing required fields for PartnerVehicle');
      }
      const createModelObj: PartnerVehicleAttributes = {
        createdBy: partnerVehicle.createdBy,
        updatedBy: partnerVehicle.createdBy,
        entityId: partnerVehicle.entityId,
        vehicleType: partnerVehicle.vehicleType,
        vehicleNumber: partnerVehicle.vehicleNumber,
        capacityInKgs: partnerVehicle.capacityInKgs,
        transporterId: partnerVehicle.transporterId,
      };
      console.log('createModelObj:', createModelObj);
      await PartnerVehicleModel.create(createModelObj);
      console.log('Partner Vehicle created successfully');
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Vehicle creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Partner Vehicle: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Partner Vehicle');
      }
    }
  }

  async createMultipleHealthcarePartnerVehicle(partnerVehicle: PartnerVehicle): Promise<void> {
    try {
      if (
        !partnerVehicle.createdBy ||
        !partnerVehicle.vehicleType ||
        !partnerVehicle.vehicleNumber ||
        !partnerVehicle.capacityInKgs ||
        !partnerVehicle.entityIds
      ) {
        throw new Error('Missing required fields for PartnerVehicle');
      }

      const entityIds: number[] = partnerVehicle.entityIds
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      if (!entityIds.length) {
        throw new Error('Invalid entityIds format');
      }

      const createModelObjs: PartnerVehicleAttributes[] = entityIds.map((entityId) => ({
        createdBy: partnerVehicle.createdBy,
        updatedBy: partnerVehicle.createdBy,
        entityId,
        vehicleType: partnerVehicle.vehicleType,
        vehicleNumber: partnerVehicle.vehicleNumber,
        capacityInKgs: partnerVehicle.capacityInKgs,
        transporterId: partnerVehicle.transporterId,
      }));
      console.log(createModelObjs);
      await PartnerVehicleModel.bulkCreate(createModelObjs);
      console.log('Partner Vehicles created successfully');
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Vehicle creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Partner Vehicle: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Partner Vehicle');
      }
    }
  }

  async getPartnerVehicleById(id: string, token?: string): Promise<PartnerVehicle | null> {
    try {
      const existingData = (await checkExistingData(PartnerVehicleModel, id)) as any;

      if (!existingData) {
        console.error(`Partner Vehicle with ID ${id} not found`);
        return null;
      }
      let dataEntity: any;
      if (token) {
        //get information entity
        dataEntity = await getEntityDetail(existingData.entityId, token);
      }
      return new PartnerVehicle({
        id: existingData.get('id') as number | undefined,
        createdBy: existingData.createdBy,
        updatedBy: existingData.updatedBy,
        createdAt: existingData.createdAt,
        updatedAt: existingData.updatedAt as Date,
        entityId: existingData.entityId,
        vehicleType: existingData.vehicleType,
        vehicleNumber: existingData.vehicleNumber,
        capacityInKgs: existingData.capacityInKgs,
        entityName: dataEntity?.name,
      });
    } catch (error) {
      console.error('Error retrieving Partner Vehicle:', error);
      throw new Error('Error retrieving Partner Vehicle');
    }
  }

  async getPartnerVehicleByVehicleNumber(
    id: string,
    entityId: number,
    healthcareFacilityId?: number,
  ): Promise<PartnerVehicle | null> {
    try {
      const existingData = await PartnerVehicleModel.findOne({
        where: {
          vehicleNumber: id,
          transporterId: entityId,
          ...(healthcareFacilityId && {
            entityId: healthcareFacilityId,
          }),
        },
      });

      if (!existingData) {
        console.error(`Partner Vehicle with ID ${id} not found`);
        return null;
      }

      let dataEntity: any;

      const result = existingData.get({ plain: true });

      return new PartnerVehicle({
        id: result.id,
        createdBy: result.createdBy as string,
        updatedBy: result.updatedBy,
        createdAt: result.createdAt as Date,
        updatedAt: result.updatedAt as Date,
        entityId: result.entityId,
        vehicleType: result.vehicleType,
        vehicleNumber: result.vehicleNumber,
        capacityInKgs: result.capacityInKgs,
        entityName: dataEntity?.name,
      });
    } catch (error) {
      console.error('Error retrieving Partner Vehicle:', error);
      throw new Error('Error retrieving Partner Vehicle');
    }
  }

  async getAllPartnerVehicles(
    limit: number,
    page: number,
    token: string,
    transporterId: number,
    search?: string,
    entityTag?: string,
    healthcareFacilityId?: number,
    providerId?: number,
  ): Promise<{
    data: PartnerVehicle[];
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
      if (entityTag) {
        const tag = entityTag.toLowerCase();
        if (tag.includes('hospital')) {
          whereClause.entityId = transporterId;
        } else {
          whereClause.transporterId = transporterId;
        }
      }

      const { count, rows } = await PartnerVehicleModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['updated_at', 'DESC']],
        distinct: true,
        where: {
          ...(search && {
            [Op.or]: [
              { vehicleNumber: { [Op.like]: `%${search}%` } },
              { vehicleType: { [Op.like]: `%${search}%` } },
            ],
          }),
          ...whereClause,
          ...(healthcareFacilityId && {
            entityId: healthcareFacilityId,
          }),
          ...(providerId && {
            transporterId: providerId,
          }),
        },
      });

      return paginationUtils.formatPaginationResult(
        await Promise.all(
          rows.map(async (m: any) => {
            //get information entity
            const dataEntity = await getEntityDetail(m.entityId, token);
            return new PartnerVehicle({
              id: m.get('id') as number | undefined,
              createdBy: m.createdBy,
              updatedBy: m.updatedBy,
              createdAt: m.createdAt,
              updatedAt: m.updatedAt as Date,
              entityId: m.entityId,
              vehicleType: m.vehicleType,
              vehicleNumber: m.vehicleNumber,
              capacityInKgs: m.capacityInKgs,
              transporterId: m.transporterId,
              entityName: dataEntity?.name,
            });
          }),
        ),
        Number(count),
        safeLimit,
        safePage,
      );
    } catch (error) {
      console.error('Error retrieving Partner Vehicles:', error);
      throw new Error('Error retrieving Partner Vehicles');
    }
  }

  async updatePartnerVehicle(partnerVehicle: PartnerVehicle): Promise<PartnerVehicle | null> {
    try {
      if (!partnerVehicle.id || !partnerVehicle.updatedBy) {
        throw new Error('Missing required fields for PartnerVehicle update');
      }

      const existingData = (await checkExistingData(PartnerVehicleModel, partnerVehicle.id)) as any;

      if (!existingData) {
        console.error(`Partner Vehicle with ID ${partnerVehicle.id} not found`);
        return null;
      }
      await existingData.update({
        updatedAt: new Date(),
        updatedBy: partnerVehicle.updatedBy,
        entityId: partnerVehicle.entityId,
        vehicleType: partnerVehicle.vehicleType,
        vehicleNumber: partnerVehicle.vehicleNumber,
        capacityInKgs: partnerVehicle.capacityInKgs,
      });

      return await this.getPartnerVehicleById(partnerVehicle.id.toString());
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Vehicle creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Partner Vehicle: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Partner Vehicle');
      }
    }
  }

  async deletePartnerVehicle(id: string, deletedBy?: number): Promise<boolean | null> {
    try {
      const existingData = (await checkExistingData(PartnerVehicleModel, id)) as any;

      if (!existingData) {
        console.error(`Partner Vehicle with ID ${id} not found`);
        return null;
      }

      const dataTransactionVehicle = await WasteTransportationExternalGroupModel.findOne({
        where: {
          transporterVehicleId: id,
        },
      });
      if (dataTransactionVehicle) {
        console.error(`Partner Vehicle with ID ${id} not deleted`);
        return null;
      }

      if (deletedBy) await existingData.update({ deletedBy });
      await existingData.destroy();
      console.log('Partner Vehicle deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting Partner Vehicle:', error);
      throw new Error('Error deleting Partner Vehicle');
    }
  }

  async exportPartnerVehiclesToExcel(
    token: string,
    transporterId: number,
    lang: string,
    search?: string,
    entityTag?: string,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    try {
      const result = await this.getAllPartnerVehicles(
        100000,
        1,
        token,
        transporterId,
        search,
        entityTag,
        healthcareFacilityId,
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Partner Vehicles');

      // ================= HEADER =================
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Fasyankes', key: 'entityName', width: 30 },
        { header: 'Tipe Kendaraan', key: 'vehicleType', width: 20 },
        { header: 'No Plat Kendaraan', key: 'vehicleNumber', width: 20 },
        { header: 'Kapasitas (Kg)', key: 'capacityInKgs', width: 15 },
      ];

      // Header style
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // ================= DATA =================
      result.data.forEach((item, index) => {
        const row = worksheet.addRow({
          no: index + 1,
          entityName: item.entityName,
          vehicleType: getVehicleTypeLabel(item.vehicleType, lang),
          vehicleNumber: item.vehicleNumber,
          capacityInKgs: item.capacityInKgs,
        });

        // Alignment per kolom
        row.getCell('no').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('entityName').alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell('vehicleType').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('vehicleNumber').alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        row.getCell('capacityInKgs').alignment = {
          vertical: 'middle',
          horizontal: 'right',
        };
      });

      // ================= RETURN BUFFER =================
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error exporting Partner Vehicles to Excel:', error);
      throw new Error('Error exporting Partner Vehicles to Excel');
    }
  }
}

const VEHICLE_TYPE_LABEL: Record<string, Record<string, string>> = {
  en: {
    BOX_TRUCK: 'Box Truck',
    REFRIGERATED_BOX_TRUCK: 'Refrigerated Box Truck',
    OPEN_BODY_TRUCK: 'Open Body Truck',
    TANKER: 'Tanker',
    HAZARDOUS_MATERIAL_TRUCK: 'Hazardous Material Truck',
    RADIOACTIVE_MATERIAL_TRUCK: 'Radioactive Material Truck',
    FLATBED_TRUCK: 'Flatbed Truck',
    LOADER_TRUCK: 'Loader Truck',
    TRAILER: 'Trailer',
    VAN: 'Van',
  },
  id: {
    BOX_TRUCK: 'Truk Boks',
    REFRIGERATED_BOX_TRUCK: 'Truk Pendingin',
    OPEN_BODY_TRUCK: 'Truk Bak Terbuka',
    TANKER: 'Truk Tangki',
    HAZARDOUS_MATERIAL_TRUCK: 'Truk Bahan Baku Berbahaya',
    RADIOACTIVE_MATERIAL_TRUCK: 'Truk Bahan Radioaktif',
    FLATBED_TRUCK: 'Truk Bak Datar',
    LOADER_TRUCK: 'Truk Pengangkut',
    TRAILER: 'Trailer',
    VAN: 'Van',
  },
};

function getVehicleTypeLabel(vehicleType: string, lang: string): string {
  return VEHICLE_TYPE_LABEL[lang]?.[vehicleType] ?? vehicleType;
}
