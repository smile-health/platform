import { createContext } from 'react';

export const HealthcareAssetListContext = createContext<{
  isAdmin: boolean;
  entityId: number | null;
}>({
  isAdmin: false,
  entityId: null,
});
