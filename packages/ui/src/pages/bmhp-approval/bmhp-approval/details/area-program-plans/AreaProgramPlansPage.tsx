'use client'

import React, { useContext, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import ChainIcon from '#components/icons/ChainIcon'
import Export from '#components/icons/Export'
import { ModalSignatureLink } from '#components/modules/ModalSignatureLink'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import BmhpApprovalDetailContext from '../../list/libs/bmhp-approval-detail.context'
import {
  exportProvinceApprovals,
  getBmhpSignature,
  getRegencyById,
  upsertBmhpSignature,
  UpsertSignaturePayload,
} from '../../services/bmhp-planning.services'
import BmhpApprovalDetailTabs from '../BmhpApprovalDetailTabs'

// ── Page Content ──────────────────────────────────────────────────────────────

const AreaProgramPlansPageContent: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval', 'common'])
  const { approvalData } = useContext(BmhpApprovalDetailContext)
  const { data: profile } = useProfile()
  const { query } = useSmileRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isSignatureLinkOpen, setIsSignatureLinkOpen] = useState(false)

  const upsertSignature = useMutation({
    mutationFn: (data: UpsertSignaturePayload) => upsertBmhpSignature(data),
  })

  const { data: signatureData } = useQuery({
    queryKey: ['bmhp-approval-signature'],
    queryFn: getBmhpSignature,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const regency_id = query?.regency_id as string | undefined
  const year_id = query?.year_id as string | undefined

  const showExportButton = !!regency_id
  const showSignatureButton = showExportButton && profile?.entity?.type !== 1

  // Query regency data using new endpoint /bmhp-approval/province/get-regency/:id
  const { data: regencyData } = useQuery({
    queryKey: ['area-program-regency', regency_id],
    queryFn: () => getRegencyById(regency_id!),
    enabled: !!regency_id,
    retry: false,
  })

  // Get regency name: prefer useProfile, fallback to regencyData
  const cityName =
    profile?.entity?.regency?.name ?? regencyData?.data?.regency_name ?? '-'

  // Get province name from useProfile
  const provinceName = profile?.entity?.province?.name ?? '-'

  const handleExport = async () => {
    if (!year_id || !regency_id) return

    setIsExporting(true)
    try {
      await exportProvinceApprovals({
        program_plan_id: Number(year_id),
        regency_id: Number(regency_id),
      })
    } finally {
      setIsExporting(false)
    }
  }

  const programYear = approvalData?.year ?? '-'
  const approvalStatus = approvalData?.approval_status ?? approvalData?.status

  const getStatusBadge = () => {
    if (approvalStatus === null || approvalStatus === undefined) return null

    // Map approval_status to status labels
    // 0 = ON DESK, 1 = APPROVED, 2 = REVISION, 3 = APPROVED
    const statusMap: Record<number, { label: string; className: string }> = {
      0: {
        label: t('bmhpApproval:status.ondesk'),
        className:
          'ui-bg-blue-50 ui-text-blue-700 ui-border ui-border-blue-200',
      },
      1: {
        label: t('bmhpApproval:status.approved'),
        className:
          'ui-bg-green-50 ui-text-green-700 ui-border ui-border-green-200',
      },
      2: {
        label: t('bmhpApproval:status.revision'),
        className: 'ui-bg-red-50 ui-text-red-700 ui-border ui-border-red-200',
      },
      3: {
        label: t('bmhpApproval:status.approved'),
        className:
          'ui-bg-green-50 ui-text-green-700 ui-border ui-border-green-200',
      },
    }

    const s = statusMap[approvalStatus]
    if (!s) return null
    return (
      <span
        className={`ui-inline-flex ui-items-center ui-px-2.5 ui-py-0.5 ui-rounded-full ui-text-xs ui-font-medium ${s.className}`}
      >
        {s.label}
      </span>
    )
  }

  // Query regency data is now fetched using /bmhp-approval/province/get-regency/:id
  // Available in regencyData - you can access: regencyData?.data?.regency_name, etc.

  return (
    <div className="ui-p-4 ui-border ui-border-gray-200 ui-rounded-lg ui-bg-white ui-space-y-4">
      {/* Header */}
      <div className="ui-flex ui-flex-row ui-justify-start">
        <div className="ui-space-y-4 ui-flex-1">
          <div className="ui-flex ui-items-center ui-justify-between">
            <h3 className="ui-text-sm ui-font-semibold ui-text-neutral-700">
              {t('bmhpApproval:label.details', 'Details')}
            </h3>
          </div>

          {/* Info rows */}
          <div className="ui-flex ui-flex-col ui-gap-2">
            {!regency_id && (
              <div className="ui-flex ui-items-center ui-gap-2">
                {getStatusBadge()}
              </div>
            )}
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-sm ui-text-neutral-500 ui-w-36">
                {t('bmhpApproval:completeness.province')}
              </span>
              <span className="ui-text-sm">: {provinceName}</span>
            </div>
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-sm ui-text-neutral-500 ui-w-36">
                {t('bmhpApproval:completeness.city')}
              </span>
              <span className="ui-text-sm">: {cityName}</span>
            </div>
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-sm ui-text-neutral-500 ui-w-36">
                {t('bmhpApproval:completeness.program_plan')}
              </span>
              <span className="ui-text-sm">: {programYear}</span>
            </div>
          </div>
        </div>
        {/* Export & signature link buttons - only shown when regency_id exists */}
        {showExportButton && (
          <div className="ui-mb-4 ui-flex ui-justify-end ui-gap-2">
            {showSignatureButton && (
              <Button
                type="button"
                variant="outline"
                color="primary"
                leftIcon={<ChainIcon />}
                onClick={() => setIsSignatureLinkOpen(true)}
              >
                {t('bmhpApproval:button.add_signature_link')}
              </Button>
            )}
            <Button
              type="button"
              leftIcon={<Export className="ui-size-5" />}
              loading={isExporting}
              disabled={isExporting}
              onClick={handleExport}
            >
              {t('common:export')}
            </Button>
          </div>
        )}
      </div>

      <ModalSignatureLink
        open={isSignatureLinkOpen}
        setOpen={setIsSignatureLinkOpen}
        isLoading={upsertSignature.isPending}
        defaultValues={signatureData?.data ? {
          name: signatureData.data.name,
          position: signatureData.data.position,
          signature_url: signatureData.data.signature_url,
          program: signatureData.data.program ?? undefined,
        } : undefined}
        onSubmit={(data) => {
          upsertSignature.mutate(data, {
            onSuccess: () => {
              toast.success({
                description: t('bmhpApproval:statement_letter.add_signature_success', {
                  defaultValue: 'Successfully added signature.',
                }),
              })
              setIsSignatureLinkOpen(false)
            },
            onError: (error: any) => {
              toast.danger({
                description:
                  error?.response?.data?.message ||
                  t('common:error_occurred', { defaultValue: 'An error occurred.' }),
              })
            },
          })
        }}
      />
    </div>
  )
}

// ── Wrapped with detail tabs ───────────────────────────────────────────────────

const AreaProgramPlansPage: React.FC = () => {
  return (
    <BmhpApprovalDetailTabs>
      <AreaProgramPlansPageContent />
    </BmhpApprovalDetailTabs>
  )
}

export default AreaProgramPlansPage
