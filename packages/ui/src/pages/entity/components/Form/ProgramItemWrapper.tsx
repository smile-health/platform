import { Checkbox } from '#components/checkbox'
import Check from '#components/icons/Check'
import { ProgramItem } from '#components/modules/ProgramItem'
import { IconPrograms } from '#constants/program'
import cx from '#lib/cx'
import { TProgram } from '#types/program'
import { useTranslation } from 'react-i18next'

type ProgramItemWrapperProps = {
  item: TProgram
  isChecked?: boolean
  disabled: boolean
  onChange: (...event: any[]) => void
  value?: number[]
}

const ProgramItemWrapper: React.FC<ProgramItemWrapperProps> = (props) => {
  const { item, isChecked, disabled, onChange, value } = props
  const { t } = useTranslation('entity')

  const handleClick = () => {
    if (!item || disabled) return
    onChange(
      isChecked
        ? value?.filter((val) => val !== item.id)
        : [...(value || []), item.id]
    )
  }

  return (
    <button
      key={item?.id}
      onClick={handleClick}
      type="button"
      className={cx(
        'ui-flex ui-gap-4 ui-border ui-rounded-lg ui-p-4 ui-items-center',
        {
          'ui-bg-[#E2F3FC]': isChecked,
          'ui-border-gray-300': !isChecked,
          'ui-border-[#004990]': isChecked,
          'ui-cursor-pointer': !disabled,
          'ui-cursor-not-allowed': disabled,
          'ui-border-slate-100': disabled,
          'ui-bg-slate-100': disabled,
        }
      )}
    >
      {item && (
        <>
          {!disabled && (
            <Checkbox id={`cbx-program-${item.key}`} checked={isChecked} />
          )}
          <ProgramItem
            id={item.key}
            key={item.id}
            data={item}
            disabled={disabled}
            className={{
              wrapper: 'ui-gap-4 ui-flex-auto',
              title: 'ui-text-base',
              ...(disabled && {
                title: 'ui-text-base ui-text-left',
              }),
            }}
            icon={IconPrograms[item.key]}
          />
        </>
      )}

      {disabled && (
        <div className="ui-flex ui-gap-2 ui-items-center">
          <p className="ui-text-xs ui-font-normal ui-italic ui-text-neutral-500">
            {t('form.programs.selected')}
          </p>
          <Check />
        </div>
      )}
    </button>
  )
}

export default ProgramItemWrapper
