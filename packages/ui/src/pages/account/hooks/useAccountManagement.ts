import { useQuery } from '@tanstack/react-query'
import { ProgramWasteManagement } from '#constants/program'
import { getProfileV2 } from '#services/profile'
import { listUserChangeHistory } from '#services/user'
import { parseDateTime } from '#utils/date'
import { getAuthTokenCookies } from '#utils/storage/auth'
import { getUserStorage } from '#utils/storage/user'
import { getEntityType, isUserWMS } from '#utils/user'
import { useTranslation } from 'react-i18next'

export type FetchType = 'all' | 'profile'

export const useAccountManagement = () => {
  const userData = getUserStorage()
  const token = getAuthTokenCookies()
  const { t, i18n } = useTranslation(['common', 'account'])

  const fetchAllData = async () => {
    const [user, userHistory] = await Promise.all([
      getProfileV2(),
      listUserChangeHistory(userData?.id ?? ''),
    ])
    return { user, userHistory }
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['profile', userData?.id],
    queryFn: () => fetchAllData(),
    retry: false,
    enabled: !!userData?.id,
    refetchOnWindowFocus: false,
    select: (data) => {
      if (isUserWMS(userData) && token && data?.user) {
        const wmsProgram = ProgramWasteManagement()
        const hasWmsProgram = data.user.programs?.some(
          (p) => p.id === wmsProgram.id || p.key === wmsProgram.key
        )

        if (!hasWmsProgram) {
          data.user.programs = [wmsProgram, ...(data.user.programs ?? [])]
        }
      }
      return data
    },
  })

  const profileDetailFields = {
    title: t('account:title.profile_detail'),
    showLatestLoginInfo: true,
    buttons: [
      {
        label: t('account:button.edit_profile'),
        url: `/${i18n?.language}/v5/account/change-profile`,
        id: 'btnEditProfile',
      },
      {
        label: t('account:button.edit_password'),
        url: `/${i18n?.language}/v5/account/change-password`,
        id: 'btnEditPassword',
      },
    ],
    fields: [
      {
        label: t('account:field.username'),
        value: data?.user?.username,
        id: 'labelUsername',
      },
      {
        label: t('account:field.name'),
        value: `${data?.user?.firstname ?? ''} ${data?.user?.lastname ?? ''}`,
        id: 'labelFirstname',
      },
      {
        label: t('account:field.role'),
        value: `${data?.user?.role_label ?? ''}`,
        id: 'labelRole',
      },
      {
        label: t('account:field.birth_date'),
        value: parseDateTime(data?.user?.date_of_birth ?? '', 'DD/MM/YYYY'),
        id: 'labelBirthDate',
      },
      {
        label: t('account:field.gender'),
        value:
          data?.user?.gender == 1
            ? t('common:gender.male')
            : t('common:gender.female'),
        id: 'labelGender',
      },
      {
        label: t('account:field.phone_number'),
        value: data?.user?.mobile_phone,
        id: 'labelMobilePhone',
      },
      { label: 'Email', value: data?.user?.email, id: 'labelEmail' },
      {
        label: t('account:field.address'),
        value: data?.user?.address,
        id: 'labelAddress',
      },
    ],
  }

  const deviceAndLoginInfoFields = {
    title: t('account:title.info_login_device'),
    fields: [
      {
        label: 'Status',
        value:
          data?.user?.status || 0
            ? t('common:status.active')
            : t('common:status.inactive'),
        id: 'labelStatus',
      },
      {
        label: t('account:field.last_login'),
        value: parseDateTime(data?.user?.last_login ?? ''),
        id: 'labelLastLogin',
      },
      {
        label: t('account:field.last_device_access'),
        value:
          data?.user?.last_device && data?.user?.last_device === 1
            ? 'Web'
            : 'Mobile',
        id: 'labelLastDeviceAccess',
      },
    ],
  }

  const workspacesDetailFields = {
    title: t('account:title.workspace_entity_info'),
    fields: [
      {
        label: t('account:field.workspace.entity_name'),
        value: data?.user?.entity?.name ?? '-',
        id: 'labelEntityName',
      },
      {
        label: t('account:field.workspace.entity_address'),
        value: data?.user?.entity?.address ?? '-',
        id: 'labelEntityAddress',
      },
      {
        label: t('account:field.workspace.entity_type'),
        value: getEntityType(data?.user?.entity?.type ?? 0) || '-',
        id: 'labelEntityType',
      },
      {
        label: 'Tag',
        value:
          data?.user?.entity?.is_puskesmas === 1
            ? ' Puskesmas'
            : ' Non Puskesmas',
        id: 'labelTag',
      },
    ],
  }

  return {
    data,
    isLoading,
    error,
    isError,
    profileDetailFields,
    deviceAndLoginInfoFields,
    workspacesDetailFields,
  }
}
