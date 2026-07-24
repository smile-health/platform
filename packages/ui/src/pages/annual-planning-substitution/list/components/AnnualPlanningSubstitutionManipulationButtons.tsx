import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import Download from '#components/icons/Download'
import Import from '#components/icons/Import'
import Plus from '#components/icons/Plus'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { useAnnualPlanningSubstitutionListDownloadTemplate } from '../hooks/useAnnualPlanningSubstitutionListDownloadTemplate'
import { useAnnualPlanningSubstitutionListImport } from '../hooks/useAnnualPlanningSubstitutionListImport'

const hasMutatePermission = hasPermission('annual-planning-substitution-mutate')

export const AnnualPlanningImportButton = () => {
  const {
    showImportModal,
    setShowImportModal,
    mutateImport,
    listOfImportErrors,
    setListOfImportErrors,
  } = useAnnualPlanningSubstitutionListImport()
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  return hasMutatePermission ? (
    <>
      <ModalError
        errors={listOfImportErrors}
        open={!!listOfImportErrors}
        handleClose={() => {
          setListOfImportErrors(null)
        }}
      />
      <ModalImport
        open={showImportModal}
        setOpen={setShowImportModal}
        onSubmit={mutateImport}
        handleClose={() => setShowImportModal(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('common:import')}
      />
      <Button
        id="annual_planning_substitution_import"
        variant="subtle"
        type="button"
        onClick={() => setShowImportModal(true)}
        leftIcon={<Import className="ui-size-5" />}
      >
        {t('common:import')}
      </Button>
    </>
  ) : null
}

export const AnnualPlanningDownloadTemplateButton = () => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const { downloadTemplateQuery } =
    useAnnualPlanningSubstitutionListDownloadTemplate()

  return hasMutatePermission ? (
    <Button
      data-testid="annual_planning_substitution_download_template"
      id="annual_planning_substitution_download_template"
      className="ui-shrink-0"
      variant="subtle"
      type="button"
      onClick={() => downloadTemplateQuery.refetch()}
      leftIcon={<Download className="ui-size-5" />}
    >
      {t('common:download_template')}
    </Button>
  ) : null
}

export const AnnualPlanningAddButton = () => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { id: planId } = router.query

  return hasMutatePermission ? (
    <Button
      id="create_annual_planning_substitution"
      asChild
      variant="solid"
      type="button"
      leftIcon={<Plus className="ui-size-5" />}
    >
      <Link
        href={router.getAsLink(
          `/v5/program-plan/${planId}/substitution/create`
        )}
      >
        {t('annualPlanningSubstitution:add_substitution')}
      </Link>
    </Button>
  ) : null
}
