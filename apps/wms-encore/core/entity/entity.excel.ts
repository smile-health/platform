// Real xlsx export/template/import for entity — same approach as
// core/material/material.excel.ts (exceljs, generated-fresh template with
// reference sheets rather than loading a pre-built file). Columns/fields
// updated for entity (no province/regency/subdistrict/village/id_satu_sehat
// — see entity.schema.ts).
import ExcelJS from "exceljs";
import { db } from "../db";
import type { EntityRow } from "./entity.repository";
import type { EntityRequest } from "./entity.schema";

const EXPORT_COLUMNS: Array<{ key: string; header: string; width: number }> = [
  { key: "id", header: "ID", width: 10 },
  { key: "code", header: "Code", width: 20 },
  { key: "name", header: "Name", width: 40 },
  { key: "type", header: "Type", width: 20 },
  { key: "entity_tag", header: "Entity Tag", width: 20 },
  { key: "address", header: "Address", width: 40 },
  { key: "location", header: "Location", width: 20 },
  { key: "country", header: "Country", width: 15 },
  { key: "postal_code", header: "Postal Code", width: 15 },
  { key: "is_vendor", header: "Is Vendor", width: 12 },
  { key: "status", header: "Status", width: 12 },
];

const IMPORT_COLUMNS = {
  code: "Code",
  name: "Name",
  type: "Type ID",
  entity_tag_id: "Entity Tag ID",
  address: "Address",
  location_id: "Location ID",
  country: "Country",
  postal_code: "Postal Code",
  program_ids: "Program IDs",
} as const;

export async function exportEntities(entities: EntityRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Entity");
  sheet.columns = EXPORT_COLUMNS;

  if (entities.length === 0) {
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  const [types, tags, locations] = await Promise.all([
    db.selectFrom("entity_types").selectAll().execute(),
    db.selectFrom("entity_tags").selectAll().execute(),
    db.selectFrom("locations").selectAll().execute(),
  ]);

  for (const entity of entities) {
    const type = types.find((t) => t.id === entity.type);
    const tag = tags.find((t) => t.id === entity.entity_tag_id);
    const location = locations.find((l) => l.id === entity.location_id);

    sheet.addRow({
      id: entity.id,
      code: entity.code,
      name: entity.name,
      type: type?.name ?? "-",
      entity_tag: tag?.title ?? "-",
      address: entity.address ?? "-",
      location: location?.name ?? "-",
      country: entity.country ?? "-",
      postal_code: entity.postal_code ?? "-",
      is_vendor: entity.is_vendor ? "Yes" : "No",
      status: entity.status ? "Active" : "Inactive",
    });
  }

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

export async function generateTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Entity Import");
  sheet.columns = Object.values(IMPORT_COLUMNS).map((header) => ({ header, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  const [types, tags] = await Promise.all([
    db.selectFrom("entity_types").select(["id", "name"]).execute(),
    db.selectFrom("entity_tags").select(["id", "title"]).execute(),
  ]);

  const addReferenceSheet = (name: string, rows: Array<{ id: number; name: string | null }>) => {
    const refSheet = workbook.addWorksheet(name);
    refSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
    ];
    refSheet.getRow(1).font = { bold: true };
    refSheet.addRows(rows);
  };
  addReferenceSheet("Entity Types", types);
  addReferenceSheet(
    "Entity Tags",
    tags.map((t) => ({ id: t.id, name: t.title })),
  );

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

export async function parseImportFile(buffer: Buffer): Promise<EntityRequest[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as never);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1).values as unknown[];
  const colIndex = (header: string) => headerRow.findIndex((h) => h === header);

  const rows: EntityRequest[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (header: string) => row.getCell(colIndex(header)).value;

    const programIdsRaw = get(IMPORT_COLUMNS.program_ids);
    const programIds = programIdsRaw
      ? String(programIdsRaw)
          .split(/[\s,;|]+/)
          .filter(Boolean)
          .map(Number)
      : null;

    rows.push({
      code: String(get(IMPORT_COLUMNS.code) ?? ""),
      name: String(get(IMPORT_COLUMNS.name) ?? ""),
      type: Number(get(IMPORT_COLUMNS.type) ?? 0),
      entity_tag_id: Number(get(IMPORT_COLUMNS.entity_tag_id) ?? 0),
      address: String(get(IMPORT_COLUMNS.address) ?? ""),
      location_id: get(IMPORT_COLUMNS.location_id) ? Number(get(IMPORT_COLUMNS.location_id)) : null,
      country: get(IMPORT_COLUMNS.country) ? String(get(IMPORT_COLUMNS.country)) : null,
      postal_code: get(IMPORT_COLUMNS.postal_code) ? String(get(IMPORT_COLUMNS.postal_code)) : null,
      lat: null,
      lng: null,
      is_vendor: 0,
      integration_type: null,
      external_properties: null,
      status: 1,
      program_ids: programIds,
    });
  });

  return rows;
}
