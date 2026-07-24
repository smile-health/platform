'use client'

import React from 'react'
import OrderCreatePage from '../OrderCreate/OrderCreatePage'
import { useTranslation } from 'react-i18next'

const OrderCreateRelocationPage: React.FC = () => {
  const { t } = useTranslation('orderCreateRelocation')

  return (
    <OrderCreatePage
      title={t('title')}
      meta={t('meta')}
      isRelocation
    />
  )
}

export default OrderCreateRelocationPage
