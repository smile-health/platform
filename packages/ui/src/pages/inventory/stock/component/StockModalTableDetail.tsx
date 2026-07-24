import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import XMark from '#components/icons/XMark'
import { DetailStock, Stock } from '#types/stock'
import { useTranslation } from 'react-i18next'

import { columnsBatch } from '../constant/table'

type Props = {
  dataParent?: Stock
  data: DetailStock | null
  open: boolean
  isHierarchical: boolean
  handleClose: () => void
}
const StockModalTableDetail: React.FC<Props> = (props) => {
  const { dataParent, data, open, isHierarchical, handleClose } = props
  const {
    t,
    i18n: { language },
  } = useTranslation('stock')

  const getMaterialName = () =>
    isHierarchical
      ? dataParent?.material?.name || '-'
      : data?.activity?.name || '-'
  const getMaterialDescription = () =>
    isHierarchical
      ? data?.material?.name || '-'
      : data?.material?.name || dataParent?.material?.name || '-'

  return (
    <Drawer
      open={open}
      onOpenChange={handleClose}
      placement="bottom"
      sizeHeight="lg"
      size="full"
      className="ui-rounded-t-lg"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {isHierarchical
              ? t('detail.drawer.title', { returnObjects: true })[0]
              : t('detail.drawer.title', { returnObjects: true })[1]}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={handleClose}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-px-1 ui-py-2">
          <div className="ui-space-y-6 ui-mb-6">
            <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4">
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {isHierarchical
                    ? t('detail.drawer.description.hiearchy', {
                        returnObjects: true,
                      })[0]
                    : t('detail.drawer.description.non_hiearchy', {
                        returnObjects: true,
                      })[0]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {getMaterialName()}
                </p>
              </div>
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {isHierarchical
                    ? t('detail.drawer.description.hiearchy', {
                        returnObjects: true,
                      })[1]
                    : t('detail.drawer.description.non_hiearchy', {
                        returnObjects: true,
                      })[1]}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {getMaterialDescription()}
                </p>
              </div>
            </div>

            <DataTable
              data={data?.stocks || []}
              columns={columnsBatch({
                t,
                isHierarchical,
                language,
                isOpenVial: data?.material?.is_open_vial || false,
              })}
              className="ui-overflow-x-auto"
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default StockModalTableDetail
