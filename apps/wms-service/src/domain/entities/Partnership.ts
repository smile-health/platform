export default class PartnershipDTO {
    public id: number | undefined;
    public contractId?: string;
    public contractStartDate?: Date;
    public contractEndDate?: Date;
    public consumerId: number;
    public consumerType:
        | 'HEALTHCARE_FACILITY'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER';
    public wasteClassificationId?: number;
    public providerId: number;
    public providerType:
        | 'LANDFILLER'
        | 'TREATMENT_PROVIDER'
        | 'RECYCLER'
        | 'TREATMENT'
        | 'SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
    public partnershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
    public hasIncinerator: boolean;
    public hasAutoclave: boolean;
    public picName?: string;
    public picPosition?: string;
    public picPhoneNumber?: string;
    public pricePerKg?: number;
    public consumerDetail?: any;
    public providerDetail?: any;
    public createdBy?: string;
    public updatedBy?: string;
    public createdAt?: Date;
    public updatedAt?: Date;
    public treatmentCompanyName?: string;
    public landfilCompanyName?: string;
    public recycleCompanyName?: string;
    public providerName?: string;
    public consumerName?: string;
    public consumerProvinceName?: string;
    public consumerCityName?: string;
    public transporterId?: number | null;
    public wasteClassification: any | undefined;
    public nib?: string;

    constructor(partnership: {
        id?: number;
        contractId?: string;
        contractStartDate?: Date;
        contractEndDate?: Date;
        consumerId: number;
        consumerType:
            | 'HEALTHCARE_FACILITY'
            | 'TRANSPORTER'
            | 'TRANSPORTER_RECYCLER'
            | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
            | 'TRANSPORTER_LANDFILL'
            | 'TRANSPORTER_TREATMENT'
            | 'TRANSPORTER_TREATMENT_PROVIDER';
        wasteClassificationId?: number;
        providerId: number;
        providerType:
            | 'LANDFILLER'
            | 'TREATMENT_PROVIDER'
            | 'RECYCLER'
            | 'TREATMENT'
            | 'SPECIALIZED_TREATMENT_PROVIDER'
            | 'TRANSPORTER'
            | 'TRANSPORTER_RECYCLER'
            | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
            | 'TRANSPORTER_LANDFILL'
            | 'TRANSPORTER_TREATMENT'
            | 'TRANSPORTER_TREATMENT_PROVIDER'
            | 'TRANSPORTER_TREATMENT'
            | 'TRANSPORTER_GOVERNMENT'
            | 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
        partnershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
        hasIncinerator: boolean;
        hasAutoclave: boolean;
        picName?: string;
        picPosition?: string;
        picPhoneNumber?: string;
        pricePerKg?: number;
        consumerDetail?: any;
        providerDetail?: any;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: Date;
        updatedAt?: Date;
        treatmentCompanyName?: string;
        landfilCompanyName?: string;
        recycleCompanyName?: string;
        providerName?: string;
        consumerName?: string;
        consumerProvinceName?: string;
        consumerCityName?: string;
        transporterId?: number | null;
        wasteClassification?: any;
        nib?: string;
    }) {
        this.id = partnership.id ?? undefined;
        this.contractId = partnership.contractId;
        this.contractStartDate = partnership.contractStartDate;
        this.contractEndDate = partnership.contractEndDate;
        this.consumerId = partnership.consumerId;
        this.consumerType = partnership.consumerType;
        this.wasteClassificationId = partnership.wasteClassificationId;
        this.providerId = partnership.providerId;
        this.providerType = partnership.providerType;
        this.partnershipStatus = partnership.partnershipStatus;
        this.hasIncinerator = partnership.hasIncinerator;
        this.hasAutoclave = partnership.hasAutoclave;
        this.picName = partnership.picName;
        this.picPosition = partnership.picPosition;
        this.picPhoneNumber = partnership.picPhoneNumber;
        this.pricePerKg = partnership.pricePerKg;
        this.consumerDetail = partnership.consumerDetail;
        this.providerDetail = partnership.providerDetail;
        this.createdBy = partnership.createdBy;
        this.updatedBy = partnership.updatedBy;
        this.createdAt = partnership.createdAt;
        this.updatedAt = partnership.updatedAt;
        this.treatmentCompanyName = partnership.treatmentCompanyName;
        this.landfilCompanyName = partnership.landfilCompanyName;
        this.recycleCompanyName = partnership.recycleCompanyName;
        this.providerName = partnership.providerName;
        this.consumerName = partnership.consumerName;
        this.consumerProvinceName = partnership.consumerProvinceName;
        this.consumerCityName = partnership.consumerCityName;
        this.transporterId = partnership.transporterId;
        this.wasteClassification = partnership.wasteClassification;
        this.nib = partnership.nib;
    }
}

export class HealthcareSelectDTO {
    public id: number;
    public consumerId: number;
    public consumerName?: string;

    constructor(partnership: { id: number; consumerId: number; consumerName?: string }) {
        this.id = partnership.id;
        this.consumerId = partnership.consumerId;
        this.consumerName = partnership.consumerName;
    }
}

export class PartnershipSelectDTO {
    public id: number;
    public providerId: number;
    public providerName?: string;

    constructor(partnership: { id: number; providerId: number; providerName?: string }) {
        this.id = partnership.id;
        this.providerId = partnership.providerId;
        this.providerName = partnership.providerName;
    }
}

export class WasteClassificationSelectDTO {
    public id: number;
    public wasteClassificationId: number;
    public wasteCharacteristicName?: string;
    public providerType: string;
    public contractStartDate: string;
    public contractEndDate: string;
    public contractId: string;
    public wasteCode?: string;

    constructor(partnership: {
        id: number;
        wasteClassificationId: number;
        wasteCharacteristicName: string;
        providerType: string;
        contractStartDate: string;
        contractEndDate: string;
        contractId: string;
        wasteCode?: string;
    }) {
        this.id = partnership.id;
        this.wasteClassificationId = partnership.wasteClassificationId;
        this.wasteCharacteristicName = partnership.wasteCharacteristicName;
        this.providerType = partnership.providerType;
        this.contractStartDate = partnership.contractStartDate;
        this.contractEndDate = partnership.contractEndDate;
        this.contractId = partnership.contractId;
        this.wasteCode = partnership.wasteCode;
    }
}

export class PartnershipWasteClassification {
    public wasteClassificationId: number;
    public wasteCharacteristicsName: string;
    public wasteCode?: string;
    public price: number;

    constructor(partnership: {
        wasteClassificationId: number;
        wasteCharacteristicsName: string;
        wasteCode: string;
        price: number;
    }) {
        this.wasteClassificationId = partnership.wasteClassificationId;
        this.wasteCharacteristicsName = partnership.wasteCharacteristicsName;
        this.wasteCode = partnership.wasteCode;
        this.price = partnership.price;
    }
}
