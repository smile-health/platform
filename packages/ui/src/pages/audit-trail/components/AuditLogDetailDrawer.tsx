'use client'

import React from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { TAuditLog } from '#services/audit-log'
import { useTranslation } from 'react-i18next'

import { formatAuditDateTime } from '../audit-trail.helper'

type AuditLogDetailDrawerProps = {
  item: TAuditLog | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="ui-text-sm ui-font-medium ui-text-neutral-500">
        {label}
      </div>
      <div className="ui-break-all ui-font-semibold ui-text-primary-800">
        {value || '-'}
      </div>
    </div>
  )
}

export default function AuditLogDetailDrawer({
  item,
  onClose,
}: AuditLogDetailDrawerProps) {
  const { t } = useTranslation(['auditTrail', 'common'])

  return (
    <Drawer
      open={!!item}
      onOpenChange={(open) => !open && onClose()}
      placement="right"
      size="md"
    >
      <DrawerHeader title={t('auditTrail:detail.title')} />
      <DrawerContent>
        {item && (
          <div className="ui-space-y-4">
            <div className="ui-grid ui-grid-cols-2 ui-gap-4">
              <Field
                label={t('auditTrail:column.created_at')}
                value={formatAuditDateTime(item.created_at, 'DD/MM/YYYY HH:mm:ss')}
              />
              <Field label={t('auditTrail:column.actor')} value={item.actor_name} />
              <Field label={t('auditTrail:detail.role')} value={item.actor_role} />
              <Field label={t('auditTrail:column.service')} value={item.service} />
              <Field label={t('auditTrail:column.module')} value={item.module} />
              <Field label={t('auditTrail:column.action')} value={item.action} />
              <Field label={t('auditTrail:column.entity_id')} value={item.entity_id} />
              <Field label={t('auditTrail:detail.ip')} value={item.ip} />
            </div>
            <div>
              <div className="ui-mb-1 ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('auditTrail:detail.metadata')}
              </div>
              {item.metadata ? (
                <pre
                  data-testid="audit-log-metadata"
                  className="ui-max-h-[60vh] ui-overflow-auto ui-rounded ui-bg-neutral-100 ui-p-3 ui-text-xs"
                >
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              ) : (
                <p className="ui-text-sm ui-text-neutral-500">
                  {t('auditTrail:detail.no_metadata')}
                </p>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
      <DrawerFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t('common:close')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}
