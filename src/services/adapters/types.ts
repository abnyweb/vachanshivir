import type { Database } from '../../store/database';

/**
 * Every data source implements this one interface. The UI never talks to an adapter
 * directly — it goes through the services in src/services, which go through whichever
 * adapter is configured. Swapping demo data for a real backend is a one-line change in
 * src/services/dataSource.ts and requires no UI edits.
 */
export interface DataAdapter {
  readonly name: string;
  load(): Promise<Database>;
  persist(db: Database): Promise<void>;
}
