import {
  AnnualPlanningSubstitutionFormData,
  AnnualPlanningSubstitutionSubmitData,
} from './annual-planning-substitution-form.type'

export const processPayload = (
  data: AnnualPlanningSubstitutionFormData
): AnnualPlanningSubstitutionSubmitData => ({
  material_id: data.material!.value as number,
  substitution_material_ids: data.substitution_materials
    .map((item) => item.substitution_material_child?.value as number)
    .filter((item) => !!item),
})
