import { TNotification } from "#types/notification";
import { ColumnDef } from "@tanstack/react-table";
import NotificationCell from "./components/NotificationCell";
import { ActionButtonType } from "#hooks/useNotification";

type ColumnsProps = {
  handleNotificationItemClick: (item: TNotification) => void
  handleActionButtonClick: (actionType: ActionButtonType, item: TNotification) => void | Window | Promise<boolean> | null
}

export const createColumns = ({ handleNotificationItemClick, handleActionButtonClick }: ColumnsProps): ColumnDef<TNotification>[] => [
  {
    header: '',
    accessorKey: 'type',
    meta: {
      cellClassName: '!ui-p-0',
    },
    cell: ({ row }) => (
      <NotificationCell
        item={row?.original}
        handleNotificationItemClick={handleNotificationItemClick}
        handleActionButtonItemClick={handleActionButtonClick}
      />
    ),
  },
]