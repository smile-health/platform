import { Account } from './account'
import { Activity } from './activity'
import { AnalysisParameter } from './analysis-parameter'
import { AnnualCommitment } from './annual-commitment'
import { AnnualPlanningProcess } from './annual-planning-process'
import { AnnualPlanningSubstitution } from './annual-planning-substitution'
import { AnnualPlanningTargetGroup } from './annual-planning-target-group'
import { Asset } from './asset'
import { AssetInventory } from './asset-inventory'
import { AssetManagement } from './asset-management'
import { AssetType } from './asset-type'
import { AssetVendor } from './asset-vendor'
import { BmhpHistory } from './bmhp-history'
import { BudgetSource } from './budget-source'
import { ColdchainEquipment } from './coldchain-equipment'
import { CommunicationProvider } from './communication-provider'
import { Dashboard } from './dashboard'
import { Disposal } from './disposal'
import { DisposalInstruction } from './disposal-instruction'
import { Entities } from './entity'
import { EnvironmentalHealthHistory } from './environmental-health-history'
import { GlobalAsset } from './global-asset'
import { Manufacturers } from './manufacturer'
import { MasterBmhp } from './master-bmhp'
import { MasterJenisPemeriksaan } from './master-jenis-pemeriksaan'
import { MasterMethod } from './master-method'
import { MasterParameter } from './master-parameter'
import { MasterPemeriksaan } from './master-pemeriksaan'
import { Material } from './material'
import { MaterialVolumeManagement } from './material-volume-management'
import { Menu } from './menu'
import { ModelAsset } from './model-asset'
import { MonitoringDeviceInventory } from './monitoring-device-inventory'
import { Notification } from './notification'
import { Orders } from './orders'
import { ParameterCategory } from './parameter-category'
import { Patients } from './patient'
import { PeriodOfStockTaking } from './period-of-stock-taking'
import { Populations } from './population'
import { Pqs } from './pqs'
import { Program } from './program'
import { ProgramPlan } from './program-plan'
import { ProgramPlanMaterialRatio } from './program-plan-material-ratio'
import { Protocol } from './protocol'
import { Reconciliations } from './reconciliation'
import { Report } from './report'
import { SelfDisposal } from './self-disposal'
import { StockOpnames } from './stock-opnames'
import { Stocks } from './stocks'
import { StorageTemperatureMonitoring } from './storage-temperature-monitoring'
import { Task } from './task'
import { TestMethod } from './test-method'
import { TicketingSystem } from './ticketing-system'
import { Transactions } from './transactions'
import { Users } from './users'

export type FeatureName =
  | AnalysisParameter
  | Entities
  | Task
  | Populations
  | Patients
  | Users
  | Material
  | Manufacturers
  | MasterJenisPemeriksaan
  | MasterMethod
  | MasterParameter
  | MasterPemeriksaan
  | Orders
  | ParameterCategory
  | TestMethod
  | Transactions
  | Stocks
  | StockOpnames
  | TicketingSystem
  | Reconciliations
  | BudgetSource
  | Activity
  | Menu
  | Program
  | ProgramPlan
  | Dashboard
  | Disposal
  | Asset
  | AssetInventory
  | Notification
  | ModelAsset
  | PeriodOfStockTaking
  | AssetVendor
  | AssetType
  | Report
  | Account
  | MaterialVolumeManagement
  | AssetManagement
  | CommunicationProvider
  | ColdchainEquipment
  | SelfDisposal
  | DisposalInstruction
  | Pqs
  | MonitoringDeviceInventory
  | StorageTemperatureMonitoring
  | Protocol
  | AnnualPlanningTargetGroup
  | AnnualPlanningSubstitution
  | AnnualPlanningProcess
  | ProgramPlanMaterialRatio
  | AnnualCommitment
  | MasterBmhp
  | BmhpHistory
  | GlobalAsset
  | EnvironmentalHealthHistory
