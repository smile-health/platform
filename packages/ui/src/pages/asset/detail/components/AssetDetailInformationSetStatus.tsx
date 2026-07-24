import React from 'react'
import { Button } from '#components/button'
import { ReactSelectAsync } from '#components/react-select'
import AssetTitleBlock from '#pages/asset/list/components/AssetTitleBlock'
import { loadStatusAsset } from '#services/status-asset'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useSubmitWorkingStatus } from '../hooks/useSubmitWorkingStatus'
import AssetDetailContext from '../libs/asset-detail.context'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

const AssetDetailInformationSetStatus = () => {
  const { data } = React.useContext(AssetDetailContext)
  const { t, i18n } = useTranslation(['common', 'asset'])
  const { control, handleSubmit, isChangeMode, setIsChangeMode } =
    useSubmitWorkingStatus()
  const language = i18n.language
  if (isChangeMode && hasPermission('asset-temperature-mutate'))
    return (
      <div className="ui-flex ui-flex-col ui-gap-2 ui-w-2/4">
        <form onSubmit={handleSubmit} className="ui-flex ui-flex-col ui-gap-2">
          <Controller
            name="working_status_id"
            control={control}
            render={({ field }) => (
              <ReactSelectAsync
                {...field}
                isClearable={false}
                isSearchable
                placeholder={t('common:all')}
                loadOptions={loadStatusAsset}
                additional={{
                  page: 1,
                }}
              />
            )}
          />
          <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
            <Button
              type="button"
              variant="outline"
              className="ui-w-full"
              onClick={() => setIsChangeMode(false)}
            >
              {t('common:cancel')}
            </Button>
            <Button type="submit" className="ui-w-full">
              {t('common:save')}
            </Button>
          </div>
        </form>
      </div>
    )
  return (
    <div className="ui-flex ui-flex-col ui-gap-2">
      <AssetTitleBlock
        arrText={[
          {
            label: data?.asset_status?.name as string,
            className: 'ui-text-sm ui-font-normal ui-text-primary-500',
          },
          {
            label: dayjs(data?.updated_at)
              .locale(language)
              .format('DD MMM YYYY HH:mm')
              ?.toUpperCase(),
            className: 'ui-text-sm ui-font-normal ui-text-gray-400 ui-my-1',
          },
        ]}
      />
      {hasPermission('asset-temperature-mutate') && (
        <Button
          type="button"
          variant="outline"
          className="ui-w-fit"
          onClick={() => setIsChangeMode(true)}
        >
          {t('asset:detail.change_status')}
        </Button>
      )}
    </div>
  )
}

export default AssetDetailInformationSetStatus
