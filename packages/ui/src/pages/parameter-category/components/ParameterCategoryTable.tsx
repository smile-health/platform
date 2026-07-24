import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { updateParameterCategoryStatus } from '../parameter-category.service'
import { ParameterCategoryTableProps } from '../parameter-category.type'

export default function ParameterCategoryTable({
  data,
  isLoading,
  page,
  size,
}: Readonly<ParameterCategoryTableProps>) {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation(['common', 'parameterCategory'])
  const [openModalStatus, setOpenModalStatus] = useState(false)
  const [selected, setSelected] = useState<{ id: number; status: 0 | 1 } | null>(
    null
  )

  const { mutate: onToggleStatus, isPending: isLoadingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 0 | 1 }) =>
      updateParameterCategoryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameter-categories'] })
      toast.success({
        description: t('common:message.success.update_status', {
          type: t('parameterCategory:title.detail')?.toLowerCase(),
        }),
      })
      setOpenModalStatus(false)
      setSelected(null)
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.update_status', {
          type: t('parameterCategory:title.detail')?.toLowerCase(),
        }),
      })
    },
  })

  return (
    <div className="ui-space-y-6">
      <ModalConfirmation
        open={openModalStatus}
        setOpen={setOpenModalStatus}
        description={t('common:message.confirm.delete')}
        onSubmit={() => {
          if (selected)
            onToggleStatus({
              id: selected.id,
              status: selected.status === 1 ? 0 : 1,
            })
        }}
        isLoading={isLoadingStatus}
        type={selected?.status === 1 ? 'delete' : 'update'}
        buttonTitle={
          selected?.status === 1
            ? t('common:status.deactivate')
            : t('common:status.activate')
        }
      />
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        loading={isLoading}
        empty={!data?.length}
        verticalAlignment="center"
      >
        <Thead>
          <Tr>
            <Th columnKey="no" className="ui-w-16 ui-font-semibold">
              No.
            </Th>
            <Th columnKey="name" className="ui-font-semibold">
              {t('parameterCategory:table.name')}
            </Th>
            <Th columnKey="analysis_parameters" className="ui-font-semibold">
              {t('parameterCategory:table.analysis_parameters')}
            </Th>
            <Th columnKey="id" className="ui-w-40 ui-font-semibold ui-pl-5">
              {t('common:action')}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((item, index) => (
            <Tr key={item?.id}>
              <Td id="cell-no">{(page - 1) * size + (index + 1)}</Td>
              <Td id="cell-name">{item?.name}</Td>
              <Td id="cell-analysis-parameters">
                <div className="ui-max-w-[300px] ui-truncate" title={formatAnalysisParameters(item?.analysis_parameters)}>
                  {formatAnalysisParameters(item?.analysis_parameters)}
                </div>
              </Td>
              <Td id="cell-action">
                <div className="ui-flex ui-gap-2">
                  <Button
                    asChild
                    id="btn-link-parameter-category-detail"
                    size="sm"
                    variant="subtle"
                  >
                    <Link
                      href={router.getAsLink(
                        `/v5/parameter-category/${item?.id}`
                      )}
                    >
                      Detail
                    </Link>
                  </Button>
                  {!isViewOnly() && (
                    <>
                      <Button
                        asChild
                        id="btn-link-parameter-category-edit"
                        size="sm"
                        variant="subtle"
                      >
                        <Link
                          href={router.getAsLink(
                            `/v5/parameter-category/${item?.id}/edit`
                          )}
                        >
                          {t('common:edit')}
                        </Link>
                      </Button>
                      <Button
                        id="btn-toggle-status-parameter-category"
                        size="sm"
                        variant="subtle"
                        color={item?.status === 1 ? 'danger' : 'primary'}
                        disabled={isLoadingStatus}
                        onClick={() => {
                          setSelected({
                            id: item?.id,
                            status: (item?.status ?? 1) as 0 | 1,
                          })
                          setOpenModalStatus(true)
                        }}
                      >
                        {item?.status === 1
                          ? t('common:status.deactivate')
                          : t('common:status.activate')}
                      </Button>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
    </div>
  )
}

const formatAnalysisParameters = (params?: any[]) => {
  if (!params || params.length === 0) return '-'
  return params
    .map((p) => {
      const paramName = p.parameter_name ?? p.env_analysis_parameter?.name
      const methodName = p.test_methods?.map((m: any) => m.name).join(', ') || p.test_method_name
      return methodName ? `${paramName} (${methodName})` : paramName
    })
    .filter(Boolean)
    .join(', ')
}
