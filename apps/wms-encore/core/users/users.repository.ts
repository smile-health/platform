// Postgres columns for table `users` (mirrors
// infrastructure/database/models/UsersModel.ts field-for-field; Sequelize
// model has `paranoid: true` soft-deletes but `timestamps: true` with
// `createdAt: false, updatedAt: false` — i.e. created_at/updated_at are NOT
// auto-managed by Sequelize despite existing as columns):
//
//   id                     bigint, not null, primary key (no auto-increment
//                          in the Sequelize model — ids are assigned upstream)
//   user_uuid              uuid, not null
//   entity_id              bigint, not null, indexed (entity_id_idx)
//   firstname              varchar(100), nullable
//   lastname               varchar(100), nullable
//   email                  varchar(150), nullable, UNIQUE, indexed (email_idx)
//   username               varchar(100), nullable, UNIQUE, indexed (username_idx)
//   mobile_phone           varchar(20), nullable
//   gender                 integer, nullable
//   gender_label           varchar(20), nullable
//   date_of_birth          date, nullable
//   role                   integer, nullable
//   role_id                integer, nullable
//   role_label             varchar(50), nullable
//   view_only              boolean, not null, default false
//   status                 integer, nullable
//   last_device            integer, nullable
//   last_login             timestamp, nullable
//   integration_client_id  integer, nullable
//   keycloak_uuid          uuid, nullable
//   external_roles         text, nullable
//   address                text, nullable
//   manufacture_id         integer, nullable
//   village_id             text, nullable
//   external_properties    json, nullable
//   deleted_at             timestamp, nullable (paranoid soft-delete)
//   created_at             timestamp, nullable
//   updated_at             timestamp, nullable
//   created_by             bigint, nullable
//   updated_by             bigint, nullable
//   deleted_by             bigint, nullable
//   is_active              boolean, nullable, default true
//
// Indexes: PRIMARY on `id`; user_uuid_idx on `user_uuid`; entity_id_idx on
// `entity_id`; email_idx on `email`; username_idx on `username`.
//
// Joined tables (already ported by sibling modules, referenced read-only
// here — see core/entities/entities.repository.ts and
// core/user-role/user-role.repository.ts for their column lists):
//   entities  (belongsTo via users.entity_id -> entities.id, as "entity")
//   user_role (belongsTo via users.external_roles -> user_role.type, as "userRole")

import { db } from "../db-wms";
import type { PaginationMeta, User } from "./users.types";

interface UserRow {
  id: number;
  user_uuid: string;
  entity_id: number;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  username: string | null;
  mobile_phone: string | null;
  gender: number | null;
  gender_label: string | null;
  date_of_birth: string | null;
  role: number | null;
  role_id: number | null;
  role_label: string | null;
  view_only: boolean | null;
  status: number | null;
  last_device: number | null;
  last_login: string | null;
  integration_client_id: number | null;
  keycloak_uuid: string | null;
  external_roles: string | null;
  address: string | null;
  manufacture_id: number | null;
  village_id: string | null;
  external_properties: unknown | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  is_active: boolean | null;
  entity_id_join: number | null;
  entity_name: string | null;
  entity_province_id: number | null;
  entity_regency_id: number | null;
  entity_tag: string | null;
  entity_is_active: boolean | null;
  entity_address: string | null;
  entity_type: number | null;
  entity_location: string | null;
  role_ref_id: number | null;
  role_ref_name: string | null;
  role_ref_name_en: string | null;
  role_ref_type: string | null;
}

function toEntity(row: UserRow): User {
  return {
    id: row.id,
    userUuid: row.user_uuid,
    entityId: row.entity_id,
    firstname: row.firstname ?? undefined,
    lastname: row.lastname ?? undefined,
    email: row.email ?? undefined,
    username: row.username ?? undefined,
    mobilePhone: row.mobile_phone ?? undefined,
    gender: row.gender ?? undefined,
    genderLabel: row.gender_label ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    role: row.role ?? undefined,
    roleId: row.role_id ?? undefined,
    roleLabel: row.role_label ?? undefined,
    viewOnly: row.view_only ?? undefined,
    status: row.status ?? undefined,
    lastDevice: row.last_device ?? undefined,
    lastLogin: row.last_login ?? undefined,
    integrationClientId: row.integration_client_id ?? undefined,
    keycloakUuid: row.keycloak_uuid ?? undefined,
    externalRoles: row.external_roles ?? undefined,
    address: row.address ?? undefined,
    manufactureId: row.manufacture_id ?? undefined,
    villageId: row.village_id ?? undefined,
    externalProperties: (row.external_properties as Record<string, unknown> | null) ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    isActive: row.is_active ?? undefined,
    entity: row.entity_id_join
      ? {
          id: row.entity_id_join,
          name: row.entity_name ?? undefined,
          provinceId: row.entity_province_id ?? undefined,
          regencyId: row.entity_regency_id ?? undefined,
          tag: row.entity_tag ?? undefined,
          isActive: row.entity_is_active ?? undefined,
          address: row.entity_address ?? undefined,
          type: row.entity_type ?? undefined,
          location: row.entity_location ?? undefined,
        }
      : undefined,
    userRole: row.role_ref_id
      ? {
          id: row.role_ref_id,
          name: row.role_ref_name ?? undefined,
          nameEn: row.role_ref_name_en ?? undefined,
          type: row.role_ref_type ?? undefined,
        }
      : undefined,
  };
}

function baseSelect() {
  return db
    .selectFrom("users")
    .leftJoin("entities", "entities.id", "users.entity_id")
    .leftJoin("user_role", "user_role.type", "users.external_roles")
    .select([
      "users.id as id",
      "users.user_uuid as user_uuid",
      "users.entity_id as entity_id",
      "users.firstname as firstname",
      "users.lastname as lastname",
      "users.email as email",
      "users.username as username",
      "users.mobile_phone as mobile_phone",
      "users.gender as gender",
      "users.gender_label as gender_label",
      "users.date_of_birth as date_of_birth",
      "users.role as role",
      "users.role_id as role_id",
      "users.role_label as role_label",
      "users.view_only as view_only",
      "users.status as status",
      "users.last_device as last_device",
      "users.last_login as last_login",
      "users.integration_client_id as integration_client_id",
      "users.keycloak_uuid as keycloak_uuid",
      "users.external_roles as external_roles",
      "users.address as address",
      "users.manufacture_id as manufacture_id",
      "users.village_id as village_id",
      "users.external_properties as external_properties",
      "users.created_at as created_at",
      "users.updated_at as updated_at",
      "users.created_by as created_by",
      "users.updated_by as updated_by",
      "users.is_active as is_active",
      "entities.id as entity_id_join",
      "entities.name as entity_name",
      "entities.province_id as entity_province_id",
      "entities.regency_id as entity_regency_id",
      "entities.tag as entity_tag",
      "entities.is_active as entity_is_active",
      "entities.address as entity_address",
      "entities.type as entity_type",
      "entities.location as entity_location",
      "user_role.id as role_ref_id",
      "user_role.name as role_ref_name",
      "user_role.name_en as role_ref_name_en",
      "user_role.type as role_ref_type",
    ])
    .where("users.deleted_at", "is", null);
}

export async function findById(id: number): Promise<User | null> {
  const row = await baseSelect().where("users.id", "=", id).executeTakeFirst();
  return row ? toEntity(row as UserRow) : null;
}

export async function findByUserUuid(userUuid: string): Promise<User | null> {
  const row = await baseSelect().where("users.user_uuid", "=", userUuid).executeTakeFirst();
  return row ? toEntity(row as UserRow) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  entityTypeId?: number;
  entityId?: number;
  search?: string;
  provinceId?: number;
  regencyId?: number;
  userId?: number;
  role?: string;
  isActive?: boolean;
}): Promise<{ data: User[]; pagination: PaginationMeta }> {
  let query = baseSelect();

  if (params.userId) query = query.where("users.id", "=", params.userId);
  if (params.entityId) query = query.where("users.entity_id", "=", params.entityId);
  if (params.role) {
    query = query.where("users.external_roles", "=", params.role);
  } else {
    query = query.where("users.external_roles", "!=", "");
  }
  if (params.isActive !== undefined) query = query.where("users.is_active", "=", params.isActive);
  // entities.province_id/regency_id are string columns (matching the original
  // varchar-typed Sequelize model) even though callers pass numeric ids.
  if (params.provinceId) query = query.where("entities.province_id", "=", String(params.provinceId));
  if (params.regencyId) query = query.where("entities.regency_id", "=", String(params.regencyId));
  if (params.search && params.search.trim() !== "") {
    const term = `%${params.search.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("users.firstname", "ilike", term),
        eb("users.lastname", "ilike", term),
        eb("users.username", "ilike", term),
      ])
    );
  }

  const countRow = await query
    .clearSelect()
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map((r) => toEntity(r as UserRow)),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors handleValidateToken.ts's UsersModel.create/update branches:
// JIT-provisions/refreshes a local `users` row on every auth-cache-miss,
// since nothing else in this port creates users rows — see
// entities.repository.ts's createEntity for the same gap on the entities
// side. Takes the raw core profile fields directly (snake_case, matching the
// shape handleValidateToken.ts read off its `dataInput`) rather than the
// camelCase `User` type, since this is a straight passthrough of the auth
// profile, not a caller-constructed payload.
export async function upsertFromProfile(data: {
  id: number;
  user_uuid: string;
  entity_id: number;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  username?: string | null;
  mobile_phone?: string | null;
  gender?: number | null;
  gender_label?: string | null;
  date_of_birth?: string | null;
  role?: number | null;
  role_id?: number | null;
  role_label?: string | null;
  view_only?: boolean;
  status?: number | null;
  last_device?: number | null;
  integration_client_id?: number | null;
  keycloak_uuid?: string | null;
  external_roles: string;
  external_properties?: Record<string, unknown>;
  address?: string | null;
  manufacture_id?: number | null;
  village_id?: string | null;
  last_login?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}): Promise<void> {
  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", data.id)
    .executeTakeFirst();

  if (!existing) {
    await db
      .insertInto("users")
      .values({
        id: data.id,
        user_uuid: data.user_uuid,
        entity_id: data.entity_id,
        firstname: data.firstname ?? null,
        lastname: data.lastname ?? null,
        email: data.email ?? null,
        username: data.username ?? null,
        mobile_phone: data.mobile_phone ?? null,
        gender: data.gender ?? null,
        gender_label: data.gender_label ?? null,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        role: data.role ?? null,
        role_id: data.role_id ?? null,
        role_label: data.role_label ?? null,
        view_only: data.view_only ?? false,
        status: data.status ?? null,
        last_device: data.last_device ?? null,
        last_login: data.last_login ? new Date(data.last_login) : null,
        integration_client_id: data.integration_client_id ?? null,
        keycloak_uuid: data.keycloak_uuid ?? null,
        external_roles: data.external_roles,
        external_properties: data.external_properties ?? {},
        address: data.address ?? null,
        manufacture_id: data.manufacture_id ?? null,
        village_id: data.village_id ?? null,
        created_by: data.created_by ?? null,
        updated_by: data.updated_by ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
    return;
  }

  await db
    .updateTable("users")
    .set({
      entity_id: data.entity_id,
      username: data.username ?? null,
      firstname: data.firstname ?? null,
      lastname: data.lastname ?? null,
      view_only: data.view_only ?? false,
      external_properties: data.external_properties ?? {},
      external_roles: data.external_roles,
      updated_at: new Date(),
    })
    .where("id", "=", data.id)
    .execute();
}

export async function updateStatus(id: number, isActive: boolean): Promise<User | null> {
  const existing = await findById(id);
  if (!existing) return null;

  await db.updateTable("users").set({ is_active: isActive }).where("id", "=", id).execute();

  return { ...existing, isActive };
}
