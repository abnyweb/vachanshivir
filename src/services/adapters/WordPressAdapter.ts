/**
 * Read-only adapter sketch for the live aipc.live WordPress installation.
 *
 * IMPORTANT: this platform must not write to the production site during the 2026 cycle.
 * Every method here is a read. Authentication uses a WordPress application password held
 * by a backend service — never in this frontend bundle.
 */
export interface WordPressPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
}

export class WordPressAdapter {
  readonly name = 'wordpress-read-only';
  private siteUrl: string;

  constructor(siteUrl: string) {
    this.siteUrl = siteUrl;
  }

  async listPages(): Promise<WordPressPage[]> {
    const res = await fetch(`${this.siteUrl}/wp-json/wp/v2/pages?per_page=100`);
    if (!res.ok) throw new Error(`WordPress pages request failed with ${res.status}`);
    return (await res.json()) as WordPressPage[];
  }
}
