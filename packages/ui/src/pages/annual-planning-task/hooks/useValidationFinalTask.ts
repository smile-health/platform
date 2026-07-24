import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import useSmileRouter from '#hooks/useSmileRouter'

import { useProgramPlanDetailData } from '../../program-plan/list/hooks/useProgramPlanDetailData'

export default function useValidationFinalTask() {
  const router = useSmileRouter()
  const params = useParams()
  const programPlanId = params.id

  const { detailProgramPlanData } = useProgramPlanDetailData()

  useEffect(() => {
    if (detailProgramPlanData?.is_final) {
      router.replace(`/v5/program-plan/${programPlanId}/task`)
    }
  }, [detailProgramPlanData])

  return {
    detailProgramPlanData,
  }
}
