import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { EnvironmentalHealthModule } from "./environmental-health.module.js"
import { EnvironmentalHealthMiddleware } from "./environmental-health.middleware.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { DEVICE_TYPE } from "@/common/constants/device.js"

export class EnvironmentalHealthController extends BaseController {
  constructor(
    private readonly module: EnvironmentalHealthModule,
    private readonly middleware: EnvironmentalHealthMiddleware,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("environmental_health")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/entities",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getEntities),
      async (c) => {
        const params = c.req.valid("query")

        const result = await this.module.getEntities(c, {
          page: params.page,
          perPage: params.per_page,
          search: params.search,
          provinceId: params.province_id,
          regencyId: params.regency_id,
          subDistrictId: params.sub_district_id,
        })

        const totalPages = Math.ceil(result.total / result.perPage)

        return c.json({
          success: true,
          message: c.var.t("environmental_health.message.entities_retrieved"),
          data: result.data,
          meta: {
            total: result.total,
            page: result.page,
            per_page: result.perPage,
            total_pages: totalPages,
          },
        })
      }
    )

    router.get(
      "/entities/customers",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getEntities),
      async (c) => {
        const params = c.req.valid("query")

        const result = await this.module.getVendorEntities(c, {
          page: params.page,
          perPage: params.per_page,
          search: params.search,
        })

        const totalPages = Math.ceil(result.total / result.perPage)

        return c.json({
          success: true,
          message: c.var.t("environmental_health.message.entities_retrieved"),
          data: result.data,
          meta: {
            total: result.total,
            page: result.page,
            per_page: result.perPage,
            total_pages: totalPages,
          },
        })
      }
    )

    router.get(
      "/activities",
      this.validateRequest("query", this.middleware.getActivities),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getActivities(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/activities/:activity_id/materials",
      this.validateRequest("param", this.middleware.getActivityMaterialParam),
      async (c) => {
        const { activity_id } = c.req.valid("param")
        const data = await this.module.getActivityMaterials(c, activity_id)
        return c.json({ success: true, message: "OK", data })
      }
    )

    router.get(
      "/transactions",
      this.validateRequest("query", this.middleware.getActivityDetailQuery),
      async (c) => {
        const query = c.req.valid("query")
        const data = await this.module.getTransactionDetail(c, query)
        return c.json(data, StatusCodes.OK)
      }
    )

    router.get(
      "/management-assets",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getManagementAssetsQuery),
      async (c) => {
        const { page, per_page, search } = c.req.valid("query")
        const result = await this.module.getManagementAssets(c, {
          page,
          perPage: per_page,
          search,
        })
        return c.json(
          {
            page,
            item_per_page: per_page,
            total_item: result.total,
            total_page: Math.ceil(result.total / per_page),
            list_pagination: [10, 25, 50, 100],
            data: result.data,
          },
          StatusCodes.OK
        )
      }
    )

    router.get(
      "/activities/:activity_id/material-detail",
      this.validateRequest("param", this.middleware.getActivityDetailParam),
      this.validateRequest("query", this.middleware.getActivityDetailQuery),
      async (c) => {
        const { activity_id } = c.req.valid("param")
        const query = c.req.valid("query")
        const data = await this.module.getActivityMaterialDetail(
          c,
          activity_id,
          query
        )
        return c.json(data, StatusCodes.OK)
      }
    )

    router.get(
      "/history",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getHistory),
      async (c) => {
        const params = c.req.valid("query")

        const result = await this.module.getHistory(c, {
          page: params.page,
          perPage: params.per_page,
          search: params.search,
          entityId: params.entity_id,
          startDate: params.start_date,
          endDate: params.end_date,
          status: params.status,
        })

        return c.json({
          success: true,
          message: c.var.t("environmental_health.message.history_retrieved"),
          ...result,
        })
      }
    )

    router.get(
      "/history/:id/distribution-details",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("param", this.middleware.getDistributionDetailsParam),
      async (c) => {
        const { id } = c.req.valid("param")
        const result = await this.module.getDistributionDetails(c, id)
        return c.json(
          {
            success: true,
            data: result,
          },
          StatusCodes.OK
        )
      }
    )

    router.get(
      "/history/xls",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getHistory),
      async (c) => {
        const params = c.req.valid("query")

        const file = await this.module.exportHistory(c, {
          search: params.search,
          entityId: params.entity_id,
          startDate: params.start_date,
          endDate: params.end_date,
          status: params.status,
        })

        const base64 = Buffer.from(file.buffer).toString("base64")

        return c.json({
          filename: file.filename,
          base64: base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    router.get(
      "/parameter-categories",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest(
        "query",
        this.middleware.getParameterCategoriesQuery
      ),
      async (c) => {
        const { activity_id } = c.req.valid("query")

        const data = await this.module.getParameterCategories(c, {
          activityId: activity_id,
        })

        return c.json({
          success: true,
          message: c.var.t(
            "environmental_health.message.parameter_categories_retrieved"
          ),
          data,
        })
      }
    )

    router.get(
      "/analysis-parameters",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getAnalysisParametersQuery),
      async (c) => {
        const params = c.req.valid("query")

        const data = await this.module.getAnalysisParameters(c, {
          parameterCategoryId: params.parameter_category_id,
        })

        return c.json({
          success: true,
          message: c.var.t(
            "environmental_health.message.analysis_parameters_retrieved"
          ),
          data,
        })
      }
    )

    router.get(
      "/analysis-parameters/:id/methods",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("param", this.middleware.getAnalysisParameterById),
      async (c) => {
        const { id } = c.req.valid("param")

        const data = await this.module.getAnalysisParameterWithMethods(
          c,
          Number(id)
        )

        return c.json({
          success: true,
          message: c.var.t(
            "environmental_health.message.test_methods_retrieved"
          ),
          data,
        })
      }
    )

    router.get(
      "/asset-inventories",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("query", this.middleware.getAssetInventoriesQuery),
      async (c) => {
        const { search } = c.req.valid("query")
        const entityId = Number(c.var.userEntity?.global_id || 0)

        const data = await this.module.getAssetInventories(c, entityId, search)

        return c.json({
          success: true,
          message: c.var.t(
            "environmental_health.message.asset_inventories_retrieved"
          ),
          data,
        })
      }
    )

    router.get(
      "/units",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      async (c) => {
        const data = await this.module.getUnits(c)

        return c.json({
          success: true,
          message: c.var.t("environmental_health.message.units_retrieved"),
          data,
        })
      }
    )

    router.post(
      "/units",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("json", this.middleware.createUnit),
      async (c) => {
        const payload = c.req.valid("json")

        const result = await this.module.createUnit(c, payload)

        return c.json(
          {
            success: true,
            message: c.var.t("environmental_health.message.unit_created"),
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/tests",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("json", this.middleware.createEnvironmentalTest),
      async (c) => {
        const payload = c.req.valid("json")

        const result = await this.module.createEnvironmentalTest(c, payload)

        return c.json(
          {
            success: true,
            message: c.var.t("environmental_health.message.test_created"),
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.put(
      "/tests/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest(
        "param",
        this.middleware.updateEnvironmentalTestParam
      ),
      this.validateRequest("json", this.middleware.updateEnvironmentalTest),
      async (c) => {
        const { id } = c.req.valid("param")
        const payload = c.req.valid("json")

        const result = await this.module.updateEnvironmentalTest(c, id, payload)

        return c.json({
          success: true,
          message: c.var.t("environmental_health.message.test_updated"),
          data: result,
        })
      }
    )

    router.get(
      "/tests/:id/document",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.web],
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.ADMIN, DEVICE_TYPE.mobile],
        [USER_ROLE.MANAGER, DEVICE_TYPE.mobile],
        [USER_ROLE.OPERATOR, DEVICE_TYPE.mobile],
      ]),
      this.validateRequest("param", this.middleware.getDocumentParam),
      this.validateRequest("query", this.middleware.getDocumentQuery),
      async (c) => {
        const { id } = c.req.valid("param")
        const { type } = c.req.valid("query")

        const result = await this.module.generateDocument(c, id, type)

        return c.json(result)
      }
    )

    return router
  }
}
