import { UseFilter } from '#components/filter'
import { useProgram } from '#hooks/program/useProgram'
import { loadEntities } from '#services/entity'
import { loadProvinces } from '#services/location'
import { loadMaterial } from '#services/material'
import { TFunction } from 'i18next'

import { loadContractNumbers } from '../../../../order/OrderCreateCentralDistribution/order-create-central-distribution.service'

export default function annualCommitmentListFilterSchema(
  t: TFunction<['common', 'annualCommitmentList']>
) {
  const { activeProgram } = useProgram()
  const generatedYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const startYear = 1990
    const options = []
    for (let i = currentYear; i >= startYear; i--) {
      options.push({ value: i, label: i.toString() })
    }
    return options
  }

  return [
    {
      id: 'select-contract-number',
      type: 'select-async-paginate',
      name: 'contract_number',
      label: t('annualCommitmentList:field.contract_number.label'),
      placeholder: t('annualCommitmentList:field.contract_number.placeholder'),
      loadOptions: loadContractNumbers,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'input-year',
      type: 'select',
      name: 'year',
      label: t('annualCommitmentList:field.year.label'),
      placeholder: t('annualCommitmentList:field.year.placeholder'),
      options: generatedYearOptions(),
      defaultValue: null,
    },
    {
      id: 'select-material-name',
      type: 'select-async-paginate',
      name: 'material',
      label: t('annualCommitmentList:field.materialName.label'),
      placeholder: t('annualCommitmentList:field.materialName.placeholder'),
      loadOptions: loadMaterial,
      additional: {
        page: 1,
        program_id: activeProgram?.id,
        material_level_id: 3,
      },
      defaultValue: null,
    },
    {
      id: 'select-supplier',
      type: 'select-async-paginate',
      name: 'supplier',
      label: t('annualCommitmentList:field.supplier.label'),
      placeholder: t('annualCommitmentList:field.supplier.placeholder'),
      loadOptions: loadEntities,
      additional: {
        page: 1,
        isGlobal: false,
        entity_tag_ids: 1,
        is_vendor: 1,
      },
      defaultValue: null,
    },
    {
      id: 'select-province-receiver',
      type: 'select-async-paginate',
      name: 'province',
      label: t('annualCommitmentList:field.provinceReceiver.label'),
      placeholder: t('annualCommitmentList:field.provinceReceiver.placeholder'),
      loadOptions: loadProvinces,
      additional: { page: 1 },
      defaultValue: null,
    },
  ] satisfies UseFilter
}
