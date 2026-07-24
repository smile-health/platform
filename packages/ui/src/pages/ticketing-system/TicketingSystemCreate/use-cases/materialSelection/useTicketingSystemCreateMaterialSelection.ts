import { useFieldArray } from 'react-hook-form'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'
import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'

type UseTicketingSystemCreateMaterialSelection = {
  form: ReturnType<typeof useTicketingSystemCreateContext>['form']
}

const useTicketingSystemCreateMaterialSelection = ({
  form,
}: UseTicketingSystemCreateMaterialSelection) => {
  const selectedMaterials = form.watch('selected_materials') ?? []

  const { append, remove } = useFieldArray({
    control: form.control,
    name: 'selected_materials',
  })

  const handleSelectMaterial = (
    value: TicketingSystemCreateSelectedMaterial
  ) => {
    const isCustomMaterial = !Boolean(value.material)

    if (isCustomMaterial) {
      append({
        custom_material: null,
        material: null,
        items: [],
      })
      return
    }

    const selectedMaterialIndex = selectedMaterials.findIndex(
      (selectedMaterial) => selectedMaterial.material?.id === value.material?.id
    )

    const isSelected = selectedMaterials.some(
      (selectedMaterial) => selectedMaterial.material?.id === value.material?.id
    )

    if (isSelected) {
      remove(selectedMaterialIndex)
    } else {
      append(value)
    }
  }

  return {
    selectedMaterials: form.watch('selected_materials'),
    removeSelected: remove,
    removeAllSelected: () => form.setValue('selected_materials', []),
    selectMaterial: handleSelectMaterial,
  }
}

export default useTicketingSystemCreateMaterialSelection
