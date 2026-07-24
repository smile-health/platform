'use client'

import { useEffect } from 'react'
import useSmileRouter from '#hooks/useSmileRouter'

const BmhpApprovalDetailIndexPage = () => {
  const router = useSmileRouter() as {
    query: { program_plan_id?: string }
    replace: (path: string) => Promise<void>
  }

  useEffect(() => {
    const { program_plan_id } = router.query
    if (program_plan_id) {
      router
        .replace(`/v5/bmhp-approval/${program_plan_id}/completeness-monitoring`)
        .catch((error) => {
          console.error('Failed to redirect:', error)
        })
    }
  }, [router])

  return null
}

export default BmhpApprovalDetailIndexPage
