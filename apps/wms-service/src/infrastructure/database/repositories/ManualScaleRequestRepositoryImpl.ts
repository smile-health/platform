import ManualScaleRequest from '../../../domain/entities/ManualScaleRequest';
import ManualScaleRequestRepository from '../../../domain/repositories/ManualScaleRequestRepository';
import { UniqueConstraintError, Op } from 'sequelize';
import ManualScaleRequestModel from '../models/ManualScaleRequestModel';
import { paginationUtils } from '../../../shared/utils/pagination';
import { getEntityDetail, getUsersDetail } from '../../external-apis/thirdPartyClient';
import EntityLocationModel from '../models/EntityLocationModel';
import EntitiesModel from '../models/EntitiesModel';

export default class ManualScaleRequestRepositoryImpl implements ManualScaleRequestRepository {
  async checkDataIsExist(requestedBy: string): Promise<ManualScaleRequest | null> {
    try {
      const currentDate = new Date();
      const startOfDay = new Date(
        Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate(),
          0,
          0,
          0,
        ),
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

      const checkData = await ManualScaleRequestModel.findOne({
        where: {
          requestedBy: requestedBy,
          approvalType: 'TIME_BOUND',
          created_at: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay,
          },
          status: {
            [Op.in]: ['PENDING', 'WAITING_FOR_APPROVAL', 'APPROVED'],
          },
        },
      });

      if (!checkData) {
        return null;
      } else {
        return getModel(checkData, undefined, undefined);
      }
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Manual scale');
      }
    }
  }

  async getAllManualRequest(
    limit: number,
    page: number,
    token: string,
    entityId?: number,
    status?: string,
    isActive?: boolean,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: ManualScaleRequest[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const startOfDay = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const endOfDay = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      const { count, rows } = await ManualScaleRequestModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['updated_at', 'DESC']],
        // distinct: true,
        where: {
          ...(status && {
            status: status,
          }),
          ...(isActive && {
            isActive: isActive,
          }),
          ...(entityId && {
            entityId: entityId,
          }),
          ...(startOfDay &&
            endOfDay && {
              created_at: {
                [Op.between]: [startOfDay, endOfDay],
              },
            }),
        },
        include: [
          {
            model: EntitiesModel,
            as: 'entities',
            required: true,
            attributes: ['id', 'province_id', 'regency_id'],
            where: {
              ...(provinceId && {
                province_id: provinceId,
              }),
              ...(cityId && {
                regency_id: cityId,
              }),
            },
          },
        ],
      });

      return paginationUtils.formatPaginationResult(
        await Promise.all(
          rows.map(async (data: ManualScaleRequestModel) => {
            let approvedBy;

            if (data.get('processedBy') !== null) {
              approvedBy = await getUsersDetail(data.get('processedBy'), token);
            }
            const dataUser = await getUsersDetail(data.get('requestedBy'), token);
            const dataEntity = await getEntityDetail(data.get('entityId'), token);

            return getModel(data, dataUser, dataEntity, approvedBy);
          }),
        ),
        Number(count),
        safeLimit,
        safePage,
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error get Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while get Manual scale');
      }
    }
  }
  async getOneActiveRequest(requestedBy: string): Promise<ManualScaleRequest | null> {
    try {
      const currentDate = new Date();
      const data = await ManualScaleRequestModel.findOne({
        where: {
          requestedBy: requestedBy,
          created_at: {
            [Op.gte]: new Date(currentDate.setHours(0, 0, 0, 0)),
            [Op.lt]: new Date(currentDate.setHours(23, 59, 59, 999)),
          },
          isActive: true,
          status: 'APPROVED',
        },
      });

      if (!data) {
        return null;
      }

      return getModel(data, undefined, undefined);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Manual scale');
      }
    }
  }

  async waitingApprovalManualScaleRequest(id: number): Promise<ManualScaleRequest | null> {
    try {
      const existingData = await ManualScaleRequestModel.findByPk(id);

      if (!existingData) {
        return null;
      }

      const updatedData = await existingData.update({
        isActive: true,
        status: 'WAITING_FOR_APPROVAL',
      });

      return getModel(updatedData, undefined, undefined);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Manual scale');
      }
    }
  }

  async activateManualScaleRequest(
    id: number,
    processedBy: string,
    action: 'APPROVED' | 'REJECTED',
  ): Promise<ManualScaleRequest | string | null> {
    try {
      const existingData = await ManualScaleRequestModel.findByPk(id);

      if (!existingData) {
        return null;
      }

      const plainData = existingData.get({ plain: true });
      if (plainData.status !== 'WAITING_FOR_APPROVAL') {
        return 'Only requests with status WAITING_FOR_APPROVAL can be processed';
      }

      const updatedData = await existingData.update({
        isActive: true,
        status: action,
        processedBy: processedBy,
      });

      return getModel(updatedData, undefined, undefined);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Manual scale');
      }
    }
  }

  async createManualScaleRequest(payload: ManualScaleRequest): Promise<ManualScaleRequest> {
    try {
      const currentDate = new Date();
      const {
        id,
        requestedBy,
        processedBy,
        isActive,
        status,
        approvalType,
        validUntil,
        countLimit,
        entityId,
        createdAt,
        updatedAt,
      } = payload;

      const isExist = await this.checkDataIsExist(requestedBy);

      if (isExist) {
        return isExist;
      }

      const createData = await ManualScaleRequestModel.create({
        requestedBy,
        processedBy,
        isActive,
        status,
        approvalType,
        validUntil,
        countLimit,
        entityId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return getModel(createData, undefined, undefined);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Manual scale creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Manual scale: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Manual scale');
      }
    }
  }
}

function getModel(
  data: ManualScaleRequestModel,
  userDetail: any | undefined,
  entityDetail: any | undefined,
  approvedBy?: any,
): ManualScaleRequest {
  const result = data.get({ plain: true });

  const fullName = [userDetail?.firstname, userDetail?.lastname].filter(Boolean).join(' ');

  const fullNameApprovedBy = [approvedBy?.firstname, approvedBy?.lastname]
    .filter(Boolean)
    .join(' ');

  return new ManualScaleRequest({
    id: result.id ?? data.id,
    requestedBy: result.requestedBy,
    processedBy: result.processedBy,
    isActive: result.isActive,
    status: result.status,
    approvalType: result.approvalType,
    validUntil: result.validUntil,
    countLimit: result.countLimit,
    entityId: result.entityId,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    processedName: fullNameApprovedBy,
    operatorName: fullName,
    entityName: entityDetail?.name,
  });
}
