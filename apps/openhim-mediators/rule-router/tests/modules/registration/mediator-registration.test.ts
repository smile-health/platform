/**
 * Unit tests for src/modules/registration/mediator-registration.ts
 *
 * Mocking strategy:
 *  - openhim-mediator-utils: vi.mock() to intercept registerMediator and activateHeartbeat
 *    so no real HTTP calls to OpenHIM are made.
 *  - pino Logger: createMockLogger() from tests/helpers.
 *
 * Framework: Vitest (globals: true)
 *
 * Covers:
 *  - Successful registration + heartbeat → resolves with numeric interval ID
 *  - Registration error → resolves with null (non-fatal, service continues)
 *  - Registration success but heartbeat throws → resolves with null, warns logger
 *  - OpenhimConfig built from env (apiURL, username, password, trustSelfSigned, urn)
 *  - MediatorManifest built from env (host, port, urn, name)
 *  - OPENHIM_REJECT_UNAUTHORIZED=true → trustSelfSigned=false
 *  - OPENHIM_REJECT_UNAUTHORIZED=false → trustSelfSigned=true
 *  - Logger receives info log on successful registration
 *  - Logger receives warn log on registration failure
 *  - Logger receives warn log on heartbeat failure
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the external library BEFORE importing the module under test
vi.mock("openhim-mediator-utils", () => ({
  registerMediator: vi.fn(),
  activateHeartbeat: vi.fn(),
}));

import { registerWithOpenHIM } from "../../../src/modules/registration/mediator-registration";
import { registerMediator, activateHeartbeat } from "openhim-mediator-utils";
import { makeEnv, createMockLogger } from "../../helpers";

// ---------------------------------------------------------------------------
// Typed mocks
// ---------------------------------------------------------------------------

const mockRegisterMediator = vi.mocked(registerMediator);
const mockActivateHeartbeat = vi.mocked(activateHeartbeat);

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Successful registration + heartbeat
// ---------------------------------------------------------------------------

describe("registerWithOpenHIM() — success paths", () => {
  it("should resolve with a numeric interval ID when registration and heartbeat both succeed", async () => {
    const FAKE_INTERVAL_ID = 42;
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(FAKE_INTERVAL_ID);

    const result = await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    expect(result).toBe(FAKE_INTERVAL_ID);
  });

  it("should log an info message before calling registerMediator", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(99);
    const logger = createMockLogger();

    await registerWithOpenHIM(
      makeEnv({ OPENHIM_API_ENDPOINT: "https://openhim-host:8080" }),
      logger as any,
    );

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ apiURL: "https://openhim-host:8080" }),
      expect.stringContaining("Registering mediator"),
    );
  });

  it("should log success info after a successful registration", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);
    const logger = createMockLogger();

    await registerWithOpenHIM(makeEnv(), logger as any);

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ urn: "urn:mediator:smile-rule-router" }),
      "Mediator registered successfully with OpenHIM",
    );
  });

  it("should log heartbeat activation info after success", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);
    const logger = createMockLogger();

    await registerWithOpenHIM(makeEnv(), logger as any);

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ urn: "urn:mediator:smile-rule-router" }),
      "Mediator heartbeat activated",
    );
  });
});

// ---------------------------------------------------------------------------
// Registration failure (non-fatal)
// ---------------------------------------------------------------------------

describe("registerWithOpenHIM() — registration failure", () => {
  it("should resolve with null when registerMediator calls back with an error", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) =>
      cb(new Error("Connection refused")),
    );

    const result = await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    expect(result).toBeNull();
  });

  it("should log a warning (not an error) so the service continues startup", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) =>
      cb(new Error("Timeout")),
    );
    const logger = createMockLogger();

    await registerWithOpenHIM(makeEnv(), logger as any);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Timeout" }),
      expect.stringContaining("registration failed"),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should NOT call activateHeartbeat when registration fails", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) =>
      cb(new Error("fail")),
    );

    await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    expect(mockActivateHeartbeat).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Heartbeat failure (non-fatal)
// ---------------------------------------------------------------------------

describe("registerWithOpenHIM() — heartbeat failure", () => {
  it("should resolve with null when activateHeartbeat throws", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockImplementation(() => {
      throw new Error("Heartbeat setup failed");
    });

    const result = await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    expect(result).toBeNull();
  });

  it("should log a warning about the heartbeat failure", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockImplementation(() => {
      throw new Error("Socket error");
    });
    const logger = createMockLogger();

    await registerWithOpenHIM(makeEnv(), logger as any);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Socket error" }),
      expect.stringContaining("heartbeat"),
    );
  });

  it("should handle non-Error heartbeat throws (string thrown)", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw "raw string error";
    });
    const logger = createMockLogger();

    const result = await registerWithOpenHIM(makeEnv(), logger as any);

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: "raw string error" }),
      expect.stringContaining("heartbeat"),
    );
  });
});

// ---------------------------------------------------------------------------
// OpenHIM config construction from env
// ---------------------------------------------------------------------------

describe("registerWithOpenHIM() — OpenHIM config built from env", () => {
  it("should pass apiURL from OPENHIM_API_ENDPOINT to registerMediator", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(
      makeEnv({ OPENHIM_API_ENDPOINT: "https://custom-openhim:9080" }),
      createMockLogger() as any,
    );

    expect(mockRegisterMediator).toHaveBeenCalledWith(
      expect.objectContaining({ apiURL: "https://custom-openhim:9080" }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("should set trustSelfSigned=false when OPENHIM_REJECT_UNAUTHORIZED=true", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(makeEnv({ OPENHIM_REJECT_UNAUTHORIZED: true }), createMockLogger() as any);

    expect(mockRegisterMediator).toHaveBeenCalledWith(
      expect.objectContaining({ trustSelfSigned: false }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("should set trustSelfSigned=true when OPENHIM_REJECT_UNAUTHORIZED=false", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(makeEnv({ OPENHIM_REJECT_UNAUTHORIZED: false }), createMockLogger() as any);

    expect(mockRegisterMediator).toHaveBeenCalledWith(
      expect.objectContaining({ trustSelfSigned: true }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("should include the mediator URN in both the config and the manifest", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    expect(mockRegisterMediator).toHaveBeenCalledWith(
      expect.objectContaining({ urn: "urn:mediator:smile-rule-router" }),
      expect.objectContaining({ urn: "urn:mediator:smile-rule-router" }),
      expect.any(Function),
    );
  });
});

// ---------------------------------------------------------------------------
// Mediator manifest construction from env
// ---------------------------------------------------------------------------

describe("registerWithOpenHIM() — mediator manifest built from env", () => {
  it("should include SERVICE_HOST and PORT in the endpoints array", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(
      makeEnv({ SERVICE_HOST: "mediator.internal", PORT: 8888 }),
      createMockLogger() as any,
    );

    const manifest = mockRegisterMediator.mock.calls[0][1];
    expect(manifest.endpoints).toHaveLength(1);
    expect(manifest.endpoints[0]).toMatchObject({
      host: "mediator.internal",
      port: 8888,
      path: "/route",
      type: "http",
    });
  });

  it("should set the manifest name to 'SMILE Rule Router'", async () => {
    mockRegisterMediator.mockImplementation((_config, _manifest, cb) => cb());
    mockActivateHeartbeat.mockReturnValue(1);

    await registerWithOpenHIM(makeEnv(), createMockLogger() as any);

    const manifest = mockRegisterMediator.mock.calls[0][1];
    expect(manifest.name).toBe("SMILE Rule Router");
  });
});
