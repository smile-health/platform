import { TFunction } from 'i18next'

import { CopyItem } from './program-plan-form.type'

export enum PROGRAM_PLAN_APPROACH {
  VACCINATION = 1,
  SCREENING = 2,
}

export const COPY_ITEMS = ({
  t,
}: {
  t: TFunction<['common', 'programPlan']>
}): {
  key: CopyItem
  label: string
  dependsOn?: CopyItem
  removes?: CopyItem[]
}[] =>
  [
    {
      key: 'target_group' as const,
      label: t('programPlan:tabs.target_group'),
      removes: ['task', 'material_ratio', 'material_substitution'] as const,
    },
    {
      key: 'task' as const,
      label: t('programPlan:tabs.task'),
      dependsOn: 'target_group' as const,
      removes: ['material_ratio', 'material_substitution'] as const,
    },
    {
      key: 'material_ratio' as const,
      label: t('programPlan:tabs.material_ratio'),
      dependsOn: 'task' as const,
    },
    {
      key: 'material_substitution' as const,
      label: t('programPlan:tabs.material_substitution'),
      dependsOn: 'task' as const,
    },
  ] as const
