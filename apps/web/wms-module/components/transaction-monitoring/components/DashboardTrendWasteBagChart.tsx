import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import DashboardBox from './DashboardBox';
import { useTranslation } from 'react-i18next';

import { DataValue } from '@/types/transaction-monitoring';
import { formatMonthYear } from '../utils/helper';
import useTransactionMonitoring from '../hooks/useTransactionMonitoring';
import LineChart from './LineChart';

type Props = Readonly<{
  id: string;
  data?: DataValue;
  color?: string;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  exportFileName: string;
  information?: {
    show?: boolean;
    title: string;
    description: string;
  };
  isBags?: string;
}>;

export default function DashboardTrendWasteBagChart({
  id,
  data,
  color,
  title,
  subtitle,
  isLoading,
  information,
  exportFileName,
  isBags,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [open, setOpen] = useState(false);
  const { handleInformationType } = useTransactionMonitoring();

  return (
    <DashboardBox.Root id={id}>
      <DashboardBox.Header>
        {information && (
          <Dialog
            open={open && information?.show}
            onOpenChange={setOpen}
            className="ui-z-20"
          >
            <DialogHeader className="ui-text-center">
              {information?.title}
            </DialogHeader>
            <DialogContent>{information?.description}</DialogContent>
            <DialogFooter className="ui-grid ui-grid-cols-1">
              <Button variant="outline" onClick={() => setOpen(!open)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </Dialog>
        )}
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-2">
          <h4>
            <strong>{title}</strong>
          </h4>
          {information?.show && (
            <button onClick={() => setOpen(true)}>
              <InformationCircleIcon className="ui-size-6" />
            </button>
          )}
        </div>
        {subtitle && <p className="ui-text-base">{subtitle}</p>}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: id,
            fileName: exportFileName,
          }}
        />
        <DashboardBox.Content isLoading={isLoading} isEmpty={!data?.length}>
          <LineChart
            data={
              data?.map((item) => ({
                ...item,
                label: formatMonthYear(item.label, language),
              })) || []
            }
            color={color}
            formatValue={(value, ctx) =>
              String(handleInformationType(String(isBags), value)?.value)
            }
            tooltipFormatter={(value, label, ctx) => {
              const info = handleInformationType(String(isBags), value);
              return `${label}: ${info.value}`;
            }}
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  );
}
