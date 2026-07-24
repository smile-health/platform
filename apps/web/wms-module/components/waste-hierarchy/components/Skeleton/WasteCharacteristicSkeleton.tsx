'use client';

import { Skeleton } from '@repo/ui/components/skeleton';

const WasteCharacteristicSkeleton = (): JSX.Element => {
  return (
    <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto ui-p-4 ui-border ui-rounded">
      <Skeleton className="ui-h-10 ui-w-full" />
      <Skeleton className="ui-h-10 ui-w-full" />
      <Skeleton className="ui-h-10 ui-w-full" />
    </div>
  );
};

export default WasteCharacteristicSkeleton;
