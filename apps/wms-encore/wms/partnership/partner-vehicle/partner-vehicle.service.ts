import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./partner-vehicle.repository";
import {
  createPartnerVehicleBodySchema,
  createMultipleHealthcarePartnerVehicleBodySchema,
  updatePartnerVehicleBodySchema,
} from "./partner-vehicle.schema";
import type {
  CreateMultipleHealthcarePartnerVehicleInput,
  CreatePartnerVehicleInput,
  DeletePartnerVehicleInput,
  GetAllPartnerVehiclesInput,
  GetPartnerVehicleExportExcelInput,
  PaginatedPartnerVehicles,
  PartnerVehicle,
  UpdatePartnerVehicleInput,
} from "./partner-vehicle.types";

// partnerVehicleController.ts's res.fail(...)/res.error(...) calls, audited call-by-call:
//   - createPartnerVehicle / createMultipleHealthcarePartnerVehicle / updatePartnerVehicle
//     / deletePartnerVehicle / getPartnerVehicleExportExcel: the try/catch's `catch` block
//     always calls res.error(...) for anything thrown out of the use-case (no isXError flag
//     anywhere in those bodies) -> 500 (ErrCode.Internal). validateRequest's own zod failure
//     is the one path that maps to isValidationError:true -> 422 (ErrCode.InvalidArgument).
//   - getPartnerVehicleById / getAllPartnerVehicles: the `!authHeader` check passes
//     isValidationError:true -> 422; every other res.fail(...) in these two omits the
//     options object -> plain 400 (ErrCode.FailedPrecondition). Encore's auth:true + Gateway
//     already rejects unauthenticated requests before the handler runs, so the manual
//     "missing-token" 422 branch is unreachable in this port and dropped (same call as
//     entity-location's precedent).

const ALLOWED_HOSPITAL_ENTITY_TYPES = ["healthcare_facility", "regency", "province", "central"];

function resolveVehicleType(value: string): PartnerVehicle["vehicleType"] {
  return value as PartnerVehicle["vehicleType"];
}

export async function createPartnerVehicle(
  input: CreatePartnerVehicleInput,
): Promise<PartnerVehicle> {
  const parsed = createPartnerVehicleBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(createPartnerVehicleSchema) -> res.fail(errors, { isValidationError: true }) -> 422
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  try {
    return await repo.create({
      createdBy: input.createdBy,
      entityId: parsed.data.entityId,
      vehicleType: resolveVehicleType(parsed.data.vehicleType),
      vehicleNumber: parsed.data.vehicleNumber,
      capacityInKgs: parsed.data.capacityInKgs,
      transporterId: input.transporterId,
    });
  } catch (error) {
    // CreatePartnerVehicleRepositoryImpl wraps a UniqueConstraintError (duplicate
    // vehicleNumber) into a plain Error, which the use-case rethrows as a plain Error too
    // -> controller's catch -> res.error(...) -> 500. Preserved as Internal, not a 4xx,
    // even though a duplicate vehicle number reads like a validation problem.
    throw new APIError(ErrCode.Internal, error instanceof Error ? error.message : String(error));
  }
}

export async function createMultipleHealthcarePartnerVehicle(
  input: CreateMultipleHealthcarePartnerVehicleInput,
): Promise<PartnerVehicle> {
  const parsed = createMultipleHealthcarePartnerVehicleBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const entityIds = parsed.data.entityIds
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));

  if (!entityIds.length) {
    // CreateMultipleHealthcarePartnerVehicleUseCase throws a plain Error('Invalid entityIds
    // format') inside its try/catch, rethrown as a plain Error -> controller -> res.error(...) -> 500.
    throw new APIError(ErrCode.Internal, "Invalid entityIds format");
  }

  try {
    await repo.createMany(
      entityIds.map((entityId) => ({
        createdBy: input.createdBy,
        entityId,
        vehicleType: resolveVehicleType(parsed.data.vehicleType),
        vehicleNumber: parsed.data.vehicleNumber,
        capacityInKgs: parsed.data.capacityInKgs,
        transporterId: input.transporterId,
      })),
    );
  } catch (error) {
    throw new APIError(ErrCode.Internal, error instanceof Error ? error.message : String(error));
  }

  // The original use-case returns the in-memory PartnerVehicle it built for the
  // *request* (not any one persisted row) after `delete (assetModel as any).entityId`
  // — i.e. the response omits entityId entirely despite the type saying it's required.
  // Reproduced as a plain object literal below rather than the PartnerVehicle interface,
  // to preserve that exact (missing-entityId) response shape.
  const response = {
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    vehicleType: resolveVehicleType(parsed.data.vehicleType),
    vehicleNumber: parsed.data.vehicleNumber,
    capacityInKgs: parsed.data.capacityInKgs,
    transporterId: input.transporterId,
  } as unknown as PartnerVehicle;
  return response;
}

export async function getPartnerVehicleById(id: string): Promise<PartnerVehicle> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  // Original also enriches the result with `entityName` via a cross-service lookup
  // (getEntityDetail against apps/core). Ported as a local join against this DB's
  // `entities` table inside repo.findById — see partner-vehicle.repository.ts.
  const vehicle = await repo.findById(Number(id));
  if (!vehicle) {
    // res.fail('Waste source not found') — no flag (copy-pasted message from the
    // waste-source module in the original controller; preserved verbatim)
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return vehicle;
}

export async function getAllPartnerVehicles(
  input: GetAllPartnerVehiclesInput,
): Promise<PaginatedPartnerVehicles> {
  // controller: `if (!transporterId) res.fail('Unauthorized: Missing entity ID', {
  // isValidationError: true })` -> 422
  if (!input.transporterId) {
    throw new APIError(ErrCode.InvalidArgument, "Unauthorized: Missing entity ID");
  }

  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Math.min(Number(input.limit), 1000)
    : 10;
  const page = Number.isInteger(Number(input.page)) && Number(input.page) > 0
    ? Number(input.page)
    : 1;

  // controller: entityTag is overridden to 'hospital' for these entity types, then the
  // repository routes the filter by entity_id (hospital-tagged) vs transporter_id.
  let entityTag = input.entityTag;
  if (entityTag && ALLOWED_HOSPITAL_ENTITY_TYPES.includes(entityTag)) {
    entityTag = "hospital";
  }

  const isHospitalTag = Boolean(entityTag && entityTag.toLowerCase().includes("hospital"));

  return repo.findPaginated({
    limit,
    page,
    search: input.search,
    entityIdFilter: entityTag && isHospitalTag ? input.transporterId : undefined,
    transporterIdFilter: entityTag && !isHospitalTag ? input.transporterId : undefined,
    healthcareFacilityId: input.healthcareFacilityId,
    providerId: input.providerId,
  });
}

export async function updatePartnerVehicle(
  input: UpdatePartnerVehicleInput,
): Promise<PartnerVehicle> {
  if (!input.id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = updatePartnerVehicleBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(updatePartnerVehicleSchema) -> isValidationError:true -> 422
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const numericId = Number(input.id);
  const existing = await repo.findById(numericId);
  if (!existing) {
    // UpdatePartnerVehicleUseCase returns null -> controller: `if (data === null)
    // res.fail('Waste source not found')` — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }

  try {
    const updated = await repo.update(numericId, {
      updatedBy: input.updatedBy,
      entityId: parsed.data.entityId,
      vehicleType: resolveVehicleType(parsed.data.vehicleType),
      vehicleNumber: parsed.data.vehicleNumber,
      capacityInKgs: parsed.data.capacityInKgs,
    });
    if (!updated) {
      throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
    }
    return updated;
  } catch (error) {
    if (error instanceof APIError) throw error;
    // UpdatePartnerVehicleRepositoryImpl wraps a UniqueConstraintError the same way
    // createPartnerVehicle does -> plain Error -> controller -> res.error(...) -> 500.
    throw new APIError(ErrCode.Internal, error instanceof Error ? error.message : String(error));
  }
}

export async function deletePartnerVehicle(input: DeletePartnerVehicleInput): Promise<boolean> {
  if (!input.id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const numericId = Number(input.id);
  const existing = await repo.findById(numericId);
  if (!existing) {
    // DeletePartnerVehicleUseCase returns null (repo's checkExistingData miss) ->
    // controller: `if (!data) res.fail('Partner Vehicle with ID ${id} not deleted')` — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, `Partner Vehicle with ID ${input.id} not deleted`);
  }

  // Original also refuses to delete if any WasteTransportationExternalGroupModel row
  // references this vehicle (transporterVehicleId) — ported as a read-only query
  // against the waste/ domain's waste_transportation_external_group table. See
  // partner-vehicle.repository.ts's findExternalGroupUsage.
  const inUse = await repo.findExternalGroupUsage(numericId);
  if (inUse) {
    throw new APIError(ErrCode.FailedPrecondition, `Partner Vehicle with ID ${input.id} not deleted`);
  }

  const deleted = await repo.softDelete(numericId, input.deletedBy);
  if (!deleted) {
    throw new APIError(ErrCode.FailedPrecondition, `Partner Vehicle with ID ${input.id} not deleted`);
  }
  return true;
}

export async function getPartnerVehicleExportExcel(
  input: GetPartnerVehicleExportExcelInput,
): Promise<{ filename: string; contentType: string; base64: string }> {
  // controller: `if (!transporterId) res.fail('Unauthorized: Missing entity ID',
  // { isValidationError: true })` -> 422
  if (!input.transporterId) {
    throw new APIError(ErrCode.InvalidArgument, "Unauthorized: Missing entity ID");
  }

  let entityTag = input.entityTag;
  if (entityTag && ALLOWED_HOSPITAL_ENTITY_TYPES.includes(entityTag)) {
    entityTag = "hospital";
  }
  const isHospitalTag = Boolean(entityTag && entityTag.toLowerCase().includes("hospital"));

  const result = await repo.findPaginated({
    limit: 100000,
    page: 1,
    search: input.search,
    entityIdFilter: entityTag && isHospitalTag ? input.transporterId : undefined,
    transporterIdFilter: entityTag && !isHospitalTag ? input.transporterId : undefined,
    healthcareFacilityId: input.healthcareFacilityId,
  });

  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Partner Vehicles");

  worksheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Fasyankes", key: "entityName", width: 30 },
    { header: "Tipe Kendaraan", key: "vehicleType", width: 20 },
    { header: "No Plat Kendaraan", key: "vehicleNumber", width: 20 },
    { header: "Kapasitas (Kg)", key: "capacityInKgs", width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  result.data.forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      entityName: item.entityName,
      vehicleType: getVehicleTypeLabel(item.vehicleType, input.lang),
      vehicleNumber: item.vehicleNumber,
      capacityInKgs: item.capacityInKgs,
    });
    row.getCell("no").alignment = { vertical: "middle", horizontal: "center" };
    row.getCell("entityName").alignment = { vertical: "middle", horizontal: "left" };
    row.getCell("vehicleType").alignment = { vertical: "middle", horizontal: "center" };
    row.getCell("vehicleNumber").alignment = { vertical: "middle", horizontal: "center" };
    row.getCell("capacityInKgs").alignment = { vertical: "middle", horizontal: "right" };
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  const now = new Date();
  const formattedDate = now.toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
  const filename = `vehicle_${formattedDate}.xlsx`;

  return {
    filename,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    base64: buffer.toString("base64"),
  };
}

const VEHICLE_TYPE_LABEL: Record<string, Record<string, string>> = {
  en: {
    BOX_TRUCK: "Box Truck",
    REFRIGERATED_BOX_TRUCK: "Refrigerated Box Truck",
    OPEN_BODY_TRUCK: "Open Body Truck",
    TANKER: "Tanker",
    HAZARDOUS_MATERIAL_TRUCK: "Hazardous Material Truck",
    RADIOACTIVE_MATERIAL_TRUCK: "Radioactive Material Truck",
    FLATBED_TRUCK: "Flatbed Truck",
    LOADER_TRUCK: "Loader Truck",
    TRAILER: "Trailer",
    VAN: "Van",
  },
  id: {
    BOX_TRUCK: "Truk Boks",
    REFRIGERATED_BOX_TRUCK: "Truk Pendingin",
    OPEN_BODY_TRUCK: "Truk Bak Terbuka",
    TANKER: "Truk Tangki",
    HAZARDOUS_MATERIAL_TRUCK: "Truk Bahan Baku Berbahaya",
    RADIOACTIVE_MATERIAL_TRUCK: "Truk Bahan Radioaktif",
    FLATBED_TRUCK: "Truk Bak Datar",
    LOADER_TRUCK: "Truk Pengangkut",
    TRAILER: "Trailer",
    VAN: "Van",
  },
};

function getVehicleTypeLabel(vehicleType: string, lang: string): string {
  return VEHICLE_TYPE_LABEL[lang]?.[vehicleType] ?? vehicleType;
}
