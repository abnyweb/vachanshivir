import type { DataAdapter } from './adapters/types';
import { LocalDemoAdapter } from './adapters/LocalDemoAdapter';
import { ApiAdapter } from './adapters/ApiAdapter';

/**
 * Single place where the running data source is chosen. Everything else in the app is
 * adapter-agnostic. Set VITE_DATA_ADAPTER=api and VITE_API_BASE_URL to move off demo data.
 */
export function createDataAdapter(): DataAdapter {
  const mode = import.meta.env.VITE_DATA_ADAPTER ?? 'demo';
  if (mode === 'api') {
    return new ApiAdapter(import.meta.env.VITE_API_BASE_URL ?? '');
  }
  return new LocalDemoAdapter();
}

export const isDemoMode = (import.meta.env.VITE_DATA_ADAPTER ?? 'demo') !== 'api';
