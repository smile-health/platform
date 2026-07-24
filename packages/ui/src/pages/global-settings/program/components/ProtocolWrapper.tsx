import React from 'react'
import { Checkbox } from '#components/checkbox'
import { ProtocolItem } from '#components/modules/ProtocolItem'
import cx from '#lib/cx'
import { TProtocol } from '#types/protocol'

type ProtocolItemWrapperProps = {
  protocol: TProtocol
  isChecked?: boolean
  disabled: boolean
  onChange: (id: number) => void
}

const ProtocolItemWrapper: React.FC<ProtocolItemWrapperProps> = ({
  protocol,
  isChecked,
  disabled,
  onChange,
}) => {
  const handleClick = () => {
    if (!protocol || disabled) return
    onChange(protocol.id)
  }

  return (
    <button
      key={protocol?.id}
      onClick={handleClick}
      type="button"
      className={cx(
        'ui-flex ui-gap-4 ui-border ui-rounded-lg ui-p-4 ui-protocols-center',
        {
          'ui-bg-[#E2F3FC] ui-border-[#004990]': isChecked,
          'ui-border-gray-300': !isChecked,
          'ui-cursor-not-allowed ui-bg-slate-100 ui-border-slate-100': disabled,
          'ui-cursor-pointer': !disabled,
        }
      )}
    >
      {protocol && (
        <>
          <Checkbox
            id={`cbx-program-${protocol.id}`}
            checked={isChecked}
            disabled={disabled}
          />
          <ProtocolItem
            id={protocol.id}
            key={protocol.id}
            protocol={protocol}
            disabled={disabled}
            className={{
              wrapper: 'ui-gap-4 ui-flex-auto',
              title: 'ui-text-base',
              ...(disabled && {
                title: 'ui-text-base ui-text-left',
              }),
            }}
          />
        </>
      )}
    </button>
  )
}

export default ProtocolItemWrapper
