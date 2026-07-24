import { BarChart } from '@repo/ui/components/chart';
import DashboardBox from './DashboardBox';
import { Values } from 'nuqs';

import { useState } from 'react';
import { OptionType } from '@repo/ui/components/react-select';
import useGetWasteBagCharacteristicChart from '../hooks/useGetWasteBagCharacteristicChart';
import useTransactionMonitoring from '../hooks/useTransactionMonitoring';

type Props = Readonly<{
  id: string;
  color?: string;
  title: string;
  subtitle?: string;
  exportFileName: string;
  sortPlaceholder: string;
  filter: Values<Record<string, any>>;
}>;

export default function DashboardWasteBagCharacteristicChart({
  id,
  color,
  title,
  subtitle,
  exportFileName,
  sortPlaceholder,
  filter,
}: Props) {
  const [sort, setSort] = useState<OptionType | null>(null);

  const { data, isLoading } = useGetWasteBagCharacteristicChart(filter, sort);
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
            sort={{
              show: true,
              value: sort,
              onChange: setSort,
              placeholder: sortPlaceholder,
            }}
          />
          <DashboardBox.Content isLoading={isLoading} isEmpty={!data?.length}>
            <BarChart
              data={data || []}
              color={color}
              labelColor="#404040"
              layout="horizontal"
              formatValue={(_, ctx) => {
                const value = ctx.dataset.data[ctx.dataIndex] as number;
                return String(
                  handleInformationType(String(filter?.isBags), value)?.value
                );
              }}
              tooltipFormatter={{
                label: (context) => {
                  const value = context.parsed.x ?? context.parsed.y ?? 0;
                  const info = handleInformationType(
                    String(filter?.isBags),
                    value
                  );
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
