export type WMSWasteBagStatus =
  | 'IN_TEMPORARY_STORAGE'
  | 'IN_COLD_STORAGE'
  | 'INCINERATION_IN_PROCESS'
  | 'STERILIZATION_IN_PROCESS'
  | 'INTERNAL_LANDFILL_IN_PROCESS'
  | 'INTERNAL_LANDFILLED'
  | 'INCINERATED'
  | 'STERILISED'
  | 'READY_FOR_TRANSPORT'
  | 'TRANSPORTATION_REQUEST_CREATED'
  | 'IN_TRANSIT'
  | 'READY_FOR_TREATMENT'
  | 'IN_THIRD_PARTY_STORAGE'
  | 'RECYCLED'
  | 'LANDFILLED'
  | 'COLLECTED'
  | 'DISPOSED'
  | 'HANDOVER_TO_TREATMENT';

export type BFFWasteBagStatus =
  | 'In Temporary Storage'
  | 'In Cold Storage'
  | 'Incineration In Process'
  | 'Sterilization In Process'
  | 'Internal Landfill In Process'
  | 'Internal Landfilled'
  | 'Incinerated'
  | 'Sterilised'
  | 'Ready For Transport'
  | 'Transportation Request Created'
  | 'In Transit'
  | 'Ready For Treatment'
  | 'In Third Party Storage'
  | 'Recycled'
  | 'Landfilled'
  | 'Collected'
  | 'Disposed'
  | 'Handover To Treatment';

export const getBFFWasteStatusFromWMSWasteStatus = (status: WMSWasteBagStatus): BFFWasteBagStatus => {
  const statusMap: Record<WMSWasteBagStatus, BFFWasteBagStatus> = {
    IN_TEMPORARY_STORAGE: 'In Temporary Storage',
    IN_COLD_STORAGE: 'In Cold Storage',
    INCINERATION_IN_PROCESS: 'Incineration In Process',
    STERILIZATION_IN_PROCESS: 'Sterilization In Process',
    INTERNAL_LANDFILL_IN_PROCESS: 'Internal Landfill In Process',
    INTERNAL_LANDFILLED: 'Internal Landfilled',
    INCINERATED: 'Incinerated',
    STERILISED: 'Sterilised',
    READY_FOR_TRANSPORT: 'Ready For Transport',
    TRANSPORTATION_REQUEST_CREATED: 'Transportation Request Created',
    IN_TRANSIT: 'In Transit',
    READY_FOR_TREATMENT: 'Ready For Treatment',
    IN_THIRD_PARTY_STORAGE: 'In Third Party Storage',
    RECYCLED: 'Recycled',
    LANDFILLED: 'Landfilled',
    COLLECTED: 'Collected',
    DISPOSED: 'Disposed',
    HANDOVER_TO_TREATMENT: 'Handover To Treatment',
  };

  return statusMap[status];
};
