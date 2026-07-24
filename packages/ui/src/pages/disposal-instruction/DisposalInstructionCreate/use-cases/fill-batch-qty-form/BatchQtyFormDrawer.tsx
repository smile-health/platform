import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { Form } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { BatchQtyFormValues } from './batch-qty-form.type'
import { useBatchQtyForm } from './BatchQtyFormContext'
import { BatchQtyFormTable } from './BatchQtyFormTable'

export const BatchQtyFormDrawer = () => {
  const { t } = useTranslation([
    'common',
    'disposalInstruction',
    'disposalInstructionCreate',
  ])

  const disposalInstructionCreate = useDisposalInstructionCreate()
  const batchQtyForm = useBatchQtyForm()

  const handleSubmit = (values: BatchQtyFormValues) => {
    disposalInstructionCreate.submitBatchQtyForm(
      batchQtyForm.data.selectedDisposalItemIndex!,
      values
    )
    batchQtyForm.drawer.close()
  }

  return (
    <Drawer
      open={batchQtyForm.drawer.isOpen}
      placement="bottom"
      sizeHeight="lg"
      size="full"
    >
      <Form
        control={batchQtyForm.methods.control}
        onSubmit={() => batchQtyForm.methods.handleSubmit(handleSubmit)()}
      >
        <DrawerHeader className="ui-border-b-zinc-300">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('disposalInstructionCreate:section.batch_qty_drawer.title')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={batchQtyForm.drawer.close}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent className="ui-border-y ui-border-b-zinc-300">
          <div className="ui-flex ui-gap-10 ui-mb-1">
            <div className="ui-flex ui-flex-col ui-my-4">
              <h2 className="ui-text-sm ui-text-neutral-500">
                {t('disposalInstructionCreate:table.column.material_name')}
              </h2>
              <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">
                {batchQtyForm.data.selectedDisposalItem?.material?.name}
              </h3>
            </div>
            <div className="ui-flex ui-flex-col ui-my-4">
              <h2 className="ui-text-sm ui-text-neutral-500">
                {t('disposalInstructionCreate:table.column.total_discard')}
              </h2>
              <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">
                {batchQtyForm.data.selectedDisposalItem?.qty}
              </h3>
            </div>
            <div className="ui-flex ui-flex-col ui-my-4">
              <h2 className="ui-text-sm ui-text-neutral-500">
                {t('disposalInstructionCreate:table.column.activity')}
              </h2>
              <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">
                {batchQtyForm.data.selectedDisposalItem?.material?.activities
                  .map((activity) => activity.name)
                  .join(', ')}
              </h3>
            </div>
          </div>
          <div
            className="ui-py-2 ui-overflow-y-auto ui-max-h-[450px] ui-border-t"
            id="disposal-instruction-batch-qty-table"
          >
            <BatchQtyFormTable />
          </div>
        </DrawerContent>
        <DrawerFooter>
          <Button
            variant="subtle"
            type="button"
            onClick={batchQtyForm.empty}
            className="ui-px-4"
            leftIcon={<Reload className="ui-w-5 ui-h-5 ui-mr-2" />}
          >
            {t('common:reset')}
          </Button>
          <Button variant="solid" type="submit" className="ui-px-16">
            {t('common:save')}
          </Button>
        </DrawerFooter>
      </Form>
    </Drawer>
  )
}
