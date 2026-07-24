import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Radio } from '#components/radio'
import { Stock } from '#types/stock'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listStock } from '../reconciliation-create.services'
import { ReconciliationCreateForm } from '../reconciliation-create.type'
import { useModalWarningItemStore } from '../store/modal-warning.store'

export const useMaterialSelect = ({ search }: { search: string }) => {
  const { t } = useTranslation('reconciliation')
  const { watch, setValue } = useFormContext<ReconciliationCreateForm>()
  const { entity, material, activity, opname_stock_items } = watch()
  const { setModalRemove, setCustomFunction, setContent } =
    useModalWarningItemStore()
  const checkStatusMaterial = (item: Stock) => {
    const selectedMaterialId = material?.id
    const materialId = item?.material?.id
    if (selectedMaterialId === materialId) {
      return 'ui-bg-primary-100'
    }
    return ''
  }

  const handleChangeMaterial = (
    value: {
      id?: number
      name?: string
    } | null
  ) => {
    if (opname_stock_items?.length > 0) {
      setContent({
        title: t('create.change_dialog.question_material'),
        description: t('create.change_dialog.description'),
      })
      setModalRemove(true)
      setCustomFunction(() => {
        setValue('material', value)
        setValue('opname_stock_items', [])
      })
    } else {
      setValue('material', value)
    }
  }

  const generateSchema: Array<ColumnDef<Stock>> = [
    {
      accessorKey: 'material.name',
      header: t('create.material_name'),
      meta: {
        cellClassName: ({ original }) => checkStatusMaterial(original),
      },
    },
    {
      accessorKey: 'material',
      header: () => (
        <div className="ui-text-center">{t('create.selection')}</div>
      ),
      size: 88,
      meta: {
        cellClassName: ({ original }: any) => checkStatusMaterial(original),
      },
      cell: ({ row }) => {
        return (
          <div className="ui-text-center">
            <Radio
              id="radio-material-reconciliation"
              value={row.original.material?.id}
              checked={Number(row.original.material?.id) === material?.id}
              onChange={() =>
                handleChangeMaterial({
                  id: row.original.material?.id,
                  name: row.original.material?.name,
                })
              }
            />
          </div>
        )
      },
    },
  ]

  const queryKey = [
    'infinite-scroll-list',
    'list-stock',
    {
      search,
      entity: entity?.value,
      activity: activity?.value,
    },
  ]
  const isEnabledFetching = Boolean(entity?.value && activity?.value)
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      listStock({
        page: pageParam,
        paginate: 10,
        keyword: search,
        material_level_id: 3,
        activity_id: activity?.value,
        entity_id: entity?.value,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page + 1,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: isEnabledFetching,
  })

  const handleTitle = () =>
    entity?.label
      ? t('create.title_material_select', {
          entity_name: entity.label.toUpperCase(),
        })
      : 'Material'

  const stocks = isEnabledFetching
    ? data?.pages.map((page) => page.data).flat()
    : []

  return {
    handleTitle,
    generateSchema,
    stocks,
    fetchNextPage,
    hasNextPage,
    isFetching,
    checkStatusMaterial,
    setValue,
    handleChangeMaterial,
  }
}
