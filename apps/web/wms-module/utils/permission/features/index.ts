import { About } from './about';
import { AssetType } from './asset-type';
import { Bast } from './bast';
import { BudgetSource } from './budget-source';
import { Distance } from './distance';
import { Entity } from './entity';
import { Healthcare } from './healthcare';
import { HealthcareAsset } from './healthcare-asset';
import { HealthcarePartner } from './healthcare-partner';
import { HealthcareStorageLocation } from './healthcare-storage-location';
import { Homepage } from './home';
import { Logbook } from './logbook';
import { ManualScale } from './manual-scale';
import { Manufacture } from './manufacture';
import { Partnership } from './partnership';
import { PrintLabel } from './print-label';
import { ThirdpartyPartner } from './thirdparty-partner';
import { WasteTracking } from './tracking';
import { WasteTransaction } from './transaction';
import { TransportVehicle } from './transport-vehicle';
import { TreatmentLocation } from './treatment-location';
import { UserActivity } from './user-activity';
import { UserOperator } from './user-operator';
import { WasteHierarchy } from './waste-hierarchy';
import { WasteSource } from './waste-source';
import { WasteSpecification } from './waste-specification';
import { LogisticKesling } from './logistic-kesling';
import { TransactionMonitoring } from './transaction-monitoring';
import { UserSetting } from './user-setting';
import { AssetDongle } from './asset-dongle';

export type FeatureName =
  | Healthcare
  | HealthcareAsset
  | Manufacture
  | AssetType
  | BudgetSource
  | WasteHierarchy
  | WasteSpecification
  | Distance
  | Entity
  | About
  | WasteSource
  | PrintLabel
  | Partnership
  | HealthcareStorageLocation
  | HealthcarePartner
  | ThirdpartyPartner
  | TreatmentLocation
  | TransportVehicle
  | UserOperator
  | WasteTransaction
  | WasteTracking
  | Homepage
  | Logbook
  | ManualScale
  | Bast
  | UserActivity
  | LogisticKesling
  | TransactionMonitoring
  | UserSetting
  | AssetDongle;
