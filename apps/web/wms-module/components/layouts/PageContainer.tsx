import { FC, Fragment, PropsWithChildren } from 'react';

import AppLayout, { AppLayoutProps } from './AppLayout/AppLayout';

export type ContainerProps = Pick<
  AppLayoutProps,
  'subTitle' | 'tabs' | 'backButton' | 'showInformation' | 'onClickInformation'
> & {
  title: string;
  hideTabs?: boolean;
  withLayout?: boolean;
};

const Container: FC<PropsWithChildren<ContainerProps>> = ({
  title,
  subTitle,
  withLayout,
  hideTabs,
  tabs,
  children,
  backButton,
  showInformation,
  onClickInformation,
}) => {
  if (withLayout) {
    return (
      <AppLayout
        title={title}
        subTitle={subTitle}
        tabs={hideTabs ? undefined : tabs}
        backButton={backButton}
        showInformation={showInformation}
        onClickInformation={onClickInformation}
      >
        {children}
      </AppLayout>
    );
  }

  return <Fragment>{children}</Fragment>;
};

export default Container;
