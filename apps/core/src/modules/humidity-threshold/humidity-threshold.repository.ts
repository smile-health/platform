import { Context } from "hono"
import { BaseRepository } from "../base.repository"
import { GetHumidityThresholdsQueryParams } from "./humidity-threshold.schema"

export class HumidityThresholdRepository extends BaseRepository<"humidity_thresholds"> {
  constructor() {
    super("humidity_thresholds")
  }
  async list(c: Context, params: GetHumidityThresholdsQueryParams) {
    let query = c.var.trx
      .selectFrom("humidity_thresholds")
      .where("deleted_at", "is", null)
      .select(["id", "min_humidity", "max_humidity"])

    const offset = (params.page - 1) * params.paginate
    const isPaginate = !!params.page && !!params.paginate

    const [list, count] = await Promise.all([
      query
        .$if(isPaginate, (qb) => qb.limit(params.paginate).offset(offset))
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return { data: list, total: Number(count.total) }
  }
}