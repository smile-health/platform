import {
  OUT_OF_SCHOOL_TARGET_GROUPS,
  SCHOOL_ENTITY_TAG_ID,
  TARGET_GROUP_NAME_TRANSFORM,
  VILLAGE_TARGET_GROUPS,
} from "@/common/constants/target.js"
import {
  addValidationIssue,
  validateRequiredFields,
} from "@/common/utils/validation.utils.js"
import { getIdentityAndAddressByNIK } from "@/common/utils/verify-nik.js"
import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { ValidationError } from "@smile/lib/error.js"
import BaseTemplate from "@smile/lib/excel/index.js"
import { Context } from "hono"
import z from "zod"
import { LocationRepository } from "../../location/location.repository.js"
import { doEncrypt } from "../../transaction/utils/transaction.encryption.js"
import { TargetsRepository } from "./targets.repository.js"
import {
  AddTargetDataRequest,
  AddTargetDataRequestSchema,
  ColumnImportTargetSchema,
  CreateAbsoluteTargetRequestDTO,
  CreateAbsoluteTargetSchema,
  ImportTargetRequest,
  ImportTargetRequestSchema,
  NIKParamSchema,
  UpdateTargetDataRequest,
  UpdateTargetDataRequestSchema,
} from "./targets.schema.js"

type CellValue = string | number | Date | undefined | null

export class TargetsMiddleware extends BaseMiddleware {
  constructor(
    private readonly targetsRepository: TargetsRepository,
    private readonly locationRepository: LocationRepository
  ) {
    super()
  }

  create = (c: Context) => {
    return AddTargetDataRequestSchema.superRefine(
      async (data: AddTargetDataRequest, ctx: z.RefinementCtx) => {
        await this.#createRequestValidation(c, ctx, data)
        await this.#validateNIKMatchesData(c, ctx, data)
        await this.#validateNIKStructure(c, ctx, data.nik)
        await this.#checkValidateLocation(c, ctx, data)
        await this.#checkDataIfExists(c, ctx, data)
        await this.#validateAssignment(c, ctx, data)
      }
    )
  }

  update = (c: Context, nik: string) => {
    return UpdateTargetDataRequestSchema.superRefine(
      async (data: UpdateTargetDataRequest, ctx: z.RefinementCtx) => {
        await this.#updateRequestValidation(c, ctx, data)
        await this.#validateNIKMatchesData(c, ctx, data, nik)
      }
    )
  }

  createAbsoluteTarget = (c: Context) => {
    return CreateAbsoluteTargetSchema.superRefine(
      async (data: CreateAbsoluteTargetRequestDTO, ctx: z.RefinementCtx) => {
        await this.#createAbsoluteTargetRequestValidation(c, ctx, data)
        await this.#validateAbsoluteTargetAssignment(c, ctx, data)
      }
    )
  }

  validateNIKIdentity = (_c: Context) => {
    return NIKParamSchema
  }

  readonly #createRequestValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: AddTargetDataRequest
  ) => {
    const requiredFields = [
      "date_of_birth",
      "gender",
      "registered_postal_code",
      "registered_village_id",
      "residence_postal_code",
      "residence_village_id",
    ] as const

    validateRequiredFields(c, ctx, data, requiredFields, "targets")

    if (data.phone_number) {
      this.#validatePhoneNumber(c, ctx, data.phone_number, "phone_number")
    }
  }

  readonly #checkDataIfExists = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: AddTargetDataRequest
  ) => {
    if (data.nik && typeof data.nik === "string" && data.nik.trim() !== "") {
      const encryptedNIK = doEncrypt(data.nik)
      const dataExists = await this.targetsRepository.existsByNIK(
        c,
        encryptedNIK
      )

      if (dataExists) {
        addValidationIssue(c, ctx, "nik", "validator.exist", "NIK")
        return
      }
    }
  }

  readonly #checkValidateLocation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: AddTargetDataRequest
  ) => {
    await this.#validateVillageField(
      c,
      ctx,
      data.registered_village_id,
      "registered_village_id"
    )
    await this.#validateVillageField(
      c,
      ctx,
      data.residence_village_id,
      "residence_village_id"
    )
  }

  readonly #validateVillageField = async (
    c: Context,
    ctx: z.RefinementCtx,
    villageId: number | undefined,
    fieldName: string
  ) => {
    if (villageId && typeof villageId === "string") {
      const village = await this.locationRepository.findByID(
        c,
        Number(villageId)
      )

      if (!village) {
        addValidationIssue(
          c,
          ctx,
          fieldName,
          "validator.not_exist",
          `targets.label.${fieldName}`
        )
        return
      }
    }
  }

  readonly #validateNIKStructure = async (
    c: Context,
    ctx: z.RefinementCtx,
    nik: string
  ) => {
    if (
      !nik ||
      (typeof nik === "string" && nik.trim() === "") ||
      nik === ":nik"
    ) {
      addValidationIssue(
        c,
        ctx,
        "nik",
        "validator.required",
        "targets.label.nik"
      )
      return
    }

    if (nik.length !== 16) {
      addValidationIssue(
        c,
        ctx,
        "nik",
        "validator.exact_length",
        "targets.label.nik",
        { length: "16" }
      )
      return
    }

    if (!/^\d+$/.test(nik)) {
      addValidationIssue(c, ctx, "nik", "validator.number", "targets.label.nik")
      return
    }

    const detailedNik = await getIdentityAndAddressByNIK(
      c,
      nik,
      this.locationRepository
    )

    const parsedDate = new Date(detailedNik.date_of_birth)
    const isValidDate =
      parsedDate instanceof Date &&
      !isNaN(parsedDate.getTime()) &&
      parsedDate.getFullYear() === detailedNik.full_year &&
      parsedDate.getMonth() + 1 === detailedNik.month_of_birth &&
      parsedDate.getDate() === detailedNik.actual_day

    if (!isValidDate) {
      addValidationIssue(
        c,
        ctx,
        "nik",
        "validator.invalid",
        "targets.label.date_of_birth"
      )
      return
    }

    const today = new Date()
    if (parsedDate > today) {
      addValidationIssue(
        c,
        ctx,
        "nik",
        "validator.invalid",
        "targets.label.date_of_birth"
      )
    }
  }

  readonly #validateNIKMatchesData = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: AddTargetDataRequest | UpdateTargetDataRequest,
    nik?: string
  ) => {
    const nikValue = nik ?? (data as AddTargetDataRequest).nik
    if (!nikValue || nikValue.length !== 16) {
      return
    }

    const detailedNik = await getIdentityAndAddressByNIK(
      c,
      nikValue,
      this.locationRepository
    )

    if ("gender" in data && data.gender && data.gender !== detailedNik.gender) {
      addValidationIssue(
        c,
        ctx,
        "gender",
        "validator.mismatch",
        "targets.label.gender"
      )
      return
    }

    if (
      "date_of_birth" in data &&
      data.date_of_birth &&
      data.date_of_birth !== detailedNik.date_of_birth
    ) {
      addValidationIssue(
        c,
        ctx,
        "date_of_birth",
        "validator.mismatch",
        "targets.label.date_of_birth"
      )
      return
    }

    if (data.registered_village_id) {
      const nikSubdistrictId = parseInt(nikValue.substring(0, 6))
      const regisSubDistrictId = parseInt(
        data.registered_village_id.toString().substring(0, 6)
      )
      if (nikSubdistrictId != regisSubDistrictId) {
        addValidationIssue(
          c,
          ctx,
          "registered_village_id",
          "validator.mismatch",
          "targets.label.registered_village_id"
        )
        return
      }
    }
  }

  readonly #updateRequestValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateTargetDataRequest
  ) => {
    const requiredFields = [
      "registered_postal_code",
      "registered_village_id",
      "residence_postal_code",
      "residence_village_id",
    ] as const

    validateRequiredFields(c, ctx, data, requiredFields, "targets")

    if (data.phone_number) {
      this.#validatePhoneNumber(c, ctx, data.phone_number, "phone_number")
    }
  }

  readonly #validatePhoneNumber = (
    c: Context,
    ctx: z.RefinementCtx,
    phoneNumber: string,
    fieldName: string
  ) => {
    const digitsAfter62 = phoneNumber.substring(2).length

    if (digitsAfter62 < 10) {
      addValidationIssue(
        c,
        ctx,
        fieldName,
        "validator.min_length",
        `targets.label.${fieldName}`,
        { length: "10 digits after 62" }
      )
      return
    }

    if (digitsAfter62 > 13) {
      addValidationIssue(
        c,
        ctx,
        fieldName,
        "validator.max_length",
        `targets.label.${fieldName}`,
        { length: "13 digits after 62" }
      )
    }
  }

  readonly #createAbsoluteTargetRequestValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: CreateAbsoluteTargetRequestDTO
  ) => {
    const validGroupIds = Object.keys(TARGET_GROUP_NAME_TRANSFORM).map(Number)
    if (!validGroupIds.includes(data.target_group_id)) {
      addValidationIssue(
        c,
        ctx,
        "target_group_id",
        "validator.invalid",
        "targets.label.target_group_id"
      )
    }

    if (data.qty < 0) {
      addValidationIssue(
        c,
        ctx,
        "qty",
        "validator.min_value",
        "targets.label.qty",
        { min: "0" }
      )
    }

    // Validate entity_id if provided
    if (data.entity_id) {
      const baseTargetGroupId = data.target_group_id
      const prefix =
        VILLAGE_TARGET_GROUPS.includes(baseTargetGroupId) ||
        OUT_OF_SCHOOL_TARGET_GROUPS.includes(baseTargetGroupId)
          ? "village"
          : "school"

      if (prefix === "village") {
        // Validate entity_id exists in locations table
        const village = await c.var.trx
          .selectFrom("locations")
          .select("id")
          .where("id", "=", data.entity_id)
          .where("level", "=", 3)
          .executeTakeFirst()

        if (!village) {
          addValidationIssue(
            c,
            ctx,
            "entity_id",
            "validator.not_found",
            "targets.label.entity_id"
          )
        }
      } else if (prefix === "school") {
        // Validate entity_id exists in entities table
        const school = await c.var.trx
          .selectFrom("ws_entities")
          .select("id")
          .where("id", "=", data.entity_id)
          .where("entity_tag_id", "=", SCHOOL_ENTITY_TAG_ID)
          .where("deleted_at", "is", null)
          .executeTakeFirst()

        if (!school) {
          addValidationIssue(
            c,
            ctx,
            "entity_id",
            "validator.not_found",
            "targets.label.entity_id"
          )
        }
      }
    }
  }

  import = (c: Context) => {
    const COL = this.#getColumnTranslations(c)
    return ImportTargetRequestSchema(COL)
  }

  validateImport = async (
    c: Context,
    rows: ImportTargetRequest[],
    template: BaseTemplate
  ) => {
    const COL: ColumnImportTargetSchema = this.#getColumnTranslations(c)
    const startRow = template.getStartRow()

    const seenNIKs = new Set<string>()
    const validRows: ImportTargetRequest[] = []

    for (const rawItem of rows) {
      const item = rawItem.NIK
        ? {
            ...rawItem,
            NIK: String(rawItem.NIK).replace(/^['\s]+|['\s]+$/g, ""),
          }
        : { ...rawItem }

      if (!item.NIK) continue
      const nikStr = String(item.NIK)
      if (nikStr.length !== 16 || !/^\d+$/.test(nikStr)) continue
      if (seenNIKs.has(nikStr)) continue
      seenNIKs.add(nikStr)

      validRows.push(item)
      const rowIdx = startRow + (validRows.length - 1)
      this.#validateRequiredFields(c, rowIdx, item, COL)
      this.#validatePhoneNumberImport(
        c,
        rowIdx,
        item.PhoneNumber,
        COL.PhoneNumber
      )
      this.#validateSameAddress(c, rowIdx, item, COL)
      this.#validateInSchool(c, rowIdx, item, COL)
    }

    // Validate school/village assignment for import rows
    await this.#validateImportAssignment(c, validRows)

    if (c.var.errors) {
      throw new ValidationError()
    }

    return validRows
  }

  readonly #validateRequiredFields = (
    c: Context,
    rowIdx: number,
    item: ImportTargetRequest,
    COL: ColumnImportTargetSchema
  ) => {
    const required = [
      { value: item.Name, col: COL.Name },
      { value: item.RegisteredVillageID, col: COL.RegisteredVillageID },
      { value: item.SameAddress, col: COL.SameAddress },
      { value: item.InSchool, col: COL.InSchool },
    ]
    required.forEach(({ value, col }) => this.#isExist(c, rowIdx, value, col))
  }

  readonly #validateSameAddress = (
    c: Context,
    rowIdx: number,
    item: ImportTargetRequest,
    COL: ColumnImportTargetSchema
  ) => {
    if (item.SameAddress === 1) return

    const residenceFields = [
      { value: item.ResidenceProvinceID, col: COL.ResidenceProvinceID },
      { value: item.ResidenceCityID, col: COL.ResidenceCityID },
      { value: item.ResidenceDistrictID, col: COL.ResidenceDistrictID },
      { value: item.ResidenceVillageID, col: COL.ResidenceVillageID },
      { value: item.ResidenceAddress, col: COL.ResidenceAddress },
    ]

    residenceFields.forEach(({ value, col }) =>
      this.#isExist(c, rowIdx, value, col)
    )
  }

  readonly #validateInSchool = (
    c: Context,
    rowIdx: number,
    item: ImportTargetRequest,
    COL: ColumnImportTargetSchema
  ) => {
    if (item.InSchool !== 1) return

    const schoolFields = [
      { value: item.SchoolProvinceID, col: COL.SchoolProvinceID },
      { value: item.SchoolCityID, col: COL.SchoolCityID },
      { value: item.SchoolDistrictID, col: COL.SchoolDistrictID },
      { value: item.SchoolID, col: COL.SchoolID },
      { value: item.Grade, col: COL.Grade },
    ]

    schoolFields.forEach(({ value, col }) =>
      this.#isExist(c, rowIdx, value, col)
    )
  }

  readonly #validatePhoneNumberImport = (
    c: Context,
    idx: number,
    phoneNumber: CellValue,
    column: string
  ) => {
    if (!phoneNumber && phoneNumber !== 0) return

    let phoneStr = String(phoneNumber).trim()

    phoneStr = phoneStr.replace(/\D/g, "")

    if (phoneStr.length === 0) {
      return
    }

    if (!/^\d+$/.test(phoneStr)) {
      c.addError(String(idx), "Phone number must contain only digits", column)
      return
    }

    if (!phoneStr.startsWith("62")) {
      c.addError(String(idx), "Phone number must start with 62", column)
      return
    }

    const digitsAfter62 = phoneStr.substring(2).length

    if (digitsAfter62 < 10) {
      c.addError(
        String(idx),
        "Phone number must have at least 10 digits after 62",
        column
      )
      return
    }

    if (digitsAfter62 > 13) {
      c.addError(
        String(idx),
        "Phone number must have at most 13 digits after 62",
        column
      )
    }
  }

  readonly #isExist = (
    c: Context,
    idx: number,
    val: CellValue,
    column: string
  ) => {
    if (!val && val !== 0) {
      c.addError(String(idx), "validator.not_empty", column)
    }
  }

  readonly #validateAssignment = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: AddTargetDataRequest
  ) => {
    const microplanningId = c.var.microplanningId as number | undefined
    const year = c.var.microplanningYear!

    // If entity_id is provided, it's a school target — validate against ws_microplanning_schools
    if (data.entity_id) {
      const isAssigned = await this.targetsRepository.isSchoolAlreadyAssigned(
        c,
        data.entity_id,
        year,
        microplanningId
      )
      if (isAssigned) {
        addValidationIssue(
          c,
          ctx,
          "entity_id",
          "validator.already_assigned",
          "targets.label.entity_id",
          {entity_name: isAssigned.entity_name!}
        )
      }
    } else {
      // No entity_id means it's a village target — validate against ws_microplanning_villages
      if (data.residence_village_id) {
        const isAssigned =
          await this.targetsRepository.isVillageAlreadyAssigned(
            c,
            data.residence_village_id,
            year,
            microplanningId
          )
        if (isAssigned) {
          addValidationIssue(
            c,
            ctx,
            "residence_village_id",
            "validator.already_assigned",
            "targets.label.residence_village_id",
            { entity_name: isAssigned.entity_name! }
          )
        }
      }
    }
  }

  readonly #validateAbsoluteTargetAssignment = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: CreateAbsoluteTargetRequestDTO
  ) => {
    if (!data.entity_id) return

    const microplanningId = c.var.microplanningId as number | undefined
    const year = c.var.microplanningYear!
    const baseTargetGroupId = data.target_group_id
    const isVillage =
      VILLAGE_TARGET_GROUPS.includes(baseTargetGroupId) ||
      OUT_OF_SCHOOL_TARGET_GROUPS.includes(baseTargetGroupId)

    if (isVillage) {
      const isAssigned = await this.targetsRepository.isVillageAlreadyAssigned(
        c,
        data.entity_id,
        year,
        microplanningId
      )
      if (isAssigned) {
        addValidationIssue(
          c,
          ctx,
          "entity_id",
          "validator.already_assigned",
          "targets.label.entity_id",
          { entity_name: isAssigned.entity_name! }
        )
      }
    } else {
      const isAssigned = await this.targetsRepository.isSchoolAlreadyAssigned(
        c,
        data.entity_id,
        year,
        microplanningId
      )
      if (isAssigned) {
        addValidationIssue(
          c,
          ctx,
          "entity_id",
          "validator.already_assigned",
          "targets.label.entity_id",
          { entity_name: isAssigned.entity_name! }
        )
      }
    }
  }

  readonly #validateImportAssignment = async (
    c: Context,
    rows: ImportTargetRequest[]
  ) => {
    const microplanningId = c.var.microplanningId as number | undefined
    const year = c.var.microplanningYear!
    const schoolIds = new Set<number>()
    const villageIds = new Set<number>()

    for (const row of rows) {
      if (row.InSchool === 1 && row.SchoolID) {
        schoolIds.add(Number(row.SchoolID))
      }
      if (row.ResidenceVillageID) {
        villageIds.add(Number(row.ResidenceVillageID))
      }
    }

    // Check school assignments
    for (const schoolId of schoolIds) {
      const isAssigned = await this.targetsRepository.isSchoolAlreadyAssigned(
        c,
        schoolId,
        year,
        microplanningId
      )
      if (isAssigned) {
        c.addError("0", "validator.already_assigned", "SchoolID")
        return
      }
    }

    // Check village assignments
    for (const villageId of villageIds) {
      const isAssigned = await this.targetsRepository.isVillageAlreadyAssigned(
        c,
        villageId,
        year,
        microplanningId
      )
      if (isAssigned) {
        c.addError("0", "validator.already_assigned", "ResidenceVillageID")
        return
      }
    }
  }

  readonly #getColumnTranslations = (c: Context): ColumnImportTargetSchema => {
    return {
      NIK: "NIK",
      Name: "Name",
      PhoneNumber: "Phone Number",
      MaritalStatusID: "Marital Status ID",
      EducationID: "Education ID",
      OccupationID: "Occupation ID",
      ReligionID: "Religion ID",
      EthnicID: "Ethnic ID",
      RegisteredVillageID: "Registered Village ID",
      RegisteredPostalCode: "Registered Postal Code",
      RegisteredAddress: "Registered Address",
      SameAddress: "Same Address",
      ResidenceProvinceID: "Residence Province ID",
      ResidenceCityID: "Residence City ID",
      ResidenceDistrictID: "Residence District ID",
      ResidenceVillageID: "Residence Village ID",
      ResidencePostalCode: "Residence Postal Code",
      ResidenceAddress: "Residence Address",
      InSchool: "In School",
      SchoolProvinceID: "School Province ID",
      SchoolCityID: "School City ID",
      SchoolDistrictID: "School District ID",
      SchoolID: "School ID",
      Grade: "Grade",
    }
  }
}
