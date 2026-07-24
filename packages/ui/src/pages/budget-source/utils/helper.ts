import { TFunction } from 'i18next'
import { CreateBudgetSourceBody, DetailBudgetSourceResponse } from '../budget-source.type'

export function handleDefaultValue(defaultValue?: CreateBudgetSourceBody) {
  return {
    name: defaultValue?.name ?? '',
    description: defaultValue?.description ?? null,
    program_ids: defaultValue?.program_ids ?? [],
    is_restricted: defaultValue?.is_restricted,
  }
}

export function generateDetail(t: TFunction<'budgetSource'>, detail?: DetailBudgetSourceResponse) {
  return [
    {
      label: t('form.detail.label.name'),
      value: detail?.name ?? '-',
    },
    {
      label: t('form.detail.label.description'),
      value: detail?.description ?? '-',
    },
    {
      label: t('form.detail.label.restricted_usage'),
      value: detail?.is_restricted ? t('yes') : t('no'),
    },
  ]
}
