'use client'

import React, { FC } from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import SmileAuditTrailPanel from './components/SmileAuditTrailPanel'
import WasteBagAuditTrailPanel from './components/WasteBagAuditTrailPanel'

const AuditTrailListPage: FC = (): JSX.Element => {
  usePermission('audit-trail-view')
  const { t } = useTranslation(['common', 'auditTrail'])

  return (
    <Container title={t('auditTrail:title.index')} hideTabs>
      <Meta title={generateMetaTitle(t('auditTrail:title.index'))} />

      <TabsRoot defaultValue="smile">
        <TabsList>
          <TabsTrigger value="smile">{t('auditTrail:tab.smile')}</TabsTrigger>
          <TabsTrigger value="wms">{t('auditTrail:tab.wms')}</TabsTrigger>
        </TabsList>
        <TabsContent value="smile">
          <SmileAuditTrailPanel />
        </TabsContent>
        <TabsContent value="wms">
          <WasteBagAuditTrailPanel />
        </TabsContent>
      </TabsRoot>
    </Container>
  )
}

export default AuditTrailListPage
