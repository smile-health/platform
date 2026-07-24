import { translateNotification } from '@/components/notification/utils/helper';
import cx from '@/lib/cx';
import { TNotification } from '@/types/notification';
import { parseDateTime } from '@/utils/date';
import { isFacilityAdmin, isSuperAdmin } from '@/utils/getUserRole';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { generateInitial } from '@/utils/strings';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Button } from '@repo/ui/components/button';
import { useTranslation } from 'react-i18next';

type NotificationItemProps = {
  item?: TNotification;
  type?: 'popup' | 'page' | 'toast';
  handleNotificationItemClick?: (item?: TNotification) => void;
  handleRequestApprovalClick?: (item?: TNotification) => void;
  handleClose?: () => void;
  withBorder?: boolean;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  type = 'popup',
  withBorder = true,
  handleClose,
  handleNotificationItemClick,
}) => {
  const isToast = type === 'toast';
  const router = useWmsRouter();
  const {
    i18n: { language },
  } = useTranslation();

  const isRequest =
    item?.type.includes('manual_request_created') &&
    (isFacilityAdmin() || isSuperAdmin());

  const isRequestBast =
    item?.type.includes('bast.create_request') &&
    (isFacilityAdmin() || isSuperAdmin());

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRequest) {
      router.push(`/${language}/manual-scale`);
    } else if (isRequestBast) {
      router.push(`/${language}/bast`);
    }
    handleNotificationItemClick?.(item);
  };

  return (
    <button
      id={`trigger-notification-item-${item?.id}`}
      onClick={handleClick}
      className={cx('ui-p-3 ui-text-xs ui-w-full', {
        'ui-bg-[#E2F3FC] ui-cursor-pointer': !isToast && item?.readAt === null,
        'ui-cursor-pointer': item?.downloadUrl || !item?.readAt,
        'ui-border ui-border-gray-300': withBorder,
        'ui-bg-white ui-rounded ui-shadow-lg': isToast,
      })}
    >
      <div className="ui-flex ui-items-center ui-justify-between ui-mb-2">
        <div className="ui-text-primary ui-text-sm ui-font-bold ui-text-left">
          {item && translateNotification(item).title}
        </div>
        <div className="ui-text-[10px] ui-text-semibold ui-text-right ui-text-gray-700">
          {!isToast ? (
            parseDateTime(item?.createdAt, 'DD/MMM/YYYY HH:mm')
              .toUpperCase()
              .replaceAll('/', ' ')
          ) : (
            <Button
              className="ui-p-1 ui-h-7 ui-w-7 ui-text-gray-700"
              variant="subtle"
              onClick={handleClose}
            >
              <XMarkIcon className="ui-h-5 ui-w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="ui-text-dark ui-text-left ui-text-sm ui-mb-2">
        {item && translateNotification(item).message}
      </div>

      <div className="ui-text-xs ui-text-gray-700 ui-text-left ui-mb-2">
        {[item?.entityName, item?.userName].filter(Boolean).join(' • ')}
      </div>

      <div className="ui-flex ui-items-center ui-justify-between ui-text-xs ui-text-gray-700 ui-text-left ui-mb-2">
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
            <p className="ui-text-xs ui-font-bold">WMS</p>
          </button>
        </div>
        {isToast && (
          <div className="ui-text-[10px] ui-text-semibold ui-text-gray-700">
            {parseDateTime(item?.createdAt, 'DD/MMM/YYYY HH:mm')
              .toUpperCase()
              .replaceAll('/', ' ')}
          </div>
        )}
      </div>
    </button>
  );
};

export default NotificationItem;
