import { NextPage, NextPageContext } from 'next';

import { LocaleProvider } from './../context/localeContext';
import { isLocale } from './../translations/types';

export interface WithLocaleProps {
  locale?: string;
  [key: string]: any;
}

const withLocale = <P extends object>(WrappedPage: NextPage<P>) => {
  const WithLocalePage: NextPage<P & WithLocaleProps> = (props) => {
    const { locale, ...pageProps } = props;
    return (
      <LocaleProvider lang={locale || 'id'}>
        <WrappedPage {...(pageProps as P)} />
      </LocaleProvider>
    );
  };

  WithLocalePage.getInitialProps = async (ctx: NextPageContext) => {
    let wrappedPageProps = {};

    if (WrappedPage.getInitialProps) {
      wrappedPageProps = await WrappedPage.getInitialProps(ctx);
    }

    const queryLang = ctx.query?.lang;
    const locale: string | undefined =
      typeof queryLang === 'string' && isLocale(queryLang)
        ? queryLang
        : undefined;

    return {
      ...(wrappedPageProps as P),
      locale,
    };
  };

  return WithLocalePage;
};

export default withLocale;
