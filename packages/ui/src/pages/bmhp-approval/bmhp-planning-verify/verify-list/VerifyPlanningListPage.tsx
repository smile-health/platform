'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Check from '#components/icons/Check'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useProfile } from '#shared/auth'
import { parseDownload } from '#utils/download'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import VerifyPlanningTable from './components/VerifyPlanningTable'
import { useUpdateVerifyPlanning } from './hooks/useUpdateVerifyPlanning'
import { useVerifyPlanningData } from './hooks/useVerifyPlanningData'
import { verifyPlanningFilterSchema } from './libs/verify-planning.filter'
import {
  ChangedDataMap,
  EntityData,
  EntityUpdateData,
  VerifyPlanningParams,
} from './libs/verify-planning.type'
import { exportVerifyPlanningData } from './services/verify-planning.service'

const VerifyPlanningListPage: React.FC = () => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])
  const { data: profile } = useProfile()
  const provinceId = profile?.entity?.province_id
  const [changedData, setChangedData] = useState<ChangedDataMap>(new Map())
  const [localData, setLocalData] = useState<EntityData[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const pendingCallbackRef = useRef<(() => void) | null>(null)

  // Confirmed/applied filter values — only update on explicit submit or confirm
  const [appliedFilters, setAppliedFilters] = useState({
    programPlanId: 0,
    regencyId: 0,
    keyword: '',
    examinationId: undefined as number | undefined,
  })

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => verifyPlanningFilterSchema({ t, provinceId }),
    [t, provinceId]
  )
  const filter = useFilter(filterSchema)

  // Build query params from CONFIRMED (applied) filter values only
  const params: VerifyPlanningParams = useMemo(
    () => ({
      program_plan_id: appliedFilters.programPlanId,
      regency_id: appliedFilters.regencyId,
      page: pagination.page,
      paginate: pagination.paginate,
      keyword: appliedFilters.keyword || undefined,
      examination_id: appliedFilters.examinationId,
    }),
    [appliedFilters, pagination.page, pagination.paginate]
  )

  // Fetch data
  const { data, isLoading, isFetching } = useVerifyPlanningData({
    params,
    enabled: !!appliedFilters.programPlanId && !!appliedFilters.regencyId,
  })

  // Update local data when API data changes
  useEffect(() => {
    if (data?.data) {
      setLocalData(data.data)
      setChangedData(new Map()) // Reset changes when new data loads
    }
  }, [data])

  // Handle value changes — lookup by examination_id + target_id
  const handleValueChange = useCallback(
    (
      entityIndex: number,
      examinationId: number,
      targetId: number,
      field: 'target' | 'adjustment_target' | 'status',
      value: number | boolean
    ) => {
      if (!localData) return

      const entity = localData[entityIndex]
      const updatedTarget = entity.target.map((t) =>
        t.examination_id === examinationId && t.target_id === targetId
          ? { ...t, [field]: value }
          : t
      )

      const updatedEntity: EntityData = { ...entity, target: updatedTarget }
      const newLocalData = [...localData]
      newLocalData[entityIndex] = updatedEntity
      setLocalData(newLocalData)

      const newChanges = new Map(changedData)
      newChanges.set(entity.entity_name.id, updatedEntity)
      setChangedData(newChanges)
    },
    [localData, changedData]
  )

  const handleBatchStatusChange = useCallback(
    (status: boolean) => {
      if (!localData) return

      const newLocalData = localData.map((entity) => {
        // Only update if entity has data (id is not null)
        if (entity.id === null) return entity

        const updatedEntity = {
          ...entity,
          target: entity.target.map((t) => ({ ...t, status })),
        }
        return updatedEntity
      })

      setLocalData(newLocalData)

      const newChanges = new Map(changedData)
      newLocalData.forEach((entity) => {
        if (entity.id !== null) {
          newChanges.set(entity.entity_name.id, entity)
        }
      })
      setChangedData(newChanges)
    },
    [localData, changedData]
  )

  // Save changes
  const { updateData, isUpdating } = useUpdateVerifyPlanning()

  const handleSave = useCallback(() => {
    if (
      changedData.size === 0 ||
      !appliedFilters.programPlanId ||
      !appliedFilters.regencyId
    )
      return

    const updatePayload: EntityUpdateData[] = Array.from(
      changedData.values()
    ).map((entity) => ({
      entity_id: entity.entity_name.id,
      target: entity.target.filter((t) => t.id !== null),
    }))

    updateData(
      {
        regency_id: appliedFilters.regencyId,
        program_plan_id: appliedFilters.programPlanId,
        data: updatePayload,
      },
      {
        onSuccess: () => {
          setChangedData(new Map())
          const cb = pendingCallbackRef.current
          pendingCallbackRef.current = null
          cb?.()
        },
      }
    )
  }, [changedData, appliedFilters, updateData])

  const requireConfirmIfUnsaved = useCallback(
    (callback: () => void) => {
      if (changedData.size > 0) {
        pendingCallbackRef.current = callback
        setShowConfirmModal(true)
      } else {
        callback()
      }
    },
    [changedData.size]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      requireConfirmIfUnsaved(() => setPagination({ page }))
    },
    [requireConfirmIfUnsaved, setPagination]
  )

  // Intercept filter submit: capture snapshot of form values, only apply after confirmation
  const handleFilterFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const newProgramPlanId = filter.getValues('program_plan_id')?.value || 0
      const newRegencyId = filter.getValues('regency')?.value || 0
      const newKeyword = filter.getValues('keyword') || ''
      const newExaminationId = filter.getValues('examination')?.value as
        | number
        | undefined

      requireConfirmIfUnsaved(() => {
        setAppliedFilters({
          programPlanId: newProgramPlanId,
          regencyId: newRegencyId,
          keyword: newKeyword,
          examinationId: newExaminationId,
        })
        setPagination({ page: 1 })
        setChangedData(new Map())
      })
    },
    [filter, requireConfirmIfUnsaved, setPagination]
  )

  const handleFilterReset = useCallback(() => {
    requireConfirmIfUnsaved(() => {
      filter.reset()
      setAppliedFilters({
        programPlanId: 0,
        regencyId: 0,
        keyword: '',
        examinationId: undefined,
      })
      setLocalData([])
      setChangedData(new Map())
    })
  }, [requireConfirmIfUnsaved, filter])

  const executePendingCallback = useCallback(() => {
    const cb = pendingCallbackRef.current
    pendingCallbackRef.current = null
    cb?.()
  }, [])

  const handleConfirmSave = useCallback(() => {
    handleSave()
    setShowConfirmModal(false)
  }, [handleSave])

  const handleDiscardChanges = useCallback(() => {
    setChangedData(new Map())
    setShowConfirmModal(false)
    executePendingCallback()
  }, [executePendingCallback])

  // Effect removed: auto-save on page change is now manual via confirmation modal

  // Show loading
  useSetLoadingPopupStore(isFetching || isLoading)

  // Whether filters are filled (based on applied/confirmed values)
  const isFiltersReady =
    !!appliedFilters.programPlanId && !!appliedFilters.regencyId

  // export excel
  const mutationExport = useMutation({
    mutationFn: () => exportVerifyPlanningData(params),
    onSuccess: ({ blob, filename }) => {
      parseDownload(blob, filename)
    },
  })

  return (
    <Container
      title={t('verify.title', 'Verifikasi Perencanaan BMHP')}
      withLayout
    >
      <Meta title={`SMILE | Verifikasi Perencanaan BMHP`} />

      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">Verifikasi Data Perencanaan</h5>
        {changedData.size > 0 && (
          <div className="ui-flex ui-items-center ui-gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setChangedData(new Map())
                setLocalData(data?.data ?? [])
              }}
              disabled={isUpdating}
            >
              Buang Perubahan
            </Button>
            <Button
              variant="solid"
              type="button"
              leftIcon={<Check className="ui-size-5" />}
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? 'Menyimpan...' : `Simpan (${changedData.size})`}
            </Button>
          </div>
        )}
      </div>

      <div className="ui-space-y-4 ui-mt-6">
        <FilterFormRoot collapsible={false} onSubmit={handleFilterFormSubmit}>
          <FilterFormBody className="ui-grid-cols-4 ui-gap-4">
            {filter.renderField()}
            <div className="ui-col-span-4 ui-flex ui-justify-end ui-gap-3 ui-mt-2">
              <FilterResetButton onClick={handleFilterReset} variant="subtle" />
              <FilterSubmitButton className="ui-w-40" variant="solid" />
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
      </div>

      {/* Show prompt if filters not ready */}
      {!isFiltersReady && (
        <div className="ui-mt-8 ui-p-8 ui-bg-gray-50 ui-rounded-lg ui-text-center ui-text-gray-600">
          <svg
            className="ui-w-16 ui-h-16 ui-mx-auto ui-mb-4 ui-text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <p className="ui-text-lg ui-font-medium">
            Pilih Tahun, Provinsi, dan Kabupaten/Kota untuk menampilkan data
          </p>
        </div>
      )}

      {/* Show table when data is available */}
      {isFiltersReady && (
        <>
          <div className="ui-space-y-6 ui-my-5 ui-rounded">
            <VerifyPlanningTable
              data={localData}
              materials={data?.material || []}
              onValueChange={handleValueChange}
              onBatchStatusChange={handleBatchStatusChange}
              onExport={() => mutationExport.mutate()}
            />
          </div>

          {/* Pagination */}
          {/* {data && data.total_page > 1 && (
          )} */}
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={(limit) =>
                requireConfirmIfUnsaved(() =>
                  setPagination({ page: 1, paginate: limit })
                )
              }
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={data?.total_item}
            />
            <Pagination
              totalPages={data?.total_page ?? 0}
              currentPage={pagination.page}
              onPageChange={handlePageChange}
            />
          </PaginationContainer>

          <ModalConfirmation
            open={showConfirmModal}
            setOpen={(open) => {
              if (!open) pendingCallbackRef.current = null
              setShowConfirmModal(open)
            }}
            title="Konfirmasi Simpan Data"
            description="Terdapat perubahan data yang belum disimpan. Apakah Anda ingin menyimpan data tersebut sebelum berpindah?"
            subDescription={
              <button
                type="button"
                className="ui-text-sm ui-text-gray-400 hover:ui-underline ui-mt-1"
                onClick={handleDiscardChanges}
              >
                Abaikan perubahan &amp; lanjutkan tanpa menyimpan
              </button>
            }
            onSubmit={handleConfirmSave}
            buttonTitle="Simpan & Lanjutkan"
            isLoading={isUpdating}
          />
        </>
      )}
    </Container>
  )
}

export default VerifyPlanningListPage
