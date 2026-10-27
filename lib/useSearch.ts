'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

const read = (): string => window.location.search;
// The static HTML cannot know the query: it renders with none, then the client reads it.
const readOnServer = (): string => '';

/** `location.search` as external state: empty in the exported HTML, real after hydration. */
export function useSearch(): string {
  return useSyncExternalStore(subscribe, read, readOnServer);
}
