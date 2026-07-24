import { OptionType } from "#components/react-select";
import { TFunction } from "i18next";

export enum AnnualPlanningProcessStatus {
  NEW = 0,
  APPROVED = 1,
  DESK = 2,
  DRAFT = 3,
  REVISION = 4,
}

export enum ProcessStatus {
  APPROVED = 1,
  REJECT = 0,
}

export enum MinMaxStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum MinMaxStatusProvinceRegency {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum MaterialSubType {
  VACCINE = 1,
  DILUENT = 2,
}

export const formStepper = {
  STEP_4: [
    { key: 'step_1' },
    { key: 'step_2' },
    { key: 'step_3' },
    { key: 'step_4' },
  ],
  STEP_3: [
    { key: 'step_1' },
    { key: 'step_2' },
    { key: 'step_3' },
  ],
}

export const formStepperName = {
  PROVINCE: {
    POPULATION_CORRECTION: 0,
    USAGE_INDEX: 1,
    RESULT: 2,
  },
  DISTRICT: {
    AREA_PROGRAM_PLAN: 0,
    POPULATION_CORRECTION: 1,
    USAGE_INDEX: 2,
    RESULT: 3,
  }
}

export function optionsStatus(t: TFunction<['annualPlanningProcess', 'common']>): OptionType[] {
  return [
    {
      label: t('annualPlanningProcess:list.status.draft'),
      value: AnnualPlanningProcessStatus.DRAFT
    },
    {
      label: t('annualPlanningProcess:list.status.desk'),
      value: AnnualPlanningProcessStatus.DESK
    },
    {
      label: t('annualPlanningProcess:list.status.revision'),
      value: AnnualPlanningProcessStatus.REVISION
    },
    {
      label: t('annualPlanningProcess:list.status.approved'),
      value: AnnualPlanningProcessStatus.APPROVED
    },
  ]
}

export function optionStatusDistrictIP(t: TFunction<['annualPlanningProcess', 'common']>): OptionType[] {
  return [
    {
      label: t('annualPlanningProcess:list.status.approved'),
      value: ProcessStatus.APPROVED
    },
    {
      label: t('annualPlanningProcess:list.status.revision'),
      value: ProcessStatus.REJECT
    },
  ]
}

export const statusMap = {
  [AnnualPlanningProcessStatus.DRAFT]: {
    label: 'status.draft',
    color: 'neutral'
  },
  [AnnualPlanningProcessStatus.DESK]: {
    label: 'status.desk',
    color: 'info'
  },
  [AnnualPlanningProcessStatus.REVISION]: {
    label: 'status.revision',
    color: 'secondary'
  },
  [AnnualPlanningProcessStatus.APPROVED]: {
    label: 'status.approved',
    color: 'success'
  },
} as const

