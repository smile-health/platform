import {
  AnnualPlanningTargetGroupFormData,
  AnnualPlanningTargetGroupProgramFormData,
  AnnualPlanningTargetGroupProgramSubmitData,
  AnnualPlanningTargetGroupSubmitData,
} from './annual-planning-target-group-form.type'

export const noughtPrefix = (value: number): string => {
  if (!value) return '00'
  return value < 10 ? `0${value ?? 0}` : `${value}`
}

export const processPayloadGlobal = (
  data: AnnualPlanningTargetGroupFormData
): AnnualPlanningTargetGroupSubmitData => {
  return {
    title: data.title ?? '',
    from_year: Number(data.from_age.year ?? 0),
    from_month: Number(data.from_age.month ?? 0),
    from_day: Number(data.from_age.day ?? 0),
    to_year: Number(data.to_age.year ?? 0),
    to_month: Number(data.to_age.month ?? 0),
    to_day: Number(data.to_age.day ?? 0),
  }
}

export const processPayloadForProgram = (
  data: AnnualPlanningTargetGroupProgramFormData
): AnnualPlanningTargetGroupProgramSubmitData => {
  return data.target_group
    .map((item) => item?.target_group_child?.value)
    .filter((item): item is number => item !== null)
}
