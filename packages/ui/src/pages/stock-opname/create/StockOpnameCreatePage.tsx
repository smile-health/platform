import React from 'react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { FormProvider } from 'react-hook-form'

import StockOpameDetail from './components/StockOpameDetail'
import StockOpameMaterial from './components/StockOpameMaterial'
import StockOpnameModalConfirmation from './components/StockOpnameModalConfirmation'
import StockOpnameStock from './components/StockOpnameStock'
import StockOpnameTrademark from './components/StockOpnameTrademark'
import { StockOpnameMaterialContext } from './context/StockOpnameContext'
import { useStockOpnameCreate } from './hooks/useStockOpnameCreate'

const StockOpnameCreatePage: React.FC = () => {
  usePermission('stock-opname-mutate')

  const {
    t,
    onSubmit,
    handleSubmitModalConfirmation,
    reValidateQueryFetchInfiniteScroll,

    // Modal Control
    modalConfirmation,
    handleCloseConfirmation,
    handleShowWarningChange,
    openModalReset,
    setOpenModalReset,

    // Form Control
    methods,
    isNotAdmin,
    isHierarchical,

    // Material and Trademark Control
    trademarks,
    selected_material_id,
    handleSelectMaterial,
  } = useStockOpnameCreate()
  const router = useSmileRouter()

  return (
    <Container
      title={t('stockOpnameCreate:title')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.push('/v5/stock-opname')
        },
      }}
    >
      <Meta title={t('stockOpnameCreate:meta')} />

      <StockOpnameModalConfirmation
        open={modalConfirmation.open}
        description={modalConfirmation.message}
        handleClose={handleCloseConfirmation}
        handleSubmit={handleSubmitModalConfirmation}
        buttonProps={modalConfirmation.buttonProps}
      />

      <ModalConfirmation
        open={openModalReset}
        onSubmit={() => location.reload()}
        setOpen={() => setOpenModalReset((prev) => !prev)}
        title={t('common:confirmation')}
        description={t('stockOpnameCreate:form.reset.description')}
      />

      <div className="ui-mt-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <StockOpnameMaterialContext.Provider
              value={{
                trademarks,
                selected_material_id,
                handleSelectMaterial,
                handleShowWarningChange,
                isHierarchical,
                reValidateQueryFetchInfiniteScroll,
              }}
            >
              <div className="ui-flex ui-space-x-5">
                <StockOpameDetail isNotAdmin={isNotAdmin} />
                <StockOpameMaterial />
              </div>

              {isHierarchical && (
                <div className="ui-mt-5 ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
                  <h1 className="ui-font-bold">
                    {t('stockOpnameCreate:form.trademark.title')}
                  </h1>
                  <StockOpnameTrademark />
                </div>
              )}
            </StockOpnameMaterialContext.Provider>

            <div className="ui-mt-5 ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
              <h1 className="ui-font-bold">
                {t('stockOpnameCreate:form.transaction.title')}
              </h1>
              <StockOpnameStock />
            </div>

            <div className="ui-w-full ui-mt-5">
              <div className="ui-flex ui-space-x-5 ui-justify-end">
                <Button
                  variant="outline"
                  className="ui-w-48"
                  type="button"
                  onClick={() => setOpenModalReset(true)}
                >
                  Reset
                </Button>
                <Button
                  className="ui-w-48"
                  type="submit"
                  disabled={methods.watch('new_opname_items').length === 0}
                >
                  {t('common:send')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </Container>
  )
}

export default StockOpnameCreatePage
