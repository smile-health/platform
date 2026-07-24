import { BaseRepository } from "@/modules/base.repository"

export class ExecutiveUserChangelogRepository extends BaseRepository<"executive_user_changelogs"> {
  constructor() {
    super("executive_user_changelogs", false)
  }
}
