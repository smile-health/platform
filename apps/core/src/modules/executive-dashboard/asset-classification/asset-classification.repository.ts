import { Context } from "hono"
import { AssetClassificationRequest } from "./asset-classification.schema.js"

export class ExecutiveAssetClassificationRepository {
  async findAll(c: Context, queryParam: AssetClassificationRequest) {
    const query = c.var.trx
      .selectFrom("asset_classifications")
      .where("deleted_at", "is", null)
      .$if(!!queryParam.keyword, (qb) =>
        qb.where("name", "like", `%${queryParam.keyword}%`)
      )

    const offset = (queryParam.page - 1) * queryParam.paginate
    const [list, count] = await Promise.all([
      query.limit(queryParam.paginate).offset(offset).selectAll().execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data: list,
      total: Number(count.total),
    }
  }
}
