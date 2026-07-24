import { BaseRepository } from "../base.repository"

export class AssetTypeHumidityRepository extends BaseRepository<"asset_type_humidity"> {
  constructor() {
    super("asset_type_humidity")
  }
}
