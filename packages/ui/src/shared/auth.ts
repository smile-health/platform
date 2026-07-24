import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { getProfileV2 } from '#services/profile'
import Cookies from 'js-cookie'

export function useRequireAuth() {
  const router = useRouter()
  const token = Cookies.get(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`)
  if (!token) {
    router.replace('/')
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfileV2(),
    staleTime: 1000 * 60 * 5, //5 minutes
  })
}
