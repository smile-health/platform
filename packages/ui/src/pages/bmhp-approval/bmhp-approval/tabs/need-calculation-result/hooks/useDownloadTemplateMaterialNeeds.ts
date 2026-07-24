import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { downloadTemplateMaterialNeeds } from '../services/need-calculation-result.service'

export const useDownloadTemplateMaterialNeeds = (programPlanId: number) => {
    const downloadTemplateQuery = useQuery({
        queryKey: ['download-template-material-needs', programPlanId],
        queryFn: () => downloadTemplateMaterialNeeds(programPlanId),
        enabled: false,
    })

    useSetLoadingPopupStore(
        downloadTemplateQuery.isLoading || downloadTemplateQuery.isFetching
    )

    return { downloadTemplateQuery }
}
