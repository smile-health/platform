import {
  ProgramPlanMaterialRatioFormData,
  ProgramPlanMaterialRatioSubmitData,
} from './program-plan-material-ratio-form.type'

export const processPayload = (
  data: ProgramPlanMaterialRatioFormData & { program_plan_id: number }
): ProgramPlanMaterialRatioSubmitData => {
  return {
    program_plan_id: data.program_plan_id,
    from_material_id: data.from_material.material?.value as number,
    from_material_qty: Number(data.from_material.amount),
    from_subtype_id: data.from_material.subtype?.value as number,
    to_material_id: data.to_material.material?.value as number,
    to_material_qty: Number(data.to_material.amount),
    to_subtype_id: data.to_material.subtype?.value as number,
  }
}
