import { WasteTransportationGroupAttributes } from '../../infrastructure/database/models/WasteTransportationGroupModel';
import { WasteBagTreatmentGroupModelAttributes } from '../../infrastructure/database/models/WasteBagTreatmentGroupModel';
import { WasteClassificationAttributes } from '../../infrastructure/database/models/WasteClassificationModel';
import { WasteSourceAttributes } from '../../infrastructure/database/models/WasteSourceModel';
import { WasteTreatmentExternalGroupModelAttributes } from '../../infrastructure/database/models/WasteTreatmentExternalGroupModel';
import { WasteTransportationExternalGroupAttributes } from '../../infrastructure/database/models/WasteTransportationExternalGroupModel';
export default class WasteBag {
    public id?: number;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt?: Date;
    public updatedBy?: string;
    public wasteBagQrCodeId?: string;
    public healthcareFacilityId: number;
    public wasteSourceId: number;
    public wasteClassificationId: number;
    public sourceTreatmentGroupId?: string;
    public scaleMethod: 'MANUAL' | 'IOT';
    public assetId?: number;
    public weightInKgs?: number;
    public storageStartTimestamp?: Date;
    public scheduledStorageEndDatetime?: Date;
    public actualStorageEndDatetime?: Date;
    public maxStorageHours?: number;
    public minimumStorageHours?: number;
    public wasteTreatmentGroupId?: number;
    public wasteTransportationGroupId?: number;
    public wasteTreatmentExternalGroupId?: number;
    public wasteTransportationExternalGroupId?: number;
    public wasteStatus:
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'READY_FOR_TRANSPORT'
        | 'TRANSPORTATION_REQUEST_CREATED'
        | 'IN_TRANSIT'
        | 'HANDOVER_TO_TREATMENT'
        | 'READY_FOR_TREATMENT'
        | 'IN_THIRD_PARTY_STORAGE'
        | 'RECYCLED'
        | 'LANDFILLED'
        | 'COLLECTED'
        | 'DISPOSED';
    public wasteStatusUpdatedAt?: Date;
    public wasteStatusUpdatedBy?: string;
    public transportationStatus: 'REQUESTED' | 'IN_TRANSIT' | 'HANDED_OVER' | undefined;
    public transportationStatusUpdatedAt?: Date;
    public transportationStatusUpdatedBy?: string;
    public ownedBy: 'HEALTHCARE_FACILITY' | 'TRANSPORTER' | 'THIRD_PARTY';
    public transporterId?: number;
    public thirdPartyId?: number;
    public isTreated: boolean;
    public isDisposed: boolean;
    public binNumber?: string;
    public iotMethod?: 'BLUETOOTH' | 'INTERNET';
    public manifestDocNumber?: string;
    public manifestDocPath?: string;
    public treatmentStartTime?: Date;
    public treatmentEndTime?: Date;
    public wasteGroupIds?: string;
    public treatmentLocationId?: number;
    public healthcareFacilityName?: string;
    public transporterName?: string;
    public thirdPartyName?: string;
    public bastNo?: string;
    public materialIds?: string;
    public readonly wasteSource?: WasteSourceAttributes;
    public readonly transportationGroup?: WasteTransportationGroupAttributes;
    public readonly treatmentGroup?: WasteBagTreatmentGroupModelAttributes;
    public readonly treatmentExternalGroup?: WasteTreatmentExternalGroupModelAttributes;
    public readonly transportationExternalGroup?: WasteTransportationExternalGroupAttributes;
    public readonly wasteClassification?: WasteClassificationAttributes;
    public readonly logHistory?: any;
    public readonly processWastebagEnd?: string[];

    constructor(wasteBag: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        wasteBagQrCodeId?: string;
        healthcareFacilityId: number;
        wasteSourceId: number;
        wasteClassificationId: number;
        sourceTreatmentGroupId?: string;
        scaleMethod: 'MANUAL' | 'IOT';
        assetId?: number;
        weightInKgs?: number;
        storageStartTimestamp?: Date;
        scheduledStorageEndDatetime?: Date;
        actualStorageEndDatetime?: Date;
        maxStorageHours?: number;
        minimumStorageHours?: number;
        wasteTreatmentGroupId?: number;
        wasteTransportationGroupId?: number;
        wasteTreatmentExternalGroupId?: number;
        wasteTransportationExternalGroupId?: number;
        wasteStatus:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'HANDOVER_TO_TREATMENT'
            | 'READY_FOR_TREATMENT'
            | 'IN_THIRD_PARTY_STORAGE'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED';
        wasteStatusUpdatedAt?: Date;
        wasteStatusUpdatedBy?: string;
        transportationStatus?: 'REQUESTED' | 'IN_TRANSIT' | 'HANDED_OVER';
        transportationStatusUpdatedAt?: Date;
        transportationStatusUpdatedBy?: string;
        ownedBy: 'HEALTHCARE_FACILITY' | 'TRANSPORTER' | 'THIRD_PARTY';
        transporterId?: number;
        thirdPartyId?: number;
        isTreated: boolean;
        isDisposed: boolean;
        binNumber?: string;
        iotMethod?: 'BLUETOOTH' | 'INTERNET';
        manifestDocNumber?: string;
        manifestDocPath?: string;
        treatmentStartTime?: Date;
        treatmentEndTime?: Date;
        wasteGroupIds?: string;
        treatmentLocationId?: number;
        healthcareFacilityName?: string;
        transporterName?: string;
        thirdPartyName?: string;
        bastNo?: string;
        materialIds?: string;
        wasteSource?: WasteSourceAttributes;
        transportationGroup?: WasteTransportationGroupAttributes;
        treatmentGroup?: WasteBagTreatmentGroupModelAttributes;
        treatmentExternalGroup?: WasteTreatmentExternalGroupModelAttributes;
        transportationExternalGroup?: WasteTransportationExternalGroupAttributes;
        wasteClassification?: WasteClassificationAttributes;
        logHistory?: any;
        processWastebagEnd?: string[];
    }) {
        this.id = wasteBag.id;
        this.createdAt = wasteBag.createdAt;
        this.createdBy = wasteBag.createdBy;
        this.updatedAt = wasteBag.updatedAt;
        this.updatedBy = wasteBag.updatedBy;
        this.wasteBagQrCodeId = wasteBag.wasteBagQrCodeId;
        this.healthcareFacilityId = wasteBag.healthcareFacilityId;
        this.wasteSourceId = wasteBag.wasteSourceId;
        this.wasteClassificationId = wasteBag.wasteClassificationId;
        this.sourceTreatmentGroupId = wasteBag.sourceTreatmentGroupId;
        this.scaleMethod = wasteBag.scaleMethod;
        this.assetId = wasteBag.assetId;
        this.weightInKgs = wasteBag.weightInKgs;
        this.storageStartTimestamp = wasteBag.storageStartTimestamp;
        this.scheduledStorageEndDatetime = wasteBag.scheduledStorageEndDatetime;
        this.actualStorageEndDatetime = wasteBag.actualStorageEndDatetime;
        this.maxStorageHours = wasteBag.maxStorageHours;
        this.minimumStorageHours = wasteBag.minimumStorageHours;
        this.wasteTreatmentGroupId = wasteBag.wasteTreatmentGroupId;
        this.wasteTransportationGroupId = wasteBag.wasteTransportationGroupId;
        this.wasteTransportationExternalGroupId = wasteBag.wasteTransportationExternalGroupId;
        this.wasteTreatmentExternalGroupId = wasteBag.wasteTreatmentExternalGroupId;
        this.wasteStatus = wasteBag.wasteStatus;
        this.wasteStatusUpdatedAt = wasteBag.wasteStatusUpdatedAt;
        this.wasteStatusUpdatedBy = wasteBag.wasteStatusUpdatedBy;
        this.transportationStatus = wasteBag.transportationStatus;
        this.transportationStatusUpdatedAt = wasteBag.transportationStatusUpdatedAt;
        this.transportationStatusUpdatedBy = wasteBag.transportationStatusUpdatedBy;
        this.ownedBy = wasteBag.ownedBy;
        this.transporterId = wasteBag.transporterId;
        this.thirdPartyId = wasteBag.thirdPartyId;
        this.isTreated = wasteBag.isTreated;
        this.isDisposed = wasteBag.isDisposed;
        this.binNumber = wasteBag.binNumber;
        this.iotMethod = wasteBag.iotMethod;
        this.manifestDocNumber = wasteBag.manifestDocNumber;
        this.manifestDocPath = wasteBag.manifestDocPath;
        this.treatmentStartTime = wasteBag.treatmentStartTime;
        this.treatmentEndTime = wasteBag.treatmentEndTime;
        this.wasteGroupIds = wasteBag.wasteGroupIds;
        this.treatmentLocationId = wasteBag.treatmentLocationId;
        this.healthcareFacilityName = wasteBag.healthcareFacilityName;
        this.transporterName = wasteBag.transporterName;
        this.thirdPartyName = wasteBag.thirdPartyName;
        this.bastNo = wasteBag.bastNo;
        this.materialIds = wasteBag.materialIds;
        this.wasteSource = wasteBag.wasteSource;
        this.transportationGroup = wasteBag.transportationGroup;
        this.treatmentGroup = wasteBag.treatmentGroup;
        this.treatmentExternalGroup = wasteBag.treatmentExternalGroup;
        this.transportationExternalGroup = wasteBag.transportationExternalGroup;
        this.wasteClassification = wasteBag.wasteClassification;
        this.logHistory = wasteBag.logHistory;
        this.processWastebagEnd = wasteBag.processWastebagEnd;
    }
}

export class WasteBagClassification {
    public id: number;
    public useColdStorage: boolean;
    public coldStorageMaxHours: number;
    public coldStorageMinHours: number;
    constructor(wasteBag: {
        id: number;
        useColdStorage: boolean;
        coldStorageMaxHours: number;
        coldStorageMinHours: number;
    }) {
        (this.id = wasteBag.id),
            (this.useColdStorage = wasteBag.useColdStorage),
            (this.coldStorageMaxHours = wasteBag.coldStorageMaxHours),
            (this.coldStorageMinHours = wasteBag.coldStorageMinHours);
    }
}

export const WASTE_STATUS_LABEL = {
  id: `
    CASE wb.waste_status
      WHEN 'IN_TEMPORARY_STORAGE' THEN 'Tersimpan'
      WHEN 'IN_COLD_STORAGE' THEN 'Penyimpanan Dingin'
      WHEN 'INTERNAL_LANDFILLED' THEN 'Ditimbus Internal'
      WHEN 'INCINERATED' THEN 'Diolah Insinerasi Internal'
      WHEN 'INCINERATION_IN_PROCESS' THEN 'Dalam Proses Insinerasi'
      WHEN 'STERILISED' THEN 'Diolah Autoklaf Internal'
      WHEN 'STERILIZATION_IN_PROCESS' THEN 'Sterilisasi / Disinfeksi'
      WHEN 'READY_FOR_TRANSPORT' THEN 'Siap Diangkut'
      WHEN 'TRANSPORTATION_REQUEST_CREATED' THEN 'Diserahkan ke Pengangkut'
      WHEN 'IN_TRANSIT' THEN 'Diangkut'
      WHEN 'HANDOVER_TO_TREATMENT' THEN CONCAT(
        'Diserahkan ke ',
        CASE p.provider_type
          WHEN 'TRANSPORTER_RECYCLER' THEN 'Pemanfaat'
          WHEN 'TRANSPORTER_LANDFILL' THEN 'Penimbus'
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Pengolah'
          ELSE COALESCE(p.provider_type, '-')
        END
      )
      WHEN 'READY_FOR_TREATMENT' THEN CONCAT(
        'Diterima ',
        CASE p.provider_type
          WHEN 'TRANSPORTER_RECYCLER' THEN 'Pemanfaat'
          WHEN 'TRANSPORTER_LANDFILL' THEN 'Penimbus'
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Pengolah'
          ELSE COALESCE(p.provider_type, '-')
        END
      )
      WHEN 'RECYCLED' THEN
        CASE p.provider_type
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Residu'
          ELSE 'Diterima Pemanfaat'
        END
      WHEN 'LANDFILLED' THEN
        CASE p.provider_type
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Residu'
          ELSE 'Ditimbus'
        END
      WHEN 'COLLECTED' THEN 'Pengangkutan Khusus'
      WHEN 'DISPOSED' THEN 'Pembuangan Sampah'
      ELSE wb.waste_status
    END
  `,

  en: `
    CASE wb.waste_status
      WHEN 'IN_TEMPORARY_STORAGE' THEN 'In Temporary Storage'
      WHEN 'IN_COLD_STORAGE' THEN 'In Cold Storage'
      WHEN 'INTERNAL_LANDFILLED' THEN 'Internal Landfilled'
      WHEN 'INCINERATED' THEN 'Incinerated'
      WHEN 'INCINERATION_IN_PROCESS' THEN 'Incineration In Process'
      WHEN 'STERILISED' THEN 'Sterilized'
      WHEN 'STERILIZATION_IN_PROCESS' THEN 'Sterilization In Process'
      WHEN 'READY_FOR_TRANSPORT' THEN 'Ready For Transport'
      WHEN 'TRANSPORTATION_REQUEST_CREATED' THEN 'Transportation Request Created'
      WHEN 'IN_TRANSIT' THEN 'In Transit'
      WHEN 'HANDOVER_TO_TREATMENT' THEN CONCAT(
        'Handover To ',
        CASE p.provider_type
          WHEN 'TRANSPORTER_RECYCLER' THEN 'Recycler'
          WHEN 'TRANSPORTER_LANDFILL' THEN 'Landfiller'
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Treatment Provider'
          ELSE COALESCE(p.provider_type, '-')
        END
      )
      WHEN 'READY_FOR_TREATMENT' THEN CONCAT(
        'Ready For ',
        CASE p.provider_type
          WHEN 'TRANSPORTER_RECYCLER' THEN 'Recycler'
          WHEN 'TRANSPORTER_LANDFILL' THEN 'Landfiller'
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Treatment Provider'
          ELSE COALESCE(p.provider_type, '-')
        END
      )
      WHEN 'RECYCLED' THEN
        CASE p.provider_type
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Residue'
          ELSE 'Recycled'
        END
      WHEN 'LANDFILLED' THEN
        CASE p.provider_type
          WHEN 'TRANSPORTER_TREATMENT' THEN 'Residue'
          ELSE 'Landfilled'
        END
      WHEN 'COLLECTED' THEN 'Collected'
      WHEN 'DISPOSED' THEN 'Disposed'
      ELSE wb.waste_status
    END
  `,
};

