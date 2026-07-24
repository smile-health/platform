import {
  ArrowLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '@repo/ui/components/tabs-link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'src/lib/cx';

import { getAuthTokenStorage } from '@/utils/storage/auth';
import { toast } from '@repo/ui/components/toast';
import Header from './Header';
import Navbar from './Navbar';

export type AppLayoutProps = {
  children: ReactNode;
  title?: string;
  subTitle?: string;
  tabs?: Array<{ label: string; url: string }>;
  showActionButton?: boolean;
  backButton?: {
    label?: string;
    onClick?: () => void;
    show?: boolean;
  };
  actionButtons?: Array<{ label: string; url: string; id?: string }>;
  showInformation?: boolean;
  onClickInformation?: VoidFunction;
};

const setBaseUrl = (url: string) => url.split('?')[0];

const AppLayout: React.FC<AppLayoutProps> = (props) => {
  const {
    children,
    title,
    subTitle,
    tabs,
    showActionButton,
    backButton = {
      show: false,
    },
    actionButtons,
    showInformation,
    onClickInformation,
  } = props;

  const { t, i18n: locale } = useTranslation(['common']);
  const lang = locale.language;

  const router = useRouter();
  const { asPath } = router;

  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const handleClickBack = () => {
    if (backButton?.onClick) {
      backButton.onClick();
      return;
    }

    router.back();
  };

  useEffect(() => {
    setIsLoading(true);

    const token = getAuthTokenStorage();

    if (token) {
      setIsLoading(false);
      setIsLogin(true);
    } else {
      setIsLoading(false);
      setIsLogin(false);

      toast.danger({
        title: 'Error',
        description: 'Token not found',
      });

      window.location.replace(
        `${process.env.NEXT_PUBLIC_URL_FE_SMILE}/${lang}/v5/login`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLogin) {
    return (
      <div className="no-print">
        <Header />
        <Navbar />

        {isLoading && (
          <div className="ui-flex ui-justify-center">
            <Spinner className="ui-my-8 ui-w-5" />
          </div>
        )}

        <div className="ui-container ui-mx-auto ui-p-6 ui-min-h-[500px]">
          {backButton?.show && (
            <Button
              leftIcon={<ArrowLeftIcon className="ui-h-5" />}
              variant="subtle"
              onClick={handleClickBack}
            >
              {backButton.label ?? t('common:back')}
            </Button>
          )}
          {title && (
            <div
              className={cx('ui-mx-auto', {
                'ui-flex  ui-flex-row ui-justify-between ui-flex-wrap':
                  showActionButton,
              })}
            >
              {showActionButton && <div className="ui-w-1/4" />}
              <div
                className={cx('ui-mx-auto ui-mt-2', {
                  'ui-flex ui-items-center ui-justify-center ui-gap-2':
                    showInformation,
                  'ui-mb-6': !!tabs,
                  'ui-mb-8': !tabs,
                  '!ui-flex-grow': showActionButton,
                })}
              >
                <h2 className="ui-font-bold ui-text-2xl ui-text-center">
                  {title}
                </h2>
                {showInformation && (
                  <InformationCircleIcon
                    className="ui-size-7 ui-text-dark-blue ui-cursor-pointer"
                    onClick={onClickInformation}
                  />
                )}
              </div>
              {subTitle && (
                <h2
                  className={cx(
                    'ui-font-bold ui-text-xl ui-text-center ui-text-dark-teal',
                    {
                      'ui-mb-6': !!tabs,
                      'ui-mb-8': !tabs,
                      '!ui-flex-grow': showActionButton,
                    }
                  )}
                >
                  {subTitle}
                </h2>
              )}
              {showActionButton && (
                <div className="ui-flex ui-justify-end ui-space-x-3">
                  {actionButtons?.map((item) => {
                    return (
                      <Button
                        key={`layout-action-button-${item.id}`}
                        id={item.id ?? 'btn-action'}
                        onClick={() => router.push(item.url)}
                        color="primary"
                        variant="outline"
                        className="!ui-mt-[5px]"
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tabs && (
            <TabsLinkRoot variant="default">
              <TabsLinkList>
                {tabs.map((item) => {
                  return (
                    <TabsLinkTrigger
                      id={`tab-${item?.label?.toLowerCase()}`}
                      key={item.label}
                      href={item.url}
                      active={setBaseUrl(asPath) === item.url}
                    >
                      {item.label}
                    </TabsLinkTrigger>
                  );
                })}
              </TabsLinkList>
            </TabsLinkRoot>
          )}

          {children}
        </div>

        <div className="ui-py-20 ui-text-center">
          &copy; {new Date().getFullYear()} SMILE | UNDP
        </div>
      </div>
    );
  }

  return null;
};

export default AppLayout;
