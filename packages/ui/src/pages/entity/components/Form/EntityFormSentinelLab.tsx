import { parseDate } from '@internationalized/date'
import { DatePicker } from '#components/date-picker'
import {
    FormControl,
    FormErrorMessage,
    FormLabel,
} from '#components/form-control'
import { Switch } from '#components/switch'
import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData } from '../../hooks/useEntityForm'

const EntityFormSentinelLab = () => {
    const { t } = useTranslation(['entity', 'common'])

    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<TFormData>()

    const isSentinelLabActive = watch('is_sentinel_lab')

    return (
        <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded">
            <div className="ui-flex ui-items-center ui-justify-between ui-mb-4">
                <div className="ui-font-bold">Sentinel Lab</div>
                <Switch
                    id="switch-sentinel-lab"
                    checked={isSentinelLabActive === true}
                    onCheckedChange={(checked: boolean) => {
                        setValue('is_sentinel_lab', checked)
                        if (!checked) {
                            setValue('sentinel_lab_start_date', null)
                            setValue('sentinel_lab_end_date', null)
                        }
                    }}
                    label={isSentinelLabActive ? t('common:yes') : t('common:no')}
                />
            </div>

            {isSentinelLabActive && (
                <div className="ui-grid ui-grid-cols-2 ui-gap-x-6 ui-gap-y-6">
                    <Controller
                        control={control}
                        name="sentinel_lab_start_date"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormControl>
                                <FormLabel required>
                                    {t('entity:form.time.label.start')}
                                </FormLabel>
                                <DatePicker
                                    {...field}
                                    id="datepicker-sentinel-lab-start-date"
                                    value={
                                        value && (value as string)?.split('-')?.length > 2
                                            ? parseDate(value as string)
                                            : null
                                    }
                                    onChange={(val) => {
                                        const date = val as unknown as Date
                                        if (val !== null)
                                            onChange(dayjs(date).format('YYYY-MM-DD'))
                                        else onChange(null)
                                    }}
                                    clearable
                                />
                                {errors?.sentinel_lab_start_date?.message && (
                                    <FormErrorMessage>
                                        {errors?.sentinel_lab_start_date?.message as string}
                                    </FormErrorMessage>
                                )}
                            </FormControl>
                        )}
                    />

                    <Controller
                        control={control}
                        name="sentinel_lab_end_date"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormControl>
                                <FormLabel required>{t('entity:form.time.label.end')}</FormLabel>
                                <DatePicker
                                    {...field}
                                    id="datepicker-sentinel-lab-end-date"
                                    value={
                                        value && (value as string)?.split('-')?.length > 2
                                            ? parseDate(value as string)
                                            : null
                                    }
                                    minValue={
                                        watch('sentinel_lab_start_date') &&
                                            (watch('sentinel_lab_start_date') as string)?.split('-')
                                                ?.length > 2
                                            ? parseDate(
                                                watch('sentinel_lab_start_date') as string
                                            )
                                            : undefined
                                    }
                                    onChange={(val) => {
                                        const date = val as unknown as Date
                                        if (val !== null)
                                            onChange(dayjs(date).format('YYYY-MM-DD'))
                                        else onChange(null)
                                    }}
                                    clearable
                                />
                                {errors?.sentinel_lab_end_date?.message && (
                                    <FormErrorMessage>
                                        {errors?.sentinel_lab_end_date?.message as string}
                                    </FormErrorMessage>
                                )}
                            </FormControl>
                        )}
                    />
                </div>
            )}
        </div>
    )
}

export default EntityFormSentinelLab
