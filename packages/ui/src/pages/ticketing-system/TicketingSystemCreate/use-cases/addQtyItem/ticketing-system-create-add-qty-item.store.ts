import { Row } from '@tanstack/react-table'
import { create } from 'zustand'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'

type TicketingSystemCreateAddQtyItemFormAction = 'add' | 'edit'

export type UseTicketingSystemCreateAddQtyItemStore = {
  isDrawerOpen: boolean
  action: TicketingSystemCreateAddQtyItemFormAction
  selectedMaterialRow: Row<TicketingSystemCreateSelectedMaterial> | null
  selectMaterialRow: (
    row: Row<TicketingSystemCreateSelectedMaterial>,
    action: TicketingSystemCreateAddQtyItemFormAction
  ) => void
  closeDrawer: () => void
}

const useTicketingSystemCreateAddQtyItemStore =
  create<UseTicketingSystemCreateAddQtyItemStore>((set) => ({
    isDrawerOpen: false,
    selectedMaterialRow: null,
    action: 'add',
    selectMaterialRow: (row, action) =>
      set({
        selectedMaterialRow: row,
        isDrawerOpen: true,
        action,
      }),
    closeDrawer: () =>
      set({
        isDrawerOpen: false,
        selectedMaterialRow: null,
      }),
  }))

export default useTicketingSystemCreateAddQtyItemStore
