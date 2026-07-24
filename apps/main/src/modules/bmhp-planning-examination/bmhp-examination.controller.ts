import { BaseController } from "@/modules/base.controller.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BmhpExaminationMiddleware } from "./bmhp-examination.middleware.js"
import {
  BmhpExaminationModule,
  ExaminationTargetMaterialsModule,
  listExaminationTypes,
  detailExaminationType,
  createExaminationType,
  updateExaminationType,
  deleteExaminationType,
  listExaminationsGroupedByType,
} from "./bmhp-examination.module.js"
import { BmhpExaminationTypeRepository } from "./bmhp-examination-type.repository.js"
import { BmhpExaminationRepository } from "./bmhp-examination.repository.js"

export class BmhpExaminationController extends BaseController {
  constructor(
    private readonly examinationTypeRepo: BmhpExaminationTypeRepository,
    private readonly examinationRepo: BmhpExaminationRepository,
    private readonly examinationModule: BmhpExaminationModule,
    private readonly examinationMiddleware: BmhpExaminationMiddleware,
    private readonly targetMaterialsModule: ExaminationTargetMaterialsModule
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    /* ========== Examination Type Routes (/types) ========== */

    router.get(
      "/types",
      this.validateRequest("query", this.examinationMiddleware.typeList),
      async (c) => {
        const query = c.req.valid("query")
        const response = await listExaminationTypes(c, this.examinationTypeRepo, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/types/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.typeDetail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await detailExaminationType(c, this.examinationTypeRepo, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/types",
      this.validateRequest("json", this.examinationMiddleware.typeCreate),
      async (c) => {
        const body = c.req.valid("json")
        const response = await createExaminationType(c, this.examinationTypeRepo, body)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.put(
      "/types/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.typeDetail,
      this.validateRequest("json", this.examinationMiddleware.typeUpdate),
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        const result = await updateExaminationType(c, this.examinationTypeRepo, Number(param.id), body)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.delete(
      "/types/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.typeDelete,
      async (c) => {
        const param = c.req.valid("param")
        const result = await deleteExaminationType(c, this.examinationTypeRepo, Number(param.id))
        return c.json(result, StatusCodes.OK)
      }
    )

    /* ========== Examination Routes (/) ========== */

    router.get(
      "/",
      this.validateRequest("query", this.examinationMiddleware.list),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.examinationModule.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    /* ========== Examination Target Materials Routes (/target-materials) ========== */
    // Must be registered before /:id to avoid route conflict

    router.get(
      "/target-materials",
      async (c) => {
        const page = Number(c.req.query("page") || "1")
        const paginate = Number(c.req.query("per_page") || "10")
        const bmhp_material_id = c.req.query("bmhp_material_id")
        const exam_target_group_id = c.req.query("exam_target_group_id")
        const sort_by = c.req.query("sort_by")
        const sort_type = c.req.query("sort_type")

        const query = {
          page,
          paginate,
          bmhp_material_id: bmhp_material_id ? Number(bmhp_material_id) : undefined,
          exam_target_group_id: exam_target_group_id ? Number(exam_target_group_id) : undefined,
          sort_by,
          sort_type,
        }

        const response = await this.targetMaterialsModule.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/target-materials/by-material/:materialId",
      async (c) => {
        const materialId = Number(c.req.param("materialId"))
        const response = await this.targetMaterialsModule.getByMaterial(c, materialId)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/target-materials/by-exam-target-group/:examTargetGroupId",
      async (c) => {
        const examTargetGroupId = Number(c.req.param("examTargetGroupId"))
        const response = await this.targetMaterialsModule.getByExamTargetGroup(c, examTargetGroupId)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/target-materials/:id",
      async (c) => {
        const id = Number(c.req.param("id"))
        const response = await this.targetMaterialsModule.detail(c, id)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/target-materials",
      async (c) => {
        const body = await c.req.json()
        const response = await this.targetMaterialsModule.create(c, body)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.put(
      "/target-materials/:id",
      async (c) => {
        const id = Number(c.req.param("id"))
        const body = await c.req.json()
        const response = await this.targetMaterialsModule.update(c, id, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.delete(
      "/target-materials/:id",
      async (c) => {
        const id = Number(c.req.param("id"))
        const response = await this.targetMaterialsModule.delete(c, id)
        return c.json(response, StatusCodes.OK)
      }
    )

    /* ========== Mobile App Routes ========== */
    
    router.get("/grouped", async (c) => {
      const response = await listExaminationsGroupedByType(c, this.examinationRepo)
      return c.json({ data: response }, StatusCodes.OK)
    })

    router.get(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.examinationModule.detail(
          c,
          Number(param.id)
        )
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/",
      this.validateRequest("json", this.examinationMiddleware.create),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.examinationModule.create(c, body)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.put(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.detail,
      this.validateRequest("json", this.examinationMiddleware.update),
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        const result = await this.examinationModule.update(
          c,
          Number(param.id),
          body
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    router.delete(
      "/:id",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.delete,
      async (c) => {
        const param = c.req.valid("param")
        const result = await this.examinationModule.delete(
          c,
          Number(param.id)
        )
        return c.json(result, StatusCodes.OK)
      }
    )

    router.get(
      "/:id/target-groups",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.examinationModule.getTargetGroups(c, Number(param.id))

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/:id/methods",
      this.validateRequest("param", IdParamsSchema),
      this.examinationMiddleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.examinationModule.getMethods(c, Number(param.id))

        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
