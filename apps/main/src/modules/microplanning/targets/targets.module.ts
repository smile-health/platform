import { LOCATION_LEVEL } from "@/common/constants/dengue.js"
import { maritalStatus } from "@/common/constants/marital-status.js"
import {
  BIAS_COMBINED_TARGET_LABELS,
  FEMALE_ONLY_TARGET_GROUPS,
  GENDER_FEMALE,
  GENDER_MALE,
  MALE_ONLY_TARGET_GROUPS,
  OUT_OF_SCHOOL_TARGET_GROUPS,
  SCHOOL_ENTITY_TAG_ID,
  SCHOOL_TARGET_GROUPS,
  TARGET_GROUP_NAME_TRANSFORM,
  TARGET_GROUP_ORDER,
  VILLAGE_TARGET_GROUPS,
  VILLAGE_TARGET_LABELS,
} from "@/common/constants/target.js"
import { USER_ROLE } from "@/common/constants/user.js"
import {
  buildAddressFromLocation,
  getLocationDetailsFromVillageId,
} from "@/common/utils/address.utils.js"
import { getIdentityAndAddressByNIK as getIdentityAndAddressByNIKUtil } from "@/common/utils/verify-nik.js"
import { ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import moment from "moment"
import { DengueCaseRepository } from "../../dengue/dengue-case/dengue-case.repository.js"
import { EntitySchoolReposity } from "../../entity-school/entity-school.repository.js"
import { EntityRepository } from "../../entity/entity.repository.js"
import { LocationRepository } from "../../location/location.repository.js"
import { TargetGroupRepository } from "../../target-group/target-group.repository.js"
import {
  doDecrypt,
  doEncrypt,
} from "../../transaction/utils/transaction.encryption.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { MicroplanningTemplate } from "./targets.excel.js"
import { TargetsRepository } from "./targets.repository.js"
import {
  AddTargetDataRequest,
  CreateAbsoluteTargetRequestDTO,
  CreateTargetDataSuccessResponseDTO,
  CreateTargetIdealDTO,
  DeleteResponseSchemaDTO,
  GetIdentityAndAddressResponseDTO,
  GetSummaryDetailDTO,
  GetSummaryDetailRequestDTO,
  GetSummaryRequestDTO,
  ImportTargetRequest,
  LocationDetailsResponse,
  NikListRequestDTO,
  SchoolEntitySchema,
  TargetDataDetailResponseSchemaDTO,
  TargetDetailSchema,
  TargetGroup,
  TargetSummaryResponseDTO,
  UpdateTargetDataRequest,
} from "./targets.schema.js"

export class TargetsModule {
  constructor(
    private readonly entitySchoolRepositoty: EntitySchoolReposity,
    private readonly dengueCaseRepo: DengueCaseRepository,
    private readonly targetsRepository: TargetsRepository,
    private readonly locationRepository: LocationRepository,
    private readonly targetGroupRepository: TargetGroupRepository,
    private readonly entityRepository: EntityRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  private getPrefix(id: number | null | undefined): "village" | "school" {
    return id && VILLAGE_TARGET_GROUPS.includes(id) ? "village" : "school"
  }

  private getEntityIdFromContext(c: Context): number {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new Error(c.var.t("targets.errors.entity_id_required"))
    }
    return entityId
  }

  private getLocationIdFromContext(c: Context): {
    provinceId: string
    regencyId: string
    districtId: string
    villageId: string
  } {
    const entity = c.var.userEntity

    if (!entity) {
      throw new Error("Entity not found")
    }

    return {
      provinceId: entity.province_id || null,
      regencyId: entity.regency_id || null,
      districtId: entity.sub_district_id || null,
      villageId: entity.village_id || null,
    }
  }

  private determineAgeGroup(
    dateOfBirth: string,
    gender: number,
    groups: TargetGroup[]
  ): number | undefined {
    const age = this.calculateAge(dateOfBirth)
    if (!age) return undefined

    const groupMap = new Map(groups.map((g) => [g.id, g.id]))
    const rules = [
      { condition: () => age.months < 2, groupId: 1 },
      { condition: () => age.months >= 2 && age.months < 12, groupId: 2 },
      { condition: () => age.years >= 1 && age.years < 2, groupId: 3 },
      {
        condition: () => gender === 2 && age.years >= 15 && age.years < 40,
        groupId: 9,
      },
      { condition: () => age.years >= 12 && gender === 2, groupId: 8 },
      {
        condition: () => gender === 1 && age.years >= 11 && age.years < 12,
        groupId: 10,
      },
      {
        condition: () => age.years >= 11 && age.years < 12 && gender === 2,
        groupId: 7,
      },
      { condition: () => age.years > 7 && age.years <= 8, groupId: 5 },
      { condition: () => age.years > 6 && age.years <= 7, groupId: 4 },
    ]

    const matchedRule = rules.find((rule) => rule.condition())
    return matchedRule && groupMap.has(matchedRule.groupId)
      ? matchedRule.groupId
      : undefined
  }

  private calculateAge(
    dateOfBirth: string
  ): { years: number; months: number; days: number } | undefined {
    const parts = dateOfBirth.split("-").map(Number)
    if (parts.length !== 3) {
      return undefined
    }

    const [year, month, day] = parts as [number, number, number]
    const birthDate = new Date(year, month - 1, day)
    const today = new Date()

    if (birthDate.getTime() > today.getTime()) {
      return undefined
    }

    const days = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const birthYear = birthDate.getFullYear()
    const birthMonth = birthDate.getMonth()
    const birthDay = birthDate.getDate()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    const currentDay = today.getDate()

    let months = (currentYear - birthYear) * 12 + (currentMonth - birthMonth)
    if (currentDay < birthDay) {
      months--
    }

    let years = currentYear - birthYear
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      years--
    }

    return { years, months, days }
  }

  async create(
    c: Context,
    data: AddTargetDataRequest,
    userId?: number,
    ignoreDuplicates: boolean = false
  ): Promise<CreateTargetDataSuccessResponseDTO | null> {
    const encryptedNIK = doEncrypt(data.nik)
    const encryptedDoB = doEncrypt(data.date_of_birth)
    const encryptedRegisteredAdress = data.registered_address
      ? doEncrypt(data.registered_address)
      : undefined
    const encryptedResidenceAdress = data.residence_address
      ? doEncrypt(data.residence_address)
      : undefined
    const encryptedPhoneNumber = data.phone_number
      ? doEncrypt(data.phone_number)
      : undefined
    const encryptedName = doEncrypt(data.name)

    const groups = await this.targetGroupRepository.findAll(c)
    const targetGroupId = this.determineAgeGroup(
      data.date_of_birth,
      data.gender,
      groups
    )

    const isVillageTarget =
      targetGroupId && VILLAGE_TARGET_GROUPS.includes(targetGroupId)

    const registeredDetails = getLocationDetailsFromVillageId(
      data.registered_village_id
    )
    const residenceDetails = getLocationDetailsFromVillageId(
      data.residence_village_id
    )

    const entityId = this.getEntityIdFromContext(c)
    const { provinceId: entityProvinceId } = this.getLocationIdFromContext(c)
    const microplanningId = c.var.microplanningId!

    const microplanning = await this.targetsRepository.getMicroplanningById(
      c,
      microplanningId
    )
    const targetStatus = microplanning?.status ?? 0
    const microplanningYear =
      microplanning?.year ?? new Date().getFullYear() + 1

    const targetData = {
      nik: encryptedNIK,
      gender: data.gender,
      date_of_birth: encryptedDoB,
      registered_province_id: registeredDetails.provinceId,
      registered_regency_id: registeredDetails.regencyId,
      registered_subdistrict_id: registeredDetails.subdistrictId,
      registered_village_id: data.registered_village_id,
      registered_postal_code: data.registered_postal_code ?? null,
      registered_address: encryptedRegisteredAdress ?? null,
      residence_province_id: residenceDetails.provinceId,
      residence_regency_id: residenceDetails.regencyId,
      residence_subdistrict_id: residenceDetails.subdistrictId,
      residence_village_id: data.residence_village_id,
      residence_postal_code: data.residence_postal_code ?? null,
      residence_address: encryptedResidenceAdress ?? null,
      entity_id:
        isVillageTarget || !targetGroupId
          ? undefined
          : (data.entity_id ?? undefined),
      grade:
        isVillageTarget || !targetGroupId
          ? undefined
          : (data.grade ?? undefined),
      target_group_id: targetGroupId ?? null,
      microplanning_id: microplanningId,
      status: targetStatus,
      name: encryptedName,
      marital_status: data.marital_status ?? 0,
      education_id: data.education_id ?? null,
      occupation_id: data.occupation_id ?? null,
      religion_id: data.religion_id ?? null,
      ethnic_id: data.ethnic_id ?? null,
      phone_number: encryptedPhoneNumber ?? null,
      identity_type: 1,
      created_by: userId,
      updated_by: userId,
    }

    const targetDataId = ignoreDuplicates
      ? await this.targetsRepository.createIgnoreDuplicate(c, targetData)
      : await this.targetsRepository.create(c, targetData)

    if (!targetDataId) {
      return null
    }

    const targetIdealsData = await this.buildTargetIdealsData(
      c,
      data.date_of_birth,
      data.gender,
      Number(targetDataId.insertId),
      microplanningId,
      microplanningYear,
      Number(entityProvinceId)
    )

    await this.targetsRepository.createTargetIdeals(c, targetIdealsData)

    return {
      id: Number(targetDataId.insertId),
    }
  }

  async createAbsoluteTarget(c: Context, data: CreateAbsoluteTargetRequestDTO) {
    const location = this.getLocationIdFromContext(c)
    const microplanningId = c.var.microplanningId!

    const absoluteTargetData = {
      microplan_id: microplanningId,
      target_group_id: data.target_group_id,
      entity_id: data.entity_id,
      qty: data.qty,
      province_id: location.provinceId,
      regency_id: location.regencyId,
      district_id: location.districtId,
      village_id: location.villageId,
    }

    await this.targetsRepository.upsertAbsoluteTarget(c, absoluteTargetData)

    return {
      status: true,
    }
  }

  private async buildTargetIdealsData(
    c: Context,
    dateOfBirth: string,
    gender: number,
    targetId: number,
    microplanningId: number,
    year: number,
    provinceId: number
  ): Promise<CreateTargetIdealDTO[]> {
    const mpProgramConfigIds =
      await this.mpConfigRepo.getActiveProgramConfigIds(c, year)
    const materialTargets =
      await this.targetsRepository.getAllImmunizationMaterialTargets(
        c,
        mpProgramConfigIds,
        provinceId
      )

    const today = moment().format("YYYY-MM-DD")
    const targetIdealsData: CreateTargetIdealDTO[] = []

    for (const mt of materialTargets) {
      if (mt.start_ideal_days == null) continue

      const addDate = mt.category == "bias" ? "year" : "month"

      const idealDate = moment(dateOfBirth)
        .add(mt.start_ideal_days, "days")
        .format("YYYY-MM-DD")

      const endIdealDate = moment(idealDate)
        .add(1, addDate)
        .format("YYYY-MM-DD")

      const isWithinIdealRange =
        (today >= idealDate && today <= endIdealDate) || idealDate >= today

      if (!isWithinIdealRange) continue

      const idealDateInDays = Math.abs(
        moment(dateOfBirth).diff(moment(idealDate), "days")
      )

      const targetGroup = await this.targetsRepository.getTargetGroup(
        c,
        idealDateInDays,
        gender
      )

      targetIdealsData.push({
        target_id: targetId,
        material_id: mt.material_id,
        material_target_id: Number(mt.id),
        start_ideal_days: mt.start_ideal_days,
        ideal_date: idealDate,
        end_ideal_date: endIdealDate,
        target_group_id: targetGroup?.id ?? 0,
        microplanning_id: microplanningId,
        created_by: c.var.userId ?? 0,
        patient_id: targetId,
      })
    }

    return targetIdealsData
  }

  async getIdentityAndAddressByNIK(
    c: Context,
    nik: string
  ): Promise<GetIdentityAndAddressResponseDTO> {
    return getIdentityAndAddressByNIKUtil(c, nik, this.locationRepository)
  }

  async getSummaryDetailsWithTargetGroupId(
    c: Context,
    param: GetSummaryDetailRequestDTO,
    sub_district_id: string
  ): Promise<GetSummaryDetailDTO> {
    const microplanningId = c.var.microplanningId!
    const entityId = c.var.userEntity.id
    const subDistrictIdNum = Number(sub_district_id)
    const targetGroupId = Number(param.target_group_id)
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1
    const allTargetGroups = await this.targetsRepository.getAllTargetGroups(c)

    const absoluteMicroplanningId = microplanningId
    // Promoted source = prevYear MP (where last period's BBL are stored)
    // Fallback to microplanningId if prevYear MP doesn't exist yet (first period)
    const prevYearMp = await this.targetsRepository.findMicroplanningByYear(
      c,
      entityId,
      currentYear
    )
    const promotedSourceMpId = prevYearMp?.id ?? microplanningId

    const absoluteCounts =
      await this.targetsRepository.absoluteTargetGroupCounts(
        c,
        absoluteMicroplanningId,
        subDistrictIdNum,
        [Math.floor(targetGroupId)]
      )

    const absoluteCount =
      absoluteCounts.find((item) => item.id === targetGroupId)?.qty ?? 0

    if (OUT_OF_SCHOOL_TARGET_GROUPS.includes(targetGroupId)) {
      const parentTargetGroupId = Math.floor(targetGroupId)
      const { result } = await this.locationRepository.findTargetsByLocation(
        c,
        subDistrictIdNum,
        parentTargetGroupId,
        microplanningId
      )

      const promotedMap = await this.getPromotedTargetsByReference(
        c,
        subDistrictIdNum,
        targetGroupId,
        promotedSourceMpId,
        allTargetGroups,
        "location",
        nextYear
      )

      // Get absolute targets per village using nextYear microplanning
      const absoluteTargetsByEntity =
        await this.targetsRepository.getAbsoluteTargetsByEntity(
          c,
          absoluteMicroplanningId,
          targetGroupId,
          "village"
        )
      const absoluteCount = absoluteTargetsByEntity.reduce(
        (acc, item) => acc + Number(item.total),
        0
      )
      const dataAbsolute = absoluteTargetsByEntity.map((item) => ({
        id: item.id,
        village_name: item.village_name,
        total: Number(item.total),
      }))

      const rawData = await result
      const absoluteMap = new Map(
        dataAbsolute.map((item) => [item.id, item.total])
      )
      const data = rawData.map((item) => ({
        ...item,
        total: Number(item.total) + (promotedMap.get(item.id) ?? 0),
        total_absolute: absoluteMap.get(item.id) ?? 0,
      }))
      const total = data.reduce<number>((acc, item) => acc + item.total, 0)

      return {
        total: total + absoluteCount,
        absolute_count: absoluteCount,
        data,
      }
    }

    if (SCHOOL_TARGET_GROUPS.includes(targetGroupId)) {
      const { schoolTargets } =
        await this.entityRepository.findTargetsByEntities(
          c,
          subDistrictIdNum,
          targetGroupId,
          microplanningId
        )

      const promotedMap = await this.getPromotedTargetsByReference(
        c,
        subDistrictIdNum,
        targetGroupId,
        promotedSourceMpId,
        allTargetGroups,
        "entity",
        nextYear
      )

      // Get absolute targets per school using nextYear microplanning
      const absoluteTargetsByEntity =
        await this.targetsRepository.getAbsoluteTargetsByEntity(
          c,
          absoluteMicroplanningId,
          targetGroupId,
          "school"
        )
      const absoluteCount = absoluteTargetsByEntity.reduce(
        (acc, item) => acc + Number(item.total),
        0
      )
      const dataAbsolute = absoluteTargetsByEntity.map((item) => ({
        id: item.id,
        village_name: item.village_name,
        total: Number(item.total),
      }))

      const absoluteMap = new Map(
        dataAbsolute.map((item) => [item.id, item.total])
      )
      const data = schoolTargets.map((item) => ({
        ...item,
        total: Number(item.total) + (promotedMap.get(item.id) ?? 0),
        total_absolute: absoluteMap.get(item.id) ?? 0,
      }))
      const total = data.reduce((acc, item) => acc + item.total, 0)

      return {
        total: total + absoluteCount,
        absolute_count: absoluteCount,
        data,
      }
    }

    const locationPromise = this.locationRepository.findTargetsByLocation(
      c,
      subDistrictIdNum,
      targetGroupId,
      microplanningId
    )
    const promotedMap = await this.getPromotedTargetsByReference(
      c,
      subDistrictIdNum,
      targetGroupId,
      promotedSourceMpId,
      allTargetGroups,
      "location",
      nextYear
    )
    const { result } = await locationPromise

    // Get absolute targets per village using nextYear microplanning
    const absoluteTargetsByEntity =
      await this.targetsRepository.getAbsoluteTargetsByEntity(
        c,
        absoluteMicroplanningId,
        targetGroupId,
        "village"
      )
    const dataAbsolute = absoluteTargetsByEntity.map((item) => ({
      id: item.id,
      village_name: item.village_name,
      total: Number(item.total),
    }))

    const absoluteMap = new Map(
      dataAbsolute.map((item) => [item.id, item.total])
    )
    const rawData = await result
    const data = rawData.map((item) => ({
      ...item,
      total: Number(item.total) + (promotedMap.get(item.id) ?? 0),
      total_absolute: absoluteMap.get(item.id) ?? 0,
    }))
    const total = data.reduce((acc, item) => acc + item.total, 0)

    return {
      total: total + absoluteCount,
      absolute_count: absoluteCount,
      data,
    }
  }

  // Resolve the actual year of the request's resolved microplanning, instead
  // of assuming it's always the current calendar year + 1.
  private getAllPreviousTargetGroupIds(targetGroupId: number): number[] {
    const idx = TARGET_GROUP_ORDER.indexOf(Math.floor(targetGroupId))
    if (idx <= 0) return []
    return TARGET_GROUP_ORDER.slice(0, idx)
  }

  private isTargetInGroup(
    originalGroupId: number,
    currentGroupId: number,
    queryGroupId: number,
    gender: number
  ): boolean {
    if (
      FEMALE_ONLY_TARGET_GROUPS.includes(queryGroupId) &&
      gender !== GENDER_FEMALE
    )
      return false
    if (
      MALE_ONLY_TARGET_GROUPS.includes(queryGroupId) &&
      gender !== GENDER_MALE
    )
      return false

    const origIdx = TARGET_GROUP_ORDER.indexOf(originalGroupId)
    const queryIdx = TARGET_GROUP_ORDER.indexOf(Math.floor(queryGroupId))

    return queryIdx >= origIdx && currentGroupId === Math.floor(queryGroupId)
  }

  private async getPromotedTargetsByReference(
    c: Context,
    subDistrictId: number,
    queryGroupId: number,
    microplanningId: number,
    allGroups: Array<{ id: number; age_min: number; age_max: number }>,
    type: "location" | "entity",
    nextYear?: number
  ): Promise<Map<number, number>> {
    const promotedByRef = new Map<number, number>()
    const prevGroupIds = this.getAllPreviousTargetGroupIds(queryGroupId)
    if (prevGroupIds.length === 0) return promotedByRef

    const now = new Date()
    const currentYear = nextYear ? nextYear - 1 : now.getFullYear()
    const today = new Date(currentYear, now.getMonth(), now.getDate())
    const flooredQueryGroupId = Math.floor(queryGroupId)

    for (const prevGroupId of prevGroupIds) {
      const targets = await this.fetchTargetsByType(
        c,
        type,
        subDistrictId,
        prevGroupId,
        microplanningId
      )

      this.processPromotedTargets(
        targets,
        today,
        allGroups,
        prevGroupId,
        flooredQueryGroupId,
        type,
        promotedByRef
      )
    }

    return promotedByRef
  }

  private async fetchTargetsByType(
    c: Context,
    type: "location" | "entity",
    subDistrictId: number,
    prevGroupId: number,
    microplanningId: number
  ) {
    return type === "location"
      ? this.targetsRepository.getTargetsWithDateOfBirthByLocation(
          c,
          subDistrictId,
          prevGroupId,
          microplanningId
        )
      : this.targetsRepository.getTargetsWithDateOfBirthByEntity(
          c,
          subDistrictId,
          prevGroupId,
          microplanningId
        )
  }

  private processPromotedTargets(
    targets: Array<{
      target_id: number | null
      date_of_birth: string | null
      gender: number | null
      village_id?: number
      entity_id?: number
    }>,
    today: Date,
    allGroups: Array<{ id: number; age_min: number; age_max: number }>,
    prevGroupId: number,
    queryGroupId: number,
    type: "location" | "entity",
    promotedByRef: Map<number, number>
  ): void {
    for (const t of targets) {
      const refId = this.getPromotedRefId(
        t,
        today,
        allGroups,
        prevGroupId,
        queryGroupId,
        type
      )
      if (refId !== null) {
        promotedByRef.set(refId, (promotedByRef.get(refId) ?? 0) + 1)
      }
    }
  }

  private getPromotedRefId(
    t: {
      target_id: number | null
      date_of_birth: string | null
      gender: number | null
      village_id?: number
      entity_id?: number
    },
    today: Date,
    allGroups: Array<{ id: number; age_min: number; age_max: number }>,
    prevGroupId: number,
    queryGroupId: number,
    type: "location" | "entity"
  ): number | null {
    if (!t.target_id || !t.date_of_birth || !t.gender) return null

    const dob = doDecrypt(t.date_of_birth)
    const ageInDays = moment(today).diff(moment(dob), "days")
    if (ageInDays < 0) return null

    const matched = this.findMatchingTargetGroup(ageInDays, t.gender, allGroups)
    if (!matched) return null

    if (
      !this.isTargetInGroup(prevGroupId, matched.id, queryGroupId, t.gender)
    ) {
      return null
    }

    return type === "location"
      ? (t as { village_id: number }).village_id
      : (t as { entity_id: number }).entity_id
  }

  async getNikList(c: Context, query: NikListRequestDTO) {
    let entityId = this.getEntityIdFromContext(c)
    const microplanningId = c.var.microplanningId!
    let nextYear = c.var.microplanningYear!
    let currentYear = nextYear - 1

    const role = c.var.user?.role
    if (role === USER_ROLE.SUPERADMIN) {
      if (query.year) {
        nextYear = query.year
        currentYear = nextYear - 1
      }
      if (query.entity_id) entityId = query.entity_id
    }

    if (query.keyword) {
      query.keyword = doEncrypt(query.keyword)
    }

    const categoryIdNum = query.category_id
      ? Number(query.category_id)
      : undefined
    const baseTargetGroupId = categoryIdNum
      ? Math.floor(categoryIdNum)
      : undefined

    const { list, total, name, category_id } =
      await this.targetsRepository.findAll(c, query, microplanningId)

    const prevYearMp = await this.targetsRepository.findMicroplanningByYear(
      c,
      entityId,
      currentYear
    )
    const promotedSourceMpId = prevYearMp?.id ?? microplanningId

    const promotedList = await this.getPromotedNikList(
      c,
      Number(query.id),
      baseTargetGroupId,
      promotedSourceMpId,
      query.prefix === "school" ? "entity" : "location",
      nextYear
    )

    const combinedList = [...list, ...promotedList]
    const decryptedList = combinedList.map((item) => ({
      id: item.id,
      nik: doDecrypt(item.nik),
    }))

    const categoryIdMap: Record<number, string> = { 10: "11", 13.1: "11.1" }
    const mappedCategoryId = category_id
      ? (categoryIdMap[category_id] ?? category_id)
      : null
    const mappedList = {
      name,
      category_name: mappedCategoryId
        ? c.var.t(`targets.target_group.${mappedCategoryId}`)
        : null,
      list: decryptedList,
    }

    return new PaginatedResponse(query, mappedList, total + promotedList.length)
  }

  private async getPromotedNikList(
    c: Context,
    referenceId: number,
    queryGroupId: number | undefined,
    microplanningId: number,
    type: "location" | "entity",
    nextYear: number
  ): Promise<Array<{ nik: string; id: number }>> {
    if (!queryGroupId) return []

    const prevGroupIds = this.getAllPreviousTargetGroupIds(queryGroupId)
    if (prevGroupIds.length === 0) return []

    const allGroups = await this.targetsRepository.getAllTargetGroups(c)
    const now = new Date()
    const today = new Date(nextYear - 1, now.getMonth(), now.getDate())
    const promoted: Array<{ nik: string; id: number }> = []

    for (const prevGroupId of prevGroupIds) {
      const targets = await this.targetsRepository.getTargetsByReferenceId(
        c,
        referenceId,
        prevGroupId,
        microplanningId,
        type
      )

      const promotedFromGroup = this.filterPromotedNikTargets(
        targets,
        today,
        allGroups,
        prevGroupId,
        queryGroupId
      )
      promoted.push(...promotedFromGroup)
    }

    return promoted
  }

  private filterPromotedNikTargets(
    targets: Array<{
      id: number
      nik: string
      date_of_birth: string | null
      gender: number | null
    }>,
    today: Date,
    allGroups: Array<{ id: number; age_min: number; age_max: number }>,
    prevGroupId: number,
    queryGroupId: number
  ): Array<{ nik: string; id: number }> {
    const result: Array<{ nik: string; id: number }> = []

    for (const t of targets) {
      if (!t.date_of_birth || !t.gender) continue

      const dob = doDecrypt(t.date_of_birth)
      const ageInDays = moment(today).diff(moment(dob), "days")
      if (ageInDays < 0) continue

      const matched = this.findMatchingTargetGroup(
        ageInDays,
        t.gender,
        allGroups
      )
      if (!matched) continue

      if (
        this.isTargetInGroup(prevGroupId, matched.id, queryGroupId, t.gender)
      ) {
        result.push({ nik: t.nik, id: t.id })
      }
    }

    return result
  }

  async deleteDataByNIK(
    c: Context,
    nik: string
  ): Promise<DeleteResponseSchemaDTO> {
    const microplanningId = c.var.microplanningId!

    let message: string = c.var.t("targets.responses.delete_success")
    let status: boolean = true
    const encryptedNIK = doEncrypt(nik)

    const response = await this.targetsRepository.delete(
      c,
      encryptedNIK,
      microplanningId
    )
    if (!response) {
      message = c.var.t("targets.responses.delete_failed")
      status = false
    }

    return {
      message,
      status,
    }
  }

  async getDetail(
    c: Context,
    nik: string
  ): Promise<TargetDataDetailResponseSchemaDTO> {
    const microplanningId = c.var.microplanningId!

    const encryptedNIK = doEncrypt(nik)
    const target = (await this.targetsRepository.findByNik(
      c,
      encryptedNIK,
      microplanningId
    )) as TargetDetailSchema

    if (!target) {
      throw new ValidationError(
        c.var.t("validator.not_exist", {
          field: c.var.t("targets.label.nik"),
        })
      )
    }

    target.nik = doDecrypt(target.nik)
    target.date_of_birth = doDecrypt(target.date_of_birth)
    target.phone_number = doDecrypt(target.phone_number)
    target.name = doDecrypt(target.name)
    target.residence_address = target.residence_address
      ? doDecrypt(target.residence_address)
      : target.residence_address
    target.registered_address = target.registered_address
      ? doDecrypt(target.registered_address)
      : target.registered_address

    const residence_village = (await this.locationRepository.getDetails(
      c,
      target.residence_village_id
    )) as LocationDetailsResponse

    const registered_village = (await this.locationRepository.getDetails(
      c,
      target.registered_village_id
    )) as LocationDetailsResponse

    const school_entity = (await this.entityRepository.findById(
      c,
      target.entity_id
    )) as SchoolEntitySchema | undefined

    return this.#detailTargetMapped(
      target,
      residence_village,
      registered_village,
      school_entity
    )
  }

  async updateTargetData(
    c: Context,
    nik: string,
    data: UpdateTargetDataRequest
  ): Promise<TargetDataDetailResponseSchemaDTO> {
    const microplanningId = c.var.microplanningId!

    const encryptedNIK = doEncrypt(nik)
    const encryptedName = doEncrypt(data.name)
    const encryptedRegisteredAddress = data.registered_address
      ? doEncrypt(data.registered_address)
      : undefined
    const encryptedResidenceAddress = data.residence_address
      ? doEncrypt(data.residence_address)
      : undefined
    const encryptedPhoneNumber = doEncrypt(data.phone_number)

    const detailedNik = getIdentityAndAddressByNIKUtil(
      c,
      nik,
      this.locationRepository
    )
    const groups = await this.targetGroupRepository.findAll(c)
    const targetGroupId = this.determineAgeGroup(
      (await detailedNik).date_of_birth,
      (await detailedNik).gender,
      groups
    )

    const isVillageTarget =
      targetGroupId && VILLAGE_TARGET_GROUPS.includes(targetGroupId)

    await this.targetsRepository.update(
      c,
      encryptedNIK,
      {
        registered_village_id: data.registered_village_id
          ? Number(data.registered_village_id)
          : undefined,
        registered_postal_code: data.registered_postal_code,
        registered_address: encryptedRegisteredAddress ?? null,
        residence_village_id: data.residence_village_id
          ? Number(data.residence_village_id)
          : undefined,
        residence_postal_code: data.residence_postal_code,
        residence_address: encryptedResidenceAddress ?? null,
        entity_id: isVillageTarget ? null : (data.entity_id ?? null),
        grade: isVillageTarget ? null : (data.grade ?? null),
        name: encryptedName,
        marital_status: data.marital_status ?? 0,
        education_id: data.education_id,
        occupation_id: data.occupation_id,
        religion_id: data.religion_id,
        ethnic_id: data.ethnic_id,
        phone_number: encryptedPhoneNumber,
      },
      microplanningId
    )

    // update microplan target consumptions
    await this.updateMicroplanTargetConsumptions(
      c,
      encryptedNIK,
      microplanningId
    )

    return this.getDetail(c, nik)
  }

  #detailTargetMapped(
    target: TargetDetailSchema,
    residence_village: LocationDetailsResponse,
    registered_village: LocationDetailsResponse,
    school_entity: SchoolEntitySchema | undefined
  ) {
    const registeredAddressLocation = buildAddressFromLocation(
      registered_village,
      target.registered_postal_code
    )
    const residenceAddressLocation = buildAddressFromLocation(
      residence_village,
      target.residence_postal_code
    )

    const maritalStatusData = maritalStatus.find(
      (status) => status.id === target.marital_status
    )

    const mappedData = {
      id: target.id,
      nik: target.nik,
      personal_identity: {
        name: target.name,
        date_of_birth: target.date_of_birth,
        gender: target.gender,
      },
      registered_address: {
        ...registeredAddressLocation,
        address: target.registered_address,
      },
      residence_address: {
        ...residenceAddressLocation,
        address: target.residence_address,
      },
      demographic_info: {
        marital_status: {
          id: target.marital_status,
          title: maritalStatusData?.title ?? "",
        },
        education: {
          id: target.education_id,
          title: target.education_title || "",
        },
        occupation: {
          id: target.occupation_id,
          title: target.occupation_title || "",
        },
        religion: {
          id: target.religion_id,
          title: target.religion_title || "",
        },
        ethnic: {
          id: target.ethnic_id,
          title: target.ethnic_title || "",
        },
        phone_number: target.phone_number,
      },
    } as TargetDataDetailResponseSchemaDTO

    if (school_entity) {
      mappedData.school_address = {
        province_id: school_entity.province_id,
        province: school_entity.province,
        city_id: school_entity.city_id,
        city: school_entity.city,
        district_id: school_entity.district_id,
        district: school_entity.district,
        school_id: school_entity.school_id,
        school_name: school_entity.school_name,
        grade: target.target_group_name,
      }
    }
    return mappedData
  }

  private getTargetGroupIdsByType(type: string | null | undefined): number[] {
    const allIds = Object.keys(TARGET_GROUP_NAME_TRANSFORM).map(Number)

    if (!type || type === "") {
      return allIds
    }

    if (type?.toUpperCase() !== "BIAS") {
      return VILLAGE_TARGET_GROUPS
    }

    return allIds.filter((id) => !VILLAGE_TARGET_GROUPS.includes(id))
  }

  async getGroupedSummary(
    c: Context,
    query: { group_by: "bias" | "non-bias" },
    sub_district_id: string
  ) {
    const microplanningId = c.var.microplanningId!

    const [rawData, absoluteCounts, absoluteByEntity] = await Promise.all([
      this.targetsRepository.findGroupedTargets(
        c,
        query.group_by,
        microplanningId,
        Number(sub_district_id)
      ),
      this.targetsRepository.absoluteTargetGroupCounts(
        c,
        microplanningId,
        Number(sub_district_id),
        query.group_by === "non-bias"
          ? VILLAGE_TARGET_GROUPS
          : SCHOOL_TARGET_GROUPS
      ),
      this.targetsRepository.getAbsoluteTargetsGroupedByEntity(
        c,
        microplanningId,
        query.group_by === "non-bias"
          ? VILLAGE_TARGET_GROUPS
          : SCHOOL_TARGET_GROUPS,
        query.group_by === "non-bias" ? "village" : "school"
      ),
    ])

    if (query.group_by === "non-bias") {
      return this.formatVillageGrouping(
        c,
        rawData,
        absoluteCounts,
        absoluteByEntity
      )
    }

    return this.formatSchoolGrouping(
      c,
      rawData,
      Number(sub_district_id),
      microplanningId,
      absoluteCounts,
      absoluteByEntity
    )
  }

  private buildAbsoluteByVillageMap(
    absoluteByEntity: Awaited<
      ReturnType<
        typeof this.targetsRepository.getAbsoluteTargetsGroupedByEntity
      >
    >
  ): Map<number, Map<number, number>> {
    const absoluteByVillage = new Map<number, Map<number, number>>()
    for (const abs of absoluteByEntity) {
      if (!absoluteByVillage.has(abs.entity_id)) {
        absoluteByVillage.set(abs.entity_id, new Map())
      }
      const villageMap = absoluteByVillage.get(abs.entity_id)!
      villageMap.set(abs.target_group_id, abs.qty)
    }
    return absoluteByVillage
  }

  private processVillageAbsoluteCounts(
    villages: Map<any, any>,
    absoluteByVillage: Map<number, Map<number, number>>,
    rawData: any[],
    villageLabel: string
  ): void {
    for (const [villageId, absoluteMap] of absoluteByVillage) {
      if (!villages.has(villageId)) {
        const villageName = rawData.find((r) => r.id === villageId)?.name ?? ""
        villages.set(villageId, {
          name: `${villageLabel} ${villageName}`,
          targets: new Map(VILLAGE_TARGET_GROUPS.map((id) => [id, 0])),
        })
      }
      const village = villages.get(villageId)
      for (const [targetGroupId, absCount] of absoluteMap) {
        if (VILLAGE_TARGET_GROUPS.includes(targetGroupId)) {
          const currentCount = village.targets.get(targetGroupId) ?? 0
          village.targets.set(targetGroupId, currentCount + absCount)
        }
      }
    }
  }

  private formatVillageGrouping(
    c: Context,
    rawData: any[],
    absoluteCounts: Awaited<
      ReturnType<typeof this.targetsRepository.absoluteTargetGroupCounts>
    >,
    absoluteByEntity: Awaited<
      ReturnType<
        typeof this.targetsRepository.getAbsoluteTargetsGroupedByEntity
      >
    >
  ) {
    const villages = new Map()
    const villageLabel = c.var.t("targets.village_label")
    const absoluteByVillage = this.buildAbsoluteByVillageMap(absoluteByEntity)

    for (const row of rawData) {
      if (!villages.has(row.id)) {
        villages.set(row.id, {
          name: `${villageLabel} ${row.name}`,
          targets: new Map(VILLAGE_TARGET_GROUPS.map((id) => [id, 0])),
        })
      }

      const village = villages.get(row.id)
      const targetGroupId = row.target_group_id

      if (targetGroupId && VILLAGE_TARGET_GROUPS.includes(targetGroupId)) {
        const count = village.targets.get(targetGroupId)
        village.targets.set(targetGroupId, count + 1)
      }
    }

    this.processVillageAbsoluteCounts(
      villages,
      absoluteByVillage,
      rawData,
      villageLabel
    )

    return {
      data: Array.from(villages.values()).map((village) => ({
        name: village.name,
        targets: VILLAGE_TARGET_GROUPS.map((id) => ({
          category: c.var.t(`targets.target_group.${id}`),
          count: village.targets.get(id),
        })),
      })),
    }
  }

  private buildSchoolAbsoluteMaps(
    absoluteCounts: Awaited<
      ReturnType<typeof this.targetsRepository.absoluteTargetGroupCounts>
    >,
    absoluteByEntity: Awaited<
      ReturnType<
        typeof this.targetsRepository.getAbsoluteTargetsGroupedByEntity
      >
    >
  ): {
    absoluteBySchool: Map<number, Map<number, number>>
    outOfSchoolAbsoluteCounts: Map<number, number>
  } {
    const absoluteBySchool = new Map<number, Map<number, number>>()
    const outOfSchoolAbsoluteCounts = new Map<number, number>()

    for (const abs of absoluteByEntity) {
      if (!absoluteBySchool.has(abs.entity_id)) {
        absoluteBySchool.set(abs.entity_id, new Map())
      }
      const schoolMap = absoluteBySchool.get(abs.entity_id)!
      schoolMap.set(abs.target_group_id, abs.qty)
    }

    for (const abs of absoluteCounts) {
      if (!Number.isInteger(abs.id)) {
        const intId = Math.floor(abs.id)
        const actualId = intId === 10 ? 10 : intId
        outOfSchoolAbsoluteCounts.set(actualId, Number(abs.qty ?? 0))
      }
    }

    return { absoluteBySchool, outOfSchoolAbsoluteCounts }
  }

  private processSchoolAbsoluteCounts(
    schoolGroups: Map<any, any>,
    absoluteBySchool: Map<number, Map<number, number>>,
    rawData: any[]
  ): void {
    for (const [schoolId, absoluteMap] of absoluteBySchool) {
      if (!schoolGroups.has(schoolId)) {
        const schoolName = rawData.find((r) => r.id === schoolId)?.name ?? ""
        schoolGroups.set(schoolId, {
          name: schoolName,
          counts: new Map(SCHOOL_TARGET_GROUPS.map((id) => [id, 0])),
        })
      }
      const school = schoolGroups.get(schoolId)
      for (const [targetGroupId, absCount] of absoluteMap) {
        if (SCHOOL_TARGET_GROUPS.includes(targetGroupId)) {
          const currentCount = school.counts.get(targetGroupId) ?? 0
          school.counts.set(targetGroupId, currentCount + absCount)
        }
      }
    }
  }

  private async formatSchoolGrouping(
    c: Context,
    rawData: any[],
    subDistrictId: number,
    microplanningId: number,
    absoluteCounts: Awaited<
      ReturnType<typeof this.targetsRepository.absoluteTargetGroupCounts>
    >,
    absoluteByEntity: Awaited<
      ReturnType<
        typeof this.targetsRepository.getAbsoluteTargetsGroupedByEntity
      >
    >
  ) {
    const schoolGroups = this.aggregateTargetsByEntity(
      rawData,
      SCHOOL_TARGET_GROUPS
    )
    const { absoluteBySchool, outOfSchoolAbsoluteCounts } =
      this.buildSchoolAbsoluteMaps(absoluteCounts, absoluteByEntity)

    this.processSchoolAbsoluteCounts(schoolGroups, absoluteBySchool, rawData)

    const targetBySchool = this.mapEntitiesToTargetList(c, schoolGroups)
    const outOfSchool = await this.getOutOfSchoolSummary(
      c,
      subDistrictId,
      microplanningId,
      outOfSchoolAbsoluteCounts
    )

    return {
      data_out_of_school: [outOfSchool],
      data: targetBySchool,
    }
  }

  private aggregateTargetsByEntity(data: any[], groupIds: number[]) {
    const entities = new Map()

    for (const item of data) {
      if (!entities.has(item.id)) {
        entities.set(item.id, {
          name: item.name,
          counts: new Map(groupIds.map((id) => [id, 0])),
        })
      }

      const entity = entities.get(item.id)
      if (item.target_group_id && groupIds.includes(item.target_group_id)) {
        const current = entity.counts.get(item.target_group_id)
        entity.counts.set(item.target_group_id, current + 1)
      }
    }

    return entities
  }

  private mapEntitiesToTargetList(c: Context, entities: Map<any, any>) {
    return Array.from(entities.values()).map((entity) => ({
      name: entity.name,
      targets: this.formatTargetCategories(c, entity.counts),
    }))
  }

  private formatTargetCategories(
    c: Context,
    counts: Map<number, number>,
    prefix = ""
  ) {
    const targetGroupId11 = 13
    return [
      {
        category: prefix + c.var.t("targets.school_target.4"),
        count: counts.get(4),
      },
      {
        category: prefix + c.var.t("targets.school_target.5"),
        count: counts.get(5),
      },
      {
        category: prefix + c.var.t("targets.school_target.7"),
        targets: [
          {
            category: c.var.t("bias_immunization_logistics.td_male_female"),
            count: (counts.get(7) ?? 0) + (counts.get(targetGroupId11) ?? 0),
          },
          {
            category: c.var.t("bias_immunization_logistics.hpv_female"),
            count: counts.get(7),
          },
        ],
      },
    ]
  }

  private async getOutOfSchoolSummary(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    absoluteCounts: Map<number, number> = new Map()
  ) {
    const targets = await this.targetsRepository.findOutOfSchoolTargets(
      c,
      subDistrictId,
      SCHOOL_TARGET_GROUPS,
      microplanningId
    )

    const counts = new Map(SCHOOL_TARGET_GROUPS.map((id) => [id, 0]))
    for (const target of targets) {
      if (target.target_group_id) {
        const current = counts.get(target.target_group_id) ?? 0
        counts.set(target.target_group_id, current + 1)
      }
    }

    // Add absolute counts for out-of-school targets
    for (const [targetGroupId, absCount] of absoluteCounts) {
      if (SCHOOL_TARGET_GROUPS.includes(targetGroupId)) {
        const currentCount = counts.get(targetGroupId) ?? 0
        counts.set(targetGroupId, currentCount + absCount)
      }
    }

    let prefix = "Equal to "
    if (c.var.language === "id") {
      prefix = "Setara "
    }

    return {
      name: c.var.t("targets.children_not_in_school"),
      targets: this.formatTargetCategories(c, counts, prefix),
    }
  }

  async getTargetGroup(c: Context) {
    return await this.targetGroupRepository.findAll(c)
  }

  private async updateMicroplanTargetConsumptions(
    c: Context,
    nik: string,
    microplanningId: number
  ) {
    const targets = await this.targetsRepository.findByNik(
      c,
      nik,
      microplanningId
    )

    if (targets) {
      const gender = targets.gender
      const dateOfBirth = targets.date_of_birth
        ? doDecrypt(targets.date_of_birth)
        : null

      const microplanTarget =
        await this.targetsRepository.getMicroplanTargetConsumptions(
          c,
          targets?.id
        )

      await Promise.all(
        microplanTarget.map(async (item) => {
          const idealDateInDays = Math.abs(
            moment(dateOfBirth).diff(moment(item.ideal_date), "days")
          )

          const targetGroup = await this.targetsRepository.getTargetGroup(
            c,
            idealDateInDays,
            gender
          )

          const targetIdealData = {
            target_group_id: targetGroup?.id ?? 0,
          }

          await this.targetsRepository.updateTargetIdeals(
            c,
            item.id,
            targetIdealData
          )
        })
      )
    }
  }

  async getSummaryTargetsMicroplanByIdealDate(
    c: Context,
    query: GetSummaryRequestDTO,
    subDistrictId: number
  ) {
    const entityId = this.getEntityIdFromContext(c)
    const nextYearMicroplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1

    const currentYearMicroplanning =
      await this.targetsRepository.findMicroplanningByYear(
        c,
        entityId,
        currentYear
      )
    const currentYearMicroplanningId =
      currentYearMicroplanning?.id ?? nextYearMicroplanningId

    let ids = this.getTargetGroupIdsByType(query.type)

    // Filter by target_group_ids if provided (comma-separated)
    if (query.target_group_ids) {
      const filterIds = query.target_group_ids
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
      if (filterIds.length > 0) {
        ids = ids.filter((id) => filterIds.includes(id))
      }
    }

    const integerIds = ids.filter((id) => Number.isInteger(id))
    const allTargetGroups = await this.targetsRepository.getAllTargetGroups(c)
    const isNonBias = query.type
      ? query.type.toUpperCase() === "NON-BIAS" ||
        query.type.toUpperCase() === "NONBIAS"
      : null

    const [
      originalCounts,
      promotedCounts,
      equalAgeCounts,
      absoluteCounts,
      populationCounts,
    ] = await Promise.all([
      this.getOriginalTargetCounts(
        c,
        currentYearMicroplanningId,
        nextYearMicroplanningId,
        subDistrictId,
        integerIds
      ),
      this.getPromotedTargetCounts(
        c,
        currentYearMicroplanningId,
        nextYearMicroplanningId,
        subDistrictId,
        integerIds,
        allTargetGroups,
        nextYear
      ),
      this.getEqualAgeGroupCounts(
        c,
        currentYearMicroplanningId,
        nextYearMicroplanningId,
        subDistrictId
      ),
      this.getAbsoluteTargetCounts(
        c,
        currentYearMicroplanningId,
        nextYearMicroplanningId,
        subDistrictId,
        ids
      ),
      this.targetsRepository.getPopulationByEntityAndYear(
        c,
        entityId,
        nextYear,
        integerIds
      ),
    ])

    return {
      data: this.formatMicroplanSummaryWithDecimal(c, {
        ids: integerIds,
        original: originalCounts.nextYear,
        recalculated: promotedCounts.nextYear,
        equalAgeCounts: equalAgeCounts.nextYear,
        absoluteCounts: absoluteCounts.nextYear,
        allTargetGroups,
        isNonBias,
        filterDecimalIds: query.target_group_ids
          ? query.target_group_ids
              .split(",")
              .map((s) => Number(s.trim()))
              .filter((n) => !isNaN(n))
          : undefined,
      }),
      previous_data: this.formatPopulationCounts(c, {
        ids: integerIds,
        populationCounts,
        allTargetGroups,
        isNonBias,
      }),
      next_year: nextYear,
    }
  }

  private async getAbsoluteTargetCounts(
    c: Context,
    currentYearMicroplanningId: number,
    nextYearMicroplanningId: number,
    subDistrictId: number,
    ids: number[]
  ) {
    const [currentYear, nextYear] = await Promise.all([
      this.targetsRepository.absoluteTargetGroupCounts(
        c,
        currentYearMicroplanningId,
        subDistrictId,
        ids
      ),
      this.targetsRepository.absoluteTargetGroupCounts(
        c,
        nextYearMicroplanningId,
        subDistrictId,
        ids
      ),
    ])

    return { currentYear, nextYear }
  }

  private async getEqualAgeGroupCounts(
    c: Context,
    currentYearMicroplanningId: number,
    nextYearMicroplanningId: number,
    subDistrictId: number
  ) {
    const [currentYear, nextYear] = await Promise.all([
      this.targetsRepository.findEqualAgeGroupCounts(
        c,
        subDistrictId,
        currentYearMicroplanningId
      ),
      this.targetsRepository.findEqualAgeGroupCounts(
        c,
        subDistrictId,
        nextYearMicroplanningId
      ),
    ])
    return { currentYear, nextYear }
  }

  private resolveTargetGroupName(
    c: Context,
    id: number,
    tg: { title: string } | undefined,
    isNonBias: boolean | null | undefined
  ): string | null {
    if (isNonBias !== null && !isNonBias && BIAS_COMBINED_TARGET_LABELS[id]) {
      return c.var.t(`target.target_group_bias.${id}`)
    }
    const targetGroupId = id === 10 ? 11 : id
    return id in TARGET_GROUP_NAME_TRANSFORM
      ? c.var.t(`targets.target_group.${targetGroupId}`)
      : (tg?.title ?? null)
  }

  private formatMicroplanSummaryWithDecimal(
    c: Context,
    params: {
      ids: number[]
      original: Awaited<
        ReturnType<typeof this.targetsRepository.getTargetsCountByGroup>
      >
      recalculated: Map<number, number>
      equalAgeCounts: Awaited<
        ReturnType<typeof this.targetsRepository.findEqualAgeGroupCounts>
      >
      absoluteCounts: Awaited<
        ReturnType<typeof this.targetsRepository.absoluteTargetGroupCounts>
      >
      allTargetGroups: Awaited<
        ReturnType<typeof this.targetsRepository.getAllTargetGroups>
      >
      isNonBias?: boolean | null
      filterDecimalIds?: number[]
    }
  ) {
    const {
      ids,
      original,
      recalculated,
      equalAgeCounts,
      absoluteCounts,
      allTargetGroups,
      isNonBias,
      filterDecimalIds,
    } = params

    const baseResults = ids.map((id) => {
      const originalData = original.find((item) => item.id === id)
      const targetGroup = allTargetGroups.find((tg) => tg.id === id)
      const absoluteData = absoluteCounts.find((item) => item.id === id)

      const originalQty = Math.max(0, Number(originalData?.qty ?? 0))
      const baseQty =
        originalQty + (recalculated.get(id) ?? 0) + (absoluteData?.qty ?? 0)

      // For BIAS targets, combine school + age group qty and use combined label
      if (isNonBias !== null && !isNonBias && BIAS_COMBINED_TARGET_LABELS[id]) {
        const decimalCounts =
          this.calculateDecimalGroupCountsMap(equalAgeCounts)
        const decimalQty = decimalCounts.get(id) ?? 0
        const outOfSchoolAbsoluteQty =
          absoluteCounts.find((item) => item.id === id + 0.1)?.qty ?? 0

        return {
          id,
          name: this.resolveTargetGroupName(c, id, targetGroup, isNonBias),
          qty: baseQty + decimalQty + outOfSchoolAbsoluteQty,
          prefix: this.getPrefix(id),
        }
      }

      return {
        id,
        name: this.resolveTargetGroupName(c, id, targetGroup, isNonBias),
        qty: baseQty,
        prefix: this.getPrefix(id),
      }
    })

    let decimalResults: Array<{
      id: number
      name: string
      qty: number
      prefix: "village"
    }> = []
    if (isNonBias === null) {
      decimalResults = this.calculateDecimalGroupCounts(
        c,
        equalAgeCounts,
        absoluteCounts
      )
      // Filter decimal results to only include those whose base ID is in the requested set
      if (filterDecimalIds && filterDecimalIds.length > 0) {
        decimalResults = decimalResults.filter((dr) =>
          filterDecimalIds.includes(Math.floor(dr.id))
        )
      }
    }

    return [...baseResults, ...decimalResults].sort((a, b) => {
      const normalizeId = (id: number) => {
        const floorId = Math.floor(id)
        return floorId === 10 ? 11 : floorId
      }

      // Define consistent order regardless of environment
      const SORT_ORDER = [1, 2, 3, 4, 5, 7, 11, 9]
      const indexA = SORT_ORDER.indexOf(normalizeId(a.id))
      const indexB = SORT_ORDER.indexOf(normalizeId(b.id))

      // If not found in order, put at end
      const finalIndexA = indexA === -1 ? 999 : indexA
      const finalIndexB = indexB === -1 ? 999 : indexB

      if (finalIndexA !== finalIndexB) return finalIndexA - finalIndexB
      return a.id - b.id
    })
  }

  private formatPopulationCounts(
    c: Context,
    params: {
      ids: number[]
      populationCounts: Array<{
        target_group_id: number
        population_number: number
      }>
      allTargetGroups: Array<{ id: number; title: string }>
      isNonBias: boolean | null
    }
  ) {
    const { ids, populationCounts, allTargetGroups, isNonBias } = params
    return ids.map((id) => {
      const found = populationCounts.find((p) => p.target_group_id === id)
      const tg = allTargetGroups.find((t) => t.id === id)
      return {
        id,
        name: this.resolveTargetGroupName(c, id, tg, isNonBias),
        qty: found?.population_number ?? 0,
        prefix: this.getPrefix(id),
      }
    })
  }

  private calculateDecimalGroupCountsMap(
    equalAgeCounts: Awaited<
      ReturnType<typeof this.targetsRepository.findEqualAgeGroupCounts>
    >
  ): Map<number, number> {
    const setaraUsiaMap = new Map<string, number>()
    for (const item of equalAgeCounts) {
      const key = `${item.target_group_id}_${item.gender ?? "all"}`
      setaraUsiaMap.set(key, Number(item.qty))
    }

    const count4 =
      setaraUsiaMap.get("4_all") ??
      setaraUsiaMap.get("4_null") ??
      (setaraUsiaMap.get("4_1") ?? 0) + (setaraUsiaMap.get("4_2") ?? 0)
    const count5 =
      setaraUsiaMap.get("5_all") ??
      setaraUsiaMap.get("5_null") ??
      (setaraUsiaMap.get("5_1") ?? 0) + (setaraUsiaMap.get("5_2") ?? 0)
    const count7Female = setaraUsiaMap.get("7_2") ?? 0
    const count10Male = setaraUsiaMap.get("10_1") ?? 0

    const result = new Map<number, number>()
    result.set(4, count4)
    result.set(5, count5)
    result.set(7, count7Female)
    result.set(10, count10Male)

    return result
  }

  private calculateDecimalGroupCounts(
    c: Context,
    equalAgeCounts: Awaited<
      ReturnType<typeof this.targetsRepository.findEqualAgeGroupCounts>
    >,
    absoluteCounts: Awaited<
      ReturnType<typeof this.targetsRepository.absoluteTargetGroupCounts>
    >
  ) {
    const setaraUsiaMap = new Map<string, number>()
    for (const item of equalAgeCounts) {
      const key = `${item.target_group_id}_${item.gender ?? "all"}`
      setaraUsiaMap.set(key, Number(item.qty))
    }

    const targetGroupId11 = 10
    const targetGroupId11Decimal = 13.1
    const count4 =
      setaraUsiaMap.get("4_all") ??
      setaraUsiaMap.get("4_null") ??
      (setaraUsiaMap.get("4_1") ?? 0) + (setaraUsiaMap.get("4_2") ?? 0)
    const count5 =
      setaraUsiaMap.get("5_all") ??
      setaraUsiaMap.get("5_null") ??
      (setaraUsiaMap.get("5_1") ?? 0) + (setaraUsiaMap.get("5_2") ?? 0)
    const count7Female = setaraUsiaMap.get("7_2") ?? 0
    const count11Male = setaraUsiaMap.get(`${targetGroupId11}_1`) ?? 0

    const abs4_1 = absoluteCounts.find((item) => item.id === 4.1)?.qty ?? 0
    const abs5_1 = absoluteCounts.find((item) => item.id === 5.1)?.qty ?? 0
    const abs7_1 = absoluteCounts.find((item) => item.id === 7.1)?.qty ?? 0
    const abs10_1 =
      absoluteCounts.find((item) => item.id === targetGroupId11Decimal)?.qty ??
      0

    return [
      {
        id: 4.1,
        name: c.var.t(`targets.target_group.4.1`),
        qty: count4 + abs4_1,
        prefix: "village" as const,
      },
      {
        id: 5.1,
        name: c.var.t(`targets.target_group.5.1`),
        qty: count5 + abs5_1,
        prefix: "village" as const,
      },
      {
        id: 7.1,
        name: c.var.t(`targets.target_group.7.1`),
        qty: count7Female + abs7_1,
        prefix: "village" as const,
      },
      {
        id: targetGroupId11Decimal,
        name: c.var.t(`targets.target_group.11.1`),
        qty: count11Male + abs10_1,
        prefix: "village" as const,
      },
    ]
  }

  private async getOriginalTargetCounts(
    c: Context,
    currentYearMicroplanningId: number,
    nextYearMicroplanningId: number,
    subDistrictId: number,
    ids: number[]
  ) {
    const [currentYear, nextYear] = await Promise.all([
      this.targetsRepository.getTargetsCountByGroup(
        c,
        currentYearMicroplanningId,
        subDistrictId,
        ids
      ),
      this.targetsRepository.getTargetsCountByGroup(
        c,
        nextYearMicroplanningId,
        subDistrictId,
        ids
      ),
    ])
    return { currentYear, nextYear }
  }

  private async getPromotedTargetCounts(
    c: Context,
    currentYearMicroplanningId: number,
    nextYearMicroplanningId: number,
    subDistrictId: number,
    ids: number[],
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    nextYearNum: number
  ) {
    const now = new Date()
    const currentYearDate = new Date(
      nextYearNum - 1,
      now.getMonth(),
      now.getDate()
    )

    const nextYear = await this.calculatePromotedCountsForMicroplanning(
      c,
      currentYearMicroplanningId,
      subDistrictId,
      ids,
      allTargetGroups,
      currentYearDate
    )

    return { nextYear }
  }

  private async getAgedOutTargetCounts(
    c: Context,
    subDistrictId: number,
    ids: number[],
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >
  ) {
    const currentYearNum = new Date().getFullYear()

    const now = new Date()
    const nextYear = await this.calculateAgedOutCountsForMicroplanning(
      c,
      c.var.microplanningId!,
      subDistrictId,
      ids,
      allTargetGroups,
      new Date(currentYearNum, now.getMonth(), now.getDate())
    )
    return { nextYear }
  }

  private async calculateAgedOutCountsForMicroplanning(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    ids: number[],
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    today: Date
  ): Promise<Map<number, number>> {
    const agedOutCounts = new Map<number, number>()
    ids.forEach((id) => agedOutCounts.set(id, 0))

    for (const groupId of ids) {
      const groupInfo = allTargetGroups.find((tg) => tg.id === groupId)
      if (!groupInfo) continue

      const targets = await this.fetchTargetsFromPrevGroup(
        c,
        subDistrictId,
        groupId,
        microplanningId
      )
      let agedOut = 0
      for (const target of targets) {
        if (!target.date_of_birth || !target.gender) continue
        const dob = doDecrypt(target.date_of_birth)
        const ageInDays = moment(today).diff(moment(dob), "days")
        if (ageInDays < 0 || ageInDays <= groupInfo.age_max) continue
        agedOut++
      }
      agedOutCounts.set(groupId, agedOut)
    }

    return agedOutCounts
  }

  private async calculatePromotedCountsForMicroplanning(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    ids: number[],
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    today: Date = new Date()
  ): Promise<Map<number, number>> {
    const counts = new Map<number, number>()
    ids.forEach((id) => counts.set(id, 0))

    for (const targetGroupId of ids) {
      const count = await this.countPromotedForTargetGroup(
        c,
        microplanningId,
        subDistrictId,
        targetGroupId,
        allTargetGroups,
        today
      )
      counts.set(targetGroupId, count)
    }

    return counts
  }

  private async countPromotedForTargetGroup(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    targetGroupId: number,
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    today: Date
  ): Promise<number> {
    const prevGroupIds = this.getAllPreviousTargetGroupIds(targetGroupId)
    if (prevGroupIds.length === 0) return 0

    let count = 0
    for (const prevGroupId of prevGroupIds) {
      const targets = await this.fetchTargetsFromPrevGroup(
        c,
        subDistrictId,
        prevGroupId,
        microplanningId
      )
      count += this.countPromotedTargets(
        targets,
        today,
        allTargetGroups,
        prevGroupId,
        targetGroupId
      )
    }
    return count
  }

  private async fetchTargetsFromPrevGroup(
    c: Context,
    subDistrictId: number,
    prevGroupId: number,
    microplanningId: number
  ) {
    const [villageTargets, schoolTargets] = await Promise.all([
      this.targetsRepository.getTargetsWithDateOfBirthByLocation(
        c,
        subDistrictId,
        prevGroupId,
        microplanningId
      ),
      this.targetsRepository.getTargetsWithDateOfBirthByEntity(
        c,
        subDistrictId,
        prevGroupId,
        microplanningId
      ),
    ])
    return [...villageTargets, ...schoolTargets]
  }

  private countPromotedTargets(
    targets: Array<{ date_of_birth: string | null; gender: number | null }>,
    today: Date,
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    prevGroupId: number,
    targetGroupId: number
  ): number {
    return targets.filter((target) =>
      this.isTargetPromoted(
        target,
        today,
        allTargetGroups,
        prevGroupId,
        targetGroupId
      )
    ).length
  }

  private isTargetPromoted(
    target: { date_of_birth: string | null; gender: number | null },
    today: Date,
    allTargetGroups: Awaited<
      ReturnType<typeof this.targetsRepository.getAllTargetGroups>
    >,
    prevGroupId: number,
    targetGroupId: number
  ): boolean {
    if (!target.date_of_birth || !target.gender) return false

    const dob = doDecrypt(target.date_of_birth)
    const ageInDays = moment(today).diff(moment(dob), "days")
    if (ageInDays < 0) return false

    const matched = this.findMatchingTargetGroup(
      ageInDays,
      target.gender,
      allTargetGroups
    )
    if (!matched) return false

    return this.isTargetInGroup(
      prevGroupId,
      matched.id,
      targetGroupId,
      target.gender
    )
  }

  private findMatchingTargetGroup(
    ageInDays: number,
    gender: number,
    targetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    filterIds?: number[]
  ) {
    return targetGroups.find(
      (tg) =>
        (filterIds ? filterIds.includes(tg.id) : true) &&
        ageInDays >= tg.age_min &&
        ageInDays <= tg.age_max &&
        this.isGenderMatch(tg.id, gender)
    )
  }

  private isGenderMatch(targetGroupId: number, gender: number): boolean {
    if (FEMALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_FEMALE
    if (MALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_MALE
    return true
  }

  async import(c: Context, rows: ImportTargetRequest[]) {
    const userId = c.var.userEntity?.id
    const processedRows: number[] = []
    const duplicateRows: number[] = []
    const seenNIKs = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 10 // Excel row number (assuming header at row 9)
      const nikStr = String(rows[i].NIK)

      // Skip duplicate NIKs within the same import file
      if (seenNIKs.has(nikStr)) {
        duplicateRows.push(rowNumber)
        continue
      }

      seenNIKs.add(nikStr)
      const result = await this.processImportRow(c, rows[i], rowNumber, userId)

      if (result.isDuplicate) {
        duplicateRows.push(rowNumber)
      } else if (result.success) {
        processedRows.push(rowNumber)
      }
    }

    return {
      total_rows: rows.length,
      processed: processedRows.length,
      duplicates: duplicateRows.length,
      duplicate_rows: duplicateRows,
    }
  }

  private async processImportRow(
    c: Context,
    row: ImportTargetRequest,
    rowNumber: number,
    userId?: number
  ): Promise<{ success: boolean; isDuplicate: boolean }> {
    const nikStr = String(row.NIK)

    try {
      const nikIdentity = await this.getIdentityAndAddressByNIK(c, nikStr)

      if (!nikIdentity.district_id) {
        console.warn(
          `Row ${rowNumber}: NIK ${nikStr} — 6-digit location code not found, skipping`
        )
        return { success: false, isDuplicate: false }
      }

      const targetData = this.buildTargetDataFromImportRow(row, nikIdentity)

      const result = await this.create(c, targetData, userId, true)

      if (!result) {
        return { success: false, isDuplicate: true }
      }

      return { success: true, isDuplicate: false }
    } catch (error) {
      console.error(`Error processing row ${rowNumber}:`, error)
      return { success: false, isDuplicate: false }
    }
  }

  private buildTargetDataFromImportRow(
    row: ImportTargetRequest,
    nikIdentity: GetIdentityAndAddressResponseDTO
  ): AddTargetDataRequest {
    const residenceData = this.resolveResidenceAddress(row)
    const schoolData = this.resolveSchoolData(row)

    return {
      nik: String(row.NIK),
      name: String(row.Name),
      gender: nikIdentity.gender,
      date_of_birth: nikIdentity.date_of_birth,
      registered_village_id: Number(row.RegisteredVillageID),
      registered_postal_code: row.RegisteredPostalCode
        ? Number(row.RegisteredPostalCode)
        : 0,
      registered_address: row.RegisteredAddress
        ? String(row.RegisteredAddress)
        : null,
      ...residenceData,
      ...schoolData,
      marital_status: row.MaritalStatusID ? Number(row.MaritalStatusID) : 0,
      education_id: row.EducationID ? Number(row.EducationID) : undefined,
      occupation_id: row.OccupationID ? Number(row.OccupationID) : undefined,
      religion_id: row.ReligionID ? Number(row.ReligionID) : undefined,
      ethnic_id: row.EthnicID ? Number(row.EthnicID) : undefined,
      phone_number: row.PhoneNumber ? String(row.PhoneNumber) : undefined,
    }
  }

  private resolveResidenceAddress(row: ImportTargetRequest) {
    const isSameAddress = row.SameAddress === 1
    const villageId = isSameAddress
      ? row.RegisteredVillageID
      : row.ResidenceVillageID
    const postalCode = isSameAddress
      ? row.RegisteredPostalCode
      : row.ResidencePostalCode
    const address = isSameAddress ? row.RegisteredAddress : row.ResidenceAddress

    return {
      residence_village_id: Number(villageId),
      residence_postal_code: postalCode ? Number(postalCode) : 0,
      residence_address: address ? String(address) : null,
    }
  }

  private resolveSchoolData(row: ImportTargetRequest) {
    const isInSchool = row.InSchool === 1

    return {
      entity_id: isInSchool && row.SchoolID ? Number(row.SchoolID) : null,
      grade: isInSchool && row.Grade ? Number(row.Grade) : null,
    }
  }

  async template(c: Context) {
    const language = c.var.language
    const template = new MicroplanningTemplate()
    const title =
      language === "en" ? "Microplanning Template" : "Template Microplanning"
    const filename = `microplanning_${language.toLocaleLowerCase()}.xlsx`

    template.setTitle(title)
    template.setTimezone(c.req.header("Timezone"))

    await template.loadFile(filename)

    const maritalStatusList = await this.dengueCaseRepo.listMaritalStatus(c)
    const sheetName3 = "LIST MARITAL STATUS"
    const rows3 = maritalStatusList.map((item) => [item.id, item.name])
    await template.addRows(sheetName3, rows3)

    const educationList = await this.dengueCaseRepo.listEducation(c)
    const sheetName4 = "LIST EDUCATION"
    const rows4 = educationList.map((item) => [item.id, item.name])
    await template.addRows(sheetName4, rows4)

    const occupationList = await this.dengueCaseRepo.listOccupation(c)
    const sheetName5 = "LIST OCCUPATION"
    const rows5 = occupationList.map((item) => [item.id, item.name])
    await template.addRows(sheetName5, rows5)

    const religionList = await this.dengueCaseRepo.listReligion(c)
    const sheetName6 = "LIST RELIGION"
    const rows6 = religionList.map((item) => [item.id, item.name])
    await template.addRows(sheetName6, rows6)

    const ethnicityList = await this.dengueCaseRepo.listEthnicity(c)
    const sheetName7 = "LIST ETHNIC"
    const rows7 = ethnicityList.map((item) => [item.id, item.name])
    await template.addRows(sheetName7, rows7)

    const { provinceId, regencyId, districtId } =
      this.getLocationIdFromContext(c)
    const entityProvinceId = provinceId ? Number(provinceId) : 0
    const entityRegencyId = regencyId ? Number(regencyId) : 0
    const entityDistrictId = districtId ? Number(districtId) : 0

    const provinceList = await this.locationRepository.getLocations(
      c,
      LOCATION_LEVEL.PROVINCE
    )

    const regencyList = await this.locationRepository.getLocations(
      c,
      LOCATION_LEVEL.REGENCY,
      entityProvinceId
    )

    const subdistrictList = await this.locationRepository.getLocations(
      c,
      LOCATION_LEVEL.SUBDISTRICT,
      entityRegencyId
    )

    const villageList = await this.locationRepository.getLocations(
      c,
      LOCATION_LEVEL.VILLAGE,
      entityDistrictId
    )

    const provinceMap = new Map(provinceList.map((p) => [p.id, p.name]))
    const regencyMap = new Map(
      regencyList.map((r) => [r.id, { name: r.name, parent_id: r.parent_id }])
    )
    const subdistrictMap = new Map(
      subdistrictList.map((s) => [
        s.id,
        { name: s.name, parent_id: s.parent_id },
      ])
    )
    const villageMap = new Map(villageList.map((v) => [v.id, v.name]))

    const sheetName8 = "LIST PROVINCE"
    const rows8 = provinceList.map((item) => [item.id, item.name])
    await template.addRows(sheetName8, rows8)

    const sheetName9 = "LIST CITY"
    const rows9 = regencyList.map((item) => {
      const provinceName = provinceMap.get(item.parent_id) ?? ""
      return [item.id, provinceName, item.name]
    })
    await template.addRows(sheetName9, rows9)

    const sheetName10 = "LIST DISTRICT"
    const rows10 = subdistrictList.map((item) => {
      const regency = regencyMap.get(item.parent_id)
      const provinceName = regency
        ? (provinceMap.get(regency.parent_id) ?? "")
        : ""
      return [item.id, provinceName, regency?.name ?? "", item.name]
    })
    await template.addRows(sheetName10, rows10)

    const sheetName11 = "LIST VILLAGE"
    const rows11 = villageList.map((item) => {
      const subdistrict = subdistrictMap.get(item.parent_id)
      const regency = subdistrict
        ? regencyMap.get(subdistrict.parent_id)
        : undefined
      const provinceName = regency
        ? (provinceMap.get(regency.parent_id) ?? "")
        : ""
      return [
        item.id,
        provinceName,
        regency?.name ?? "",
        subdistrict?.name ?? "",
        item.name,
      ]
    })
    await template.addRows(sheetName11, rows11)

    const schoolList = entityDistrictId
      ? await this.entitySchoolRepositoty.getSchoolsBySubDistrict(
          c,
          entityDistrictId
        )
      : await this.entitySchoolRepositoty.getList(
          c,
          SCHOOL_ENTITY_TAG_ID,
          entityProvinceId || undefined
        )
    const sheetName12 = "LIST SCHOOL"
    const row12 = schoolList.map((item) => {
      const villageName = item.village_id
        ? (villageMap.get(Number(item.village_id)) ?? "")
        : ""
      const subdistrict = item.sub_district_id
        ? subdistrictMap.get(Number(item.sub_district_id))
        : undefined
      const regency = item.regency_id
        ? regencyMap.get(Number(item.regency_id))
        : undefined
      const provinceName = item.province_id
        ? (provinceMap.get(Number(item.province_id)) ?? "")
        : ""
      return [
        item.id,
        provinceName,
        regency?.name ?? "",
        subdistrict?.name ?? "",
        villageName,
        item.name,
      ]
    })
    await template.addRows(sheetName12, row12)

    return await template.generate()
  }
}
