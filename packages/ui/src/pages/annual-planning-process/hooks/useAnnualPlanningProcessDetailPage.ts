import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { parseAsString, useQueryStates } from "nuqs"
import { useTranslation } from "react-i18next"
import { getDetailAnnualPlanningProcess, getDetailAnnualPlanningProcessDistrictIP } from "../annual-planning-process.services"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { useEffect, useMemo, useState } from "react"
import { fetchDetailPopulationTarget, fetchGroupTarget, toSnakeCase } from "../annual-planning-process.utils"
import { useDataGroupTarget } from "../store/group-target.store"
import { useInformationPopulationTarget } from "./useInformationPopulationTarget"
import { GetDetailAnnualPlanningProcessPopulationTarget } from "../annual-planning-process.types"

// Helper function to find matching target group population
const findTargetGroupPopulation = (
  curr: GetDetailAnnualPlanningProcessPopulationTarget,
  targetName: string
): number => {
  const targetGroup = curr.annual_need_populations.find(
    hcTargetGroup => toSnakeCase(hcTargetGroup.target_group_name) === toSnakeCase(targetName)
  )
  return targetGroup?.population_correction ?? 0
}

// Helper function to calculate total population across all targets
const calculateTotalPopulation = (
  dataPopulationTarget: GetDetailAnnualPlanningProcessPopulationTarget[],
  targetName: string
): number => {
  return dataPopulationTarget.reduce((acc, curr) => {
    return acc + findTargetGroupPopulation(curr, targetName)
  }, 0)
}

// Helper function to map population data
const mapPopulationData = (
  populationData: any[],
  dataPopulationTarget: GetDetailAnnualPlanningProcessPopulationTarget[]
) => {
  return populationData.map((x) => {
    const totalPopulation = calculateTotalPopulation(dataPopulationTarget, x.name)

    return {
      percentage: 100,
      population: x.population_number,
      population_correction: totalPopulation,
      id: x.id,
      status: 0, // dummy not used in detail view
      target_group_id: 0, // dummy not used in detail view
      target_group_name: x.name,
    }
  })
}

export const useAnnualPlanningProcessDetailPage = () => {
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const params = useParams()
  const id = params?.id
  const [query, setQuery] = useQueryStates({
    tab: parseAsString.withDefault('area')
  }, { history: 'push' })
  const { setGroupTarget, group_target } = useDataGroupTarget()
  const { mutateCentralPopulation, central_population } = useInformationPopulationTarget()
  const [isLoadingPopulation, setIsLoadingPopulation] = useState(false)
  const [dataPopulationTarget, setDataPopulationTarget] = useState<GetDetailAnnualPlanningProcessPopulationTarget[]>([])

  const fetchDataPopulation = async (id: number, programPlanId: number, regencyId: number) => {
    setIsLoadingPopulation(true)
    const data = await fetchDetailPopulationTarget(id)
    setDataPopulationTarget(data)

    mutateCentralPopulation({
      programPlanId,
      regencyId
    })

    const dataGroupTarget = await fetchGroupTarget(programPlanId)
    setGroupTarget(dataGroupTarget)
    setIsLoadingPopulation(false)
  }

  const {
    data: dataDetail,
    isPending,
  } = useQuery({
    queryKey: ["getDetailAnnualPlanningProcess"],
    queryFn: () => getDetailAnnualPlanningProcess(Number(id)),
    enabled: !!id
  })

  const {
    data: dataDetailDistrictIP,
    isPending: isPendingDistrictIP,
  } = useQuery({
    queryKey: ["getDetailAnnualPlanningProcessDistrictIP", language],
    queryFn: () => getDetailAnnualPlanningProcessDistrictIP(Number(id)),
    enabled: !!id
  })

  const columnsPopulationTarget = useMemo<Record<any, any>[]>(() => {
    if (group_target && group_target.length > 0) {
      return group_target.map((x) => ({
        header: x.name,
        key: toSnakeCase(x.name),
      }))
    }

    return []
  }, [group_target])

  const dataDetailPopulationTarget = useMemo(() => {
    const result: GetDetailAnnualPlanningProcessPopulationTarget[] = []
    if (central_population && dataPopulationTarget.length > 0) {
      result.push({
        entity: central_population.entity,
        id: 0,
        sub_district: null,
        updated_at: central_population.updated_at ?? null,
        user_updated_by: central_population.user_updated_by ? {
          id: central_population.user_updated_by.id,
          name: central_population.user_updated_by.username
        } : null,
        annual_need_populations: mapPopulationData(
          central_population.population_data,
          dataPopulationTarget
        )
      })
    }

    return [...result, ...dataPopulationTarget]

  }, [dataPopulationTarget, central_population])

  useEffect(() => {
    if (dataDetail?.id) {
      fetchDataPopulation(dataDetail?.id, dataDetail?.program_plan.id, dataDetail?.regency.id)
    }
  }, [dataDetail?.id])

  useSetLoadingPopupStore(
    isPending ||
    isPendingDistrictIP ||
    isLoadingPopulation
  )

  return {
    t,
    query,
    setQuery,
    dataDetail,
    dataDetailPopulationTarget,
    dataDetailDistrictIP,
    columnsPopulationTarget,
  }
}