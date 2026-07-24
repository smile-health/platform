import { BadRequestError, NotFoundError } from "@smile/lib/error.js"
import { Context } from "hono"
import { ExecutiveUserRepository } from "./executive-user.repository.js"
import { UpdateLastLoginRequest } from "./executive-user.schema.js"

export class ExecutiveUserModule {
  constructor(private readonly repository: ExecutiveUserRepository) {}

  async updateUserLastAndFcmByUUID(
    c: Context,
    data: UpdateLastLoginRequest,
    id: string
  ) {
    await this.repository.updateUserLastAndFcmByUUID(c, data, id)
  }

  async validateUserExists(c: Context, username: string) {
    const user = await this.repository.dataExists(c, {
      column: "username",
      value: username,
    })

    if (!user) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("common.user"),
        })
      )
    }

    if (!user.status) {
      throw new BadRequestError(c.var.t("auth.account_inactive"))
    }

    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role_label: user.role_label,
    }
  }
}
