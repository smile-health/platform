import { USER_ROLE } from '#constants/roles'
import { TEntity } from '#services/profile'

import { TProgram } from './program'

export type RequestloginResponse = {
  id?: number
  email: string
  entity: TEntity
  programs: TProgram[]
  role: USER_ROLE
  token: string
  username: string
  manufacture?: {
    id: number
    name: string
    type: number
  }
  view_only?: number
  firstname?: string
  lastname?: string
  external_properties?: {
    role: {
      id: number
      name: string
      type: string
    }
  }
  external_roles?: string[]
  integration_client_id: number | null
  is_disabled_notification?: number
}

export type AuthDetail = {
  'access_token': string
  'expires_in': number
  'not-before-policy': number
  'refresh_expires_in': number
  'refresh_token': string
  'scope': string
  'session_state': string
  'token_type': string
}

export type RequestLoginV2Response = {
  authDetails: AuthDetail
}
