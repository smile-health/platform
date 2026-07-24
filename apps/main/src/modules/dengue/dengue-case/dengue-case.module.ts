import { Context } from "hono"
import { DengueCaseRepository } from "./dengue-case.repository.js"
import { getIdentityAndAddressByNIK } from "@/common/utils/verify-nik.js"
import { LocationRepository } from "@/modules/location/location.repository.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { DengueCaseTemplate } from "./dengue-case.excel.js"
import moment from "moment-timezone"
import { doDecrypt } from "@/modules/transaction/utils/transaction.encryption.js"
import {
  CreateDengueCaseRequest,
  UpdateDengueCaseRequest,
  DengueCaseSchema,
  GetDengueCaseRequest,
  ImportDengueCaseRequest
} from "./dengue-case.schema.js"
import {
  DENGUE_PROGRAM_ID,
  EQUIPMENT,
  LOCATION_LEVEL,
  MARITAL_STATUS,
  NS1_ID,
  PE_RESULT,
  REAGENT
} from "@/common/constants/dengue.js"

export class DengueCaseModule {
  constructor(
    private readonly dengueCaseRepo: DengueCaseRepository,
    private readonly locationRepo: LocationRepository,
  ) { }

  async checkExistByNikAndDate(c: Context, identityNumber: string, date: string) {
    const existing = await this.dengueCaseRepo.findByNikAndInputDate(
      c,
      identityNumber,
      date
    )

    return { exists: !!existing }
  }

  async getDetailIdentity(c: Context, identityNumber: string) {
    const detailIdentity = await getIdentityAndAddressByNIK(c, identityNumber, this.locationRepo)

    if (!detailIdentity) {
      return null
    }

    const patient = await this.dengueCaseRepo.findByIdentityNumber(c, identityNumber)

    let addressDetail = null
    let residentialDetail = null

    if (patient) {
      if (patient.village_id) {
        addressDetail = await this.dengueCaseRepo.findLocationByCode(c, patient)
      }

      if (
        patient.residential_province_id != null ||
        patient.residential_regency_id != null ||
        patient.residential_subdistrict_id != null ||
        patient.residential_village_id != null
      ) {
        residentialDetail = await this.dengueCaseRepo.findResidentialLocationByCode(c, patient)
      }
    }

    const identityName = patient?.name ? doDecrypt(patient.name) : null
    const address = patient?.address ? doDecrypt(patient.address) : null
    const residenceAddress = patient?.residential_address ? doDecrypt(patient.residential_address) : null
    const phoneNumber = patient?.phone_number ? doDecrypt(patient.phone_number) : null

    let sameAddress = false
    if (address != null && residenceAddress != null) {
      sameAddress = address === residenceAddress
    }

    return {
      data: {
        id: patient?.id || null,
        nik: identityNumber,
        same_address: sameAddress,
        personal_identity: {
          date_of_birth: detailIdentity?.date_of_birth,
          gender: detailIdentity?.gender,
          name: identityName,
          phone: phoneNumber ?? null,
          marital_id: patient?.marital_status || null,
          marital_name: patient?.marital_status ? MARITAL_STATUS[patient?.marital_status] : null,
          last_education_id: patient?.education_id || null,
          last_education_name: patient?.education_name || null,
          occupation_id: patient?.occupation_id || null,
          occupation_name: patient?.occupation_name || null,
          religion_id: patient?.religion_id || null,
          religion_name: patient?.religion_name || null,
          ethnic_id: patient?.ethnic_id || null,
          ethnic_name: patient?.ethnic_name || null,
        },
        registered_address: {
          address: address,
          province_id: detailIdentity?.province_id,
          province: detailIdentity?.province,
          city_id: detailIdentity?.city_id,
          city: detailIdentity?.city,
          district_id: detailIdentity?.district_id,
          district: detailIdentity?.district,
          village_id: patient?.village_id || null,
          village: addressDetail?.village_name || null,
          pos_code: patient?.pos_code || null
        },
        residence_address: {
          address: residenceAddress,
          province_id: patient?.residential_province_id || null,
          province: residentialDetail?.province_name || null,
          city_id: patient?.residential_regency_id || null,
          city: residentialDetail?.regency_name || null,
          district_id: patient?.residential_subdistrict_id || null,
          district: residentialDetail?.subdistrict_name || null,
          village_id: patient?.residential_village_id || null,
          village: residentialDetail?.village_name || null,
          pos_code: patient?.residential_pos_code || null
        }
      }
    }
  }

  async listEquipment(c: Context, params) {
    const { data, total } = await this.dengueCaseRepo.listEquipment(c, params)
    return new PaginatedResponse(params, data, total)
  }

  async listClinicalDiagnosis(c: Context) {
    const data = await this.dengueCaseRepo.listClinicalDiagnosis(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`clinical_diagnosis.label.${e.name}`),
    }))
  }

  async listLastStatus(c: Context) {
    const data = await this.dengueCaseRepo.listLastStatus(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`last_status.label.${e.name}`),
    }))
  }

  async listVectorControl(c: Context) {
    const data = await this.dengueCaseRepo.listVectorControl(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`vector_control.label.${e.name}`),
    }))
  }

  async listSymptoms(c: Context) {
    const data = await this.dengueCaseRepo.listSymptoms(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`symptoms.label.${e.name}`),
    }))
  }

  async listSpecimenType(c: Context) {
    const data = await this.dengueCaseRepo.listSpecimenType(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`specimen_type.label.${e.name}`),
    }))
  }

  async listExaminationMethod(c: Context) {
    const data = await this.dengueCaseRepo.listExaminationMethod(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`examination_method.label.${e.name}`),
    }))
  }

  async listExaminationResult(c: Context) {
    const data = await this.dengueCaseRepo.listExaminationResult(c)
    return data.map((e) => ({
      id: e.id,
      name: c.var.t(`examination_result.label.${e.name}`),
    }))
  }

  async listLaboratory(c: Context, params) {
    if (params.is_sentinel_lab === 1) {
      const { data, total } = await this.dengueCaseRepo.listSentinelLaboratory(c, params)
      return new PaginatedResponse(params, data, total)
    } else {
      const { data, total } = await this.dengueCaseRepo.listLaboratory(c, params)
      return new PaginatedResponse(params, data, total)
    }
  }

  async listReagent(c: Context, params) {
    const { data, total } = await this.dengueCaseRepo.listReagent(c, params)
    return new PaginatedResponse(params, data, total)
  }

  async template(c: Context) {
    const language = c.var.language
    const template = new DengueCaseTemplate()
    const title = language === "en" ? "Template Case Report Dengue" : "Template Laporan Kasus Dengue"
    const filename = `case_report_${language.toLowerCase()}.xlsx`

    template.setTitle(title)
    template.setTimezone(c.req.header("Timezone"))

    await template.loadFile(filename)

    // sheet 3 - Marital Status
    const maritalStatusList = await this.dengueCaseRepo.listMaritalStatus(c)
    const sheetName3 = "LIST STATUS"
    const rows3 = maritalStatusList.map(item => [item.id, item.name])
    await template.addRows(sheetName3, rows3)

    // sheet 4 - Education
    const educationList = await this.dengueCaseRepo.listEducation(c)
    const sheetName4 = "LIST LAST EDUCATION"
    const rows4 = educationList.map(item => [item.id, item.name])
    await template.addRows(sheetName4, rows4)

    // sheet 5 - Occupation
    const occupationList = await this.dengueCaseRepo.listOccupation(c)
    const sheetName5 = "LIST OCCUPATION"
    const rows5 = occupationList.map(item => [item.id, item.name])
    await template.addRows(sheetName5, rows5)

    // sheet 6 - Religion
    const religionList = await this.dengueCaseRepo.listReligion(c)
    const sheetName6 = "LIST RELIGION"
    const rows6 = religionList.map(item => [item.id, item.name])
    await template.addRows(sheetName6, rows6)

    // sheet 7 - Ethnicity
    const ethnicityList = await this.dengueCaseRepo.listEthnicity(c)
    const sheetName7 = "LIST ETHNIC"
    const rows7 = ethnicityList.map(item => [item.id, item.name])
    await template.addRows(sheetName7, rows7)

    // sheet 8 - Province
    const provinceList = await this.dengueCaseRepo.getLocation(c, LOCATION_LEVEL.PROVINCE)
    const sheetName8 = "LIST PROVINCE"
    const rows8 = provinceList.map(item => [item.id, item.name])
    await template.addRows(sheetName8, rows8)

    // sheet 9 - Regency/City
    const regencyList = await this.dengueCaseRepo.getLocation(c, LOCATION_LEVEL.REGENCY)
    const sheetName9 = "LIST CITY"
    const rows9 = regencyList.map(item => [item.id, item.name])
    await template.addRows(sheetName9, rows9)

    // sheet 10 - Subdistrict
    const subdistrictList = await this.dengueCaseRepo.getLocation(c, LOCATION_LEVEL.SUBDISTRICT)
    const sheetName10 = "LIST DISTRICT"
    const rows10 = subdistrictList.map(item => [item.id, item.name])
    await template.addRows(sheetName10, rows10)

    // sheet 11 - Village
    const villageList = await this.dengueCaseRepo.getLocation(c, LOCATION_LEVEL.VILLAGE)
    const sheetName11 = "LIST VILLAGE"
    const rows11 = villageList.map(item => [item.id, item.name])
    await template.addRows(sheetName11, rows11)

    // sheet 12 - Clinical Diagnosis
    const clinicalDiagnosisList = await this.dengueCaseRepo.listClinicalDiagnosis(c)
    const sheetName12 = "LIST CLINICAL DIAGNOSIS"
    const rows12 = clinicalDiagnosisList.map(item => [item.id, item.name])
    await template.addRows(sheetName12, rows12)

    // sheet 13 - Symptoms
    const symptomsList = await this.dengueCaseRepo.listSymptoms(c)
    const sheetName13 = "LIST SYMPTOMS"
    const rows13 = symptomsList.map(item => [item.id, item.name])
    await template.addRows(sheetName13, rows13)

    // sheet 14 - Last Status
    const lastStatusList = await this.dengueCaseRepo.listLastStatus(c)
    const sheetName14 = "LIST LAST STATUS"
    const rows14 = lastStatusList.map(item => [item.id, item.name])
    await template.addRows(sheetName14, rows14)

    // sheet 15 - Vector Control
    const vectorControlList = await this.dengueCaseRepo.listVectorControl(c)
    const sheetName15 = "LIST VECTOR CONTROL"
    const rows15 = vectorControlList.map(item => [item.id, item.name])
    await template.addRows(sheetName15, rows15)

    // sheet 16 - Laboratory
    const laboratoryList = await this.dengueCaseRepo.listLaboratoryAll(c)
    const sheetName16 = "LIST LABORATORY"
    const rows16 = laboratoryList.map(item => [item.id, item.name])
    await template.addRows(sheetName16, rows16)

    // sheet 17 - Examination Method
    const examinationMethodList = await this.dengueCaseRepo.listExaminationMethod(c)
    const sheetName17 = "LIST EXAMINATION METHOD"
    const rows17 = examinationMethodList.map(item => [item.id, item.name])
    await template.addRows(sheetName17, rows17)

    // sheet 18 - Equipment
    const equipmentList = await this.dengueCaseRepo.listEquipmentAll(c)
    const sheetName18 = "LIST EQUIPMENT"
    const rows18 = equipmentList.map(item => [item.id, item.name])
    await template.addRows(sheetName18, rows18)

    // sheet 19 - Reagent
    const reagentList = await this.dengueCaseRepo.listReagentAll(c)
    const sheetName19 = "LIST REAGENT"
    const rows19 = reagentList.map(item => [item.id, item.name])
    await template.addRows(sheetName19, rows19)

    // sheet 20 - Examination Result
    const examinationResultList = await this.dengueCaseRepo.listExaminationResult(c)
    const sheetName20 = "LIST EXAMINATION RESULT"
    const rows20 = examinationResultList.map(item => [item.id, item.name])
    await template.addRows(sheetName20, rows20)

    // sheet 21 - Specimen Type
    const specimenTypeList = await this.dengueCaseRepo.listSpecimenType(c)
    const sheetName21 = "LIST SPECIMEN TYPE"
    const rows21 = specimenTypeList.map(item => [item.id, item.name])
    await template.addRows(sheetName21, rows21)

    return await template.generate()
  }

  async exportCaseReport(c: Context, params: GetDengueCaseRequest) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = moment().tz(timezone)
    const title = `CaseReport_${currentTime.format("YYYYMMDD_HHmm")}`

    const { data } = await this.dengueCaseRepo.findAll(c, params)

    const rows = await Promise.all(
      data.map(item => this.buildExportRow(c, item))
    )

    const columns = this.getExportColumns();

    const sheetName = "Case Report"
    const template = new DengueCaseTemplate()
    await template.initSheet(sheetName)

    template.setTitle(title)
    template.setTimezone(timezone)
    template.setColumns(columns)
    await template.addRows(sheetName, rows)

    return await template.generate()
  }

  async import(c: Context, rows: ImportDengueCaseRequest[]) {
    // Validation
    this.validateImportData(rows);

    const processedRows: number[] = [];
    const duplicateRows: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 10; // Excel row number
      const result = await this.processImportRow(c, rows[i], rowNumber);

      if (result.isDuplicate) {
        duplicateRows.push(rowNumber);
      } else if (result.success) {
        processedRows.push(rowNumber);
      }
    }

    return {
      total_rows: rows.length,
      processed: processedRows.length,
      duplicates: duplicateRows.length,
      duplicate_rows: duplicateRows
    }
  }

  async logImport(
    c: Context,
    result: {
      total_rows: number
      processed: number
      duplicates: number
      duplicate_rows: number[]
    }
  ) {
    const userId = c.var.user.id
    const data = {
      program_id: DENGUE_PROGRAM_ID,
      file: c.var.fileRequest?.filename ?? "template.xlsx",
      status: result.duplicates === 0 ? 1 : 2,
      notes: JSON.stringify(result),
      created_by: userId,
      updated_by: userId,
    }

    await this.dengueCaseRepo.createImportLog(c, data)
  }

  async list(c: Context, params: GetDengueCaseRequest) {
    const { data, total } = await this.dengueCaseRepo.list(c, params)

    const dataFormated = await Promise.all(
      data.map(async (item) => {
        const identityNumber = item.identity_number ? doDecrypt(item.identity_number) : null
        const identityName = item.name ? doDecrypt(item.name) : null
        const birthDate = item.birth_date ? doDecrypt(item.birth_date) : null
        const age = birthDate ? moment(item.input_date).diff(moment(birthDate), "years") : null

        return {
          id: item.id,
          identity_number: identityNumber,
          name: identityName,
          age: age,
          clinical_diagnosis: c.var.t(`clinical_diagnosis.label.${item.clinical_diagnosis_name}`),
          created_at: moment(item.created_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm"),
          updated_at: moment(item.updated_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm"),
          updated_by: item.updated_by ? item.firstname + " " + item.lastname : 'Admin',
        }
      })
    )

    return new PaginatedResponse(params, dataFormated, total)
  }

  async getDetailCaseReport(c: Context, id: number) {
    const item = await this.dengueCaseRepo.findDetailById(c, id)

    if (!item) {
      return null
    }

    const isSpecimen = await this.checkSpecimenStatus(c, item)
    const decryptedData = this.decryptCaseReportFields(item)
    const [location, residenceLocation] = await Promise.all([
      this.locationRepo.getDetails(c, Number(item.village_id)),
      this.locationRepo.getDetails(c, Number(item.residential_village_id))
    ])
    const relatedNames = await this.getCaseReportRelatedNames(c, item)

    return {
      data: {
        patient_data: this.buildPatientDataResponse(c, item, decryptedData, location, residenceLocation),
        case_report: this.buildCaseReportResponse(c, item, relatedNames),
        laboratory_examination: this.buildLabExaminationResponse(c, item, relatedNames),
        isSpecimen
      }
    }
  }

  private async checkSpecimenStatus(c: Context, item): Promise<number> {
    if (item.laboratory_examination == 1 && item.specimen_id !== null) {
      const specimen = await this.dengueCaseRepo.findSentinelBySpecimen(c, item.specimen_id)
      return specimen ? 1 : 0
    }
    return 0
  }

  private decryptCaseReportFields(item) {
    return {
      identityNumber: item.identity_number ? doDecrypt(item.identity_number) : null,
      identityName: item.name ? doDecrypt(item.name) : null,
      address: item.address ? doDecrypt(item.address) : null,
      residenceAddress: item.residential_address ? doDecrypt(item.residential_address) : null,
      birthDate: item.birth_date ? doDecrypt(item.birth_date) : null,
      phoneNumber: item.phone_number ? doDecrypt(item.phone_number) : null,
    }
  }

  private async getCaseReportRelatedNames(c: Context, item) {
    const [equipmentNames, reagentNames, vectorControlNames, symptomsNames] = await Promise.all([
      this.getEquipmentNames(c, String(item.equipment_id), EQUIPMENT),
      this.getEquipmentNames(c, String(item.reagent_id), REAGENT),
      this.getVectorControlNames(c, String(item.vector_control_id)),
      this.getSymptomsNames(c, String(item.symptoms_id))
    ])
    return { equipmentNames, reagentNames, vectorControlNames, symptomsNames }
  }

  private buildPatientDataResponse(c: Context, item, decryptedData, location, residenceLocation) {
    const { identityNumber, identityName, address, residenceAddress, birthDate, phoneNumber } = decryptedData
    const age = birthDate ? moment(item.input_date).diff(moment(birthDate), "years") : null
    const sameAddress = item.address === item.residential_address

    return {
      input_date: moment(item.input_date).format("YYYY-MM-DD"),
      identity_number: identityNumber,
      name: identityName,
      gender: c.var.t(`gender.label.${item.gender}`),
      date_of_birth: birthDate,
      age,
      phone: phoneNumber,
      marital_id: item.marital_status,
      marital_name: item.marital_status ? c.var.t(`marital_status.label.${MARITAL_STATUS[item.marital_status]}`) : null,
      last_education_id: item.education_id,
      last_education_name: item.education_id ? c.var.t(`education.label.${item.education_name}`) : null,
      occupation_id: item.occupation_id,
      occupation_name: item.occupation_id ? c.var.t(`occupation.label.${item.occupation_name}`) : null,
      religion_id: item.religion_id,
      religion_name: item.religion_id ? c.var.t(`religion.label.${item.religion_name}`) : null,
      ethnic_id: item.ethnic_id,
      ethnic_name: item.ethnic_id ? c.var.t(`ethnic.label.${item.ethnic_name}`) : null,
      province_id: location?.province?.id,
      province_name: location?.province?.name,
      regency_id: location?.regency?.id,
      regency_name: location?.regency?.name,
      subdistrict_id: location?.subdistrict?.id,
      subdistrict_name: location?.subdistrict?.name,
      village_id: location?.village?.id,
      village_name: location?.village?.name,
      postal_code: item.pos_code,
      address,
      residential_province_id: residenceLocation?.province?.id,
      residential_province_name: residenceLocation?.province?.name,
      residential_regency_id: residenceLocation?.regency?.id,
      residential_regency_name: residenceLocation?.regency?.name,
      residential_subdistrict_id: residenceLocation?.subdistrict?.id,
      residential_subdistrict_name: residenceLocation?.subdistrict?.name,
      residential_village_id: residenceLocation?.village?.id,
      residential_village_name: residenceLocation?.village?.name,
      residential_postal_code: item.residential_pos_code,
      residential_address: residenceAddress,
      same_address: sameAddress,
    }
  }

  private buildCaseReportResponse(c: Context, item, relatedNames) {
    return {
      clinical_diagnosis_id: item.clinical_diagnosis_id,
      clinical_diagnosis_name: c.var.t(`clinical_diagnosis.label.${item.clinical_diagnosis_name}`),
      symptoms_id: this.parseCommaSeparatedIds(item.symptoms_id),
      symptoms_name: relatedNames.symptomsNames,
      last_status_id: item.last_status_id,
      last_status_name: c.var.t(`last_status.label.${item.last_status_name}`),
      epidemiology_investigation: item.epidemiology_type,
      pe_result_id: item.pe_result_id,
      pe_result_name: item.pe_result_id !== null && item.pe_result_id !== undefined ? c.var.t(`pe_result.label.${PE_RESULT[item.pe_result_id]}`) : null,
      vector_control_id: this.parseCommaSeparatedIds(item.vector_control_id),
      vector_control_name: relatedNames.vectorControlNames,
    }
  }

  private buildLabExaminationResponse(c: Context, item, relatedNames) {
    return {
      laboratory_id: item.laboratory_id ?? null,
      laboratory_name: item.laboratory_id ? item.laboratory_id_name : item.laboratory_name,
      examination_type: item.examination_type,
      laboratory_examination: item.laboratory_examination,
      specimen_id: item.specimen_id,
      specimen_type_id: item.specimen_type_id,
      specimen_type_name: item.specimen_type_id ? c.var.t(`specimen_type.label.${item.specimen_type_name}`) : null,
      specimen_code: item.specimen_code,
      collection_date: item.collection_date ? moment(item.collection_date).format("YYYY-MM-DD") : null,
      release_date: item.release_date ? moment(item.release_date).format("YYYY-MM-DD") : null,
      examination_method_id: item.examination_method_id,
      examination_method_name: item.examination_method_id ? c.var.t(`examination_method.label.${item.examination_method_name}`) : null,
      equipment_id: this.parseCommaSeparatedIds(item.equipment_id),
      equipment_name: relatedNames.equipmentNames,
      reagent_id: this.parseCommaSeparatedIds(item.reagent_id),
      reagent_name: relatedNames.reagentNames,
      examination_result_id: item.examination_result_id,
      examination_result: item.examination_result_id ? c.var.t(`examination_result.label.${item.examination_result_name}`) : null,
      reuse_examination_result: item.reuse_examination_result ?? null,
      reuse_laboratory_id: item.reuse_laboratory_id ?? null,
      reuse_laboratory_name: item.reuse_laboratory_id ? item.reuse_laboratory_name : null,
    }
  }

  async insertCaseReport(c: Context, body: CreateDengueCaseRequest) {
    const patientId = await this.dengueCaseRepo.upsertPatient(c, body.patient)

    const entityId = c.var.user?.entity_id


    const dataDengue = DengueCaseSchema.parse({
      ...body,
      patient_id: patientId,
      symptoms_id: body.symptoms_id.join(','),
      vector_control_id: body.vector_control_id.join(','),
      input_date: moment(body.input_date).format("YYYY-MM-DD"),
      entity_id: entityId,
    })

    const dengueReportId = await this.dengueCaseRepo.createDengueCase(c, dataDengue)

    if (dengueReportId && body.laboratory_examination == 1) {
      const dataSpecimen = {
        ...body.specimen,
        patient_id: patientId,
        patient_dengue_id: dengueReportId,
        equipment_id: body.specimen.equipment_id.join(','),
        reagent_id: body.specimen.reagent_id.join(','),

      }

      await this.dengueCaseRepo.createSpecimen(c, dataSpecimen)
    }

    return {
      patient_id: patientId,
      dengue_case_id: dengueReportId,
    }
  }

  async updateCaseReport(c: Context, id: number, body: UpdateDengueCaseRequest) {
    const patientId = await this.dengueCaseRepo.upsertPatient(c, body.patient)

    const dataDengue = DengueCaseSchema.parse({
      ...body,
      patient_id: patientId,
      symptoms_id: body.symptoms_id.join(','),
      vector_control_id: body.vector_control_id.join(','),
      input_date: moment(body.input_date).format("YYYY-MM-DD"),
    })

    await this.dengueCaseRepo.updateDengueCase(c, id, dataDengue)


    if (body.laboratory_examination == 0 && body.specimen?.specimen_id) {
      // Delete specimen
      await this.dengueCaseRepo.deleteSpecimen(c, body.specimen.specimen_id)
    } else if (body.laboratory_examination == 1 && body.specimen?.specimen_id) {
      // Update existing specimen
      const dataSpecimen = {
        specimen_code: body.specimen.specimen_code,
        collection_date: body.specimen.collection_date,
        release_date: body.specimen.release_date,
        specimen_type_id: body.specimen.specimen_type_id,
        examination_method_id: body.specimen.examination_method_id,
        examination_result_id: body.specimen.examination_result_id,
        equipment_id: body.specimen.equipment_id.join(','),
        reagent_id: body.specimen.reagent_id.join(','),
        reuse_examination_result: body.specimen.reuse_examination_result,
        reuse_laboratory_id: body.specimen.reuse_laboratory_id
      }

      await this.dengueCaseRepo.updateSpecimen(c, body.specimen.specimen_id, dataSpecimen)
    } else if (body.laboratory_examination == 1) {
      // Create new specimen
      const dataSpecimen = {
        patient_id: patientId,
        patient_dengue_id: id,
        specimen_type_id: body.specimen.specimen_type_id,
        specimen_code: body.specimen.specimen_code,
        collection_date: body.specimen.collection_date,
        release_date: body.specimen.release_date,
        examination_method_id: body.specimen.examination_method_id,
        equipment_id: body.specimen.equipment_id.join(','),
        reagent_id: body.specimen.reagent_id.join(','),
        examination_result_id: body.specimen.examination_result_id,
      }

      await this.dengueCaseRepo.createSpecimen(c, dataSpecimen)
    }

    return {
      patient_id: patientId,
      dengue_case_id: id,
    }
  }

  async getDetailReport(c: Context, id: number, params) {
    const { data, total } = await this.dengueCaseRepo.getRecords(c, id, params)

    const dataFormated = data.map(item => {
      return {
        id: item.id,
        clinical_diagnosis: item.clinical_diagnosis_name,
        updated_at: moment(item.updated_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm"),
        updated_by: item.updated_by ? item.firstname + " " + item.lastname : 'Admin',
      }
    })

    return new PaginatedResponse(params, dataFormated, total)
  }

  async getDetailPatient(c: Context, id: number) {
    const item = await this.dengueCaseRepo.getDetailPatient(c, id)

    if (!item) {
      return null
    }

    const decryptedData = this.decryptPatientFields(item)
    const [location, residenceLocation] = await Promise.all([
      this.locationRepo.getDetails(c, Number(item.village_id)),
      this.locationRepo.getDetails(c, Number(item.residential_village_id))
    ])
    const relatedNames = await this.getCaseReportRelatedNames(c, item)

    return {
      data: {
        patient_data: this.buildPatientDetailResponse(c, item, decryptedData, location),
        residential_data: this.buildResidentialDataResponse(residenceLocation, decryptedData.residenceAddress, item.pos_code),
        case_report: this.buildPatientCaseReportResponse(c, item, relatedNames),
        laboratory_examination: this.buildPatientLabExaminationResponse(c, item, relatedNames),
        sentinel_surveillance: this.buildSentinelSurveillanceResponse(item, decryptedData.identityNumber)
      }
    }
  }

  private decryptPatientFields(item) {
    return {
      identityNumber: item.nik ? doDecrypt(item.nik) : null,
      identityName: item.name ? doDecrypt(item.name) : null,
      birthDate: item.birth_date ? doDecrypt(item.birth_date) : null,
      address: item.address ? doDecrypt(item.address) : null,
      residenceAddress: item.residential_address ? doDecrypt(item.residential_address) : null,
      phoneNumber: item.phone_number ? doDecrypt(item.phone_number) : null,
    }
  }


  private buildPatientDetailResponse(c: Context, item, decryptedData, location) {
    const { identityNumber, identityName, birthDate, address, phoneNumber } = decryptedData

    return {
      input_date: moment(item.input_date).format("YYYY-MM-DD"),
      nik: identityNumber,
      name: identityName,
      gender: c.var.t(`gender.label.${item.gender}`),
      date_of_birth: birthDate,
      phone: phoneNumber,
      marital_id: item.marital_status,
      marital_name: item.marital_status ? c.var.t(`marital_status.label.${MARITAL_STATUS[item.marital_status]}`) : null,
      last_education_id: item.education_id,
      last_education_name: item.education_id ? c.var.t(`education.label.${item.education_name}`) : null,
      occupation_id: item.occupation_id,
      occupation_name: item.occupation_id ? c.var.t(`occupation.label.${item.occupation_name}`) : null,
      religion_id: item.religion_id,
      religion_name: item.religion_id ? c.var.t(`religion.label.${item.religion_name}`) : null,
      ethnic_id: item.ethnic_id,
      ethnic_name: item.ethnic_id ? c.var.t(`ethnic.label.${item.ethnic_name}`) : null,
      province_name: location?.province?.name,
      regency_name: location?.regency?.name,
      subdistrict_name: location?.subdistrict?.name,
      village_name: location?.village?.name,
      postal_code: item.pos_code,
      address: address,
    }
  }

  private buildResidentialDataResponse(residenceLocation, residenceAddress, posCode) {
    return {
      province_name: residenceLocation?.province?.name,
      regency_name: residenceLocation?.regency?.name,
      subdistrict_name: residenceLocation?.subdistrict?.name,
      village_name: residenceLocation?.village?.name,
      residential_address: residenceAddress,
      postal_code: posCode,
    }
  }

  private buildPatientCaseReportResponse(c: Context, item, relatedNames) {
    return {
      clinical_diagnosis_name: item.clinical_diagnosis_id ? c.var.t(`clinical_diagnosis.label.${item.clinical_diagnosis_name}`) : null,
      symptoms_name: relatedNames.symptomsNames,
      last_status_name: item.last_status_id ? c.var.t(`last_status.label.${item.last_status_name}`) : null,
      epidemiology_investigation: item.epidemiology_type,
      pe_result_name: item.pe_result_id !== null && item.pe_result_id !== undefined ? c.var.t(`pe_result.label.${PE_RESULT[item.pe_result_id]}`) : null,
      vector_control_name: relatedNames.vectorControlNames,
    }
  }

  private buildPatientLabExaminationResponse(c: Context, item, relatedNames) {
    return {
      laboratory_id: item.laboratory_id,
      laboratory_name: item.laboratory_id ? item.laboratory_id_name : item.laboratory_name,
      examination_type: item.examination_type,
      laboratory_examination: item.laboratory_examination,
      specimen_type_name: item.specimen_type_id ? c.var.t(`specimen_type.label.${item.specimen_type_name}`) : null,
      specimen_code: item.specimen_code,
      collection_date: item.collection_date ? moment(item.collection_date).format("YYYY-MM-DD") : null,
      release_date: item.release_date ? moment(item.release_date).format("YYYY-MM-DD") : null,
      examination_method_name: item.examination_method_id ? c.var.t(`examination_method.label.${item.examination_method_name}`) : null,
      equipment_name: relatedNames.equipmentNames,
      reagent_name: relatedNames.reagentNames,
      examination_result: item.examination_result_id ? c.var.t(`examination_result.label.${item.examination_result_name}`) : null,
      reuse_examination_result: item.reuse_examination_result ?? null,
      reuse_laboratory_id: item.reuse_laboratory_id ?? null,
      reuse_laboratory_name: item.reuse_laboratory_id ? item.reuse_laboratory_name : null,
    }
  }

  private buildSentinelSurveillanceResponse(item, identityNumber) {
    return {
      nik: identityNumber,
      duration: item.duration,
      case_report_completed: item.case_report_completed,
      lab_result_name: item.lab_result_name,
      specimen_code: item.specimen_code,
      specimen_collection: item.collection_date == null ? 0 : 1,
      specimen_collection_date: item.collection_date ?? null,
      ns1_result: NS1_ID.includes(item.examination_result_id) ? 1 : 0,
    }
  }

  async getPatients(c: Context, params) {
    const { data, total } = await this.dengueCaseRepo.getPatients(c, params)

    const dataFormated = await Promise.all(
      data.map(async (item) => {
        const identityNumber = item.nik ? doDecrypt(item.nik) : null
        const identityName = item.name ? doDecrypt(item.name) : null
        const birthDate = item.birth_date ? doDecrypt(item.birth_date) : null
        const age = birthDate ? moment(item.input_date).diff(moment(birthDate), "years") : null

        return {
          id: item.id,
          nik: identityNumber,
          name: identityName,
          age: age,
        }
      }),
    )

    return new PaginatedResponse(params, dataFormated, total)
  }

  private async formatFullAddress(
    c: Context,
    address: string | null,
    villageId: number | null,
    posCode: number | null
  ): Promise<string> {
    if (!address || !villageId) return "";

    const location = await this.locationRepo.getDetails(c, villageId);
    const decryptedAddress = doDecrypt(address);

    return `${decryptedAddress}, ${location?.village?.name}, ${location?.subdistrict?.name}, ${location?.regency?.name}, ${location?.province?.name} ${posCode ?? ""}`;
  }

  private parseCommaSeparatedIds(value: string | null): number[] {
    if (!value) return [];
    return value.split(',').map(Number);
  }

  private async getEquipmentNames(
    c: Context,
    equipmentIds: string | null,
    type: number
  ): Promise<string> {
    if (!equipmentIds || equipmentIds === "null") return "";

    const ids = this.parseCommaSeparatedIds(equipmentIds);
    if (ids.length === 0) return "";

    const items = await this.dengueCaseRepo.findEquipment(c, ids, type);
    return items.map(item => item.name).join(', ');
  }

  private async getVectorControlNames(
    c: Context,
    ids: string | null
  ): Promise<string> {
    if (!ids || ids === "null") return "";

    const vectorIds = this.parseCommaSeparatedIds(ids);
    if (vectorIds.length === 0) return "";

    const items = await this.dengueCaseRepo.findVectorControl(c, vectorIds);
    return items.map(item => c.var.t(`vector_control.label.${item.name}`)).join(', ');
  }

  private async getSymptomsNames(
    c: Context,
    ids: string | null
  ): Promise<string> {
    if (!ids || ids === "null") return "";

    const symptomIds = this.parseCommaSeparatedIds(ids);
    if (symptomIds.length === 0) return "";

    const items = await this.dengueCaseRepo.findSymptoms(c, symptomIds);
    return items.map(item => c.var.t(`symptoms.label.${item.name}`)).join(', ');
  }

  private async buildExportRow(
    c: Context,
    item,
  ) {
    const decryptedData = this.decryptExportFields(item);
    const address = await this.resolveExportAddress(c, item);
    const relatedNames = await this.getExportRelatedNames(c, item);

    return this.buildExportArray(item, decryptedData, address, relatedNames);
  }

  private decryptExportFields(item) {
    const birthDate = item.birth_date ? doDecrypt(item.birth_date) : null;
    return {
      identityNumber: item.identity_number ? doDecrypt(item.identity_number) : "",
      identityName: item.name ? doDecrypt(item.name) : "",
      birthDate,
      age: birthDate ? moment(item.input_date).diff(moment(birthDate), "years") : null,
      phoneNumber: item.phone_number ? doDecrypt(item.phone_number) : "",
    };
  }

  private async resolveExportAddress(c: Context, item): Promise<string> {
    if (item.residential_address && item.residential_village_id) {
      return this.formatFullAddress(c, item.residential_address, item.residential_village_id, item.residential_pos_code);
    }
    if (item.address && item.village_id) {
      return this.formatFullAddress(c, item.address, item.village_id, item.pos_code);
    }
    return "";
  }

  private async getExportRelatedNames(c: Context, item) {
    const [equipmentNames, reagentNames, vectorControlNames, symptomsNames] = await Promise.all([
      this.getEquipmentNames(c, String(item.equipment_id), EQUIPMENT),
      this.getEquipmentNames(c, String(item.reagent_id), REAGENT),
      this.getVectorControlNames(c, String(item.vector_control_id)),
      this.getSymptomsNames(c, String(item.symptoms_id))
    ]);
    return { equipmentNames, reagentNames, vectorControlNames, symptomsNames };
  }

  private buildExportArray(item, decryptedData, address: string, relatedNames) {
    const { identityNumber, identityName, birthDate, age, phoneNumber } = decryptedData;
    const epidemiologyType = item.epidemiology_type == 1 ? "Yes" : "No";
    const laboratoryExamination = item.laboratory_examination == 1 ? "Yes" : "No";

    return [
      identityNumber,
      identityName,
      birthDate ? moment(birthDate).format("DD MMM YYYY") : "",
      age ? `${age} Years Old` : "",
      address,
      phoneNumber,
      MARITAL_STATUS[item.marital_status] ?? "",
      item.education_name ?? "",
      item.occupation_name ?? "",
      item.religion_name ?? "",
      item.ethnic_name ?? "",
      moment(item.input_date).format("DD MMM YYYY"),
      item.clinical_diagnosis_name ?? "",
      relatedNames.symptomsNames ?? "",
      item.last_status_name ?? "",
      epidemiologyType,
      PE_RESULT[item.pe_result_id] ?? "",
      relatedNames.vectorControlNames ?? "",
      laboratoryExamination,
      item.laboratory_id ? item.laboratory_id_name : item.laboratory_name,
      item.specimen_type_name ?? "",
      item.specimen_code ?? "",
      item.collection_date ? moment(item.collection_date).format("DD MMM YYYY") : "",
      item.release_date ? moment(item.release_date).format("DD MMM YYYY") : "",
      item.examination_method_name ?? "",
      relatedNames.equipmentNames,
      relatedNames.reagentNames,
      item.examination_result_name ?? "",
      item.reuse_examination_result ?? "",
      item.reuse_laboratory_id_name ?? "",
    ];
  }

  private getExportColumns() {
    return [
      { key: "NIK", header: "NIK", width: 20 },
      { key: "Full Name", header: "Full Name", width: 25 },
      { key: "Birth Date", header: "Birth Date", width: 25 },
      { key: "Age", header: "Age", width: 20 },
      { key: "Address", header: "Address", width: 30 },
      { key: "Phone Number", header: "Phone Number", width: 25 },
      { key: "Marital Status", header: "Marital Status", width: 15 },
      { key: "Education", header: "Education", width: 30 },
      { key: "Occupation", header: "Occupation", width: 25 },
      { key: "Religion", header: "Religion", width: 25 },
      { key: "Ethnic", header: "Ethnic", width: 20 },
      { key: "Input Date", header: "Input Date", width: 20 },
      { key: "Clinical Diagnosis", header: "Clinical Diagnosis", width: 20 },
      { key: "Symptoms", header: "Symptoms", width: 20 },
      { key: "Last Status", header: "Last Status", width: 15 },
      { key: "Epidemiology Investigation (PE)", header: "Epidemiology Investigation (PE)", width: 18 },
      { key: "PE Result", header: "PE Result", width: 18 },
      { key: "Vector Control", header: "Vector Control", width: 20 },
      { key: "Laboratory Examination", header: "Laboratory Examination", width: 18 },
      { key: "Laboratory Name", header: "Laboratory Name", width: 25 },
      { key: "Specimen Type", header: "Specimen Type", width: 15 },
      { key: "Specimen ID", header: "Specimen ID", width: 15 },
      { key: "Collection Date", header: "Collection Date", width: 15 },
      { key: "Result Release Date", header: "Result Release Date", width: 15 },
      { key: "Examination Method", header: "Examination Method", width: 20 },
      { key: "Equipment", header: "Equipment", width: 15 },
      { key: "Consumable Material", header: "Consumable Material", width: 15 },
      { key: "Examination Result", header: "Examination Result", width: 20 },
      { key: "Sentinel Test", header: "Sentinel Test", width: 20 },
      { key: "Sentinel Laboratory ID", header: "Sentinel Laboratory ID", width: 25 },
    ];
  }

  private async mapPatientData(c: Context, row: ImportDengueCaseRequest) {
    const patientData = this.initializePatientData(row);
    this.setOptionalPatientFields(patientData, row);
    await this.setIdentityDetails(c, patientData, row);
    this.setResidentialAddress(patientData, row);

    return patientData;
  }

  private initializePatientData(row: ImportDengueCaseRequest): Record<string, unknown> {
    return {
      nik: String(row.NIK),
      name: String(row.FullName),
      registered_village_id: Number(row.RegisteredVillageID),
      gender: 1,
      date_of_birth: "",
      phone: "",
      registered_address: row.RegisteredAddress ? String(row.RegisteredAddress) : "",
      registered_postal_code: row.RegisteredPostalCode ? String(row.RegisteredPostalCode) : "",
    };
  }

  private setOptionalPatientFields(patientData: Record<string, unknown>, row: ImportDengueCaseRequest): void {
    if (row.PhoneNumber) {
      const phone = String(row.PhoneNumber);
      patientData.phone = phone.startsWith('+') ? phone : '+' + phone;
    }

    patientData.occupation_id = row.OccupationID ? Number(row.OccupationID) : undefined;
    patientData.religion_id = row.ReligionID ? Number(row.ReligionID) : undefined;
    patientData.last_education_id = row.LastEducationID ? Number(row.LastEducationID) : undefined;
    patientData.ethnic_id = row.EthnicID ? Number(row.EthnicID) : undefined;
    patientData.marital_id = row.StatusID ? Number(row.StatusID) : 0;
  }

  private async setIdentityDetails(c: Context, patientData: Record<string, unknown>, row: ImportDengueCaseRequest): Promise<void> {
    if (!row.RegisteredVillageID) return;

    const detailIdentity = await getIdentityAndAddressByNIK(c, String(row.NIK), this.locationRepo);
    if (detailIdentity) {
      Object.assign(patientData, {
        gender: detailIdentity.gender,
        date_of_birth: detailIdentity.date_of_birth,
        registered_province_id: detailIdentity.province_id,
        registered_city_id: detailIdentity.city_id,
        registered_district_id: detailIdentity.district_id,
        registered_village_id: row.RegisteredVillageID,
      });
    }
  }

  private setResidentialAddress(patientData: Record<string, unknown>, row: ImportDengueCaseRequest): void {
    if (row.SameAddress === 1) {
      this.copyRegisteredToResidence(patientData, row);
    } else {
      this.setDifferentResidence(patientData, row);
    }
  }

  private copyRegisteredToResidence(patientData: Record<string, unknown>, row: ImportDengueCaseRequest): void {
    patientData.residence_address = row.RegisteredAddress ? String(row.RegisteredAddress) : undefined;
    patientData.residence_province_id = Number(patientData.registered_province_id);
    patientData.residence_city_id = Number(patientData.registered_city_id);
    patientData.residence_district_id = Number(patientData.registered_district_id);
    patientData.residence_village_id = Number(row.RegisteredVillageID);
    patientData.residence_postal_code = String(row.RegisteredPostalCode);
  }

  private setDifferentResidence(patientData: Record<string, unknown>, row: ImportDengueCaseRequest): void {
    patientData.residence_address = row.ResidentialAddress ? String(row.ResidentialAddress) : undefined;
    patientData.residence_province_id = row.ResidentialProvinceID ? Number(row.ResidentialProvinceID) : undefined;
    patientData.residence_city_id = row.ResidentialCityID ? Number(row.ResidentialCityID) : undefined;
    patientData.residence_district_id = row.ResidentialDistrictID ? Number(row.ResidentialDistrictID) : undefined;
    patientData.residence_village_id = row.ResidentialVilageID ? Number(row.ResidentialVilageID) : undefined;
    patientData.residence_postal_code = row.ResidentialPostalCode ? String(row.ResidentialPostalCode) : undefined;
  }

  private validateImportData(rows): void {
    if (!rows) {
      throw new Error("Rows is null or undefined. The Excel file parsing failed. Please check if column names in row 9 match exactly with the template.");
    }

    if (!Array.isArray(rows)) {
      throw new TypeError(`Rows is not an array. Received type: ${typeof rows}`);
    }

    if (rows.length === 0) {
      throw new Error("No data rows found. Please ensure your Excel file has data starting from row 10. Check that row 9 has the correct column headers.");
    }
  }

  private buildSpecimenDataFromRow(row: ImportDengueCaseRequest) {
    const specimenData: Record<string, unknown> = {};

    if (row.SpecimenType) specimenData.specimen_type_id = Number(row.SpecimenType);
    if (row.SpecimenCode) specimenData.specimen_code = String(row.SpecimenCode);
    if (row.CollectionDate) specimenData.collection_date = String(row.CollectionDate);
    if (row.ReleaseDate) specimenData.release_date = String(row.ReleaseDate);
    if (row.ExaminationMethodID) specimenData.examination_method_id = Number(row.ExaminationMethodID);

    specimenData.equipment_id = row.EquipmentID
      ? String(row.EquipmentID).split(',').map(e => Number.parseInt(e.trim(), 10)).filter(n => !Number.isNaN(n))
      : [];

    specimenData.reagent_id = row.ReagentID
      ? String(row.ReagentID).split(',').map(r => Number.parseInt(r.trim(), 10)).filter(n => !Number.isNaN(n))
      : [];

    if (row.ExaminationResult) specimenData.examination_result_id = Number(row.ExaminationResult);
    if (row.ReuseExaminationResult) specimenData.reuse_examination_result = Number(row.ReuseExaminationResult);
    if (row.ReuseLaboratoryId) specimenData.reuse_laboratory_id = Number(row.ReuseLaboratoryId);

    return specimenData;
  }

  private buildDengueCaseDataFromRow(
    row: ImportDengueCaseRequest,
    patientData: Record<string, unknown>,
    specimenData: Record<string, unknown>
  ) {
    const inputDate = moment(row.InputDate).format("YYYY-MM-DD");

    const dengueCaseData: Record<string, unknown> = {
      clinical_diagnosis_id: row.ClinicalDiagnosisID ? Number(row.ClinicalDiagnosisID) : undefined,
      input_date: String(inputDate),
      patient: patientData,
      specimen: specimenData,
    };

    dengueCaseData.symptoms_id = row.SymptomsID
      ? String(row.SymptomsID).split(',').map(s => Number.parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))
      : [];

    if (row.LastStatusID) dengueCaseData.last_status_id = Number(row.LastStatusID);
    if (row.EpidemiologyType != null) dengueCaseData.epidemiology_type = row.EpidemiologyType;
    if (row.PEResultID !== undefined && row.PEResultID !== null) dengueCaseData.pe_result_id = Number(row.PEResultID);

    dengueCaseData.vector_control_id = row.VectorControlID
      ? String(row.VectorControlID).split(',').map(v => Number.parseInt(v.trim(), 10)).filter(n => !Number.isNaN(n))
      : [];

    if (row.LaboratoryExamination != null) dengueCaseData.laboratory_examination = row.LaboratoryExamination;
    if (row.ExaminationType) dengueCaseData.examination_type = Number(row.ExaminationType);
    if (row.LaboratoryID) dengueCaseData.laboratory_id = Number(row.LaboratoryID);

    return dengueCaseData;
  }

  private async processImportRow(
    c: Context,
    row: ImportDengueCaseRequest,
    rowNumber: number
  ): Promise<{ success: boolean; isDuplicate: boolean }> {
    const inputDate = moment(row.InputDate).format("YYYY-MM-DD");

    // Check for duplicates
    const existing = await this.dengueCaseRepo.findByNikAndInputDate(
      c,
      String(row.NIK),
      inputDate
    );

    if (existing) {
      return { success: false, isDuplicate: true };
    }

    const patientData = await this.mapPatientData(c, row);
    const specimenData = this.buildSpecimenDataFromRow(row);
    const dengueCaseData = this.buildDengueCaseDataFromRow(row, patientData, specimenData);

    try {
      await this.insertCaseReport(c, dengueCaseData as CreateDengueCaseRequest);
      return { success: true, isDuplicate: false };
    } catch (error) {
      console.error(`Error processing row ${rowNumber}:`, error);
      return { success: false, isDuplicate: false };
    }
  }

}
