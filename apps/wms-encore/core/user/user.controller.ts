// Real endpoints ported from apps/core's wire.ts mount "/users". CRUD only
// — see user.repository.ts. Password handling is intentionally NOT ported
// (the original hashes with bcrypt in user.module.ts) — createUser here
// stores whatever's passed through, which is NOT safe to call for real yet.
import { api, APIError } from "encore.dev/api";
import * as repo from "./user.repository";

interface UserListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO — see entity.controller.ts's comment for why (Encore's
// schema parser rejects Record<string,unknown>/Partial<T>). Fields match
// UsersTable minus id/audit/timestamps and minus village_id (dropped in
// db.types.ts).
interface UserDto {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  address?: string | null;
  gender?: number | null;
  date_of_birth?: Date | null;
  mobile_phone?: string | null;
  mobile_phone_2?: string | null;
  mobile_phone_brand?: string | null;
  mobile_phone_model?: string | null;
  imei_number?: string | null;
  sim_id?: string | null;
  sim_provider?: string | null;
  entity_id?: number | null;
  manufacture_id?: number | null;
  role?: number | null;
  status?: number | null;
  permission?: string | null;
  keycloak_uuid?: string | null;
  user_uuid?: string | null;
  fcm_token?: string | null;
  application_version?: string | null;
  view_only?: number;
  change_password?: number | null;
  daily_recap_email?: number | null;
  timezone_id?: number | null;
  iota_app_gui_theme?: string | null;
  external_properties?: string | null;
}

interface UserUpdateDto extends UserDto {
  id: number;
}

// Plain response type — see entity.controller.ts's comment for why.
interface UserResponseDto extends UserDto {
  id: number;
}

export const listUser = api(
  { method: "GET", path: "/api/v1/core/users", auth: false, expose: true },
  async (params: UserListParams): Promise<{ status: "success"; data: UserResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as UserResponseDto[] };
  },
);

export const getUser = api(
  { method: "GET", path: "/api/v1/core/users/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: UserResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("User not found");
    return { status: "success", data: row as unknown as UserResponseDto };
  },
);

export const getUserByUsername = api(
  { method: "GET", path: "/api/v1/core/users/by-username/:username", auth: false, expose: true },
  async ({ username }: { username: string }): Promise<{ status: "success"; data: UserResponseDto }> => {
    const row = await repo.findByUsername(username);
    if (!row) throw APIError.notFound("User not found");
    return { status: "success", data: row as unknown as UserResponseDto };
  },
);

export const createUser = api(
  { method: "POST", path: "/api/v1/core/users", auth: false, expose: true },
  async (data: UserDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: hash `password` (bcrypt, matching the original) before this ever
    // runs for real — currently stores it as passed-through plaintext.
    const id = await repo.create(data as never, 0);
    return { status: "success", data: { id } };
  },
);

export const updateUser = api(
  { method: "PUT", path: "/api/v1/core/users/:id", auth: false, expose: true },
  async ({ id, ...data }: UserUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never, 0);
    return { status: "success", data: null };
  },
);

export const deleteUser = api(
  { method: "DELETE", path: "/api/v1/core/users/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id, 0);
    return { status: "success", data: null };
  },
);
