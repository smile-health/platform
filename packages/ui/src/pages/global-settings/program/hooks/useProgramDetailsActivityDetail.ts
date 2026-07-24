import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { getActivityProgramDetail, updateStatusActivityProgram } from "../services/programActivities"
import { toast } from "#components/toast"
import { useTranslation } from "react-i18next"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"

export const useProgramDetailsActivityDetail = () => {
  const { t, i18n: { language } } = useTranslation(['activity', 'programGlobalSettings'])
  const params = useParams()
  const queryClient = useQueryClient()

  const { data, isFetching } = useQuery({
    queryKey: ['program-activity-detail', params?.activityId],
    queryFn: () => getActivityProgramDetail(Number(params?.activityId), Number(params?.id)),
    enabled: Boolean(params?.activityId),
    refetchOnWindowFocus: false,
  })

  const { mutate: onChangeStatus, isPending: isLoadingStatus } = useMutation({
    mutationFn: () => updateStatusActivityProgram(String(params?.activityId), { status: !data?.status }, Number(params?.id)),
    onError: (res) => toast.danger({ description: res.message }),
    onSuccess: async (res) => {
      toast.success({ description: res?.result?.status ? t('activity:action.status.success.activate') : t('activity:action.status.success.deactivate') })
      await queryClient.invalidateQueries({ queryKey: ['program-activity-detail'] })
    }
  })

  useSetLoadingPopupStore(isLoadingStatus)

  return {
    t,
    data,
    isFetching,
    onChangeStatus,
    isLoadingStatus,
    pathBack: `/${language}/v5/global-settings/program/${params?.id}?tab=activity`,
    pathEdit: `/${language}/v5/global-settings/program/${params?.id}/activity/${params?.activityId}/edit`,
  }
}