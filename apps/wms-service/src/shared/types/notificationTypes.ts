export enum NOTIFICATION_EVENT_TYPE {
  PARTNERSHIP_EXPIRED = 'partnership.partnership_expired',
  PARTNERSHIP_CREATED = 'partnership.partnership_created',
  PARTNERSHIP_UPDATED = 'partnership.partnership_updated',

  WASTE_BAG_RESIDUE_CREATED = 'waste_bag.waste_bag_residue_created',
  WASTE_BAG_DOMESTIC_CREATED = 'waste_bag.waste_bag_domestic_created',
  WASTE_BAG_IN_TEMPORARY_STORAGE = 'waste_bag.waste_bag_in_temporary_storage',
  WASTE_BAG_OUT_TEMPORARY_STORAGE = 'waste_bag.waste_bag_out_temporary_storage',
  WASTE_BAG_IN_COLD_STORAGE = 'waste_bag.waste_bag_in_cold_storage',
  WASTE_BAG_OUT_COLD_STORAGE = 'waste_bag.waste_bag_out_cold_storage',
  WASTE_BAG_TEMPORARY_STORAGE_EXPIRED = 'waste_bag.waste_bag_temporary_storage_expired',
  WASTE_BAG_COLD_STORAGE_EXPIRED = 'waste_bag.waste_bag_cold_storage_expired',

  WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE = 'waste_bag.waste_bag_group_in_temporary_storage', // ✅
  WASTE_BAG_GROUP_OUT_TEMPORARY_STORAGE = 'waste_bag.waste_bag_group_out_temporary_storage',
  WASTE_BAG_GROUP_IN_COLD_STORAGE = 'waste_bag.waste_bag_group_in_cold_storage', // ✅
  WASTE_BAG_GROUP_OUT_COLD_STORAGE = 'waste_bag.waste_bag_group_out_cold_storage',
  WASTE_BAG_GROUP_TEMPORARY_STORAGE_EXPIRED = 'waste_bag.waste_bag_group_temporary_storage_expired',
  WASTE_BAG_GROUP_COLD_STORAGE_EXPIRED = 'waste_bag.waste_bag_group_cold_storage_expired',

  WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS = 'waste_bag.waste_bag_treatment_group_incinerate_in_process', // ✅
  WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS = 'waste_bag.waste_bag_treatment_group_sterilise_in_process', // ✅
  WASTE_BAG_TREATMENT_GROUP_INCINERATED = 'waste_bag.waste_bag_treatment_group_incinerated',
  WASTE_BAG_TREATMENT_GROUP_STERILISED = 'waste_bag.waste_bag_treatment_group_sterilised',

  WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP = 'waste_bag.waste_bag_group_transport_follow_up', // ✅
  WASTE_BAG_GROUP_TRANSPORT_HANDOVER = 'waste_bag.waste_bag_group_transport_handover', // ✅
  WASTE_BAG_GROUP_TRANSPORT_PICKUP = 'waste_bag.waste_bag_group_transport_pickup', // ✅
  WASTE_BAG_GROUP_TREATMENT_RECEIVMENT = 'waste_bag.waste_bag_group_treatment_receivment', // ✅

  MANUAL_REQUEST_CREATED = 'manual_request.manual_request_created',
  MANUAL_REQUEST_APPROVED = 'manual_request.manual_request_approved',
  MANUAL_REQUEST_REJECTED = 'manual_request.manual_request_rejected',
}

export enum NOTIFICATION_WORKER {
  MULTI_NOTIFICATION = 'multi-notification',
  FIREBASE = 'firebase_notifications',
  EMAIL = 'email-notification',
}

export enum NOTIFICATION_MEDIA {
  FCM = 'fcm',
  FIREBASE = 'firebase',
  EMAIL = 'email',
}

export interface NotificationUser {
  user_id: number;
  email: string;
  mobile_phone?: string;
  fcm_token?: string;
  entity_id: number;
  province_id?: number | null;
  regency_id?: number | null;
}

export interface NotificationPayload {
  mail?: string;
  subject?: string;
  content?: string;
  user: NotificationUser;
  message: string;
  title: string;
  type: string;
  download_url?: string;
  action_url?: string;
  worker: string;
  workerMedia: string;
  patient_id?: number | null;
  program_id?: number | null;
  for_super_admin: boolean;
  for_admin: boolean;
  for_operator: boolean;
  titleTranslation?: string;
  messageTranslation?: string;
}
