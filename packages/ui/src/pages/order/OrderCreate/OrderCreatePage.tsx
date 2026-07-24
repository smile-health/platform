'use client'

import React from 'react'
import { useProgram } from '#hooks/program/useProgram'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import OrderContainer from '../OrderContainer'
import OrderCreateForm from './components/OrderCreateForm'
import OrderCreateHierarchyForm from './components/OrderCreateHierarchyForm'
import { OrderCreateContext } from './context/OrderCreateContext'

type Props = {
  title?: string
  meta?: string
  isRelocation: boolean
}

const OrderCreatePage: React.FC<CommonType & Props> = (props) => {
  const { t } = useTranslation('orderCreate')
  const { activeProgram } = useProgram()
  const isHierarchy = activeProgram?.config?.material?.is_hierarchy_enabled
  const {
    title = t('title.create'),
    meta = t('title.meta'),
    isRelocation,
  } = props

  return (
    <OrderContainer
      title={title}
      metaTitle={meta}
      backButton={{ show: true }}
    >
      <OrderCreateContext.Provider
        value={{ 
          isRelocation,
          isHierarchy
        }}
      >
        {isHierarchy ? (
          <OrderCreateHierarchyForm />
        ) : (
          <OrderCreateForm />
        )}
      </OrderCreateContext.Provider>
    </OrderContainer>
  )
}

export default OrderCreatePage
