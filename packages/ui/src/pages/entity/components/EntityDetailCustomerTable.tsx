import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { toast } from '#components/toast'
import {
  deleteEntityCustomers,
  GetEntityCustomersResponse,
  GetEntityVendorsResponse,
} from '#services/entity'
import { useTranslation } from 'react-i18next'

import { DataTable } from '../../../components/data-table/DataTable'
import { IS_CONSUMPTION } from '../utils/constants'
import EntityDetailCustomerVendorContext from '../utils/entity-detail-customer-vendor-context'
import { entityCustomerConsumptionType } from '../utils/helper'
import EntityDetailCustomerFilter from './EntityDetailCustomerFilter'
import { columnCustomer, columnVendor } from './EntityDetailCustomerVendorTable'

interface Props {
  title: string
  dataFetched: GetEntityCustomersResponse | GetEntityVendorsResponse
  isLoading: boolean
  exportClickFunction?: <isConsumption extends IS_CONSUMPTION>(
    isConsumption: isConsumption
  ) => void
  dataKey: string
}

const EntityDetailCustomerTable: React.FC<Props> = ({
  title,
  dataFetched,
  isLoading,
  exportClickFunction = () => {},
  dataKey = 'customer_consumption',
}) => {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation(['entity', 'common'])
  const [deleteItem, setDeleteItem] = useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [deleteCustomerIds, setDeleteCustomerIds] = useState<number[]>([])
  const { payload, setPayload, handleOpenModal, isViewOnly, entity } =
    useContext(EntityDetailCustomerVendorContext)

  const isConsumption =
    dataKey === 'customer_consumption'
      ? IS_CONSUMPTION.TRUE
      : IS_CONSUMPTION.FALSE

  const queryClient = useQueryClient()
  const { mutate: mutateCustomerDeletion, isPending: deletingCustomer } =
    useMutation({
      mutationFn: (customer_ids: number[]) =>
        deleteEntityCustomers(id as string, customer_ids),
      onSuccess: () => {
        toast.success({
          description: t('entity:form.success.success_delete_customer'),
        })
        setSelectedRows([])
        setDeleteItem(false)
        queryClient.invalidateQueries({
          queryKey: [
            isConsumption === IS_CONSUMPTION.TRUE
              ? 'entity__customer_consumption'
              : 'entity__customer_distribution',
          ],
        })
      },
      onError: (err) => toast.danger({ description: err.message }),
    })

  const handleOpenDeleteModal = (id: string) => {
    setDeleteCustomerIds(id?.split(',')?.map(Number))
    setDeleteItem(true)
  }

  const onSizeChange = (paginate: number) =>
    setPayload({
      ...payload,
      [dataKey]: {
        ...payload?.[dataKey],
        paginate,
        page: 1,
      },
    })
  const onPageChange = (page: number) =>
    setPayload({
      ...payload,
      [dataKey]: {
        ...payload?.[dataKey],
        page,
      },
    })

  const columns = ['customer_consumption', 'customer_distribution'].includes(
    dataKey
  )
    ? columnCustomer({
        t,
        selectedRows,
        setSelectedRows,
        deletingCustomer,
        handleOpenModal,
        handleOpenDeleteModal,
        isConsumption,
        isViewOnly,
        entity: entity || null,
      })
    : columnVendor({
        t,
        selectedRows,
        setSelectedRows,
        deletingCustomer,
        handleOpenDeleteModal,
        isConsumption,
      })

  return (
    <>
      <ModalConfirmation
        open={deleteItem}
        setOpen={setDeleteItem}
        description={t('entity:detail.customer_vendor.delete_confirmation')}
        type="delete"
        onSubmit={() => mutateCustomerDeletion(deleteCustomerIds)}
      />

      <div className="ui-p-4 ui-mt-6 ui-border ui-rounded ui-border-neutral-300">
        <div className="ui-flex ui-justify-between ui-items-center">
          <p className="ui-mb-4 ui-font-bold ui-w-auto">{title}</p>
          <EntityDetailCustomerFilter
            buttonTitle={t('entity:detail.customer_vendor.customer_add', {
              type: entityCustomerConsumptionType(t, isConsumption),
            })}
            buttonLoading={deletingCustomer}
            handleOpenDeleteModal={() =>
              handleOpenDeleteModal(selectedRows.join(','))
            }
            onSearch={(e) => {
              setPayload({
                ...payload,
                [dataKey]: {
                  ...payload?.[dataKey],
                  keyword: e.target.value,
                  page: 1,
                },
              })
            }}
            selectedRows={selectedRows}
            exportClickFunction={() => {
              exportClickFunction(isConsumption)
            }}
            dataKey={dataKey}
          />
        </div>
        <DataTable
          data={dataFetched?.data}
          columns={columns}
          isLoading={isLoading}
        />
        {dataFetched?.data.length > 0 ? (
          <div className="ui-mt-4">
            <PaginationContainer>
              <PaginationSelectLimit
                onChange={onSizeChange}
                size={dataFetched?.item_per_page}
                perPagesOptions={dataFetched?.list_pagination}
              />
              <PaginationInfo
                currentPage={dataFetched?.page}
                size={dataFetched?.total_item}
                total={dataFetched?.total_item}
              />
              <Pagination
                totalPages={dataFetched?.total_page}
                onPageChange={onPageChange}
                currentPage={dataFetched?.page}
              />
            </PaginationContainer>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default EntityDetailCustomerTable
