import { ENTITY_TYPE, ENTITY_TYPE_NAME } from '@/types/entity';
import { ROLE_LABEL, ROLE_TYPE } from '@/types/roles';
import { getUserStorage } from '@/utils/storage/user';

// === Helper untuk ambil user dari storage ===
const getUser = () => getUserStorage();

// === Helper untuk mapping role + entity ===
const ROLE_ENTITY_MAPPING: Record<string, ROLE_LABEL> = {
  // === SANITARIAN ===
  [`${ROLE_TYPE.SANITARIAN}:${ENTITY_TYPE.PROVINCE}`]: ROLE_LABEL.SANITARIAN,
  [`${ROLE_TYPE.SANITARIAN}:${ENTITY_TYPE.REGENCY}`]: ROLE_LABEL.SANITARIAN,
  [`${ROLE_TYPE.SANITARIAN}:${ENTITY_TYPE.VENDOR}`]: ROLE_LABEL.SANITARIAN,
  [`${ROLE_TYPE.SANITARIAN}:${ENTITY_TYPE.HEALTHCARE_FACILITY}`]: ROLE_LABEL.SANITARIAN,

  // === FACILITY_ADMIN ===
  [`${ROLE_TYPE.ADMIN}:${ENTITY_TYPE.HEALTHCARE_FACILITY}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.ADMIN}:${ENTITY_TYPE.PROVINCE}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.ADMIN}:${ENTITY_TYPE.REGENCY}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.ADMIN}:${ENTITY_TYPE.VENDOR}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.MANAGER}:${ENTITY_TYPE.PROVINCE}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.MANAGER}:${ENTITY_TYPE.REGENCY}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.MANAGER}:${ENTITY_TYPE.HEALTHCARE_FACILITY}`]: ROLE_LABEL.FACILITY_ADMIN,
  [`${ROLE_TYPE.MANAGER}:${ENTITY_TYPE.VENDOR}`]: ROLE_LABEL.FACILITY_ADMIN,

  // === THIRD PARTY ===
  [`${ROLE_TYPE.MANAGER}:${ENTITY_TYPE.THIRD_PARTY}`]: ROLE_LABEL.THIRD_PARTY_ADMIN,
  [`${ROLE_TYPE.ADMIN}:${ENTITY_TYPE.THIRD_PARTY}`]: ROLE_LABEL.THIRD_PARTY_ADMIN,
};

// === ROLE GROUPING ===
const GROUP_ADMIN_ROLES = new Set<ROLE_LABEL>([
  ROLE_LABEL.FACILITY_ADMIN,
  ROLE_LABEL.THIRD_PARTY_ADMIN,
]);

// === ENTITY TYPE NAME ===
export const getEntityTypeName = (): string | null =>
  getUser()?.entity?.entity_type?.name ?? null;

const isEntity = (type: ENTITY_TYPE_NAME): boolean =>
  getEntityTypeName() === type;

export const isHealthcareFacilityEntity = () =>
  isEntity(ENTITY_TYPE_NAME.HEALTHCARE_FACILITY);
export const isThirdPartyEntity = () => isEntity(ENTITY_TYPE_NAME.THIRD_PARTY);
export const isProvinceEntity = () => isEntity(ENTITY_TYPE_NAME.PROVINCE);
export const isRegencyEntity = () => isEntity(ENTITY_TYPE_NAME.REGENCY);
export const isVendorEntity = () => isEntity(ENTITY_TYPE_NAME.VENDOR);

export function getUserRoleString(): ROLE_LABEL | null {
  const user = getUser();
  if (!user?.role) return null;

  const roleType = user.external_properties?.role?.type as ROLE_TYPE;
  const entityType = Number(user.entity?.type);

  if (roleType === ROLE_TYPE.SUPER_ADMIN) return ROLE_LABEL.SUPER_ADMIN;

  const key = `${roleType}:${entityType}`;
  return ROLE_ENTITY_MAPPING[key] ?? null;
}

export const isSuperAdmin = (): boolean =>
  getUserRoleString() === ROLE_LABEL.SUPER_ADMIN;

export const loggedAsAdmin = (): boolean =>
  getUser()?.role_label === ROLE_LABEL.ADMIN;

export const isFacilityAdmin = (): boolean => !loggedAsAdmin();

export const isSanitarian = (): boolean =>
  getUserRoleString() === ROLE_LABEL.SANITARIAN;

export const isGroupAdminRole = (): boolean =>
  GROUP_ADMIN_ROLES.has(getUserRoleString() as ROLE_LABEL);

export const isGroupThirdPartyRole = (): boolean =>
  getUserRoleString() === ROLE_LABEL.THIRD_PARTY_ADMIN;

export const isViewOnly = (): boolean => !!getUser()?.view_only;

type LocationData = {
  province?: string;
  regency?: string;
};

const extractLocationData = (location: string): LocationData => {
  const result: LocationData = {};

  const provinceRegex = /(PROV\.\s*[^,]+)/i;
  const regencyRegex = /((KAB\.|KOTA)\s*[^,]+)/i;

  const provinceMatch = provinceRegex.exec(location);
  if (provinceMatch) result.province = provinceMatch[1].trim();

  const regencyMatch = regencyRegex.exec(location);
  if (regencyMatch) result.regency = regencyMatch[1].trim();

  return result;
};

export const getDefaultHealthcareFacilityValue = () => {
  if (isSuperAdmin() || isGroupThirdPartyRole() || loggedAsAdmin()) return null;

  const user = getUser();
  if (!user?.entity) return null;

  return {
    label: user.entity.name ?? '',
    value: user.entity.id?.toString() ?? '',
  };
};

const getDefaultLocationValue = (
  type: 'province' | 'regency',
  skip: boolean
) => {
  if (skip) return null;

  const user = getUser();
  if (!user?.entity?.location) return null;

  const { province, regency } = extractLocationData(user.entity.location);
  const label = type === 'province' ? province : regency;
  const id =
    type === 'province' ? user.entity.province_id : user.entity.regency_id;

  if (!label) return null;
  return { label, value: id?.toString() ?? '' };
};

export const isProvinceManager = (): boolean =>
  isProvinceEntity() &&
  getUser()?.external_properties?.role?.type === ROLE_TYPE.MANAGER;

export const getDefaultProvinceValue = () =>
  getDefaultLocationValue(
    'province',
    isGroupThirdPartyRole() || isSuperAdmin() || isVendorEntity()
  );

export const getDefaultRegencyValue = () =>
  getDefaultLocationValue(
    'regency',
    isGroupThirdPartyRole() ||
      isSuperAdmin() ||
      isProvinceEntity() ||
      isVendorEntity()
  );
