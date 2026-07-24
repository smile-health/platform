import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'

import { hasPermission } from "#shared/permission/index"
import { getUserStorage } from "#utils/storage/user"
import { getProgramStorage } from "#utils/storage/program"
import { StockOpnameCreateForm } from '../types'
import { defaultValuesForm, formSchema } from '../schemas/stockOpnameFormSchema'

type Props = {
  t: TFunction<['common', 'stockOpnameCreate']>
}

export const useStockOpnameCreateFormControl = ({ t }: Props) => {
  const user = getUserStorage()
  const program = getProgramStorage()
  const isHierarchical = getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const isNotAdmin = hasPermission('stock-opname-entity-create')

  const defaultValueEntity = useMemo(() => isNotAdmin ? [{ label: user?.entity.name ?? '', value: program?.entity_id }] : null, [user?.entity, program]);

  const methods = useForm<StockOpnameCreateForm>({
    resolver: yupResolver(formSchema(t)),
    defaultValues: {
      ...defaultValuesForm,
      ...defaultValueEntity && {
        entity: defaultValueEntity[0],
      }
    },
    mode: 'onChange',
  })

  return {
    methods,
    isNotAdmin,
    isHierarchical,
  }
}