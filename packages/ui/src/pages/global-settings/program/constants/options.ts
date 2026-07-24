import { TFunction } from "i18next";

export const configurationMaterialOptions = (t: TFunction<['common', 'programGlobalSettings']>) => [
  { label: t('programGlobalSettings:form.options.classification_material.hierarchy'), value: 1 },
  { label: t('programGlobalSettings:form.options.classification_material.non_hierarchy'), value: 0 },
]

export const PROTOCOL_NAME = {
  'default': 'Default',
  'rabies': 'Rabies',
  'dengue': 'Dengue',
}