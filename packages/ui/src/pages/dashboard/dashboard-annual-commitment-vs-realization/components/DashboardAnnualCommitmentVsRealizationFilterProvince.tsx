import { useTranslation } from "react-i18next"
import { ReactSelectAsync, OptionType } from "#components/react-select"
import { loadProvinces } from "#services/location"

type Props = {
  province: OptionType | null
  setProvince: (province: OptionType | null) => void
}

const DashboardAnnualCommitmentVsRealizationFilterProvince: React.FC<Props> = ({
  province,
  setProvince,
}) => {
  const { t } = useTranslation()

  return (
    <ReactSelectAsync
      value={province}
      onChange={(province) => setProvince(province)}
      loadOptions={loadProvinces}
      debounceTimeout={300}
      isClearable
      menuPosition="fixed"
      additional={{ page: 1 }}
      menuPortalTarget={document.body}
      className="ui-w-1/3"
      placeholder={t('form.province.placeholder')}
    />
  )
}

export default DashboardAnnualCommitmentVsRealizationFilterProvince