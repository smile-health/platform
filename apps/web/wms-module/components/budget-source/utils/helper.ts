import { TBudgetSource } from '@/types/budget-source';

export function handleDefaultValue(defaultValue?: TBudgetSource) {
  return {
    name: defaultValue?.name || '',
    description: defaultValue?.description || '',
  };
}
