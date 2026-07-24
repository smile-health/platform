import React, { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import {
  TBmhpApprovalItem,
  TBmhpProvinceApprovalItem,
} from '../libs/bmhp-approval-list.type'
import {
  getBmhpApprovalListTableColumn,
  getBmhpProvinceApprovalListTableColumn,
} from './BmhpApprovalListTableColumn'

type Props = {
  data: TBmhpApprovalItem[] | TBmhpProvinceApprovalItem[]
  page: number
  pageSize: number
  isLoading?: boolean
  isProvinceUser?: boolean
}

const BmhpApprovalTable: React.FC<Props> = ({
  data,
  page,
  pageSize,
  isLoading,
  isProvinceUser,
}) => {
  const { t, i18n } = useTranslation(['common', 'bmhpPlanning', 'bmhpApproval'])

  // Inject si_no (row number) relative to current page if not province (where 'no' comes from API)
  const items = useMemo(() => {
    if (isProvinceUser) return data as TBmhpProvinceApprovalItem[]
    return (data as TBmhpApprovalItem[]).map((item, index) => ({
      ...item,
      si_no: (page - 1) * pageSize + index + 1,
    }))
  }, [data, page, pageSize, isProvinceUser])

  const columns = useMemo(() => {
    const mainColumnProps = {
      t: t as TFunction<['common', 'bmhpPlanning', 'bmhpApproval']>,
      locale: i18n.language,
    }
    return isProvinceUser
      ? getBmhpProvinceApprovalListTableColumn(mainColumnProps)
      : getBmhpApprovalListTableColumn(mainColumnProps)
  }, [t, i18n.language, isProvinceUser])

  return (
    <DataTable
      id="bmhp_approval_list_table"
      data={items}
      columns={columns as any}
      isLoading={isLoading}
      isSticky
    />
  )
}

export default BmhpApprovalTable
