import { create } from 'zustand'

import { SelectedMaterial } from './material-selection.type'

interface MaterialSelectionStore {
  selectedMaterials: SelectedMaterial[]
  addMaterial: (material: SelectedMaterial) => void
  removeMaterial: (materialId: number) => void
  removeAllMaterial: () => void
}

const useMaterialSelectionStore = create<MaterialSelectionStore>()(
  (set, get) => ({
    selectedMaterials: [],
    addMaterial: (material) => {
      set({
        selectedMaterials: [...get().selectedMaterials, material],
      })
    },
    removeMaterial: (materialId) => {
      set({
        selectedMaterials: get().selectedMaterials.filter(
          (selectedMaterial) => selectedMaterial.material?.id !== materialId
        ),
      })
    },
    removeAllMaterial: () => {
      set({
        selectedMaterials: [],
      })
    },
  })
)

export default useMaterialSelectionStore
