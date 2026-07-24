import { Context } from "hono"
import _ from "lodash"
import { BaseModule } from "../../base.module.js"
import { calculatePagination } from "@/common/utils/pagination.js"
import { StockInventoryRepository } from "../stock-inventory.repository.js"
import { MaterialRepository } from "../../material/material.repository.js"
import { EntityRepository } from "../../entity/entity.repository.js"
import { LocationModule } from "../../location/location.module.js"
import { AbnormalStockExcel } from "./abnormal-stock.excel.js"
import {
  AbnormalStockQueryParams,
  AbnormalStockReviewResponse,
  AbnormalStockEntityMaterialResponse,
  AbnormalStockReviewResponseSchema,
  AbnormalStockEntityMaterialResponseSchema,
  AbnormalStockReviewDataset,
  AbnormalStockListResponse,
  AbnormalStockListResponseSchema,
  AbnormalStockEntityMaterialDataset,
} from "./abnormal-stock.schema.js"
import {
  generatePeriodCategories,
  fillAndCalculateMissingData,
} from "../stock-inventory.utils.js"
import { STOCK_INVENTORY_TRANSACTION_TYPE } from "@/common/constants/stock-inventory.js"
import {
  generateAbnormalStockTypes,
  getAbnormalStockValue,
  processAbnormalStockData,
} from "./abnormal-stock.utils.js"

export class AbnormalStockModule extends BaseModule {
  constructor(
    private readonly repository: StockInventoryRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly entityRepository: EntityRepository,
    private readonly locationModule: LocationModule,
    private readonly abnormalStockExcel: AbnormalStockExcel
  ) {
    super()
  }

  /**
   * Get abnormal stock review/overview data
   * Replaces the old abnormalStockOveriew function
   */
  async getReview(
    c: Context,
    queryParams: AbnormalStockQueryParams
  ): Promise<AbnormalStockReviewResponse> {
    const {
      from,
      to,
      period,
      transaction_type = "zero",
      information_type = "count",
    } = queryParams

    // Generate period categories and durations
    const { categories, durations } = generatePeriodCategories(
      from!,
      to!,
      period
    )

    // Fetch abnormal stock data with transaction type filtering
    const rawStockData = await this.repository.fetchStockInventoryData(
      c,
      queryParams,
      transaction_type
    )

    // Get transaction type for missing data calculation
    const transactionTypeEnum = transaction_type
      ? STOCK_INVENTORY_TRANSACTION_TYPE[
          transaction_type.toUpperCase() as keyof typeof STOCK_INVENTORY_TRANSACTION_TYPE
        ]
      : STOCK_INVENTORY_TRANSACTION_TYPE.ZERO

    // Fill missing data points and calculate missing durations
    const stockData = fillAndCalculateMissingData(
      rawStockData,
      categories,
      durations,
      period,
      transactionTypeEnum
    )

    // Get last updated timestamp
    const lastUpdated = await this.repository.getLastUpdated()

    // Build response based on transaction type and information type
    let dataset: AbnormalStockReviewDataset[] = []

    // Group data by period for chart visualization
    const dataGroupedByPeriod = _.groupBy(stockData, "period")

    // Calculate abnormal stock values for each period
    const chartData = categories.map((category) => {
      const periodData =
        dataGroupedByPeriod[category.selector || category.id || ""] || []
      const divider = _.uniqBy(
        periodData,
        (item) => `${item.entity_id}_${item.master_material_id}`
      ).length
      const value = getAbnormalStockValue(periodData, divider, information_type)

      return {
        label: category.label || category.selector || category.id || "",
        value: typeof value === "number" ? value : 0,
      }
    })

    // Create dataset for chart visualization
    dataset = [
      {
        label: `${transaction_type || "abnormal"} stock (${information_type})`,
        color: "#FF6384", // Default color for abnormal stock
        data: chartData.map((item) => item.value),
      },
    ]

    const response = {
      last_updated: lastUpdated,
      data: {
        categories,
        dataset,
      },
    }

    return AbnormalStockReviewResponseSchema.parse(response)
  }

  /**
   * Get abnormal stock material data
   * Replaces the old abnormalStockMaterial function
   */
  async getMaterial(
    c: Context,
    queryParams: AbnormalStockQueryParams,
    download = false
  ): Promise<AbnormalStockListResponse> {
    const {
      from,
      to,
      period,
      page = 1,
      paginate = 10,
      transaction_type = "zero",
      information_type = "count",
    } = queryParams

    // Get total count and paginated materials
    const materialsResult = await this.materialRepository.fetchMaterials(
      c,
      queryParams,
      { is_paginate: !download }
    )
    const total = materialsResult.count
    const materials = Array.isArray(materialsResult.records)
      ? materialsResult.records
      : []

    // Generate period categories
    const { categories, durations } = generatePeriodCategories(
      from!,
      to!,
      period
    )

    // Fetch abnormal stock data for these materials
    const rawStockData = await this.repository.fetchStockInventoryData(
      c,
      queryParams,
      transaction_type
    )

    // Fill missing data points and calculate missing durations
    const stockData = fillAndCalculateMissingData(
      rawStockData,
      categories,
      durations,
      period,
      transaction_type
    )

    // Process material data with abnormal stock logic
    const processedData = processAbnormalStockData(
      materials,
      stockData,
      categories,
      "master_material_id",
      {
        abnormalInformationType: information_type,
      }
    )

    // Calculate pagination
    const pagination = calculatePagination(total, page, paginate)

    // Get last updated timestamp
    const lastUpdated = await this.repository.getLastUpdated()

    const response = {
      last_updated: lastUpdated,
      data: {
        categories,
        dataset: processedData,
        type: generateAbnormalStockTypes(),
      },
      ...pagination,
    }

    return AbnormalStockListResponseSchema.parse(response)
  }

  /**
   * Get abnormal stock entity data
   * Replaces the old abnormalStockEntity function
   */
  async getEntity(
    c: Context,
    queryParams: AbnormalStockQueryParams,
    download = false
  ): Promise<AbnormalStockListResponse> {
    const {
      from,
      to,
      period,
      page = 1,
      paginate = 10,
      transaction_type = "zero",
      information_type = "count",
    } = queryParams

    // Get entities with pagination
    const { records: entities, count: total } =
      await this.entityRepository.fetchEntities(c, queryParams, {
        is_paginate: !download,
      })

    // Generate period categories
    const { categories, durations } = generatePeriodCategories(
      from!,
      to!,
      period
    )

    // Fetch abnormal stock data for these entities
    const rawStockData = await this.repository.fetchStockInventoryData(
      c,
      queryParams,
      transaction_type
    )

    // Fill missing data points and calculate missing durations
    const stockData = fillAndCalculateMissingData(
      rawStockData,
      categories,
      durations,
      period,
      transaction_type
    )

    // Process entity data with abnormal stock logic
    const processedData = processAbnormalStockData(
      entities,
      stockData,
      categories,
      "entity_id",
      {
        includeLocationFields: true,
        abnormalInformationType: information_type,
      }
    )

    // Calculate pagination
    const pagination = calculatePagination(total, page, paginate)

    // Get last updated timestamp
    const lastUpdated = await this.repository.getLastUpdated()

    const response = {
      last_updated: lastUpdated,
      data: {
        categories: categories,
        dataset: processedData,
        type: generateAbnormalStockTypes(),
      },
      ...pagination,
    }

    return AbnormalStockListResponseSchema.parse(response)
  }

  /**
   * Get abnormal stock entity-material data
   * Replaces the old abnormalStockEntityMaterial function
   */
  async getEntityMaterial(
    c: Context,
    queryParams: AbnormalStockQueryParams,
    download = false,
    streamCallback?: (
      chunk: AbnormalStockEntityMaterialDataset[]
    ) => Promise<void>
  ): Promise<AbnormalStockEntityMaterialResponse | void> {
    const {
      from,
      to,
      period,
      page = 1,
      paginate = 10,
      transaction_type = "zero",
      information_type = "count",
    } = queryParams

    // Get entities with pagination
    // If streaming, always use pagination
    const entitiesResult = await this.entityRepository.fetchEntities(
      c,
      queryParams,
      { is_paginate: !download && !streamCallback }
    )
    const total = entitiesResult.count
    const entities = Array.isArray(entitiesResult.records)
      ? entitiesResult.records
      : []

    // Get materials for column headers
    const materialsResult = await this.materialRepository.fetchMaterials(
      c,
      queryParams,
      { is_paginate: false }
    )
    const materials = Array.isArray(materialsResult.records)
      ? materialsResult.records
      : []

    // Generate period categories
    const { categories, durations } = generatePeriodCategories(
      from!,
      to!,
      period
    )

    // Fetch abnormal stock data for these entities
    const rawStockData = await this.repository.fetchStockInventoryData(
      c,
      queryParams,
      transaction_type
    )

    // Fill missing data points and calculate missing durations
    const stockData = fillAndCalculateMissingData(
      rawStockData,
      categories,
      durations,
      period,
      transaction_type
    )

    // If streaming callback provided, process data in chunks
    if (streamCallback) {
      const chunkSize = 5000
      let currentPage = 1
      let processedCount = 0

      while (processedCount < total) {
        // Fetch entities for current chunk
        const chunkResult = await this.entityRepository.fetchEntities(
          c,
          {
            ...queryParams,
            page: currentPage,
            paginate: chunkSize,
            offset: (currentPage - 1) * chunkSize,
          },
          { is_paginate: true }
        )

        const chunkEntities = Array.isArray(chunkResult.records)
          ? chunkResult.records
          : []

        // Process chunk data
        const chunkProcessedData = processAbnormalStockData(
          chunkEntities,
          stockData,
          [],
          "entity_id",
          {
            materials,
            includeLocationFields: true,
            abnormalInformationType: information_type,
          }
        ) as AbnormalStockEntityMaterialDataset[]

        // Send chunk to callback
        await streamCallback(chunkProcessedData)

        processedCount += chunkEntities.length
        currentPage++
      }

      // Return early when streaming
      return
    }

    // Process entity-material data with abnormal stock logic (non-streaming)
    const processedData = processAbnormalStockData(
      entities,
      stockData,
      [], // categories not used in entity-material
      "entity_id",
      {
        materials,
        includeLocationFields: true,
        abnormalInformationType: information_type,
      }
    )

    // Calculate pagination (skip if download=true or streaming)
    const pagination =
      download || streamCallback
        ? {
            page: 1,
            item_per_page: total,
            total_item: total,
            total_page: 1,
            list_pagination: [1],
          }
        : calculatePagination(total, page, paginate)

    // Get last updated timestamp
    const lastUpdated = await this.repository.getLastUpdated()

    // Build material columns for response
    const materialColumns = materials.map((material) => ({
      id: material.id,
      label: material.name,
    }))

    const response = {
      last_updated: lastUpdated,
      data: {
        categories: materialColumns,
        dataset: processedData,
        type: generateAbnormalStockTypes(),
      },
      ...pagination,
    }

    return AbnormalStockEntityMaterialResponseSchema.parse(response)
  }

  /**
   * Get abnormal stock location data
   * Replaces the old abnormalStockLocation function
   */
  async getLocation(
    c: Context,
    queryParams: AbnormalStockQueryParams,
    download = false
  ): Promise<AbnormalStockListResponse> {
    const {
      from,
      to,
      period,
      page = 1,
      paginate = 10,
      transaction_type = "zero",
      information_type = "count",
    } = queryParams

    // Get locations based on hierarchical logic
    const { records: locations, count: total } =
      await this.locationModule.getLocations(c, queryParams, download)

    // Generate period categories
    const { categories, durations } = generatePeriodCategories(
      from!,
      to!,
      period
    )

    // Fetch abnormal stock data for these locations
    const rawStockData = await this.repository.fetchStockInventoryData(
      c,
      queryParams,
      transaction_type
    )

    // Fill missing data points and calculate missing durations
    const stockData = fillAndCalculateMissingData(
      rawStockData,
      categories,
      durations,
      period,
      transaction_type
    )

    // Process location data with abnormal stock logic
    const processedData = processAbnormalStockData(
      locations,
      stockData,
      categories,
      "location_id",
      {
        includeLocationFields: true,
        abnormalInformationType: information_type,
      }
    )

    // Calculate pagination
    const pagination = calculatePagination(total, page, paginate)

    // Get last updated timestamp
    const lastUpdated = await this.repository.getLastUpdated()

    const response = {
      last_updated: lastUpdated,
      data: {
        categories: categories,
        dataset: processedData,
        type: generateAbnormalStockTypes(),
      },
      ...pagination,
    }

    return AbnormalStockListResponseSchema.parse(response)
  }

  /**
   * Export review data to Excel
   */
  async getReviewExport(c: Context, queryParams: AbnormalStockQueryParams) {
    const reviewData = await this.getReview(c, queryParams)
    return await this.abnormalStockExcel.generateReviewExport(
      c,
      queryParams,
      reviewData
    )
  }

  /**
   * Export material data to Excel
   */
  async getMaterialExport(c: Context, queryParams: AbnormalStockQueryParams) {
    const materialData = await this.getMaterial(c, queryParams, true)
    return await this.abnormalStockExcel.generateMaterialExport(
      c,
      queryParams,
      materialData
    )
  }

  /**
   * Export entity data to Excel
   */
  async getEntityExport(c: Context, queryParams: AbnormalStockQueryParams) {
    const entityData = await this.getEntity(c, queryParams, true)
    return await this.abnormalStockExcel.generateEntityExport(
      c,
      queryParams,
      entityData
    )
  }

  /**
   * Export entity-material data to Excel
   */
  async getEntityMaterialExport(
    c: Context,
    queryParams: AbnormalStockQueryParams
  ) {
    // For exports, we need the full data, so we don't use streaming
    const entityMaterialData = (await this.getEntityMaterial(
      c,
      queryParams,
      true
    )) as AbnormalStockEntityMaterialResponse

    return await this.abnormalStockExcel.generateEntityMaterialExport(
      c,
      queryParams,
      entityMaterialData
    )
  }

  /**
   * Export location data to Excel
   */
  async getLocationExport(c: Context, queryParams: AbnormalStockQueryParams) {
    const locationData = await this.getLocation(c, queryParams, true)
    return await this.abnormalStockExcel.generateLocationExport(
      c,
      queryParams,
      locationData
    )
  }
}
