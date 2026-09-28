import { useEffect, useState } from 'react';
import { countdownParts } from '../services/eventService';

/** Ticks once a second. The countdown itself is derived during render, not stored. */
export function useCountdown(targetDate: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return countdownParts(targetDate, now);
}
