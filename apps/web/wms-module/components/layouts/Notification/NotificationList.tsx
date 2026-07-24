import NotificationWithRequestApproval from '@/components/notification/components/NotificationWithRequestApproval';
import { TNotification } from '@/types/notification';

type NotificationListProps = {
  data?: TNotification[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  t: any;
  handleNotificationItemClick: (item: TNotification) => void;
};

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const {
    data,
    isLoading,
    isError,
    isSuccess,
    t,
    handleNotificationItemClick,
  } = props;

  if (isLoading && data?.length === 0) {
    return (
      <div className="ui-flex ui-items-center ui-justify-center ui-h-24 ui-text-gray-700">
        {t('notification.loading')}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ui-flex ui-items-center ui-justify-center ui-h-24 ui-text-gray-700">
        {t('notification.error')}
      </div>
    );
  }

  if (isSuccess && data?.length === 0) {
    return (
      <div className="ui-flex ui-items-center ui-justify-center ui-h-24 ui-text-gray-700">
        {t('notification.no_data')}
      </div>
    );
  }

  return (
    <>
      {data?.map((item: TNotification) => (
        <NotificationWithRequestApproval
          key={item.id}
          item={item}
          handleNotificationItemClick={handleNotificationItemClick}
        />
      ))}
    </>
  );
};

export default NotificationList;
