import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import {
  GlobalBudgetSourceDTO,
  GlobalManufactureDTO,
  GlobalMaterialDTO,
  StockDetailDTO,
  SubmitTransferStockRequest,
} from "./transaction-transfer-stock.schema.js"
import { collect } from "@smile-health/lib/utils.js"
import { TransactionTransferStockRepository } from "./transaction-transfer-stock.repository.js"
import { ActivityRepository } from "../activity/activity.repository.js"

export class TransactionTransferStockMiddleware {
  constructor(
    private readonly repository: TransactionTransferStockRepository
  ) {}

  readonly #getActivity = async (c: Context, id: number) => {
    if (!id) return null
    const activity = await this.repository.getActivityById(c, id)
    return activity
  }

  readonly #isEntityMaterialActivitiesExist = async (
    c: Context,
    entityId: number,
    entityMaterialActivities: {
      material_id: number
      activity_id: number
      entity_id: number
    }[],
    materialParentIdCompanion: number,
    companionActivityId: number,
    stock?: { material_name: string | null; activity_id: number | null }
  ): Promise<{ need_relation: boolean; list?: string }> => {
    const isExist = entityMaterialActivities.find(
      (ema) =>
        ema.material_id === materialParentIdCompanion &&
        ema.activity_id === companionActivityId &&
        ema.entity_id === entityId
    )

    if (!isExist) {
      const activity = await this.#getActivity(c, companionActivityId)
      return {
        need_relation: true,
        list: `${stock?.material_name || ""} (${activity?.name || ""})`,
      }
    }
    return {
      need_relation: false,
    }
  }

  submit = async (c: Context, body: SubmitTransferStockRequest) => {
    const { entity_id, materials, companion_program_id } = body
    const listStockID = collect(materials, "stock_id")
    const listMaterialID = collect(materials, "material_id")

    const [
      globalEntity,
      stocks,
      globalMaterial,
      globalManufacture,
      globalBudgetSource,
    ] = await Promise.all([
      this.repository.findGlobalEntity(c, entity_id, companion_program_id),
      this.repository.getListStockBatch(c, listStockID),
      this.repository.getListGlobalMaterial(
        c,
        listMaterialID,
        companion_program_id
      ),
      this.repository.getListGlobalManufacture(c, listStockID),
      this.repository.getListGlobalBudgetSource(c, listStockID),
    ])

    if (!globalEntity) {
      throw new ValidationError(
        c.var.t("validator.invalid_submit_transfer_stock_entity_id")
      )
    }

    const parentMaterialIds = globalMaterial
      .map((item) => item.parent_material_id_companion)
      .filter((id): id is number => !!id)
    const activityIds = body.materials
      .map((item) => item.companion_activity_id)
      .filter((id): id is number => !!id)

    const getEntityMaterialActivitiesCustomer =
      await this.repository.getEntityMaterialActivities(
        c,
        globalEntity.entity_id_companion,
        parentMaterialIds,
        activityIds
      )

    body.stocks = stocks as StockDetailDTO[]
    body.global_materials = globalMaterial as GlobalMaterialDTO[]
    body.global_manufactures = globalManufacture as GlobalManufactureDTO[]
    body.global_budget_sources = globalBudgetSource as GlobalBudgetSourceDTO[]
    body.companion_entity_id = globalEntity.entity_id_companion as number
    if (!body.is_acknowledged) {
      c.addError(`is_acknowledged`, "validator.transfer_stock_is_acknowledged")
    }
    materials.forEach((item, idx) => {
      const stock = stocks.find((stock) => {
        return stock.stock_id === item.stock_id
      })
      const material = globalMaterial.find((material) => {
        return material.material_id_source === item.material_id
      })

      if (!stock) {
        c.addError(`${idx}`, "validator.invalid_submit_transfer_stock_stock_id")
      } else if (!material) {
        c.addError(
          `${idx}`,
          "validator.invalid_submit_transfer_stock_material_id"
        )
      } else if (!material.parent_material_id_companion) {
        c.addError(
          `${idx}`,
          "validator.invalid_submit_transfer_stock_parent_material_id"
        )
      } else if (stock.qty < item.qty) {
        c.addError(
          `${idx}`,
          "validator.invalid_submit_transfer_stock_stock_qty"
        )
      } else if (
        item.qty % stock.consumption_unit_per_distribution_unit! !==
        0
      ) {
        c.addError(
          `${idx}`,
          "validator.invalid_submit_transfer_stock_stock_per_unit"
        )
      }
    })

    const entityMaterialActivityNotExist: {
      need_relation: boolean
      list?: string
    }[] = []

    for (const item of materials) {
      const stock = stocks.find((s) => s.stock_id === item.stock_id)
      const material = globalMaterial.find(
        (m) => m.material_id_source === item.material_id
      )

      if (
        !stock ||
        !material ||
        !material.parent_material_id_companion ||
        !item.companion_activity_id
      ) {
        entityMaterialActivityNotExist.push({ need_relation: false })
        continue
      }

      const result = await this.#isEntityMaterialActivitiesExist(
        c,
        globalEntity.entity_id_companion,
        getEntityMaterialActivitiesCustomer,
        material.parent_material_id_companion,
        item.companion_activity_id,
        stock
      )
      entityMaterialActivityNotExist.push(result)
    }

    if (
      entityMaterialActivityNotExist.some((result) => result?.need_relation)
    ) {
      const filteredResults = entityMaterialActivityNotExist.filter(
        (result) => result?.need_relation
      )
      const errorResult = {
        need_relation: true,
        header: c.var.t("header.material_activity_not_found"),
        message: c.var.t("message.material_activity_not_found"),
        list: filteredResults
          .map((result) => result?.list)
          .filter((list): list is string => !!list),
      }
      c.set("errors", errorResult)
      throw new ValidationError()
    }

    if (c.var.errors) {
      throw new ValidationError()
    }

    return body
  }
}
