import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const IMMUNIZATION_PROGRAM_ID = 1
  const destinationCategory = [
    {
      id: 1,
      name: "important_location",
    },
    {
      id: 2,
      name: "at_risk_location",
    },
  ]

  const destinationType = [
    {
      id: 1,
      name: "mosque",
      category_id: 1,
    },
    {
      id: 2,
      name: "school",
      category_id: 1,
    },
    {
      id: 3,
      name: "market",
      category_id: 1,
    },
    {
      id: 4,
      name: "posyandu",
      category_id: 1,
    },
    {
      id: 5,
      name: "public_facility",
      category_id: 1,
    },
    {
      id: 6,
      name: "dense_population",
      category_id: 2,
    },
    {
      id: 7,
      name: "slum",
      category_id: 2,
    },
    {
      id: 8,
      name: "healthcare_supporter",
      category_id: 1,
    },
    {
      id: 9,
      name: "remote",
      category_id: 2,
    },
    {
      id: 10,
      name: "refusal",
      category_id: 2,
    },
    {
      id: 11,
      name: "new_settlement",
      category_id: 2,
    },
  ]

  const roadType = [
    {
      id: 1,
      name: "aspalt",
    },
    {
      id: 2,
      name: "soil",
    },
    {
      id: 3,
      name: "stoned",
    },
    {
      id: 4,
      name: "river",
    },
    {
      id: 5,
      name: "sea",
    },
  ]

  const entityTag = [
    { id: 1, name: "main_supplier" },
    { id: 2, name: "producer" },
    { id: 5, name: "provincial_health_office" },
    { id: 7, name: "city_district_health_office" },
    { id: 9, name: "community_health_center" },
    { id: 10, name: "in_building" },
    { id: 11, name: "hospital" },
    { id: 12, name: "clinic" },
    { id: 13, name: "community_health_post" },
    { id: 14, name: "school" },
    { id: 15, name: "independent_midwife" },
    { id: 17, name: "mass_vaccination" },
    { id: 18, name: "sub_community_health_center" },
    { id: 19, name: "central_vaccine_warehouse" },
    { id: 20, name: "central_pharmacy_installation" },
    { id: 23, name: "military" },
    { id: 24, name: "police" },
    { id: 25, name: "intelligence_agency" },
    { id: 26, name: "village_community_health_center" },
    { id: 27, name: "emergency_department" },
    { id: 28, name: "pharmacy_room" },
    { id: 29, name: "laboratory" },
    { id: 30, name: "village" },
    { id: 31, name: "village_malaria_officer" },
    { id: 32, name: "port_health_office" },
    { id: 33, name: "tb_clinic" },
    { id: 34, name: "hiv_clinic" },
    { id: 35, name: "independent_practice_doctor" },
    { id: 36, name: "transporter" },
    { id: 37, name: "treatment" },
    { id: 38, name: "landfill" },
    { id: 39, name: "recycle" },
    { id: 40, name: "government_waste_transporter" },
    { id: 41, name: "specialized_transporter" },
    { id: 42, name: "residential_areas" },
    { id: 43, name: "workplaces" },
    { id: 44, name: "recreational_areas" },
    { id: 45, name: "public_facilities" },
    { id: 46, name: "waste_processor" },
  ]

  const priorityAreaFormulas = {
    lo_raw: "[target_newborn_baby]-[achievement_bcg]",
    lo_rate: "round((([lo_raw]/[target_newborn_baby])*100)*10)/10",
    do_bayi_dpt13_raw: "[achievement_dpt1]-[achievement_dpt3]",
    do_bayi_dpt13_rate:
      "round(((100*[do_bayi_dpt13_raw]/[achievement_dpt1])*10))/10",
    do_bayi_dpt1cr1_raw: "[achievement_dpt1]-[achievement_mr1]",
    do_bayi_dpt1cr1_rate:
      "round(((100*[do_bayi_dpt1cr1_raw]/[achievement_dpt1])*10))/10",
    do_baduta_dpt34_raw: "[achievement_prev_dpt3]-[achievement_dpt4]",
    do_baduta_dpt34_rate:
      "round(((100*[do_baduta_dpt34_raw]/[achievement_prev_dpt3])*10))/10",
    do_baduta_cr12_raw: "[achievement_prev_mr1]-[achievement_mr2]",
    do_baduta_cr12_rate:
      "round((([do_baduta_cr12_raw]/[achievement_prev_mr1])*100)*10)/10",
    criteria_lo: 'ifElse((([lo_rate]<0)+([lo_rate]>5))>0,"BU","BA")',
    criteria_do:
      'ifElse((([do_bayi_dpt13_rate]<0)+([do_bayi_dpt1cr1_rate]<0)+([do_baduta_dpt34_rate]<0)+([do_baduta_cr12_rate]<0))>0,"BU",ifElse((([do_bayi_dpt13_rate]>5)+([do_bayi_dpt1cr1_rate]>5)+([do_baduta_dpt34_rate]>5)+([do_baduta_cr12_rate]>5))>0,"BU","BA"))',
    category:
      'ifElse(([criteria_lo]="BA")*([criteria_do]="BA"),1,ifElse(([criteria_lo]="BA")*([criteria_do]="BU"),2,ifElse(([criteria_lo]="BU")*([criteria_do]="BA"),3,ifElse(([criteria_lo]="BU")*([criteria_do]="BU"),4,0))))',
    risk: 'ifElse([category]=1,"LOW",ifElse([category]=4,"HIGH",ifElse(([category]=2)*([has_supporting_condition]=1),"HIGH",ifElse(([category]=2)*([has_supporting_condition]=0),"MEDIUM",ifElse(([category]=3)*([has_supporting_condition]=1),"HIGH",ifElse(([category]=3)*([has_supporting_condition]=0),"MEDIUM","-"))))))',
  }

  const priorityAreaThresholds = {
    do_threshold: 0.05,
    lo_threshold: 0.05,
  }

  const problemTypes = [
    {
      id: 1,
      name: "access_to_immunization_services",
    },
    {
      id: 2,
      name: "utilization_of_immunization_service_received",
    },
  ]

  const frequencies = [
    { id: 1, name: "daily" },
    { id: 2, name: "weekly" },
    { id: 3, name: "monthly" },
  ]

  const activityIds: number[] = [26,27]

  const startYear = 2026

  const problemCategories = [
    // Categories for problem_type_id 1 (Hambatan Akses)
    {
      id: 1,
      problem_type_id: 1,
      name: "access_difficulty",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 2,
      problem_type_id: 1,
      name: "schedule_mismatch",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 3,
      problem_type_id: 1,
      name: "lack_of_understanding_benefits",
      is_custom: 0,
      is_solution_required: 1,
    },
    // Categories for problem_type_id 2 (Hambatan Pelayanan)
    {
      id: 4,
      problem_type_id: 2,
      name: "vaccine_shortage",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 5,
      problem_type_id: 2,
      name: "no_schedule_notification",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 6,
      problem_type_id: 2,
      name: "lack_of_post_immunization_info",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 7,
      problem_type_id: 2,
      name: "no_complete_immunization_understanding",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 8,
      problem_type_id: 2,
      name: "communication_barriers",
      is_custom: 0,
      is_solution_required: 1,
    },
    {
      id: 9,
      problem_type_id: 2,
      name: "no_family_support",
      is_custom: 0,
      is_solution_required: 1,
    },
    // "No problem" category — solution is not required when this flag is set
    {
      id: 98,
      problem_type_id: null,
      name: "no_problem",
      is_custom: 0,
      is_solution_required: 0,
    },
    {
      id: 99,
      problem_type_id: null,
      name: "others",
      is_custom: 1,
      is_solution_required: 1,
    },
  ]

  const rows = [
    {
      id: 1,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "destination_category",
      config: JSON.stringify(destinationCategory),
    },
    {
      id: 2,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "destination_type",
      config: JSON.stringify(destinationType),
    },
    {
      id: 3,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "road_type",
      config: JSON.stringify(roadType),
    },
    {
      id: 4,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "entity_tag",
      config: JSON.stringify(entityTag),
    },
    {
      id: 5,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "priority_area_formulas",
      config: JSON.stringify(priorityAreaFormulas),
    },
    {
      id: 6,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "priority_area_thresholds",
      config: JSON.stringify(priorityAreaThresholds),
    },
    {
      id: 7,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "problem_types",
      config: JSON.stringify(problemTypes),
    },
    {
      id: 8,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "problem_categories",
      config: JSON.stringify(problemCategories),
    },
    {
      id: 9,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "frequencies",
      config: JSON.stringify(frequencies),
    },
    {
      id: 10,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "activity_ids",
      config: JSON.stringify(activityIds),
    },
    {
      id: 11,
      program_id: IMMUNIZATION_PROGRAM_ID,
      key: "start_year",
      config: String(startYear),
    },
  ]

  for (const row of rows) {
    await db
      .insertInto("ws_microplanning_config")
      .values(row)
      .onDuplicateKeyUpdate({
        config: row.config,
      })
      .execute()
  }
}
