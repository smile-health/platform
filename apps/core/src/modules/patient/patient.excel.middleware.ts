import { YES_NO_OPTIONS } from "@/common/constants/general.js"
import { IDENTITY_TYPE } from "@/common/constants/identity-type.js"
import { maritalStatus } from "@/common/constants/marital-status.js"
import { ValidationError } from "@smile/lib/error.js"
import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"
import { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { validator } from "hono/validator"
import { z } from "zod"
import { LocationRepository } from "../location/location.repository.js"
import { PatientExcelRepository } from "./patient.excel.repository.js"
import {
  PatientImportRequestSchema,
  type PatientImportRequestDTO,
} from "./patient.excel.schema.js"

const fmtLabel = (c: Context, key: string) => {
  const text = c.var.t(key)
  return text ? `[${text}]` : ""
}

export type ColumnImportSchema = {
  Name: string
  IdentityType: string
  IdentityNumber: string
  DateOfBirth: string
  Gender: string
  Status: string
  Education: string
  Occupation: string
  Religion: string
  Ethnicity: string
  PhoneNumber: string
  Province: string
  City: string
  Address: string
  ProvinceResidence: string
  CityResidence: string
  residentialAddress: string
  DengueHistory: string
  Month: string
  Year: string
  VaccinationHistory: string
}

export class PatientExcelMiddleware {
  constructor(
    private readonly repo: PatientExcelRepository,
    private readonly locationRepo: LocationRepository
  ) {}

  readonly #patientColumns = (c: Context): ColumnImportSchema => ({
    Name: c.var.t("patient.label.name"),
    IdentityType: c.var.t("patient.label.identity_type"),
    IdentityNumber: c.var.t("patient.label.identity_number"),
    DateOfBirth: c.var.t("patient.label.date_of_birth"),
    Gender: c.var.t("patient.label.gender"),
    Status: c.var.t("patient.label.status"),
    Education: c.var.t("patient.label.education"),
    Occupation: c.var.t("patient.label.occupation"),
    Religion: c.var.t("patient.label.religion"),
    Ethnicity: c.var.t("patient.label.ethnicity"),
    PhoneNumber: c.var.t("patient.label.phone_number"),
    Province: c.var.t("patient.label.province"),
    City: c.var.t("patient.label.city"),
    Address: c.var.t("patient.label.address"),
    ProvinceResidence: c.var.t("patient.label.province_residence"),
    CityResidence: c.var.t("patient.label.city_residence"),
    residentialAddress: c.var.t("patient.label.residential_address"),
    DengueHistory: c.var.t("patient.label.dengue_history"),
    Month: c.var.t("patient.label.dengue_month"),
    Year: c.var.t("patient.label.dengue_year"),
    VaccinationHistory: c.var.t("patient.label.vaccination_history"),
  })

  #patientSchema(COL: ColumnImportSchema) {
    const statusMap: Record<string, string> = {
      Married: "Kawin",
      Unmarried: "Belum Kawin",
      Divorced: "Cerai Mati",
      Widowed: "Cerai Hidup",
    }

    const choiceMap: Record<string, string> = {
      Yes: "Ya",
      No: "Tidak",
    }

    const genderMap: Record<string, string> = {
      M: "L",
      F: "P",
    }

    return z
      .object({
        [COL.Name]: z.any(),
        [COL.IdentityType]: z.any(),
        [COL.IdentityNumber]: z.any(),
        [COL.DateOfBirth]: z.any(),
        [COL.Gender]: z.any(),
        [COL.Status]: z.any(),
        [COL.Education]: z.any(),
        [COL.Occupation]: z.any(),
        [COL.Religion]: z.any(),
        [COL.Ethnicity]: z.any(),
        [COL.PhoneNumber]: z.any(),
        [COL.Province]: z.any(),
        [COL.City]: z.any(),
        [COL.Address]: z.any(),
        [COL.ProvinceResidence]: z.any(),
        [COL.CityResidence]: z.any(),
        [COL.residentialAddress]: z.any(),
        [COL.DengueHistory]: z.any(),
        [COL.Month]: z.any(),
        [COL.Year]: z.any(),
        [COL.VaccinationHistory]: z.any(),
      })
      .transform((row) => ({
        name: row[COL.Name],
        identity_type: row[COL.IdentityType],
        identity_number: row[COL.IdentityNumber],
        date_of_birth: row[COL.DateOfBirth],
        gender: genderMap[row[COL.Gender]] ?? row[COL.Gender],
        status: statusMap[row[COL.Status]] ?? row[COL.Status] ?? null,
        education: row[COL.Education] ?? null,
        occupation: row[COL.Occupation] ?? null,
        religion: row[COL.Religion] ?? null,
        ethnicity: row[COL.Ethnicity] ?? null,
        phone_number: `${row[COL.PhoneNumber]}`,
        province: row[COL.Province] ?? null,
        city: row[COL.City] ?? null,
        address: row[COL.Address] ?? null,
        province_residence: row[COL.ProvinceResidence] ?? null,
        city_residence: row[COL.CityResidence] ?? null,
        residential_address: row[COL.residentialAddress] ?? null,
        dengue_history:
          choiceMap[row[COL.DengueHistory]] ?? row[COL.DengueHistory] ?? null,
        month: row[COL.Month],
        year: row[COL.Year],
        vaccination_history:
          choiceMap[row[COL.VaccinationHistory]] ??
          row[COL.VaccinationHistory] ??
          null,
      }))
      .pipe(PatientImportRequestSchema)
  }

  async #getExcelRows(c: Context) {
    const fileRequest = c.get("fileRequest")
    const template = new BaseTemplate(10, 1, PROCESSOR.SHEETJS)
    await template.loadFromBuffer(fileRequest["buffer"])
    const rows = template.getRows()
    const startRow = template.getStartRow()

    return { rows, startRow }
  }

  #parseRows(
    rows: unknown[],
    startRow: number,
    schema: z.ZodType<PatientImportRequestDTO, z.ZodTypeDef, unknown>,
    c: Context
  ) {
    const parsedAtIndex: Array<PatientImportRequestDTO> = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowIdx = String(i + startRow)
      const parsed = schema.safeParse(row)

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const message = issue.message
          const key = String(issue.path[0] ?? "")
          const label = key ? fmtLabel(c, `patient.label.${key}`) : ""

          c.addError(rowIdx, message, label)
        })

        continue
      }

      parsedAtIndex[i] = parsed.data
    }

    return parsedAtIndex
  }

  excel = validator("json", async (val, c) => {
    const COL = this.#patientColumns(c)
    const Schema = this.#patientSchema(COL)
    const { rows, startRow } = await this.#getExcelRows(c)
    const parsedAtIndex = this.#parseRows(rows, startRow, Schema, c)

    const [
      listTitleEducation,
      listTitleOccupation,
      listTitleReligion,
      listTitleEthnic,
      listLocation,
    ] = await Promise.all([
      this.repo.getListByTitle(c, "educations"),
      this.repo.getListByTitle(c, "occupations"),
      this.repo.getListByTitle(c, "religions"),
      this.repo.getListByTitle(c, "ethnics"),
      this.locationRepo.getLocationByLevel(c, [0, 1]),
    ])

    const listTranslatedEducation = listTitleEducation.map((item) => {
      return {
        ...item,
        title: c.var.t(`education.label.${item.title}`),
      }
    })

    const listTranslatedOccupation = listTitleOccupation.map((item) => {
      return {
        ...item,
        title: c.var.t(`occupation.label.${item.title}`),
      }
    })

    const listTranslatedReligion = listTitleReligion.map((item) => {
      return {
        ...item,
        title: c.var.t(`religion.label.${item.title}`),
      }
    })

    const listTranslatedEthnic = listTitleEthnic.map((item) => {
      return {
        ...item,
        title: c.var.t(`ethnic.label.${item.title}`),
      }
    })

    const seen = new Set<string>()

    for (let idx = 0; idx < parsedAtIndex.length; idx++) {
      const rowIdx = String(idx + startRow)
      const raw = parsedAtIndex[idx]
      const {
        identity_type,
        identity_number,
        gender,
        status,
        education,
        occupation,
        religion,
        ethnicity,
        province,
        city,
        province_residence,
        city_residence,
        dengue_history,
        vaccination_history,
        month,
        year,
      } = raw as PatientImportRequestDTO

      if (
        !(
          identity_type === IDENTITY_TYPE.NIK ||
          identity_type === IDENTITY_TYPE.NON_NIK
        )
      ) {
        c.addError(
          rowIdx,
          "validator.string",
          fmtLabel(c, "patient.label.identity_type")
        )
      }

      if (seen.has(identity_number)) {
        c.addError(
          rowIdx,
          "validator.duplicated",
          fmtLabel(c, "patient.label.identity_number")
        )
      } else {
        seen.add(identity_number)
      }

      if (identity_type === IDENTITY_TYPE.NIK) {
        const nik = String(identity_number)
        if (!/^\d{16}$/.test(nik)) {
          c.addError(
            rowIdx,
            "validator.string",
            fmtLabel(c, "patient.label.identity_number")
          )
        }
      }

      if (!(gender === "L" || gender === "P")) {
        c.addError(
          rowIdx,
          "validator.string",
          fmtLabel(c, "patient.label.gender")
        )
      }

      if (status) {
        const ok = maritalStatus.some((m) => m.title === status)
        if (!ok)
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.status")
          )
      }

      if (education) {
        const edu = listTranslatedEducation.find((e) => e.title === education)
        if (!edu) {
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.education")
          )
        } else {
          parsedAtIndex[idx]!.education_id = edu.id
        }
      }

      if (occupation) {
        const occ = listTranslatedOccupation.find((o) => o.title === occupation)
        if (!occ) {
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.occupation")
          )
        } else {
          parsedAtIndex[idx]!.occupation_id = occ.id
        }
      }

      if (religion) {
        const rel = listTranslatedReligion.find((r) => r.title === religion)
        if (!rel) {
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.religion")
          )
        } else {
          parsedAtIndex[idx]!.religion_id = rel.id
        }
      }

      if (ethnicity) {
        const eth = listTranslatedEthnic.find((e) => e.title === ethnicity)
        if (!eth) {
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.ethnicity")
          )
        } else {
          parsedAtIndex[idx]!.ethnic_id = eth.id
        }
      }

      if (province && city) {
        const selectedProv = listLocation.find(
          (p) => p.name === province && p.level === 0
        )
        const selectedCity = listLocation.find(
          (c) => c.name === city && c.level === 1
        )

        if (!selectedProv)
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.province")
          )
        if (!selectedCity)
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.city")
          )

        if (selectedProv && selectedCity) {
          if (Number(selectedCity.parent_id) !== Number(selectedProv.id)) {
            c.addError(
              rowIdx,
              "validator.not_match",
              fmtLabel(c, "patient.label.city")
            )
          } else {
            parsedAtIndex[idx]!.province_id = selectedProv.id
            parsedAtIndex[idx]!.city_id = selectedCity.id
          }
        }
      }

      if (province_residence && city_residence) {
        const selectedProv = listLocation.find(
          (p) => p.name === province_residence && p.level === 0
        )
        const selectedCity = listLocation.find(
          (c) => c.name === city_residence && c.level === 1
        )

        if (!selectedProv)
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.province_residence")
          )
        if (!selectedCity)
          c.addError(
            rowIdx,
            "validator.not_exist",
            fmtLabel(c, "patient.label.city_residence")
          )

        if (selectedProv && selectedCity) {
          if (Number(selectedCity.parent_id) !== Number(selectedProv.id)) {
            c.addError(
              rowIdx,
              "validator.not_match",
              fmtLabel(c, "patient.label.city_residence")
            )
          } else {
            parsedAtIndex[idx]!.province_residence_id = selectedProv.id
            parsedAtIndex[idx]!.city_residence_id = selectedCity.id
          }
        }
      }

      if (
        vaccination_history != null &&
        vaccination_history !== YES_NO_OPTIONS.YES &&
        vaccination_history !== YES_NO_OPTIONS.NO
      ) {
        c.addError(
          rowIdx,
          "validator.string",
          fmtLabel(c, "patient.label.vaccination_history")
        )
      }

      if (dengue_history === YES_NO_OPTIONS.YES) {
        if (month == null)
          c.addError(
            rowIdx,
            "validator.required",
            fmtLabel(c, "patient.label.month")
          )
        if (year == null)
          c.addError(
            rowIdx,
            "validator.required",
            fmtLabel(c, "patient.label.year")
          )
        if (month != null && !(month >= 1 && month <= 12)) {
          c.addError(
            rowIdx,
            c.var.t("validator.between", {
              field: fmtLabel(c, "patient.label.month"),
              value: "1 - 12",
            })
          )
        }
        const currentYear = new Date().getFullYear()
        if (year != null && !(year <= currentYear)) {
          c.addError(
            rowIdx,
            c.var.t("validator.range_of_must_be_equal", {
              field: fmtLabel(c, "patient.label.year"),
              value: currentYear,
            })
          )
        }
      }
    }

    if (c.var.errors) {
      throw new ValidationError()
    }

    const parsedRows = parsedAtIndex as PatientImportRequestDTO[]
    return parsedRows
  })

  logErrors = createMiddleware(async (c, next) => {
    await next()

    if (c.var.errors) {
      const userId = c.var.user.id
      const data = {
        file: c.var.fileRequest.filename ?? "template.xlsx",
        status: 0,
        notes: JSON.stringify(c.var.errors),
        created_at: new Date(),
        created_by: userId,
        updated_at: new Date(),
        updated_by: userId,
      }

      await this.repo.createLogImportPatient(null, data)
    }
  })
}
