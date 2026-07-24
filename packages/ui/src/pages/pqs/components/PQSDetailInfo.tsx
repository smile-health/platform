import { Fragment } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { PQSDetailInfoProps } from '../pqs.types'
import { generateDetail, generateDetailCapacity } from '../utils/helper'
import PQSSkeleton from './PQSSkeleton'

export default function PQSDetailInfo(props: Readonly<PQSDetailInfoProps>) {
  const { isLoading, data } = props
  const {
    t,
    i18n: { language },
  } = useTranslation(['pqs', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  if (isLoading) {
    return <PQSSkeleton />
  }

  const section = [
    {
      id: 'detail',
      title: t('pqs:detail.section.detail.header'),
      data: generateDetail(t, data),
    },
    {
      id: 'capacity',
      title: t('pqs:detail.section.capacity.header'),
      data: generateDetailCapacity(t, language, data),
    },
  ]

  const getEditUrl = () => {
    return getAsLinkGlobal(
      `/v5/global-settings/asset/pqs/${data?.id}/edit`,
      null,
      {
        fromPage: 'detail',
      }
    )
  }

  const formatTwoDecimals = (val: any) => {
    if (val === null || val === undefined) return '-'
    const num =
      typeof val === 'number' ? val : Number(String(val).replace(',', '.'))
    return Number.isFinite(num) ? num.toFixed(2) : String(val)
  }

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      {section.map((item) => (
        <Fragment key={item.id}>
          <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
            <Exists useIt={item?.data.some((row) => row?.value)}>
              <h5 className="ui-font-bold">{item.title}</h5>
            </Exists>
            <Exists useIt={item.id === 'detail'}>
              <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
                <Button
                  asChild
                  id={`btn-link-material-volume-edit-${item.id}`}
                  variant="outline"
                  onClick={() => {}}
                >
                  <Link href={getEditUrl()}>{t('common:edit')}</Link>
                </Button>
              </div>
            </Exists>
          </div>
          {item.id === 'detail' ? (
            <Fragment>
              <RenderDetailValue data={item.data} />
              <Exists useIt={item?.data.some((row) => !row?.value)}>
                <hr className="ui-border-neutral-300" />
              </Exists>
            </Fragment>
          ) : (
            <Exists useIt={item?.data.some((row) => row?.value)}>
              <Table
                rounded
                withBorder
                withColumnBorders={false}
                loading={isLoading}
                empty={!item?.data?.length}
              >
                <Thead>
                  <Tr>
                    <Th className="ui-font-semibold">
                      {t('pqs:detail.section.capacity.column.category')}
                    </Th>
                    <Th className="ui-font-semibold">
                      {t('pqs:detail.section.capacity.column.net_capacity')}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {item?.data?.map((row) => {
                    if (!row.value) {
                      return null
                    }
                    return (
                      <Tr key={row?.label}>
                        <Td>{row?.label}</Td>
                        <Td>{formatTwoDecimals(row?.value)}</Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Exists>
          )}
        </Fragment>
      ))}
    </div>
  )
}
