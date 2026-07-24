import { describe, expect, it } from "vitest"
import {
  InvalidAsset,
  InvalidRTMD,
  InvalidSensor,
  RTMDEntityMismatch,
} from "@/modules/asset-inventory/asset-inventory.error.js"
import { ValidationError } from "@smile-health/lib/error.js"

describe("asset-inventory custom errors", () => {
  it("InvalidAsset is an instance of ValidationError and Error", () => {
    const err = new InvalidAsset()
    expect(err).toBeInstanceOf(ValidationError)
    expect(err).toBeInstanceOf(Error)
  })

  it("InvalidAsset has the correct message", () => {
    expect(new InvalidAsset().message).toBe(
      "validator.asset_inventory.invalid_asset"
    )
  })

  it("InvalidRTMD has the correct message", () => {
    expect(new InvalidRTMD().message).toBe(
      "validator.asset_inventory.invalid_rtmd"
    )
  })

  it("InvalidSensor has the correct message", () => {
    expect(new InvalidSensor().message).toBe(
      "validator.asset_inventory.invalid_sensor"
    )
  })

  it("RTMDEntityMismatch has the correct message", () => {
    expect(new RTMDEntityMismatch().message).toBe(
      "validator.asset_inventory.rtmd_entity_mismatch"
    )
  })

  it("all error classes are throwable and catchable as Error", () => {
    const errors = [
      new InvalidAsset(),
      new InvalidRTMD(),
      new InvalidSensor(),
      new RTMDEntityMismatch(),
    ]
    for (const err of errors) {
      expect(() => {
        throw err
      }).toThrow(Error)
    }
  })
})
