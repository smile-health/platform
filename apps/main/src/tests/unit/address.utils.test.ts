import { describe, it, expect } from "vitest"
import { buildAddressFromLocation, getLocationDetailsFromVillageId } from "@/common/utils/address.utils.js"

const mockLocation = {
  province: { id: 32, name: "JAWA BARAT" },
  regency: { id: 3201, name: "KAB. BOGOR" },
  subdistrict: { id: 320113, name: "CIBINONG" },
  village: { id: 3201130001, name: "CIRIMEKAR" },
}

describe("buildAddressFromLocation", () => {
  it("should prefix village name with DESA by default", () => {
    const result = buildAddressFromLocation(mockLocation as any, 16914)
    expect(result.village).toBe("DESA CIRIMEKAR")
  })

  it("should not prefix village name when addVillagePrefix is false", () => {
    const result = buildAddressFromLocation(mockLocation as any, 16914, false)
    expect(result.village).toBe("CIRIMEKAR")
  })

  it("should map all fields correctly", () => {
    const result = buildAddressFromLocation(mockLocation as any, 16914)
    expect(result).toEqual({
      province_id: 32,
      province: "JAWA BARAT",
      city_id: 3201,
      city: "KAB. BOGOR",
      district_id: 320113,
      district: "CIBINONG",
      village_id: 3201130001,
      village: "DESA CIRIMEKAR",
      postal_code: 16914,
    })
  })
})

describe("getLocationDetailsFromVillageId", () => {
  it("should extract province, regency, and subdistrict IDs from village ID", () => {
    expect(getLocationDetailsFromVillageId(3201130001)).toEqual({
      provinceId: 32,
      regencyId: 3201,
      subdistrictId: 320113,
    })
  })

  it("should handle a different village ID", () => {
    const result = getLocationDetailsFromVillageId(1101010001)
    expect(result.provinceId).toBe(11)
    expect(result.regencyId).toBe(1101)
    expect(result.subdistrictId).toBe(110101)
  })
})
