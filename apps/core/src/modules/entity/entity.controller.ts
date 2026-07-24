import { RoleValidationMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { ExcelMiddleware } from "@smile/lib/middlewares"
import { Context, Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { EntityTemplate } from "./entity.excel.js"
import { EntityMiddleware } from "./entity.middleware.js"
import { EntityModule } from "./entity.module.js"
import { GetEntitiesParamsSchema } from "./entity.schema.js"
import { EntityImportPublisher } from "./entity.import.publisher.js"

export class EntityController extends BaseController {
  constructor(
    private readonly module: EntityModule,
    private readonly entityMiddleware: EntityMiddleware,
    private readonly excelMiddleware: ExcelMiddleware,
    private readonly roleValidationMiddleware: RoleValidationMiddleware,
    private readonly importPublisher: EntityImportPublisher
  ) {
    super("entity")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", GetEntitiesParamsSchema),
      async (c) => {
        const paramQuery = c.req.valid("query")
        const page = await this.module.list(c, paramQuery)
        return c.json(page, StatusCodes.OK)
      }
    )

    router.post(
      "/",
      this.validateRequest("json", this.entityMiddleware.create),
      this.entityMiddleware.sanitizeEntityData(),
      async (c) => {
        const data = c.req.valid("json")
        const entity = await this.module.saveEntity(c, data)
        return c.json(entity, StatusCodes.OK)
      }
    )

    router.post(
      "/xls",
      this.excelMiddleware.validateFileMiddleware,
      this.validateExcelRequest(
        this.entityMiddleware.import,
        new EntityTemplate()
      ),
      async (c) => {
        const rows = c.req.valid("json")
        const response = await this.module.import(c, rows)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.post(
      "/xls/async",
      this.excelMiddleware.validateFileMiddleware,
      this.validateExcelRequest(
        this.entityMiddleware.importAsync,
        new EntityTemplate()
      ),
      async (c) => {
        const rows = c.req.valid("json")

        const LARGE_IMPORT_THRESHOLD = 10000
        if (rows.length <= LARGE_IMPORT_THRESHOLD) {
          const response = {
            success: true,
            message: `Import job queued for ${rows.length} rows. Processing in background.`,
            is_queued: true,
            total_rows: rows.length,
          }

          await this.handleLargeImportInBackground(c, rows, c.var.accountID)

          return c.json(response, StatusCodes.ACCEPTED)
        } else {
          return c.json(
            {
              success: false,
              message: `Import request exceeds the maximum allowed rows of ${LARGE_IMPORT_THRESHOLD}. Please split your import file and try again.`,
              is_queued: false,
              total_rows: rows.length,
            },
            StatusCodes.BAD_REQUEST
          )
        }
      }
    )

    router.get(
      "/xls",
      this.validateRequest("query", this.entityMiddleware.list),
      async (c) => {
        const paramQuery = c.req.valid("query")

        const response = await this.module.getExportedData(c, paramQuery)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/xls-template",
      this.excelMiddleware.handleExport,
      async (c) => {
        const template = await this.module.getTemplate(c)
        c.set("file", template)
      }
    )

    router.get("/:id", this.entityMiddleware.entityIdValidation, async (c) => {
      const param = c.req.valid("param")
      const entities = await this.module.getDetail(c, Number(param.id))

      return c.json(entities, StatusCodes.OK)
    })

    router.put(
      "/:id",
      this.entityMiddleware.entityIdValidation,
      this.validateRequest(
        "json",
        this.entityMiddleware.create,
        this.entityMiddleware.checkEntityRelation
      ),
      this.entityMiddleware.sanitizeEntityData(),
      async (c) => {
        const param = c.req.valid("param")
        const data = c.req.valid("json")

        const entity = await this.module.updateEntity(c, data, Number(param.id))
        return c.json(entity, StatusCodes.OK)
      }
    )

    return router
  }

  private async handleLargeImportInBackground(
    c: Context,
    rows: any[],
    accountID: number
  ) {
    // Publish the import job to RabbitMQ for background processing
    await this.importPublisher.processLargeImport(c, rows, accountID)
  }
}
