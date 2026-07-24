import env from "@/config/env.js"
import { HTTPError } from "@smile/lib/error.js"
import { logger } from "@smile/lib/logger.js"
import axios, { AxiosError } from "axios"
import { StatusCodes } from "http-status-codes"
import { GetOsrmRouteQuery } from "./osrm-route.schema.js"

export class OsrmRouteGateway {
  async getRoute(query: GetOsrmRouteQuery) {
    const { olng, olat, dlng, dlat, geometry } = query
    const url = `${env.OSRM_ROUTING_URL}/${olng},${olat};${dlng},${dlat}`

    try {
      const resp = await axios.get(url, {
        timeout: env.OSRM_TIMEOUT_MS,
        params: {
          overview: geometry ? "full" : "false",
          geometries: "geojson",
          alternatives: "false",
          steps: "false",
        },
      })

      return resp.data
    } catch (err) {
      const axErr = err as AxiosError

      // Request aborted by our own timeout.
      if (axErr.code === "ECONNABORTED" || axErr.code === "ETIMEDOUT") {
        logger.error({ err: axErr, url }, "OSRM request timed out")
        throw new HTTPError(
          "error.message.osrm_timeout",
          StatusCodes.GATEWAY_TIMEOUT
        )
      }

      // OSRM responded with a non-2xx status.
      if (axErr.response) {
        logger.error(
          { status: axErr.response.status, url },
          "OSRM returned a non-200 response"
        )
        throw new HTTPError(
          "error.message.osrm_upstream_error",
          StatusCodes.BAD_GATEWAY
        )
      }

      // DNS failure, connection refused, network unreachable, etc.
      logger.error({ err: axErr, url }, "OSRM request failed")
      throw new HTTPError(
        "error.message.osrm_unavailable",
        StatusCodes.BAD_GATEWAY
      )
    }
  }
}
