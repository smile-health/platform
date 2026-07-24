import { PartnershipStatus, ProviderType } from '@/types/partnership';

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface PartnershipOption {
  value: string;
  label: string;
  color?: BadgeColor;
}

export const partnershipStatusList: PartnershipOption[] = [
  { value: PartnershipStatus.ACTIVE, label: 'Active', color: 'success' },
  { value: PartnershipStatus.SUSPENDED, label: 'Suspended', color: 'neutral' },
  { value: PartnershipStatus.PENDING, label: 'Pending', color: 'info' },
  {
    value: PartnershipStatus.TERMINATED,
    label: 'Terminated',
    color: 'warning',
  },
  {
    value: PartnershipStatus.EXPIRED,
    label: 'Expired',
    color: 'danger',
  },
];

export const partnershipStatusValues = [
  { value: PartnershipStatus.ACTIVE, color: 'success' },
  { value: PartnershipStatus.SUSPENDED, color: 'neutral' },
  { value: PartnershipStatus.PENDING, color: 'info' },
  { value: PartnershipStatus.TERMINATED, color: 'warning' },
  { value: PartnershipStatus.EXPIRED, color: 'danger' },
] as const;

export type PartnershipStatusOption =
  (typeof partnershipStatusValues)[number] & {
    label: string;
  };

export const providerTypeValues = [
  { value: ProviderType.TRANSPORTER },
  { value: ProviderType.TRANSPORTER_TREATMENT },
  { value: ProviderType.TRANSPORTER_LANDFILL },
  { value: ProviderType.TRANSPORTER_RECYCLER },
  { value: ProviderType.SPECIALIZED_TREATMENT_PROVIDER },
  { value: ProviderType.TRANSPORTER_GOVERNMENT },
  { value: ProviderType.TRANSPORTER_GOVERNMENT_WASTE_BANK },
] as const;
