import account from '#pages/locales/ar/account'
import activity from '#pages/locales/ar/activity'
import task from '#pages/locales/ar/annual-planning-task'
import asset from '#pages/locales/ar/asset'
import assetInventory from '#pages/locales/ar/asset-inventory'
import budgetSource from '#pages/locales/ar/budget-source'
import dashboard from '#pages/locales/ar/dashboard'
import dashboardAnnualCommitmentVsRealization from '#pages/locales/ar/dashboard/dashboard-annual-commitment-vs-realization'
import dashboardAssetOwnershipInventory from '#pages/locales/ar/dashboard/dashboard-asset-ownership-inventory'
import dashboardColdStorageCapacity from '#pages/locales/ar/dashboard/dashboard-cold-storage-capacity'
import dashboardDiscard from '#pages/locales/ar/dashboard/dashboard-discard'
import dashboardDownload from '#pages/locales/ar/dashboard/dashboard-download-file'
import dashboardInventory from '#pages/locales/ar/dashboard/dashboard-inventory'
import dashboardInventoryOverview from '#pages/locales/ar/dashboard/dashboard-inventory-overview'
import dashboardMicroplanning from '#pages/locales/ar/dashboard/dashboard-microplanning'
import dashboardOrder from '#pages/locales/ar/dashboard/dashboard-order'
import dashboardReport from '#pages/locales/ar/dashboard/dashboard-report'
import dashboardStock from '#pages/locales/ar/dashboard/dashboard-stock'
import dashboardStockTaking from '#pages/locales/ar/dashboard/dashboard-stock-taking'
import dashboardAssetTemperatureMonitoring from '#pages/locales/ar/dashboard/dashboard-temperature-monitoring'
import dashboardMonitoringTransactions from '#pages/locales/ar/dashboard/dashboard-transaction-monitoring'
import entity from '#pages/locales/ar/entity'
import entityMaterialBulk from '#pages/locales/ar/entity-material-bulk'
import forgot from '#pages/locales/ar/forgot-password'
import population from '#pages/locales/ar/global-settings/population'
import stock from '#pages/locales/ar/inventory/stock'
import login from '#pages/locales/ar/login'
import manufacturer from '#pages/locales/ar/manufacturer'
import material from '#pages/locales/ar/material'
import materialVolume from '#pages/locales/ar/material-volume-management'
import order from '#pages/locales/ar/order'
import orderCreate from '#pages/locales/ar/order/OrderCreate'
import orderCentralDistribution from '#pages/locales/ar/order/OrderCreateCentralDistribution'
import orderDistribution from '#pages/locales/ar/order/OrderCreateDistribution'
import orderCreateRelocation from '#pages/locales/ar/order/OrderCreateRelocation'
import orderCreateReturn from '#pages/locales/ar/order/OrderCreateReturn'
import orderDetail from '#pages/locales/ar/order/OrderDetail'
import orderList from '#pages/locales/ar/order/OrderList'
import periodOfStockTaking from '#pages/locales/ar/period-of-stock-taking'
import program from '#pages/locales/ar/program'
import programPlan from '#pages/locales/ar/program-plan'
import reconciliation from '#pages/locales/ar/reconciliation'
import reconciliationDetail from '#pages/locales/ar/reconciliation/ReconciliationDetail'
import reconciliationReport from '#pages/locales/ar/report/reconciliation'
import stockBook from '#pages/locales/ar/report/stock-book'
import userActivity from '#pages/locales/ar/report/user-activity'
import stockOpname from '#pages/locales/ar/stock-opname'
import user from '#pages/locales/ar/user'

import navbar from '../../components/navbar/locales/ar.json'
import annualCommitmentDetail from '../../pages/annual-commitment/detail/locales/ar.json'
import annualCommitmentForm from '../../pages/annual-commitment/form/locales/ar.json'
import annualCommitmentList from '../../pages/annual-commitment/list/locales/ar.json'
import annualPlanningProcess from '../../pages/annual-planning-process/locales/ar.json'
import annualPlanningSubstitution from '../../pages/annual-planning-substitution/locales/ar.json'
import annualPlanningTargetGroup from '../../pages/annual-planning-target-group/locales/ar.json'
import assetManagements from '../../pages/asset-managements/locales/ar.json'
import monitoringDeviceInventory from '../../pages/asset-managements/monitoring-device-inventory/locales/ar.json'
import monitoringDeviceInventoryDetail from '../../pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryDetail/locales/ar.json'
import monitoringDeviceInventoryForm from '../../pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryForm/locales/ar.json'
import monitoringDeviceInventoryList from '../../pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryList/locales/ar.json'
import storageTemperatureMonitoring from '../../pages/asset-managements/storage-temperature-monitoring/locales/ar.json'
import storageTemperatureMonitoringDetail from '../../pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringDetail/locales/ar.json'
import storageTemperatureMonitoringList from '../../pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringList/locales/ar.json'
import assetType from '../../pages/asset-type/locales/ar.json'
import assetVendor from '../../pages/asset-vendor/locales/ar.json'
import auditTrail from '../../pages/audit-trail/locales/ar.json'
import coldStorageCapacity from '../../pages/cold-storage-capacity/locales/ar.json'
import exportHistory from '../../pages/export-history/locales/ar.json'
import programGlobalSettings from '../../pages/global-settings/program/locales/ar.json'
import modelAsset from '../../pages/model-asset-management/locales/ar.json'
import notification from '../../pages/notification/locales/ar.json'
import pqs from '../../pages/pqs/locales/ar.json'
import programPlanMaterialRatio from '../../pages/program-plan-material-ratio/locales/ar.json'
import protocol from '../../pages/protocol/locales/ar.json'
import lplpo from '../../pages/report/lplpo/locales/ar.json'
import stockOpnameCreate from '../../pages/stock-opname/create/locales/ar.json'
import transaction from '../../pages/transaction/locales/ar.json'
import transactionCreate from '../../pages/transaction/TransactionCreate/locales/ar.json'
import transactionCreateAddStock from '../../pages/transaction/TransactionCreate/TransactionAddStock/locales/ar.json'
import transactionCreateConsumption from '../../pages/transaction/TransactionCreate/TransactionConsumption/locales/ar.json'
import transactionList from '../../pages/transaction/TransactionList/locales/ar.json'
import common from './common.json'

export default {
  account,
  annualCommitmentDetail,
  annualCommitmentForm,
  annualCommitmentList,
  annualPlanningTargetGroup,
  annualPlanningSubstitution,
  annualPlanningProcess,
  asset,
  assetType,
  assetInventory,
  assetVendor,
  common,
  activity,
  manufacturer,
  user,
  entity,
  material,
  materialVolume,
  navbar,
  login,
  budgetSource,
  pqs,
  entityMaterialBulk,
  forgot,
  order,
  orderList,
  orderDetail,
  orderCreate,
  orderCreateRelocation,
  orderDistribution,
  orderCreateReturn,
  orderCentralDistribution,
  periodOfStockTaking,
  program,
  programPlan,
  programPlanMaterialRatio,
  stock,
  stockOpname,
  transaction,
  transactionCreate,
  transactionList,
  transactionCreateAddStock,
  stockOpnameCreate,
  reconciliation,
  reconciliationDetail,
  reconciliationReport,
  transactionCreateConsumption,
  programGlobalSettings,
  notification,
  dashboard,
  dashboardDownload,
  dashboardMicroplanning,
  dashboardMonitoringTransactions,
  dashboardAssetOwnershipInventory,
  dashboardAssetTemperatureMonitoring,
  dashboardStock,
  dashboardStockTaking,
  dashboardOrder,
  dashboardInventory,
  dashboardDiscard,
  dashboardReport,
  dashboardInventoryOverview,
  dashboardAnnualCommitmentVsRealization,
  dashboardColdStorageCapacity,
  assetManagements,
  modelAsset,
  userActivity,
  stockBook,
  exportHistory,
  monitoringDeviceInventory,
  monitoringDeviceInventoryDetail,
  monitoringDeviceInventoryForm,
  monitoringDeviceInventoryList,
  storageTemperatureMonitoring,
  storageTemperatureMonitoringDetail,
  storageTemperatureMonitoringList,
  protocol,
  coldStorageCapacity,
  population,
  task,
  lplpo,
  auditTrail,
}
