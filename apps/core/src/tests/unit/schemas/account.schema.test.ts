import { describe, expect, it } from "vitest"
import {
  ChangePasswordSchema,
  LoginAttemptSchema,
  LoginSchema,
} from "@/modules/account/account.schema.js"

describe("LoginSchema", () => {
  it("parses a valid payload successfully", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "Smile12*",
    })
    expect(result.success).toBe(true)
  })

  it("defaults create to false when not provided", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "Smile12*",
    })
    expect(result.success && result.data.create).toBe(false)
  })

  it("accepts an optional fcm_token", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "Smile12*",
      fcm_token: "token-abc-123",
    })
    expect(result.success).toBe(true)
  })

  it("fails when username is shorter than 4 characters", () => {
    const result = LoginSchema.safeParse({
      username: "ab",
      password: "Smile12*",
    })
    expect(result.success).toBe(false)
  })

  it("fails when username is missing", () => {
    const result = LoginSchema.safeParse({ password: "Smile12*" })
    expect(result.success).toBe(false)
  })

  it("fails when password is shorter than 8 characters", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "short",
    })
    expect(result.success).toBe(false)
  })

  it("fails when password exceeds 255 characters", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "A".repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it("fails when password is missing", () => {
    const result = LoginSchema.safeParse({ username: "admin" })
    expect(result.success).toBe(false)
  })
})

describe("ChangePasswordSchema", () => {
  const validPayload = {
    password: "Old12345@",
    new_password: "New12345@",
    password_confirmation: "New12345@",
  }

  it("parses a valid password change payload", () => {
    const result = ChangePasswordSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it("fails when new_password and password_confirmation do not match", () => {
    const result = ChangePasswordSchema.safeParse({
      ...validPayload,
      password_confirmation: "Different1@",
    })
    expect(result.success).toBe(false)
    const issues = result.success ? [] : result.error.issues
    expect(
      issues.some((i) => i.message === "Password Confirmation must be same")
    ).toBe(true)
  })

  it("fails when old password and new password are the same", () => {
    const result = ChangePasswordSchema.safeParse({
      password: "Same12345@",
      new_password: "Same12345@",
      password_confirmation: "Same12345@",
    })
    expect(result.success).toBe(false)
    const issues = result.success ? [] : result.error.issues
    expect(
      issues.some(
        (i) => i.message === "Old Password and New Password must be different"
      )
    ).toBe(true)
  })

  it("fails when new_password does not match REGEX_PASS (no uppercase)", () => {
    const result = ChangePasswordSchema.safeParse({
      password: "Old12345@",
      new_password: "nouppercase1@",
      password_confirmation: "nouppercase1@",
    })
    expect(result.success).toBe(false)
  })

  it("fails when new_password is shorter than 8 characters", () => {
    const result = ChangePasswordSchema.safeParse({
      password: "Old12345@",
      new_password: "Sh1@",
      password_confirmation: "Sh1@",
    })
    expect(result.success).toBe(false)
  })
})

describe("LoginAttemptSchema", () => {
  it("transforms id from string to number", () => {
    const result = LoginAttemptSchema.safeParse({ id: "42" })
    expect(result.success && result.data.id).toBe(42)
  })

  it("transforms last_attempt from ISO string to Date instance", () => {
    const result = LoginAttemptSchema.safeParse({
      last_attempt: "2024-01-01T00:00:00.000Z",
    })
    expect(result.success && result.data.last_attempt).toBeInstanceOf(Date)
  })

  it("transforms created_at from ISO string to Date instance", () => {
    const result = LoginAttemptSchema.safeParse({
      created_at: "2024-06-15T00:00:00.000Z",
    })
    expect(result.success && result.data.created_at).toBeInstanceOf(Date)
  })

  it("accepts an empty object (all fields are optional)", () => {
    const result = LoginAttemptSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
