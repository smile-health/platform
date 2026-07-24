import { TFunction } from 'i18next'

export type TAssetManagementsFieldWithOtherOption = {
  primaryValue: string | null | React.ReactNode | undefined
  otherValue: string | null | undefined
  t: TFunction<['common', 'assetInventory']>
  optionKey: any
}

const AssetManagementsFieldWithOtherOption = ({
  primaryValue,
  otherValue,
  t,
  optionKey,
}: TAssetManagementsFieldWithOtherOption) => {
  return (
    <p>
      {primaryValue ?? otherValue ?? null}{' '}
      <span className="ui-text-[#737373]">
        {primaryValue
          ? ''
          : t('assetInventory:columns.other_option', {
              option: t(optionKey),
            })}
      </span>
    </p>
  )
}

export default AssetManagementsFieldWithOtherOption
