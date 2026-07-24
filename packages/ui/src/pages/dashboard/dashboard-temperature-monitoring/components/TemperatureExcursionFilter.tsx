import { FormControl, FormLabel } from '#components/form-control'
import { Radio, RadioGroup } from '#components/radio'
import { OptionType, ReactSelect } from '#components/react-select'
import { useTranslation } from 'react-i18next'

import { WhoPqsStatus } from '../dashboard-temperature-monitoring.types'

type TemperatureExcursionFilterProps = Readonly<{
  selectedDuration: OptionType[]
  onDurationChange: (value: OptionType[]) => void
  temperatureRange: OptionType | null
  onTemperatureRangeChange: (value: OptionType | null) => void
  whoPqsStatus: WhoPqsStatus | null
  onWhoPqsChange: (value: WhoPqsStatus) => void
}>

export default function TemperatureExcursionFilter({
  selectedDuration,
  onDurationChange,
  temperatureRange,
  onTemperatureRangeChange,
  whoPqsStatus,
  onWhoPqsChange,
}: TemperatureExcursionFilterProps) {
  const { t } = useTranslation('dashboardAssetTemperatureMonitoring')

  const durationOptions: OptionType[] = [
    {
      value: 1,
      label: t('temperature_excursion.filter.duration.less_than_one_hour'),
    },
    {
      value: 2,
      label: t('temperature_excursion.filter.duration.one_to_ten_hours'),
    },
    {
      value: 3,
      label: t('temperature_excursion.filter.duration.more_than_ten_hours'),
    },
  ]

  const temperatureRangeOptions: OptionType[] = [
    {
      value: 1,
      label: t('temperature_excursion.filter.temperature_range.2_to_8'),
    },
    {
      value: 2,
      label: t(
        'temperature_excursion.filter.temperature_range.minus_25_to_minus_15'
      ),
    },
  ]

  return (
    <div className="ui-space-y-4 ui-p-4 ui-rounded ui-bg-white border">
      <div className="ui-grid ui-grid-cols-2 ui-gap-4">
        <FormControl>
          <FormLabel>
            {t('temperature_excursion.filter.duration.label')}
          </FormLabel>
          <ReactSelect
            options={durationOptions}
            value={selectedDuration}
            onChange={onDurationChange}
            placeholder={t('temperature_excursion.filter.duration.label')}
            multiSelectCounterStyle="normal"
            isMulti
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            {t('temperature_excursion.filter.temperature_range.label')}
          </FormLabel>
          <ReactSelect
            options={temperatureRangeOptions}
            value={temperatureRange}
            onChange={onTemperatureRangeChange}
            placeholder={t(
              'temperature_excursion.filter.temperature_range.placeholder'
            )}
            isClearable
          />
        </FormControl>
      </div>

      <div className="ui-flex ui-gap-4 ui-bg-white ui-p-4 ui-rounded ui-border w-full">
        <FormControl className="ui-justify-between ui-flex ui-items-center ui-space-y-0 ui-w-full">
          <FormLabel>
            {t('temperature_excursion.filter.certification_status.label')}
          </FormLabel>
          <RadioGroup className="ui-flex ui-items-center ui-justify-center">
            <Radio
              label={t('temperature_excursion.filter.who_pqs.who_pqs')}
              value="1"
              checked={whoPqsStatus === '1'}
              onChange={() => onWhoPqsChange('1')}
            />
            <Radio
              label={t('temperature_excursion.filter.who_pqs.non_who_pqs')}
              value="0"
              checked={whoPqsStatus === '0'}
              onChange={() => onWhoPqsChange('0')}
            />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  )
}
