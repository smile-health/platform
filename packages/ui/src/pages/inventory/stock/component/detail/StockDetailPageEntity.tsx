import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { MaterialEntity } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

type Props = {
  data?: MaterialEntity
}
const StockDetailPageEntity: React.FC<Props> = ({ data }) => {
  const { t, i18n: { language } } = useTranslation('stock')

  return (
    <div className="ui-p-6 ui-border ui-rounded ui-space-y-4 ui-mx-3">
      <div className="ui-flex ui-justify-between ui-items-start">
        <div className="ui-font-semibold">{t('detail.entity.title')}</div>
      </div>

      <RenderDetailValue
        className="ui-gap-y-2"
        valuesClassName="ui-text-dark-blue ui-text-base ui-font-normal"
        data={[
          { label: t('detail.entity.name'), value: data?.name ?? '-' },
          { label: t('detail.entity.address'), value: data?.address ?? '-' },
          {
            label: t('detail.entity.updated_at'),
            value: parseDateTime(
              data?.updated_at ?? '-',
              'DD MMM YYYY HH:mm',
              language
            ).toUpperCase(),
          },
        ]}
      />
    </div>
  )
}

export default StockDetailPageEntity
