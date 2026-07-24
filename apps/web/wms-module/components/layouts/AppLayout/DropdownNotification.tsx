import { Button } from '@repo/ui/components/button';
import Bell from '@repo/ui/components/icons/Bell';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotification } from '@/components/notification/hooks/useNotification';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import NotificationList from '../Notification/NotificationList';

const DropdownNotification = () => {
  const ref = useRef(null);
  const router = useWmsRouter();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const handleSeeMore = () => {
    setShow((prev) => !prev);
    router.push(`/${language}/notification`);
  };

  const {
    show,
    data,
    count,
    setShow,
    isPendingRead,
    isPendingReadAll,
    isLoading,
    handleNotificationItemClick,
    handleMarkAllAsRead,
  } = useNotification();

  return (
    <div className="ui-relative" ref={ref}>
      <button
        id="trigger-notification"
        className="hover:text-blue-700 relative ui-text-blue-800 ui-cursor-pointer"
        onClick={() => setShow((prev) => !prev)}
      >
        <Bell className="ui-mt-3" />
        {count > 0 && (
          <div
            className={`ui-absolute ui-flex ui-items-center ui-justify-center ui-h-5 ui-text-xs ui-text-white ui-bg-red-600 ui-rounded-full ui-left-0 ${
              count < 10 ? 'ui-w-7' : 'ui-w-8'
            } ui-top-[-4px]`}
          >
            {count > 99 ? '99+' : count}
          </div>
        )}
      </button>
      {show && (
        <div className="ui-absolute ui-z-20 ui-bg-white ui-border ui-border-gray-300 ui-rounded-lg ui-shadow-xl ui-left-[-300px] ui-w-[25rem]">
          <div className="ui-flex ui-justify-between ui-items-center ui-px-6 ui-py-2 ui-text-sm ui-border-b ui-border-gray-300 ui-h-[64px]">
            <div className="text-dark font-semibold">
              {t('notification.title')}
            </div>
            {count !== 0 && (
              <Button
                variant="subtle"
                className="ui-text-primary-500"
                onClick={handleMarkAllAsRead}
                id="notification-read-all"
                loading={isPendingRead || isPendingReadAll}
              >
                {isPendingRead || isPendingReadAll
                  ? t('notification.loading')
                  : t('notification.mark_all_as_read')}
              </Button>
            )}
            {isLoading && (
              <div className="ui-text-gray-600">
                {t('notification.refreshing')}
              </div>
            )}
          </div>
          <div>
            <NotificationList
              data={data?.data.data}
              isLoading={false}
              isError={false}
              isSuccess={true}
              t={t}
              handleNotificationItemClick={handleNotificationItemClick}
            />

            <div className="ui-flex ui-items-center ui-justify-between ui-px-3 ui-py-3 ui-text-sm ui-border-t ui-border-gray-300">
              <Button
                variant="subtle"
                className="ui-text-primary-500 ui-mx-auto"
                onClick={handleSeeMore}
                id="navbar-notification"
              >
                {t('notification.more')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNotification;
