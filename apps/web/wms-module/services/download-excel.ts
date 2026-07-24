import axios from '@/lib/axios';
import { GetExcelExportParams } from '@/types/download-excel';
import { parseDownload } from '@repo/ui/utils/download';
import dayjs from 'dayjs';
import i18next from 'i18next';

async function downloadExcel(
  endpoint: string,
  translationKey: string,
  params: GetExcelExportParams
) {
  const response = await axios.get(endpoint, {
    responseType: 'blob',
    params,
  });

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm');
  const translatedPrefix = i18next.t(`excel_filename.${translationKey}`, {
    ns: 'common',
    defaultValue: translationKey,
    typeInfo:
      params.isBags === '1'
        ? i18next.t('excel_filename.params.bag')
        : i18next.t('excel_filename.params.weight'),
  });
  const filename = `${translatedPrefix}-${timestamp}.xlsx`;

  parseDownload(response?.data, filename);
  return response?.data;
}

export function getExportLogbook(params: GetExcelExportParams) {
  return downloadExcel('/waste/logbook/export', 'logbook', params);
}

export function getExportTrackingCharacteristics(params: GetExcelExportParams) {
  return downloadExcel(
    '/waste/tracking-by-characteristics/export',
    'recap_characteristics',
    params
  );
}

export function getExportTrackingSource(params: GetExcelExportParams) {
  return downloadExcel(
    '/waste/tracking-by-waste-source/export',
    'recap_waste_source',
    params
  );
}

export function getExportTrackingWasteBag(params: GetExcelExportParams) {
  return downloadExcel('/waste/transactions/export', 'recap_waste_bag', params);
}

export function getExportTrackingAll(params: GetExcelExportParams) {
  return downloadExcel(
    '/waste/waste-tracking-all/export',
    'waste_tracking_all',
    params
  );
}

export function getExportWasteDisposal(params: GetExcelExportParams) {
  return downloadExcel(
    '/waste/waste-external/export',
    'waste_disposal',
    params
  );
}

export function getExportUserActivity(params: GetExcelExportParams) {
  return downloadExcel(
    '/dashboard/summary-activity-entities/export',
    'user_activity',
    params
  );
}

export function getExportTransactionMonitoring(params: GetExcelExportParams) {
  return downloadExcel(
    '/dashboard-monitoring/entity-waste-bag-summary-by-characteristics/export',
    'wastebag_monitoring_dashboard',
    params
  );
}

export function getExportPartnershipVehicle(params: GetExcelExportParams) {
  return downloadExcel(
    '/partner-vehicle/export',
    'partnership_vehicle',
    params
  );
}
