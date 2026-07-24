import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  prefix: 'ui-',
});

export default function cx(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
