// Real xlsx export/template/import — ported in spirit from
// apps/core/src/modules/material/material.excel.ts + material.module.ts's
// export()/template()/import() methods, using exceljs (already a wms-encore
// dependency) instead of the original's xlsx-populate/sheetjs abstraction
// (packages/lib/excel's BaseTemplate). NOT ported: loading a pre-built
// legacy .xlsx template file from public/templates/material/*.xlsx (those
// files aren't available here) — the template is generated fresh instead,
// with the same "reference sheets" concept (material types/units/subtypes
// listed on separate sheets so Excel data-validation dropdowns can point at
// them), just built programmatically rather than loaded from a fixed file.
import ExcelJS from "exceljs";
import { db } from "../db";
import * as materialRepo from "./material.repository";
import type { MaterialRow } from "./material.repository";
import type { MaterialRequest } from "./material.schema";

const EXPORT_COLUMNS: Array<{ key: string; header: string; width: number }> = [
  { key: "id", header: "ID", width: 10 },
  { key: "name", header: "Name", width: 40 },
  { key: "code", header: "Code", width: 20 },
  { key: "hierarchy_code", header: "Hierarchy Code", width: 20 },
  { key: "material_level", header: "Material Level", width: 20 },
  { key: "material_type", header: "Material Type", width: 20 },
  { key: "material_subtype", header: "Material Subtype", width: 20 },
  { key: "unit_of_consumption", header: "Unit of Consumption", width: 20 },
  { key: "unit_of_distribution", header: "Unit of Distribution", width: 20 },
  { key: "consumption_unit_per_distribution_unit", header: "Consumption per Distribution", width: 15 },
  { key: "is_temperature_sensitive", header: "Temperature Sensitive", width: 15 },
  { key: "min_temperature", header: "Min Temperature", width: 15 },
  { key: "max_temperature", header: "Max Temperature", width: 15 },
  { key: "is_managed_in_batch", header: "Managed in Batch", width: 15 },
  { key: "min_retail_price", header: "Min Retail Price", width: 15 },
  { key: "max_retail_price", header: "Max Retail Price", width: 15 },
  { key: "is_stock_opname_mandatory", header: "Stock Opname Mandatory", width: 15 },
  { key: "status", header: "Status", width: 12 },
  { key: "parent_material_id", header: "Parent Material ID", width: 15 },
];

// IMPORT_COLUMNS mirrors the original's EXCEL_COLUMNS mapping (material.
// middleware.ts's importSchema) minus i18n column-name translation — the
// original resolves column headers per-language via getTranslateMaterialColumnsExcel(c);
// this scaffold uses fixed English headers only.
const IMPORT_COLUMNS = {
  name: "Name",
  code: "Code",
  hierarchy_code: "Hierarchy Code",
  parent_codes: "Parent Codes",
  material_level_id: "Material Level ID",
  material_type_id: "Material Type ID",
  material_subtype_id: "Material Subtype ID",
  unit_of_consumption_id: "Unit of Consumption ID",
  unit_of_distribution_id: "Unit of Distribution ID",
  consumption_unit_per_distribution_unit: "Consumption per Distribution",
  is_temperature_sensitive: "Temperature Sensitive (0/1)",
  min_temperature: "Min Temperature",
  max_temperature: "Max Temperature",
  is_managed_in_batch: "Managed in Batch (0/1)",
  min_retail_price: "Min Retail Price",
  max_retail_price: "Max Retail Price",
  is_stock_opname_mandatory: "Stock Opname Mandatory (0/1)",
} as const;

export async function exportMaterials(materials: MaterialRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Material");
  sheet.columns = EXPORT_COLUMNS;

  if (materials.length === 0) {
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  const materialIds = materials.map((m) => m.id);
  const [levels, types, subtypes, units, parentRelationsByChild, programsByMaterial] = await Promise.all([
    db.selectFrom("material_levels").selectAll().execute(),
    db.selectFrom("material_types").selectAll().execute(),
    db.selectFrom("material_subtypes").selectAll().execute(),
    db.selectFrom("material_units").selectAll().execute(),
    db.selectFrom("material_relations").selectAll().where("child_material_id", "in", materialIds).execute(),
    materialRepo.getProgramsByMaterialIds(materialIds),
  ]);
  void programsByMaterial; // program names need a workspace lookup — left as a follow-up (see header note).

  for (const material of materials) {
    const level = levels.find((l) => l.id === material.material_level_id);
    const type = types.find((t) => t.id === material.material_type_id);
    const subtype = subtypes.find((s) => s.id === material.material_subtype_id);
    const consumptionUnit = units.find((u) => u.id === material.unit_of_consumption_id);
    const distributionUnit = units.find((u) => u.id === material.unit_of_distribution_id);
    const parentRelation = parentRelationsByChild.find((r) => r.child_material_id === material.id);

    sheet.addRow({
      id: material.id,
      name: material.name,
      code: material.code,
      hierarchy_code: material.hierarchy_code ?? "-",
      material_level: level?.name ?? "-",
      material_type: type?.name ?? "-",
      material_subtype: subtype?.name ?? "-",
      unit_of_consumption: consumptionUnit?.name ?? "-",
      unit_of_distribution: distributionUnit?.name ?? "-",
      consumption_unit_per_distribution_unit: material.consumption_unit_per_distribution_unit,
      is_temperature_sensitive: material.is_temperature_sensitive ? "Yes" : "No",
      min_temperature: material.min_temperature ?? "-",
      max_temperature: material.max_temperature ?? "-",
      is_managed_in_batch: material.is_managed_in_batch ? "Yes" : "No",
      min_retail_price: material.min_retail_price,
      max_retail_price: material.max_retail_price,
      is_stock_opname_mandatory: material.is_stock_opname_mandatory ? "Yes" : "No",
      status: material.status ? "Active" : "Inactive",
      parent_material_id: parentRelation?.parent_material_id ?? "-",
    });
  }

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

export async function generateTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Material Import");
  sheet.columns = Object.values(IMPORT_COLUMNS).map((header) => ({ header, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  // Reference sheets so a real spreadsheet app can wire up data-validation
  // dropdowns against these — same concept as the original's
  // populateMasterData() calls, just materialized as plain reference sheets.
  const [levels, types, subtypes, units] = await Promise.all([
    db.selectFrom("material_levels").select(["id", "name"]).execute(),
    db.selectFrom("material_types").select(["id", "name"]).execute(),
    db.selectFrom("material_subtypes").select(["id", "name"]).execute(),
    db.selectFrom("material_units").select(["id", "name"]).execute(),
  ]);

  const addReferenceSheet = (name: string, rows: Array<{ id: number; name: string }>) => {
    const refSheet = workbook.addWorksheet(name);
    refSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
    ];
    refSheet.getRow(1).font = { bold: true };
    refSheet.addRows(rows);
  };
  addReferenceSheet("Material Levels", levels);
  addReferenceSheet("Material Types", types);
  addReferenceSheet("Material Subtypes", subtypes);
  addReferenceSheet("Material Units", units);

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

export interface ImportRowResult {
  row: number;
  success: boolean;
  materialId?: number;
  errors?: string[];
}

// Ported from material.middleware.ts's importSchema transform +
// material.module.ts's import() (which just loops create() per row).
export async function parseImportFile(buffer: Buffer): Promise<MaterialRequest[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as never);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1).values as unknown[];
  const colIndex = (header: string) => headerRow.findIndex((h) => h === header);

  const rows: MaterialRequest[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const get = (header: string) => row.getCell(colIndex(header)).value;

    const hierarchyCode = get(IMPORT_COLUMNS.hierarchy_code);
    const parentCodesRaw = get(IMPORT_COLUMNS.parent_codes);
    const isHierarchy = !!(hierarchyCode || parentCodesRaw);

    rows.push({
      name: String(get(IMPORT_COLUMNS.name) ?? ""),
      code: String(get(IMPORT_COLUMNS.code) ?? ""),
      description: null,
      hierarchy_code: hierarchyCode ? String(hierarchyCode) : null,
      material_level_id: Number(get(IMPORT_COLUMNS.material_level_id) ?? 0),
      material_type_id: Number(get(IMPORT_COLUMNS.material_type_id) ?? 0),
      material_subtype_id: get(IMPORT_COLUMNS.material_subtype_id) ? Number(get(IMPORT_COLUMNS.material_subtype_id)) : null,
      unit_of_consumption_id: Number(get(IMPORT_COLUMNS.unit_of_consumption_id) ?? 0),
      unit_of_distribution_id: Number(get(IMPORT_COLUMNS.unit_of_distribution_id) ?? 0),
      consumption_unit_per_distribution_unit: Number(get(IMPORT_COLUMNS.consumption_unit_per_distribution_unit) ?? 0),
      is_temperature_sensitive: Number(get(IMPORT_COLUMNS.is_temperature_sensitive) ?? 0),
      min_temperature: get(IMPORT_COLUMNS.min_temperature) != null ? Number(get(IMPORT_COLUMNS.min_temperature)) : null,
      max_temperature: get(IMPORT_COLUMNS.max_temperature) != null ? Number(get(IMPORT_COLUMNS.max_temperature)) : null,
      is_managed_in_batch: Number(get(IMPORT_COLUMNS.is_managed_in_batch) ?? 0),
      min_retail_price: Number(get(IMPORT_COLUMNS.min_retail_price) ?? 0),
      max_retail_price: Number(get(IMPORT_COLUMNS.max_retail_price) ?? 0),
      is_stock_opname_mandatory: Number(get(IMPORT_COLUMNS.is_stock_opname_mandatory) ?? 0),
      is_hierarchy: Number(isHierarchy),
      material_parent_ids: null, // resolved from parent_codes -> ids in the controller (needs a DB lookup, done there with the full batch)
      program_ids: null,
    });
  });

  return rows;
}
