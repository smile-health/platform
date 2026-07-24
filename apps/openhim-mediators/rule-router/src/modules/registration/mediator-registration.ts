/**
 * OpenHIM Mediator Registration + Heartbeat
 */

import { registerMediator, activateHeartbeat } from "openhim-mediator-utils";
import type { Logger } from "pino";
import type { Env } from "../../config/env";

const MEDIATOR_URN = "urn:mediator:smile-rule-router";

function buildOpenhimConfig(env: Env) {
  return {
    apiURL: env.OPENHIM_API_ENDPOINT,
    username: env.OPENHIM_ADMIN_EMAIL,
    password: env.OPENHIM_ADMIN_PASSWORD,
    trustSelfSigned: !env.OPENHIM_REJECT_UNAUTHORIZED,
    urn: MEDIATOR_URN,
  };
}

function buildMediatorManifest(env: Env) {
  return {
    urn: MEDIATOR_URN,
    version: "1.0.0",
    name: "SMILE Rule Router",
    description: "Rule-based routing mediator for SMILE order events",
    endpoints: [
      {
        name: "Routing Endpoint",
        host: env.SERVICE_HOST,
        port: env.PORT,
        path: "/route",
        type: "http",
      },
    ],
    defaultChannelConfig: [],
  };
}

/**
 * Registers the mediator with OpenHIM and starts the heartbeat.
 * Returns the heartbeat interval ID so the caller can stop it on shutdown.
 * Non-fatal: if registration fails the service continues to handle requests.
 */
export function registerWithOpenHIM(
  env: Env,
  logger: Logger,
): Promise<number | null> {
  return new Promise((resolve) => {
    const openhimConfig = buildOpenhimConfig(env);
    const manifest = buildMediatorManifest(env);

    logger.info(
      { apiURL: openhimConfig.apiURL, urn: MEDIATOR_URN },
      "Registering mediator with OpenHIM...",
    );

    registerMediator(openhimConfig, manifest, (err?: Error) => {
      if (err) {
        logger.warn(
          { error: err.message, urn: MEDIATOR_URN },
          "Mediator registration failed — continuing startup. " +
            "Ensure OpenHIM is running and OPENHIM_API_ENDPOINT is correct.",
        );
        return resolve(null);
      }

      logger.info(
        { urn: MEDIATOR_URN },
        "Mediator registered successfully with OpenHIM",
      );

      try {
        const intervalId = activateHeartbeat(openhimConfig);
        logger.info({ urn: MEDIATOR_URN }, "Mediator heartbeat activated");
        resolve(intervalId);
      } catch (heartbeatErr: unknown) {
        logger.warn(
          { error: heartbeatErr instanceof Error ? heartbeatErr.message : String(heartbeatErr), urn: MEDIATOR_URN },
          "Failed to activate heartbeat — mediator will appear offline in console",
        );
        resolve(null);
      }
    });
  });
}
