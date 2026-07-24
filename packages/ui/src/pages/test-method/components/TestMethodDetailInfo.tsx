import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { TestMethodResponse } from '../test-method.type'
import TestMethodSkeleton from './TestMethodSkeleton'

type TestMethodDetailInfoProps = {
  data?: TestMethodResponse
  isLoading?: boolean
}

// Map API operator to display symbol
const mapOperatorDisplay = (operator: string | null | undefined): string => {
  const mapping: Record<string, string> = {
    '<': '<',
    '>': '>',
    '<=': '≤',
    '>=': '≥',
    '=': '=',
    '!=': '≠',
  }
  return operator ? (mapping[operator] ?? operator) : '-'
}

// Map API validation_type to display label
const mapValidationTypeDisplay = (type: string | null | undefined): string => {
  if (type === 'range') return 'Range'
  if (type === 'comparison') return 'Perbandingan'
  if (type === 'options') return 'Options'
  return '-'
}

function TestMethodDetailInfo(props: Readonly<TestMethodDetailInfoProps>) {
  const { isLoading, data } = props
  const { t } = useTranslation(['testMethod', 'common'])
  const router = useSmileRouter()

  const detail = [
    {
      label: t('testMethod:form.name.label'),
      value: data?.name ?? '-',
    },
    {
      label: t('testMethod:form.quality_standard.label'),
      value: data?.quality_standard ?? '-',
    },
    {
      label: t('testMethod:form.deskripsi.label'),
      value: data?.deskripsi ?? '-',
    },
  ]

  // Build validation detail data based on validation type
  const validationData = (() => {
    const validation = data?.validation
    if (!validation) return []

    const items: { label: string; value: string }[] = [
      {
        label: t('testMethod:form.validation_type.label'),
        value: mapValidationTypeDisplay(validation.validation_type),
      },
    ]

    if (validation.validation_type === 'range') {
      items.push(
        { label: t('testMethod:form.min_value.label'), value: validation.min_value?.toString() ?? '-' },
        { label: t('testMethod:form.max_value.label'), value: validation.max_value?.toString() ?? '-' },
        { label: t('testMethod:form.allow_decimal.label'), value: validation.allow_decimal ? 'Ya' : 'Tidak' },
      )
    } else if (validation.validation_type === 'comparison') {
      items.push(
        { label: t('testMethod:form.operator.label'), value: mapOperatorDisplay(validation.comparison_operator) },
        { label: t('testMethod:form.comparison_value.label'), value: validation.comparison_value?.toString() ?? '-' },
        { label: t('testMethod:form.allow_decimal.label'), value: validation.allow_decimal ? 'Ya' : 'Tidak' },
      )
    } else if (validation.validation_type === 'options') {
      items.push({
        label: t('testMethod:form.options.label'),
        value: validation.options?.join(', ') ?? '-',
      })
    }

    return items
  })()

  if (isLoading) return <TestMethodSkeleton />
  return (
    <div className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto">
      <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4 ui-bg-white">
        <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
          <h5 className="ui-font-bold">{t('testMethod:title.information')}</h5>
          {!isViewOnly() && (
            <Button id="btn-link-edit" variant="outline" asChild size="sm">
              <Link href={router.getAsLink(`/v5/test-method/${data?.id}/edit`)}>
                {t('common:edit')}
              </Link>
            </Button>
          )}
        </div>
        <RenderDetailValue data={detail} />
      </div>

      {/* Validation Info */}
      {validationData.length > 0 && (
        <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4 ui-bg-white">
          <h5 className="ui-font-bold">{t('testMethod:title.validation')}</h5>
          <RenderDetailValue data={validationData} />
        </div>
      )}
    </div>
  )
}

export default TestMethodDetailInfo
