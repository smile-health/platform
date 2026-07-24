import { describe, expect, it } from "vitest"
import {
  MATERIAL_LEVEL,
  getTranslateMaterialColumnsExcel,
  getTranslateMaterialVolumeColumnsExcel,
} from "@/common/constants/material.js"
import type { Context } from "hono"

describe("MATERIAL_LEVEL", () => {
  it("has correct numeric values", () => {
    expect(MATERIAL_LEVEL.INGREDIENT).toBe(1)
    expect(MATERIAL_LEVEL.TEMPLATE).toBe(2)
    expect(MATERIAL_LEVEL.VARIANT).toBe(3)
    expect(MATERIAL_LEVEL.PACKAGING).toBe(4)
  })

  it("has exactly 4 entries", () => {
    expect(Object.keys(MATERIAL_LEVEL)).toHaveLength(4)
  })
})

describe("getTranslateMaterialColumnsExcel", () => {
  const mockCtx = { var: { t: (k: string) => k } } as unknown as Context

  it("returns an object with exactly 18 properties", () => {
    const result = getTranslateMaterialColumnsExcel(mockCtx)
    expect(Object.keys(result)).toHaveLength(18)
  })

  it("includes the is_temperature_sensitive key", () => {
    const result = getTranslateMaterialColumnsExcel(mockCtx)
    expect(result).toHaveProperty("is_temperature_sensitive")
  })

  it("returns the i18n key as value via identity mock", () => {
    const result = getTranslateMaterialColumnsExcel(mockCtx)
    expect(result.name).toBe("material.label.name")
    expect(result.description).toBe("material.label.description")
    expect(result.code).toBe("material.label.code")
    expect(result.is_temperature_sensitive).toBe(
      "material.label.is_temperature_sensitive"
    )
  })

  it("includes all expected column keys", () => {
    const result = getTranslateMaterialColumnsExcel(mockCtx)
    const expectedKeys = [
      "name",
      "description",
      "code",
      "hierarchy_code",
      "material_parent_codes",
      "unit_of_consumption_id",
      "unit_of_distribution_id",
      "consumption_unit_per_distribution_unit",
      "is_temperature_sensitive",
      "min_temperature",
      "max_temperature",
      "material_type_id",
      "material_subtype_id",
      "program_ids",
      "is_managed_in_batch",
      "min_retail_price",
      "max_retail_price",
      "is_stock_opname_mandatory",
    ]
    for (const key of expectedKeys) {
      expect(result).toHaveProperty(key)
    }
  })
})

describe("getTranslateMaterialVolumeColumnsExcel", () => {
  const mockCtx = { var: { t: (k: string) => k } } as unknown as Context

  it("returns an object with exactly 6 properties", () => {
    const result = getTranslateMaterialVolumeColumnsExcel(mockCtx)
    expect(Object.keys(result)).toHaveLength(6)
  })

  it("includes all expected volume column keys", () => {
    const result = getTranslateMaterialVolumeColumnsExcel(mockCtx)
    const expectedKeys = [
      "material_id",
      "manufacture_id",
      "unit_per_box",
      "box_length",
      "box_width",
      "box_height",
    ]
    for (const key of expectedKeys) {
      expect(result).toHaveProperty(key)
    }
  })

  it("returns the i18n key as value via identity mock", () => {
    const result = getTranslateMaterialVolumeColumnsExcel(mockCtx)
    expect(result.material_id).toBe("material-volume.label.material_id")
    expect(result.unit_per_box).toBe("material-volume.label.unit_per_box")
  })
})
