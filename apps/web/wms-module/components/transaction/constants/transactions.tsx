import { SourceType } from '@/types/waste-source';
import { OptionType } from '@repo/ui/components/react-select';

export const wasteTreatmentList: OptionType[] = [
  { value: SourceType.INTERNAL, label: 'Internal' },
  { value: SourceType.EXTERNAL, label: 'External' },
];
