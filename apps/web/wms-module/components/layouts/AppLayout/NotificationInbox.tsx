import { Inbox } from '@novu/nextjs';
import { useCounts } from '@novu/nextjs/hooks';
import Bell from '@repo/ui/components/icons/Bell';
import { useRouter } from 'next/router';

import { getUserStorage } from '@/utils/storage/user';

const NOTIFICATION_TAGS = ['wms'];

const NotificationBell = ({
  renderIcon,
}: {
  renderIcon: (unreadCount: number) => React.ReactNode;
}) => {
  const { counts } = useCounts({
    filters: [{ read: false, tags: NOTIFICATION_TAGS }],
  });
  const unreadCount = counts?.[0]?.count ?? 0;

  return <>{renderIcon(unreadCount)}</>;
};

const NotificationInbox = () => {
  const router = useRouter();
  const user = getUserStorage();
  const subscriberId = user?.id ? String(user.id) : '6a754a8c18ab4890527ed248';
  const applicationIdentifier =
    process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;
  const backendUrl = process.env.NEXT_PUBLIC_NOVU_BACKEND_URL;
  const socketUrl = process.env.NEXT_PUBLIC_NOVU_SOCKET_URL;

  if (!applicationIdentifier) {
    return null;
  }

  return (
    <Inbox
      applicationIdentifier={applicationIdentifier}
      subscriberId={subscriberId}
      {...(backendUrl ? { backendUrl } : {})}
      {...(socketUrl ? { socketUrl } : {})}
      tabs={[{ label: 'Notifications', filter: { tags: NOTIFICATION_TAGS } }]}
      appearance={{
        variables: {
          colorPrimary: '#004990',
          colorPrimaryForeground: '#FFFFFF',
          colorSecondary: '#1e40af',
          colorSecondaryForeground: '#FFFFFF',
          colorCounter: '#DC2626',
          colorCounterForeground: '#FFFFFF',
          colorBackground: '#FFFFFF',
          colorRing: '#004990',
          colorForeground: '#414042',
          colorNeutral: '#E5E5E5',
          colorSeverityHigh: '#004990',
          colorSeverityMedium: '#1e40af',
          colorSeverityLow: '#E5E5E5',
          borderRadius: '8px',
          fontSize: '16px',
        },
        elements: {
          bellContainer: 'flex items-center',
          bellIcon: {
            color: '#1e40af',
          },
          notification: ({ notification }) =>
            notification.isRead ? 'bg-white' : 'bg-blue-50',
          notificationBar: 'hidden',
        },
      }}
      placement="bottom-start"
      placementOffset={10}
      routerPush={(path) => router.push(path)}
      renderBell={() => (
        <NotificationBell
          renderIcon={(unreadCount) => (
            <div className="ui-relative ui-inline-flex ui-cursor-pointer">
              <Bell className="ui-text-blue-800" />
              {unreadCount > 0 && (
                <div
                  className="ui-absolute ui-top-[-6px] ui-right-[-6px] ui-flex ui-items-center ui-justify-center ui-min-w-[16px] ui-h-4 ui-px-[3px] ui-text-[10px] ui-leading-none ui-font-semibold ui-text-white ui-bg-red-600 ui-rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
          )}
        />
      )}
    />
  );
};

export default NotificationInbox;
