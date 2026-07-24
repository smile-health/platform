import { PartnershipStatus, ProviderType } from '@/types/partnership';

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface HealthcarePartnerOption {
  value: string;
  label: string;
  color?: BadgeColor;
}

export const partnershipStatusList: HealthcarePartnerOption[] = [
  { value: PartnershipStatus.ACTIVE, label: 'Active', color: 'success' },
  {
    value: PartnershipStatus.SUSPENDED,
    label: 'Suspended',
    color: 'neutral',
  },
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

export const providerTypeList: HealthcarePartnerOption[] = [
  { value: ProviderType.LANDFILLER, label: 'Landfiller' },
  { value: ProviderType.TREATMENT, label: 'Treatment' },
  { value: ProviderType.RECYCLER, label: 'Recycler' },
];
