'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

import AuditTrailListPage from '../../audit-trail/AuditTrailListPage'
import GlobalSettings from '../GlobalSettings'

const GlobalSettingAuditTrailListPage = () => {
  const { t } = useTranslation('auditTrail')

  return (
    <GlobalSettings title={t('title.index')} showButtonCreate={false}>
      <AuditTrailListPage />
    </GlobalSettings>
  )
}

export default GlobalSettingAuditTrailListPage
