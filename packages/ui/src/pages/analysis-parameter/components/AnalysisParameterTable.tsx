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

import { deleteAnalysisParameter } from '../analysis-parameter.service'
import { AnalysisParameterTableProps } from '../analysis-parameter.type'

export default function AnalysisParameterTable({
  data,
  isLoading,
  page,
  size,
}: Readonly<AnalysisParameterTableProps>) {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation(['common', 'analysisParameter'])
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { mutate: onDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: (id: number) => deleteAnalysisParameter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-parameters'] })
      toast.success({
        description: t('analysisParameter:message.delete_success'),
      })
      setOpenModalDelete(false)
      setSelectedId(null)
    },
    onError: () => {
      toast.danger({
        description: t('common:message.failed.delete', {
          type: t('analysisParameter:title.detail')?.toLowerCase(),
        }),
      })
    },
  })

  return (
    <div className="ui-space-y-6">
      <ModalConfirmation
        open={openModalDelete}
        setOpen={setOpenModalDelete}
        description={t('common:message.confirm.delete')}
        onSubmit={() => {
          if (selectedId) onDelete(selectedId)
        }}
        type="delete"
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
              {t('analysisParameter:table.name')}
            </Th>
            <Th columnKey="unit" className="ui-font-semibold">
              {t('analysisParameter:table.unit')}
            </Th>
            <Th columnKey="id" className="ui-w-40 ui-font-semibold ui-pl-5">
              {t('common:action')}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((item, index) => {
            return (
              <Tr key={item?.id}>
                <Td id="cell-no">{(page - 1) * size + (index + 1)}</Td>
                <Td id="cell-name">{item?.name}</Td>
                <Td id="cell-unit">{item?.unit ?? '-'}</Td>
                <Td id="cell-action">
                  <div className="ui-flex ui-gap-2">
                    <Button
                      asChild
                      id="btn-link-analysis-parameter-detail"
                      size="sm"
                      variant="subtle"
                    >
                      <Link
                        href={router.getAsLink(
                          `/v5/analysis-parameter/${item?.id}`
                        )}
                      >
                        Detail
                      </Link>
                    </Button>
                    {!isViewOnly() && (
                      <>
                        <Button
                          asChild
                          id="btn-link-analysis-parameter-edit"
                          size="sm"
                          variant="subtle"
                        >
                          <Link
                            href={router.getAsLink(
                              `/v5/analysis-parameter/${item?.id}/edit`
                            )}
                          >
                            {t('common:edit')}
                          </Link>
                        </Button>
                        <Button
                          id="btn-delete-analysis-parameter"
                          size="sm"
                          variant="subtle"
                          color="danger"
                          disabled={isLoadingDelete}
                          onClick={() => {
                            setSelectedId(item?.id)
                            setOpenModalDelete(true)
                          }}
                        >
                          {t('common:status.deactivate')}
                        </Button>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            )
          })}
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
