import React, { useContext } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import { useTranslation } from 'react-i18next'

import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import TransactionReturnFromFacilityBatchIdentityBox from './TransactionReturnFromFacilityBatchIdentityBox'

const TransactionReturnFromFacilityDetailDrawer = () => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { stockData, setStockData } = useContext(
    TransactionReturnFromFacilityContext
  )

  return (
    <Drawer
      key={stockData?.id}
      open={stockData !== null}
      placement="bottom"
      size="full"
      sizeHeight="lg"
    >
      <Button
        className="ui-absolute ui-right-2 ui-top-2 ui-rounded ui-text-gray-800 ui-outline-none ui-border-none"
        onClick={() => setStockData(null)}
        variant="subtle"
        type="button"
      >
        <XMarkIcon className="ui-h-5 ui-w-5" />
      </Button>
      <DrawerHeader title={t('common:detail')} className="ui-mx-auto" />
      <div className="ui-border-b-zinc-300 ui-h-1 ui-border-b" />
      <DrawerContent className="!ui-rounded-lg">
        <TransactionReturnFromFacilityBatchIdentityBox />
      </DrawerContent>
    </Drawer>
  )
}

export default TransactionReturnFromFacilityDetailDrawer
