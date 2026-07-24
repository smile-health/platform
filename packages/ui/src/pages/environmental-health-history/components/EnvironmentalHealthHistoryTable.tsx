import Link from 'next/link'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import useSmileRouter from '#hooks/useSmileRouter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { EnvironmentalHealthHistoryTableProps } from '../environmental-health-history.type'

export default function EnvironmentalHealthHistoryTable({
  data,
  isLoading,
  page,
  size,
}: Readonly<EnvironmentalHealthHistoryTableProps>) {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'environmentalHealthHistory'])

  const getStatusLabel = (status: string | null) => {
    if (!status) return '-'
    if (status === 'completed') return t('environmentalHealthHistory:filter.status_completed')
    if (status === 'pending') return t('environmentalHealthHistory:filter.status_pending')
    return status
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return dayjs(date).format('DD MMM YYYY, HH:mm')
  }

  return (
    <div className="ui-space-y-6">
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
            <Th columnKey="entity_name" className="ui-font-semibold">
              {t('environmentalHealthHistory:table.entity_name')}
            </Th>
            <Th columnKey="sample_id" className="ui-font-semibold">
              {t('environmentalHealthHistory:table.sample_id')}
            </Th>
            <Th columnKey="parameter_category" className="ui-font-semibold">
              {t('environmentalHealthHistory:table.parameter_category')}
            </Th>
            <Th columnKey="status" className="ui-font-semibold">
              {t('environmentalHealthHistory:table.status')}
            </Th>
            <Th columnKey="created_at" className="ui-font-semibold">
              {t('environmentalHealthHistory:table.created_at')}
            </Th>
            <Th columnKey="id" className="ui-w-32 ui-font-semibold ui-pl-5">
              {t('common:action')}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((item, index) => {
            return (
              <Tr key={item?.id}>
                <Td id="cell-no">{(page - 1) * size + (index + 1)}</Td>
                <Td id="cell-entity-name">{item?.entity_name ?? '-'}</Td>
                <Td id="cell-sample-id">{item?.sample_id ?? '-'}</Td>
                <Td id="cell-parameter-category">
                  {item?.parameter_category_name ?? '-'}
                </Td>
                <Td id="cell-status">
                  <span
                    className={`ui-inline-flex ui-items-center ui-px-2.5 ui-py-0.5 ui-rounded-full ui-text-xs ui-font-medium ${
                      item?.lab_result_status === 'completed'
                        ? 'ui-bg-green-100 ui-text-green-800'
                        : 'ui-bg-yellow-100 ui-text-yellow-800'
                    }`}
                  >
                    {getStatusLabel(item?.lab_result_status)}
                  </span>
                </Td>
                <Td id="cell-created-at">
                  {formatDate(item?.created_at)}
                </Td>
                <Td id="cell-action">
                  <div className="ui-flex ui-gap-2">
                    <Button
                      asChild
                      id="btn-link-history-detail"
                      size="sm"
                      variant="subtle"
                    >
                      <Link
                        href={router.getAsLink(
                          `/v5/environmental-health-history/${item?.id}`
                        )}
                      >
                        {t('common:detail')}
                      </Link>
                    </Button>
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
