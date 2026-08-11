// Success responses are returned by handlers directly as {status:"success", data}.
// Errors are thrown as Encore's native `APIError` (see encore.dev/api) — this
// middleware maps the error's `ErrCode` onto apps/wms-service's old
// {status:"fail"/"error", data} shape and matching HTTP status, so client apps
// see zero payload difference despite the error mechanism now being Encore's own.
//
// Encore's ErrCode doesn't have a 422; wms-service's `isValidationError` flag
// does, so it's carried via InvalidArgument specifically (not shared with the
// generic 400 case, which uses FailedPrecondition):
//
//   thrown as                        | HTTP | old envelope
//   ---------------------------------|------|---------------------------------
//   APIError(ErrCode.FailedPrecondition) | 400  | {status:"fail",data:message}   — plain res.fail(msg), no flag
//   APIError(ErrCode.InvalidArgument)    | 422  | {status:"fail",data:message}   — res.fail(msg,{isValidationError})
//   APIError(ErrCode.NotFound)           | 404  | {status:"fail",data:message}   — res.fail(msg,{isNotFoundError})
//   APIError(ErrCode.Unauthenticated)    | 401  | {status:"fail",data:message}   — res.fail(msg,{isUnauthorizedError})
//   APIError(ErrCode.PermissionDenied)   | 403  | {status:"fail",data:message}   — res.fail(msg,{isForbiddenError})
//   APIError(ErrCode.ResourceExhausted)  | 429  | {status:"fail",data:message}   — res.fail(msg,{isRateLimitError})
//   anything else (Internal, etc.)       | 500  | {status:"error",message,data}  — res.error(...)

import { middleware, HandlerResponse, APIError, ErrCode } from "encore.dev/api";

const CODE_TO_STATUS: Partial<Record<ErrCode, number>> = {
  [ErrCode.FailedPrecondition]: 400,
  [ErrCode.InvalidArgument]: 422,
  [ErrCode.NotFound]: 404,
  [ErrCode.Unauthenticated]: 401,
  [ErrCode.PermissionDenied]: 403,
  [ErrCode.ResourceExhausted]: 429,
};

function toFailEnvelope(err: unknown): { status: number; body: unknown } {
  if (err instanceof APIError) {
    const status = CODE_TO_STATUS[err.code];
    if (status) return { status, body: { status: "fail", data: err.message } };
    return { status: 500, body: { status: "error", message: err.message, data: err.details ?? null } };
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  return { status: 500, body: { status: "error", message, data: err } };
}

// Registered via encore.service.ts's `middlewares: [errorEnvelope]` — an
// authHandler()/errors-module export alone does nothing until it's listed there.
export const errorEnvelope = middleware(async (req, next) => {
  try {
    return await next(req);
  } catch (err) {
    const { status, body } = toFailEnvelope(err);
    const resp = new HandlerResponse(body);
    resp.status = status;
    return resp; // returning (not rethrowing) is what lets us set an arbitrary status/body
  }
});
