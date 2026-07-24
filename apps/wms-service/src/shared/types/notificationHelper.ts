export const NOTIFICATION_EVENT_TYPE = {
    // add partnership has expired
    PARTNERSHIP_EXPIRED_EXCEED: {
        type: 'partnership.partnership_expired_exceed',
        title: 'Partnership Expired',
        message: (data: any) => {
            return `Partnerhsip contract has expired on ${data.expiry_date}`;
        },
    }, // ✅
    PARTNERSHIP_EXPIRED: {
        type: 'partnership.partnership_expired',
        title: 'Partnership Expiry Reminder',
        message: (data: any) => {
            const dayText =
                data.days_remaining === 1 ? 'tomorrow' : `in ${data.days_remaining} days`;
            return `Partnership contract ${data.contract_id} will expire ${dayText} on ${data.expiry_date}. Please review and renew if needed.`;
        },
    }, // ✅
    PARTNERSHIP_CREATED: {
        type: 'partnership.partnership_created',
        title: 'New Partnership Created',
        message: (data: any) =>
            `A new partnership contract has been created between ${data.healthcare_facility} and ${data.third_party}.`,
    }, // ✅
    PARTNERSHIP_UPDATED: {
        type: 'partnership.partnership_updated',
        title: 'Partnership Updated',
        message: (data: any) =>
            `Partnership contract ${data.contract_id} has been updated. Please check the latest details.`,
    }, // ✅
    PARTNERSHIP_COMPLIANCE_ALERT: {
        type: 'partnership.partnership_compliance_alert',
        title: 'Partnership Compliance Alert',
        message: (data: any) =>
            `Contract ${data.contract_id} has compliance issues that require review.`,
    },

    WASTE_BAG_RESIDUE_CREATED: {
        type: 'waste_bag.waste_bag_residue_created',
        title: 'Residue Waste Bag Created',
        message: (data: any) => `A new residue waste bag ${data.waste_bag_id} has been created.`,
    },
    WASTE_BAG_DOMESTIC_CREATED: {
        type: 'waste_bag.waste_bag_domestic_created',
        title: 'Domestic Waste Bag Created',
        message: (data: any) => `A new domestic waste bag ${data.waste_bag_id} has been created.`,
    },
    WASTE_BAG_IN_EXTERNAL_TEMPORARY_STORAGE: {
        type: 'waste_bag.waste_bag_in_external_temporary_storage',
        title: 'Waste Moved to External Temporary Storage',
        message: (data: any) =>
            `Waste group ${data.group_id} has been moved into external temporary storage.`,
    }, // ✅
    WASTE_BAG_IN_TEMPORARY_STORAGE: {
        type: 'waste_bag.waste_bag_in_temporary_storage',
        title: 'Waste Moved to Temporary Storage',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} has been moved into temporary storage.`,
    },
    WASTE_BAG_OUT_TEMPORARY_STORAGE: {
        type: 'waste_bag.waste_bag_out_temporary_storage',
        title: 'Waste Removed from Temporary Storage',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} has been removed from temporary storage.`,
    },
    WASTE_BAG_TEMPORARY_STORAGE_EXPIRED: {
        type: 'waste_bag.waste_bag_temporary_storage_expired',
        title: 'Temporary Storage Expired',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} has exceeded its maximum allowed duration in temporary storage.`,
    },
    WASTE_BAG_IN_COLD_STORAGE: {
        type: 'waste_bag.waste_bag_in_cold_storage',
        title: 'Waste Moved to Cold Storage',
        message: (data: any) => `Waste bag ${data.waste_bag_id} has been moved into cold storage.`,
    },
    WASTE_BAG_OUT_COLD_STORAGE: {
        type: 'waste_bag.waste_bag_out_cold_storage',
        title: 'Waste Removed from Cold Storage',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} has been removed from cold storage.`,
    },
    WASTE_BAG_COLD_STORAGE_EXPIRED: {
        type: 'waste_bag.waste_bag_cold_storage_expired',
        title: 'Cold Storage Expired',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} has exceeded its maximum allowed duration in cold storage.`,
    },

    WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE: {
        type: 'waste_bag_group.waste_bag_group_in_temporary_storage',
        title: 'Waste Group In Temporary Storage',
        message: (data: any) =>
            `Waste group ${data.group_id} has been placed in temporary storage.`,
    }, // ✅
    WASTE_BAG_GROUP_OUT_TEMPORARY_STORAGE: {
        type: 'waste_bag_group.waste_bag_group_out_temporary_storage',
        title: 'Waste Group Out of Temporary Storage',
        message: (data: any) =>
            `Waste group ${data.group_id} has been removed from temporary storage.`,
    },
    WASTE_BAG_GROUP_TEMPORARY_STORAGE_EXPIRED: {
        type: 'waste_bag_group.waste_bag_group_temporary_storage_expired',
        title: 'Waste Group Temporary Storage Expired',
        message: (data: any) =>
            `Waste group ${data.group_id} has exceeded its maximum allowed duration in temporary storage.`,
    },
    WASTE_BAG_GROUP_IN_COLD_STORAGE: {
        type: 'waste_bag_group.waste_bag_group_in_cold_storage',
        title: 'Waste Group In Cold Storage',
        message: (data: any) => `Waste group ${data.group_id} has been placed in cold storage.`,
    }, // ✅
    WASTE_BAG_GROUP_OUT_COLD_STORAGE: {
        type: 'waste_bag_group.waste_bag_group_out_cold_storage',
        title: 'Waste Group Out of Cold Storage',
        message: (data: any) => `Waste group ${data.group_id} has been removed from cold storage.`,
    },
    WASTE_BAG_GROUP_COLD_STORAGE_EXPIRED: {
        type: 'waste_bag_group.waste_bag_group_cold_storage_expired',
        title: 'Waste Group Cold Storage Expired',
        message: (data: any) =>
            `Waste group ${data.group_id} has exceeded its maximum allowed duration in cold storage.`,
    },

    DELETE_WASTE_CLASSIFICATION : {
        type: 'waste_classification.deleted',
        title: 'Waste Classification Inactivated',
        message: (data: any) =>
            `Waste classification id ${data.id} has been inactivated`,
    }, // ✅

    DELETE_WASTE_HIERARCHY : {
        type: 'waste_hierarchy.deleted',
        title: 'Waste Hierarchy Inactivated',
        message: (data: any) =>
            `Waste hierarchy id ${data.id} has been inactivated`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILL_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_internal_landfill_in_process',
        title: 'Internal Landfill In Process',
        message: (data: any) =>
            `Waste group ${data.group_id} is currently undergoing internal landfill.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILLED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_internal_landfilled',
        title: 'Internal Landfill In Process',
        message: (data: any) =>
            `Waste group ${data.group_id} has been internal landfill successfully.`,
    },
    WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_incinerate_in_process',
        title: 'Incineration In Process',
        message: (data: any) =>
            `Waste group ${data.group_id} is currently undergoing incineration.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_INCINERATED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_incinerated',
        title: 'Incineration Completed',
        message: (data: any) => `Waste group ${data.group_id} has been incinerated successfully.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_sterilise_in_process',
        title: 'Sterilisation In Process',
        message: (data: any) =>
            `Waste group ${data.group_id} is currently undergoing sterilisation.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_STERILISED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_sterilised',
        title: 'Sterilisation Completed',
        message: (data: any) => `Waste group ${data.group_id} has been sterilised successfully.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_EXTERNAL_LANDFILLED_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled_in_process',
        title: 'External Landfill In Process',
        message: (data: any) =>
            `Waste group ${data.group_id} is currently undergoing External Landfill.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_EXTERNAL_LANDFILLED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled',
        title: 'External Landfill Completed',
        message: (data: any) =>
            `Waste group ${data.group_id} has been external landfilled successfully.`,
    },
    WASTE_BAG_TREATMENT_GROUP_RECYCLED_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_recycled_in_process',
        title: 'Recycled In Process',
        message: (data: any) => `Waste group ${data.group_id} is currently undergoing Recycled.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_RECYCLED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_recycled',
        title: 'Recycled Completed',
        message: (data: any) => `Waste group ${data.group_id} has been recycled successfully.`,
    },
    WASTE_BAG_TREATMENT_END_STATUS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_end_status',
        title: 'Lifecycle Waste Completed',
        message: (data: any) => `Waste group ${data.group_id} has been ${data.waste_status} successfully.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_DISPOSED_IN_PROCESS: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_disposed_in_process',
        title: 'Disposed In Process',
        message: (data: any) => `Waste group ${data.group_id} is currently undergoing disposed.`,
    }, // ✅
    WASTE_BAG_TREATMENT_GROUP_DISPOSED: {
        type: 'waste_bag_treatment_group.waste_bag_treatment_group_disposed',
        title: 'Disposed Completed',
        message: (data: any) => `Waste group ${data.group_id} has been disposed successfully.`,
    },

    WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP: {
        type: 'waste_bag_group_transport.waste_bag_group_transport_follow_up',
        title: 'Transport Follow-up Required',
        message: (data: any) =>
            `Please follow up on waste group ${data.group_id} transport status.`,
    }, // ✅
    WASTE_BAG_GROUP_TRANSPORT_HANDOVER: {
        type: 'waste_bag_group_transport.waste_bag_group_transport_handover',
        title: 'Waste Handover Completed',
        message: (data: any) =>
            `Waste group ${data.group_id} has been handed over to ${data.vehicle_number}.`,
    }, // ✅
    WASTE_BAG_GROUP_TRANSPORT_PICKUP: {
        type: 'waste_bag_group_transport.waste_bag_group_transport_pickup',
        title: 'Waste Pickup Scheduled',
        message: (data: any) =>
            `Waste group ${data.group_id} is scheduled for pickup by transporter.`,
    }, // ✅
    WASTE_BAG_GROUP_HANDOVER_TO_TREATMENT: {
        type: 'waste_bag_group_transport.waste_bag_group_handover_to_treatment',
        title: 'Waste Handover to Treatment External',
        message: (data: any) =>
            `${data.total_data} Waste group is handover by transporter to third party.`,
    },
    WASTE_BAG_GROUP_TREATMENT_RECEIVMENT: {
        type: 'waste_bag_group_treatment.waste_bag_group_treatment_receivment',
        title: 'Waste Received by Treatment Facility',
        message: (data: any) =>
            `Waste group ${data.group_id} has been received by treatment facility.`,
    }, // ✅

    MANUAL_REQUEST_CREATED: {
        type: 'manual_request.manual_request_created',
        title: 'Manual Weighing Request Submitted',
        message: (data: any) => `A manual weighing request has been submitted by ${data.name}`,
    }, // ✅
    MANUAL_REQUEST_APPROVED: {
        type: 'manual_request.manual_request_approved',
        title: 'Manual Weighing Request Approved',
        message: (data: any) => `Manual weighing request has been approved by ${data.name}.`,
    }, // ✅
    MANUAL_REQUEST_REJECTED: {
        type: 'manual_request.manual_request_rejected',
        title: 'Manual Weighing Request Rejected',
        message: (data: any) => `Manual weighing request has been rejected by ${data.name}.`,
    }, // ✅

    ASSET_INACTIVE: {
        type: 'asset.asset_inactive',
        title: 'Inactive Asset Detected',
        message: (data: any) =>
            `Asset ${data.asset_name} is currently inactive. Please check its status.`,
    },
    ASSET_WARRANTY_EXPIRED: {
        type: 'asset.asset_warranty_expired',
        title: 'Asset Warranty Expiry Reminder',
        message: (data: any) =>
            `The warranty for asset ${data.asset_name} will expire on ${data.expiry_date}.`,
    },
    ASSET_CALIBRATION_DUE: {
        type: 'asset.asset_calibration_due',
        title: 'Asset Calibration Due',
        message: (data: any) =>
            `Asset ${data.asset_name} requires calibration on ${data.calibration_date}.`,
    },

    WASTE_STATUS_CHANGED: {
        type: 'waste.waste_status_changed',
        title: 'Waste Status Updated',
        message: (data: any) =>
            `Waste bag ${data.waste_bag_id} status changed from ${data.old_status} to ${data.new_status}.`,
    },
    WASTE_ACCUMULATED_UPDATE: {
        type: 'waste.waste_accumulated_update',
        title: 'Daily Waste Accumulation Update',
        message: (data: any) => `Total accumulated waste processed today: ${data.summary_data}.`,
    },

    REQUEST_BAST_NUMBER: {
        type: 'bast.create_request',
        title: 'Bast Number requested',
        message: (data: any) => `Bast number ${data.bastNo} is ready to review`,
    }, // ✅
} as const;

// Type definitions
export type NotificationEventType = keyof typeof NOTIFICATION_EVENT_TYPE;
export type NotificationEvent = (typeof NOTIFICATION_EVENT_TYPE)[NotificationEventType];

// Helper type to check if message is a function
export type NotificationMessage = string | ((...args: any[]) => string);

// Helper function to get the formatted message
export function getNotificationMessage<T extends (...args: any) => string>(
    event: NotificationEvent & { message: T | string },
    ...args: Parameters<T>
): string {
    if (typeof event.message === 'function') {
        return event.message(...args);
    }
    return event.message;
}
