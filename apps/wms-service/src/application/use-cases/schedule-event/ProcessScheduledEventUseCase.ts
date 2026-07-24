import ScheduledEvent from '../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import WasteBagRepository from '../../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../../domain/services/WasteStatusUpdateService';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';
import { PartnershipStatusUpdateService } from '../../../domain/services/PartnershipStatusUpdateService';
import ManualScaleRequestRepository from '../../../domain/repositories/ManualScaleRequestRepository';
import { ManualScaleRequestService } from '../../../domain/services/ManualScaleRequestService';
import InfraRegistry from '../../../infrastructure/database/repositories/infraRegistry';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';
import redis from '../../../infrastructure/cache/redis.client';

type TreatmentStatus = 'RECYCLED' | 'LANDFILLED' | 'COLLECTED' | 'DISPOSED';

export default class ProcessScheduledEventUseCase {
  constructor(
    private readonly wasteBagRepository: WasteBagRepository,
    private readonly scheduledEventRepository: ScheduledEventRepository,
    private readonly wasteStatusUpdateService: WasteStatusUpdateService,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly partnershipStatusUpdateService: PartnershipStatusUpdateService,
    private readonly manualRequestRepository: ManualScaleRequestRepository,
    private readonly manualRequestStatusUpdateService: ManualScaleRequestService,
    private readonly notificationService: NotificationServiceRepository,
  ) {}

  async execute(eventData: ScheduledEvent): Promise<void> {
    try {
      if (
        eventData.eventType === 'WASTE_BAG_INTERNAL_LANDFILL_STARTED' ||
        eventData.eventType === 'WASTE_BAG_COLD_STORED_STARTED' ||
        eventData.eventType === 'WASTE_BAG_INCINERATION_STARTED' ||
        eventData.eventType === 'WASTE_BAG_STERILISED_STARTED' ||
        eventData.eventType === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER' ||
        eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER' ||
        eventData.eventType === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL' ||
        eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL' ||
        eventData.eventType === 'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL' ||
        eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL' ||
        eventData.eventType === 'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL' ||
        eventData.eventType === 'WASTE_BAG_STERILISED_EXTERNAL_STARTED' ||
        eventData.eventType === 'WASTE_BAG_INCENERATES_EXTERNAL_STARTED' ||
        eventData.eventType === 'WASTE_BAG_LANDFILLED_EXTERNAL_STARTED' ||
        eventData.eventType === 'WASTE_BAG_ALREADY_RECEIVED'
      ) {
        // Fetch the waste bag associated with the scheduled event
        const metadata: {
          wasteBagId: string;
          createdBy: string;
          treatmentStartTime: Date;
          treatmentEndTime: Date;
          startTime: Date;
          endTime: Date;
          isGroup: boolean;
          isFailed: boolean;
          user: {
            id: number;
            email: string;
            mobile_phone: string;
            fcm_token: string;
            entity_id: number;
            province_id?: number;
            regency_id?: number;
          };
          entity: {
            id: number;
            province_id?: number;
            regency_id?: number;
          };
        } = JSON.parse(eventData.metadata!);

        const wasteBag = await this.wasteBagRepository.getWasteBagById(metadata.wasteBagId);

        if (!wasteBag) {
          throw new Error(`Waste bag with ID ${metadata.wasteBagId} not found`);
        }

        const disposalMethodsArray = wasteBag.wasteClassification?.disposalMethod
          ? wasteBag.wasteClassification?.disposalMethod
              .split(',')
              .map((method: any) => method.trim())
          : [];

        const needRecycles = disposalMethodsArray.includes('TRANSPORTER_RECYCLER');
        const needLandfiller = disposalMethodsArray.includes('TRANSPORTER_LANDFILL');
        const needGovTransport = disposalMethodsArray.includes('TRANSPORTER_GOVERNMENT');
        const needGovTransportWasteBank = disposalMethodsArray.includes(
          'TRANSPORTER_GOVERNMENT_WASTE_BANK',
        );
        const needSpecialTransport = disposalMethodsArray.includes(
          'SPECIALIZED_TREATMENT_PROVIDER',
        );

        const treatmentMethodsArray = wasteBag.wasteClassification?.treatmentMethod
          ? wasteBag.wasteClassification?.treatmentMethod
              .split(',')
              .map((method: any) => method.trim())
          : [];

        const hasDisinfection = treatmentMethodsArray.includes('DISINFECTION');
        const hasPyrolysis = treatmentMethodsArray.includes('PYROLYSIS');

        //Pre-condition check
        if (
          eventData.eventType === 'WASTE_BAG_INTERNAL_LANDFILL_STARTED' &&
          wasteBag.wasteStatus !== 'INTERNAL_LANDFILL_IN_PROCESS'
        ) {
          throw 'Invalid waste status for internal landfill: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_COLD_STORED_STARTED' &&
          wasteBag.wasteStatus !== 'IN_COLD_STORAGE'
        ) {
          throw 'Invalid waste status for incineration: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_INCINERATION_STARTED' &&
          wasteBag.wasteStatus !== 'INCINERATION_IN_PROCESS'
        ) {
          throw 'Invalid waste status for incineration: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_STERILISED_STARTED' &&
          wasteBag.wasteStatus !== 'STERILIZATION_IN_PROCESS'
        ) {
          throw 'Invalid waste status for autoclaving: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL' &&
          wasteBag.wasteStatus !== 'TRANSPORTATION_REQUEST_CREATED'
        ) {
          throw 'Invalid waste status for handover treatment external: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL' &&
          wasteBag.wasteStatus !== 'READY_FOR_TRANSPORT'
        ) {
          throw (
            'Invalid waste status for follow up to transporter external: ' + wasteBag.wasteStatus
          );
        } else if (
          eventData.eventType === 'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL' &&
          wasteBag.wasteStatus !== 'IN_TRANSIT'
        ) {
          throw 'Invalid waste status for pickup to transporter external: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL' &&
          wasteBag.wasteStatus !== 'HANDOVER_TO_TREATMENT'
        ) {
          throw 'Invalid waste status for handover treatment external: ' + wasteBag.wasteStatus;
        } else if (
          eventData.eventType === 'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL' &&
          wasteBag.wasteStatus !== 'READY_FOR_TREATMENT'
        ) {
          throw 'Invalid waste status for receive treatment external: ' + wasteBag.wasteStatus;
        }

        // Update waste bag status and isTreated flag
        if (eventData.eventType === 'WASTE_BAG_COLD_STORED_STARTED') {
          wasteBag.wasteStatus = 'IN_COLD_STORAGE';

          // await this.notificationService.sendMultiNotification(
          //     metadata.user,
          //     metadata.entity,
          //     NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.message({
          //         group_id: wasteBag.wasteTreatmentGroupId,
          //     }),
          //     NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.title,
          //     NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.type,
          // );
        } else if (eventData.eventType === 'WASTE_BAG_INCINERATION_STARTED') {
          wasteBag.wasteStatus = 'INCINERATED';
          wasteBag.isTreated = true;

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.message({
              group_id: wasteBag.wasteTreatmentGroupId,
            }),
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.title,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATED.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: true,
            },
          );
        } else if (eventData.eventType === 'WASTE_BAG_STERILISED_STARTED') {
          wasteBag.wasteStatus = 'STERILISED';
          wasteBag.isTreated = true;

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISED.message({
              group_id: wasteBag.wasteTreatmentGroupId,
            }),
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISED.title,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISED.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: true,
            },
          );
        } else if (eventData.eventType === 'WASTE_BAG_INTERNAL_LANDFILL_STARTED') {
          wasteBag.wasteStatus = 'INTERNAL_LANDFILLED';

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED.message({
              group_id: wasteBag.wasteTreatmentGroupId,
            }),
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED.title,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: true,
            },
          );
        } else if (
          eventData.eventType === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER' ||
          eventData.eventType === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL'
        ) {
          wasteBag.wasteStatus = 'READY_FOR_TRANSPORT';
        } else if (
          eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER' ||
          eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL'
        ) {
          wasteBag.wasteStatus = 'TRANSPORTATION_REQUEST_CREATED';
          wasteBag.transportationStatus = 'HANDED_OVER';
          wasteBag.transportationStatusUpdatedAt = new Date();
        } else if (eventData.eventType === 'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL') {
          wasteBag.wasteStatus = 'IN_TRANSIT';
          wasteBag.transportationStatus = 'IN_TRANSIT';
          wasteBag.ownedBy = 'TRANSPORTER';
          wasteBag.transportationStatusUpdatedAt = new Date();

          if (wasteBag.wasteGroupIds && needRecycles) {
            wasteBag.wasteStatus = 'RECYCLED';
            wasteBag.ownedBy = 'THIRD_PARTY';
            wasteBag.treatmentEndTime = new Date();
            wasteBag.isTreated = true;
            wasteBag.isDisposed = true;
            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already recycled on third party recyle',
              'WASTE_BAG_ALREADY_RECYCLED',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: 'RECYCLED',
                isGroup: true,
              },
            );

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
                group_id: wasteBag.wasteTreatmentGroupId,
                waste_status: wasteBag.wasteStatus,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          }

          if (needSpecialTransport) {
            wasteBag.wasteStatus = 'COLLECTED';
            wasteBag.ownedBy = 'THIRD_PARTY';
            wasteBag.treatmentEndTime = new Date();
            wasteBag.isDisposed = true;
            wasteBag.isTreated = true;

            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already collected by specialize treatment',
              'WASTE_BAG_ALREADY_COLLECTED',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: 'COLLECTED',
                isGroup: true,
              },
            );

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
                group_id: wasteBag.wasteTreatmentGroupId,
                waste_status: wasteBag.wasteStatus,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          }

          if (needGovTransport) {
            wasteBag.wasteStatus = 'DISPOSED';
            wasteBag.ownedBy = 'THIRD_PARTY';
            wasteBag.treatmentEndTime = new Date();
            wasteBag.isDisposed = true;
            wasteBag.isTreated = true;

            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already disposed by goverment transport',
              'WASTE_BAG_ALREADY_DISPOSED',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: 'DISPOSED',
                isGroup: true,
              },
            );

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
                group_id: wasteBag.wasteTreatmentGroupId,
                waste_status: wasteBag.wasteStatus,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          }
        } else if (eventData.eventType === 'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL') {
          wasteBag.transportationStatus = 'HANDED_OVER';
          wasteBag.wasteStatus = 'HANDOVER_TO_TREATMENT';
          wasteBag.transportationStatusUpdatedAt = new Date();
        } else if (eventData.eventType === 'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL') {
          wasteBag.wasteStatus = 'READY_FOR_TREATMENT';
          wasteBag.ownedBy = 'THIRD_PARTY';

          if (needGovTransportWasteBank) {
            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already received on third party',
              'WASTE_BAG_ALREADY_RECEIVED',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: 'READY_FOR_TREATMENT',
                isGroup: true,
              },
            );

            wasteBag.wasteStatus = 'DISPOSED';
            wasteBag.ownedBy = 'THIRD_PARTY';
            wasteBag.treatmentEndTime = new Date();
            wasteBag.isDisposed = true;
            wasteBag.isTreated = true;

            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already disposed by goverment transport with waste bank',
              'WASTE_BAG_ALREADY_DISPOSED',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: 'DISPOSED',
                isGroup: true,
              },
            );

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
                group_id: wasteBag.wasteTreatmentGroupId,
                waste_status: wasteBag.wasteStatus,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          } else if (wasteBag.isTreated === false) {
            wasteBag.wasteStatus = 'IN_THIRD_PARTY_STORAGE';
            wasteBag.ownedBy = 'THIRD_PARTY';

            await this.wasteStatusUpdateService.logInfoAsync(
              'Waste bag is already in third party storage',
              'WASTE_BAG_ALREADY_IN_THIRD_PARTY_STORAGE',
              {
                wasteBagId: metadata.wasteBagId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                wasteStatus: wasteBag.wasteStatus,
              },
            );

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE.message({
                group_id: wasteBag.wasteTreatmentGroupId,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          } else if (wasteBag.isTreated === true) {
            if (hasPyrolysis) {
              await this.wasteStatusUpdateService.logInfoAsync(
                'Waste bag is already received on third party',
                'WASTE_BAG_ALREADY_RECEIVED',
                {
                  wasteBagId: metadata.wasteBagId,
                  createdBy: metadata.createdBy,
                  startTime: metadata.startTime,
                  endTime: metadata.endTime,
                  wasteStatus: 'READY_FOR_TREATMENT',
                  isGroup: true,
                },
              );

              wasteBag.wasteStatus = 'LANDFILLED';
              wasteBag.isTreated = true;
              wasteBag.isDisposed = true;
              wasteBag.treatmentEndTime = new Date();

              await this.wasteStatusUpdateService.logInfoAsync(
                'Waste bag is already landfilled by third party',
                'WASTE_BAG_ALREADY_LANDFILLED',
                {
                  wasteBagId: metadata.wasteBagId,
                  createdBy: metadata.createdBy,
                  startTime: metadata.startTime,
                  endTime: metadata.endTime,
                  wasteStatus: 'LANDFILLED',
                  isGroup: true,
                },
              );
            } else if (hasDisinfection) {
              await this.wasteStatusUpdateService.logInfoAsync(
                'Waste bag is already received on third party',
                'WASTE_BAG_ALREADY_RECEIVED',
                {
                  wasteBagId: metadata.wasteBagId,
                  createdBy: metadata.createdBy,
                  startTime: metadata.startTime,
                  endTime: metadata.endTime,
                  wasteStatus: 'READY_FOR_TREATMENT',
                  isGroup: true,
                },
              );

              wasteBag.wasteStatus = 'RECYCLED';
              wasteBag.isTreated = true;
              wasteBag.isDisposed = true;
              wasteBag.treatmentEndTime = new Date();

              await this.wasteStatusUpdateService.logInfoAsync(
                'Waste bag is already recycled on third party recyle',
                'WASTE_BAG_ALREADY_RECYCLED',
                {
                  wasteBagId: metadata.wasteBagId,
                  createdBy: metadata.createdBy,
                  startTime: metadata.startTime,
                  endTime: metadata.endTime,
                  wasteStatus: 'RECYCLED',
                  isGroup: true,
                },
              );
            }

            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
                group_id: wasteBag.wasteTreatmentGroupId,
                waste_status: wasteBag.wasteStatus,
              }),
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
              NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: true,
              },
            );
          }
        } else if (eventData.eventType === 'WASTE_BAG_STERILISED_EXTERNAL_STARTED') {
          wasteBag.wasteStatus = 'RECYCLED';
          wasteBag.isTreated = true;
          wasteBag.isDisposed = true;

          await this.wasteStatusUpdateService.logInfoAsync(
            'Waste bag is already recycled on third party recyle',
            'WASTE_BAG_ALREADY_RECYCLED',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              startTime: metadata.startTime,
              endTime: metadata.endTime,
              wasteStatus: 'RECYCLED',
              isGroup: true,
            },
          );

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
              group_id: wasteBag.wasteTreatmentGroupId,
              waste_status: wasteBag.wasteStatus,
            }),
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: true,
            },
          );
        } else if (eventData.eventType === 'WASTE_BAG_INCENERATES_EXTERNAL_STARTED') {
          wasteBag.wasteStatus = 'LANDFILLED';
          wasteBag.isTreated = true;
          wasteBag.isDisposed = true;
          wasteBag.treatmentEndTime = new Date();

          await this.wasteStatusUpdateService.logInfoAsync(
            'Waste bag is already landfilled by third party',
            'WASTE_BAG_ALREADY_LANDFILLED',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              startTime: metadata.startTime,
              endTime: metadata.endTime,
              wasteStatus: 'LANDFILLED',
              isGroup: true,
            },
          );

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.message({
              group_id: wasteBag.wasteTreatmentGroupId,
              waste_status: wasteBag.wasteStatus,
            }),
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.title,
            NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_END_STATUS.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: true,
            },
          );
        }

        wasteBag.wasteStatusUpdatedAt = new Date();

        // Save the updated waste bag
        const currentWasteBag = await this.wasteBagRepository.saveWasteBag(wasteBag);

        // Delete the scheduled event
        await this.scheduledEventRepository.removeEvent(eventData.id!);

        // Publish new waste status to the waste status update queue
        if (wasteBag.wasteStatus === 'INTERNAL_LANDFILLED') {
          await this.wasteStatusUpdateService.logInfoAsync(
            'Waste bag internal landfilled done successfully',
            'WASTE_BAG_INTERNAL_LANDFILLED',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              treatmentStartTime: metadata.treatmentStartTime,
              treatmentEndTime: metadata.treatmentEndTime,
              wasteStatus: wasteBag.wasteStatus,
              isGroup: true,
            },
          );
        } else if (wasteBag.wasteStatus === 'INCINERATED') {
          await this.wasteStatusUpdateService.logInfoAsync(
            'Waste bag incineration done successfully',
            'WASTE_BAG_INCINERATED',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              treatmentStartTime: metadata.treatmentStartTime,
              treatmentEndTime: metadata.treatmentEndTime,
              wasteStatus: wasteBag.wasteStatus,
              isGroup: true,
            },
          );
        } else if (wasteBag.wasteStatus === 'STERILISED') {
          await this.wasteStatusUpdateService.logInfoAsync(
            'Waste bag sterilised done successfully',
            'WASTE_BAG_STERILISED',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              treatmentStartTime: metadata.treatmentStartTime,
              treatmentEndTime: metadata.treatmentEndTime,
              wasteStatus: wasteBag.wasteStatus,
              isGroup: true,
            },
          );
        } else if (
          ['RECYCLED', 'LANDFILLED', 'DISPOSED', 'COLLECTED'].includes(currentWasteBag.wasteStatus)
        ) {
          this.wasteStatusUpdateService.logInfo(
            'Waste bag is already treated on third party',
            'WASTE_BAG_ALREADY_TREATED_IN_THIRD_PARTY',
            {
              wasteBagId: metadata.wasteBagId,
              createdBy: metadata.createdBy,
              startTime: metadata.startTime,
              endTime: metadata.endTime,
              wasteStatus: wasteBag.wasteStatus,
            },
          );

          //! SCHEMA SMILE 2.1
          await InfraRegistry.wasteTreatmentExternalGroupImpl!.updateWasteTreatmentGroup(
            currentWasteBag.id as number,
            currentWasteBag.wasteStatus as TreatmentStatus,
          );
        }
      } else if (eventData.eventType === 'PARTNERSHIP_CONTRACT_EXPIRED') {
        // handle status partnership 'PENDING','ACTIVE','SUSPENDED','TERMINATED','EXPIRED'
        const metadata: {
          partnershipId: number;
          createdBy: string;
          startTime: Date;
          endTime: Date;
          user: {
            id: number;
            email: string;
            mobile_phone: string;
            fcm_token: string;
            entity_id: number;
            province_id?: number;
            regency_id?: number;
          };
          entity: {
            id: number;
            province_id?: number;
            regency_id?: number;
          };
        } = JSON.parse(eventData.metadata!);

        const currentDate = new Date();
        const scheduledAtDate = new Date(eventData.scheduledAt);

        const formattedDate = scheduledAtDate.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        const timeDifference = scheduledAtDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const isSameDay = scheduledAtDate.toDateString() === currentDate.toDateString();

        if (!isSameDay && scheduledAtDate < currentDate) {
          const partnreship = await this.partnershipRepository.updateStatusPartnreship(
            metadata.partnershipId,
            'EXPIRED',
          );

          await this.notificationService.sendMultiNotification(
            metadata.user,
            metadata.entity,
            NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.message({
              expiry_date: formattedDate,
            }),
            NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.title,
            NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.type,
            {
              forSuperAdmin: false,
              forAdmin: true,
              forOperator: false,
            },
          );

          // Delete the scheduled event
          await this.scheduledEventRepository.removeEvent(eventData.id!);

          if (partnreship?.partnershipStatus) {
            this.partnershipStatusUpdateService.logInfo(
              'Partnership contract expired successfully',
              'PARTNERSHIP_CONTRACT_EXPIRED_INFO',
              {
                partnershipId: metadata.partnershipId,
                createdBy: metadata.createdBy,
                startTime: metadata.startTime,
                endTime: metadata.endTime,
                partnershipStatus: partnreship?.partnershipStatus,
              },
            );
          }
        }

        // Kirim notifikasi pada hari ke-3 dan hari ke-1 sebelum expired
        if (daysRemaining === 3 || daysRemaining === 1) {
          const key = `partnership:sent:${metadata.partnershipId}:${daysRemaining}`;
          const alreadySent = await redis.get(key);

          if (!alreadySent) {
            // hilangkan pukul 07.00
            await this.notificationService.sendMultiNotification(
              metadata.user,
              metadata.entity,
              NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.message({
                contract_id: metadata.partnershipId,
                expiry_date: formattedDate,
                days_remaining: daysRemaining,
              }),
              NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.title,
              NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.type,
              {
                forSuperAdmin: false,
                forAdmin: true,
                forOperator: false,
              },
            );
          }

          const ttlSeconds = (daysRemaining + 2) * 24 * 60 * 60;
          if (ttlSeconds > 0) {
            await redis.set(key, 'sent', 'EX', ttlSeconds);
          }
        }
      } else if (eventData.eventType === 'START_MANUAL_SCALE_REQUEST') {
        const metadata: {
          manualScaleId: number;
          createdBy: string;
          startTime: Date;
          endTime: Date;
        } = JSON.parse(eventData.metadata!);

        if (eventData.eventType === 'START_MANUAL_SCALE_REQUEST') {
          await this.manualRequestRepository.waitingApprovalManualScaleRequest(
            metadata.manualScaleId,
          );

          // Delete the scheduled event
          await this.scheduledEventRepository.removeEvent(eventData.id!);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled event:', error);
      if (error instanceof Error) {
        throw new Error('Failed to process scheduled event');
      } else if (typeof error === 'string') {
        if (!eventData.id) {
          throw new Error('Scheduled event ID is missing');
        }
        await this.scheduledEventRepository.failEvent(eventData.id);
      } else {
        throw new Error('An unexpected error occurred while processing the scheduled event');
      }
    }
  }
}
