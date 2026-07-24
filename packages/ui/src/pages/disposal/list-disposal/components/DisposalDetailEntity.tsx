import { RenderDetailValue } from "#components/modules/RenderDetailValue"
import { useTranslation } from "react-i18next"
import { Disposal } from "../types/disposal"
import { parseDateTime } from "#utils/date"

type Props = {
  data?: Disposal
}

const DisposalDetailEntity: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation('disposalList')

  const resultAddress = [
    data?.entity?.province?.name,
    data?.entity?.regency?.name,
    data?.entity?.sub_district?.name,
    data?.entity?.village?.name,
  ].filter(Boolean).join(', ') || '-'

  return (
    <div className="ui-p-6 ui-border ui-rounded ui-space-y-4 ui-mx-3">
      <div className="ui-flex ui-justify-between ui-items-start">
        <div className="ui-font-semibold">{t('detail.entity.title')}</div>
      </div>

      <RenderDetailValue
        className="ui-gap-y-2"
        valuesClassName="ui-text-dark-blue ui-text-base ui-font-normal"
        data={[
          { label: t('detail.entity.name'), value: data?.entity.name ?? '-' },
          { label: t('detail.entity.address'), value: data?.entity.address ?? '-' },
          {
            label: t('detail.entity.updated_at'),
            value: parseDateTime(
              data?.entity.updated_at ?? '-',
              'DD MMM YYYY HH:mm'
            ).toUpperCase(),
          },
        ]}
      />
    </div>
  )
}

export default DisposalDetailEntity