import { Context } from "hono"
import { z } from "zod"
import { BmhpPlanningRepository } from "./bmhp-planning.repository.js"
import {
  CreateBmhpPlanningBodySchema,
  PlanningIdParamSchema,
  CreateTargetGroupsBodySchema,
  CreateExaminationTargetMaterialsBodySchema,
  SetupExaminationBodySchema,
  CreateBmhpParameterBodySchema,
  CreateBmhpTargetGroupBodySchema,
  CreateBmhpExaminationMethodBodySchema,
  CreateBmhpMaterialBodySchema
} from "./bmhp-planning.schema.js"

export class BmhpPlanningMiddleware {
  constructor(private readonly repository: BmhpPlanningRepository) {}

  validateCreatePlanning = (c: Context) => {
    return CreateBmhpPlanningBodySchema
  }

  validatePlanningIdParam() {
    return PlanningIdParamSchema
  }

  validateCreateTargetGroups() {
    return CreateTargetGroupsBodySchema
  }

  validateCreateExaminationTargetMaterials() {
    return CreateExaminationTargetMaterialsBodySchema
  }

  validateSetupExamination() {
    return SetupExaminationBodySchema
  }

  validateCreateBmhpParameter() {
    return CreateBmhpParameterBodySchema
  }

  validateCreateBmhpTargetGroup() {
    return CreateBmhpTargetGroupBodySchema
  }

  validateCreateBmhpExaminationMethod() {
    return CreateBmhpExaminationMethodBodySchema
  }

  validateCreateBmhpMaterial() {
    return CreateBmhpMaterialBodySchema
  }
}
