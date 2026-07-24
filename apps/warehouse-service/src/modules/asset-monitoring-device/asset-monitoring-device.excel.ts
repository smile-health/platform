import { Context } from "hono"
import XlsxPopulate from "xlsx-populate"
import moment from "moment-timezone"
import _ from "lodash"
import { AssetMonitoringDeviceQueryParams } from "./asset-monitoring-device.schema.js"

// Headers for temp excursion categorization
const HEADER_EXCEL_TEMP: Record<number, { percent: { header: string; key: string }[]; duration: { header: string; key: string }[] }> = {
    1: {
        percent: [
            { header: "Di Bawah -0,5°C", key: "less_than_temp" },
            { header: "-0,5°C Hingga 2°C", key: "between_temp" },
            { header: "Normal (2°C Hingga 8°C)", key: "normal_temp" },
            { header: "Di Atas 8°C", key: "more_than_temp" },
        ],
        duration: [
            { header: "Durasi Di Bawah -0,5°C (jam)", key: "duration_less_than_temp" },
            { header: "Durasi -0,5°C Hingga 2°C (jam)", key: "duration_between_temp" },
            { header: "Durasi Normal (2°C Hingga 8°C) (jam)", key: "duration_normal_temp" },
            { header: "Durasi Di Atas 8°C (jam)", key: "duration_more_than_temp" },
        ]
    },
    2: {
        percent: [
            { header: "Normal (-25°C Hingga -15°C)", key: "normal_temp" },
            { header: "Di Atas -15°C", key: "between_temp" },
            { header: "Di Atas -0,5°C", key: "more_than_temp" },
        ],
        duration: [
            { header: "Durasi Normal (-25°C Hingga -15°C) (jam)", key: "duration_normal_temp" },
            { header: "Durasi Di Atas -15°C (jam)", key: "duration_between_temp" },
            { header: "Durasi Di Atas -0,5°C (jam)", key: "duration_more_than_temp" },
        ]
    }
}

// Daily logger headers based on temp_min_max
const DAILY_EXCURSION_HEADERS: Record<number, string[]> = {
    1: [
        "Frekuensi Ekskursi -0.5°C hingga 2°C Durasi < 1 Jam",
        "Frekuensi Ekskursi -0.5°C hingga 2°C Durasi 1 - 10 Jam",
        "Frekuensi Ekskursi -0.5°C hingga 2°C Durasi > 10 Jam",
        "Frekuensi Ekskursi < -0.5°C Durasi < 1 Jam",
        "Frekuensi Ekskursi < -0.5°C Durasi 1 - 10 Jam",
        "Frekuensi Ekskursi -0.5°C Durasi > 10 Jam",
        "Frekuensi Ekskursi > 8°C Durasi < 1 Jam",
        "Frekuensi Ekskursi > 8°C Durasi 1 - 10 Jam",
        "Frekuensi Ekskursi > 8°C Durasi > 10 Jam",
    ],
    2: [
        "Frekuensi Ekskursi > -15°C Durasi < 1 Jam",
        "Frekuensi Ekskursi > -15°C Durasi 1 - 10 Jam",
        "Frekuensi Ekskursi > -15°C Durasi > 10 Jam",
        "Frekuensi Ekskursi > -0.5°C Durasi < 1 Jam",
        "Frekuensi Ekskursi > -0.5°C Durasi 1 - 10 Jam",
        "Frekuensi Ekskursi > -0.5°C Durasi > 10 Jam",
    ],
}

const DAILY_EXCURSION_KEYS: Record<number, string[]> = {
    1: [
        "freq_excursion_between_2_min_0_5_below_1_hour",
        "freq_excursion_between_2_min_0_5_between_1_until_10_hour",
        "freq_excursion_between_2_min_0_5_over_10_hour",
        "freq_excursion_below_min_0_5_below_1_hour",
        "freq_excursion_below_min_0_5_between_1_until_10_hour",
        "freq_excursion_below_min_0_5_over_10_hour",
        "freq_excursion_over_8_below_1_hour",
        "freq_excursion_over_8_between_1_until_10_hour",
        "freq_excursion_over_8_over_10_hour",
    ],
    2: [
        "freq_excursion_over_min_15_below_1_hour",
        "freq_excursion_over_min_15_between_1_until_10_hour",
        "freq_excursion_over_min_15_over_10_hour",
        "freq_excursion_over_min_0_5_below_1_hour",
        "freq_excursion_over_min_0_5_between_1_until_10_hour",
        "freq_excursion_over_min_0_5_over_10_hour",
    ],
}

export class AssetMonitoringDeviceExcel {
    constructor() { }

    async generateFilters(
        c: Context,
        queryParams: AssetMonitoringDeviceQueryParams
    ): Promise<{ label: string; value: string }[]> {
        const filters: { label: string; value: string }[] = []

        if (queryParams.from) {
            filters.push({ label: "From Date", value: queryParams.from })
        }

        if (queryParams.to) {
            filters.push({ label: "To Date", value: queryParams.to })
        }

        return filters
    }

    private mappingDataExport(data: any[], tempMinMax: number): any[] {
        return data.map((item) => {
            const keysForPercent = [
                'offline',
                'normal_temp',
                'less_than_temp',
                'between_temp',
                'more_than_temp',
            ]

            keysForPercent.forEach((key) => {
                if (item[key] !== undefined) {
                    item[key] = item[key] ? `${item[key]} %` : '0 %'
                }
            })

            return {
                ...item,
                entity_id: item.entity_id || item.id,
                entity_name: item.name,
                tag_name: item.entity_tags || '-',
            }
        })
    }

    async generateSummaryReport(
        c: Context,
        data: any[],
        queryParams: AssetMonitoringDeviceQueryParams,
        dailyData?: any[]
    ): Promise<Buffer> {
        const tempMinMax = queryParams.temp_min_max ?? 1
        const workbook = await XlsxPopulate.fromBlankAsync()

        // Sheet 1: Distribusi Pembacaan Status
        const sheet1 = workbook.sheet(0)
        sheet1.name(c.var.t("asset_monitoring_device.sheet.distribution", "Distribusi Pembacaan Status"))

        await this.createDistributionSheet(c, sheet1, data, tempMinMax)

        // Sheet 2: Logger Harian (always create, even if empty)
        const sheet2 = workbook.addSheet(c.var.t("asset_monitoring_device.sheet.daily_logger", "Logger Harian"))
        await this.createDailyLoggerSheet(c, sheet2, dailyData || [], tempMinMax)

        const buffer = await workbook.outputAsync()
        return buffer as Buffer
    }

    private async createDistributionSheet(
        c: Context,
        sheet: any,
        data: any[],
        tempMinMax: number
    ): Promise<void> {
        const ALIGN_CENTER = { verticalAlignment: "center", horizontalAlignment: "center", wrapText: true }
        const BOLD = { bold: true }

        const headerConfig = HEADER_EXCEL_TEMP[tempMinMax] || HEADER_EXCEL_TEMP[1]

        // Build headers array with translations
        const staticHeaders = [
            c.var.t("common.province", "Provinsi"),
            c.var.t("common.regency", "Kabupaten/Kota"),
            c.var.t("common.entity_id", "ID Entitas"),
            c.var.t("common.entity", "Entitas"),
            c.var.t("common.entity_tag", "Tag Entitas"),
        ]

        const percentHeaders = headerConfig.percent.map(h => c.var.t(`asset_monitoring_device.header.${h.key}`, h.header))
        const offlineHeader = [c.var.t("asset_monitoring_device.header.offline", "Offline")]
        const durationHeaders = headerConfig.duration.map(h => c.var.t(`asset_monitoring_device.header.${h.key}`, h.header))
        const offlineDurationHeader = [c.var.t("asset_monitoring_device.header.duration_offline", "Durasi Offline (jam)")]

        const allHeaders = [
            ...staticHeaders,
            ...percentHeaders,
            ...offlineHeader,
            ...durationHeaders,
            ...offlineDurationHeader
        ]

        // Write headers
        const startRow = 1
        allHeaders.forEach((header, index) => {
            sheet.cell(startRow, index + 1).value(header).style({ ...ALIGN_CENTER, ...BOLD })
            sheet.column(index + 1).width(25)
        })

        // Adjust specific column widths
        sheet.column(1).width(25) // Provinsi
        sheet.column(2).width(25) // Kabupaten/Kota
        sheet.column(3).width(15) // ID Entitas
        sheet.column(4).width(40) // Entitas
        sheet.column(5).width(30) // Tag Entitas

        // Map data to export format
        const mappedData = this.mappingDataExport(data, tempMinMax)

        // Get key mappings
        const percentKeys = headerConfig.percent.map(h => h.key)
        const durationKeys = headerConfig.duration.map(h => h.key)

        // Write data
        let rowIndex = startRow + 1
        mappedData.forEach(row => {
            let colIndex = 1

            // Static columns
            sheet.cell(rowIndex, colIndex++).value(row.province_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.regency_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.entity_id || '-')
            sheet.cell(rowIndex, colIndex++).value(row.entity_name || row.name || '-')
            const entityTagValue = row.tag_name || row.entity_tags || '-'
            const translatedEntityTag = entityTagValue !== '-' ? c.var.t(`entity_tag.label.${entityTagValue}`, entityTagValue) : '-'
            sheet.cell(rowIndex, colIndex++).value(translatedEntityTag)

            // Percent columns
            percentKeys.forEach(key => {
                sheet.cell(rowIndex, colIndex++).value(row[key] || '0 %')
            })

            // Offline percent
            sheet.cell(rowIndex, colIndex++).value(row.offline || '0 %')

            // Duration columns
            durationKeys.forEach(key => {
                sheet.cell(rowIndex, colIndex++).value(row[key] ?? 0)
            })

            // Duration offline
            sheet.cell(rowIndex, colIndex++).value(row.duration_offline ?? 0)

            rowIndex++
        })
    }

    private async createDailyLoggerSheet(
        c: Context,
        sheet: any,
        dailyData: any[],
        tempMinMax: number
    ): Promise<void> {
        const ALIGN_CENTER = { verticalAlignment: "center", horizontalAlignment: "center", wrapText: true }
        const BOLD = { bold: true }

        // Base headers for daily logger with translations
        const baseHeaders = [
            c.var.t("common.province", "Provinsi"),
            c.var.t("common.regency", "Kabupaten/Kota"),
            c.var.t("common.entity_id", "ID Entitas"),
            c.var.t("asset_monitoring_device.header.entity_name", "Nama Entitas"),
            c.var.t("common.entity_tag", "Tag Entitas"),
            c.var.t("asset_monitoring_device.header.cold_storage_id", "ID Cold Storage"),
            c.var.t("asset_monitoring_device.header.cold_storage_type", "Tipe Cold Storage"),
            c.var.t("asset_monitoring_device.header.cold_storage_model", "Model Cold Storage"),
            c.var.t("asset_monitoring_device.header.min_storage_temp", "Suhu Minimum Penyimpanan"),
            c.var.t("asset_monitoring_device.header.max_storage_temp", "Suhu Maksimum Penyimpanan"),
            c.var.t("asset_monitoring_device.header.logger_id", "ID Logger"),
            c.var.t("asset_monitoring_device.header.logger_serial", "Nomor Seri Logger"),
            c.var.t("asset_monitoring_device.header.logger_model", "Model Logger"),
            c.var.t("asset_monitoring_device.header.manufacturer", "Nama Produsen"),
            c.var.t("asset_monitoring_device.header.vendor", "Nama Vendor"),
            c.var.t("common.date", "Tanggal"),
            c.var.t("asset_monitoring_device.header.week", "Minggu ke-"),
            c.var.t("asset_monitoring_device.header.daily_data_count", "Jumlah Data Harian"),
            c.var.t("asset_monitoring_device.header.last_update_time", "Waktu Update Terakhir"),
            c.var.t("asset_monitoring_device.header.first_update_time", "Waktu Update Awal"),
            c.var.t("asset_monitoring_device.header.duration_online", "Durasi Online (Jam)"),
            c.var.t("asset_monitoring_device.header.duration_offline_hours", "Durasi Offline (Jam)"),
            c.var.t("asset_monitoring_device.header.daily_offline_category", "Kategori Offline Harian"),
            c.var.t("asset_monitoring_device.header.weekly_offline_category", "Kategori Offline Mingguan"),
            c.var.t("asset_monitoring_device.header.min_temp_recorded", "Suhu Minimum yang Tercatat"),
            c.var.t("asset_monitoring_device.header.max_temp_recorded", "Suhu Maksimum yang Tercatat"),
        ]

        const excursionHeadersRaw = DAILY_EXCURSION_HEADERS[tempMinMax] || DAILY_EXCURSION_HEADERS[1]
        const excursionKeys = DAILY_EXCURSION_KEYS[tempMinMax] || DAILY_EXCURSION_KEYS[1]
        const excursionHeaders = excursionHeadersRaw.map((header, idx) =>
            c.var.t(`asset_monitoring_device.header.${excursionKeys[idx]}`, header)
        )
        const allHeaders = [...baseHeaders, ...excursionHeaders]

        // Write headers
        const startRow = 1
        allHeaders.forEach((header, index) => {
            sheet.cell(startRow, index + 1).value(header).style({ ...ALIGN_CENTER, ...BOLD })
            sheet.column(index + 1).width(22)
        })

        // Get excursion keys (already defined above for headers)

        // Write data
        let rowIndex = startRow + 1
        dailyData.forEach(row => {
            let colIndex = 1

            sheet.cell(rowIndex, colIndex++).value(row.province_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.regency_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.entity_id || '-')
            sheet.cell(rowIndex, colIndex++).value(row.entity_name || '-')
            const entityTagName = row.entity_tag_name || '-'
            const translatedTag = entityTagName !== '-' ? c.var.t(`entity_tag.label.${entityTagName}`, entityTagName) : '-'
            sheet.cell(rowIndex, colIndex++).value(translatedTag)
            sheet.cell(rowIndex, colIndex++).value(row.asset_parent_id || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_type_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_parent_model_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_type_min_temp ?? '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_type_max_temp ?? '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_id || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_serial_number || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_model_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.manufacture_name || '-')
            sheet.cell(rowIndex, colIndex++).value(row.asset_vendor_name || '-')

            // Date formatting
            const loggerDate = row.logger_updated_at
                ? moment(row.logger_updated_at).tz('Asia/Jakarta').format('YYYY-MM-DD')
                : '-'
            sheet.cell(rowIndex, colIndex++).value(loggerDate)

            sheet.cell(rowIndex, colIndex++).value(row.week ?? '-')
            sheet.cell(rowIndex, colIndex++).value(row.daily_data_sent ?? 0)

            const maxDatetime = row.max_datetime
                ? moment(row.max_datetime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
                : '-'
            sheet.cell(rowIndex, colIndex++).value(maxDatetime)

            const minDatetime = row.min_datetime
                ? moment(row.min_datetime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
                : '-'
            sheet.cell(rowIndex, colIndex++).value(minDatetime)

            sheet.cell(rowIndex, colIndex++).value(row.hour_online ?? 0)
            sheet.cell(rowIndex, colIndex++).value(row.hour_offline ?? 0)
            sheet.cell(rowIndex, colIndex++).value(row.category_hour_offline || '-')
            sheet.cell(rowIndex, colIndex++).value(row.weekly_offline_category || '-')
            sheet.cell(rowIndex, colIndex++).value(row.min_temp_recorded ?? '-')
            sheet.cell(rowIndex, colIndex++).value(row.max_temp_recorded ?? '-')

            // Excursion columns
            excursionKeys.forEach(key => {
                sheet.cell(rowIndex, colIndex++).value(row[key] ?? 0)
            })

            rowIndex++
        })
    }

    buildExportOptions(
        c: Context,
        data: any[],
        filters: { label: string; value: string }[]
    ): any {
        return {
            sheetName: "Temperature Status",
            columns: [
                { header: "Asset ID", key: "asset_id", width: 15 },
                { header: "Type ID", key: "type_id", width: 15 },
                { header: "Min Temperature", key: "min_temp", width: 20 },
                { header: "Max Temperature", key: "max_temp", width: 20 },
                { header: "Online", key: "online", width: 15 },
            ],
            titleBar: {
                title: "Asset Monitoring Device - Temperature Status",
                subtitle: "Export Report",
            },
            filters: filters,
            data: data,
        }
    }
}
