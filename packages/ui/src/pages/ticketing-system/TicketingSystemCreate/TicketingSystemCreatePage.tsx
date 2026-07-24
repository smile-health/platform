import { Fragment } from 'react'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import TicketingSystemCreateProvider, {
  TicketingSystemCreateConsumer,
} from './TicketingSystemCreateProvider'
import TicketingSystemCreateAddQtyItemDrawer from './use-cases/addQtyItem/TicketingSystemCreateAddQtyItemDrawer'
import TicketingSystemCreateOrderDetailDrawer from './use-cases/displayOrderDetail/TicketingSystemCreateOrderDetailDrawer'
import TicketingSystemCreateTicketingTable from './use-cases/displaySelectedMaterial/TicketingSystemCreateTicketingTable'
import TicketingSystemCreateTicketForm from './use-cases/fillTicketForm/TicketingSystemCreateTicketForm'
import TicketingSystemCreateMaterialSelection from './use-cases/materialSelection/TicketingSystemCreateMaterialSelection'
import TicketingSystemCreateResetFormModal from './use-cases/resetForm/TicketingSystemCreateResetFormModal'
import TicketingSystemCreateSubmitFormModal from './use-cases/submitForm/TicketingSystemCreateSubmitFormModal'

const TicketingSystemCreatePage = () => {
  const { t } = useTranslation(['common', 'ticketingSystemCreate'])

  return (
    <TicketingSystemCreateProvider>
      <TicketingSystemCreateConsumer>
        {({ reset, submit }) => {
          return (
            <Fragment>
              <Meta
                title={generateMetaTitle(t('ticketingSystemCreate:page.title'))}
              />

              <TicketingSystemCreateOrderDetailDrawer />
              <TicketingSystemCreateAddQtyItemDrawer />
              <TicketingSystemCreateSubmitFormModal />
              <TicketingSystemCreateResetFormModal />

              <Container
                title={t('ticketingSystemCreate:page.title')}
                withLayout
                backButton={{
                  label: t('common:back_to_list'),
                  show: true,
                }}
              >
                <div className="ui-space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <TicketingSystemCreateTicketForm />
                    <TicketingSystemCreateMaterialSelection />
                  </div>

                  <TicketingSystemCreateTicketingTable />

                  <div className="ui-flex ui-justify-end ui-mt-3">
                    <div className="ui-flex ui-flex-row ui-space-x-5">
                      <Button
                        variant="outline"
                        onClick={reset.modal.open}
                        className="ui-w-48"
                        type="reset"
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={submit}
                        className="ui-w-48"
                        type="button"
                      >
                        {t('common:send')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Container>
            </Fragment>
          )
        }}
      </TicketingSystemCreateConsumer>
    </TicketingSystemCreateProvider>
  )
}

export default TicketingSystemCreatePage
