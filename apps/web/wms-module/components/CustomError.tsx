'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { TListErrorCode } from '@/types/error';
import { Button } from '@repo/ui/components/button';
import BadGatewayIcon from '@repo/ui/components/icons/BadGatewayIcon';
import ErrorConnectionIcon from '@repo/ui/components/icons/ErrorConnectionIcon';
import ForbiddenIcon from '@repo/ui/components/icons/ForbiddenIcon';
import GatewayTimeoutIcon from '@repo/ui/components/icons/GatewayTimeoutIcon';
import NotFoundDataIcon from '@repo/ui/components/icons/NotFoundDataIcon';
import NotFoundPagesIcon from '@repo/ui/components/icons/NotFoundPagesIcon';
import ServerErrorIcon from '@repo/ui/components/icons/ServerErrorIcon';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type Props = {
  error?: TListErrorCode;
  withLayout?: boolean;
  hideTabs?: boolean;
};

const CustomError: React.FC<Props> = ({
  error = '404_pages',
  withLayout,
  hideTabs,
}) => {
  const {
    i18n: { language },
    t,
  } = useTranslation();

  const [queryError, setQueryError] = useState<string | null>(null);

  // Only run on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const errorParam = urlParams.get('error');
      setQueryError(errorParam);
    }
  }, []);

  const errorState = {
    '403': { icon: <ForbiddenIcon />, title: 'Forbidden', action: 'redirect' },
    '404_pages': {
      icon: <NotFoundPagesIcon />,
      title: 'Pages Not Found',
      action: 'redirect',
    },
    '404_data': {
      icon: <NotFoundDataIcon />,
      title: 'Data Not Found',
      action: 'redirect',
    },
    '500': {
      icon: <ServerErrorIcon />,
      title: 'Internal Server Error',
      action: 'reload',
    },
    '502': { icon: <BadGatewayIcon />, title: 'Bad Gateway', action: 'reload' },
    '504': {
      icon: <GatewayTimeoutIcon />,
      title: 'Gateway Timeout',
      action: 'reload',
    },
    connection: {
      icon: <ErrorConnectionIcon />,
      title: 'Not Connection',
      action: 'reload',
    },
  };

  const currentError = (
    queryError === 'data' ? '404_data' : error
  ) as TListErrorCode;

  const handleAction = () => {
    if (typeof window === 'undefined') return;

    if (errorState[currentError].action === 'redirect') {
      window.location.replace(`/${language}`);
    } else if (errorState[currentError].action === 'reload') {
      window.location.reload();
    }
  };

  return (
    <Container title="" withLayout={withLayout} hideTabs={hideTabs}>
      <Meta title={`WMS | ${errorState[currentError].title}`} />

      <main className="ui-bg-white ui-grid ui-place-items-center ui-my-28">
        <div className="ui-flex ui-flex-col ui-gap-6 ui-items-center ui-max-w-[560px]">
          {currentError && errorState[currentError].icon}
          <h1 className="ui-text-2xl ui-font-semibold ui-text-primary-700">
            {t(`error.${currentError}.title`)}
          </h1>
          <div className="ui-space-y-4">
            <Trans i18nKey={`error.${currentError}.description`} />
            <br />
            <br />
            <div>
              <p className="ui-text-base ui-text-primary-700">
                {t(`error.${currentError}.list.title`)}
              </p>
              <Trans>
                <ul className="ui-text-primary-700 ui-list-disc ui-ml-6">
                  {(
                    t(`error.${currentError}.list.content`, {
                      returnObjects: true,
                    }) as string[]
                  ).map((x) => (
                    <li key={`error-content-${x}`}>{x}</li>
                  ))}
                </ul>
              </Trans>
            </div>
            {t(`error.${currentError}.list.description`) && (
              <p className="ui-text-base ui-text-primary-700">
                {t(`error.${currentError}.list.description`)}
              </p>
            )}
            <Button
              className="ui-w-full"
              type="button"
              variant="solid"
              onClick={handleAction}
            >
              {t(`error.${currentError}.button`)}
            </Button>
          </div>
        </div>
      </main>
    </Container>
  );
};

export default CustomError;
