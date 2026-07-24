import { useState } from 'react';
import { BarChart } from '@repo/ui/components/chart';
import { OptionType } from '@repo/ui/components/react-select';
import DashboardBox from '../DashboardBox';
import { Values } from 'nuqs';
import useGetRegencyChart from '../../hooks/useGetRegencyChart';
import useTransactionMonitoring from '../../hooks/useTransactionMonitoring';

type Props = Readonly<{
  id: string;
  color?: string;
  filter: Values<Record<string, any>>;
  exportFileName: string;
  sortPlaceholder: string;
}>;

export default function DashboardWasteBagRegencyChart({
  id,
  color,
  filter,
  exportFileName,
  sortPlaceholder,
}: Props) {
  const [sort, setSort] = useState<OptionType | null>(null);

  const { data, isLoading } = useGetRegencyChart(filter, sort);
  const { handleInformationType } = useTransactionMonitoring();

  return (
    <DashboardBox.Body>
      <DashboardBox.Config
        download={{
          targetElementId: id,
          fileName: exportFileName,
        }}
        sort={{
          show: true,
          value: sort,
          onChange: setSort,
          placeholder: sortPlaceholder,
        }}
      />
      <DashboardBox.Content
        isLoading={isLoading}
        isEmpty={!data?.length}
        className="ui-overflow-y-auto"
      >
        <BarChart
          data={data}
          layout="horizontal"
          color={color}
          labelColor="primary"
          formatValue={(_, ctx) => {
            const value = ctx.dataset.data[ctx.dataIndex] as number;
            return String(
              handleInformationType(String(filter?.isBags), value)?.value
            );
          }}
          tooltipFormatter={{
            label: (context) => {
              const value = context.parsed.x ?? context.parsed.y ?? 0;
              const info = handleInformationType(String(filter?.isBags), value);
              return `${info.value}`;
            },
          }}
        />
      </DashboardBox.Content>
    </DashboardBox.Body>
  );
}
