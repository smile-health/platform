export default class WasteTreatmentExternalGroup {
  public id?: number;
  public createdBy?: string;
  public updatedBy?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public totalBagsCount: number;
  public totalWeightInKgs: number;
  public sourceExternalTransportationGroupId?: number;
  public treatmentProviderId?: number;
  public treatmentOperatorId?: string;
  public transportationStatus:
    | 'STORED_FOR_TREATMENT'
    | 'READY_FOR_TREATMENT'
    | 'INCINERATION_IN_PROCESS'
    | 'STERILIZATION_IN_PROCESS'
    | 'INCINERATED'
    | 'STERILISED'
    | 'LANDFILLED'
    | 'RECYCLED'
    | 'DISPOSED'
    | 'COLLECTED';
  public isReadOnly?: boolean;
  public groupId?: string;
  public wasteBags?: any;
  public wasteType?: any;
  public wasteGroup?: any;
  public wasteCharacteristics?: any[];
  public partnership?: any;
  public vehicle?: any;
  public locationTreatment?: any;
  public consumerName?: string;
  public providerName?: string;
  public transporterOperatorId?: string;
  public transporterVehicleId?: number;
  public transporterVehicleNumber?: string;
  public processWastebagEnd?: string[];

  constructor(data: {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    totalBagsCount: number;
    totalWeightInKgs: number;
    transporterVehicleId?: number;
    transporterOperatorId?: string;
    sourceExternalTransportationGroupId?: number;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    transportationStatus:
      | 'STORED_FOR_TREATMENT'
      | 'READY_FOR_TREATMENT'
      | 'INCINERATION_IN_PROCESS'
      | 'STERILIZATION_IN_PROCESS'
      | 'INCINERATED'
      | 'STERILISED'
      | 'LANDFILLED'
      | 'RECYCLED'
      | 'DISPOSED'
      | 'COLLECTED';
    isReadOnly?: boolean;
    groupId?: string;
    wasteBags?: any;
    wasteType?: any;
    wasteGroup?: any;
    wasteCharacteristics?: any[];
    partnership?: any;
    vehicle?: any;
    locationTreatment?: any;
    consumerName?: string;
    providerName?: string;
    processWastebagEnd?: string[];
    transporterVehicleNumber?: string;
  }) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
    this.updatedAt = data.updatedAt;
    this.updatedBy = data.updatedBy;
    this.totalBagsCount = data.totalBagsCount;
    this.totalWeightInKgs = data.totalWeightInKgs;
    this.treatmentProviderId = data.treatmentProviderId;
    this.treatmentOperatorId = data.treatmentOperatorId;
    this.sourceExternalTransportationGroupId = data.sourceExternalTransportationGroupId;
    this.transportationStatus = data.transportationStatus;
    this.isReadOnly = data.isReadOnly;
    this.groupId = data.groupId;
    this.wasteBags = data.wasteBags;
    this.wasteType = data.wasteType;
    this.wasteGroup = data.wasteGroup;
    this.wasteCharacteristics = data.wasteCharacteristics;
    this.partnership = data.partnership;
    this.vehicle = data.vehicle;
    this.locationTreatment = data.locationTreatment;
    this.providerName = data.providerName;
    this.consumerName = data.consumerName;
    this.processWastebagEnd = data.processWastebagEnd;
    this.transporterOperatorId = data.transporterOperatorId;
    this.transporterVehicleId = data.transporterVehicleId;
    this.transporterVehicleNumber = data.transporterVehicleNumber;
  }
}
