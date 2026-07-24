import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import { CONTACT_PERSON_INDICES } from '../../monitoring-device-inventory.constants'
import { useMonitoringDeviceInventoryDetail } from '../MonitoringDeviceInventoryDetailContext'
import { MonitoringDeviceInventoryDetailBox } from './MonitoringDeviceInventoryDetailBox'

export const EntitySection = () => {
  const { t } = useTranslation([
    'monitoringDeviceInventory',
    'monitoringDeviceInventoryDetail',
  ])
  const { data, isLoading } = useMonitoringDeviceInventoryDetail()

  const contactPerson1 = data?.contact_persons?.[CONTACT_PERSON_INDICES.FIRST]
  const contactPerson2 = data?.contact_persons?.[CONTACT_PERSON_INDICES.SECOND]
  const contactPerson3 = data?.contact_persons?.[CONTACT_PERSON_INDICES.THIRD]

  return (
    <MonitoringDeviceInventoryDetailBox
      title={t('monitoringDeviceInventoryDetail:section.entity.title')}
    >
      <RenderDetailValue
        data={[
          {
            label: t('monitoringDeviceInventory:data.entity'),
            value: data?.entity?.name,
          },
          {
            label: t('monitoringDeviceInventory:data.person_in_charge'),
            value: contactPerson1?.name
              ? `${contactPerson1?.name} (${contactPerson1?.phone || '-'})`
              : '-',
          },
          {
            label: `${t('monitoringDeviceInventory:data.person_in_charge')} 2`,
            value: contactPerson2?.name
              ? `${contactPerson2?.name} (${contactPerson2?.phone || '-'})`
              : '-',
          },
          {
            label: `${t('monitoringDeviceInventory:data.person_in_charge')} 3`,
            value: contactPerson3?.name
              ? `${contactPerson3?.name} (${contactPerson3?.phone || '-'})`
              : '-',
          },
        ]}
        loading={isLoading}
        skipEmptyValue={false}
      />
    </MonitoringDeviceInventoryDetailBox>
  )
}
