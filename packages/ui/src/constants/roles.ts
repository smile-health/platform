export enum EXTERNAL_USER_ROLE {
  SUPERADMIN = 1,
  ADMIN = 2,
  MANAGER = 3,
  OPERATOR = 4,
  SANITARIAN = 5,
  OPERATOR_TRANSPORTER = 6,
  OPERATOR_TREATMENT = 7,
  OPERATOR_LANDFILL = 8,
  OPERATOR_RECYCLER = 9,
  OPERATOR_SPECIALIZED_TRANSPORT = 10,
  OPERATOR_LOCAL_TRANSPORTER = 11,
  OPERATOR_WASTE_BANK = 12,
}

export enum USER_WMS_ROLE {
  SUPERADMIN = 1,
  ADMIN = 2,
}

export enum USER_ROLE {
  SUPERADMIN = 1,
  ADMIN = 2,
  MANAGER = 3,
  OPERATOR = 4,
  OPERATOR_COVID = 5,
  DISTRIBUTOR_COVID = 6,
  MANAGER_COVID = 7,
  CONTACT_CENTER = 8,
  THIRD_PARTY = 9,
  PKC = 10,
  MANUFACTURE = 11,
  ASIK = 12,
  ADMIN_FREEZE = 14,
  VENDOR_IOT = 15,
}

export enum MANUFACTURE_TYPE {
  MATERIAL = 1,
  VAKSIN = 3,
}

export const userRoleList = [
  { value: USER_ROLE.SUPERADMIN, label: 'Super Admin' },
  { value: USER_ROLE.ADMIN, label: 'Admin' },
  { value: USER_ROLE.MANAGER, label: 'Manager' },
  { value: USER_ROLE.OPERATOR, label: 'Operator' },
  { value: USER_ROLE.OPERATOR_COVID, label: 'Operator Covid' },
  { value: USER_ROLE.DISTRIBUTOR_COVID, label: 'Distributor' },
  { value: USER_ROLE.MANAGER_COVID, label: 'Manager Covid' },
  { value: USER_ROLE.CONTACT_CENTER, label: 'Contact Center' },
  { value: USER_ROLE.THIRD_PARTY, label: 'Third Party' },
  { value: USER_ROLE.PKC, label: 'PKC' },
  { value: USER_ROLE.MANUFACTURE, label: 'Manufacture' },
  { value: USER_ROLE.VENDOR_IOT, label: 'Vendor Iot' },
]
