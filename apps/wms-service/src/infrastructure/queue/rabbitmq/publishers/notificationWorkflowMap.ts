// Maps NOTIFICATION_EVENT_TYPE.*.type (dotted/underscored) values from
// ../../../../../shared/types/notificationHelper.ts to the dash-slug Novu
// workflowId used in @smile-health/lib/novu/workflows.json.
export const WMS_NOTIFICATION_WORKFLOW_MAP: Record<string, string> = {
  "partnership.partnership_expired_exceed": "partnership-expired-exceed",
  "partnership.partnership_expired": "partnership-expired",
  "partnership.partnership_created": "partnership-created",
  "partnership.partnership_updated": "partnership-updated",
  "partnership.partnership_compliance_alert": "partnership-compliance-alert",

  "waste_bag.waste_bag_residue_created": "waste-bag-residue-created",
  "waste_bag.waste_bag_domestic_created": "waste-bag-domestic-created",
  "waste_bag.waste_bag_in_external_temporary_storage":
    "waste-bag-in-external-temporary-storage",
  "waste_bag.waste_bag_in_temporary_storage": "waste-bag-in-temporary-storage",
  "waste_bag.waste_bag_out_temporary_storage":
    "waste-bag-out-temporary-storage",
  "waste_bag.waste_bag_temporary_storage_expired":
    "waste-bag-temporary-storage-expired",
  "waste_bag.waste_bag_in_cold_storage": "waste-bag-in-cold-storage",
  "waste_bag.waste_bag_out_cold_storage": "waste-bag-out-cold-storage",
  "waste_bag.waste_bag_cold_storage_expired":
    "waste-bag-cold-storage-expired",

  "waste_bag_group.waste_bag_group_in_temporary_storage":
    "waste-bag-group-in-temporary-storage",
  "waste_bag_group.waste_bag_group_out_temporary_storage":
    "waste-bag-group-out-temporary-storage",
  "waste_bag_group.waste_bag_group_temporary_storage_expired":
    "waste-bag-group-temporary-storage-expired",
  "waste_bag_group.waste_bag_group_in_cold_storage":
    "waste-bag-group-in-cold-storage",
  "waste_bag_group.waste_bag_group_out_cold_storage":
    "waste-bag-group-out-cold-storage",
  "waste_bag_group.waste_bag_group_cold_storage_expired":
    "waste-bag-group-cold-storage-expired",

  "waste_classification.deleted": "waste-classification-deleted",
  "waste_hierarchy.deleted": "waste-hierarchy-deleted",

  "waste_bag_treatment_group.waste_bag_treatment_group_internal_landfill_in_process":
    "waste-treatment-internal-landfill-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_internal_landfilled":
    "waste-treatment-internal-landfilled",
  "waste_bag_treatment_group.waste_bag_treatment_group_incinerate_in_process":
    "waste-treatment-incinerate-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_incinerated":
    "waste-treatment-incinerated",
  "waste_bag_treatment_group.waste_bag_treatment_group_sterilise_in_process":
    "waste-treatment-sterilise-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_sterilised":
    "waste-treatment-sterilised",
  "waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled_in_process":
    "waste-treatment-external-landfill-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled":
    "waste-treatment-external-landfilled",
  "waste_bag_treatment_group.waste_bag_treatment_group_recycled_in_process":
    "waste-treatment-recycled-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_recycled":
    "waste-treatment-recycled",
  "waste_bag_treatment_group.waste_bag_treatment_group_end_status":
    "waste-treatment-end-status",
  "waste_bag_treatment_group.waste_bag_treatment_group_disposed_in_process":
    "waste-treatment-disposed-in-process",
  "waste_bag_treatment_group.waste_bag_treatment_group_disposed":
    "waste-treatment-disposed",

  "waste_bag_group_transport.waste_bag_group_transport_follow_up":
    "waste-transport-follow-up",
  "waste_bag_group_transport.waste_bag_group_transport_handover":
    "waste-transport-handover",
  "waste_bag_group_transport.waste_bag_group_transport_pickup":
    "waste-transport-pickup",
  "waste_bag_group_transport.waste_bag_group_handover_to_treatment":
    "waste-transport-handover-to-treatment",
  "waste_bag_group_treatment.waste_bag_group_treatment_receivment":
    "waste-treatment-receivement",

  "manual_request.manual_request_created": "manual-request-created",
  "manual_request.manual_request_approved": "manual-request-approved",
  "manual_request.manual_request_rejected": "manual-request-rejected",

  "asset.asset_inactive": "wms-asset-inactive",
  "asset.asset_warranty_expired": "wms-asset-warranty-expired",
  "asset.asset_calibration_due": "wms-asset-calibration-due",

  "waste.waste_status_changed": "waste-status-changed",
  "waste.waste_accumulated_update": "waste-accumulated-update",

  "bast.create_request": "bast-number-requested",
};
