import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import {
  GetEntitiesSchema,
  GetAnalysisParameterByIdSchema,
  GetAnalysisParametersQuerySchema,
  CreateEnvironmentalTestSchema,
  GetHistorySchema,
  UpdateEnvironmentalTestParamSchema,
  UpdateEnvironmentalTestSchema,
  GetAssetInventoriesQuerySchema,
  CreateUnitSchema,
  GetDocumentParamSchema,
  GetDocumentQuerySchema,
  GetParameterCategoriesQuerySchema,
  GetManagementAssetsQuerySchema,
  GetActivityMaterialParamSchema,
  GetActivityDetailParamSchema,
  GetActivityDetailQuerySchema,
  GetDistributionDetailsParamSchema,
} from "./environmental-health.schema.js"
import { GetActivityQuerySchema } from "../activity/activity.schema.js"

export class EnvironmentalHealthMiddleware extends BaseMiddleware {
  constructor() {
    super()
  }

  readonly getEntities = GetEntitiesSchema
  readonly getActivities = GetActivityQuerySchema
  readonly getParameterCategoriesQuery = GetParameterCategoriesQuerySchema
  readonly getAnalysisParameterById = GetAnalysisParameterByIdSchema

  readonly getAnalysisParametersQuery = GetAnalysisParametersQuerySchema
  readonly createEnvironmentalTest = CreateEnvironmentalTestSchema
  readonly getHistory = GetHistorySchema
  readonly updateEnvironmentalTestParam = UpdateEnvironmentalTestParamSchema
  readonly updateEnvironmentalTest = UpdateEnvironmentalTestSchema
  readonly getAssetInventoriesQuery = GetAssetInventoriesQuerySchema
  readonly getManagementAssetsQuery = GetManagementAssetsQuerySchema
  readonly createUnit = CreateUnitSchema
  readonly getDocumentParam = GetDocumentParamSchema
  readonly getDocumentQuery = GetDocumentQuerySchema
  readonly getActivityMaterialParam = GetActivityMaterialParamSchema
  readonly getActivityDetailParam = GetActivityDetailParamSchema
  readonly getActivityDetailQuery = GetActivityDetailQuerySchema
  readonly getDistributionDetailsParam = GetDistributionDetailsParamSchema
}
