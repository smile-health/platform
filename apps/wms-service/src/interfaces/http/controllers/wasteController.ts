import { Request, Response } from 'express';
import WasteBagRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import CreateWasteUseCase from '../../../application/use-cases/CreateWaste';
import TemporaryStoreWasteUseCase from '../../../application/use-cases/TemporaryStoreWaste';
import ColdStoreWasteUseCase from '../../../application/use-cases/ColdStoreWaste';
import AutoClaveWasteBag from '../../../application/use-cases/AutoClaveWasteBag';
import IncinerateWasteBag from '../../../application/use-cases/IncinerateWasteBag';
import WasteStatusUpdatePublisher from '../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import GetAllWasteBagUseCase from '../../../application/use-cases/GetAllWasteBag';
import TransportRequestedWasteBagUseCase from '../../../application/use-cases/TransportRequestedWasteBag';
import ColdStorageWasteBagDTO from '../../../application/dtos/ColdStorageWasteBagDTO';
import HandoverTransportWasteBagUseCase from '../../../application/use-cases/HandOverTransport';
import S3FileServiceRepositoryImpl from '../../../infrastructure/database/repositories/S3FileServiceRepositoryImpl';
import TransportExternalRequestedWasteBagUseCase from '../../../application/use-cases/TransportExternalRequestedWasteBag';
import HandoverTransportExternalWasteBagUseCase from '../../../application/use-cases/HandOverTransportExternal';
import ReceievmentTreatmentExternalWasteBagUseCase from '../../../application/use-cases/ReceivmentTreatmentExternal';
import PickUpTransportExternalWasteBagUseCase from '../../../application/use-cases/PickUpTransportExternal';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import ListFollowUpTreatmentUseCase from '../../../application/use-cases/ListFollowUpTreatment';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import HandoverTreatmentExternalWasteBagUseCase from '../../../application/use-cases/HandOverTreatmentExternal';
import ValidateWasteBagGroupUseCase from '../../../application/use-cases/ValidateSelectWasteGroup';
import InternalLandfillUseCase from '../../../application/use-cases/InternalLandfill';
import CreateWasteDTO from '../../../application/dtos/CreateWasteDTO';
import TransportRequestDTO from '../../../application/dtos/TransportRequestDTO';

export async function getAllWasteController(req: Request, res: Response) {
  try {
    const {
      limit,
      page,
      search,
      healthcareId,
      transporterId,
      thirdPartyId,
      wasteUpdateStart,
      wasteUpdateEnd,
      wasteClassificationId,
      transportationGroupId,
      transportationExternalGroupId,
      treatmentGroupId,
      treatmentExternalGroupId,
      sourceType,
      ownedBy,
      wasteStatus,
      binNumber,
      wasteBagQrCodeId,
      id,
      wasteTypeId,
      wasteGroupId,
      isTreated,
      isDisposed,
      loggerHistory: isLoggerHistory = '1', //default true
    } = req.query;

    const repo = new WasteBagRepositoryImpl();
    const useCase = new GetAllWasteBagUseCase(repo);

    let entityType = req.user?.entity.entity_type.name;
    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');
    let entityTag = req.user?.entity.tag.toString();
    const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
    if (allowedTypes.includes(entityType) && !isSuperAdmin) {
      entityTag = 'hospital';
    }

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page),
      search?.toString(),
      Number(healthcareId?.toString()),
      Number(transporterId?.toString()),
      Number(thirdPartyId?.toString()),
      wasteUpdateStart?.toString(),
      wasteUpdateEnd?.toString(),
      wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
      Number(transportationGroupId?.toString()),
      Number(transportationExternalGroupId?.toString()),
      Number(treatmentGroupId?.toString()),
      Number(treatmentExternalGroupId?.toString()),
      sourceType?.toString(),
      ownedBy?.toString(),
      wasteStatus?.toString(),
      binNumber?.toString(),
      wasteBagQrCodeId?.toString(),
      Number(id?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      undefined,
      isTreated?.toString() === 'true',
      isDisposed?.toString() === 'true',
      entityTag,
      req.user?.entity.id,
      isLoggerHistory === '1',
    );

    res.success(wasteBag);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function createWasteController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const wasteClassification = new WasteClassificationRepositoryImpl();
    const useCase = new CreateWasteUseCase(repo, wasteStatusUpdateRepo, wasteClassification);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const payload: CreateWasteDTO = {
      ...req.body,
      healthcareFacilityId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    };
    const isRadioActive = req.body?.isRadioActive === 'true' ? true : false;

    const wasteBag = await useCase.execute(token, payload, isRadioActive);

    if (typeof wasteBag === 'string') {
      res.fail(req.t(`waste.error.${wasteBag}`), {
        message: req.t(`waste.error.${wasteBag}`),
      });
      return;
    }
    res.success(wasteBag);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function followUpTreatmentListController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const useCase = new ListFollowUpTreatmentUseCase(repo);

    const { wasteBagQrCodeIds } = req.body;
    const updatedBy = req.user?.user_uuid;

    if (!updatedBy) {
      res.fail(req.t('common.entity-invalid'), {
        isValidationError: true,
      });
      return;
    }

    const isTemporaryStored = await useCase.execute({
      wasteBagQrCodeIds,
      updatedBy,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    res.success(isTemporaryStored);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function temporaryStoreWasteController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new TemporaryStoreWasteUseCase(repo, wasteStatusUpdateRepo, notif);

    const { wasteBagQrCodeIds } = req.body;
    const updatedBy = req.user?.user_uuid;

    if (!updatedBy) {
      res.fail(req.t('common.entity-invalid'), {
        isValidationError: true,
      });
      return;
    }

    const isTemporaryStored = await useCase.execute({
      wasteBagQrCodeIds,
      updatedBy,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (!isTemporaryStored) {
      res.fail('Failed to store waste bag in temporary storage');
      return;
    }

    res.success(isTemporaryStored);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function coldStoreWasteController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new ColdStoreWasteUseCase(repo, wasteStatusUpdateRepo, notif);

    const { wasteBagQrCodeIds, endTime } = req.body;
    const createdBy = req.user?.user_uuid;

    if (!createdBy) {
      res.fail(req.t('common.entity-invalid'), {
        isValidationError: true,
      });
      return;
    }

    const isColdStored = await useCase.execute({
      wasteBagQrCodeIds: wasteBagQrCodeIds,
      createdBy: createdBy,
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (!isColdStored) {
      res.fail('Failed to store waste bag in cold storage');
      return;
    } else if (typeof isColdStored === 'string') {
      res.fail(req.t(`waste.error.${isColdStored}`));
      return;
    }

    res.success(isColdStored);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function internalLandfillWasteBagController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new InternalLandfillUseCase(repo, wasteStatusUpdateRepo, notif);

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const result = useCase.execute({
      wasteBagQrCodeIds: req.body.wasteBagQrCodeIds,
      createdBy: req.user?.user_uuid ?? '',
      treatmentStartTime: req.body.treatmentStartTime,
      treatmentEndTime: req.body.treatmentEndTime,
      user: {
        id: req.user?.id as number,
        email: req.user?.email,
        mobile_phone: req.user?.mobile_phone,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (result === null) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}` as string), {
        isValidationError: true,
      });
      return;
    }

    res.success(true);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function sterilisedWasteBagController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new AutoClaveWasteBag(repo, wasteStatusUpdateRepo, notif);

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const result = useCase.execute({
      wasteBagQrCodeIds: req.body.wasteBagQrCodeIds,
      createdBy: req.user?.user_uuid ?? '',
      treatmentStartTime: req.body.treatmentStartTime,
      treatmentEndTime: req.body.treatmentEndTime,
      user: {
        id: req.user?.id as number,
        email: req.user?.email,
        mobile_phone: req.user?.mobile_phone,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (result === null) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}` as string), {
        isValidationError: true,
      });
      return;
    }

    res.success(true);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function incinerateWasteBagController(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new IncinerateWasteBag(repo, wasteStatusUpdateRepo, notif);

    const result = useCase.execute({
      wasteBagQrCodeIds: req.body.wasteBagQrCodeIds,
      createdBy: req.user?.user_uuid ?? '',
      treatmentStartTime: req.body.treatmentStartTime,
      treatmentEndTime: req.body.treatmentEndTime,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (result === null) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}` as string), {
        isValidationError: true,
      });
      return;
    }

    res.success(true);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function followUpToTransporter(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new TransportRequestedWasteBagUseCase(repo, wasteStatusUpdateRepo, notif);

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const result = await useCase.execute({
      ...req.body,
      consumerId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email,
        mobile_phone: req.user?.mobile_phone,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (result === null) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function handoverUpToTransporter(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const fileService = new S3FileServiceRepositoryImpl();
    const notif = new NotificationPublisher();
    const useCase = new HandoverTransportWasteBagUseCase(
      repo,
      wasteStatusUpdateRepo,
      fileService,
      notif,
    );

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    if (!req.file) {
      res.fail('File is required for handover', {
        isValidationError: true,
      });
      return;
    }

    const result = await useCase.execute({
      ...req.body,
      file: req.file,
      healthcareFacilityId: req.user?.entity.id,
      consumerId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email,
        mobile_phone: req.user?.mobile_phone,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (!result) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function followUpToTransporterExternal(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new TransportExternalRequestedWasteBagUseCase(
      repo,
      wasteStatusUpdateRepo,
      notif,
    );

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const payload: TransportRequestDTO = {
      ...req.body,
      consumerId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      isReadOnly: req.body.isReadOnly === 'true',
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    };
    const result = await useCase.execute(token, payload);

    if (result === null) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function handoverUpToTransporterExternal(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const fileService = new S3FileServiceRepositoryImpl();
    const notif = new NotificationPublisher();
    const useCase = new HandoverTransportExternalWasteBagUseCase(
      repo,
      wasteStatusUpdateRepo,
      fileService,
      notif,
    );

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    if (!req.file) {
      res.fail('File is required for handover', {
        isValidationError: true,
      });
      return;
    }

    const result = await useCase.execute({
      ...req.body,
      file: req.file,
      healthcareFacilityId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (!result) {
      res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
      return;
    } else if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function pickUpToTransporterExternal(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new PickUpTransportExternalWasteBagUseCase(repo, wasteStatusUpdateRepo, notif);

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const result = await useCase.execute({
      ...req.body,
      token: token,
      transporterOperatorId: req.user?.user_uuid_wms,
      transporterId: req.user?.entity.id,
      createdBy: req.user?.user_uuid_wms,
      updatedBy: req.user?.user_uuid_wms,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function handoverToTreatmentExternal(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new HandoverTreatmentExternalWasteBagUseCase(
      repo,
      wasteStatusUpdateRepo,
      notif,
    );

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const result = await useCase.execute({
      ...req.body,
      entityId: req.body.entityId ?? req.user?.entity.id,
      transporterOperatorId: req.user?.user_uuid,
      transporterId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      token: token,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function receievmentUpToTreatmentExternal(req: Request, res: Response) {
  try {
    const repo = new WasteBagRepositoryImpl();
    const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
    const notif = new NotificationPublisher();
    const useCase = new ReceievmentTreatmentExternalWasteBagUseCase(
      repo,
      wasteStatusUpdateRepo,
      notif,
    );

    if (!req.user) {
      res.fail(req.t('common.user-info-not-found'), {
        isValidationError: true,
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const result = await useCase.execute({
      ...req.body,
      entityId: req.user?.entity.id,
      createdBy: req.user?.user_uuid,
      token: token,
      updatedBy: req.user?.user_uuid,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

    if (typeof result === 'string') {
      res.fail(req.t(`waste.error.${result}`), {
        isValidationError: true,
      });
      return;
    }

    res.success(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}
