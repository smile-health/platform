import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const workspaces = [
    {
      id: 1,
      key: "waste_management",
      name: "Waste Management",
      app_type: "waste_management",
      config: {
        is_annual_planning: true,
        is_immunization: true,
        material: {
          is_hierarchy_enabled: true,
          is_batch_enabled: false,
        },
        color: "#004990",
      },
    },
    {
      id: 2,
      key: "immunization_beneficiaries",
      name: "IMMUNIZATION",
      app_type: "logistic",
      config: {
        color: "#680771",
        material: {
          is_batch_enabled: false,
          is_hierarchy_enabled: true,
        },
        transaction: {
          is_transfer_stock_restricted: false,
        },
      },
    },
    {
      id: 3,
      key: "malaria",
      name: "MALARIA",
      app_type: "logistic",
      config: {
        material: {
          is_hierarchy_enabled: true,
          is_batch_enabled: false,
        },
        transaction: {
          is_transfer_stock_restricted: false,
        },
        color: "#dc2626",
      },
    },
    {
      id: 4,
      key: "tb",
      name: "TB",
      app_type: "logistic",
      config: {
        color: "#6b21a8",
        order: {
          is_create_restricted: false,
          is_confirm_restricted: true,
        },
        clients: ["sitb", "din"],
        icon_url:
          "https://smile-platform.badr.co.id/images/icon-programs/SMILE_TUBERKOLOSIS.png",
        material: {
          is_batch_enabled: false,
          is_hierarchy_enabled: true,
        },
        transaction: {
          is_transfer_stock_restricted: false,
        },
      },
    },
    {
      id: 5,
      key: "hiv",
      name: "HIV",
      app_type: "logistic",
      config: {
        material: {
          is_hierarchy_enabled: true,
          is_batch_enabled: false,
        },
        order: {
          is_create_restricted: false,
          is_confirm_restricted: true,
        },
        transaction: {
          is_transfer_stock_restricted: false,
        },
        clients: ["sitb", "din"],
        color: "#681d17",
        icon_url:
          "https://smile-platform.badr.co.id/images/icon-programs/SMILE_HIV.png",
      },
    },
    {
      id: 6,
      key: "logistic",
      name: "ESSENTIAL MEDICHINES",
      app_type: "logistic",
      config: {
        color: "#680771",
        material: {
          is_batch_enabled: false,
          is_hierarchy_enabled: true,
        },
        transaction: {
          is_transfer_stock_restricted: false,
        },
      },
    },
  ].map((workspace) => ({
    ...workspace,
    config: JSON.stringify(workspace.config),
  }))

  await db
    .insertInto("workspaces")
    .values(workspaces)
    .onDuplicateKeyUpdate({
      config: sql<string>`VALUES (config)`,
      updated_at: new Date(),
    })
    .execute()
}
