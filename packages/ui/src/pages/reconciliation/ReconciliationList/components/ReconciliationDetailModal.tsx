import React, { useState } from 'react'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import XMark from '#components/icons/XMark'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import { useReconciliationDetail } from '../hooks/useReconciliationDetail'
import { TitleBlock } from '../reconciliation-list.helpers'
import { detailReconciliationTableSchema } from '../schema/ReconciliationTableSchema'

const ReconciliationDetailModal = ({
  t,
  id,
  locale = 'id',
}: {
  t: TFunction<'reconciliation'>
  id?: number
  locale?: string
}) => {
  const schema = detailReconciliationTableSchema({ t, locale })
  const { isLoading, data, openModal, setOpenModal } =
    useReconciliationDetail(id)

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
        variant="subtle"
        type="button"
        className="!ui-p-0 !ui-h-fit"
        id={`reconciliation__detail__${id}`}
      >
        {t('list.table.view_history')}
      </Button>
      <Dialog open={openModal} closeOnOverlayClick={false} size="xl">
        <DialogHeader border>
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('list.table.view_history')}
            </h6>
            <Button
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => {
                setOpenModal(false)
              }}
              id={`reconciliation__xclose__detail__${id}`}
            >
              <XMark />
            </Button>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="ui-flex ui-flex-col ui-space-y-5">
            <TitleBlock
              arrText={[
                {
                  label: t('list.table.column.entity'),
                  className: 'ui-text-neutral-500 ui-text-sm',
                },
                {
                  label: data?.entity?.name ?? '-',
                  className: 'ui-font-bold ui-text-dark-blue',
                  isLoading: isLoading,
                },
              ]}
            />
            <TitleBlock
              arrText={[
                {
                  label: 'Material',
                  className: 'ui-text-neutral-500 ui-text-sm',
                },
                {
                  label:
                    !data?.material_parent?.name && !data?.material?.name
                      ? '-'
                      : `${data?.material_parent?.name ? data?.material_parent?.name + '/' : ''}${data?.material?.name ?? ''}`,
                  className: 'ui-font-bold ui-text-dark-blue',
                  isLoading: isLoading,
                },
              ]}
            />
            <TitleBlock
              arrText={[
                {
                  label: t('list.table.column.period'),
                  className: 'ui-text-neutral-500 ui-text-sm',
                },
                {
                  label:
                    data?.start_date && data?.end_date
                      ? `${parseDateTime(data?.start_date, 'DD MMMM YYYY', locale)} - ${parseDateTime(data?.end_date, 'DD MMMM YYYY', locale)}`
                      : '-',
                  className: 'ui-font-bold ui-text-dark-blue',
                  isLoading: isLoading,
                },
              ]}
            />

            <DataTable
              data={data?.items}
              columns={schema}
              className="ui-max-h-[425px]"
              id={`reconciliation__detail__table__${id}`}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
        <DialogFooter className="ui-border">
          <Button
            color="danger"
            variant="default"
            className="w-full"
            onClick={() => setOpenModal(false)}
            id={`reconciliation__close__detail__${id}`}
          >
            {t('list.table.close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

export default ReconciliationDetailModal
