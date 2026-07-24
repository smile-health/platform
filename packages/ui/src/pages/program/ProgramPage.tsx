import React, { Fragment } from 'react'
import SearchProgram from '#components/icons/SearchProgram'
import { InputSearch } from '#components/input'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { ProgramItemLink } from '#components/modules/ProgramItemLink'
import { Spinner } from '#components/spinner'
import { IconPrograms } from '#constants/program'
import { useProgram } from '#hooks/program/useProgram'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getUserStorage } from '#utils/storage/user'
import { isUserWMS } from '#utils/user'
import { useTranslation } from 'react-i18next'

const ProgramPage: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'program'])

  const user = getUserStorage()

  const { data, isLoading, getHref, localSearch, setLocalSearch } = useProgram({
    isIncludeWasteManagement: isUserWMS(user),
  })
  useSetLoadingPopupStore(isLoading)

  return (
    <Fragment>
      <Meta title="SMILE | Program" />
      <AppLayout title="SMILE App">
        {isLoading && (
          <div className="ui-flex ui-justify-center">
            <Spinner className="ui-my-8 ui-w-5" />
          </div>
        )}
        <div className="ui-mx-auto ui-max-w-[564px]">
          {!isUserWMS(user) && (
            <InputSearch
              id="input-search-program"
              placeholder={t('program:search')}
              onChange={(e) => setLocalSearch({ search: e.target.value })}
              value={localSearch.search}
            />
          )}
        </div>
        {data && data.length > 0 ? (
          <div className="ui-grid ui-grid-cols-4 ui-gap-6 ui-mt-6">
            {data?.map((x, i) => (
              <ProgramItemLink
                id={x.key}
                key={`${x.key}-${i}`}
                data={x}
                direction="vertical"
                href={x.href || getHref(x.key)}
                className={{
                  wrapper:
                    'ui-border ui-border-neutral-300 ui-rounded-lg ui-py-8 ui-cursor-pointer ui-gap-4',
                  logo: 'ui-w-16 ui-h-16',
                  label: 'ui-text-2xl',
                  title: 'ui-text-center ui-px-2',
                }}
                target={x.key === 'waste-management' ? '_blank' : undefined}
                icon={IconPrograms[x.key]}
              />
            ))}
          </div>
        ) : (
          <div className="ui-flex ui-flex-col ui-justify-center ui-items-center ui-gap-5 ui-text-center ui-my-20">
            <SearchProgram />
            <div className="ui-flex ui-flex-col ui-gap-3">
              <p className="ui-font-bold ui-text-base">
                {t('program:no_data.title')}
              </p>
              <p className="ui-text-sm ui-text-gray-500">
                {t('program:no_data.description', { returnObjects: true })[0]}
                <br />{' '}
                {t('program:no_data.description', { returnObjects: true })[1]}
              </p>
            </div>
          </div>
        )}
      </AppLayout>
    </Fragment>
  )
}

export default ProgramPage
