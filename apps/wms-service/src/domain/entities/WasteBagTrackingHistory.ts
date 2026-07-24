export class WasteBagSummaryByCharacteristics {
  public wasteCharacteristicsName?: string;
  public wasteCharacteristicsNameEn?: string;
  public wasteStatus?: string;
  public totalWeight?: number;
  public totalWeightInKgs?: number;
  public totalWasteBag?: number;
  public avgWasteBagPerDay?: number;
  public wasteTypeName?: string;
  public wasteGroupName?: string;
  public manualWeightInKgs?: number;
  public manualWasteBagCount?: number;
  public iotWeightInKgs?: number;
  public iotWasteBagCount?: number;
  public healthcareFacilityName?: string;

  constructor(wasteBag: {
    wasteCharacteristicsName?: string;
    wasteCharacteristicsNameEn?: string;
    wasteStatus?: string;
    totalWeight?: number;
    totalWeightInKgs?: number;
    totalWasteBag?: number;
    avgWasteBagPerDay?: number;
    wasteGroupName?: string;
    wasteTypeName?: string;
    manualWeightInKgs?: number;
    manualWasteBagCount?: number;
    iotWeightInKgs?: number;
    iotWasteBagCount?: number;
    healthcareFacilityName?: string;
  }) {
    this.wasteCharacteristicsName = wasteBag.wasteCharacteristicsName;
    this.wasteCharacteristicsNameEn = wasteBag.wasteCharacteristicsNameEn;
    this.wasteStatus = wasteBag.wasteStatus;
    this.totalWeight = wasteBag.totalWeight;
    this.totalWeightInKgs = wasteBag.totalWeightInKgs;
    this.totalWasteBag = wasteBag.totalWasteBag;
    this.avgWasteBagPerDay = wasteBag.avgWasteBagPerDay;
    this.wasteTypeName = wasteBag.wasteTypeName;
    this.wasteGroupName = wasteBag.wasteGroupName;
    this.manualWeightInKgs = wasteBag.manualWeightInKgs;
    this.manualWasteBagCount = wasteBag.manualWasteBagCount;
    this.iotWeightInKgs = wasteBag.iotWeightInKgs;
    this.iotWasteBagCount = wasteBag.iotWasteBagCount;
    this.healthcareFacilityName = wasteBag.healthcareFacilityName;
  }
}

export class WasteBagHistory {
  public wasteBagStatusUpdateDate: Date;
  public wasteStatus: string;
  public wasteAction: string;

  constructor(wasteBag: {
    wasteBagStatusUpdateDate: Date;
    wasteStatus: string;
    wasteAction: string;
  }) {
    this.wasteBagStatusUpdateDate = wasteBag.wasteBagStatusUpdateDate;
    this.wasteStatus = wasteBag.wasteStatus;
    this.wasteAction = wasteBag.wasteAction;
  }
}

export class WasteSourceSummary {
  public sourceType?: string;
  public wasteSwasteSourceNametatus?: string;
  public totalWasteBag?: number;
  public totalWeightInKgs?: number;

  constructor(wasteBag: {
    sourceType?: string;
    wasteSwasteSourceNametatus?: string;
    totalWeightInKgs?: number;
    totalWasteBag?: number;
  }) {
    this.sourceType = wasteBag.sourceType;
    this.wasteSwasteSourceNametatus = wasteBag.wasteSwasteSourceNametatus;
    this.totalWeightInKgs = wasteBag.totalWeightInKgs;
    this.totalWasteBag = wasteBag.totalWasteBag;
  }
}
