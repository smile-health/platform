'use client'

import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { FormControl, FormLabel } from '#components/form-control'
import { Input } from '#components/input'
import { toast } from '#components/toast'
import {
  getAuditLogSettings,
  updateAuditLogSettings,
} from '#services/audit-log'
import { usePermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { RETENTION_DAYS_MAX, RETENTION_DAYS_MIN } from '../audit-trail.constants'

export const AUDIT_LOG_SETTINGS_KEY = ['audit-log-settings']

export default function RetentionSettingCard() {
  const { t } = useTranslation(['auditTrail', 'common'])
  const queryClient = useQueryClient()
  const isPermitted = usePermission('audit-trail-view')
  const [value, setValue] = useState('')

  const { data } = useQuery({
    queryKey: AUDIT_LOG_SETTINGS_KEY,
    queryFn: getAuditLogSettings,
    enabled: isPermitted,
  })

  useEffect(() => {
    if (data?.retention_days !== undefined) setValue(String(data.retention_days))
  }, [data?.retention_days])

  const days = Number(value)
  const isValid =
    value !== '' &&
    Number.isInteger(days) &&
    days >= RETENTION_DAYS_MIN &&
    days <= RETENTION_DAYS_MAX

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateAuditLogSettings({ retention_days: days }),
    onSuccess: () => {
      toast.success({
        description: t('auditTrail:retention.success'),
        id: 'audit-log-retention-success',
      })
      queryClient.invalidateQueries({ queryKey: AUDIT_LOG_SETTINGS_KEY })
    },
    onError: () => {
      toast.danger({
        description: t('auditTrail:retention.error'),
        id: 'audit-log-retention-error',
      })
    },
  })

  return (
    <div className="ui-mt-6 ui-rounded ui-border ui-border-neutral-200 ui-p-4">
      <h3 className="ui-text-base ui-font-semibold ui-text-primary-800">
        {t('auditTrail:retention.title')}
      </h3>
      <p className="ui-mb-3 ui-text-sm ui-text-neutral-500">
        {t('auditTrail:retention.description')}
      </p>
      <form
        className="ui-flex ui-items-end ui-gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) mutate()
        }}
      >
        <FormControl className="ui-w-48">
          <FormLabel htmlFor="audit-retention-days">
            {t('auditTrail:retention.label')}
          </FormLabel>
          <Input
            id="audit-retention-days"
            type="number"
            min={RETENTION_DAYS_MIN}
            max={RETENTION_DAYS_MAX}
            step={1}
            value={value}
            error={value !== '' && !isValid}
            onChange={(e) => setValue(e.target.value)}
          />
        </FormControl>
        <Button type="submit" disabled={!isValid} loading={isPending}>
          {t('auditTrail:retention.save')}
        </Button>
      </form>
      <p
        className={
          value !== '' && !isValid
            ? 'ui-mt-1 ui-text-sm ui-text-red-600'
            : 'ui-mt-1 ui-text-sm ui-text-neutral-500'
        }
      >
        {value !== '' && !isValid
          ? t('auditTrail:retention.invalid')
          : t('auditTrail:retention.hint')}
      </p>
    </div>
  )
}
