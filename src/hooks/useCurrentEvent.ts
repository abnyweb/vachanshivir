import { useStore } from '../store/StoreContext';
import { getCurrentEvent } from '../services/eventService';

export function useCurrentEvent() {
  const { db } = useStore();
  return getCurrentEvent(db);
}
