import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf']

export default function StockOfMaterials() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { detail } = useDashboardColdStorageCapacity()

  const data =
    detail.data?.aggregate_capacity_remaining?.materials?.map((item) => ({
      name: item.material_name,
      stock: item.dosage_material,
      volume: item.volume_material,
    })) || []

  const totalStock = data.reduce((sum, item) => sum + (item.stock ?? 0), 0)
  const totalVolume = data.reduce((sum, item) => sum + (item.volume ?? 0), 0)

  const formatNumber = (value: number) => numberFormatter(value, language)
  const formatDecimal = (value: number) =>
    value.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <DashboardColdStorageCapacityBox
      id="stock-of-materials"
      title={t('section.stock_of_materials.title')}
      info={<p>{t('section.stock_of_materials.info')}</p>}
      lastUpdated={detail?.data?.aggregate_capacity_remaining?.last_updated}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      isLoading={detail?.isLoading}
      isEmpty={data.length === 0}
    >
      <div className="ui-w-full ui-overflow-x-auto">
        <div className="ui-max-h-[550px] ui-overflow-y-auto">
          <table className="ui-w-full ui-text-sm">
            <thead className="ui-sticky ui-top-0 ui-z-0">
              <tr className="ui-bg-gray-200 ui-text-dark-blue">
                <th className="ui-py-3 ui-px-4 ui-text-left ui-font-semibold ui-w-12">
                  {t('section.stock_of_materials.column.no')}
                </th>
                <th className="ui-py-3 ui-px-4 ui-text-left ui-font-semibold">
                  {t('section.stock_of_materials.column.material_name')}
                </th>
                <th className="ui-py-3 ui-px-4 ui-text-right ui-font-semibold">
                  {t('section.stock_of_materials.column.stock_doses')}
                </th>
                <th className="ui-py-3 ui-px-4 ui-text-right ui-font-semibold">
                  {t('section.stock_of_materials.column.volume_litre')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.name}
                  className="ui-border-b ui-border-gray-200 hover:ui-bg-gray-50 ui-transition-colors"
                >
                  <td className="ui-py-3 ui-px-4 ui-text-gray-600">
                    {index + 1}
                  </td>
                  <td className="ui-py-3 ui-px-4 ui-text-gray-800">
                    {item.name}
                  </td>
                  <td className="ui-py-3 ui-px-4 ui-text-right ui-text-gray-800">
                    {formatNumber(item.stock ?? 0)}
                  </td>
                  <td className="ui-py-3 ui-px-4 ui-text-right ui-text-gray-800">
                    {formatDecimal(item.volume ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="ui-sticky ui-bottom-0 ui-z-0">
              <tr className="ui-bg-gray-200">
                <td className="ui-py-3 ui-px-4" />
                <td className="ui-py-3 ui-px-4 ui-font-semibold ui-text-dark-blue">
                  {t('section.stock_of_materials.total')}
                </td>
                <td className="ui-py-3 ui-px-4 ui-text-right ui-font-semibold ui-text-dark-blue">
                  {formatNumber(totalStock)}
                </td>
                <td className="ui-py-3 ui-px-4 ui-text-right ui-font-semibold ui-text-dark-blue">
                  {formatDecimal(totalVolume)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
