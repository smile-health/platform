import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUserStorage } from '#utils/storage/user'
import { isUserEntityWMS } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { getRolePermission } from './config'
import { FeatureName } from './features'

const SMILE_ONLY_FEATURES: Array<FeatureName> = ['self-disposal-view']
const WMS_ONLY_FEATURES: Array<FeatureName> = [
  'disposal-instruction-view',
  'disposal-instruction-mutate',
]

export function hasPermission(featureName: FeatureName) {
  const user = getUserStorage()

  const permission = user ? getRolePermission(user) : undefined

  if (!permission) {
    return false
  }

  if (WMS_ONLY_FEATURES.includes(featureName)) {
    return isUserEntityWMS(user)
  }

  if (SMILE_ONLY_FEATURES.includes(featureName)) {
    return !isUserEntityWMS(user)
  }

  const feature = permission?.[featureName as keyof typeof permission]

  if (!feature) {
    return false
  }

  if (user?.view_only && feature === 'mutation') {
    return false
  }

  return true
}

export function usePermission(featureName: FeatureName) {
  const router = useRouter()
  const user = getUserStorage()

  const [isPermitted, setIsPermitted] = useState(false)

  const {
    i18n: { language },
  } = useTranslation()

  useEffect(() => {
    const has = hasPermission(featureName)

    setIsPermitted(has)

    if (user && !has) {
      router.replace(`/${language}/v5/403`)
    }
  }, [user, featureName, language, router])

  return isPermitted
}
