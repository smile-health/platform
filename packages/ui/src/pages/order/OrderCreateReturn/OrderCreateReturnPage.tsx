'use client'

import React from 'react'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import OrderContainer from '../OrderContainer'
import OrderCreateReturnForm from './components/OrderCreateReturnForm'

const OrderCreateReturnPage: React.FC<CommonType> = () => {
  const { t } = useTranslation('orderCreateReturn')
  return (
    <OrderContainer
      metaTitle={t('title.create')}
      title={t('title.create')}
      backButton={{ show: true }}
    >
      <OrderCreateReturnForm />
    </OrderContainer>
  )
}

export default OrderCreateReturnPage
