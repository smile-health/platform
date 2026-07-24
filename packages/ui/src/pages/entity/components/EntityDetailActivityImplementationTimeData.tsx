import type { TDetailActivityDate } from '#types/entity'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

type Props = {
  existingData: TDetailActivityDate[][] | []
}

const EntityDetailActivityImplementationTimeData: React.FC<Props> = ({
  existingData,
}) => {
  const { t } = useTranslation(['common'])
  const dateFormat = process.env.DATE_FORMAT
  return (
    <div className="ui-mt-6 ui-space-y-4 ui-w-full ui-flex ui-flex-col">
      {existingData?.map(
        (field: TDetailActivityDate[] & { id: string }, idx: number) => (
          <div
            key={field[0]?.id}
            className="ui-border ui-border-neutral-300 ui-rounded-md ui-p-4"
          >
            <div className="ui-flex ui-justify-between ui-items-start ui-w-auto ui-text-base">
              <div className="ui-w-64 ui-mr-4 ui-text-neutral-500 ui-text-base">
                {field[0]?.name}
              </div>
              <div className="ui-w-auto ui-mr-4">:</div>
              <div className="ui-w-full ui-flex ui-flex-col ui-gap-2">
                {field?.map((item: TDetailActivityDate) => (
                  <p key={item?.entity_activity_id} className="ui-text-cyan-950 ui-text-base">
                    {`${
                      item?.start_date
                        ? parseDateTime(item?.start_date, dateFormat)
                        : null
                    } - `}
                    {item?.end_date ? (
                      parseDateTime(item?.end_date, dateFormat)
                    ) : (
                      <span className="ui-text-slate-300">
                        {t('common:empty')}
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default EntityDetailActivityImplementationTimeData
