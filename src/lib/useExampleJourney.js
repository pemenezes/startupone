import { useSyncExternalStore } from 'react';
import { getExampleJourney, initialExampleJourney, subscribeExampleJourney } from './exampleJourney';

const serverSnapshot = initialExampleJourney();

export function useExampleJourney() {
  return useSyncExternalStore(subscribeExampleJourney, getExampleJourney, () => serverSnapshot);
}
