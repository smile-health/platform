import { PartnershipStatus, ProviderType } from '@/types/partnership';

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface ThirdPartyPartnerOption {
  value: string;
  label: string;
  color?: BadgeColor;
}

export const partnershipStatusList: ThirdPartyPartnerOption[] = [
  { value: PartnershipStatus.ACTIVE, label: 'Active', color: 'success' },
  {
    value: PartnershipStatus.SUSPENDED,
    label: 'Suspended',
    color: 'neutral',
  },
  {
    value: PartnershipStatus.TERMINATED,
    label: 'Terminated',
    color: 'warning',
  },
  { value: PartnershipStatus.PENDING, label: 'Pending', color: 'info' },
  { value: PartnershipStatus.EXPIRED, label: 'Expired', color: 'danger' },
];

export const providerTypeList: ThirdPartyPartnerOption[] = [
  { value: ProviderType.LANDFILLER, label: 'Landfill' },
  { value: ProviderType.TREATMENT, label: 'Treatment' },
  { value: ProviderType.RECYCLER, label: 'Recycler' },
];

export const providerTypeValues = [
  { value: ProviderType.LANDFILLER },
  { value: ProviderType.TREATMENT },
  { value: ProviderType.RECYCLER },
] as const;
