import { describe, expect, it } from "vitest"
import {
  DAILY_RECAP_EMAIL,
  REGEX_PASS,
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
  USER_VIEW_ONLY,
  getTranslateUserColumnExcel,
} from "@/common/constants/users.js"
import type { Context } from "hono"

describe("REGEX_PASS", () => {
  it.each([
    ["Smile12*", true],
    ["Abcd1234@", true],
    ["Complex1!", true],
    ["ABCD1234@", false],
    ["abcd1234@", false],
    ["AbcdEfgh@", false],
    ["Abcd1234", false],
    ["Abc1@", false],
  ])('"%s" matches: %s', (password, expected) => {
    expect(REGEX_PASS.test(password)).toBe(expected)
  })
})

describe("USER_ROLE", () => {
  it("has correct numeric values", () => {
    expect(USER_ROLE.SUPERADMIN).toBe(1)
    expect(USER_ROLE.ADMIN).toBe(2)
    expect(USER_ROLE.MANAGER).toBe(3)
    expect(USER_ROLE.OPERATOR).toBe(4)
    expect(USER_ROLE.OPERATOR_COVID).toBe(5)
    expect(USER_ROLE.DISTRIBUTOR_COVID).toBe(6)
    expect(USER_ROLE.MANAGER_COVID).toBe(7)
    expect(USER_ROLE.CUSTOMER_CENTER).toBe(8)
    expect(USER_ROLE.THIRD_PARTY).toBe(9)
    expect(USER_ROLE.PKC).toBe(10)
    expect(USER_ROLE.MANUFACTURE).toBe(11)
    expect(USER_ROLE.ASIK).toBe(12)
    expect(USER_ROLE.SATUSEHAT).toBe(13)
    expect(USER_ROLE.WMS).toBe(16)
  })
})

describe("USER_STATUS", () => {
  it("INACTIVE is 0 and ACTIVE is 1", () => {
    expect(USER_STATUS.INACTIVE).toBe(0)
    expect(USER_STATUS.ACTIVE).toBe(1)
  })
})

describe("USER_GENDER", () => {
  it("MALE is 1 and FEMALE is 2", () => {
    expect(USER_GENDER.MALE).toBe(1)
    expect(USER_GENDER.FEMALE).toBe(2)
  })
})

describe("DAILY_RECAP_EMAIL", () => {
  it("NO is 0 and YES is 1", () => {
    expect(DAILY_RECAP_EMAIL.NO).toBe(0)
    expect(DAILY_RECAP_EMAIL.YES).toBe(1)
  })
})

describe("USER_VIEW_ONLY", () => {
  it('contains "yes" and "no"', () => {
    expect(USER_VIEW_ONLY).toContain("yes")
    expect(USER_VIEW_ONLY).toContain("no")
  })
})

describe("getTranslateUserColumnExcel", () => {
  const mockCtx = { var: { t: (k: string) => k } } as unknown as Context

  it("returns an object with exactly 16 properties", () => {
    const result = getTranslateUserColumnExcel(mockCtx)
    expect(Object.keys(result)).toHaveLength(16)
  })

  it("returns the i18n key as value via identity mock", () => {
    const result = getTranslateUserColumnExcel(mockCtx)
    expect(result.Username).toBe("user.label.Username")
    expect(result.IDRole).toBe("user.label.ID Role")
    expect(result.Password).toBe("user.label.Password")
    expect(result.Email).toBe("user.label.Email")
  })

  it("includes all expected column keys", () => {
    const result = getTranslateUserColumnExcel(mockCtx)
    const expectedKeys = [
      "Username",
      "IDRole",
      "ViewOnly",
      "Firstname",
      "Lastname",
      "Email",
      "DailyRecapEmail",
      "IDGender",
      "Password",
      "Address",
      "IDVillage",
      "BirthDate",
      "MobilePhone",
      "IDEntity",
      "IDProgram",
      "IDManufacture",
    ]
    for (const key of expectedKeys) {
      expect(result).toHaveProperty(key)
    }
  })
})
