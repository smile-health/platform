import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { deleteTask } from '#services/task'
import { Task } from '#types/task'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export default function useDeleteTask() {
  const { t } = useTranslation(['common', 'task'])
  const queryClient = useQueryClient()

  const { mutate, isPending: isPendingDelete } = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () =>
      toast.success({
        description: t('task:delete.success'),
      }),
    onError: (err: AxiosError) => {
      toast.danger({
        description: err?.message || t('task:delete.error'),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['list-task'],
      })
    },
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const handleDeleteTask = () => {
    mutate(selectedTask?.id as number)
  }

  const handleDeleteButton = (task: Task) => {
    setSelectedTask(task)
    setShowDelete(true)
  }

  useSetLoadingPopupStore(isPendingDelete)

  return {
    showDelete,
    setShowDelete,
    handleDeleteButton,
    handleDeleteTask,
  }
}
