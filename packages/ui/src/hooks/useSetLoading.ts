import { useLoadingPopupStore } from "#store/loading.store"
import { useEffect } from "react"

export const useSetLoadingPopupStore = (dependency: boolean) => {
  const { setLoadingPopup } = useLoadingPopupStore()

  useEffect(() => {
    setLoadingPopup(dependency)
  }, [dependency])
}