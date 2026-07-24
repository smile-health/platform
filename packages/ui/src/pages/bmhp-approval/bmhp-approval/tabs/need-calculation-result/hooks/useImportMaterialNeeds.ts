import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importMaterialNeeds } from '../services/need-calculation-result.service'

type ModalImportErrors = { [key: string]: string[] }

export const useImportMaterialNeeds = (programPlanId: number) => {
    const { t } = useTranslation(['common'])
    const queryClient = useQueryClient()

    const [showImportModal, setShowImportModal] = useState<boolean>(false)
    const [listOfImportErrors, setListOfImportErrors] = useState<ModalImportErrors | null>(null)

    const { mutate: mutateImport, isPending } = useMutation({
        mutationKey: ['import-material-needs', programPlanId],
        mutationFn: (data: FormData) => importMaterialNeeds(programPlanId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['need-calculation-result'],
            })
            setShowImportModal(false)
            setListOfImportErrors(null)
            toast.success({
                description: t('common:import_success'),
            })
        },
        onError: (err: AxiosError) => {
            const { message, errors } = err.response?.data as {
                message: string
                errors?: ModalImportErrors
            }
            if (errors) {
                toast.danger({ description: message })
                setListOfImportErrors(errors)
            } else {
                toast.danger({ description: message })
            }
        },
    })

    useSetLoadingPopupStore(isPending)

    return {
        showImportModal,
        setShowImportModal,
        mutateImport,
        listOfImportErrors,
        setListOfImportErrors,
    }
}
