import { useTranslation } from 'react-i18next'

export const AssetManagementsRenderFieldWithOtherOption = ({
  primaryValue,
  otherValue,
  optionKey,
}: {
  primaryValue: string | null | undefined
  otherValue: string | null | undefined
  optionKey: 'budget_source' | 'asset_type' | 'asset_model' | 'manufacture'
}) => {
  const { t } = useTranslation(['assetManagements'])
  const handleOption = (key: typeof optionKey) => {
    switch (key) {
      case 'budget_source':
        return t('assetManagements:columns.budget_source')
      case 'asset_type':
        return t('assetManagements:columns.asset_type.label')
      case 'asset_model':
        return t('assetManagements:columns.asset_model')
      case 'manufacture':
        return t('assetManagements:columns.manufacture.label')
    }
  }

  if (!primaryValue && !otherValue) {
    return null
  }

  return (
    <p>
      {primaryValue ?? otherValue ?? null}{' '}
      <span className="ui-text-[#737373]">
        {primaryValue
          ? ''
          : t('assetManagements:columns.other_option', {
              option: handleOption(optionKey) as string,
            })}
      </span>
    </p>
  )
}
