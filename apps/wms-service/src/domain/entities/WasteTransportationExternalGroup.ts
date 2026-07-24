export default class WasteTransportationExternalGroup {
  public id?: number;
  public createdBy?: string;
  public updatedBy?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public totalBagsCount: number;
  public totalWeightInKgs: number;
  public transporterId: number;
  public transporterVehicleId?: number;
  public transporterVehicleNumber?: string;
  public transporterOperatorId?: string;
  public treatmentProviderId?: number;
  public treatmentOperatorId?: string;
  public handoverLattitude?: number;
  public handoverLongitude?: number;
  public transportationStatus:
    | 'READY_FOR_TRANSPORT'
    | 'TRANSPORTATION_REQUEST_CREATED'
    | 'IN_TRANSIT';
  public handoverTimestamp?: Date;
  public isReadOnly?: boolean;
  public groupId?: string;
  public wasteTreatmentExternalGroupId?: number;
  public wasteBags?: any;
  public wasteType?: any;
  public wasteGroup?: any;
  public wasteCharacteristics?: any[];
  public partnership?: any;
  public vehicle?: any;
  public consumerName?: string;
  public providerName?: string;
  public processWastebagEnd?: string[];

  constructor(data: {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    totalBagsCount: number;
    totalWeightInKgs: number;
    transporterId: number;
    transporterVehicleId?: number;
    transporterVehicleNumber?: string;
    transporterOperatorId?: string;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    handoverLattitude?: number;
    handoverLongitude?: number;
    transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED' | 'IN_TRANSIT';
    handoverTimestamp?: Date;
    isReadOnly?: boolean;
    groupId?: string;
    wasteTreatmentExternalGroupId?: number;
    wasteBags?: any;
    wasteType?: any;
    wasteGroup?: any;
    wasteCharacteristics?: any[];
    partnership?: any;
    vehicle?: any;
    consumerName?: string;
    providerName?: string;
    processWastebagEnd?: string[];
  }) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
    this.updatedAt = data.updatedAt;
    this.updatedBy = data.updatedBy;
    this.totalBagsCount = data.totalBagsCount;
    this.totalWeightInKgs = data.totalWeightInKgs;
    this.transporterId = data.transporterId;
    this.transporterVehicleId = data.transporterVehicleId;
    this.transporterVehicleNumber = data.transporterVehicleNumber;
    this.transporterOperatorId = data.transporterOperatorId;
    this.treatmentProviderId = data.treatmentProviderId;
    this.treatmentOperatorId = data.treatmentOperatorId;
    this.handoverLattitude = data.handoverLattitude;
    this.handoverLongitude = data.handoverLongitude;
    this.transportationStatus = data.transportationStatus;
    this.handoverTimestamp = data.handoverTimestamp;
    this.isReadOnly = data.isReadOnly;
    this.groupId = data.groupId;
    this.wasteTreatmentExternalGroupId = data.wasteTreatmentExternalGroupId;
    this.wasteBags = data.wasteBags;
    this.wasteType = data.wasteType;
    this.wasteGroup = data.wasteGroup;
    this.wasteCharacteristics = data.wasteCharacteristics;
    this.partnership = data.partnership;
    this.vehicle = data.vehicle;
    this.providerName = data.providerName;
    this.consumerName = data.consumerName;
    this.processWastebagEnd = data.processWastebagEnd;
  }
}
