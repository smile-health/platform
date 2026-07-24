import { useState } from "react"

import { DetailStock } from "#types/stock"

export const useStockDetailPageModalTableDetail = () => {
  const [modalDetail, setModalDetail] = useState<{
    open: boolean, data: DetailStock | null
  }>({ open: false, data: null })

  const handleOpen = (data: DetailStock) => setModalDetail({ data, open: true })

  const handleClose = () => setModalDetail({ data: null, open: false })

  return {
    modalDetail,
    handleOpen,
    handleClose
  }
}