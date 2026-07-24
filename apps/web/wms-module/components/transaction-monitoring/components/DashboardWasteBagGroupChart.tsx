import { BarChart } from '@repo/ui/components/chart';
import DashboardBox from './DashboardBox';

import { DataValue } from '@/types/transaction-monitoring';
import useTransactionMonitoring from '../hooks/useTransactionMonitoring';

type Props = Readonly<{
  id: string;
  data?: DataValue;
  color?: string;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  exportFileName: string;
  isBags?: string;
}>;

export default function DashboardWasteBagGroupChart({
  id,
  data,
  color,
  title,
  subtitle,
  isLoading,
  exportFileName,
  isBags,
}: Props) {
  const { handleInformationType } = useTransactionMonitoring();

  return (
    <div className="ui-col-span-4">
      <DashboardBox.Root id={id}>
        <DashboardBox.Header>
          <h4>
            <strong>{title}</strong>
          </h4>
          {subtitle && <p className="ui-text-base">{subtitle}</p>}
        </DashboardBox.Header>
        <DashboardBox.Body>
          <DashboardBox.Config
            download={{
              targetElementId: id,
              fileName: exportFileName,
            }}
          />
          <DashboardBox.Content
            className="ui-h-96"
            isLoading={isLoading}
            isEmpty={!data?.length}
          >
            <BarChart
              data={
                data?.map((item) => ({
                  ...item,
                  label: item.labelType + ' - ' + item.label,
                })) || []
              }
              color={data?.map((item) => item.color || color || '#000000')}
              labelColor="#404040"
              formatValue={(_, ctx) => {
                const value = ctx.dataset.data[ctx.dataIndex] as number;
                return String(
                  handleInformationType(String(isBags), value)?.value
                );
              }}
              tooltipFormatter={{
                label: (context) => {
                  const value = context.parsed.y ?? context.parsed.x ?? 0;
                  const info = handleInformationType(String(isBags), value);
                  return `${info.value}`;
                },
              }}
            />
          </DashboardBox.Content>
        </DashboardBox.Body>
      </DashboardBox.Root>
    </div>
  );
}
