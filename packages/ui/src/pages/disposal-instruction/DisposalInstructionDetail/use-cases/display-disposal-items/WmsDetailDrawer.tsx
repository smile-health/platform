import { Button } from '#components/button'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import XMark from '#components/icons/XMark'
import { useTranslation } from 'react-i18next'

import { useDisposalItems } from './useDisposalItems'
import { WmsDetailTable } from './WmsDetailTable'

export const WmsDetailDrawer = () => {
  const { t } = useTranslation(['disposalInstructionDetail'])
  const disposalItems = useDisposalItems()

  return (
    <Drawer
      open={disposalItems.wmsDetailDrawer.isShow}
      placement="bottom"
      sizeHeight="lg"
      size="full"
    >
      <DrawerHeader className="ui-border-b-zinc-300">
        <div className="ui-flex ui-justify-between">
          <div />
          <h1 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('disposalInstructionDetail:section.view_wms_detail.title')}
          </h1>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={disposalItems.wmsDetailDrawer.close}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-flex ui-gap-10 ui-mt-3 ui-mb-6">
          <div className="ui-flex ui-flex-col">
            <h2 className="ui-text-sm ui-text-neutral-500">Material</h2>
            <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">
              {disposalItems.selectedDisposalItem?.master_material?.name}
            </h3>
          </div>
          <div className="ui-flex ui-flex-col">
            <h2 className="ui-text-sm ui-text-neutral-500">
              {t('disposalInstructionDetail:data.total_weight')}
            </h2>
            <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">
              {disposalItems.selectedDisposalItem?.waste_info?.reduce(
                (acc, wasteInfo) =>
                  acc + Number(wasteInfo.waste_bag_total_weight),
                0
              )}
            </h3>
          </div>
        </div>
        <div
          className="ui-overflow-y-auto ui-max-h-[450px] ui-border-t ui-mt-2 ui-mb-4"
          id="disposal-instruction-wms-detail-drawer"
        >
          <WmsDetailTable />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
