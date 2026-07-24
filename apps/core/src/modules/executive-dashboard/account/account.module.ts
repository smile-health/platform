/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcrypt"
import { Context } from "hono"
import * as jwt from "jsonwebtoken"
import moment from "moment"
import env from "@/config/env.js"
import { collect, getLabelByKey, pick } from "@smile/lib/utils.js"
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@smile/lib/error.js"
import {
  DEVICE_TYPE,
  USER_CHANGELOGS_FIELD,
  USER_GENDER,
  USER_ROLE,
} from "@/common/constants/users.js"
import { logger } from "@smile/lib/logger.js"
import { AuthKeycloakService } from "../../auth/auth.keycloak.service.js"
import { EntityRepository } from "../../entity/entity.repository.js"
import { LocationRepository } from "../../location/location.repository.js"
import { ManufactureRepository } from "../../manufacture/manufacture.repository.js"
import { ExecutiveUserRepository } from "../user/executive-user.repository.js"
import {
  CreateUserRequest,
  ListQuery,
  LoginRequest,
  UpdatePasswordRequest,
  UpdateStatusRequest,
  UpdateUserRequest,
} from "./account.schema.js"
import { ExecutiveWorkspaceRepository } from "../workspace/workspace.repository.js"
import { extractJSONFromString } from "@/modules/user/user.schema.js"
import { ExecutiveRoleRepository } from "../role/role.repository.js"
import { ExecutiveUserChangelogRepository } from "../user_changelog/user_changelog.repository.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { StatusCodes } from "http-status-codes"

export class ExecutiveAccountModule {
  constructor(
    private readonly executiveUserRepo: ExecutiveUserRepository,
    private readonly entityRepo: EntityRepository,
    private readonly executiveWorkspaceRepo: ExecutiveWorkspaceRepository,
    private readonly locationRepo: LocationRepository,
    private readonly authKeycloakService: AuthKeycloakService,
    private readonly manufactureRepo: ManufactureRepository,
    private readonly executiveRoleRepo: ExecutiveRoleRepository,
    private readonly executiveUserChangelogRepo: ExecutiveUserChangelogRepository
  ) {}

  async assignChangeLogs(c: Context, dataPrevious) {
    const oldValue = {}
    const newValue = {}
    const dataCurrent = await this.executiveUserRepo.findById(
      c,
      dataPrevious.id
    )
    if (!dataCurrent) return

    USER_CHANGELOGS_FIELD.forEach((el) => {
      if (dataCurrent[el] !== dataPrevious[el]) {
        if (el === "password") {
          oldValue[el] = 0
          newValue[el] = 1
        } else {
          oldValue[el] = dataPrevious[el]
          newValue[el] = dataCurrent[el]
        }
      }
    })

    if (
      JSON.stringify(newValue) !== "{}" ||
      JSON.stringify(oldValue) !== "{}"
    ) {
      const dataChangeLogs = {
        user_id: dataPrevious.id,
        field: "",
        old_value: JSON.stringify(oldValue).toString(),
        new_value: JSON.stringify(newValue).toString(),
        updated_by: dataCurrent.updated_by?.toString(),
      }
      await this.executiveUserChangelogRepo.create(c, dataChangeLogs)
    }
  }

  async login(c: Context, req: LoginRequest) {
    const user = await this.executiveUserRepo.findByUsername(c, req.username)
    if (!user) {
      throw new UnauthorizedError(c.var.t("auth.invalid"))
    }

    const passwordMatch = await bcrypt.compare(req.password, user.password)
    if (!passwordMatch) {
      throw new UnauthorizedError(c.var.t("auth.invalid"))
    }

    if (!user.status) {
      throw new UnauthorizedError(c.var.t("auth.account_inactive"))
    }

    // temporary, if id keycloak not exist in table, create user to keycloak
    if (!user.keycloak_uuid || req.create) {
      try {
        const programIds = await this.executiveWorkspaceRepo.getUserProgramIds(
          c,
          user.id
        )
        const authKeycloak = await this.authKeycloakService.createUser({
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: req.password,
          program_ids: programIds.map((val: number) => String(val)),
          role_label: user.role_label ?? "None",
        })
        await this.executiveUserRepo.update(
          c,
          {
            keycloak_uuid: authKeycloak.keycloak_uuid,
            user_uuid: authKeycloak.user_uuid,
          },
          { id: user.id }
        )
      } catch (error) {
        console.log(`Failed insert data to keycloak ${JSON.stringify(error)}`)
      }
    }

    const [entity, allWorkspaces, manufacture] = await Promise.all([
      this.entityRepo.findBasicById(c, user.entity_id ?? 0),
      this.executiveWorkspaceRepo.getUserPrograms(c, user.id),
      this.manufactureRepo.findOne(c, { id: user.manufacture_id }),
    ])

    const workspaces = allWorkspaces[user.id] ?? []

    const entityLocationId =
      entity?.village_id ??
      entity?.sub_district_id ??
      entity?.regency_id ??
      entity?.province_id ??
      "0"
    const entityLocation = await this.locationRepo.getDetails(
      c,
      Number(entityLocationId)
    )

    const payload = {
      account_id: user.id,
      workspaces: workspaces,
      role: user.role,
    }

    const token = jwt.sign(payload, env.APP_KEY, { expiresIn: "7d" })
    user.token_login = token
    c.set("user", { ...user, last_login: user.last_login ?? new Date() })

    await this.executiveUserRepo.updateUserTokenLogin(
      c,
      {
        token_login: token,
        fcm_token: req.fcm_token,
        last_login: moment().format("YYYY-MM-DD HH:mm:ss"),
        last_device: DEVICE_TYPE[c.req.header("device-type")!],
      },
      user.id
    )

    const baseResponse = {
      ...pick(user, [
        "id",
        "firstname",
        "lastname",
        "username",
        "email",
        "role",
      ]),
      entity: {
        ...entity,
        ...entityLocation,
      },
      manufacture,
      token,
    }

    return {
      ...baseResponse,
      programs: workspaces
        .filter((ws) => ws.is_beneficiaries === 0)
        .map((ws) => ws.id),
      beneficiaries: workspaces
        .filter((ws) => ws.is_beneficiaries === 1)
        .map((ws) => ws.id),
    }
  }

  async logout(c: Context) {
    return await this.executiveUserRepo.invalidateToken(c, c.var.accountID)
  }

  async updatePassword(c: Context, data: UpdatePasswordRequest) {
    const user = await this.executiveUserRepo.findOne(c, { id: c.var.user.id })

    const passwordMatch = await bcrypt.compare(data.password, user?.password)

    if (!passwordMatch) {
      throw new BadRequestError(c.var.t("auth.old_password_unmatch"))
    }

    if (user?.keycloak_uuid) {
      await this.authKeycloakService.updateUser(user?.keycloak_uuid ?? "", {
        username: user?.username,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        password: data.new_password!,
        user_uuid: user.user_uuid,
      })
    }

    await this.executiveUserRepo.update(
      c,
      {
        password: await bcrypt.hash(data.new_password, 10),
      },
      { id: Number(c.var.user.id) }
    )
  }

  async update(c: Context, data: UpdateUserRequest, id: number) {
    let isChangeProgramIds: boolean = true
    let hashPassword: string | undefined
    const { program_ids, ...user } = data
    const dataPrevious = await this.executiveUserRepo.findById(c, id)
    if (!dataPrevious) {
      throw new NotFoundError(
        `${c.var.t("validator.not_exist", { field: "user" })}`
      )
    }

    if (c.var.role != USER_ROLE.SUPERADMIN) {
      isChangeProgramIds = false
    }

    if (user.password) {
      hashPassword = await bcrypt.hash(user.password, 10)
    }

    const role = await this.executiveRoleRepo.findOne(c, { id: user.role ?? 0 })

    const updateUserAuthKeycloak = {
      username: user.username ?? dataPrevious.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email!,
      password: user.password,
      user_uuid: dataPrevious?.user_uuid,
      program_ids: isChangeProgramIds
        ? (program_ids ?? []).map((val) => String(val))
        : undefined,
      role_label: role?.name,
    }

    let userNotFound = false

    try {
      await this.authKeycloakService.updateUser(
        dataPrevious?.keycloak_uuid ?? "",
        updateUserAuthKeycloak
      )
    } catch (error: any) {
      logger.error(
        error,
        `error failed update user auth service by keycloak ${error} - ${JSON.stringify(updateUserAuthKeycloak)}`
      )
      const errorMessage = extractJSONFromString(error?.message)

      if (errorMessage) {
        c.set("errors", errorMessage)
        throw new ValidationError()
      } else {
        // bypass update error on user not found on keycloak
        if (
          String(error).includes("User not found") ||
          !dataPrevious?.keycloak_uuid
        ) {
          userNotFound = true
        } else {
          throw new BadRequestError(c.var.t("auth.failed_verif"))
        }
      }
    }

    await Promise.all([
      this.executiveUserRepo.update(
        c,
        {
          ...user,
          role: user.role,
          password: hashPassword!,
          keycloak_uuid: userNotFound ? null : dataPrevious?.keycloak_uuid, // reset keycloak uuid on user keycloak not found
        },
        { id }
      ),
      this.assignChangeLogs(c, dataPrevious),
      isChangeProgramIds && program_ids && program_ids.length > 0
        ? this.executiveWorkspaceRepo.attachWithUserID(c, id, program_ids)
        : null,
    ])

    return this.detail(c, id)
  }

  async detail(c: Context, id: number) {
    const user = await this.executiveUserRepo.findById(c, id)

    if (!user) throw new NotFoundError()

    const {
      password,
      token_login,
      sim_id,
      sim_provider,
      imei_number,
      change_password,
      fcm_token,
      application_version,
      iota_app_gui_theme,
      mobile_phone_2,
      mobile_phone_brand,
      mobile_phone_model,
      permission,
      last_mobile_access,
      timezone_id,
      ...filteredUser
    } = user

    const [entity, programs, location, role, manufacture] = await Promise.all([
      this.entityRepo.findBasicById(c, filteredUser.entity_id ?? 0),
      this.executiveWorkspaceRepo.getUserPrograms(c, filteredUser.id!),
      this.locationRepo.getDetails(c, Number(filteredUser.village_id)),
      this.executiveRoleRepo.findOne(c, { id: filteredUser.role_id }),
      this.manufactureRepo.findOne(c, { id: filteredUser.manufacture_id }),
    ])

    const userPrograms = programs[filteredUser.id!] ?? []

    return {
      ...filteredUser,
      entity,
      manufacture,
      location,
      role_label: role?.name,
      gender_label: getLabelByKey(USER_GENDER, filteredUser?.gender),
      programs: userPrograms.filter((w) => w.is_beneficiaries === 0),
      beneficiaries: userPrograms.filter((w) => w.is_beneficiaries === 1),
      program_ids: userPrograms
        .filter((ws) => ws.is_beneficiaries === 0)
        .map((ws) => ws.id),
      beneficiaries_ids: userPrograms
        .filter((ws) => ws.is_beneficiaries === 1)
        .map((ws) => ws.id),
    }
  }

  async getList(c: Context, queries: ListQuery) {
    queries.offset = (queries.page - 1) * queries.paginate

    const { users, total } = await this.executiveUserRepo.findAll(c, queries)

    if (users.length === 0) {
      return new PaginatedResponse(queries)
    }

    const data = await this.#mapList(c, users)

    return new PaginatedResponse(queries, data, total)
  }

  async updateStatus(c: Context, id: number, data: UpdateStatusRequest) {
    const user = await this.executiveUserRepo.findOne(c, { id: id })
    if (user) {
      await this.authKeycloakService.updateUser(user?.keycloak_uuid ?? "", {
        username: user?.username,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        enabled: data.status,
      })
    }
    await Promise.all([
      this.executiveUserRepo.update(c, { status: data.status }, { id }),
    ])

    return this.detail(c, id)
  }

  async getChangeLogs(c: Context, id: number) {
    const changeLogs = await this.executiveUserChangelogRepo.find(c, {
      user_id: id,
    })
    if (changeLogs.length === 0) return []

    const userIds: number[] = collect(changeLogs, "updated_by")
    const users = await this.executiveUserRepo.findBasicUserMappedByIds(
      c,
      userIds ?? [0]
    )
    return changeLogs.map((log) => {
      const user = users[log.updated_by ?? 0]
      return {
        ...log,
        updated_by:
          (user?.firstname ?? "") + (user?.lastname ? " " + user.lastname : ""),
      }
    })
  }

  async #mapList(c: Context, users) {
    const userIds: number[] = collect(users, "id")
    const entityIds: number[] = Array.from(new Set(collect(users, "entity_id")))
    const [entities, programs] = await Promise.all([
      this.entityRepo.findBasicAllByIds(c, entityIds),
      this.executiveWorkspaceRepo.getUserPrograms(c, userIds),
    ])
    return users.map((user) => {
      const userPrograms = programs[user.id] ?? []
      return {
        ...user,
        entity: entities[user.entity_id ?? 0],
        programs: userPrograms.filter((w) => w.is_beneficiaries === 0),
        beneficiaries: userPrograms.filter((w) => w.is_beneficiaries === 1),
      }
    })
  }

  async create(c: Context, data: CreateUserRequest, returnDetail = true) {
    const { program_ids: workspace_ids, external_roles, ...crte } = data
    const { client } = c.var

    // add prosess check if keycloak doesnt exists
    const userExist = await this.executiveUserRepo.checkUsernameEmail(
      c,
      crte.username,
      crte.email
    )

    if (userExist) {
      try {
        const checkUserKC = await this.authKeycloakService.getUser(
          userExist?.keycloak_uuid ?? ""
          // Later try to get the User details from KC based upon the USER ID and match email and username.
        )
        if (checkUserKC?.data) {
          return {
            code: StatusCodes.CONFLICT,
            success: false,
            message: c.var.t("validator.exist", {
              field: c.var.t("common.user"),
            }),
          }
        }
      } catch (error: any) {
        if (error?.message?.includes("Failed get user")) {
          const authKeycloak = await this.authKeycloakService.createUser({
            username: userExist.username,
            firstname: userExist.firstname,
            lastname: userExist.lastname,
            email: userExist.email,
            role_label: userExist.role_label!,
            program_ids: workspace_ids!.map((val) => String(val)),
            password: data.password ?? "Smile12*",
          })

          await Promise.all([
            this.executiveUserRepo.update(
              c,
              {
                keycloak_uuid: authKeycloak.keycloak_uuid,
                user_uuid: authKeycloak.user_uuid,
                role: data.role,
              },
              { id: userExist?.id }
            ),
          ])

          logger.warn(`User already created in keycloak`)
          return {
            code: StatusCodes.CONFLICT,
            success: false,
            message: c.var.t("validator.exist", {
              field: c.var.t("common.user"),
            }),
            data: await this.detail(c, userExist.id!),
          }
        }
        return {
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Internal server error",
        }
      }
    }

    const bcryptPassword = await bcrypt.hash(crte.password, 10)
    const { external_properties, integration_client_id, ...restCrte } = crte
    const result = await this.executiveUserRepo.create(c, {
      ...restCrte,
      status: 1,
      password: bcryptPassword,
    })
    const userId = Number(result.insertId)
    const role = await this.executiveRoleRepo.findOne(c, { id: data.role ?? 0 })
    const roleLabel = role?.name
    const authKeycloak = await this.authKeycloakService.createUser({
      ...data,
      role_label: roleLabel,
      program_ids: (workspace_ids ?? [])!.map((val) => String(val)),
    })

    await Promise.all([
      this.executiveUserRepo.update(
        c,
        {
          keycloak_uuid: authKeycloak.keycloak_uuid,
          user_uuid: authKeycloak.user_uuid,
          role: data.role,
        },
        { id: userId }
      ),
      this.executiveWorkspaceRepo.attachWithUserID(
        c,
        userId,
        workspace_ids || []
      ),
    ])

    return {
      code: StatusCodes.CREATED,
      success: true,
      data: returnDetail ? await this.detail(c, userId) : null,
    }
  }
}
