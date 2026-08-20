import { featureFlagsMiddleware } from "@smile-health/lib"
import { TransactionManager } from "@smile-health/lib/database.js"
import {
  createRefreshHandler,
  createWebhookHandler,
} from "@smile-health/lib/feature-flags/webhook.js"
import i18n, { loadResources, reloadTranslations } from "@smile-health/lib/i18n.js"
import { RequestMiddleware } from "@smile-health/lib/middlewares/request.middleware.js"
import { TransactionMiddleware } from "@smile-health/lib/middlewares/transaction.middleware.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { Publisher } from "@smile-health/lib/rabbitmq/publisher.js"
import { routeTracer } from "@smile-health/lib/tracing.js"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { db } from "./common/infrastructure/database/index.js"
import { getConnection } from "./common/infrastructure/mq/index.js"
import { AuthKeycloakMiddleware } from "./common/middlewares/auth.middleware.js"
import { CommonMiddleware } from "./common/middlewares/common.middleware.js"
import { ExcelMiddleware } from "./common/middlewares/excel.middleware.js"
import { RoleMiddleware } from "./common/middlewares/role-validation.middleware.js"
import { QueryParamDateRangeValidator } from "./common/validators/query-param-date-range.validator.js"
import { ActivityQuery } from "./modules/activity/activity.query.js"
import { ActivityRepository } from "./modules/activity/activity.repository.js"
import { ConsumptionSupplyController } from "./modules/consumption-supply/consumption-supply.controller.js"
import { ConsumptionSupplyExcel } from "./modules/consumption-supply/consumption-supply.excel.js"
import { ConsumptionSupplyModule } from "./modules/consumption-supply/consumption-supply.module.js"
import { ConsumptionSupplyQuery } from "./modules/consumption-supply/consumption-supply.query.js"
import { ConsumptionSupplyRepository } from "./modules/consumption-supply/consumption-supply.repository.js"
import { DownloadReportController } from "./modules/download-report/download-report.controller.js"
import { DownloadReportModule } from "./modules/download-report/download-report.module.js"
import { DownloadReportQuery } from "./modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "./modules/download-report/download-report.repository.js"
import { ConsumptionGenerateReport } from "./modules/download-report/generate-report/consumption.generate-report.js"
import { DiscardGenerateReport } from "./modules/download-report/generate-report/discard.generate-report.js"
import { ExpiredMaterialGenerateReport } from "./modules/download-report/generate-report/expired-material.generate-report.js"
import { ReceptionGenerateReport } from "./modules/download-report/generate-report/reception.generate-report.js"
import { StockMaterialGenerateReport } from "./modules/download-report/generate-report/stock-material.generate-report.js"
import { EntityTagQuery } from "./modules/entity-tag/entity-tag.query.js"
import { EntityTagRepository } from "./modules/entity-tag/entity-tag.repository.js"
import { EntityQuery } from "./modules/entity/entity.query.js"
import { EntityRepository } from "./modules/entity/entity.repository.js"
import ExportHistoryRepository from "./modules/export-history/export-history.repository.js"
import { LocationModule } from "./modules/location/location.module.js"
import { MaterialQuery } from "./modules/material/material.query.js"
import { MaterialRepository } from "./modules/material/material.repository.js"
import { MonitoringTransactionController } from "./modules/monitoring/transaction/transaction.controller.js"
import { MonitoringTransactionMiddleware } from "./modules/monitoring/transaction/transaction.middleware.js"
import { MonitoringTransactionModule } from "./modules/monitoring/transaction/transaction.module.js"
import { MonitoringTransactionQuery } from "./modules/monitoring/transaction/transaction.query.js"
import { MonitoringTransactionRepository } from "./modules/monitoring/transaction/transaction.repository.js"
import { OrderResponseController } from "./modules/order-response/order-response.controller.js"
import { OrderResponseExcel } from "./modules/order-response/order-response.excel.js"
import { OrderResponseModule } from "./modules/order-response/order-response.module.js"
import { OrderResponseQuery } from "./modules/order-response/order-response.query.js"
import { OrderResponseRepository } from "./modules/order-response/order-response.repository.js"
import { ReconciliationController } from "./modules/reconciliation/reconciliation.controller.js"
import { ReconciliationExcel } from "./modules/reconciliation/reconciliation.excel.js"
import { ReconciliationModule } from "./modules/reconciliation/reconciliation.module.js"
import { ReconciliationQuery } from "./modules/reconciliation/reconciliation.query.js"
import { ReconciliationRepository } from "./modules/reconciliation/reconciliation.repository.js"
import { RegionQuery } from "./modules/region/region.query.js"
import { RegionRepository } from "./modules/region/region.repository.js"
import { StockOpnameController } from "./modules/stock-opname/stock-opname.controller.js"
import { StockOpnameModule } from "./modules/stock-opname/stock-opname.module.js"
import { StockOpnameQuery } from "./modules/stock-opname/stock-opname.query.js"
import { StockOpnameRepository } from "./modules/stock-opname/stock-opname.repository.js"
import { StockOpnameWorker } from "./modules/stock-opname/stock-opname.worker.js"
import { TransactionListController } from "./modules/transaction-list/transaction-list.controller.js"
import { TransactionListModule } from "./modules/transaction-list/transaction-list.module.js"
import { TransactionListQuery } from "./modules/transaction-list/transaction-list.query.js"
import { TransactionListRepository } from "./modules/transaction-list/transaction-list.repository.js"
// Stock Inventory - Shared Infrastructure
import { StockInventoryQuery } from "./modules/stock-inventory/stock-inventory.query.js"
import { StockInventoryRepository } from "./modules/stock-inventory/stock-inventory.repository.js"
// Stock Availability Module
import { StockAvailabilityController } from "./modules/stock-inventory/stock-availability/stock-availability.controller.js"
import { StockAvailabilityExcel } from "./modules/stock-inventory/stock-availability/stock-availability.excel.js"
import { StockAvailabilityModule } from "./modules/stock-inventory/stock-availability/stock-availability.module.js"
// Abnormal Stock Module
import { AbnormalStockController } from "./modules/stock-inventory/abnormal-stock/abnormal-stock.controller.js"
import { AbnormalStockExcel } from "./modules/stock-inventory/abnormal-stock/abnormal-stock.excel.js"
import { AbnormalStockModule } from "./modules/stock-inventory/abnormal-stock/abnormal-stock.module.js"
// Filling Stock Module
import { FillingStockController } from "./modules/stock-inventory/filling-stock/filling-stock.controller.js"
import { FillingStockExcel } from "./modules/stock-inventory/filling-stock/filling-stock.excel.js"
import { FillingStockModule } from "./modules/stock-inventory/filling-stock/filling-stock.module.js"
// Add Remove Discard - Shared Infrastructure
import { AddRemoveDiscardQuery } from "./modules/add-remove-discard/add-remove-discard.query.js"
import { AddRemoveDiscardRepository } from "./modules/add-remove-discard/add-remove-discard.repository.js"
import { TransactionReasonQuery } from "./modules/add-remove-discard/transaction-reason.query.js"
import { TransactionReasonRepository } from "./modules/add-remove-discard/transaction-reason.repository.js"
// Add Remove Stock Module
import { AddRemoveStockController } from "./modules/add-remove-discard/add-remove-stock/add-remove-stock.controller.js"
import { AddRemoveStockExcel } from "./modules/add-remove-discard/add-remove-stock/add-remove-stock.excel.js"
import { AddRemoveStockModule } from "./modules/add-remove-discard/add-remove-stock/add-remove-stock.module.js"
// Stock Discard Module
import { MasterDataRepository } from "./common/repositories/master-data.repository.js"
import { StockDiscardController } from "./modules/add-remove-discard/stock-discard/stock-discard.controller.js"
import { StockDiscardExcel } from "./modules/add-remove-discard/stock-discard/stock-discard.excel.js"
import { StockDiscardModule } from "./modules/add-remove-discard/stock-discard/stock-discard.module.js"

import { AssetInventoryController } from "./modules/asset-inventory/asset-inventory.controller.js"
import { AssetInventoryExcel } from "./modules/asset-inventory/asset-inventory.excel.js"
import { AssetInventoryModule } from "./modules/asset-inventory/asset-inventory.module.js"
import { AssetInventoryQuery } from "./modules/asset-inventory/asset-inventory.query.js"
import { AssetInventoryRepository } from "./modules/asset-inventory/asset-inventory.repository.js"

// Asset Monitoring Device Module
import { AssetMonitoringDeviceController } from "./modules/asset-monitoring-device/asset-monitoring-device.controller.js"
import { AssetMonitoringDeviceExcel } from "./modules/asset-monitoring-device/asset-monitoring-device.excel.js"
import { AssetMonitoringDeviceModule } from "./modules/asset-monitoring-device/asset-monitoring-device.module.js"
import { AssetMonitoringDeviceQuery } from "./modules/asset-monitoring-device/asset-monitoring-device.query.js"
import { AssetMonitoringDeviceRepository } from "./modules/asset-monitoring-device/asset-monitoring-device.repository.js"

import { LoggerMonitoringGenerateReport } from "./modules/download-report/generate-report/logger-monitoring.generate-report.js"
import { StockAvailabilityGenerateReport } from "./modules/download-report/generate-report/stock-availability.generate-report.js"
import { LoggerMonitoringQuery } from "./modules/logger-monitoring/logger-monitoring.query.js"
import { LoggerMonitoringRepository } from "./modules/logger-monitoring/logger-monitoring.repository.js"

// CCE Module
import { CceController } from "./modules/cce/cce.controller.js"
import { CceModule } from "./modules/cce/cce.module.js"
import { CceQuery } from "./modules/cce/cce.query.js"
import { CceRepository } from "./modules/cce/cce.repository.js"
import { AnnualModule } from "./modules/cce/annual/annual.module.js"
import { AnnualRepository } from "./modules/cce/annual/annual.repository.js"
import { AnnualQuery } from "./modules/cce/annual/annual.query.js"
import { MaterialModule as CceMaterialModule } from "./modules/cce/material/material.module.js"
import { MaterialRepository as CceMaterialRepository } from "./modules/cce/material/material.repository.js"
import { MaterialQuery as CceMaterialQuery } from "./modules/cce/material/material.query.js"

// Executive Dashboard Distribution Module
import { ExecutiveDashboardDistributionController } from "./modules/executive-dashboard/distribution/distribution.controller.js"
import { ExecutiveDashboardDistributionModule } from "./modules/executive-dashboard/distribution/distribution.module.js"
import { ExecutiveDashboardDistributionQuery } from "./modules/executive-dashboard/distribution/distribution.query.js"
import { ExecutiveDashboardDistributionRepository } from "./modules/executive-dashboard/distribution/distribution.repository.js"
import { ExecutiveDashboardQualityController } from "./modules/executive-dashboard/quality/quality.controller.js"
import { ExecutiveDashboardQualityModule } from "./modules/executive-dashboard/quality/quality.module.js"
import { ExecutiveDashboardQualityQuery } from "./modules/executive-dashboard/quality/quality.query.js"
import { ExecutiveDashboardQualityRepository } from "./modules/executive-dashboard/quality/quality.repository.js"

// Executive Dashboard Sufficiency Module
import { ExecutiveDashboardSufficiencyController } from "./modules/executive-dashboard/sufficiency/sufficiency.controller.js"
import { ExecutiveDashboardSufficiencyExcel } from "./modules/executive-dashboard/sufficiency/sufficiency.excel.js"
import { ExecutiveDashboardSufficiencyModule } from "./modules/executive-dashboard/sufficiency/sufficiency.module.js"
import { ExecutiveDashboardSufficiencyQuery } from "./modules/executive-dashboard/sufficiency/sufficiency.query.js"
import { ExecutiveDashboardSufficiencyRepository } from "./modules/executive-dashboard/sufficiency/sufficiency.repository.js"

// Executive Dashboard WMS - Value Chain Module
import { ValueChainController as ExecutiveDashboardWmsValueChainController } from "./modules/executive-dashboard-wms/value-chain/value-chain.controller.js"
import { ValueChainModule as ExecutiveDashboardWmsValueChainModule } from "./modules/executive-dashboard-wms/value-chain/value-chain.module.js"
import { ValueChainQuery as ExecutiveDashboardWmsValueChainQuery } from "./modules/executive-dashboard-wms/value-chain/value-chain.query.js"
import { ValueChainRepository as ExecutiveDashboardWmsValueChainRepository } from "./modules/executive-dashboard-wms/value-chain/value-chain.repository.js"

// Executive Dashboard WMS - Waste Generated Module
import { WasteGeneratedController as ExecutiveDashboardWmsWasteGeneratedController } from "./modules/executive-dashboard-wms/waste-generated/waste-generated.controller.js"
import { WasteGeneratedModule as ExecutiveDashboardWmsWasteGeneratedModule } from "./modules/executive-dashboard-wms/waste-generated/waste-generated.module.js"
import { WasteGeneratedQuery as ExecutiveDashboardWmsWasteGeneratedQuery } from "./modules/executive-dashboard-wms/waste-generated/waste-generated.query.js"
import { WasteGeneratedRepository as ExecutiveDashboardWmsWasteGeneratedRepository } from "./modules/executive-dashboard-wms/waste-generated/waste-generated.repository.js"

// Executive Dashboard WMS - Asset Module
import { AssetController as ExecutiveDashboardWmsAssetController } from "./modules/executive-dashboard-wms/asset/asset.controller.js"
import { AssetModule as ExecutiveDashboardWmsAssetModule } from "./modules/executive-dashboard-wms/asset/asset.module.js"
import { AssetQuery as ExecutiveDashboardWmsAssetQuery } from "./modules/executive-dashboard-wms/asset/asset.query.js"
import { AssetRepository as ExecutiveDashboardWmsAssetRepository } from "./modules/executive-dashboard-wms/asset/asset.repository.js"
// Executive Dashboard WMS - Waste Stages Module
import { WasteStagesController as ExecutiveDashboardWmsWasteStagesController } from "./modules/executive-dashboard-wms/waste-stages/waste-stages.controller.js"
import { WasteStagesModule as ExecutiveDashboardWmsWasteStagesModule } from "./modules/executive-dashboard-wms/waste-stages/waste-stages.module.js"
import { WasteStagesQuery as ExecutiveDashboardWmsWasteStagesQuery } from "./modules/executive-dashboard-wms/waste-stages/waste-stages.query.js"
import { WasteStagesRepository as ExecutiveDashboardWmsWasteStagesRepository } from "./modules/executive-dashboard-wms/waste-stages/waste-stages.repository.js"

// Executive Dashboard WMS - Health Facility Module
import { HealthFacilityController as ExecutiveDashboardWmsHealthFacilityController } from "./modules/executive-dashboard-wms/health-facility/health-facility.controller.js"
import { HealthFacilityModule as ExecutiveDashboardWmsHealthFacilityModule } from "./modules/executive-dashboard-wms/health-facility/health-facility.module.js"
import { HealthFacilityQuery as ExecutiveDashboardWmsHealthFacilityQuery } from "./modules/executive-dashboard-wms/health-facility/health-facility.query.js"
import { HealthFacilityRepository as ExecutiveDashboardWmsHealthFacilityRepository } from "./modules/executive-dashboard-wms/health-facility/health-facility.repository.js"

// Executive Dashboard WMS - Lead Time Module
import { LeadTimeController as ExecutiveDashboardWmsLeadTimeController } from "./modules/executive-dashboard-wms/lead-time/lead-time.controller.js"
import { LeadTimeModule as ExecutiveDashboardWmsLeadTimeModule } from "./modules/executive-dashboard-wms/lead-time/lead-time.module.js"
import { LeadTimeQuery as ExecutiveDashboardWmsLeadTimeQuery } from "./modules/executive-dashboard-wms/lead-time/lead-time.query.js"
import { LeadTimeRepository as ExecutiveDashboardWmsLeadTimeRepository } from "./modules/executive-dashboard-wms/lead-time/lead-time.repository.js"
// Executive Dashboard WMS - Active Rate Module
import { ActiveRateController as ExecutiveDashboardWmsActiveRateController } from "./modules/executive-dashboard-wms/active-rate/active-rate.controller.js"
import { ActiveRateModule as ExecutiveDashboardWmsActiveRateModule } from "./modules/executive-dashboard-wms/active-rate/active-rate.module.js"
import { ActiveRateQuery as ExecutiveDashboardWmsActiveRateQuery } from "./modules/executive-dashboard-wms/active-rate/active-rate.query.js"
import { ActiveRateRepository as ExecutiveDashboardWmsActiveRateRepository } from "./modules/executive-dashboard-wms/active-rate/active-rate.repository.js"

// Executive Dashboard WMS - Entity Tags Module
import { EntityTagsController as ExecutiveDashboardWmsEntityTagsController } from "./modules/executive-dashboard-wms/entity-tags/entity-tags.controller.js"
import { EntityTagsModule as ExecutiveDashboardWmsEntityTagsModule } from "./modules/executive-dashboard-wms/entity-tags/entity-tags.module.js"
import { EntityTagsQuery as ExecutiveDashboardWmsEntityTagsQuery } from "./modules/executive-dashboard-wms/entity-tags/entity-tags.query.js"
import { EntityTagsRepository as ExecutiveDashboardWmsEntityTagsRepository } from "./modules/executive-dashboard-wms/entity-tags/entity-tags.repository.js"

import { RabiesQuery } from "./modules/rabies/rabies.query.js"
import { RabiesRepository } from "./modules/rabies/rabies.repostitory.js"
import { RabiesModule } from "./modules/rabies/rabies.module.js"
import { RabiesController } from "./modules/rabies/rabies.controller.js"
import { RabiesExcel } from "./modules/rabies/rabies.excel.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { randomUUID } from "node:crypto"

/* Shared Dependencies */
const queryParamDateRangeValidator = new QueryParamDateRangeValidator()
const trxManager = new TransactionManager(db)
const trxMiddleware = new TransactionMiddleware(trxManager)
const mq = getConnection
const publisher = new Publisher(mq)

const commonMiddleware = new CommonMiddleware()
const authKeycloakMiddleware = new AuthKeycloakMiddleware()
const requestMiddleware = new RequestMiddleware()
const roleMiddleware = new RoleMiddleware()
const excelMiddleware = new ExcelMiddleware()

const masterDataRepo = new MasterDataRepository()

const materialQuery = new MaterialQuery()
const materialRepo = new MaterialRepository(materialQuery)

const regionQuery = new RegionQuery()
const regionRepo = new RegionRepository(regionQuery)
const entityQuery = new EntityQuery()
const entityRepo = new EntityRepository(entityQuery)
const entityTagQuery = new EntityTagQuery()
const entityTagRepo = new EntityTagRepository(entityTagQuery)
const activityQuery = new ActivityQuery()
const activityRepo = new ActivityRepository(activityQuery)
const locationModule = new LocationModule(regionRepo, entityRepo)

const exportHistoryRepo = new ExportHistoryRepository()

const stockInventoryQuery = new StockInventoryQuery()
const stockInventoryRepository = new StockInventoryRepository(
  stockInventoryQuery
)

// tolgee worker for reload translation
const tolgeeConsumer = new Consumer(getConnection, trxManager, randomUUID())
tolgeeConsumer.route(TOPIC.TOLGEE_RELOADED, async () => {
  await reloadTranslations()
})

/* Inject Dependencies */
// Monitoring Transaction
const monitoringTransactionQuery = new MonitoringTransactionQuery()
const monitoringTransactionRepo = new MonitoringTransactionRepository(
  monitoringTransactionQuery
)
const monitoringTransactionModule = new MonitoringTransactionModule(
  monitoringTransactionRepo,
  entityTagRepo,
  entityRepo
)
const monitoringTransactionMiddleware = new MonitoringTransactionMiddleware(
  queryParamDateRangeValidator,
  monitoringTransactionRepo
)
const monitoringTransactionController = new MonitoringTransactionController(
  monitoringTransactionModule,
  monitoringTransactionMiddleware,
  roleMiddleware
)

// Stock Opname
const stockOpnameQuery = new StockOpnameQuery()
const stockOpnameRepo = new StockOpnameRepository(stockOpnameQuery)
const stockOpnameModule = new StockOpnameModule(
  stockOpnameRepo,
  materialRepo,
  entityRepo,
  entityTagRepo,
  regionRepo,
  activityRepo,
  locationModule,
  exportHistoryRepo,
  publisher
)
const stockOpnameController = new StockOpnameController(
  stockOpnameModule,
  roleMiddleware
)
const stockOpnameWorker = new StockOpnameWorker(
  stockOpnameModule,
  exportHistoryRepo
)
const stockOpnameConsumer = new Consumer(mq, trxManager)
stockOpnameWorker.registerWorkers(stockOpnameConsumer)

// Reconciliation
const reconciliationQuery = new ReconciliationQuery()
const reconciliationRepo = new ReconciliationRepository(reconciliationQuery)
const reconciliationExcel = new ReconciliationExcel(
  activityRepo,
  regionRepo,
  entityTagRepo,
  entityRepo
)
const reconciliationModule = new ReconciliationModule(
  reconciliationRepo,
  entityRepo,
  entityTagRepo,
  regionRepo,
  activityRepo,
  reconciliationExcel
)
const reconciliationController = new ReconciliationController(
  reconciliationModule,
  roleMiddleware
)

// Transaction List
const transactionListQuery = new TransactionListQuery()
const transactionListRepo = new TransactionListRepository(transactionListQuery)
const transactionListModule = new TransactionListModule(transactionListRepo)
const transactionListController = new TransactionListController(
  transactionListModule,
  roleMiddleware
)

// Download Report
const downloadReportQuery = new DownloadReportQuery()
const downloadReportRepo = new DownloadReportRepository(downloadReportQuery)
// generate report
const receptionGenerateReport = new ReceptionGenerateReport(downloadReportRepo)
const stockMaterialGenerateReport = new StockMaterialGenerateReport(
  downloadReportRepo
)
const consumptionGenerateReport = new ConsumptionGenerateReport(
  downloadReportRepo
)
const discardGenerateReport = new DiscardGenerateReport(downloadReportRepo)
const expiredMaterialGenerateReport = new ExpiredMaterialGenerateReport(
  downloadReportRepo
)
const loggerMonitoringQuery = new LoggerMonitoringQuery()
const loggerMonitoringRepo = new LoggerMonitoringRepository(
  loggerMonitoringQuery
)
const loggerMonitoringGenerateReport = new LoggerMonitoringGenerateReport(
  loggerMonitoringRepo
)

// Consumption Supply
const consumptionSupplyQuery = new ConsumptionSupplyQuery()
const consumptionSupplyRepo = new ConsumptionSupplyRepository(
  consumptionSupplyQuery
)
const consumptionSupplyExcel = new ConsumptionSupplyExcel(
  activityRepo,
  regionRepo,
  entityTagRepo,
  entityRepo,
  materialRepo
)
const consumptionSupplyModule = new ConsumptionSupplyModule(
  consumptionSupplyRepo,
  materialRepo,
  entityRepo,
  locationModule,
  activityRepo,
  regionRepo,
  entityTagRepo,
  consumptionSupplyExcel
)
const consumptionSupplyController = new ConsumptionSupplyController(
  consumptionSupplyModule,
  roleMiddleware
)

// Order Response Module
const orderResponseQuery = new OrderResponseQuery()
const orderResponseRepository = new OrderResponseRepository(orderResponseQuery)
const orderResponseExcel = new OrderResponseExcel(
  activityRepo,
  regionRepo,
  entityTagRepo,
  entityRepo,
  materialRepo
)
const orderResponseModule = new OrderResponseModule(
  orderResponseRepository,
  materialRepo,
  entityRepo,
  locationModule,
  activityRepo,
  regionRepo,
  entityTagRepo,
  orderResponseExcel
)
const orderResponseController = new OrderResponseController(
  orderResponseModule,
  roleMiddleware
)

// Stock Availability Module
const stockAvailabilityExcel = new StockAvailabilityExcel(
  materialRepo,
  entityRepo,
  entityTagRepo,
  regionRepo
)
const stockAvailabilityModule = new StockAvailabilityModule(
  stockInventoryRepository,
  materialRepo,
  entityRepo,
  locationModule,
  stockAvailabilityExcel
)
const stockAvailabilityController = new StockAvailabilityController(
  stockAvailabilityModule,
  roleMiddleware
)

// Abnormal Stock Module
const abnormalStockExcel = new AbnormalStockExcel(
  materialRepo,
  entityRepo,
  entityTagRepo,
  regionRepo
)
const abnormalStockModule = new AbnormalStockModule(
  stockInventoryRepository,
  materialRepo,
  entityRepo,
  locationModule,
  abnormalStockExcel
)

const stockAvailabilityGenerateReport = new StockAvailabilityGenerateReport(
  abnormalStockModule,
  stockAvailabilityModule
)

const downloadReportModule = new DownloadReportModule(
  downloadReportRepo,
  receptionGenerateReport,
  stockMaterialGenerateReport,
  consumptionGenerateReport,
  discardGenerateReport,
  expiredMaterialGenerateReport,
  stockAvailabilityGenerateReport,
  loggerMonitoringGenerateReport
)
const downloadReportController = new DownloadReportController(
  downloadReportModule,
  roleMiddleware
)
const abnormalStockController = new AbnormalStockController(
  abnormalStockModule,
  roleMiddleware
)

// Filling Stock Module
const fillingStockExcel = new FillingStockExcel(
  materialRepo,
  entityRepo,
  entityTagRepo,
  regionRepo
)
const fillingStockModule = new FillingStockModule(
  stockInventoryRepository,
  materialRepo,
  entityRepo,
  regionRepo,
  locationModule,
  fillingStockExcel
)
const fillingStockController = new FillingStockController(
  fillingStockModule,
  roleMiddleware
)

// Add Remove Discard - Shared Infrastructure
const addRemoveDiscardQuery = new AddRemoveDiscardQuery()
const transactionReasonQuery = new TransactionReasonQuery()
const transactionReasonRepository = new TransactionReasonRepository(
  transactionReasonQuery
)
const addRemoveDiscardRepository = new AddRemoveDiscardRepository(
  addRemoveDiscardQuery
)

// Add Remove Stock Module
const addRemoveStockExcel = new AddRemoveStockExcel()
const addRemoveStockModule = new AddRemoveStockModule(
  addRemoveDiscardRepository,
  transactionReasonRepository,
  materialRepo,
  entityRepo,
  locationModule,
  addRemoveStockExcel
)
const addRemoveStockController = new AddRemoveStockController(
  addRemoveStockModule,
  roleMiddleware
)

// Stock Discard Module
const stockDiscardExcel = new StockDiscardExcel()
const stockDiscardModule = new StockDiscardModule(
  addRemoveDiscardRepository,
  transactionReasonRepository,
  materialRepo,
  entityRepo,
  locationModule,
  stockDiscardExcel
)
const stockDiscardController = new StockDiscardController(
  stockDiscardModule,
  roleMiddleware
)

// Asset Inventory
const assetInventoryQuery = new AssetInventoryQuery()
const assetInventoryRepository = new AssetInventoryRepository(
  assetInventoryQuery
)
const assetInventoryModule = new AssetInventoryModule(
  assetInventoryRepository,
  masterDataRepo,
  new AssetInventoryExcel(regionRepo, entityTagRepo, masterDataRepo)
)
const assetInventoryController = new AssetInventoryController(
  assetInventoryModule,
  roleMiddleware
)

// Asset Monitoring Device
const assetMonitoringDeviceQuery = new AssetMonitoringDeviceQuery()
const assetMonitoringDeviceRepository = new AssetMonitoringDeviceRepository(
  assetMonitoringDeviceQuery
)
const assetMonitoringDeviceExcel = new AssetMonitoringDeviceExcel()
const assetMonitoringDeviceModule = new AssetMonitoringDeviceModule(
  assetMonitoringDeviceRepository,
  assetMonitoringDeviceExcel
)
const assetMonitoringDeviceController = new AssetMonitoringDeviceController(
  assetMonitoringDeviceModule,
  roleMiddleware
)

// CCE Module
const cceQuery = new CceQuery()
const cceRepository = new CceRepository(cceQuery)
const cceModule = new CceModule(cceRepository)
const annualQuery = new AnnualQuery()
const annualRepository = new AnnualRepository(annualQuery)
const annualModule = new AnnualModule(annualRepository)
const cceMaterialQuery = new CceMaterialQuery()
const cceMaterialRepository = new CceMaterialRepository(cceMaterialQuery)
const cceMaterialModule = new CceMaterialModule(cceMaterialRepository)
const cceController = new CceController(
  cceModule,
  annualModule,
  cceMaterialModule
)

// Executive Dashboard Distribution Module
const executiveDashboardDistributionQuery =
  new ExecutiveDashboardDistributionQuery()
const executiveDashboardDistributionRepository =
  new ExecutiveDashboardDistributionRepository(
    executiveDashboardDistributionQuery
  )
const executiveDashboardDistributionModule =
  new ExecutiveDashboardDistributionModule(
    executiveDashboardDistributionRepository,
    regionRepo
  )
const executiveDashboardDistributionController =
  new ExecutiveDashboardDistributionController(
    executiveDashboardDistributionModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Value Chain Module
const executiveDashboardWmsValueChainQuery =
  new ExecutiveDashboardWmsValueChainQuery()
const executiveDashboardWmsValueChainRepository =
  new ExecutiveDashboardWmsValueChainRepository(
    executiveDashboardWmsValueChainQuery
  )
const executiveDashboardWmsValueChainModule =
  new ExecutiveDashboardWmsValueChainModule(
    executiveDashboardWmsValueChainRepository
  )
const executiveDashboardWmsValueChainController =
  new ExecutiveDashboardWmsValueChainController(
    executiveDashboardWmsValueChainModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Waste Generated Module
const executiveDashboardWmsWasteGeneratedQuery =
  new ExecutiveDashboardWmsWasteGeneratedQuery()
const executiveDashboardWmsWasteGeneratedRepository =
  new ExecutiveDashboardWmsWasteGeneratedRepository(
    executiveDashboardWmsWasteGeneratedQuery
  )
const executiveDashboardWmsWasteGeneratedModule =
  new ExecutiveDashboardWmsWasteGeneratedModule(
    executiveDashboardWmsWasteGeneratedRepository
  )
const executiveDashboardWmsWasteGeneratedController =
  new ExecutiveDashboardWmsWasteGeneratedController(
    executiveDashboardWmsWasteGeneratedModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Asset Module
const executiveDashboardWmsAssetQuery = new ExecutiveDashboardWmsAssetQuery()
const executiveDashboardWmsAssetRepository =
  new ExecutiveDashboardWmsAssetRepository(executiveDashboardWmsAssetQuery)
const executiveDashboardWmsAssetModule = new ExecutiveDashboardWmsAssetModule(
  executiveDashboardWmsAssetRepository
)
const executiveDashboardWmsAssetController =
  new ExecutiveDashboardWmsAssetController(
    executiveDashboardWmsAssetModule,
    roleMiddleware
  )
// Executive Dashboard WMS - Waste Stages Module
const executiveDashboardWmsWasteStagesQuery =
  new ExecutiveDashboardWmsWasteStagesQuery()
const executiveDashboardWmsWasteStagesRepository =
  new ExecutiveDashboardWmsWasteStagesRepository(
    executiveDashboardWmsWasteStagesQuery
  )
const executiveDashboardWmsWasteStagesModule =
  new ExecutiveDashboardWmsWasteStagesModule(
    executiveDashboardWmsWasteStagesRepository
  )
const executiveDashboardWmsWasteStagesController =
  new ExecutiveDashboardWmsWasteStagesController(
    executiveDashboardWmsWasteStagesModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Health Facility Module
const executiveDashboardWmsHealthFacilityQuery =
  new ExecutiveDashboardWmsHealthFacilityQuery()
const executiveDashboardWmsHealthFacilityRepository =
  new ExecutiveDashboardWmsHealthFacilityRepository(
    executiveDashboardWmsHealthFacilityQuery
  )
const executiveDashboardWmsHealthFacilityModule =
  new ExecutiveDashboardWmsHealthFacilityModule(
    executiveDashboardWmsHealthFacilityRepository
  )
const executiveDashboardWmsHealthFacilityController =
  new ExecutiveDashboardWmsHealthFacilityController(
    executiveDashboardWmsHealthFacilityModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Lead Time Module
const executiveDashboardWmsLeadTimeQuery =
  new ExecutiveDashboardWmsLeadTimeQuery()
const executiveDashboardWmsLeadTimeRepository =
  new ExecutiveDashboardWmsLeadTimeRepository(
    executiveDashboardWmsLeadTimeQuery
  )
const executiveDashboardWmsLeadTimeModule =
  new ExecutiveDashboardWmsLeadTimeModule(
    executiveDashboardWmsLeadTimeRepository
  )
const executiveDashboardWmsLeadTimeController =
  new ExecutiveDashboardWmsLeadTimeController(
    executiveDashboardWmsLeadTimeModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Active Rate Module
const executiveDashboardWmsActiveRateQuery =
  new ExecutiveDashboardWmsActiveRateQuery()
const executiveDashboardWmsActiveRateRepository =
  new ExecutiveDashboardWmsActiveRateRepository(
    executiveDashboardWmsActiveRateQuery
  )
const executiveDashboardWmsActiveRateModule =
  new ExecutiveDashboardWmsActiveRateModule(
    executiveDashboardWmsActiveRateRepository
  )
const executiveDashboardWmsActiveRateController =
  new ExecutiveDashboardWmsActiveRateController(
    executiveDashboardWmsActiveRateModule,
    roleMiddleware
  )

// Executive Dashboard WMS - Entity Tags Module
const executiveDashboardWmsEntityTagsQuery =
  new ExecutiveDashboardWmsEntityTagsQuery()
const executiveDashboardWmsEntityTagsRepository =
  new ExecutiveDashboardWmsEntityTagsRepository(
    executiveDashboardWmsEntityTagsQuery
  )
const executiveDashboardWmsEntityTagsModule =
  new ExecutiveDashboardWmsEntityTagsModule(
    executiveDashboardWmsEntityTagsRepository
  )
const executiveDashboardWmsEntityTagsController =
  new ExecutiveDashboardWmsEntityTagsController(
    executiveDashboardWmsEntityTagsModule,
    roleMiddleware
  )

// Executive Dashboard Quality Module
const executiveDashboardQualityQuery = new ExecutiveDashboardQualityQuery()
const executiveDashboardQualityRepository =
  new ExecutiveDashboardQualityRepository(executiveDashboardQualityQuery)
const executiveDashboardQualityModule = new ExecutiveDashboardQualityModule(
  executiveDashboardQualityRepository,
  regionRepo
)
const executiveDashboardQualityController =
  new ExecutiveDashboardQualityController(
    executiveDashboardQualityModule,
    roleMiddleware
  )

// Executive Dashboard Sufficiency Module
const executiveDashboardSufficiencyQuery =
  new ExecutiveDashboardSufficiencyQuery()
const executiveDashboardSufficiencyRepository =
  new ExecutiveDashboardSufficiencyRepository(
    executiveDashboardSufficiencyQuery
  )
const executiveDashboardSufficiencyExcel =
  new ExecutiveDashboardSufficiencyExcel(
    executiveDashboardSufficiencyRepository,
    regionRepo
  )
const executiveDashboardSufficiencyModule =
  new ExecutiveDashboardSufficiencyModule(
    executiveDashboardSufficiencyRepository,
    regionRepo,
    executiveDashboardSufficiencyExcel
  )
const executiveDashboardSufficiencyController =
  new ExecutiveDashboardSufficiencyController(
    executiveDashboardSufficiencyModule,
    roleMiddleware
  )

// Dashboard Rabies

const rabiesDashboardQuery = new RabiesQuery()
const rabiesDashboardRepository = new RabiesRepository(rabiesDashboardQuery)
const rabiesExcel = new RabiesExcel(regionRepo, entityRepo)
const rabiesDashboardModule = new RabiesModule(rabiesDashboardRepository, rabiesExcel)
const rabiesDashboardController = new RabiesController(
  rabiesDashboardModule,
  roleMiddleware
)

/* Main App */
const warehouseApp = new Hono()
warehouseApp.use(cors())

warehouseApp.use("*", commonMiddleware.loadSlaveDB)
warehouseApp.use("*", commonMiddleware.loadElasticClient)
warehouseApp.use("*", requestMiddleware.handle)
warehouseApp.use("*", authKeycloakMiddleware.handleAuthKeycloak)
warehouseApp.use("*", featureFlagsMiddleware())
warehouseApp.use("*", trxMiddleware.handle)

/* Register Routes */
const monitoringTransactionRoutes = new Hono()
monitoringTransactionRoutes.use(
  "*",
  routeTracer.traceRoute("monitoring-transaction")
)
monitoringTransactionRoutes.route(
  "/",
  monitoringTransactionController.getRoutes()
)
warehouseApp.route("/monitoring/transaction", monitoringTransactionRoutes)

const stockOpnameRoutes = new Hono()
stockOpnameRoutes.use("*", routeTracer.traceRoute("stock-opname"))
stockOpnameRoutes.route("/", stockOpnameController.getRoutes())
warehouseApp.route("/stock-opname", stockOpnameRoutes)

const reconciliationRoutes = new Hono()
reconciliationRoutes.use("*", routeTracer.traceRoute("reconciliation"))
reconciliationRoutes.route("/", reconciliationController.getRoutes())
warehouseApp.route("/reconciliation", reconciliationRoutes)

const transactionListRoutes = new Hono()
transactionListRoutes.use("*", routeTracer.traceRoute("transaction-list"))
transactionListRoutes.route("/", transactionListController.getRoutes())
warehouseApp.route("/transaction-list", transactionListRoutes)

const downloadReportRoutes = new Hono()
downloadReportRoutes.use("*", routeTracer.traceRoute("download-report"))
downloadReportRoutes.route("/", downloadReportController.getRoutes())
warehouseApp.route("/download", downloadReportRoutes)

const consumptionSupplyRoutes = new Hono()
consumptionSupplyRoutes.use("*", routeTracer.traceRoute("consumption-supply"))
consumptionSupplyRoutes.route("/", consumptionSupplyController.getRoutes())
warehouseApp.route("/consumption-supply", consumptionSupplyRoutes)


const orderResponseRoutes = new Hono()
orderResponseRoutes.use("*", routeTracer.traceRoute("order-response"))
orderResponseRoutes.route("/", orderResponseController.getRoutes())
warehouseApp.route("/order-response", orderResponseRoutes)

const stockAvailabilityRoutes = new Hono()
stockAvailabilityRoutes.use("*", routeTracer.traceRoute("stock-availability"))
stockAvailabilityRoutes.route("/", stockAvailabilityController.getRoutes())
warehouseApp.route("/stock-availability", stockAvailabilityRoutes)

const abnormalStockRoutes = new Hono()
abnormalStockRoutes.use("*", routeTracer.traceRoute("abnormal-stock"))
abnormalStockRoutes.route("/", abnormalStockController.getRoutes())
warehouseApp.route("/abnormal-stock", abnormalStockRoutes)

const fillingStockRoutes = new Hono()
fillingStockRoutes.use("*", routeTracer.traceRoute("filling-stock"))
fillingStockRoutes.route("/", fillingStockController.getRoutes())
warehouseApp.route("/filling-stock", fillingStockRoutes)

const addRemoveStockRoutes = new Hono()
addRemoveStockRoutes.use("*", routeTracer.traceRoute("add-remove-stock"))
addRemoveStockRoutes.route("/", addRemoveStockController.getRoutes())
warehouseApp.route("/add-remove-stock", addRemoveStockRoutes)

const stockDiscardRoutes = new Hono()
stockDiscardRoutes.use("*", routeTracer.traceRoute("stock-discard"))
stockDiscardRoutes.route("/", stockDiscardController.getRoutes())
warehouseApp.route("/stock-discard", stockDiscardRoutes)

const assetInventoryRoutes = new Hono()
assetInventoryRoutes.use("*", routeTracer.traceRoute("asset-inventory"))
assetInventoryRoutes.route("/", assetInventoryController.getRoutes())
warehouseApp.route("/asset-inventory", assetInventoryRoutes)

const rabiesDashboardRoutes = new Hono()
rabiesDashboardRoutes.use("*", routeTracer.traceRoute("rabies"))
rabiesDashboardRoutes.route("/", rabiesDashboardController.getRoutes())
warehouseApp.route("/rabies", rabiesDashboardRoutes)

const cceRoutes = new Hono()
cceRoutes.use("*", routeTracer.traceRoute("cce"))
cceRoutes.route("/", cceController.getRoutes())
warehouseApp.route("/cce", cceRoutes)

const assetMonitoringDeviceRoutes = new Hono()
assetMonitoringDeviceRoutes.use(
  "*",
  routeTracer.traceRoute("asset-monitoring-device")
)
assetMonitoringDeviceRoutes.route(
  "/",
  assetMonitoringDeviceController.getRoutes()
)
warehouseApp.route("/asset-monitoring-device", assetMonitoringDeviceRoutes)

const executiveDashboardDistributionRoutes = new Hono()
executiveDashboardDistributionRoutes.use(
  "*",
  routeTracer.traceRoute("executive-dashboard-distribution")
)
executiveDashboardDistributionRoutes.route(
  "/",
  executiveDashboardDistributionController.getRoutes()
)
warehouseApp.route(
  "/executive/distribution",
  executiveDashboardDistributionRoutes
)

const executiveDashboardWmsDistributionRoutes = new Hono()
executiveDashboardWmsDistributionRoutes.use(
  "*",
  routeTracer.traceRoute("executive-wms-distribution")
)
executiveDashboardWmsDistributionRoutes.route(
  "/",
  executiveDashboardWmsValueChainController.getRoutes()
)
executiveDashboardWmsDistributionRoutes.route(
  "/",
  executiveDashboardWmsWasteStagesController.getRoutes()
)
executiveDashboardWmsDistributionRoutes.route(
  "/",
  executiveDashboardWmsLeadTimeController.getRoutes()
)
executiveDashboardWmsDistributionRoutes.route(
  "/",
  executiveDashboardWmsActiveRateController.getRoutes()
)
warehouseApp.route(
  "/executive/wms/distribution",
  executiveDashboardWmsDistributionRoutes
)

const executiveDashboardWmsWasteGeneratedRoutes = new Hono()
executiveDashboardWmsWasteGeneratedRoutes.use(
  "*",
  routeTracer.traceRoute("waste-generated")
)
executiveDashboardWmsWasteGeneratedRoutes.route(
  "/",
  executiveDashboardWmsWasteGeneratedController.getRoutes()
)
warehouseApp.route("/executive/wms", executiveDashboardWmsWasteGeneratedRoutes)

const executiveDashboardWmsEntityTagsRoutes = new Hono()
executiveDashboardWmsEntityTagsRoutes.use(
  "*",
  routeTracer.traceRoute("entity-tags")
)
executiveDashboardWmsEntityTagsRoutes.route(
  "/",
  executiveDashboardWmsEntityTagsController.getRoutes()
)
warehouseApp.route("/executive/wms", executiveDashboardWmsEntityTagsRoutes)

const executiveDashboardWmsAssetRoutes = new Hono()
executiveDashboardWmsAssetRoutes.use("*", routeTracer.traceRoute("asset"))
executiveDashboardWmsAssetRoutes.route(
  "/",
  executiveDashboardWmsAssetController.getRoutes()
)
warehouseApp.route("/executive/wms/quality", executiveDashboardWmsAssetRoutes)
const executiveDashboardWmsHealthFacilityRoutes = new Hono()

executiveDashboardWmsHealthFacilityRoutes.use(
  "*",
  routeTracer.traceRoute("health-facility")
)
executiveDashboardWmsHealthFacilityRoutes.route(
  "/",
  executiveDashboardWmsHealthFacilityController.getRoutes()
)
warehouseApp.route(
  "/executive/wms/distribution",
  executiveDashboardWmsHealthFacilityRoutes
)

const executiveDashboardQualityRoutes = new Hono()
executiveDashboardQualityRoutes.use(
  "*",
  routeTracer.traceRoute("executive-dashboard-quality")
)
executiveDashboardQualityRoutes.route(
  "/",
  executiveDashboardQualityController.getRoutes()
)
warehouseApp.route("/executive/quality", executiveDashboardQualityRoutes)

const executiveDashboardSufficiencyRoutes = new Hono()
executiveDashboardSufficiencyRoutes.use(
  "*",
  routeTracer.traceRoute("executive-dashboard-sufficiency")
)
executiveDashboardSufficiencyRoutes.route(
  "/",
  executiveDashboardSufficiencyController.getRoutes()
)
warehouseApp.route("/executive", executiveDashboardSufficiencyRoutes)

// Feature flags webhook routes (public - bypasses auth for external webhooks)
const featureFlagsWebhookRoutes = new Hono()
featureFlagsWebhookRoutes.use("*", commonMiddleware.loadSlaveDB)
featureFlagsWebhookRoutes.use("*", commonMiddleware.loadElasticClient)
featureFlagsWebhookRoutes.use("*", requestMiddleware.handle)
featureFlagsWebhookRoutes.use("*", routeTracer.traceRoute("feature-flags-webhook"))
featureFlagsWebhookRoutes.post("/webhook", createWebhookHandler())
featureFlagsWebhookRoutes.post("/refresh", createRefreshHandler())
warehouseApp.route("/feature-flags", featureFlagsWebhookRoutes)

// Testing tolgee translation
warehouseApp.get("/tolgee/:key", async (c) => {
  i18n.loadResources(await loadResources())
  const key = c.req.param("key") ?? ""
  const value = c.var.t(key)

  return c.json({ value }, 200)
})

export { stockOpnameConsumer, tolgeeConsumer, warehouseApp }
