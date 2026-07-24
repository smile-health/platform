import NotificationItem from "#components/layouts/AppLayout/NotificationItem"
import { ActionButtonType } from "#hooks/useNotification"
import { TNotification } from "#types/notification"

type NotificationCellProps = Readonly<{
  item: TNotification
  handleNotificationItemClick: (item: TNotification) => void
  handleActionButtonItemClick: (actionType: ActionButtonType, item: TNotification) => void | Window | Promise<boolean> | null
}>

function NotificationCell({
  item,
  handleNotificationItemClick,
  handleActionButtonItemClick,
}: NotificationCellProps) {
  return (
    <NotificationItem
      type="page"
      withBorder={false}
      item={item}
      handleNotificationItemClick={handleNotificationItemClick}
      handleActionButtonItemClick={handleActionButtonItemClick}
    />
  )
}

export default NotificationCell
