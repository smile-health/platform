import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { downloadTemplateTask } from '#services/task'

export default function useDownloadTask() {
  const { isLoading, refetch: downloadTemplate } = useQuery({
    queryKey: ['task-template'],
    queryFn: downloadTemplateTask,
    enabled: false,
  })

  useSetLoadingPopupStore(isLoading)

  return { downloadTemplate }
}
