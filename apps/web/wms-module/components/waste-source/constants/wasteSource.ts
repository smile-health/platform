import { SourceType } from '@/types/waste-source';

export const internalTreatmentValues = [
  { value: 'PYROLYSIS' },
  { value: 'DISINFECTION' },
] as const;

export const sourceTypeValues = [
  { value: SourceType.INTERNAL },
  { value: SourceType.EXTERNAL },
  { value: SourceType.INTERNAL_TREATMENT },
] as const;
