import React from 'react'
import BatteryIcon from '#components/icons/BatteryIcon'
import SignalIcon from '#components/icons/SignalIcon'
import { useTranslation } from 'react-i18next'

import AssetTitleBlock from './AssetTitleBlock'

type IconBoxProps = {
  icon?: JSX.Element | null
  text?: string | number | null
  className?: string
}

const IconBox: React.FC<IconBoxProps> = ({
  icon = null,
  text = null,
  className = '',
}) => {
  return (
    <div className="flex items-center justify-start">
      <div className={className}>{icon}</div>
      <span className={`${className} ui-ml-2`}>{text}</span>
    </div>
  )
}

type AssetListDeviceStatusBoxProps = {
  status_device?: boolean | null
  battery?: number | null
  signal?: number | null
  power?: number | null
}

const AssetListDeviceStatusBox: React.FC<AssetListDeviceStatusBoxProps> = ({
  status_device = null,
  battery = null,
  signal = null,
  power = null,
}) => {
  const { t } = useTranslation(['common', 'asset'])

  const textColor = (condition: boolean) =>
    condition ? 'ui-text-primary-500' : 'ui-text-danger-600'

  const percentageText = (value: number) => (value ? `${value}%` : 'N/A')

  return (
    <AssetTitleBlock
      arrText={[
        {
          label: status_device
            ? t('asset:columns.online')
            : t('asset:columns.offline'),
          className: `${textColor(Boolean(status_device))} ui-text-sm`,
        },
        {
          label: (
            <IconBox
              icon={<BatteryIcon />}
              text={percentageText(Number(battery))}
            />
          ),
          className: `${textColor(Number(battery) > 20)} ui-text-sm`,
        },
        {
          label: (
            <IconBox
              icon={<SignalIcon />}
              text={percentageText(Number(signal))}
            />
          ),
          className: `${textColor(Number(signal) > 20)} ui-text-sm`,
        },
        {
          label:
            power && status_device
              ? t('asset:columns.connected')
              : t('asset:columns.disconnected'),
          className: `${textColor(Boolean(power && status_device))} ui-text-sm`,
        },
      ]}
    />
  )
}

export default AssetListDeviceStatusBox
