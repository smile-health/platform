import { TBast } from '@/types/bast';
import { Button } from '@repo/ui/components/button';
import { DataTable } from '@repo/ui/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { columnsDisposalItem } from '../../constants/columnsDisposalItem';
import { mapBastStatus } from '../../utils/helper';

type BastDetailProps = {
  data?: TBast;
  isLoading: boolean;
  open: boolean;
  onClose: () => void;
};

const BastDetailInfoModal: React.FC<BastDetailProps> = ({
  data,
  isLoading,
  open,
  onClose,
}) => {
  const { t } = useTranslation(['common', 'bast']);

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogHeader className="ui-text-center ui-w-full ui-text-xl ui-py-2">
        <p className="text-gray-500">
          {t('bast:title.handover_document_detail')}
        </p>
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4 ui-mb-4">
          <RenderDetailValue
            labelsClassName="ui-text-left"
            valuesClassName="ui-text-left"
            loading={isLoading}
            data={[
              {
                label: t('bast:list.column.no_handover_document'),
                value: data?.bastNo ?? '-',
              },
              {
                label: t('bast:list.column.description'),
                value: data?.description ?? '-',
              },
              {
                label: t('bast:list.column.entity_name'),
                value: data?.entityName ?? '-',
              },
              {
                label: t('bast:list.column.created_at'),
                value: data?.createdAt
                  ? dayjs(data?.createdAt).format('DD/MM/YYYY')
                  : '-',
              },
              {
                label: t('bast:list.column.status'),
                value: mapBastStatus(data?.status ?? '') ?? '-',
              },
            ]}
          />
        </div>
        <DataTable
          data={data?.disposalItems ?? []}
          columns={columnsDisposalItem(t, { page: 1, size: 10 })}
          isLoading={isLoading}
        />
      </DialogContent>
      <DialogFooter className="ui-flex ui-w-full ui-items-center ui-py-6">
        <Button
          id="btn-back"
          type="button"
          variant="outline"
          onClick={() => onClose()}
          className="ui-w-full"
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default BastDetailInfoModal;
