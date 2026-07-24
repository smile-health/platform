import React, { useContext } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { loadEntities } from '#services/entity'
import { Controller } from 'react-hook-form'

import { StockOpnameMaterialContext } from '../context/StockOpnameContext'
import { useStockOpnameEntityColdStorage } from '../hooks/useStockOpnameEntityColdStorage'
import { loadPeriode } from '../services'

type Props = {
  isNotAdmin: boolean
}

const StockOpameDetail: React.FC<Props> = ({ isNotAdmin }) => {
  const { handleShowWarningChange, reValidateQueryFetchInfiniteScroll } =
    useContext(StockOpnameMaterialContext)
  const { t, language, control, coldStorage, setValue, new_opname_items } =
    useStockOpnameEntityColdStorage()

  const descriptionColdStorage = t('form.detail.cold_storage', {
    returnObjects: true,
  })
  return (
    <div className="ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold">{t('form.detail.title')}</div>
      <div className="ui-mt-6 ui-flex ui-flex-col ui-space-y-6">
        <Controller
          control={control}
          name="entity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-entity" required>
                {t('form.detail.label.entity')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-stock-opname-entity"
                loadOptions={loadEntities}
                debounceTimeout={300}
                isClearable
                placeholder={t('form.detail.placeholder.entity')}
                additional={{
                  page: 1,
                  is_vendor: 1,
                }}
                value={value || null}
                onChange={(option) => {
                  if (new_opname_items.length > 0) {
                    handleShowWarningChange({
                      type: 'entity',
                      value: option,
                    })
                  } else {
                    onChange(option)
                    setValue('new_opname_items', [])
                    reValidateQueryFetchInfiniteScroll()
                  }
                }}
                menuPosition="fixed"
                disabled={isNotAdmin}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="periode"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-periode" required>
                {t('form.detail.label.periode')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-stock-opname-periode"
                loadOptions={loadPeriode}
                debounceTimeout={300}
                isClearable
                placeholder={t('form.detail.placeholder.periode')}
                additional={{
                  page: 1,
                  status: 1,
                  cut_off_time: t('cut_off_time') ?? '',
                  locale: language,
                }}
                value={value || null}
                onChange={(option) => {
                  if (new_opname_items.length > 0) {
                    handleShowWarningChange({
                      type: 'periode',
                      value: option,
                    })
                  } else {
                    onChange(option)
                    setValue('new_opname_items', [])
                    reValidateQueryFetchInfiniteScroll()
                  }
                }}
                menuPosition="fixed"
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        {coldStorage && (
          <div>
            <hr />
            <div className="ui-flex ui-flex-wrap ui-items-center ui-justify-between ui-gap-4 ui-py-3 ui-px-2">
              <div className="ui-space-y-1">
                <div className="ui-font-semibold ui-text-gray-800">
                  {descriptionColdStorage[0]}
                </div>
                <div>{coldStorage?.total_volume || 0} liter</div>
              </div>
              <div className="ui-space-y-1">
                <div className="ui-font-semibold ui-text-gray-800">
                  {descriptionColdStorage[1]}
                </div>
                <div>{coldStorage?.volume_asset || 0} liter</div>
              </div>
              <div className="ui-space-y-1">
                <div className="ui-font-semibold ui-text-gray-800">
                  {descriptionColdStorage[2]}
                </div>
                <div className="text-myorange">
                  {coldStorage?.percentage_capacity || 0} %
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockOpameDetail
