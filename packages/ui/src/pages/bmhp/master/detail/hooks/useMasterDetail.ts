import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { queryClient } from '#provider/query-client'

export interface UseMasterDetailOptions<T> {
  /** Query key for caching */
  queryKey: string
  /** Function to fetch detail data */
  queryFn: (id: string | number) => Promise<T>
  /** Function to delete the item (optional) */
  deleteFn?: (id: number) => Promise<void>
  /** Base path for navigation */
  basePath: string
  /** Query keys to invalidate on delete */
  invalidateKeys?: string[]
}

export function useMasterDetail<T>(options: UseMasterDetailOptions<T>) {
  const { queryKey, queryFn, deleteFn, basePath, invalidateKeys = [] } = options

  const params = useParams()
  const router = useSmileRouter()
  const id = params?.id as string

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Fetch detail data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => queryFn(id),
    enabled: Boolean(id),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!deleteFn) throw new Error('Delete function not provided')
      return await deleteFn(itemId)
    },
    onSuccess: () => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      router.pushGlobal(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

  const openDeleteModal = () => setShowDeleteModal(true)
  const closeDeleteModal = () => setShowDeleteModal(false)

  return {
    id,
    data,
    isLoading,
    error,
    refetch,
    basePath,
    router,
    // Delete related
    showDeleteModal,
    setShowDeleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  }
}
