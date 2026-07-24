import { UserInfo } from '../../shared/types/userInfo';
import WasteBag from '../entities/WasteBag';

export default interface WasteBagRepository {
  createWasteBag(
    wasteBag: WasteBag,
    token: string,
    isRadioActive: boolean,
  ): Promise<WasteBag | string>;
  getListTreatment(
    wasteBagQrCodeIds: string[],
    entityId: number,
  ): Promise<{ label: string; value: string }[]>;
  temporaryStoreWasteBag(
    wasteBagQrCodeIds: string[],
    updated_by: string,
  ): Promise<number | null | string>;
  coldStoreWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
  ): Promise<number | null | string>;
  internalLandfillTreatment(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string>;
  autoclaveWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string>;
  incinerateWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string>;
  createTransportRequestedWasteBag(
    wasteBagQrCodeIds: string[],
    // transporterOperatorId: string,
    consumerId: number,
    providerType: string,
    updatedBy: string,
    transporterVehicleId?: number,
  ): Promise<number | null | string>;
  createHandoverTransportWasteBag(
    wasteTransportationGroupIds: number[],
    // wasteBagQrCodeIds: string[],
    handoverLattitude: number,
    handoverLongitude: number,
    vehicleNumber: string,
    handoverTimestamp: Date,
    manifestDocNumber: string,
    updatedBy: string,
    transporterOperatorId?: string,
  ): Promise<string[] | string>;
  createTransportExternalRequestedWasteBag(
    wasteBagQrCodeIds: string[],
    consumerId: number,
    providerType: string,
    updatedBy: string,
    token: string,
    // transporterOperatorId?: string,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
    transporterId?: number,
    thirdPartyId?: number,
  ): Promise<number | null | string>;
  createHandoverTransportExternalWasteBag(
    wasteTransportationExternalGroupId: number[],
    healthcareFacilityId: number,
    handoverLattitude: number,
    handoverLongitude: number,
    vehicleNumber: string,
    handoverTimestamp: Date,
    manifestDocNumber: string,
    updatedBy: string,
    transporterOperatorId?: string,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
  ): Promise<string[] | string>;
  createPickUpTransportExternalWasteBag(
    wasteTransportationExternalGroupIds: number[],
    healthcareFacilityId: number,
    handoverLattitude: number,
    handoverLongitude: number,
    updatedBy: string,
    transporterOperatorId: string,
    transporterId: number,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
  ): Promise<
    | {
        wasteBagQrCodeId: string[];
        healthcareFacilityId: number;
      }
    | string
  >;
  createHandoverTreatmentExternalWasteBag(
    wasteTransportationExternalGroupIds: number[],
    entityId: number,
    updatedBy: string,
    startTime: string | Date,
    endTime: string | Date,
    treatmentLocationId: number,
    treatmentId?: number,
  ): Promise<{ wasteBagQrCodeIds: string[]; healthcareFacilityId: number } | string>;
  createReceivingTreatmentExternalWasteBag(
    wasteBagQrCodeIds: string[],
    entityId: number,
    updatedBy: string,
    startTime: string | Date,
    endTime: string | Date,
  ): Promise<
    { wasteBagQrCodeIds: string[]; groupId: number; healthcareFacilityId: number } | string
  >;
  inTransitWasteBag(wasteBagTransportGroupId: number, updatedBy: string): Promise<boolean>;
  thirdPartyHandedOverWasteBag(
    wasteBagTransportGroupIds: number[],
    user: UserInfo,
  ): Promise<boolean>;
  landfillWasteBag(wasteBagTransportGroupIds: number[], user: UserInfo): Promise<boolean>;
  recycleWasteBag(wasteBagTransportGroupIds: number[], user: UserInfo): Promise<boolean>;
  getWasteBagIdsByTransportGroupId(wasteBagTransportGroupId: number): Promise<string[]>;
  getWasteBagByWasteSourceId(wasteSourceId: number): Promise<number | undefined>;
  getWasteBagById(id: string): Promise<WasteBag | null>;
  updateFilePath(
    wasteTransportationGroupId: number[],
    docNumber: string,
    docPath: string,
  ): Promise<boolean>;
  saveWasteBag(wasteBag: WasteBag): Promise<WasteBag>;
  getAllWasteBag(
    limit: number,
    page: number,
    search?: string,
    healthcareId?: number,
    transporterId?: number,
    thirdPartyId?: number,
    wasteUpdateStart?: string,
    wasteUpdateEnd?: string,
    wasteClassificationId?: number[],
    transportationGroupId?: number,
    transportationExternalGroupId?: number,
    treatmentGroupId?: number,
    treatmentExternalGroupId?: number,
    sourceType?: string,
    ownedBy?: string,
    wasteStatus?: string,
    binNumber?: string,
    wasteBagQrCodeId?: string,
    id?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    isTreated?: boolean,
    isDisposed?: boolean,
    entityTag?: string,
    entityId?: number,
    isHomePage?: boolean,
    isLoggerHistory?: boolean,
  ): Promise<{
    data: WasteBag[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
  postTreatment(
    schema: 'DISINFECTION' | 'PYROLYSIS' | 'LANDFILLED' | 'RECYCLED' | 'DISPOSED',
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean | string>;
}
