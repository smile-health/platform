import Link from 'next/link'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import {
  ProgramEnum,
  ProgramIntegrationClient,
  WORKSPACE,
} from '#constants/program'
import cx from '#lib/cx'
import { hasPermission } from '#shared/permission/index'
import { TEntities } from '#types/entity'
import { TUser } from '#types/user'
import { isViewOnly } from '#utils/user'
import { TFunction } from 'i18next'

import { setLocation } from '../utils/helper'

type TChangeStatusState = {
  id?: number
  status?: number
  show: boolean
}

type DataProps = {
  isGlobal?: boolean
  isLoadingUpdateStatus: boolean
  setChangeStatusState: (state: TChangeStatusState) => void
  setLink: (url: string) => string
  setLinkGlobal: (url: string) => string
  page: number
  size: number
}

export const columns = (
  t: TFunction<['common', 'entity']>,
  {
    isGlobal,
    isLoadingUpdateStatus,
    setChangeStatusState,
    setLink,
    setLinkGlobal,
    page,
    size,
  }: DataProps
): ColumnDef<TEntities>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    size: 50,
  },
  {
    header: t('entity:list.column.name'),
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: t('entity:list.column.location'),
    accessorKey: 'location',
    enableSorting: true,
    cell: ({ row: { original } }) =>
      setLocation({
        isGlobal,
        location: original.location,
        locations: original.locations,
      }),
  },
  ...(isGlobal
    ? [
        {
          header: 'Program',
          accessorKey: 'programs',
          cell: ({ row: { original } }: CellContext<TEntities, unknown>) => {
            const programs = original?.programs?.map((item) => item?.name)
            const programText = programs?.length > 0 ? programs?.join(',') : ''

            return original?.integration_client_id ===
              ProgramIntegrationClient.WasteManagement
              ? `${WORKSPACE[ProgramEnum.WasteManagement].name}${programText ? `, ${programText}` : programText}`
              : programText
          },
          size: 160,
        },
      ]
    : []),
  {
    header: t('entity:list.column.tag'),
    accessorKey: 'tag',
    enableSorting: true,
    cell: ({ row: { original } }) =>
      isGlobal
        ? (original?.entity_tag?.title ?? '-')
        : original.entity_tag_name || '-',
  },
  {
    header: t('entity:list.column.code'),
    accessorKey: 'code',
    size: 160,
    enableSorting: true,
  },
  ...(!isGlobal
    ? [
        {
          header: 'Status',
          accessorKey: 'status',
          cell: ({ row: { original } }: CellContext<TEntities, unknown>) => (
            <ActiveLabel isActive={!!original?.status} />
          ),
          size: 160,
        },
      ]
    : []),
  {
    header: t('entity:satu_sehat_code'),
    accessorKey: 'id_satu_sehat',
    size: 160,
    enableSorting: false,
  },
  {
    header: t('entity:list.column.action'),
    accessorKey: 'action',
    size: isGlobal ? undefined : 250,
    cell: ({ row: { original } }) => {
      const isActive = !!original?.status

      const getPath = () => (isGlobal ? 'global-settings/entity' : 'entity')
      const handleButtonTableAction = (
        type: 'edit' | '',
        id: string | number
      ) => {
        const selectedType = type ? `/${type}` : ''
        let url = setLink(`/v5/entity/${id}${selectedType}`)
        if (isGlobal) {
          url = setLinkGlobal(`/v5/global-settings/entity/${id}${selectedType}`)
        }
        return url
      }

      return isGlobal ? (
        <ButtonActionTable
          id={original?.id}
          path={getPath()}
          hidden={isViewOnly() ? ['edit', 'activation'] : ['activation']}
          isActive={isActive}
          isLoadingActivation={isLoadingUpdateStatus}
          onActivationClick={() => {
            setChangeStatusState({
              show: true,
              id: original?.id,
              status: original?.status,
            })
          }}
        />
      ) : (
        <div className="ui-flex ui-gap-0.5">
          <Button
            asChild
            id="btn-link-entity-detail"
            size="sm"
            variant="subtle"
            className="ui-px-1.5"
          >
            <Link
              className="ui-text-polynesianblue-600"
              href={handleButtonTableAction('', original?.id)}
            >
              {t('entity:list.column.configuration')}
            </Link>
          </Button>
          {hasPermission('entity-mutate') && (
            <Button
              id="btn-entity-activation"
              size="sm"
              variant="subtle"
              color={isActive ? 'danger' : 'primary'}
              disabled={isLoadingUpdateStatus}
              className={cx('ui-px-1.5', {
                'ui-text-polynesianblue-600': !isActive,
              })}
              onClick={() => {
                setChangeStatusState({
                  show: true,
                  id: original?.id,
                  status: original?.status,
                })
              }}
            >
              {isActive
                ? t('entity:list.action.deactivate.title')
                : t('entity:list.action.activate.title')}
            </Button>
          )}
        </div>
      )
    },
  },
]

export const columnsDetailUserGlobal = (
  t: TFunction<['common', 'entity', 'user']>,
  { page, paginate }: { page: number; paginate: number }
): ColumnDef<TUser>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * paginate + (index + 1),
    size: 50,
  },
  {
    header: t('user:column.username'),
    accessorKey: 'username',
    cell: ({
      row: {
        original: { username },
      },
    }) => username || '-',
    size: 300,
  },
  {
    header: t('user:column.fullname'),
    accessorKey: 'fullname',
    cell: ({
      row: {
        original: { firstname, lastname },
      },
    }) => `${firstname || '-'} ${lastname || ''}`,
    size: 160,
  },
  {
    header: t('user:column.role'),
    accessorKey: 'role',
    cell: ({
      row: {
        original: { role_label },
      },
    }) => role_label || '-',
    size: 160,
  },
  {
    header: t('user:column.mobile_phone'),
    accessorKey: 'mobile_phone',
    cell: ({
      row: {
        original: { mobile_phone },
      },
    }) => mobile_phone || '-',
    size: 160,
  },
  {
    header: 'Program',
    accessorKey: 'program',
    cell: ({
      row: {
        original: { programs, integration_client_id },
      },
    }) => {
      const programText = programs?.map((w) => w?.name).join(', ') || '-'
      return integration_client_id === ProgramIntegrationClient.WasteManagement
        ? `${WORKSPACE[ProgramEnum.WasteManagement].name}, ${programText}`
        : programText
    },
    size: 160,
  },
]

export type ColumnsDetailUserPrograms = {
  username: string
  full_name: string
  role: string
  phone_number: string
}
export const columnsDetailUserPrograms = (
  t: TFunction<['common', 'entity', 'user']>,
  { page, paginate }: { page: number; paginate: number }
): ColumnDef<ColumnsDetailUserPrograms>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * paginate + (index + 1),
    size: 50,
  },
  {
    header: t('user:column.username'),
    accessorKey: 'username',
    cell: ({
      row: {
        original: { username },
      },
    }) => username || '-',
    size: 300,
  },
  {
    header: t('user:column.fullname'),
    accessorKey: 'fullname',
    cell: ({
      row: {
        original: { full_name },
      },
    }) => full_name || '-',
    size: 160,
  },
  {
    header: t('user:column.role'),
    accessorKey: 'role',
    cell: ({
      row: {
        original: { role },
      },
    }) => role || '-',
    size: 160,
  },
  {
    header: t('user:column.mobile_phone'),
    accessorKey: 'mobile_phone',
    cell: ({
      row: {
        original: { phone_number },
      },
    }) => phone_number || '-',
    size: 160,
  },
]
