'use client'

import React from 'react'
import { Alert } from '#components/alert'
import { useTranslation } from 'react-i18next'

type AuditTrailInfoProps = {
  variant?: 'smile' | 'wms'
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="ui-font-semibold">{title}</div>
      <ul className="ui-list-disc ui-space-y-0.5 ui-pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** Explains where audit data comes from and what it leaves out. */
export default function AuditTrailInfo({ variant = 'smile' }: AuditTrailInfoProps) {
  const { t } = useTranslation('auditTrail')
  const list = (key: 'info.source' | 'info.excluded') => {
    const value = t(key, { returnObjects: true }) as unknown
    return Array.isArray(value) ? (value as string[]) : []
  }

  if (variant === 'wms') {
    return (
      <Alert type="info" withIcon title={t('info.title')}>
        {t('info.wms')}
      </Alert>
    )
  }

  return (
    <Alert type="info" withIcon title={t('info.title')}>
      <div className="ui-space-y-2" data-testid="audit-trail-info">
        <InfoList title={t('info.source_title')} items={list('info.source')} />
        <InfoList
          title={t('info.excluded_title')}
          items={list('info.excluded')}
        />
      </div>
    </Alert>
  )
}
