import { RequestloginResponse } from "#types/auth"
import { Color } from "#types/component"
import { TFunction } from "i18next"
import { AnnualPlanningProcessStatus, ProcessStatus } from "./annual-planning-process.constants"
import {
  AnnualPlanningProcessForm,
  DataCentralPopulation,
  FormAreaProgramPlanForm,
  FormPopulationCorrectionDataForm,
  FormPopulationCorrectionForm,
  FormPopulationTargetForm,
  GetDetailAnnualPlanningProcessDistrictIPResponse,
  GetDetailAnnualPlanningProcessPopulationTargetResponse,
  GetDetailAnnualPlanningProcessResponse,
  ListGroupTargetResponse,
  ListMaterialIPResponse
} from "./annual-planning-process.types"
import { listEntities } from "#services/entity"
import { ENTITY_TAG, ENTITY_TYPE } from "#constants/entity"
import { TEntities } from "#types/entity"
import {
  getDetailAnnualPlanningProcessDistrictIP,
  getDetailAnnualPlanningProcessPopulationTarget,
  listGroupTarget,
  listMaterialIP
} from "./annual-planning-process.services"
import { ColumnDef } from "@tanstack/react-table"
import { numberFormatter } from "#utils/formatter"

type Params = {
  user: RequestloginResponse | null,
  programPlan?: FormAreaProgramPlanForm['program_plan'],
  populationCorrection?: AnnualPlanningProcessForm['population_correction'],
  usageIndex?: AnnualPlanningProcessForm['usage_index'],
}
export const setInitialValuesForm = ({
  user,
  programPlan,
  populationCorrection,
  usageIndex,
}: Params) => {
  const area_program_plan: FormAreaProgramPlanForm = {
    province: null,
    regency: null,
    program_plan: programPlan,
  }

  if (user) {
    if (user.entity.province) {
      area_program_plan.province = { value: user.entity.province.id, label: user.entity.province.name }
    }
    if (user.entity.regency) {
      area_program_plan.regency = { value: user.entity.regency.id, label: user.entity.regency.name }
    }
  }

  return {
    area_program_plan,
    population_correction: populationCorrection,
    usage_index: usageIndex,
  }
}

export const isAllDataApproved = (data: FormPopulationTargetForm[] | null | undefined) => {
  return data?.every(x => x.status === AnnualPlanningProcessStatus.APPROVED)
}

export const getStatusConfig = (
  statusId: number | string,
  t: TFunction<['annualPlanningProcess', 'common']>
): { color: Color; text: string } => {
  const statusMap: Record<number | string, { color: Color; text: string }> = {
    [AnnualPlanningProcessStatus.APPROVED]: { color: "success", text: t('annualPlanningProcess:list.status.approved') },
    [AnnualPlanningProcessStatus.DESK]: { color: "info", text: t('annualPlanningProcess:list.status.desk') },
    [AnnualPlanningProcessStatus.REVISION]: { color: "danger", text: t('annualPlanningProcess:list.status.revision') },
    [AnnualPlanningProcessStatus.DRAFT]: { color: "neutral", text: t('annualPlanningProcess:list.status.draft') },
  }

  return statusMap[statusId] || { color: "neutral", text: '-' }
}

export function toSnakeCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export const mergeTotalsPopulationCorrection = (
  data: FormPopulationCorrectionDataForm['data'] | AnnualPlanningProcessForm['population_correction']
): Record<string, number> => {
  const result: Record<string, number> = {};

  data?.forEach(healthCare => {
    healthCare?.data?.forEach(targetGroup => {
      if (targetGroup.key) {
        const key = toSnakeCase(targetGroup.key)
        if (!result?.[key]) {
          result[key] = 0;
        }
        result[key] += targetGroup?.change_qty ?? 0;
      }
    });
  });

  return result;
}

export const transformDataCentral = (
  data: Array<{ name: string, population_number: number, id: number }>,
  groupTarget: ListGroupTargetResponse['data'],
  defaultValue?: number
) => {
  const result: Record<string, number> = {};

  groupTarget.forEach(item => {
    const key = toSnakeCase(item.name)
    const dataCentral = data.find(x => toSnakeCase(x.name) === key)

    result[key] = defaultValue ?? dataCentral?.population_number ?? 0
  });

  return [result];
}

export const toKeyValueMap = (data: DataCentralPopulation['population_data']): Record<string, number> => {
  return data?.reduce((acc, item) => {
    acc[toSnakeCase(item.name)] = item.population_number;
    return acc;
  }, {} as Record<string, number>) ?? {};
}

const headerClassName = 'ui-px-1 ui-py-4 ui-bg-neutral-100 ui-border-r ui-border-gray-300'
const cellClassName = (index: number) => `ui-border-r ui-border-gray-300 ui-text-center ${index > 0 ? 'ui-bg-primary-50 ui-bg-opacity-30' : ''}`
export const setColumnInformationPopulationAdjustment = (
  group_target: ListGroupTargetResponse['data'],
  language: string
): ColumnDef<any, any>[] => {
  const result: ColumnDef<any, any>[] = [{
    header: '',
    accessorKey: 'name',
    size: 90,
    meta: {
      headerClassName: headerClassName,
      cellClassName: cellClassName(0) + ` !ui-text-left !ui-bg-neutral-100`
    },
  }]
  if (group_target && group_target.length > 0) {
    result.push(...group_target.map((x) => ({
      header: x.name,
      accessorKey: toSnakeCase(x.name),
      size: 90,
      meta: {
        headerClassName: headerClassName + ' ui-text-center',
        cellClassName: ({ index }: { index: number }) => cellClassName(index)
      },
      cell: ({ getValue }: { getValue: () => unknown }) => {
        return numberFormatter(getValue() as number || 0, language)
      }
    })))
  }

  return result
}

export const setAllDataPopulations = ({
  dataFormParentPopulations,
  data,
  index,
}: {
  dataFormParentPopulations: FormPopulationCorrectionForm[],
  data: FormPopulationTargetForm[],
  index: number | null,
}) => {
  return dataFormParentPopulations?.reduce((acc, item, idx) => {
    const entries = idx === index ? data : item?.data ?? [];

    entries.forEach((entry: Record<string, any>) => {
      const key = entry.key ?? Object.keys(entry).find(k => k !== "change_qty")!;
      const value = entry.change_qty ?? entry[key] ?? 0;
      acc[key] = (acc[key] || 0) + value;
    });

    return acc;
  }, {} as Record<string, number>)
}

export function roundIfNeeded(value: number): number {
  const factor = 1000;

  const rounded = Math.round((value + Number.EPSILON) * factor) / factor

  return Math.abs(value - rounded) < Number.EPSILON ? value : rounded
}

export const resultCalculationPopulation = ({
  target,
  populationDataCentral,
  populationDataDistrict,
}: {
  target: FormPopulationTargetForm
  populationDataCentral: Record<string, number>
  populationDataDistrict: Record<string, number>
}) => {
  const key = target.key ?? ''
  const totalCentral = populationDataCentral[key] ? Number(populationDataCentral[key]) : 0
  const totalHealthCare = populationDataDistrict[key] ? Number(populationDataDistrict[key]) : 0

  const resultPercentage = !target.change_qty ? 0 : target.change_qty / totalHealthCare * 100
  const resultQty = !resultPercentage ? 0 : Math.round(totalCentral * resultPercentage / 100);

  return {
    resultPercentage,
    resultQty,
  }
}

export const generateAnnualPlanningDetail = (
  t: TFunction<['annualPlanningProcess', 'common']>,
  data?: GetDetailAnnualPlanningProcessResponse
) => {
  return [
    {
      label: t('common:form.province.label'),
      value: data?.province?.name ?? '-',
      id: 'detail-information-province-name',
    },
    {
      label: t('common:form.city.label'),
      value: data?.regency?.name ?? '-',
      id: 'detail-information-city-name',
    },
    {
      label: t('annualPlanningProcess:list.filter.program_plan.label'),
      value: data?.program_plan?.year ?? '-',
      id: 'detail-information-program-plan-year',
    },
  ]
}

export const fetchHealthCare = async ({
  province_id,
  regency_id,
}: {
  province_id?: number,
  regency_id?: number,
}): Promise<TEntities[]> => {
  const params = {
    page: 1,
    paginate: 100,
    ...province_id && {
      province_ids: String(province_id),
    },
    ...regency_id && {
      regency_ids: String(regency_id),
    },
    type_ids: ENTITY_TYPE.FASKES,
    entity_tag_ids: ENTITY_TAG.PUSKESMAS,
  }

  try {
    const response = await listEntities(params)

    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchGroupTarget = async (
  programPlanId: number | string
): Promise<ListGroupTargetResponse['data']> => {
  try {
    const params = {
      page: 1,
      paginate: 100,
    }

    const response = await listGroupTarget(programPlanId, params)

    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchMaterialIP = async (
  programPlanId: number | string
): Promise<ListMaterialIPResponse['data']> => {
  try {
    const params = {
      page: 1,
      paginate: 100,
    }

    const response = await listMaterialIP(programPlanId, params)

    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchDetailPopulationTarget = async (
  annualId: number
): Promise<GetDetailAnnualPlanningProcessPopulationTargetResponse['data']> => {
  try {
    const response = await getDetailAnnualPlanningProcessPopulationTarget(annualId)

    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchDetailDistrictIP = async (
  annualId: number
): Promise<GetDetailAnnualPlanningProcessDistrictIPResponse | null> => {
  try {
    const response = await getDetailAnnualPlanningProcessDistrictIP(annualId)

    return response
  } catch (error) {
    console.error(error)
    return null
  }
}

export const setFormDataPopulationTarget = async (id: number) => {
  const data = await fetchDetailPopulationTarget(id)

  const newData = data.map(population => ({
    id: population.id,
    name: population.entity.name,
    entity_id: population.entity.id,
    user_updated_by: population.user_updated_by,
    sub_district: population.sub_district,
    updated_at: population.updated_at,
    data: population.annual_need_populations.map(target => ({
      id: target.id,
      key: toSnakeCase(target.target_group_name),
      target_group_id: target.target_group_id,
      name: target.target_group_name,
      sub_district: population.sub_district,
      percentage: target.percentage,
      qty: target.population,
      change_qty: target.population_correction,
      user: population.user_updated_by,
      updated_at: population.updated_at,
      status: target.status ?? ProcessStatus.APPROVED, // init for first review
    }))
  }))

  return newData
}

export const setFormUsageIndex = async (id: number) => {
  const dataMaterialIP = await fetchDetailDistrictIP(id)

  const newData = dataMaterialIP?.data.map(materialIP => ({
    id: materialIP.id,
    material: materialIP.material,
    activity: materialIP.activity,
    sku: materialIP.sku,
    national_ip: materialIP.national_ip,
    district_ip: materialIP.regency_ip,
    user_updated_by: materialIP.user_updated_by,
    updated_at: materialIP.updated_at,
    status: materialIP.status ?? AnnualPlanningProcessStatus.APPROVED,
    target_group: materialIP.target_group,
  }))

  return newData
}
