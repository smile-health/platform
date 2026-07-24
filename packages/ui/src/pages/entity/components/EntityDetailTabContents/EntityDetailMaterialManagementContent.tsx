import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import UpRight from '#components/icons/UpRight'
import { InputSearch } from '#components/input'
import { BOOLEAN } from '#constants/common'
import { useProgram } from '#hooks/program/useProgram'
import { useDebounce } from '#hooks/useDebounce'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { getMaterialEntity, ParamsMaterialEntity } from '#services/entity'
import { hasPermission } from '#shared/permission/index'
import { TDetailEntity } from '#types/entity'
import { useTranslation } from 'react-i18next'

import EntityDetailMaterialManagementContext from '../../utils/entity-detail-material-management-context'
import EntityDetailLabel from '../EntityDetailLabel'
import EntityDetailModalMaterialOnActivities from '../EntityDetailModalMaterialOnActivities'
import EntityMaterialManagementList from '../EntityMaterialManagementList'

type Props = {
  entity?: TDetailEntity
}

const EntityDetailMaterialManagementContent: React.FC<Props> = ({ entity }) => {
  const router = useSmileRouter()
  const { id } = router.query
  const { activeProgram } = useProgram()
  const [params, setParams] = useState<ParamsMaterialEntity>({
    page: 1,
    paginate: 10,
  })
  const [addModal, setAddModal] = useState<boolean>(false)
  const { t } = useTranslation(['entity', 'common', 'material'])

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({
      ...prev,
      keyword: e.target.value,
      page: 1,
    }))
  }

  const debouncedSearch = useDebounce(params.keyword, 500)

  const { data: dataSource, isLoading } = useQuery({
    queryKey: ['material__entity', { ...params, keyword: debouncedSearch, id }],
    queryFn: () =>
      getMaterialEntity(id as string, { ...params, keyword: debouncedSearch }),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })

  useSetLoadingPopupStore(isLoading)

  const contextValue = useMemo(
    () => ({ entity, params, keyword: debouncedSearch }),
    [entity, params, debouncedSearch]
  )

  return (
    <EntityDetailMaterialManagementContext.Provider value={contextValue}>
      <EntityDetailModalMaterialOnActivities
        open={addModal}
        modalData={null}
        setModal={setAddModal}
        title={t('entity:detail.material_entity.add_relation')}
        createMode={true}
        programData={activeProgram}
      />
      <EntityDetailLabel
        title={t('entity:list.column.name')}
        subTitle={entity?.name}
      />

      <div className="ui-flex ui-justify-between ui-items-center ui-mb-[24px] ui-mt-[16px]">
        <div className="ui-flex ui-gap-3">
          <h5 className="ui-font-bold ui-leading-[28px] ui-text-[20px]">
            {t('entity:detail.material_entity.title')}
          </h5>
          {hasPermission('entity-mutate') && (
            <Button
              id="go_to_material_bulk"
              size="sm"
              variant="subtle"
              leftIcon={<UpRight />}
              className="ui-text-sm"
              asChild
            >
              <Link href={router.getAsLink('/v5/entity-material-bulk')}>
                {t('entity:detail.material_entity.go_to_material_bulk')}
              </Link>
            </Button>
          )}
        </div>
        <div className="ui-flex ui-justify-end ui-items-center">
          <div className="ui-mr-[18px] ui-w-[378.67px]">
            <InputSearch
              id="search_material_entity"
              placeholder={`${t('common:search')} ${t('material:form.material_name.label')?.toLowerCase()}`}
              onChange={onSearch}
            />
          </div>
          {hasPermission('entity-mutate') && (
            <Button
              id="add_material_entity"
              onClick={() => setAddModal(true)}
              disabled={entity?.status === BOOLEAN.FALSE}
              type="button"
              variant="solid"
            >
              <div className="ui-flex ui-justify-center ui-items-center">
                <div className="ui-mr-[4.16px]">
                  <Plus />
                </div>
                {t('entity:detail.material_entity.add_relation')}
              </div>
            </Button>
          )}
        </div>
      </div>
      <EntityMaterialManagementList
        handleChangePage={(e) => setParams((prev) => ({ ...prev, page: e }))}
        handleChangeSize={(e) =>
          setParams((prev) => ({ ...prev, paginate: e, page: 1 }))
        }
        loading={isLoading}
        dataSource={dataSource}
      />
    </EntityDetailMaterialManagementContext.Provider>
  )
}

export default EntityDetailMaterialManagementContent
