import React, { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

import { TBmhpApprovalMinistryItem } from '../libs/bmhp-approval-ministry.type'
import { getBmhpApprovalMinistryTableColumn } from './BmhpApprovalMinistryTableColumn'

type Props = {
  data: TBmhpApprovalMinistryItem[]
  page: number
  pageSize: number
  isLoading?: boolean
  year?: string
  programPlanId?: number
}

const BmhpApprovalMinistryTable: React.FC<Props> = ({
  data,
  page,
  pageSize,
  isLoading,
  year,
  programPlanId,
}) => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])

  const dataWithNo = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        si_no: (page - 1) * pageSize + index + 1,
      })),
    [data, page, pageSize]
  )

  const columns = useMemo(
    () => {
      console.log('BmhpApprovalMinistryTable columns:', { year, programPlanId })
      return getBmhpApprovalMinistryTableColumn({ locale: i18n.language, t: t as TFunction<['bmhpApproval']>, year, programPlanId })
    },
    [i18n.language, t, year, programPlanId]
  )

  return (
    <DataTable
      id="bmhp_approval_ministry_table"
      data={dataWithNo}
      columns={columns}
      isLoading={isLoading}
      isSticky
    />
  )
}

export default BmhpApprovalMinistryTable
