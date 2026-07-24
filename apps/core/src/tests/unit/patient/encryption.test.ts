import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  createEncrypter,
  doDecrypt,
  doEncrypt,
} from "@/modules/patient/utils/encryption.js"

const KEY = "12345678901234567890123456789012" // 32 bytes for AES-256-CBC
const IV = "1234567890123456" // 16 bytes

describe("createEncrypter", () => {
  const { encrypt, decrypt } = createEncrypter({ key: KEY, iv: IV })

  it("encrypt returns a non-empty base64 string", () => {
    const result = encrypt("hello world")
    expect(result).toBeTruthy()
    expect(typeof result).toBe("string")
    expect(result).not.toBe("hello world")
  })

  it("encrypt then decrypt roundtrip returns the original plaintext", () => {
    const plaintext = "sensitive patient data"
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })

  it("encrypt then decrypt works for an empty string", () => {
    expect(decrypt(encrypt(""))).toBe("")
  })

  it("decrypt of malformed ciphertext returns '-' without throwing", () => {
    expect(decrypt("not-valid-base64!!!")).toBe("-")
  })

  it("works with Buffer key and iv", () => {
    const { encrypt: enc, decrypt: dec } = createEncrypter({
      key: Buffer.from(KEY),
      iv: Buffer.from(IV),
    })
    const plaintext = "buffer key test"
    expect(dec(enc(plaintext))).toBe(plaintext)
  })
})

describe("doEncrypt / doDecrypt", () => {
  let savedIV: string | undefined
  let savedKey: string | undefined

  beforeEach(() => {
    savedIV = process.env.IV_KEY
    savedKey = process.env.ENCRYPT_KEY
  })

  afterEach(() => {
    if (savedIV === undefined) delete process.env.IV_KEY
    else process.env.IV_KEY = savedIV

    if (savedKey === undefined) delete process.env.ENCRYPT_KEY
    else process.env.ENCRYPT_KEY = savedKey
  })

  it("doEncrypt throws when IV_KEY is missing", () => {
    delete process.env.IV_KEY
    process.env.ENCRYPT_KEY = KEY
    expect(() => doEncrypt("test")).toThrow(
      "Missing required environment variables"
    )
  })

  it("doEncrypt throws when ENCRYPT_KEY is missing", () => {
    process.env.IV_KEY = IV
    delete process.env.ENCRYPT_KEY
    expect(() => doEncrypt("test")).toThrow(
      "Missing required environment variables"
    )
  })

  it("doDecrypt throws when IV_KEY is missing", () => {
    delete process.env.IV_KEY
    process.env.ENCRYPT_KEY = KEY
    expect(() => doDecrypt("anything")).toThrow(
      "Missing required environment variables"
    )
  })

  it("doEncrypt + doDecrypt roundtrip returns the original text", () => {
    process.env.IV_KEY = IV
    process.env.ENCRYPT_KEY = KEY
    const original = "patient-id-12345"
    expect(doDecrypt(doEncrypt(original))).toBe(original)
  })
})
