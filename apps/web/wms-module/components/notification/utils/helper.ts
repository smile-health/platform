import i18n from '@/locales/i18n';
import { TNotification } from '@/types/notification';

type Vars = { [key: string]: string };

/**
 * extractVariables: dispatcher switch -> handler functions
 */
export const extractVariables = (type: string, message: string): Vars => {
  switch (type) {
    case 'partnership.partnership_expired':
      return handlePartnershipExpired(message);

    case 'partnership.partnership_expired_exceed':
      return handlePartnershipExpiredExceed(message);

    case 'partnership.partnership_created':
      return handlePartnershipCreated(message);

    case 'partnership.partnership_updated':
    case 'partnership.partnership_compliance_alert':
      return handleContractId(message);

    case 'waste_bag.waste_bag_residue_created':
    case 'waste_bag.waste_bag_domestic_created':
    case 'waste_bag.waste_bag_in_temporary_storage':
    case 'waste_bag.waste_bag_out_temporary_storage':
    case 'waste_bag.waste_bag_temporary_storage_expired':
    case 'waste_bag.waste_bag_in_cold_storage':
    case 'waste_bag.waste_bag_out_cold_storage':
    case 'waste_bag.waste_bag_cold_storage_expired':
      return handleWasteBag(message);

    case 'waste_bag_group.waste_bag_group_in_temporary_storage':
    case 'waste_bag_group.waste_bag_group_out_temporary_storage':
    case 'waste_bag_group.waste_bag_group_temporary_storage_expired':
    case 'waste_bag_group.waste_bag_group_in_cold_storage':
    case 'waste_bag_group.waste_bag_group_out_cold_storage':
    case 'waste_bag_group.waste_bag_group_cold_storage_expired':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_internal_landfill_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_internal_landfilled':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_incinerate_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_incinerated':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_sterilise_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_sterilised':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_external_landfilled':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_recycled_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_recycled':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_disposed_in_process':
    case 'waste_bag_treatment_group.waste_bag_treatment_group_disposed':
    case 'waste_bag_group_transport.waste_bag_group_transport_follow_up':
    case 'waste_bag_group_transport.waste_bag_group_transport_pickup':
    case 'waste_bag_group_treatment.waste_bag_group_treatment_receivment':
      return handleWasteGroup(message);

    case 'waste_bag_treatment_group.waste_bag_treatment_group_end_status':
      return handleWasteBagEndStatus(message);

    case 'waste_bag_group_transport.waste_bag_group_transport_handover':
      return handleHandover(message);

    case 'waste_bag_group_transport.waste_bag_group_handover_to_treatment':
      return handleGroupHandoverToTreatment(message);

    case 'manual_request.manual_request_created':
      return handleManualRequestCreated(message);

    case 'manual_request.manual_request_approved':
    case 'manual_request.manual_request_rejected':
      return handleManualRequestProcessed(message);

    case 'asset.asset_inactive':
    case 'asset.asset_warranty_expired':
    case 'asset.asset_calibration_due':
      return handleAssetCases(type, message);

    case 'waste.waste_status_changed':
      return handleWasteStatusChanged(message);

    case 'waste.waste_accumulated_update':
      return handleWasteAccumulatedUpdate(message);

    case 'bast.create_request':
      return handleBastCreateRequest(message);

    case 'waste_classification.deleted':
    case 'waste_hierarchy.deleted':
      return handleDeletedClassificationOrHierarchy(message);

    case 'waste_bag.waste_bag_in_external_temporary_storage':
      return handleWasteBagInExternalTemporaryStorage(message);

    default:
      return {};
  }
};

/* =========================
   Helpers
   ========================= */

function safeExec(regex: RegExp, str: string): RegExpExecArray | null {
  return regex.exec(str);
}

/* ---------- partnership handlers ---------- */

function handlePartnershipExpired(message: string): Vars {
  const willExpireRegex =
    /Partnership contract\s*(\d*)\s+will expire\s+(.+?)\s+on\s+([\w\- ]+)/i;

  const hasExpiredRegex =
    /Partnership contract\s*(\d*)\s+has expired\s+on\s+([\w\- ]+)/i;

  const matchWillExpire = safeExec(willExpireRegex, message);
  if (matchWillExpire) {
    const contractId = matchWillExpire[1] || '';
    const dayTextRaw = (matchWillExpire[2] || '').trim();
    const expiryDate = matchWillExpire[3];
    const isExpired = false;

    const daysRemaining = computeDaysRemaining(dayTextRaw, isExpired);
    const dayText = formatDayText(daysRemaining, isExpired);

    return {
      contractId,
      expiryDate,
      daysRemaining: String(daysRemaining),
      dayText,
    };
  }

  const matchHasExpired = safeExec(hasExpiredRegex, message);
  if (matchHasExpired) {
    const contractId = matchHasExpired[1] || '';
    const expiryDate = matchHasExpired[2];
    const isExpired = true;
    const daysRemaining = 0;
    const dayText = formatDayText(daysRemaining, isExpired);

    return {
      contractId,
      expiryDate,
      daysRemaining: '0',
      dayText,
    };
  }

  return {};
}

function handlePartnershipExpiredExceed(message: string): Vars {
  const regex =
    /has expired on (\d{1,2} [A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]+ \d{4}|\d{4}-\d{2}-\d{2})/i;
  const match = safeExec(regex, message);
  return match ? { expiryDate: match[1] } : {};
}

function handlePartnershipCreated(message: string): Vars {
  const regex =
    /A new partnership contract has been created between (.*) and (.*)\./i;
  const match = safeExec(regex, message);
  return match ? { healthcareFacility: match[1], thirdParty: match[2] } : {};
}

function handleContractId(message: string): Vars {
  const regex = /contract (\w+)/i;
  const match = safeExec(regex, message);
  return match ? { contractId: match[1] } : {};
}

/* ---------- waste bag handlers ---------- */

function handleWasteBag(message: string): Vars {
  const regex = /Waste bag (\w+)/i;
  const match = safeExec(regex, message);
  return match ? { wasteBagId: match[1] } : {};
}

function handleWasteGroup(message: string): Vars {
  const regex = /Waste group (\d+)/i;
  const match = safeExec(regex, message);
  return match ? { groupId: match[1] } : { groupId: 'undefined' };
}

/* ---------- end status handler ---------- */

function handleWasteBagEndStatus(message: string): Vars {
  const statusMap: Record<string, { id: string; en: string }> = {
    LANDFILLED: { id: 'ditimbus', en: 'landfilled' },
    RECYCLED: { id: 'diterima pemanfaat', en: 'recycled' },
    COLLECTED: { id: 'dikumpulkan', en: 'collected' },
    DISPOSED: { id: 'diolah / diterima pembuangan akhir', en: 'disposed' },
  };

  const matchedKey = Object.keys(statusMap).find((key) =>
    new RegExp(key, 'i').test(message)
  );

  if (!matchedKey) return { status: '' };

  const useId = i18n.language === 'id';
  const status = useId ? statusMap[matchedKey].id : statusMap[matchedKey].en;

  return { status };
}

/* ---------- handover handlers ---------- */

function handleHandover(message: string): Vars {
  const regex = /Waste group ([\d,]+) has been handed over to (.+?)\./i;
  const match = safeExec(regex, message);
  if (!match) return {};

  const groupIds = match[1];
  const vehicle = match[2].trim();

  return {
    groupId: groupIds,
    vehicleNumber: vehicle || 'undefined',
  };
}

function handleGroupHandoverToTreatment(message: string): Vars {
  const regex = /(\d+) Waste group/i;
  const match = safeExec(regex, message);
  return match ? { totalData: match[1] } : {};
}

/* ---------- manual request ---------- */

function handleManualRequestCreated(message: string): Vars {
  const regex = /request (\w+)/i;
  const match = safeExec(regex, message);
  return match ? { requestId: match[1] } : {};
}

function handleManualRequestProcessed(message: string): Vars {
  const regex = /request(?: ([\w-]+))?.* by (.+?)\.?$/i;
  const match = safeExec(regex, message);
  return match ? { requestId: match[1], name: match[2] } : {};
}

/* ---------- asset ---------- */

function handleAssetCases(type: string, message: string): Vars {
  const result: Vars = {};

  const assetRegex = /Asset ([^ ]+)/i;
  const assetMatch = safeExec(assetRegex, message);
  if (assetMatch) result.assetName = assetMatch[1];

  if (type === 'asset.asset_warranty_expired') {
    const expiryMatch = safeExec(/on (\d{4}-\d{2}-\d{2})/i, message);
    if (expiryMatch) result.expiryDate = expiryMatch[1];
  }

  if (type === 'asset.asset_calibration_due') {
    const calMatch = safeExec(/on (\d{4}-\d{2}-\d{2})/i, message);
    if (calMatch) result.calibrationDate = calMatch[1];
  }

  return result;
}

/* ---------- waste status ---------- */

function handleWasteStatusChanged(message: string): Vars {
  const regex = /Waste bag (\w+) status changed from (\w+) to (\w+)/i;
  const match = safeExec(regex, message);
  return match
    ? { wasteBagId: match[1], oldStatus: match[2], newStatus: match[3] }
    : {};
}

/* ---------- accumulated update ---------- */

function handleWasteAccumulatedUpdate(message: string): Vars {
  const match = safeExec(
    /Total accumulated waste processed today: (.*)\./i,
    message
  );
  return match ? { summaryData: match[1] } : {};
}

/* ---------- bast ---------- */

function handleBastCreateRequest(message: string): Vars {
  const match = safeExec(/Bast number (\w+)/i, message);
  return match ? { bastNo: match[1] } : {};
}

/* ---------- deleted classification/hierarchy ---------- */

function handleDeletedClassificationOrHierarchy(message: string): Vars {
  const regex =
    /(?:Waste classification|Waste hierarchy) id (\w+) has been inactivated/i;
  const match = safeExec(regex, message);
  return match ? { id: match[1] } : {};
}

/* ---------- external temporary storage ---------- */

function handleWasteBagInExternalTemporaryStorage(message: string): Vars {
  const regex =
    /Waste group (null|\d+) has been moved into external temporary storage/i;
  const match = safeExec(regex, message);
  return match ? { groupId: match[1] } : {};
}

/* =========================
   Utilities
   ========================= */

function computeDaysRemaining(dayTextRaw: string, isExpired: boolean): number {
  if (isExpired || !dayTextRaw) return 0;

  if (/tomorrow/i.test(dayTextRaw)) return 1;

  const match = /in (\d+) days/i.exec(dayTextRaw);
  return match ? parseInt(match[1], 10) || 0 : 0;
}

function formatDayText(daysRemaining: number, isExpired: boolean): string {
  const langId = i18n.language === 'id';

  if (langId) {
    if (isExpired) return 'kedaluwarsa';
    if (daysRemaining === 1) return 'besok';
    if (daysRemaining > 1) return `dalam ${daysRemaining} hari`;
    return '';
  }

  if (isExpired) return 'expired';
  if (daysRemaining === 1) return 'tomorrow';
  if (daysRemaining > 1) return `in ${daysRemaining} days`;
  return '';
}

/* =========================
   translateNotification
   ========================= */

export const translateNotification = (
  notification: TNotification
): TNotification => {
  // ensure message/title are strings to satisfy TNotification type
  const messageStr =
    notification.message == null ? '' : String(notification.message);
  const titleStr = notification.title == null ? '' : String(notification.title);

  const variables = extractVariables(notification.type, messageStr);

  const translatedMessageRaw = i18n.t(
    `notification:${notification.type}.message`,
    {
      ...variables,
      defaultValue: messageStr,
      ns: 'notification',
    }
  );

  const translatedMessage =
    typeof translatedMessageRaw === 'string'
      ? translatedMessageRaw
      : String(translatedMessageRaw ?? messageStr);

  const translatedTitleRaw = i18n.t(`notification:${notification.type}.title`, {
    ...variables,
    defaultValue: titleStr,
    ns: 'notification',
  });

  const translatedTitle =
    typeof translatedTitleRaw === 'string'
      ? translatedTitleRaw
      : String(translatedTitleRaw ?? titleStr);

  return {
    ...notification,
    message: translatedMessage,
    title: translatedTitle,
  };
};
