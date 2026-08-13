// Stand-in for encore.dev/api's runtime pieces, used ONLY under plain vitest
// (see ../../vitest.config.ts's alias) — the real package can't be loaded
// outside Encore's own build/runtime context ("__vite_ssr_exportName__ is not
// defined"). Not a real Encore module; never used by `encore run`/`encore test`,
// only by `npx vitest run` for fast, DB-free unit tests of *.service.ts files.
// Values must match encore.dev/api's real ErrCode string values exactly, since
// service.ts code and its tests both compare `err.code === ErrCode.X`.

export enum ErrCode {
  OK = "ok",
  Canceled = "canceled",
  Unknown = "unknown",
  InvalidArgument = "invalid_argument",
  DeadlineExceeded = "deadline_exceeded",
  NotFound = "not_found",
  AlreadyExists = "already_exists",
  PermissionDenied = "permission_denied",
  ResourceExhausted = "resource_exhausted",
  FailedPrecondition = "failed_precondition",
  Aborted = "aborted",
  OutOfRange = "out_of_range",
  Unimplemented = "unimplemented",
  Internal = "internal",
  Unavailable = "unavailable",
  DataLoss = "data_loss",
  Unauthenticated = "unauthenticated",
}

export type ErrDetails = Record<string, unknown>;

export class APIError extends Error {
  readonly code: ErrCode;
  readonly details?: ErrDetails;

  constructor(code: ErrCode, msg: string, cause?: Error, details?: ErrDetails) {
    super(msg, cause ? { cause } : undefined);
    this.code = code;
    this.details = details;
  }

  withDetails(details: ErrDetails): APIError {
    return new APIError(this.code, this.message, undefined, details);
  }

  static canceled(msg: string, cause?: Error) { return new APIError(ErrCode.Canceled, msg, cause); }
  static unknown(msg: string, cause?: Error) { return new APIError(ErrCode.Unknown, msg, cause); }
  static invalidArgument(msg: string, cause?: Error) { return new APIError(ErrCode.InvalidArgument, msg, cause); }
  static deadlineExceeded(msg: string, cause?: Error) { return new APIError(ErrCode.DeadlineExceeded, msg, cause); }
  static notFound(msg: string, cause?: Error) { return new APIError(ErrCode.NotFound, msg, cause); }
  static alreadyExists(msg: string, cause?: Error) { return new APIError(ErrCode.AlreadyExists, msg, cause); }
  static permissionDenied(msg: string, cause?: Error) { return new APIError(ErrCode.PermissionDenied, msg, cause); }
  static resourceExhausted(msg: string, cause?: Error) { return new APIError(ErrCode.ResourceExhausted, msg, cause); }
  static failedPrecondition(msg: string, cause?: Error) { return new APIError(ErrCode.FailedPrecondition, msg, cause); }
  static aborted(msg: string, cause?: Error) { return new APIError(ErrCode.Aborted, msg, cause); }
  static outOfRange(msg: string, cause?: Error) { return new APIError(ErrCode.OutOfRange, msg, cause); }
  static unimplemented(msg: string, cause?: Error) { return new APIError(ErrCode.Unimplemented, msg, cause); }
  static internal(msg: string, cause?: Error) { return new APIError(ErrCode.Internal, msg, cause); }
  static unavailable(msg: string, cause?: Error) { return new APIError(ErrCode.Unavailable, msg, cause); }
  static dataLoss(msg: string, cause?: Error) { return new APIError(ErrCode.DataLoss, msg, cause); }
  static unauthenticated(msg: string, cause?: Error) { return new APIError(ErrCode.Unauthenticated, msg, cause); }
}

// api()/Header<>/etc aren't needed by service.ts tests (only controller.ts
// imports them, and controllers aren't unit-tested — they're covered by the
// live encore run verification pass instead). Add stubs here if that changes.
