import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { ButtonIcon } from '@repo/ui/components/button-icon';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import Download from '@repo/ui/components/icons/Download';
import { OptionType, ReactSelect } from '@repo/ui/components/react-select';
import { GlobalSpinner } from '@repo/ui/components/spinner';
import cx from '@/lib/cx';

import { Values } from 'nuqs';
import { useTranslation } from 'react-i18next';

import { DEFAULT_DOWNLOAD_EXTENSIONS } from '../constants/transaction-monitoring.constant';
import { exportElement } from '@repo/ui/utils/download';

type Provider = {
  filter: Values<Record<string, any>>;
  colorClass?: string;
  onDownloadAsCSV?: VoidFunction;
};

const DashboardBoxContext = createContext<Provider>({
  filter: {},
});

export function DashboardBoxProvider({
  filter,
  colorClass,
  onDownloadAsCSV,
  children,
}: PropsWithChildren<Provider>) {
  const contextValue = useMemo(() => {
    return {
      filter,
      colorClass,
      onDownloadAsCSV,
    };
  }, [filter, colorClass, onDownloadAsCSV]);

  return (
    <DashboardBoxContext.Provider value={contextValue}>
      <div className="ui-space-y-6 mt-6">{children}</div>
    </DashboardBoxContext.Provider>
  );
}

export function DashboardBoxRoot({
  id,
  children,
}: PropsWithChildren<{ id: string }>) {
  return (
    <div id={id} className="ui-border ui-border-neutral-300 ui-rounded">
      {children}
    </div>
  );
}

export function DashboardBoxHeader({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { colorClass } = useContext(DashboardBoxContext);

  return (
    <div
      className={cx(
        'ui-p-5 ui-rounded-t-[inherit] ui-border-b ui-border-neutral-200 ui-text-center ui-text-lg ui-bg-slate-100 ui-space-y-2',
        colorClass
      )}
    >
      {children}
    </div>
  );
}

export function DashboardBoxBody({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <div className="ui-relative ui-p-4 ui-space-y-4">{children}</div>;
}

type DashboardBoxConfigProps = Readonly<{
  download: {
    targetElementId: string;
    fileName: string;
    extensions?: Array<string>;
  };
  sort?: {
    show?: boolean;
    value: OptionType | null;
    onChange: (option: OptionType) => void;
    placeholder?: string;
  };
}>;

export function DashboardBoxConfig({
  sort,
  download,
}: DashboardBoxConfigProps) {
  const { filter, onDownloadAsCSV } = useContext(DashboardBoxContext);
  const { t } = useTranslation('transactionMonitoring');

  const provinceLabel = filter?.provinceMonitoring?.label;
  const regencyLabel = filter?.regencyMonitoring?.label;
  const entityLabel = filter?.healthcareFacilityMonitoring?.label;
  const isAllRegion = !provinceLabel && !regencyLabel && !entityLabel;

  const downloadExtensions =
    download?.extensions ?? DEFAULT_DOWNLOAD_EXTENSIONS;

  return (
    <div className="ui-relative ui-flex ui-justify-center ui-items-center ui-min-h-10">
      <div className="ui-relative ui-space-y-1 ui-text-center">
        {isAllRegion ? (
          <h6>{t('all_regions')}</h6>
        ) : (
          <>
            {entityLabel && (
              <p>
                <strong>{entityLabel}</strong>
              </p>
            )}
            <p>
              {regencyLabel ? `${regencyLabel},` : null} {provinceLabel}
            </p>
          </>
        )}
      </div>
      <div className="ui-absolute ui-right-0 ui-flex ui-justify-end ui-items-center ui-gap-4">
        {sort?.show && (
          <ReactSelect
            data-testid="sort"
            placeholder={sort?.placeholder}
            value={sort?.value}
            onChange={sort?.onChange}
            isClearable
            options={[
              {
                label: t('sort.asc'),
                value: 'ASC',
              },
              {
                label: t('sort.desc'),
                value: 'DESC',
              },
            ]}
          />
        )}
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <ButtonIcon size="lg" variant="default">
              <Download className="ui-size-5" />
            </ButtonIcon>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {downloadExtensions?.map((item) => (
              <DropdownMenuItem
                key={item}
                onClick={() => {
                  if (item === 'xlsx' && onDownloadAsCSV) {
                    onDownloadAsCSV();
                  } else {
                    exportElement(
                      download.targetElementId,
                      item,
                      download.fileName
                    );
                  }
                }}
              >
                {t('export_as', {
                  type: item.toUpperCase(),
                })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>
    </div>
  );
}

export type DashboardBoxContentProps = PropsWithChildren<{
  isEmpty?: boolean;
  className?: string;
  isLoading?: boolean;
}>;

export function DashboardBoxContent({
  isEmpty,
  children,
  className,
  isLoading,
}: DashboardBoxContentProps) {
  const { t } = useTranslation('transactionMonitoring');

  return (
    <div
      className={cx(
        'ui-min-h-40 ui-w-full ui-overflow-x-hidden',
        {
          'ui-grid ui-place-items-center': isLoading || isEmpty,
          'ui-text-primary-500 ui-max-h-40': isLoading,
        },
        className
      )}
    >
      {isLoading && <GlobalSpinner />}
      {isEmpty && <p className="ui-text-gray-500 ui-text-sm">{t('empty')}</p>}
      {!isLoading && !isEmpty && children}
    </div>
  );
}

const DashboardBox = {
  Provider: DashboardBoxProvider,
  Root: DashboardBoxRoot,
  Header: DashboardBoxHeader,
  Body: DashboardBoxBody,
  Config: DashboardBoxConfig,
  Content: DashboardBoxContent,
};

export default DashboardBox;
