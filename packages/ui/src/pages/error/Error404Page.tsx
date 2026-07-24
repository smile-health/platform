import React, { useEffect } from 'react'
import CustomError from '#components/modules/CustomError'
import { useLoadingPopupStore } from '#store/loading.store'
import { useTranslation } from 'react-i18next'

const Error404Page: React.FC = () => {
  const { loadingPopup, setLoadingPopup } = useLoadingPopupStore()
  const {
    i18n: { changeLanguage, language },
  } = useTranslation()
  const { pathname } = window.location
  const languageUrl = pathname.split('/')[1]

  useEffect(() => {
    if (loadingPopup) setLoadingPopup(false)
  }, [loadingPopup])

  useEffect(() => {
    if (languageUrl) changeLanguage(languageUrl)
  }, [language, languageUrl])

  return <CustomError error="404_pages" withLayout />
}

export default Error404Page
