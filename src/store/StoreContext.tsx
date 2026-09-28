import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { seedDatabase, type Collection, type Database } from './database';
import { createDataAdapter } from '../services/dataSource';
import type { SiteSettings, IntegrationSettings } from '../types';

type Entity = { id: string };

interface StoreValue {
  db: Database;
  loading: boolean;
  error: string | null;
  create<K extends Collection>(collection: K, record: Database[K][number]): void;
  update<K extends Collection>(collection: K, id: string, patch: Partial<Database[K][number]>): void;
  remove(collection: Collection, id: string): void;
  replace<K extends Collection>(collection: K, records: Database[K]): void;
  updateSettings(patch: Partial<SiteSettings>): void;
  updateIntegrations(patch: Partial<IntegrationSettings>): void;
  resetDemoData(): void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => createDataAdapter(), []);
  const [db, setDb] = useState<Database>(() => seedDatabase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    adapter
      .load()
      .then((loaded) => {
        if (cancelled) return;
        setDb(loaded);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load event data.');
      })
      .finally(() => {
        if (cancelled) return;
        hydrated.current = true;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [adapter]);

  useEffect(() => {
    if (!hydrated.current) return;
    void adapter.persist(db);
  }, [db, adapter]);

  // Connect to SSE stream for real-time live events across all admin dashboards
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connectSSE() {
      try {
        es = new EventSource('/api/events');

        es.addEventListener('open', () => {
          console.log('⚡ Connected to real-time events stream (/api/events)');
        });

        es.addEventListener('registration.created', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.registration) {
              setDb((prev) => {
                const reg = data.registration;
                const att = data.attendee;

                const exists = (prev.registrations || []).some(
                  (r) => r.id === reg.id || (r.reference && r.reference === reg.reference)
                );
                if (exists) return prev;

                const nextRegs = [reg, ...(prev.registrations || [])];
                const nextAtts = att
                  ? [att, ...(prev.attendees || []).filter((a) => a.id !== att.id && a.reference !== att.reference)]
                  : (prev.attendees || []);

                return {
                  ...prev,
                  registrations: nextRegs,
                  attendees: nextAtts,
                };
              });

              window.dispatchEvent(new CustomEvent('vs:registration_created', { detail: data }));
            }
          } catch (e) {
            console.warn('Error parsing registration.created SSE payload', e);
          }
        });

        es.addEventListener('registration.updated', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            const targetId = data.id || data.reference;
            if (targetId) {
              setDb((prev) => ({
                ...prev,
                registrations: (prev.registrations || []).map((r) =>
                  r.id === targetId || r.reference === targetId
                    ? { ...r, ...(data.registration || {}), ...data }
                    : r
                ),
                attendees: (prev.attendees || []).map((a) =>
                  a.id === targetId || a.registrationId === targetId || a.reference === targetId
                    ? { ...a, ...(data.attendee || {}), ...data }
                    : a
                ),
              }));

              window.dispatchEvent(new CustomEvent('vs:registration_updated', { detail: data }));
            }
          } catch (e) {
            console.warn('Error parsing registration.updated SSE payload', e);
          }
        });

        es.addEventListener('registration.deleted', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            const targetId = data.id || data.reference;
            if (targetId) {
              setDb((prev) => ({
                ...prev,
                registrations: (prev.registrations || []).filter(
                  (r) => r.id !== targetId && r.reference !== targetId
                ),
                attendees: (prev.attendees || []).filter(
                  (a) => a.id !== targetId && a.registrationId !== targetId && a.reference !== targetId
                ),
              }));

              window.dispatchEvent(new CustomEvent('vs:registration_deleted', { detail: data }));
            }
          } catch (e) {
            console.warn('Error parsing registration.deleted SSE payload', e);
          }
        });

        es.onerror = () => {
          if (es && es.readyState === EventSource.CLOSED) {
            es.close();
            reconnectTimeout = setTimeout(connectSSE, 3000);
          }
        };
      } catch (err) {
        console.warn('SSE connection failed to initialize', err);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    }

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (es) es.close();
    };
  }, []);

  const create = useCallback<StoreValue['create']>((collection, record) => {
    setDb((prev) => ({ ...prev, [collection]: [...(prev[collection] as Entity[]), record] } as Database));
  }, []);

  const update = useCallback<StoreValue['update']>((collection, id, patch) => {
    setDb((prev) => ({
      ...prev,
      [collection]: (prev[collection] as Entity[]).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    } as Database));
  }, []);

  const remove = useCallback<StoreValue['remove']>((collection, id) => {
    setDb((prev) => ({
      ...prev,
      [collection]: (prev[collection] as Entity[]).filter((r) => r.id !== id),
    } as Database));
  }, []);

  const replace = useCallback<StoreValue['replace']>((collection, records) => {
    setDb((prev) => ({ ...prev, [collection]: records } as Database));
  }, []);

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setDb((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const updateIntegrations = useCallback((patch: Partial<IntegrationSettings>) => {
    setDb((prev) => ({
      ...prev,
      integrations: {
        ...(prev.integrations || (seedDatabase().integrations as IntegrationSettings)),
        ...patch,
      } as IntegrationSettings,
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setDb(seedDatabase());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ db, loading, error, create, update, remove, replace, updateSettings, updateIntegrations, resetDemoData }),
    [db, loading, error, create, update, remove, replace, updateSettings, updateIntegrations, resetDemoData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>.');
  return ctx;
}
