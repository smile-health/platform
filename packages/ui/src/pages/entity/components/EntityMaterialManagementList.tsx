import { useEffect, useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { GetMaterialEntityResponse } from '#services/entity'
import { TMaterialEntity } from '#types/entity'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { combinedTextByDash } from '../utils/helper'
import EntityDetailModalMaterialOnActivities from './EntityDetailModalMaterialOnActivities'

interface Props {
  loading: boolean
  dataSource: GetMaterialEntityResponse | undefined
  handleChangePage: (e: number) => void
  handleChangeSize: (e: number) => void
}

const EntityMaterialManagementList: React.FC<Props> = ({
  loading,
  dataSource,
  handleChangePage,
  handleChangeSize,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['entity', 'common', 'material'])
  const dateFormat = process.env.DATE_FORMAT
  const [openMaterialActivityModal, setOpenMaterialActivityModal] =
    useState<boolean>(false)
  const [dataMaterialActivity, setDataMaterialActivity] =
    useState<TMaterialEntity>(null)

  const handleOpenMaterialActivityModal = (data: TMaterialEntity) => {
    setDataMaterialActivity(data)
    setOpenMaterialActivityModal(true)
  }

  useEffect(() => {
    if (dataMaterialActivity) {
      const updatedData = dataSource?.data?.find(
        (item) =>
          Number(item?.material_id) ===
          Number(dataMaterialActivity?.material_id)
      ) || { name: dataMaterialActivity?.name }
      setDataMaterialActivity(updatedData as TMaterialEntity)
    }
  }, [dataSource])

  return (
    <>
      <EntityDetailModalMaterialOnActivities
        open={openMaterialActivityModal}
        modalData={dataMaterialActivity}
        setModal={setOpenMaterialActivityModal}
        title={t(
          'entity:detail.material_entity.detail_of_material_on_activities'
        )}
      />
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        loading={loading}
        empty={dataSource?.data?.length === 0}
      >
        <Thead>
          <Tr>
            <Th columnKey="name" className="ui-font-semibold">
              {t('material:column.name', { defaultValue: 'Name' })}
            </Th>
            <Th columnKey="activity_name" className="ui-font-semibold">
              {t('entity:detail.customer_vendor.activity')}
            </Th>
            <Th columnKey="temperature_min" className="ui-font-semibold">
              {t('entity:detail.material_entity.temp_min')}
            </Th>
            <Th columnKey="temperature_max" className="ui-font-semibold">
              {t('entity:detail.material_entity.temp_max')}
            </Th>
            <Th columnKey="updated_by" className="ui-font-semibold">
              {t('common:updated_by')}
            </Th>
            <Th columnKey="action" className="ui-font-semibold ui-w-[140px]">
              {t('common:action')}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {dataSource?.data?.map((item, idx) => {
            return (
              <Tr key={idx?.toString()}>
                <Td>{item?.name}</Td>
                <Td>
                  {item?.entity_master_materials
                    ?.map((item) => item?.activity?.name)
                    ?.join(', ') ?? ''}
                </Td>
                <Td>{numberFormatter(item?.min_temperature, language)}</Td>
                <Td>{numberFormatter(item?.max_temperature, language)}</Td>
                <Td className="ui-capitalize">
                  {item?.entity_master_materials &&
                  item?.entity_master_materials.length > 0
                    ? combinedTextByDash({
                        text1: item?.entity_master_materials[0]?.updated_at
                          ? dayjs(
                              item?.entity_master_materials[0]?.updated_at
                            ).format(dateFormat)
                          : null,
                        text2:
                          item?.entity_master_materials[0]?.user_updated_by
                            ?.firstname ||
                          item?.entity_master_materials[0]?.user_updated_by
                            ?.lastname
                            ? `${item?.entity_master_materials[0]?.user_updated_by?.firstname ?? ''} ${item?.entity_master_materials[0]?.user_updated_by?.lastname ?? ''}`
                            : null,
                      })
                    : ''}
                </Td>
                <Td>
                  <div className="ui-flex ui-justify-start ui-items-center">
                    <Button
                      id={`view_details_${item?.material_id}`}
                      variant="light"
                      className="ui-bg-transparent ui-p-0 ui-h-auto ui-mr-[18px] ui-text-[#0069D2] hover:!ui-bg-transparent"
                      type="button"
                      onClick={() => handleOpenMaterialActivityModal(item)}
                    >
                      {t('entity:detail.material_entity.view_details')}
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
      {!!dataSource?.total_item && (
        <PaginationContainer className="ui-flex ui-justify-between ui-mt-6">
          <PaginationSelectLimit
            onChange={handleChangeSize}
            size={dataSource?.item_per_page}
            perPagesOptions={dataSource?.list_pagination}
          />
          <PaginationInfo
            currentPage={Number(dataSource.page)}
            size={dataSource?.item_per_page}
            total={dataSource?.total_item}
          />
          <Pagination
            totalPages={dataSource?.total_page}
            currentPage={Number(dataSource.page)}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      )}
    </>
  )
}

export default EntityMaterialManagementList
