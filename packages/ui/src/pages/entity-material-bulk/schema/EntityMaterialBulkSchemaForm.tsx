import * as yup from 'yup'

export const formSchema = yup.object({
  keyword_entity: yup.string().notRequired(),
  type_ids: yup.string().notRequired(),
  entity_tag_ids: yup.string().notRequired(),
  province: yup.array().of(
    yup.object({
      value: yup.number(),
      label: yup.string()
    }),
  ).notRequired(),
  province_ids: yup.string().notRequired(),
  regency: yup.array().of(
    yup.object({
      value: yup.number(),
      label: yup.string()
    }),
  ).notRequired(),
  regency_ids: yup.string().notRequired(),
  sub_district: yup.array().of(
    yup.object({
      value: yup.number(),
      label: yup.string()
    }),
  ).notRequired(),
  sub_district_ids: yup.string().notRequired(),
  village: yup.array().of(
    yup.object({
      value: yup.number(),
      label: yup.string()
    }),
  ).notRequired(),
  village_ids: yup.string().notRequired(),
  keyword_material: yup.string().notRequired(),
  activity_id: yup.string().notRequired(),
  material_level_ids: yup.string().notRequired(),
  material_type_ids: yup.string().notRequired(),
})