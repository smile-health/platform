import { ReactNode } from 'react';
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@repo/ui/components/tabs';

import DashboardBox from './DashboardBox';
import { TDashboardTabs } from '@/types/transaction-monitoring';

type Props<T extends string> = Readonly<{
  id: string;
  setTab: (tab: T) => void;
  tabList: TDashboardTabs<T>[];
  renderChild: (item: TDashboardTabs<T>) => ReactNode;
  defaultActiveTab: string;
  title: string;
  subtitle?: string;
}>;

export default function DashboardTabs<T extends string>({
  id,
  setTab,
  tabList,
  renderChild,
  defaultActiveTab,
  title,
  subtitle,
}: Props<T>) {
  return (
    <TabsRoot variant="pills" defaultValue={defaultActiveTab} align="stretch">
      <DashboardBox.Root id={id}>
        <DashboardBox.Header>
          <h4>
            <strong>{title}</strong>
          </h4>
          {subtitle && <p className="ui-text-base">{subtitle}</p>}
          <TabsList className="ui-grid auto-cols-fr ui-grid-flow-col">
            {tabList?.map((item) => (
              <TabsTrigger
                key={item?.id}
                value={item?.id}
                className="ui-justify-center ui-text-base ui-px-2"
                onClick={() => setTab(item?.id)}
              >
                {item?.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </DashboardBox.Header>
        {tabList?.map((item) => {
          return (
            <TabsContent key={item?.id} value={item?.id}>
              {renderChild(item)}
            </TabsContent>
          );
        })}
      </DashboardBox.Root>
    </TabsRoot>
  );
}
