export class WasteBagLogBook {
  public wasteGroupId: number;
  public wasteGroupNumber?: string;
  public totalBagsCount?: number;
  public totalWeight?: number;
  public transporterOperatorId?: number;
  public vehicleNumber?: string;
  public providerId?: number;
  public thirdPartyName?: string;
  public operatorName?: string;
  public pickupTime?: Date;
  public dropTime?: Date;
  public processTime?: Date;
  public landfillTime?: Date;
  public recycleTime?: Date;

  constructor(wasteBag: {
    wasteGroupId: number;
    wasteGroupNumber?: string;
    totalBagsCount?: number;
    totalWeight?: number;
    transporterOperatorId?: number;
    vehicleNumber?: string;
    providerId?: number;
    thirdPartyName?: string;
    operatorName?: string;
    pickupTime?: Date;
    dropTime?: Date;
    processTime?: Date;
    landfillTime?: Date;
    recycleTime?: Date;
  }) {
    this.wasteGroupId = wasteBag.wasteGroupId;
    this.wasteGroupNumber = wasteBag.wasteGroupNumber;
    this.totalBagsCount = wasteBag.totalBagsCount;
    this.totalWeight = wasteBag.totalWeight;
    this.transporterOperatorId = wasteBag.transporterOperatorId;
    this.vehicleNumber = wasteBag.vehicleNumber;
    this.providerId = wasteBag.providerId;
    this.thirdPartyName = wasteBag.thirdPartyName;
    this.operatorName = wasteBag.operatorName;
    this.pickupTime = wasteBag.pickupTime;
    this.dropTime = wasteBag.dropTime;
    this.processTime = wasteBag.processTime;
    this.landfillTime = wasteBag.landfillTime;
    this.recycleTime = wasteBag.recycleTime;
  }
}

export class WasteGroupDetails {
  public wasteQrCode?: string;
  public wasteTypeName?: number;
  public wasteGroupName?: number;
  public wasteCharacteristicsName?: number;
  public wasteWeight?: number;

  constructor(wasteBag: {
    wasteQrCode?: string;
    wasteTypeName?: number;
    wasteGroupName?: number;
    wasteCharacteristicsName?: number;
    wasteWeight?: number;
  }) {
    this.wasteQrCode = wasteBag.wasteQrCode;
    this.wasteTypeName = wasteBag.wasteTypeName;
    this.wasteGroupName = wasteBag.wasteGroupName;
    this.wasteCharacteristicsName = wasteBag.wasteCharacteristicsName;
    this.wasteWeight = wasteBag.wasteWeight;
  }
}
