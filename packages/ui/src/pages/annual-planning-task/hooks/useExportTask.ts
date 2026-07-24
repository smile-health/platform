import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { exportTask } from '#services/task'
import { ExportTaskParams } from '#types/task'

export default function useExportTask() {
  const params = useParams()
  const year = params?.id as string

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ExportTaskParams) => exportTask(Number(year), data),
  })

  const generateParams = (filter: Record<string, any>) => {
    return {
      material_id: filter.material?.value,
      activity_id: filter.activity?.value,
    }
  }

  const handleExport = (filter: Record<string, any>) => {
    const filterParams = generateParams(filter)
    mutate(filterParams)
  }

  useSetLoadingPopupStore(isPending)

  return { handleExport }
}
