import { ReactSelectAsync } from '#components/react-select'
import { loadListStockByEntities } from '#services/stock'
import { useTranslation } from 'react-i18next'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'
import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'

const TicketingSystemCreateMaterialSelectionDropdown = () => {
  const { t } = useTranslation('ticketingSystemCreate')

  const ticketingSystemCreate = useTicketingSystemCreateContext()

  const { form, materialSelection } = ticketingSystemCreate

  const selectedMaterialIds = materialSelection.selectedMaterials
    .map((selectedMaterial) => selectedMaterial.material?.id)
    .filter((id) => id !== undefined && id !== null)

  return (
    <ReactSelectAsync
      key={`selectMaterial-${selectedMaterialIds.join(',')}`}
      id="selectMaterialDropdown"
      value={null}
      className="ui-w-96"
      options={[
        {
          label: t('button.add_new_material'),
          value: undefined,
          isDisabled: false,
          isCustomMaterial: true,
        },
      ]}
      loadOptions={loadListStockByEntities}
      onChange={(option) => {
        const value: TicketingSystemCreateSelectedMaterial = {
          material: option?.value?.material
            ? {
                id: option.value.material.id,
                name: option.value.material.name,
                is_batch: Boolean(option.value.material.is_managed_in_batch),
              }
            : null,
          custom_material: null,
          items: [],
        }
        materialSelection.selectMaterial(value)
      }}
      placeholder={t('field.select_material.placeholder')}
      additional={{
        page: 1,
        params: {
          entity_id: form.watch('entity.value'),
        },
        selected_material_ids: selectedMaterialIds,
      }}
      menuPortalTarget={document.documentElement}
      menuPlacement="auto"
      menuPosition="fixed"
    />
  )
}

export default TicketingSystemCreateMaterialSelectionDropdown
