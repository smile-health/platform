import { ReactNode, useMemo } from 'react'
import { EmptyState } from '#components/empty-state'
import Container from '#components/layouts/PageContainer'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { useProgramPlanDetailData } from '../hooks/useProgramPlanDetailData'
import ProgramPlanDetailContext from '../libs/program-plan-detail.context'
import ProgramPlanApproachBox from './ProgramPlanApproachBox'

type TProps = {
  children: ReactNode
  isGlobal?: boolean
  onMarkAsFinal?: () => void
  isFinal?: boolean
}

const ProgramPlanListDetailContainer: React.FC<TProps> = ({
  children,
  isGlobal,
}: TProps) => {
  const { t } = useTranslation(['common', 'programPlan'])

  const {
    basePath,
    pathname,
    query: { lang, program, id },
    push,
  } = useSmileRouter() as {
    basePath: string
    pathname: string
    query: { lang?: string; program?: string; id?: string }
    push: (path: string) => void
  }

  const {
    detailProgramPlanData,
    isLoadingDetailProgramPlan,
    isFetchingDetailProgramPlan,
  } = useProgramPlanDetailData(isGlobal)

  useSetLoadingPopupStore(
    isLoadingDetailProgramPlan || isFetchingDetailProgramPlan
  )

  const routerPath = `${basePath}/${lang}/${program}/v5/program-plan/${id}`
  const tabs = useMemo(
    () => [
      {
        id: 'program_plan_detail_target_group_tab',
        label: t('programPlan:tabs.target_group'),
        href: `${routerPath}/target-group`,
        hidden: !hasPermission('annual-planning-target-group-view'),
      },
      {
        id: 'program_plan_detail_population_tab',
        label: t('programPlan:tabs.population'),
        href: `${routerPath}/population`,
        hidden: !hasPermission('population-view'),
      },
      {
        id: 'program_plan_detail_task_tab',
        label: t('programPlan:tabs.task'),
        href: `${routerPath}/task`,
        hidden: !hasPermission('task-view'),
      },
      {
        id: 'program_plan_detail_ratio_tab',
        label: t('programPlan:tabs.material_ratio'),
        href: `${routerPath}/ratio`,
        hidden: !hasPermission('program-plan-material-ratio-view'),
      },
      {
        id: 'program_plan_detail_substitution_tab',
        label: t('programPlan:tabs.material_substitution'),
        href: `${routerPath}/substitution`,
        hidden: !hasPermission('annual-planning-substitution-view'),
      },
    ],
    [t, routerPath]
  )

  const contextValue = useMemo(
    () => ({
      detailProgramPlanData: detailProgramPlanData ?? null,
    }),
    [detailProgramPlanData]
  )

  if (
    !detailProgramPlanData &&
    !isGlobal &&
    !isLoadingDetailProgramPlan &&
    !isFetchingDetailProgramPlan
  ) {
    return (
      <Container
        title={t('common:error.404_data.title')}
        withLayout
        backButton={{
          label: t('common:back_to_list'),
          show: true,
          onClick: () => {
            push('/v5/program-plan')
          },
        }}
      >
        <EmptyState
          withIcon
          description={t('common:error.404_data.description')}
        />
      </Container>
    )
  }

  return (
    <ProgramPlanDetailContext.Provider value={contextValue}>
      <Container
        title={`${t('programPlan:title')} ${detailProgramPlanData?.year ?? ''}`}
        withLayout={!isGlobal}
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push('/v5/program-plan')
          },
        }}
      >
        {!isGlobal && (
          <div className="ui-mt-6">
            <div className="ui-mb-6">
              <ProgramPlanApproachBox />
            </div>
            <TabsLinkRoot variant="pills" align="center">
              <TabsLinkList className="!ui-flex !ui-justify-center !ui-items-center !ui-w-full">
                {tabs?.map((item) => {
                  const isActive =
                    pathname?.split('/').pop() === item?.href?.split('/').pop()
                  if (item.hidden) return null
                  return (
                    <TabsLinkTrigger
                      {...item}
                      data-testid={item?.id}
                      key={item?.label}
                      active={isActive}
                      className="ui-justify-center ui-text-center !ui-w-full !ui-h-full"
                    >
                      {item?.label}
                    </TabsLinkTrigger>
                  )
                })}
              </TabsLinkList>
            </TabsLinkRoot>
          </div>
        )}
        {children}
      </Container>
    </ProgramPlanDetailContext.Provider>
  )
}

export default ProgramPlanListDetailContainer
