import Link from 'next/link'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import useSmileRouter from '#hooks/useSmileRouter'
import { ActivityData } from '#types/activity'
import { CommonType } from '#types/common'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

type ActivityTableProps = CommonType & {
  data?: ActivityData[]
  isLoading?: boolean
  size: number
  page: number
}

export default function ActivityTable(props: ActivityTableProps) {
  const { data, isLoading, page, size } = props

  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'activity'])

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
            <Th columnKey="no" className="ui-w-20 ui-font-semibold">
              No.
            </Th>
            <Th columnKey="name" className="ui-font-semibold">
              {t('activity:column.name')}
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
                <Td id="cell-action">
                  <div className="ui-flex ui-gap-2">
                    <Button
                      asChild
                      id="btn-link-budget-source-detail"
                      size="sm"
                      variant="subtle"
                    >
                      <Link href={router.getAsLink(`/v5/activity/${item?.id}`)}>
                        Detail
                      </Link>
                    </Button>
                    {!isViewOnly() && (
                      <Button
                        asChild
                        id="btn-link-budget-source-edit"
                        size="sm"
                        variant="subtle"
                      >
                        <Link
                          href={router.getAsLink(
                            `/v5/activity/${item?.id}/edit`
                          )}
                        >
                          {t('common:edit')}
                        </Link>
                      </Button>
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
