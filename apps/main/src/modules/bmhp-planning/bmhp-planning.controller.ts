import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpPlanningModule } from "./bmhp-planning.module.js"
import { BmhpPlanningMiddleware } from "./bmhp-planning.middleware.js"
import {
  CheckPlanningQuerySchema,
  GetListPlanningQuerySchema,
  GetPlanningEditParamSchema,
  UpdatePlanningEditBodySchema,
  CityDistrictHealthOfficeTargetSchema,
  GetProgramPlansWithStatusQuerySchema,
} from "./bmhp-planning.schema.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { BaseController } from "@smile/lib/base/controller.js"

export class BmhpPlanningController extends BaseController {
  constructor(
    private readonly module: BmhpPlanningModule,
    private readonly middleware: BmhpPlanningMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/check",
      this.validateRequest("query", CheckPlanningQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.check(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/program-plans",
      this.validateRequest("query", GetProgramPlansWithStatusQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.getProgramPlansWithStatus(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/history",
      this.validateRequest("query", GetListPlanningQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/history/xls",
      this.validateRequest("query", GetListPlanningQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const file = await this.module.exportList(c, query)

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
      "/history/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    router.delete(
      "/history/:id",
      this.validateRequest("param", IdParamsSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.delete(c, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    // Mobile app routes for editing planning
    router.get(
      "/edit/:history_id/:target_group_id",
      this.validateRequest("param", GetPlanningEditParamSchema),
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.getPlanningEdit(
          c,
          param.history_id,
          param.target_group_id
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.put(
      "/edit",
      this.validateRequest("json", UpdatePlanningEditBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.updatePlanningEdit(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/previous-year-data",
      this.validateRequest("json", CityDistrictHealthOfficeTargetSchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.getCityDistrictHealthOfficeTarget(
          c,
          body
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/",
      this.validateRequest("json", this.middleware.validateCreatePlanning),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createPlanning(c, body)

        return c.json(
          {
            status: true,
            message: "Planning created successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/target-groups",
      this.validateRequest(
        "json",
        this.middleware.validateCreateTargetGroups()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createPlanningTargetGroups(c, body)

        return c.json(
          {
            status: true,
            message: "Target groups added successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/examination-target-materials",
      this.validateRequest(
        "json",
        this.middleware.validateCreateExaminationTargetMaterials()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createExaminationTargetMaterials(
          c,
          body
        )

        return c.json(
          {
            status: true,
            message: "Examination target materials added successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/examination",
      this.validateRequest("json", this.middleware.validateSetupExamination()),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createExamination(c, body)

        return c.json(
          {
            status: true,
            message: "Examination setup completed successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    // Master Data Routes

    router.post(
      "/master/parameters",
      this.validateRequest(
        "json",
        this.middleware.validateCreateBmhpParameter()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createBmhpParameter(c, body)

        return c.json(
          {
            status: true,
            message: "BMHP Parameter created successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/master/target-groups",
      this.validateRequest(
        "json",
        this.middleware.validateCreateBmhpTargetGroup()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createBmhpTargetGroup(c, body)

        return c.json(
          {
            status: true,
            message: "BMHP Target Group created successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/master/examination-methods",
      this.validateRequest(
        "json",
        this.middleware.validateCreateBmhpExaminationMethod()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createBmhpExaminationMethod(c, body)

        return c.json(
          {
            status: true,
            message: "BMHP Examination Method created successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    router.post(
      "/master/materials",
      this.validateRequest(
        "json",
        this.middleware.validateCreateBmhpMaterial()
      ),
      async (c) => {
        const body = c.req.valid("json")

        const result = await this.module.createBmhpMaterial(c, body)

        return c.json(
          {
            status: true,
            message: "BMHP Material created successfully",
            data: result,
          },
          StatusCodes.CREATED
        )
      }
    )

    return router
  }
}
