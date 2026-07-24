import cx from '@/lib/cx';
import { ManualScaleStatus, TManualScale } from '@/types/manual-scale';
import { parseDateTime } from '@/utils/date';
import { generateInitial } from '@/utils/strings';
import { Badge } from '@repo/ui/components/badge';
import { useTranslation } from 'react-i18next';
import { getManualScaleStatusOptions } from '../utils/helper';

type ManualRequestItemProps = {
  item?: TManualScale;
  handleRequestApprovalClick?: (item?: TManualScale) => void;
};

const ManualRequestItem: React.FC<ManualRequestItemProps> = ({
  item,
  handleRequestApprovalClick,
}) => {
  const { t } = useTranslation(['common', 'manualScale']);

  const isRequest = item?.status === ManualScaleStatus.WAITING_FOR_APPROVAL;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRequest) {
      handleRequestApprovalClick?.(item);
      return;
    }
  };

  const status = getManualScaleStatusOptions().find(
    (s) => s.value === item?.status
  );

  return (
    <button
      id={`trigger-notification-item-${item?.id}`}
      onClick={handleClick}
      className={cx('ui-p-3 ui-w-full ui-bg-white ui-rounded', {
        'ui-bg-blue-100 ui-cursor-pointer':
          item?.status === ManualScaleStatus.WAITING_FOR_APPROVAL,
        'ui-cursor-default':
          item?.status !== ManualScaleStatus.WAITING_FOR_APPROVAL,
      })}
    >
      <div className="ui-flex ui-items-center ui-justify-between ui-mb-2">
        <div className="ui-text-primary ui-text-[16px] ui-font-bold">
          {t('manualScale:list.column.title')}
        </div>
        <Badge
          rounded="full"
          color={status?.color ?? 'info'}
          variant="solid"
          size="md"
        >
          {status?.label ?? '-'}
        </Badge>
      </div>
      <div className="ui-flex ui-items-center ui-justify-between ui-mb-2">
        <div className="ui-text-sm ui-text-gray-700 ui-text-left ui-mb-2">
          {item?.entityName +
            ' ' +
            t('manualScale:list.by') +
            ' ' +
            item?.operatorName}
        </div>
        {(item?.status === ManualScaleStatus.APPROVED ||
          item?.status === ManualScaleStatus.REJECTED) && (
          <div className="ui-text-sm">{item?.processedName}</div>
        )}
      </div>

      <div className="ui-flex ui-items-center ui-justify-between ui-text-sm ui-text-gray-700 ui-text-left ui-mb-2">
        <div className="ui-flex ui-items-center ui-justify-start ui-gap-2 ui-mt-2">
          <button
            type="button"
            className="ui-flex ui-items-center ui-rounded ui-bg-white ui-p-1 ui-border ui-border-gray-300 ui-gap-1"
          >
            <div
              className="ui-grid ui-place-items-center ui-w-6 ui-h-6 ui-rounded"
              style={{ background: '#064E3B' }}
            >
              <span className="ui-text-xs ui-text-white">
                {generateInitial('WMS')}
              </span>
            </div>
            <p className="ui-text-sm ui-font-bold">WMS</p>
          </button>
        </div>
        <div className="ui-text-[12px] ui-text-semibold ui-text-gray-700">
          {parseDateTime(item?.createdAt, 'DD/MMM/YYYY HH:mm')
            .toUpperCase()
            .replaceAll('/', ' ')}
        </div>
      </div>
    </button>
  );
};

export default ManualRequestItem;
