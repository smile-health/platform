import { TOperatorThirdparty } from '@/types/partnership-operator';

export function handleDefaultValue(defaultValue?: TOperatorThirdparty | null) {
  const userOperatorValue = defaultValue as TOperatorThirdparty;

  return {
    operator:
      userOperatorValue != null || userOperatorValue != undefined
        ? {
            label: userOperatorValue?.operatorName || '',
            value: userOperatorValue?.operatorId || '',
          }
        : null,
    healthcare_facility:
      userOperatorValue != null || userOperatorValue != undefined
        ? {
            label: userOperatorValue?.consumerName || '',
            value: userOperatorValue?.partnershipId || '',
          }
        : null,
  };
}
