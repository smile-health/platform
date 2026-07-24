import { OsrmRouteGateway } from "./osrm-route.gateway.js"
import { GetOsrmRouteQuery } from "./osrm-route.schema.js"

export class OsrmRouteModule {
  constructor(private readonly gateway: OsrmRouteGateway) {}

  async route({ query }: { query: GetOsrmRouteQuery }) {
    // The OSRM payload is piped back to the client untransformed.
    return this.gateway.getRoute(query)
  }
}
