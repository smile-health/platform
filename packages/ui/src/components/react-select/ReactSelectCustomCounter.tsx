import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'
import { components, GroupBase, ValueContainerProps } from 'react-select'

export default function ReactSelectCustomCounter<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: ValueContainerProps<Options, IsMulti, Group>) {
  const { t } = useTranslation()
  const { children, getValue, className } = props
  const selectedValues = getValue()

  const count = selectedValues?.length
  return (
    <components.ValueContainer
      {...props}
      className={cx('ui-flex ui-gap-2', className)}
    >
      {count > 0 ? (
        <>
          <span>
            {count} {t('item_selected')}
          </span>
          {Array.isArray(children) && children?.[1]}
        </>
      ) : (
        children
      )}
    </components.ValueContainer>
  )
}
