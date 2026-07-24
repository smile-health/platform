import { Button } from "#components/button"
import cx from "#lib/cx"
import { SingleValue } from "#components/modules/RenderDetailValue"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/router"
import { TProgram } from "#types/program"
import { generateProgramsDetail } from "../utils/util"
import { getReadableTextColor } from "#utils/color"
import { generateInitials } from "#utils/strings"

type ProgramDetailsDetailProps = {
  data?: TProgram
}
const ProgramDetailsDetail: React.FC<ProgramDetailsDetailProps> = (props) => {
  const { data } = props
  const router = useRouter()
  const { t, i18n: { language } } = useTranslation(['common', 'programGlobalSettings'])
  const { id } = router.query

  const details = generateProgramsDetail(t, data)
  const setTextColor = (color?: string) => {
    if (!color) return 'ui-text-black'

    const text = getReadableTextColor(color)

    return text === 'light' ? 'ui-text-white' : 'ui-text-black'
  }
  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('programGlobalSettings:details.title.detail')}</h5>
        <div className="ui-flex ui-justify-end">
          <Button
            id="btn-link-program-edit"
            variant="outline"
            className="ui-w-[100px]"
            onClick={() => router.push(`/${language}/v5/global-settings/program/${id}/edit`)}
          >
            {t('common:edit')}
          </Button>
        </div>
      </div>
      <div
        className={cx(
          'ui-rounded ui-grid ui-place-items-center ui-w-16 ui-h-16',
        )}
        style={{ backgroundColor: data?.config.color }}
      >
        <span
          className={cx(
            'ui-font-medium ui-text-2xl',
            setTextColor(data?.config.color),
          )}
        >
          {generateInitials(data?.name ?? '')}
        </span>
      </div>
      <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
        {details?.map(({ label, value, key }, idx) => (
          <SingleValue id={`id-${label}`} key={key} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}

export default ProgramDetailsDetail
