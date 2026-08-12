import { ENTITY_TAG, ENTITY_TYPE } from "@/common/constants/entity.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { NotificationTypeRepository } from "@/common/repository/notification-type.js"
import { env } from "@/config/env.js"
import { NOTIFICATION_TYPE } from "@smile-health/lib/rabbitmq/notification.js"
import { Publisher } from "@smile-health/lib/rabbitmq/publisher.js"
import { Context } from "@smile-health/lib/types/context.js"
import { generateEventCode } from "@smile-health/lib/utils.js"
import { Context as HonoContext } from "hono"
import moment from "moment-timezone"
import { UserRepository } from "../../user/user.repository.js"
import { AssetInventoryRepository } from "../asset-inventory.repository.js"
import {
  DataMessage,
  DataMessageAssetStatusChanged,
  DataMessageDefrostingReminder,
  DataMessageUnlinkedRtmd,
  DataMessageWarranty,
} from "../asset-inventory.schema.js"

export class AssetInventoryNotification {
  constructor(
    private assetInventoryRepo: AssetInventoryRepository,
    private userRepo: UserRepository,
    private publisher: Publisher,
    private notificationTypeRepo: NotificationTypeRepository
  ) {}

  private readonly TemplateMessageToSend = {
    user: {
      user_id: "",
      email: "",
      mobile_phone: "",
      fcm_token: "",
      entity_id: "",
      province_id: "",
      regency_id: null,
    },
    media: "",
    message: "",
    title: "",
    type: "",
    download_url: null,
    action_url: null as string | null,
    worker: "",
    workerMedia: "",
    program_id: null,
    template: "",
    variables: [] as string[],
    vendorPushed: false,
    event_code: "",
  }

  private readonly encodeFilter = (value: unknown) =>
    encodeURIComponent(JSON.stringify(value))

  private readonly doubleEncode = (value: string) => encodeURIComponent(value)

  public readonly handleAssetMaintenanceReminder = async (
    c: Context<DB>,
    context: HonoContext
  ) => {
    console.log("=== Start Process Maintenance Reminder ===")
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    const limit = 1000
    let offset = 0
    let hasMore = true
    const response = []

    const notifChannel =
      await this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_MAINTENANCE
      )

    while (hasMore) {
      const assets = await this.assetInventoryRepo.getAssetReachesMaintenance(
        c,
        limit,
        offset
      )

      if (assets.length === 0) {
        hasMore = false
        console.log("No assets found for maintenance reminder.")
        break
      }

      for (const asset of assets) {
        const {
          serial_number,
          manufacture_name,
          asset_model_name,
          asset_type_name,
          entity_id,
          regency_name,
          entity_type,
          next_maintenance_date,
          days_until_next,
          other_asset_model_name,
          other_asset_manufacture_name,
          other_asset_type_name,
        } = asset
        let { entity_name } = asset

        if (entity_type === ENTITY_TYPE.HEALTH_FACILITY && regency_name) {
          entity_name += ` ${regency_name}`
        }

        const dataMessage: DataMessage = {
          manufacture: manufacture_name || other_asset_manufacture_name,
          asset_type: asset_type_name || other_asset_type_name,
          asset_model: asset_model_name || other_asset_model_name,
          serial_number: serial_number,
          entity_name: entity_name,
          next_schedule: moment(next_maintenance_date)
            .tz("Asia/Jakarta")
            .format("DD/MM/YYYY"),
          days: days_until_next,
        }

        const message = this.TemplateMessageToSend
        message.type = NOTIFICATION_TYPE.ASSET_MAINTENANCE
        message.title = "notification.title.asset_maintenance"
        message.event_code = (await this.getEventCode()) || ""
        if (days_until_next > 0) {
          message.message = "notification.message.asset_maintenance_upcoming"
          message.template = "asset_maintenance_upcoming"
          message.variables = [
            dataMessage.manufacture || "",
            dataMessage.asset_model || "",
            serial_number || "",
            entity_name || "",
            dataMessage.next_schedule || "",
            days_until_next.toString(),
          ]
        } else if (days_until_next < 0) {
          message.message = "notification.message.asset_maintenance_overdue"
          message.template = "asset_maintenance_overdue"
          message.variables = [
            dataMessage.asset_model || "",
            dataMessage.asset_type || "",
            serial_number || "",
            entity_name || "",
            dataMessage.next_schedule || "",
          ]
        }

        response.push(message)

        await this.sendNotifToUser(
          c,
          context,
          entity_id!,
          message,
          dataMessage,
          notifChannel
        )
      }

      offset += limit
    }

    console.log("End Process", moment().format("YYYY-MM-DD HH:mm:ss"))
    console.log("=== End Process Maintenance Reminder ===")

    return response
  }

  public readonly handleAssetCalibrationReminder = async (
    c: Context<DB>,
    context: HonoContext
  ) => {
    console.log("=== Start Process Calibration Reminder ===")
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    const limit = 1000
    let offset = 0
    let hasMore = true
    const response = []

    const notifChannel =
      await this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_CALIBRATION
      )

    while (hasMore) {
      const assets = await this.assetInventoryRepo.getAssetReachesCalibration(
        c,
        limit,
        offset
      )

      if (assets.length === 0) {
        hasMore = false
        console.log("No assets found for calibration reminder.")
        break
      }

      for (const asset of assets) {
        const {
          serial_number,
          manufacture_name,
          asset_model_name,
          asset_type_name,
          entity_id,
          regency_name,
          entity_type,
          next_calibration_date,
          days_until_next,
          other_asset_model_name,
          other_asset_manufacture_name,
          other_asset_type_name,
        } = asset
        let { entity_name } = asset

        if (entity_type === ENTITY_TYPE.HEALTH_FACILITY && regency_name) {
          entity_name += ` ${regency_name}`
        }

        const dataMessage: DataMessage = {
          manufacture: manufacture_name || other_asset_manufacture_name,
          asset_type: asset_type_name || other_asset_type_name,
          asset_model: asset_model_name || other_asset_model_name,
          serial_number: serial_number,
          entity_name: entity_name,
          next_schedule: moment(next_calibration_date)
            .tz("Asia/Jakarta")
            .format("DD/MM/YYYY"),
          days: days_until_next,
        }

        const message = this.TemplateMessageToSend
        message.type = NOTIFICATION_TYPE.ASSET_CALIBRATION
        message.title = "notification.title.asset_calibration"
        message.event_code = await this.getEventCode()
        if (days_until_next > 0) {
          message.message = "notification.message.asset_calibration_upcoming"
          message.template = "asset_calibration_upcoming"
          message.variables = [
            dataMessage.manufacture || "",
            dataMessage.asset_model || "",
            serial_number || "",
            entity_name || "",
            dataMessage.next_schedule || "",
            days_until_next.toString(),
          ]
        } else if (days_until_next < 0) {
          message.message = "notification.message.asset_calibration_overdue"
          message.template = "asset_calibration_overdue"
          message.variables = [
            dataMessage.asset_model || "",
            dataMessage.asset_type || "",
            serial_number || "",
            entity_name || "",
            dataMessage.next_schedule || "",
          ]
        }

        response.push(message)

        await this.sendNotifToUser(
          c,
          context,
          entity_id!,
          message,
          dataMessage,
          notifChannel
        )
      }

      offset += limit
    }

    return response
  }

  public readonly handleAssetWarrantyReminder = async (
    c: Context<DB>,
    context: HonoContext
  ) => {
    console.log("=== Start Process Warranty Reminder ===")
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    const limit = 1000
    let offset = 0
    let hasMore = true
    const response = []

    const notifChannel =
      await this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_WARRANTY
      )

    while (hasMore) {
      const assets = await this.assetInventoryRepo.getAssetWarrantyOverdue(
        c,
        limit,
        offset
      )

      if (assets.length === 0) {
        hasMore = false
        console.log("No assets found for warranty reminder.")
        break
      }

      for (const asset of assets) {
        const {
          serial_number,
          manufacture_name,
          asset_model_name,
          entity_id,
          regency_name,
          entity_type,
          warranty_end_date,
        } = asset
        let { entity_name } = asset

        if (entity_type === ENTITY_TYPE.HEALTH_FACILITY && regency_name) {
          entity_name += ` ${regency_name}`
        }

        const dataMessage: DataMessageWarranty = {
          manufacture: manufacture_name || null,
          asset_model: asset_model_name || null,
          serial_number: serial_number || null,
          entity_name: entity_name || null,
          warranty_end_date: moment(warranty_end_date)
            .tz("Asia/Jakarta")
            .format("DD/MM/YYYY"),
        }

        const message = this.TemplateMessageToSend
        message.type = NOTIFICATION_TYPE.ASSET_WARRANTY
        message.title = "notification.title.asset_warranty"
        message.message = "notification.message.asset_warranty"
        message.template = "asset_warranty"
        message.event_code = await this.getEventCode()
        message.variables = [
          dataMessage.manufacture || "",
          dataMessage.asset_model || "",
          serial_number || "",
          entity_name || "",
          dataMessage.warranty_end_date || "",
        ]

        response.push(message)

        await this.sendNotifToUser(
          c,
          context,
          entity_id!,
          message,
          dataMessage,
          notifChannel
        )
      }

      offset += limit
    }

    return response
  }

  public readonly handleUnlinkedRtmdReminder = async (
    c: Context<DB>,
    context: HonoContext
  ) => {
    console.log("=== Start Process Unlinked RTMD Reminder ===")
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    const limit = 1000
    let offset = 0
    let hasMore = true
    const response = []

    const [notifChannel, actionUrl] = await Promise.all([
      this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_RTMD_UNLINKED
      ),
      this.notificationTypeRepo.getActionUrl(
        c,
        NOTIFICATION_TYPE.ASSET_RTMD_UNLINKED
      ),
    ])

    while (hasMore) {
      const rtmds = await this.assetInventoryRepo.getUnlinkedRtmds(
        c,
        limit,
        offset
      )

      if (rtmds.length === 0) {
        hasMore = false
        console.log("No unlinked RTMDs found.")
        break
      }

      for (const rtmd of rtmds) {
        const {
          entity_id,
          entity_name,
          unlinked_count,
          province_id,
          province_name,
          regency_id,
          regency_name,
          entity_tag_id,
          entity_tag_name,
        } = rtmd

        const dataMessage: DataMessageUnlinkedRtmd = {
          count: unlinked_count,
        }

        const filterParams = [
          province_id
            ? `province=${this.doubleEncode(
                this.encodeFilter({
                  label: province_name,
                  value: Number(province_id),
                })
              )}`
            : null,
          regency_id
            ? `regency=${this.doubleEncode(
                this.encodeFilter({
                  label: regency_name,
                  value: Number(regency_id),
                })
              )}`
            : null,
          entity_tag_id
            ? `entity_tag=${this.doubleEncode(
                this.encodeFilter([
                  { label: entity_tag_name, value: entity_tag_id },
                ])
              )}`
            : null,
          entity_tag_id === ENTITY_TAG.PUSKESMAS
            ? `health_center=${this.doubleEncode(
                this.encodeFilter({ label: entity_name, value: entity_id })
              )}`
            : null,
        ]
          .filter(Boolean)
          .join("&")

        const message = this.TemplateMessageToSend
        message.type = NOTIFICATION_TYPE.ASSET_RTMD_UNLINKED
        message.title = "notification.title.asset_rtmd_unlinked"
        message.message = "notification.message.asset_rtmd_unlinked"
        message.template = "asset_rtmd_unlinked"
        message.event_code = (await this.getEventCode()) || ""
        message.action_url = actionUrl
          ? filterParams
            ? `${actionUrl}&${filterParams}`
            : actionUrl
          : null
        message.variables = [dataMessage.count.toString()]

        response.push(message)

        await this.sendNotifToUser(
          c,
          context,
          entity_id!,
          message,
          dataMessage,
          notifChannel
        )
      }

      offset += limit
    }

    console.log("End Process", moment().format("YYYY-MM-DD HH:mm:ss"))
    console.log("=== End Process Unlinked RTMD Reminder ===")

    return response
  }

  public readonly handleAssetDefrostingReminder = async (
    c: Context<DB>,
    context: HonoContext
  ) => {
    console.log("=== Start Process Defrosting Reminder ===")
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    const limit = 1000
    let offset = 0
    let hasMore = true
    const response = []

    const [notifChannel, actionUrlTemplate] = await Promise.all([
      this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_DEFROSTING_REMINDER
      ),
      this.notificationTypeRepo.getActionUrl(
        c,
        NOTIFICATION_TYPE.ASSET_DEFROSTING_REMINDER
      ),
    ])

    while (hasMore) {
      const assets = await this.assetInventoryRepo.getAssetsInDefrostingStatus(
        c,
        limit,
        offset
      )

      if (assets.length === 0) {
        hasMore = false
        console.log("No assets currently in Defrosting status.")
        break
      }

      for (const asset of assets) {
        const {
          asset_inventory_id,
          serial_number,
          manufacture_name,
          asset_model_name,
          asset_type_name,
          entity_id,
          regency_name,
          entity_type,
          days_in_defrosting,
          other_asset_model_name,
          other_asset_manufacture_name,
          other_asset_type_name,
        } = asset
        let { entity_name } = asset

        if (entity_type === ENTITY_TYPE.HEALTH_FACILITY && regency_name) {
          entity_name += ` ${regency_name}`
        }

        const dataMessage: DataMessageDefrostingReminder = {
          code: serial_number,
          name:
            asset_model_name ||
            other_asset_model_name ||
            asset_type_name ||
            other_asset_type_name,
          brand: manufacture_name || other_asset_manufacture_name,
          institution: entity_name,
          days: days_in_defrosting,
        }

        const message = this.TemplateMessageToSend
        message.type = NOTIFICATION_TYPE.ASSET_DEFROSTING_REMINDER
        message.title = "notification.title.asset_defrosting_reminder"
        message.message = "notification.message.asset_defrosting_reminder"
        message.template = "asset_defrosting_reminder"
        message.event_code = (await this.getEventCode()) || ""
        message.action_url = actionUrlTemplate
          ? `${env.FRONTEND_URL}${actionUrlTemplate.replace(
              "{id}",
              String(asset_inventory_id)
            )}`
          : null
        message.variables = [
          dataMessage.code || "",
          dataMessage.name || "",
          dataMessage.brand || "",
          dataMessage.institution || "",
          days_in_defrosting.toString(),
        ]

        response.push(message)

        await this.sendNotifToUser(
          c,
          context,
          entity_id!,
          message,
          dataMessage,
          notifChannel
        )
      }

      offset += limit
    }

    console.log("End Process", moment().format("YYYY-MM-DD HH:mm:ss"))
    console.log("=== End Process Defrosting Reminder ===")

    return response
  }

  public readonly handleAssetChangedNotification = async (
    c: Context<DB>,
    context: HonoContext,
    assetId: number
  ) => {
    const [asset, notifChannel] = await Promise.all([
      this.assetInventoryRepo.getAssetInventoryById(context, assetId),
      this.notificationTypeRepo.generateNotificationChannels(
        c,
        NOTIFICATION_TYPE.ASSET_STATUS_CHANGED
      ),
    ])

    const {
      manufacture_name,
      asset_model_name,
      serial_number,
      entity_id,
      entity_is_puskesmas,
      asset_working_status_name,
      updated_at,
      regency_name,
    } = asset || {}
    let { entity_name } = asset || {}

    const other_manufacture_name = asset?.other_asset_manufacture_name
    const other_asset_model_name = asset?.other_asset_model_name

    if (entity_is_puskesmas && regency_name) entity_name += ` ${regency_name}`
    const dataMessage: DataMessageAssetStatusChanged = {
      manufacture: manufacture_name || other_manufacture_name || "",
      asset_model: asset_model_name || other_asset_model_name || "",
      serial_number: serial_number || "",
      entity_name: entity_name || "",
      status: asset_working_status_name || "",
      updated_at: updated_at
        ? moment(updated_at).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm")
        : "",
    }
    const message = this.TemplateMessageToSend
    message.type = "asset-status-changed"
    message.title = "notification.title.asset_status_changed"
    message.message = "notification.message.asset_status_changed"
    message.template = "asset_status_changed"
    message.event_code = (await this.getEventCode()) || ""
    message.variables = [
      dataMessage.manufacture || "",
      dataMessage.asset_model || "",
      dataMessage.serial_number || "",
      dataMessage.entity_name || "",
      this.setMessage(context.var.t, asset_working_status_name || "") || "",
      dataMessage.updated_at || "",
    ]

    await this.sendNotifToUser(
      c,
      context,
      entity_id!,
      message,
      dataMessage,
      notifChannel
    )
  }

  private readonly sendNotifToUser = async (
    c: Context<DB>,
    context: HonoContext,
    entityId: number,
    message,
    dataMessage,
    notifChannel: { media: string; worker: string }[]
  ) => {
    const [userEntities, userVendors] = await Promise.all([
      this.userRepo.getUserByEntityId(c, entityId),
      this.userRepo.getUserVendorByCustomerId(c, entityId),
    ])
    console.log(userEntities.length, "userEntities found")
    console.log(userVendors.length, "userVendors found")

    if (notifChannel.length === 0) {
      // No channel enabled for this notification type - nothing to send.
      return
    }

    for (const user of [...userEntities, ...userVendors]) {
      const payload = await this.buildMessageForUser(user, message, dataMessage)
      payload.media = notifChannel[0].media
      payload.worker = notifChannel[0].worker
      payload.workerMedia = notifChannel[0].media
      payload.messageTranslation = this.setMessage(c.var.t, payload.message)
      payload.titleTranslation = this.setMessage(c.var.t, payload.title)

      await this.publisher.publishNotification(
        context,
        payload.worker,
        payload
      )
    }
  }

  private async buildMessageForUser(user, baseMessage, dataMessage) {
    return {
      ...baseMessage,
      user: {
        user_id: user.global_id,
        email: user.email,
        mobile_phone: user.mobile_phone,
        fcm_token: user.fcm_token,
        entity_id: user.entity_id,
        province_id: user.entity_province_id || null,
        regency_id: user.entity_regency_id || null,
        is_vendor: user.is_vendor,
      },
      program_id: user.program_id || null,
      message: `${baseMessage.message}, ${JSON.stringify(dataMessage)}`,
      user_entity_tag_id: user.entity_tag_id || null,
    }
  }

  private async getEventCode() {
    return (await generateEventCode()) || ""
  }

  public setMessage(t, data: string) {
    const splitIndex = data.indexOf(", {")
    if (splitIndex === -1) return t(data) || data

    const label = data.slice(0, splitIndex).trim()
    const jsonString = data.slice(splitIndex + 2).trim()

    try {
      const json = JSON.parse(jsonString)

      const transformed = Object.fromEntries(
        Object.entries(json).map(([k, v]) => [
          k,
          typeof v === "string" ? t(v) : v,
        ])
      )

      return t(label, transformed)
    } catch (e) {
      return data
    }
  }
}
