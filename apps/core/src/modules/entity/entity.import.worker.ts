import { DB } from "@/common/infrastructure/database/types/db.js"
import { TransactionManager } from "@smile/lib/database.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { CustomContext } from "@smile/lib/types/context.js"
import {
  EntityImportPublisher,
  ImportEntityJobPayload,
} from "./entity.import.publisher.js"
import { EntityModule } from "./entity.module.js"
import { EntityMiddleware } from "./entity.middleware.js"
import { z } from "zod"
import { ValidationError } from "@smile/lib/error.js"
import {
  ImportEntityRequest,
  ImportEntityRequestSchema,
  ColumnImportSchema,
} from "./entity.schema.js"
import { LOCATION } from "@/common/constants/location.js"

export class EntityImportWorker {
  constructor(
    private readonly module: EntityModule,
    private readonly middleware: EntityMiddleware,
    private readonly publisher: EntityImportPublisher,
    private readonly trxManager: TransactionManager<DB>
  ) {}

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route("ENTITY_IMPORT_REQUESTED", async (_c, msg) => {
      const payload: ImportEntityJobPayload = JSON.parse(msg ?? "{}")

      // Process the import job in the background with a fresh context using transaction
      await this.trxManager.transaction(async (trx) => {
        // Create a custom context-like object that mimics what's needed for the validation and import
        const mockContext = {
          var: {
            userID: payload.userId,
            accountID: payload.accountId,
            language: "id", // Default to Indonesian if not set
            timezone: "Asia/Jakarta", // Default timezone
            t: (key: string) => key, // Simple fallback translation function
            trx: trx,
          },
          set: (key: string, value: any) => {
            // Mock set function - we don't actually need this in background processing
          },
          req: {
            header: () => payload.headers || {},
          },
        } as any // Type assertion to match expected Context interface

        await this.processImportJob(mockContext, payload)
      })
    })
  }

  private async processImportJob(
    c: CustomContext<DB>,
    payload: ImportEntityJobPayload
  ) {
    try {
      // Validate the import data and separate valid from invalid
      const { validRows, invalidRows, errors } = await this.validateImportData(
        c,
        payload.rows
      )

      if (invalidRows.length > 0) {
        console.warn(
          `Found ${invalidRows.length} invalid rows that will be skipped:`,
          errors
        )
        if (invalidRows.length === payload.rows.length) {
          await this.middleware["entityRepo"].deleteImportLogs(
            c,
            payload.importLogId
          )
        }
      }

      if (validRows.length > 0) {
        // Perform the actual import only for valid rows
        await this.middleware["entityRepo"].updateImportLogs(
          c,
          { on_progress: true },
          payload.importLogId
        )

        const result = await this.module.asyncImport(
          c,
          validRows,
          payload.importLogId
        )
      }

      // Return summary
      return {
        success: validRows.length,
        failed: invalidRows.length,
        errors: errors,
      }
    } catch (error) {
      console.error("Entity import job failed:", error)
      await this.middleware["entityRepo"].deleteImportLogs(
        c,
        payload.importLogId
      )
      throw error
    }
  }

  private async validateImportData(
    c: CustomContext<DB>,
    rows: any[]
  ): Promise<{
    validRows: ImportEntityRequest[]
    invalidRows: any[]
    errors: Array<{ row: number; field: string; message: string }>
  }> {
    const COL = {
      Name: "Name",
      Code: "Code",
      Address: "Address",
      TypeId: "TypeId",
      EntityTagId: "EntityTagId",
      ProvinceId: "ProvinceId",
      RegencyId: "RegencyId",
      SubDistrictId: "SubDistrictId",
      VillageId: "VillageId",
      ProgramId: "ProgramId",
      PostalId: "PostalId",
      Latitude: "Latitude",
      Longitude: "Longitude",
      Country: "Country",
      idSatuSehat: "idSatuSehat",
    }

    // Collect validation errors per row
    const rowErrors: Map<
      number,
      Array<{ field: string; message: string }>
    > = new Map()

    const sets = {
      codeSet: new Set<string>(),
      typeIdSet: new Set<number>(),
      entityTagSet: new Set<number>(),
      provinceSet: new Set<number>(),
      regencySet: new Set<number>(),
      subdistrictSet: new Set<number>(),
      villageSet: new Set<number>(),
      programSet: new Set<number>(),
      idSatuSehatSet: new Set<number>(),
    }

    rows.forEach((row) => {
      if (row.Code) sets.codeSet.add(row.Code)
      if (row.TypeId) sets.typeIdSet.add(row.TypeId)
      if (row.EntityTagId) sets.entityTagSet.add(row.EntityTagId)
      if (row.ProvinceId) sets.provinceSet.add(row.ProvinceId)
      if (row.RegencyId) sets.regencySet.add(row.RegencyId)
      if (row.SubDistrictId) sets.subdistrictSet.add(row.SubDistrictId)
      if (row.VillageId) sets.villageSet.add(row.VillageId)
      row.ProgramId?.forEach((num: number) => sets.programSet.add(num))
      if (row.idSatuSehat !== undefined && row.idSatuSehat !== null) {
        sets.idSatuSehatSet.add(row.idSatuSehat)
      }
    })

    if (sets.programSet.size === 0) sets.programSet.add(0)

    // Fetch all referenced data from the database
    const dataFetch = await Promise.all([
      sets.codeSet.size > 0
        ? this.middleware["entityRepo"].findByCodes(c, Array.from(sets.codeSet))
        : Promise.resolve([]),
      sets.typeIdSet.size > 0
        ? this.middleware["entityTypeRepo"].findByIds(
            c,
            Array.from(sets.typeIdSet)
          )
        : Promise.resolve([]),
      sets.entityTagSet.size > 0
        ? this.middleware["entityTagRepo"].findByIds(
            c,
            Array.from(sets.entityTagSet)
          )
        : Promise.resolve([]),
      sets.provinceSet.size > 0
        ? this.middleware["locationRepo"].findByIDs(
            c,
            Array.from(sets.provinceSet),
            LOCATION.PROVINCE
          )
        : Promise.resolve([]),
      sets.regencySet.size > 0
        ? this.middleware["locationRepo"].findByIDs(
            c,
            Array.from(sets.regencySet),
            LOCATION.REGENCY
          )
        : Promise.resolve([]),
      sets.subdistrictSet.size > 0
        ? this.middleware["locationRepo"].findByIDs(
            c,
            Array.from(sets.subdistrictSet),
            LOCATION.SUBDISTRICT
          )
        : Promise.resolve([]),
      sets.villageSet.size > 0
        ? this.middleware["locationRepo"].findByIDs(
            c,
            Array.from(sets.villageSet),
            LOCATION.VILLAGE
          )
        : Promise.resolve([]),
      sets.programSet.size > 0
        ? this.middleware["workspaceRepo"].findAllByIds(
            c,
            Array.from(sets.programSet)
          )
        : Promise.resolve([]),
      sets.idSatuSehatSet.size > 0
        ? this.middleware["entityRepo"].findByIdSatuSehat(
            c,
            Array.from(sets.idSatuSehatSet)
          )
        : Promise.resolve([]),
    ])

    const [
      codes,
      types,
      entityTags,
      provinces,
      regencies,
      subdistricts,
      villages,
      programs,
      idSatuSehat,
    ] = dataFetch

    // Extract valid IDs
    const collectIfNotEmpty = <T extends Record<string, any>>(
      set: Set<number | string>,
      items: T[],
      key: string
    ): (number | string)[] => {
      return set.size > 0 ? items.map((item) => item[key]) : []
    }

    const codeIds = collectIfNotEmpty(sets.codeSet, codes, "code")
    const idSatuSehats = collectIfNotEmpty(
      sets.idSatuSehatSet,
      idSatuSehat,
      "id_satu_sehat"
    )
    const typeIds = collectIfNotEmpty(
      sets.typeIdSet,
      types as Record<string, any>[],
      "id"
    )
    const entityTagIds = collectIfNotEmpty(
      sets.entityTagSet,
      entityTags as Record<string, any>[],
      "id"
    )
    const provinceIds = collectIfNotEmpty(sets.provinceSet, provinces, "id")
    const regencieIds = collectIfNotEmpty(sets.regencySet, regencies, "id")
    const subdistrictIds = collectIfNotEmpty(
      sets.subdistrictSet,
      subdistricts,
      "id"
    )
    const villageIds = collectIfNotEmpty(sets.villageSet, villages, "id")
    const programIds = collectIfNotEmpty(sets.programSet, programs, "id")

    // Validation helpers
    const addIssue = (index: number, field: string, message: string) => {
      if (!rowErrors.has(index)) {
        rowErrors.set(index, [])
      }
      rowErrors.get(index)!.push({ field, message })
    }

    const validateId = (
      index: number,
      id: number | null | undefined,
      validIds: (string | number)[],
      column: string
    ) => {
      if (id && !validIds.includes(id)) {
        addIssue(index, column, `validator.not_exist`)
      }
    }

    const validateLength = (
      index: number,
      value: string | undefined,
      maxLength: number,
      column: string
    ) => {
      if (value && value.length > maxLength) {
        addIssue(
          index,
          column,
          c.var.t("validator.max_length", {
            field: column,
            length: maxLength,
          })
        )
      }
    }

    const codeExist: string[] = []
    const idSatuSehatExist: string[] = []

    rows.forEach((row, index) => {
      // Validate required fields
      if (!row.Name) {
        addIssue(index, COL.Name, c.var.t("validator.required"))
      }
      if (!row.Code) {
        addIssue(index, COL.Code, c.var.t("validator.required"))
      }

      // Validate Code duplicates
      if (row.Code) {
        if (codeIds.includes(row.Code)) {
          addIssue(index, COL.Code, `validator.exist`)
        } else if (codeExist.includes(row.Code)) {
          addIssue(index, COL.Code, `validator.duplicated`)
        } else {
          codeExist.push(row.Code)
        }
      }

      // Validate idSatuSehat
      if (row.idSatuSehat !== undefined && row.idSatuSehat !== null) {
        // Validate exactly 10 digits
        if (String(row.idSatuSehat).length !== 10) {
          addIssue(
            index,
            COL.idSatuSehat,
            c.var.t("validator.exact_length_digit", {
              field: c.var.t("entity.label.msi_code"),
              length: 10,
            })
          )
        }

        if (idSatuSehats.includes(row.idSatuSehat)) {
          addIssue(index, COL.idSatuSehat, `validator.exist`)
        } else if (idSatuSehatExist.includes(row.idSatuSehat.toString())) {
          addIssue(index, COL.idSatuSehat, `validator.duplicated`)
        } else {
          idSatuSehatExist.push(row.idSatuSehat.toString())
        }
      }

      validateId(index, row.TypeId, typeIds, COL.TypeId)
      validateId(index, row.EntityTagId, entityTagIds, COL.EntityTagId)
      validateId(index, row.ProvinceId, provinceIds, COL.ProvinceId)
      validateId(index, row.RegencyId, regencieIds, COL.RegencyId)
      validateId(index, row.SubDistrictId, subdistrictIds, COL.SubDistrictId)
      validateId(index, row.VillageId, villageIds, COL.VillageId)

      if (
        Array.isArray(row.ProgramId) &&
        row.ProgramId.length > 0 &&
        !row.ProgramId.every((id: number) => programIds.includes(id))
      ) {
        addIssue(index, COL.ProgramId, `validator.not_exist`)
      }

      validateLength(index, row.Code, 255, COL.Code)
      validateLength(index, row.Name, 255, COL.Name)
      validateLength(index, row.Address, 255, COL.Address)
      validateLength(index, row.Latitude, 255, COL.Latitude)
      validateLength(index, row.Longitude, 255, COL.Longitude)
    })

    // Separate valid and invalid rows
    const validRows: ImportEntityRequest[] = []
    const invalidRows: any[] = []
    const errors: Array<{ row: number; field: string; message: string }> = []

    rows.forEach((row, index) => {
      if (rowErrors.has(index)) {
        // Row has errors, add to invalid
        invalidRows.push(row)
        const rowErrorList = rowErrors.get(index)!
        rowErrorList.forEach((error) => {
          errors.push({
            row: index + 1, // Human-readable row number (1-indexed)
            field: error.field,
            message: error.message,
          })
        })
      } else {
        // Row is valid, add to valid
        validRows.push(row as ImportEntityRequest)
      }
    })

    return {
      validRows,
      invalidRows,
      errors,
    }
  }
}
