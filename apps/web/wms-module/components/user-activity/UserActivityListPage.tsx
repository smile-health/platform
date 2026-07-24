import { UseFilter, useFilter } from '@repo/ui/components/filter';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import UserActivityFilter from './components/UserActivityFilter';
import { getUserActivityTabs } from './constants/user-activity.constant';
import userActivityFilterSchema from './schemas/userActivityFilterSchema';
import TooltipModal from '@/components/TooltipModal';

export default function UserActivityPage() {
  usePermission('user-activity-view');

  const {
    t,
    i18n: { language },
  } = useTranslation('userActivity');
  const chartRef = useRef<{ getChart: VoidFunction }>(null);

  const [openInformation, setOpenInformation] = useState(false);
  const [tab, setTab] = useState<string>('overview');

  const filterSchema = useMemo<UseFilter>(
    () => userActivityFilterSchema(t, language),
    [t, language]
  );

  const filter = useFilter(filterSchema);
  const tabs = getUserActivityTabs(t);

  return (
    <Container
      title={t('title.page')}
      withLayout
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | User activity`} />
      <div className="ui-mt-6 ui-space-y-6">
        <TooltipModal
          open={openInformation}
          setOpen={setOpenInformation}
          title={t('information.title')}
          description={t('information.description')}
        />
        <UserActivityFilter
          filter={filter}
          isDisabledExport={tab === 'overview'}
          onSearch={() => {
            if (tab === 'overview') {
              chartRef.current?.getChart();
            }
          }}
        />
        <TabsRoot variant="pills" align="center" defaultValue="overview">
          <TabsList>
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                onClick={() => {
                  setTab(item.id);
                  if (item.id === 'overview') {
                    chartRef.current?.getChart();
                  }
                }}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => {
            const Content = item.component;
            return (
              <TabsContent key={item.id} value={item.id}>
                <Content ref={chartRef} filter={filter?.query} />
              </TabsContent>
            );
          })}
        </TabsRoot>
      </div>
    </Container>
  );
}
