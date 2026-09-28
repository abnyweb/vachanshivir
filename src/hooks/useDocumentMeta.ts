import { useEffect } from 'react';

function setTag(selector: string, create: () => HTMLElement, value: string) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  if (el instanceof HTMLMetaElement) el.content = value;
  else el.setAttribute('href', value);
}

/** Page title, description, canonical and OpenGraph tags without an extra dependency. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    const url = `${import.meta.env.VITE_SITE_URL ?? window.location.origin}${window.location.pathname}`;

    if (description) {
      setTag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), description);
      setTag('meta[property="og:description"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m; }, description);
    }
    setTag('meta[property="og:title"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m; }, title);
    setTag('meta[property="og:type"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:type'); return m; }, 'website');
    setTag('meta[property="og:url"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m; }, url);
    setTag('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }, url);
  }, [title, description]);
}
