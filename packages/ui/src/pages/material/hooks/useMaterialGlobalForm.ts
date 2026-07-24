import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { listManufacturers } from '#services/manufacturer'
import {
  getMaterialDetail,
  getMaterialRelations,
  getMaterials,
  getMaterialTypes,
  getMaterialUnits,
} from '#services/material'

type Props = {
  isGlobal?: boolean
  isEdit?: boolean
}

export const useMaterialGlobalForm = ({ isGlobal, isEdit }: Props) => {
  const router = useRouter()
  const { id } = router.query

  const { data: detailMaterial, isFetching: isDetailFetching } = useQuery({
    queryKey: ['material', id],
    queryFn: () => getMaterialDetail(Number(id), isGlobal),
    enabled: Boolean(id),
  })

  const { data: programDataSource } = useQuery({
    queryKey: ['program-materials'],
    queryFn: () => getMaterials({ page: 1, paginate: 100 }),
    enabled: !isGlobal,
  })

  const { data: manufacturerList, isFetching: isManufacturerListFetching } =
    useQuery({
      queryKey: ['manufacturer-detail'],
      queryFn: () => listManufacturers({ page: 1, paginate: 100 }),
      enabled: !isGlobal,
    })

  const { data: materialRelation, isFetching: isMaterialRelationFetching } =
    useQuery({
      queryKey: ['material-relation', id],
      queryFn: () => getMaterialRelations(Number(id)),
      enabled: isGlobal,
    })

  const { data: materialType, isFetching: isMaterialTypeFetching } = useQuery({
    queryKey: ['material-types'],
    queryFn: () => getMaterialTypes({ page: 1, paginate: 100 }),
    enabled: isEdit,
  })

  const {
    data: materialConsumptionUnit,
    isFetching: isMaterialConsumptionUnitFetching,
  } = useQuery({
    queryKey: ['material-consumption-units'],
    queryFn: () =>
      getMaterialUnits({ page: 1, paginate: 100, type: 'consumption' }),
    enabled: isEdit,
  })

  const {
    data: materialDistributionUnit,
    isFetching: isMaterialDistributionUnitFetching,
  } = useQuery({
    queryKey: ['material-distribution-units'],
    queryFn: () =>
      getMaterialUnits({ page: 1, paginate: 100, type: 'distribution' }),
    enabled: isEdit,
  })
  const isFetching =
    isDetailFetching ||
    isManufacturerListFetching ||
    isMaterialConsumptionUnitFetching ||
    isMaterialDistributionUnitFetching ||
    isMaterialTypeFetching ||
    isMaterialRelationFetching

  return {
    materialRelation,
    materialType:
      materialType?.data.map((x) => ({ value: x.id, label: x.name })) || [],
    materialCompanion:
      programDataSource?.data?.map((x) => ({ value: x.id, label: x.name })) ||
      [],
    manufacturerSelection:
      manufacturerList?.data?.map((x) => ({ value: x.id, label: x.name })) ||
      [],
    materialConsumptionSelection: materialConsumptionUnit?.data?.map((x) => ({
      value: x.id,
      label: x.name,
    })),
    materialDistributionSelection: materialDistributionUnit?.data?.map((x) => ({
      value: x.id,
      label: x.name,
    })),
    isFetching,
    detailMaterial,
  }
}
