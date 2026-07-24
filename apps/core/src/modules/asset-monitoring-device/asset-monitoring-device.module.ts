import { ASSET_CLASSIFICATION } from "@/common/constants/assets.js"
import { DEVICE_TYPE } from "@/common/constants/device.js"
import { STATUS } from "@/common/constants/general.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@smile/lib/error.js"
import { logger } from "@smile/lib/logger.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import moment from "moment"
import { BaseModule } from "../base.module.js"
import { AssetMonitoringDeviceExport } from "./asset-monitoring-device.excel.js"
import { AssetMonitoringDeviceRepository } from "./asset-monitoring-device.repository.js"
import {
  AddAssetMonitoringDeviceRequest,
  DeviceExportItem,
  EditAssetMonitoringDeviceRequest,
  GetAssetMonitoringDevicesQueryParams,
} from "./asset-monitoring-device.schema.js"

export class AssetMonitoringDeviceModule extends BaseModule {
  constructor(private readonly repository: AssetMonitoringDeviceRepository) {
    super()
  }

  async create(
    c: Context,
    data: AddAssetMonitoringDeviceRequest
  ): Promise<{ id: number }> {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      await this.validateBusinessRules(c, data)

      const deviceId = await this.repository.create(c, {
        ...data,
        created_by: currentUser.id,
        updated_by: currentUser.id,
      })

      logger.info(
        `Asset Monitoring Device created successfully - ID: ${deviceId}, Serial: ${data.serial_number}, User: ${currentUser.id}`
      )

      return { id: deviceId }
    } catch (error) {
      logger.error(
        `Error creating Asset Monitoring Device: ${error instanceof Error ? error.message : "Unknown error"} - Serial: ${data.serial_number}, Type: ${data.asset_type_id}, Entity: ${data.entity_id}`
      )

      if (
        error instanceof ValidationError ||
        error instanceof BadRequestError ||
        error instanceof NotFoundError
      ) {
        throw error
      }

      // Handle specific database errors with more descriptive messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()

        if (
          errorMessage.includes("duplicate") ||
          errorMessage.includes("unique")
        ) {
          throw new ValidationError(
            "Serial number already exists. Please use a different serial number"
          )
        }

        if (
          errorMessage.includes("foreign key constraint") ||
          errorMessage.includes("constraint violation")
        ) {
          throw new ValidationError(
            "Invalid reference: One or more selected items (asset type, model, manufacture, vendor, entity, etc.) do not exist"
          )
        }

        if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("connection")
        ) {
          throw new ValidationError(
            "Database connection error. Please try again"
          )
        }

        if (
          errorMessage.includes("permission") ||
          errorMessage.includes("access denied")
        ) {
          throw new ValidationError(
            "Permission denied. You don't have access to create this asset"
          )
        }
      }

      throw new ValidationError(
        `Failed to create Asset Monitoring Device: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
    }
  }

  async detail(c: Context, id: number) {
    try {
      const entityId = await this.getEntityByRole(c)
      const device = await this.repository.findById(c, id, entityId)

      if (!device) {
        throw new NotFoundError("Asset Monitoring Device not found")
      }

      return device
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      logger.error(
        `Error fetching Asset Monitoring Device: ${error instanceof Error ? error.message : "Unknown error"} - ID: ${id}`
      )

      throw new ValidationError(
        "Failed to fetch Asset Monitoring Device record"
      )
    }
  }

  async update(
    c: Context,
    id: number,
    data: EditAssetMonitoringDeviceRequest
  ): Promise<{ id: number }> {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      const existingDevice = await this.repository.findById(c, id)
      if (!existingDevice) {
        throw new NotFoundError("Asset Monitoring Device not found")
      }

      if (Object.keys(data).length === 0) {
        throw new ValidationError("No data provided for update")
      }

      // Validasi dan logika serial number
      if (data.serial_number !== undefined) {
        // Validasi wajib diisi
        if (!data.serial_number || data.serial_number.trim() === "") {
          throw new ValidationError("Serial number is required")
        }

        if (data.serial_number !== existingDevice.serial_number) {
          const isSerialNumberUnique =
            await this.repository.validateSerialNumber(
              c,
              data.serial_number,
              id
            )
          if (!isSerialNumberUnique) {
            throw new ValidationError("Serial number already exists")
          }
        }
      }

      await this.validateUpdateBusinessRules(c, data)

      const updated = await this.repository.update(c, id, {
        ...data,
        updated_by: currentUser.id,
      })

      if (!updated) {
        throw new ValidationError("Failed to update Asset Monitoring Device")
      }

      logger.info(
        `Asset Monitoring Device updated successfully - ID: ${id}, Fields: ${Object.keys(data).join(", ")}, User: ${currentUser.id}`
      )

      return { id }
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BadRequestError
      ) {
        throw error
      }

      logger.error(
        `Error updating Asset Monitoring Device: ${error instanceof Error ? error.message : "Unknown error"} - ID: ${id}, Data: ${JSON.stringify(data)}`
      )

      throw new ValidationError(
        "Failed to update Asset Monitoring Device record"
      )
    }
  }

  async list(c: Context, params: GetAssetMonitoringDevicesQueryParams) {
    try {
      logger.info(
        `Fetching Asset Monitoring Device list with params: ${JSON.stringify(params)}`
      )

      const { role: roleId } = c.var
      let createdBy: number | undefined
      if (roleId === USER_ROLE.VENDOR_IOT) {
        const currentUser = c.get("user")
        if (currentUser?.manufacture_id) {
          params = {
            ...params,
            manufacture_ids: [currentUser.manufacture_id],
          }
        }
        createdBy = await this.getVendorIotFilter(c, currentUser)
      }

      const entityId = await this.getEntityByRole(c)
      const { data, total } = await this.repository.list(
        c,
        params,
        entityId,
        createdBy
      )

      if (data.length === 0) {
        return new PaginatedResponse(params, data)
      }

      logger.info(
        `Asset Monitoring Device list fetched successfully - Total: ${total}, Page: ${params.page}, Per Page: ${params.paginate}`
      )

      return new PaginatedResponse(params, data, total)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      logger.error(
        `Error fetching Asset Monitoring Device list: ${error instanceof Error ? error.message : "Unknown error"} - Params: ${JSON.stringify(params)}`
      )

      throw new ValidationError("Failed to fetch Asset Monitoring Device list")
    }
  }

  async delete(c: Context, id: number): Promise<void> {
    try {
      const { t } = c.var
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      const exists = await this.repository.existsById(c, id)
      if (!exists) {
        throw new NotFoundError("Asset Monitoring Device not found")
      }

      // Check if RTMD has asset relation
      const hasRelation = await this.repository.hasAssetInventoryRelation(c, id)
      if (hasRelation) {
        throw new ValidationError(
          t(
            "asset_monitoring_device.error.has_asset_relation",
            "This item cannot be deleted as already has relation with asset"
          )
        )
      }

      const deleted = await this.repository.delete(c, id)

      if (!deleted) {
        throw new ValidationError("Failed to delete Asset Monitoring Device")
      }

      logger.info(
        `Asset Monitoring Device deleted successfully - ID: ${id}, User: ${currentUser.id}`
      )
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error
      }

      logger.error(
        `Error deleting Asset Monitoring Device: ${error instanceof Error ? error.message : "Unknown error"} - ID: ${id}`
      )

      throw new ValidationError("Failed to delete Asset Monitoring Device")
    }
  }

  async bulkDelete(
    c: Context,
    ids: number[]
  ): Promise<{ deleted: number; failed: number }> {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      const validIds: number[] = []

      for (const id of ids) {
        const exists = await this.repository.existsById(c, id)
        if (exists) {
          validIds.push(id)
        }
      }

      const result = await this.repository.bulkDelete(c, validIds)

      logger.info(
        `Bulk Asset Monitoring Device delete completed - Requested: ${ids.join(", ")}, Valid: ${validIds.join(", ")}, Deleted: ${result.deleted}, Failed: ${result.failed}, User: ${currentUser.id}`
      )

      return result
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      logger.error(
        `Error bulk deleting Asset Monitoring Devices: ${error instanceof Error ? error.message : "Unknown error"} - Requested IDs: ${ids.join(", ")}`
      )

      throw new ValidationError(
        "Failed to bulk delete Asset Monitoring Devices"
      )
    }
  }

  async export(
    c: Context,
    params: GetAssetMonitoringDevicesQueryParams
  ): Promise<Response> {
    try {
      const { t, language, timezone } = c.var
      const rawTitle = t("rtmd.export.title", "Perangkat Pemantauan")
      const title = rawTitle
        .replace(/[\r\n]+/g, " ")
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, " ")
        .trim()

      logger.info(
        `Starting export process with params: ${JSON.stringify(params)}`
      )

      const exportParams = { ...params, page: 1, item_per_page: 10000 }
      const { role: roleId } = c.var
      let createdBy: number | undefined
      if (roleId === USER_ROLE.VENDOR_IOT) {
        const currentUser = c.get("user")
        if (currentUser?.manufacture_id) {
          exportParams.manufacture_ids = [currentUser.manufacture_id]
        }
        createdBy = await this.getVendorIotFilter(c, currentUser)
      }

      const entityId = await this.getEntityByRole(c)
      const { data } = await this.repository.listWithoutPagination(
        c,
        exportParams,
        entityId,
        createdBy
      )

      logger.info(
        `Generating Excel export for ${data.length} Asset Monitoring Device records`
      )

      if (data.length === 0) {
        logger.warn("No data found for export, generating empty template")
      }

      const rows: (string | number)[][] = []

      for (const device of data as DeviceExportItem[]) {
        const row = [
          device.entity?.entity_type_name
            ? t(
                `common.${device.entity.entity_type_name}`,
                device.entity.entity_type_name
              ) || "-"
            : "-",
          device.entity?.sub_district_name || "-",
          device.entity?.city_name || "-",
          device.entity?.province_name || "-",
          device.entity?.id || "-",
          device.entity?.name || "-",
          device.id || "-",
          device.serial_number || "-",
          device.asset_model?.name || "-",
          device.manufacture?.name || "-",
          device.asset_type?.name || "-",
          t(
            device.asset_rtmd_status?.name || "Unknown",
            device.asset_rtmd_status?.name || "Unknown"
          ) || "-",
          device.budget_year || "-",
          device.budget_source?.name || "-",
          device.updated_at
            ? moment(device.updated_at).tz(timezone).format("DD/MM/YYYY HH:mm")
            : "-",
          device.asset_vendor?.name || "-",
          device.communication_provider?.name || "-",
          device.longitude || "-",
          device.latitude || "-",
        ]
        rows.push(row)
      }

      const columns = [
        {
          key: "entity_type",
          header: t("rtmd.export.headers.entity_type", "Tipe Entitas"),
          width: 15,
        },
        {
          key: "sub_district",
          header: t("rtmd.export.headers.sub_district", "Kecamatan"),
          width: 20,
        },
        {
          key: "city",
          header: t("rtmd.export.headers.city", "Kab/Kota"),
          width: 20,
        },
        {
          key: "province",
          header: t("rtmd.export.headers.province", "Provinsi"),
          width: 20,
        },
        {
          key: "entity_id",
          header: t("rtmd.export.headers.entity_id", "ID Entitas"),
          width: 15,
        },
        {
          key: "entity_name",
          header: t("rtmd.export.headers.entity_name", "Nama Entitas"),
          width: 30,
        },
        {
          key: "asset_id",
          header: t("rtmd.export.headers.asset_id", "ID Aset SMILE"),
          width: 15,
        },
        {
          key: "serial_number",
          header: t("rtmd.export.headers.serial_number", "Serial Number"),
          width: 25,
        },
        {
          key: "model",
          header: t("rtmd.export.headers.model", "Model"),
          width: 20,
        },
        {
          key: "manufacture",
          header: t("rtmd.export.headers.manufacture", "Manufacture"),
          width: 20,
        },
        {
          key: "asset_type",
          header: t("rtmd.export.headers.asset_type", "Tipe Aset"),
          width: 20,
        },
        {
          key: "asset_status",
          header: t("rtmd.export.headers.asset_status", "Status Aset"),
          width: 15,
        },
        {
          key: "budget_year",
          header: t("rtmd.export.headers.budget_year", "Tahun Anggaran"),
          width: 15,
        },
        {
          key: "budget_source",
          header: t("rtmd.export.headers.budget_source", "Sumber Anggaran"),
          width: 20,
        },
        {
          key: "edit_time",
          header: t("rtmd.export.headers.edit_time", "Waktu Edit"),
          width: 20,
        },
        {
          key: "asset_vendor",
          header: t("rtmd.export.headers.asset_vendor", "Vendor Aset"),
          width: 20,
        },
        {
          key: "communication_provider",
          header: t(
            "rtmd.export.headers.communication_provider",
            "Provider Komunikasi"
          ),
          width: 20,
        },
        {
          key: "longitude",
          header: t("rtmd.export.headers.longitude", "Longitude"),
          width: 15,
        },
        {
          key: "latitude",
          header: t("rtmd.export.headers.latitude", "Latitude"),
          width: 15,
        },
      ]

      const sheet = t("rtmd.export.sheet", "Data Alat Pemantau")
      const excelTemplate = new AssetMonitoringDeviceExport()
      await excelTemplate.initSheet(sheet)

      excelTemplate.setLanguage(language)
      excelTemplate.setTitle(title)
      excelTemplate.setTimezone(timezone)
      excelTemplate.setColumns(columns)
      await excelTemplate.addRows(sheet, rows)

      logger.info(
        `Excel export generated successfully with ${rows.length} records`
      )

      return excelTemplate
    } catch (error) {
      logger.error(
        `Error exporting to Excel: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      throw new ValidationError("Failed to export data to Excel")
    }
  }

  async exportAsync(c: Context, params: GetAssetMonitoringDevicesQueryParams) {
    const { role: roleId } = c.var
    if (roleId === USER_ROLE.VENDOR_IOT) {
      const currentUser = c.get("user")
      if (currentUser?.manufacture_id) {
        params = {
          ...params,
          manufacture_ids: [currentUser.manufacture_id],
        }
      }
    }

    return this.handleAsyncExport(c, TOPIC.ASSET_MONITORING_DEVICE_EXPORTED, {
      filename: c.var.t("rtmd.export.title"),
      params,
      ext: "xlsx",
    })
  }

  private async validateBusinessRules(
    c: Context,
    data: AddAssetMonitoringDeviceRequest
  ): Promise<void> {
    const currentYear = new Date().getFullYear()

    if (data.budget_year && data.budget_year < currentYear - 10) {
      throw new ValidationError("Budget year is too old")
    }
    if (data.budget_year && data.budget_year > currentYear + 5) {
      throw new ValidationError(
        "Budget year cannot be more than 5 years in the future"
      )
    }

    const phoneRegex = /^\+?[\d\s\-()]{10,20}$/

    if (data.contact_persons) {
      for (let i = 0; i < data.contact_persons.length; i++) {
        const contactPerson = data.contact_persons[i]
        if (contactPerson && !phoneRegex.test(contactPerson.phone)) {
          throw new ValidationError(
            `Invalid phone number format for contact person ${i + 1}`
          )
        }
      }
    }

    if (data.entity_id) {
      await this.validateEntityPermissions(data.entity_id)
    }

    if (data.serial_number) {
      const serialNumberRegex = /^[A-Za-z0-9\-_.\s]+$/
      if (!serialNumberRegex.test(data.serial_number)) {
        throw new ValidationError("Serial number contains invalid characters")
      }

      if (data.serial_number.trim().length === 0) {
        throw new ValidationError(
          "Serial number cannot be empty or just whitespace"
        )
      }

      const isSerialNumberUnique = await this.repository.validateSerialNumber(
        c,
        data.serial_number
      )
      if (!isSerialNumberUnique) {
        throw new ValidationError(
          "Serial number already exists. Please use a different serial number"
        )
      }
    }

    await this.validateRequiredReferences(c, data)
    await this.validateAssetRelationship(c, data)
  }

  // Additional validation for asset relationship in create operation
  private async validateAssetRelationship(
    c: Context,
    data: AddAssetMonitoringDeviceRequest
  ): Promise<void> {
    if (
      data.asset_type_id &&
      data.manufacture_id &&
      data.asset_model_id &&
      !(await this.repository.validateAssetRelationship(
        c,
        data.asset_type_id,
        data.manufacture_id,
        data.asset_model_id
      ))
    ) {
      throw new ValidationError(
        "Invalid asset combination. The selected asset model is not available for the specified asset type and manufacturer."
      )
    }
  }

  // Additional validation for asset relationship in update operation
  private async validateUpdateAssetRelationship(
    c: Context,
    data: EditAssetMonitoringDeviceRequest
  ): Promise<void> {
    if (
      data.asset_type_id &&
      data.manufacture_id &&
      data.asset_model_id &&
      !(await this.repository.validateAssetRelationship(
        c,
        data.asset_type_id,
        data.manufacture_id,
        data.asset_model_id
      ))
    ) {
      throw new ValidationError(
        "Invalid asset combination. The selected asset model is not available for the specified asset type and manufacturer."
      )
    }
  }

  private async validateUpdateBusinessRules(
    c: Context,
    data: EditAssetMonitoringDeviceRequest
  ): Promise<void> {
    const currentYear = new Date().getFullYear()

    if (data.budget_year) {
      if (data.budget_year < currentYear - 10) {
        throw new ValidationError("Budget year is too old")
      }
      if (data.budget_year > currentYear + 5) {
        throw new ValidationError(
          "Budget year cannot be more than 5 years in the future"
        )
      }
    }

    const phoneRegex = /^\+?[\d\s\-()]{10,20}$/

    if (data.contact_persons) {
      for (let i = 0; i < data.contact_persons.length; i++) {
        const contactPerson = data.contact_persons[i]
        if (contactPerson && !phoneRegex.test(contactPerson.phone)) {
          throw new ValidationError(
            `Invalid phone number format for contact person ${i + 1}`
          )
        }
      }
    }

    if (data.entity_id) {
      await this.validateEntityPermissions(data.entity_id)
    }

    await this.validateUpdateReferences(c, data)
    await this.validateUpdateAssetRelationship(c, data)
  }

  private async validateRequiredReferences(
    c: Context,
    data: AddAssetMonitoringDeviceRequest
  ): Promise<void> {
    if (
      data.asset_type_id &&
      !(await this.repository.validateAssetType(c, data.asset_type_id))
    ) {
      throw new ValidationError("Invalid asset type")
    }

    if (
      data.asset_model_id &&
      !(await this.repository.validateAssetModel(c, data.asset_model_id))
    ) {
      throw new ValidationError("Invalid asset model")
    }

    if (
      data.manufacture_id &&
      !(await this.repository.validateManufacture(c, data.manufacture_id))
    ) {
      throw new ValidationError("Invalid manufacture")
    }

    if (
      data.asset_vendor_id &&
      !(await this.repository.validateAssetVendor(c, data.asset_vendor_id))
    ) {
      throw new ValidationError("Invalid asset vendor")
    }

    if (
      data.asset_communication_provider_id &&
      !(await this.repository.validateCommunicationProvider(
        c,
        data.asset_communication_provider_id
      ))
    ) {
      throw new ValidationError("Invalid communication provider")
    }

    if (
      data.asset_rtmd_status_id &&
      !(await this.repository.validateAssetRtmdStatus(
        c,
        data.asset_rtmd_status_id
      ))
    ) {
      throw new ValidationError("Invalid RTMD status")
    }

    if (
      data.entity_id &&
      !(await this.repository.validateEntity(c, data.entity_id))
    ) {
      throw new ValidationError("Invalid entity")
    }

    if (
      data.budget_source_id &&
      !(await this.repository.validateBudgetSource(c, data.budget_source_id))
    ) {
      throw new ValidationError("Invalid budget source")
    }
  }

  private async validateUpdateReferences(
    c: Context,
    data: EditAssetMonitoringDeviceRequest
  ): Promise<void> {
    if (
      data.asset_type_id &&
      !(await this.repository.validateAssetType(c, data.asset_type_id))
    ) {
      throw new ValidationError("Invalid asset type")
    }

    if (
      data.asset_model_id &&
      !(await this.repository.validateAssetModel(c, data.asset_model_id))
    ) {
      throw new ValidationError("Invalid asset model")
    }

    if (
      data.manufacture_id &&
      !(await this.repository.validateManufacture(c, data.manufacture_id))
    ) {
      throw new ValidationError("Invalid manufacture")
    }

    if (
      data.asset_vendor_id &&
      !(await this.repository.validateAssetVendor(c, data.asset_vendor_id))
    ) {
      throw new ValidationError("Invalid asset vendor")
    }

    if (
      data.asset_communication_provider_id &&
      !(await this.repository.validateCommunicationProvider(
        c,
        data.asset_communication_provider_id
      ))
    ) {
      throw new ValidationError("Invalid communication provider")
    }

    if (
      data.asset_rtmd_status_id &&
      !(await this.repository.validateAssetRtmdStatus(
        c,
        data.asset_rtmd_status_id
      ))
    ) {
      throw new ValidationError("Invalid RTMD status")
    }

    if (
      data.entity_id &&
      !(await this.repository.validateEntity(c, data.entity_id))
    ) {
      throw new ValidationError("Invalid entity")
    }

    if (
      data.budget_source_id &&
      !(await this.repository.validateBudgetSource(c, data.budget_source_id))
    ) {
      throw new ValidationError("Invalid budget source")
    }
  }

  private async validateEntityPermissions(entityId: number): Promise<void> {
    logger.debug(
      `Validating entity permissions for Asset Monitoring Device - Entity ID: ${entityId}`
    )
  }

  async validateUserEntityAccess(c: Context, entityId: number): Promise<void> {
    const currentUser = c.get("user")
    if (!currentUser) {
      throw new ValidationError("User not authenticated")
    }

    logger.debug(
      `Validating user entity access - User ID: ${currentUser.id}, Entity ID: ${entityId}`
    )
  }

  async updateStatus(
    c: Context,
    id: number,
    status: number
  ): Promise<{ id: number }> {
    try {
      const currentUser = c.get("user")
      if (!currentUser) {
        throw new ValidationError("User not authenticated")
      }

      if (status !== STATUS.ACTIVE && status !== STATUS.INACTIVE) {
        throw new ValidationError(
          `Status must be either ${STATUS.INACTIVE} (inactive) or ${STATUS.ACTIVE} (active)`
        )
      }

      const exists = await this.repository.existsById(c, id)
      if (!exists) {
        throw new NotFoundError("Asset Monitoring Device not found")
      }

      const updated = await this.repository.updateStatus(c, id, status)

      if (!updated) {
        throw new ValidationError(
          "Failed to update Asset Monitoring Device status"
        )
      }

      logger.info(
        `Asset Monitoring Device status updated successfully - ID: ${id}, Status: ${status}, User: ${currentUser.id}`
      )

      return { id }
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ForbiddenError
      ) {
        throw error
      }

      logger.error(
        `Error updating Asset Monitoring Device status: ${error instanceof Error ? error.message : "Unknown error"} - ID: ${id}, Status: ${status}`
      )

      throw new ValidationError(
        "Failed to update Asset Monitoring Device status"
      )
    }
  }

  async getStatusList(
    c: Context,
    params?: { page?: number; paginate?: number }
  ) {
    const { t } = c.var
    const paginationParams = {
      page: params?.page ?? 1,
      paginate: params?.paginate ?? 10,
    }
    logger.info("Fetching RTMD status list")

    const { data, total } = await this.repository.getStatusList(c, params)

    if (data.length === 0) {
      return new PaginatedResponse(paginationParams)
    }

    const translatedData = data.map((status) => ({
      id: status.id,
      name: t(status.name, status.name),
    }))

    logger.info(
      `RTMD status list fetched successfully - Total: ${total}, Page: ${params?.page || 1}, Per Page: ${params?.paginate || 10}`
    )

    return new PaginatedResponse(paginationParams, translatedData, total)
  }

  async getAssetMonitoringDeviceInventoryOperations(
    c: Context,
    assetRtmdId: number
  ) {
    try {
      // Check if the RTMD device exists
      const rtmdDevice = await this.repository.findById(c, assetRtmdId)
      if (!rtmdDevice) {
        throw new NotFoundError("Asset Monitoring Device not found")
      }

      logger.info(
        `Fetching inventory operations for RTMD Device ID: ${assetRtmdId}`
      )

      const operations =
        await this.repository.getAssetMonitoringDeviceInventoryOperations(
          c,
          assetRtmdId
        )

      logger.info(
        `Inventory operations fetched successfully for RTMD Device ID: ${assetRtmdId}, Count: ${operations.length}`
      )

      const enrichedOperations = await Promise.all(
        operations.map(async (operation) => {
          if (operation.asset_type && operation.asset_model) {
            const assetClassification =
              await this.repository.getAssetClassification(
                c,
                operation.asset_type.id
              )

            const isWarehouse =
              assetClassification?.asset_classifications_id ===
              ASSET_CLASSIFICATION.WAREHOUSE

            const temperatureThresholds =
              await this.repository.getTemperatureThresholds(
                c,
                operation.asset_model.id,
                operation.asset_type.id,
                isWarehouse
              )

            const humidityThresholds = isWarehouse
              ? await this.repository.getHumidityThresholds(
                  c,
                  operation.asset_type.id
                )
              : []

            return {
              ...operation,
              asset_type: {
                ...operation.asset_type,
                is_warehouse: isWarehouse ? 1 : 0,
                temperature_thresholds: temperatureThresholds.map(
                  (tt, index) => ({
                    id: tt.id,
                    min_temperature: tt.min_temperature,
                    max_temperature: tt.max_temperature,
                    is_active: index === 0 ? 1 : 0,
                  })
                ),
                min_temperature:
                  temperatureThresholds.length > 0
                    ? Math.min(
                        ...temperatureThresholds.map((t) => t.min_temperature)
                      )
                    : null,
                max_temperature:
                  temperatureThresholds.length > 0
                    ? Math.max(
                        ...temperatureThresholds.map((t) => t.max_temperature)
                      )
                    : null,
                humidity_thresholds: humidityThresholds,
              },
            }
          }
          return operation
        })
      )

      return { data: enrichedOperations }
    } catch (error) {
      logger.error(
        `Error fetching inventory operations for RTMD Device ID ${assetRtmdId}: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      throw error
    }
  }

  private async getEntityByRole(c: Context) {
    const { deviceType, role: roleId } = c.var

    if (roleId === USER_ROLE.SUPERADMIN || roleId === USER_ROLE.VENDOR_IOT) {
      return undefined
    }

    const userEntity = await this.repository.getEntityById(c, c.var.entityId!)

    let entityId: number | number[]

    if (
      roleId === USER_ROLE.MANAGER &&
      deviceType === DEVICE_TYPE.web &&
      userEntity.type === 1 &&
      userEntity.province_id
    ) {
      const entities = await this.repository.getEntityByProvince(
        c,
        userEntity.province_id
      )

      entityId = entities.map((item) => item.id)
    }

    if (
      roleId === USER_ROLE.MANAGER &&
      deviceType === DEVICE_TYPE.web &&
      userEntity.type === 2 &&
      userEntity.regency_id
    ) {
      const entities = await this.repository.getEntityByRegency(
        c,
        userEntity.regency_id
      )

      entityId = entities.map((item) => item.id)
    }

    if (deviceType === DEVICE_TYPE.mobile) {
      entityId = userEntity.id
    }

    if (!entityId) {
      entityId = userEntity.id
    }

    return entityId
  }

  private async getVendorIotFilter(
    c: Context,
    currentUser: { id: number; manufacture_id?: number }
  ): Promise<number | number[]> {
    if (!currentUser?.manufacture_id) {
      return currentUser.id
    }

    const mapping = await this.repository.getIntegrationMapping(
      c,
      currentUser.manufacture_id,
      currentUser.id
    )

    if (mapping && mapping.external_id) {
      const externalIds = mapping.external_id
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n))

      if (externalIds.length > 0) {
        if (externalIds.includes(currentUser.id)) {
          return externalIds
        }
      }
    }

    return currentUser.id
  }
}
