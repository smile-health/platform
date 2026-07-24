import { TicketingSystemStatusEnum } from '../../ticketing-system.constant'
import { TFollowUpChangeStatus } from './ticketing-system-detail.type'

export const followUpChangeStatus = ({
  statusId,
  followUpStatus,
}: TFollowUpChangeStatus) => {
  switch (statusId) {
    case TicketingSystemStatusEnum.Submitted:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.ReviewedByHelpDesk
      )
    case TicketingSystemStatusEnum.ReviewedByHelpDesk:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.ReportedToProvince
      )
    case TicketingSystemStatusEnum.ReportedToProvince:
    case TicketingSystemStatusEnum.ReportedToSupplier:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.InSupplierInspection
      )
    case TicketingSystemStatusEnum.InSupplierInspection:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.AlreadyRevised
      )
    case TicketingSystemStatusEnum.AlreadyRevised:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.RevisionCheck
      )
    case TicketingSystemStatusEnum.RevisionCheck:
    case TicketingSystemStatusEnum.ManualInput:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.ReportCompleted
      )
    default:
      return followUpStatus.find(
        (status: { id: number }) =>
          status.id === TicketingSystemStatusEnum.ReportCancelled
      )
  }
}
