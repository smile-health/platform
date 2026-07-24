import React, { FC } from 'react'
import { parseAsString, useQueryStates } from 'nuqs'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import EntityDetailActivityImplementationTimeContent from './components/EntityDetailTabContents/EntityDetailActivityImplementationTimeContent'
import EntityDetailCustomerVendorContent from './components/EntityDetailTabContents/EntityDetailCustomerVendorContent'
import EntityDetailInformationContent from './components/EntityDetailTabContents/EntityDetailInformationContent'
import EntityDetailMaterialManagementContent from './components/EntityDetailTabContents/EntityDetailMaterialManagementContent'
import { useEntityDetail } from './hooks/useEntityDetail'

const EntityDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'entity-global-view' : 'entity-view')
  const { t } = useTranslation(['entity', 'user'])
  const { entity } = useEntityDetail({ isGlobal })
  const [query, setQuery] = useQueryStates({
    tab: parseAsString.withDefault('detail')
  }, { history: 'push' })

  const title = t('entity:detail.title')
  const titleMeta = isGlobal ? `Global ${title}` : title

  return (
    <AppLayout title={title}>
      <Meta title={`SMILE | ${titleMeta}`} />
      <div className="ui-w-[1200px] ui-mx-auto">
        {!isGlobal ? (
          <TabsRoot value={query.tab} variant="default" onValueChange={e => setQuery({ tab: e })}>
            <TabsList>
              <TabsTrigger value="detail">
                {t('entity:detail.tabs_title.detail')}
              </TabsTrigger>
              <TabsTrigger value="activity_implementation_time">
                {t('entity:detail.tabs_title.activity_implementation_time')}
              </TabsTrigger>
              <TabsTrigger value="customer_vendor">
                {t('entity:detail.tabs_title.customer_vendor')}
              </TabsTrigger>
              <TabsTrigger value="entity_material_activity_relatiion">
                {t(
                  'entity:detail.tabs_title.entity_material_activity_relation'
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              <EntityDetailInformationContent entity={entity} />
            </TabsContent>
            <TabsContent value="activity_implementation_time">
              <EntityDetailActivityImplementationTimeContent entity={entity} />
            </TabsContent>
            <TabsContent value="customer_vendor">
              <EntityDetailCustomerVendorContent entity={entity} />
            </TabsContent>
            <TabsContent value="entity_material_activity_relatiion">
              <EntityDetailMaterialManagementContent entity={entity} />
            </TabsContent>
          </TabsRoot>
        ) : (
          <EntityDetailInformationContent isGlobal={isGlobal} entity={entity} />
        )}
      </div>
    </AppLayout>
  )
}

export default EntityDetailPage
