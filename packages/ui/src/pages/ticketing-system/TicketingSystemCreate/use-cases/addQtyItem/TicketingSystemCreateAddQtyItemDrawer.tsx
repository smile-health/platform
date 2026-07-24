import { Button } from '#components/button'
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import XMark from '#components/icons/XMark'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { Controller, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'
import TicketingSystemCreateAddQtyItemTable from './TicketingSystemCreateAddQtyItemTable'
import useTicketingSystemCreateAddQtyItem from './useTicketingSystemCreateAddQtyItem'

const TicketingSystemCreateAddQtyItemDrawer = () => {
  const { t } = useTranslation('ticketingSystemCreate')
  const ticketingSystemCreate = useTicketingSystemCreateContext()
  const addQtyItem = useTicketingSystemCreateAddQtyItem()

  return (
    <Drawer
      open={addQtyItem.isDrawerOpen}
      placement="bottom"
      sizeHeight="lg"
      size="full"
      closeOnOverlayClick={false}
      onOpenChange={addQtyItem.closeDrawer}
    >
      <FormProvider {...addQtyItem.form}>
        <DrawerHeader
          title={t('drawer.quantity.title')}
          className="ui-text-center ui-py-6 border-b relative"
        >
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={addQtyItem.closeDrawer}
            className="ui-right-4 ui-top-4 absolute"
          >
            <XMark />
          </Button>
        </DrawerHeader>
        <DrawerContent className="ui-p-6 ui-space-y-6">
          <div className="flex items-center gap-4">
            <FormControl className="ui-space-y-2">
              <FormLabel className="text-sm">
                {t('table.columns.material')}
              </FormLabel>
              {addQtyItem.selectedMaterialRow?.original.material ? (
                <div className="ui-text-dark-blue ui-font-bold">
                  {addQtyItem.selectedMaterialRow?.original.material?.name}
                </div>
              ) : (
                <Controller
                  name={`custom_material.name`}
                  control={addQtyItem.form.control}
                  render={({ field, fieldState }) => (
                    <div className="ui-space-y-1">
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('field.custom_material.placeholder')}
                        className="ui-min-w-64"
                        error={Boolean(fieldState.error?.message)}
                      />
                      {fieldState.error?.message && (
                        <FormErrorMessage>
                          {fieldState.error?.message}
                        </FormErrorMessage>
                      )}
                    </div>
                  )}
                />
              )}
            </FormControl>
            {!addQtyItem.selectedMaterialRow?.original.material && (
              <FormControl className="ui-space-y-2">
                <FormLabel className="text-sm">Is Batch?</FormLabel>
                <RadioGroup>
                  <Radio
                    name="is_batch"
                    id="is_batch-yes"
                    data-testid="is_batch-yes"
                    checked={addQtyItem.form.watch('custom_material.is_batch')}
                    label={t('common:yes')}
                    onChange={() => {
                      addQtyItem.form.setValue('custom_material.is_batch', true)
                    }}
                  />
                  <Radio
                    name="is_batch"
                    id="is_batch-no"
                    data-testid="is_batch-no"
                    checked={!addQtyItem.form.watch('custom_material.is_batch')}
                    label={t('common:no')}
                    onChange={() => {
                      addQtyItem.form.setValue(
                        'custom_material.is_batch',
                        false
                      )
                      addQtyItem.form.getValues('items').forEach((_, index) => {
                        addQtyItem.form.setValue(
                          `items.${index}.batch_code`,
                          null
                        )
                      })
                    }}
                  />
                </RadioGroup>
              </FormControl>
            )}
          </div>

          <TicketingSystemCreateAddQtyItemTable />
        </DrawerContent>
        <DrawerFooter className="ui-border-t">
          <Button
            variant="subtle"
            className="ui-w-32"
            onClick={() => addQtyItem.form.reset()}
          >
            Reset
          </Button>
          <Button
            className="ui-w-48"
            onClick={addQtyItem.form.handleSubmit(
              ticketingSystemCreate.onSubmitQtyItem
            )}
          >
            {t('common:save')}
          </Button>
        </DrawerFooter>
      </FormProvider>
    </Drawer>
  )
}

export default TicketingSystemCreateAddQtyItemDrawer
