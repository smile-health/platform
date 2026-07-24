import { createContext } from 'react';

interface ContextValue {
  isHealthBureaucrat: boolean | undefined;
}

export const TrackingListContext = createContext<ContextValue>({
  isHealthBureaucrat: undefined,
});
