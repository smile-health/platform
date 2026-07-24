import { create } from 'zustand'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'

interface TicketingSystemCreateMaterialSelectionStore {
  selectedMaterials: TicketingSystemCreateSelectedMaterial[]
  setSelectedMaterial: (material: TicketingSystemCreateSelectedMaterial) => void
  removeSelectedMaterial: (
    material: TicketingSystemCreateSelectedMaterial
  ) => void
  removeAllSelectedMaterial: () => void
}

const useTicketingSystemCreateMaterialSelectionStore =
  create<TicketingSystemCreateMaterialSelectionStore>()((set, get) => ({
    selectedMaterials: [],
    setSelectedMaterial: (material) => {
      set({
        selectedMaterials: [...get().selectedMaterials, material],
      })
    },
    removeSelectedMaterial: (material) => {
      set({
        selectedMaterials: get().selectedMaterials.filter(
          (selectedMaterial) =>
            selectedMaterial.material?.id !== material.material?.id
        ),
      })
    },
    removeAllSelectedMaterial: () => {
      set({
        selectedMaterials: [],
      })
    },
  }))

export default useTicketingSystemCreateMaterialSelectionStore
