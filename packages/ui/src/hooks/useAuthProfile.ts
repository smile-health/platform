import { useMutation } from '@tanstack/react-query'
import { GetProfileResponse, getProfileV2 } from '#services/profile'
import { RequestloginResponse } from '#types/auth'
import { sortObjectsByKey } from '#utils/array'
import { setUserStorage } from '#utils/storage/user'

type Props = {
  handleSuccess?: (data: GetProfileResponse) => void
}

export const useAuthProfile = ({ handleSuccess }: Props) => {
  const { data, mutate, isPending } = useMutation({
    mutationKey: ['profile-detail'],
    mutationFn: () => getProfileV2(),
    onSuccess: async (data) => {
      const userData: RequestloginResponse = {
        id: data.id,
        email: data.email,
        entity: data.entity,
        programs: sortObjectsByKey(data.programs, 'name'),
        role: data.role,
        token: '',
        username: data.username,
        manufacture: data.manufacture,
        view_only: data.view_only,
        firstname: data.firstname,
        lastname: data.lastname,
        external_roles: data.external_roles,
        external_properties: data.external_properties,
        integration_client_id: data.integration_client_id,
        is_disabled_notification: data?.is_disabled_notification,
      }
      setUserStorage(userData)
      handleSuccess?.(data)
    },
  })

  return {
    data,
    fetchProfile: mutate,
    isLoading: isPending,
  }
}
