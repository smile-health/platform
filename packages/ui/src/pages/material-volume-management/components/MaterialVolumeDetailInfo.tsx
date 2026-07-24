import { Fragment } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { MaterialVolumeDetailInfoProps } from '#types/material-volume'
import { useTranslation } from 'react-i18next'

import { generateDetail, generateDetailBoxDimension } from '../utils/helper'
import MaterialVolumeSkeleton from './MaterialVolumeSkeleton'

export default function MaterialVolumeDetailInfo(
  props: MaterialVolumeDetailInfoProps
) {
  const { isLoading, data } = props
  const {
    t,
    i18n: { language },
  } = useTranslation(['materialVolume', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  if (isLoading) {
    return <MaterialVolumeSkeleton />
  }

  const section = [
    {
      id: 'detail',
      title: t('detail.section.detail.header'),
      data: generateDetail(t, language, data),
    },
    {
      id: 'box_dimension',
      title: t('detail.section.box_dimension.header'),
      data: generateDetailBoxDimension(t, data),
    },
  ]

  const getEditUrl = () => {
    return getAsLinkGlobal(
      `/v5/global-settings/material/volume/${data?.id}/edit`,
      null,
      {
        fromPage: 'detail',
      }
    )
  }

  return (
    <Fragment>
      {section.map((item) => (
        <div
          key={item.title}
          className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4"
        >
          <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
            <h5 className="ui-font-bold">{item.title}</h5>
            <Exists useIt={item.id === 'detail'}>
              <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
                <Button
                  asChild
                  id={`btn-link-material-volume-edit-${item.id}`}
                  variant="outline"
                  onClick={() => {}}
                >
                  <Link href={getEditUrl()}>{t('common:edit')}</Link>
                </Button>
              </div>
            </Exists>
          </div>
          <RenderDetailValue data={item.data} />
        </div>
      ))}
    </Fragment>
  )
}
