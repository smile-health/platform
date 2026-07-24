import { TProgram } from '#types/program'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

export const generateProgramsDetail = (
  t: TFunction<['common', 'programGlobalSettings']>,
  data?: TProgram
) => {
  const getUpdatedBy = () => {
    if (
      !data?.user_updated_by ||
      (!data?.user_updated_by.firstname && !data?.user_updated_by.lastname)
    )
      return '-'

    return `${data?.user_updated_by?.firstname ?? ''} ${data?.user_updated_by?.lastname ?? ''}`
  }

  return [
    {
      label: t('programGlobalSettings:form.label.key'),
      value: data?.key ?? '-',
      key: 'key',
    },
    {
      label: t('programGlobalSettings:form.label.name'),
      value: data?.name ?? '-',
      key: 'name',
    },
    {
      label: t('programGlobalSettings:form.label.description'),
      value: data?.description ?? '-',
      key: 'description',
    },
    {
      label: t('programGlobalSettings:form.label.classification_material'),
      value: data?.config?.material?.is_hierarchy_enabled
        ? t(
            'programGlobalSettings:form.options.classification_material.hierarchy'
          )
        : t(
            'programGlobalSettings:form.options.classification_material.non_hierarchy'
          ),
      key: 'is_hierarchy_enabled',
    },
    {
      label: t('programGlobalSettings:column.protocol'),
      value: data?.protocols.map((protocol) => protocol.name).join(', ') ?? '-',
      key: 'protocols',
    },
    {
      label: t('programGlobalSettings:column.updated_at'),
      value: parseDateTime(data?.updated_at, 'DD MMM YYYY HH:mm'),
      key: 'updated_at',
    },
    {
      label: t('programGlobalSettings:column.updated_by'),
      value: getUpdatedBy(),
      key: 'updated_by',
    },
  ]
}
