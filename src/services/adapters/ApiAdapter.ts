import type { DataAdapter } from './types';
import { seedDatabase, type Database } from '../../store/database';

const STORAGE_KEY = 'vachanshivir.db.v5';

// Clear out legacy cache keys if present
try {
  localStorage.removeItem('vachanshivir.db.v4');
} catch {}

/**
 * Resilient API Adapter with seamless local fallback.
 * Checks for JSON content-type and falls back to local cache or seed data
 * if the backend is offline or serving SPA HTML fallback from static hosting.
 */
function mergeWithSeed(base: Database, incoming: Partial<Database>): Database {
  const merged = { ...base, ...incoming } as Database;

  // Always ensure critical collections are never clobbered with empty arrays
  if (!Array.isArray(incoming.events) || incoming.events.length === 0) {
    merged.events = base.events;
  }
  if (!Array.isArray(incoming.registrationCategories) || incoming.registrationCategories.length === 0) {
    merged.registrationCategories = base.registrationCategories;
  }
  if (!Array.isArray(incoming.speakers) || incoming.speakers.length === 0) {
    merged.speakers = base.speakers;
  }
  if (!Array.isArray(incoming.sessions) || incoming.sessions.length === 0) {
    merged.sessions = base.sessions;
  }
  if (!Array.isArray(incoming.faqs) || incoming.faqs.length === 0) {
    merged.faqs = base.faqs;
  }
  merged.settings = {
    ...base.settings,
    ...(incoming.settings || {}),
    currentEventId: incoming.settings?.currentEventId || base.settings?.currentEventId || 'evt-vachanshivir-2026',
  };

  if (Array.isArray(incoming.attendees) && incoming.attendees.length > 0) {
    merged.attendees = incoming.attendees;
  }
  if (Array.isArray(incoming.registrations) && incoming.registrations.length > 0) {
    merged.registrations = incoming.registrations;
  }
  if (Array.isArray(incoming.crmContacts) && incoming.crmContacts.length > 0) {
    merged.crmContacts = incoming.crmContacts;
  }
  if (Array.isArray(incoming.users) && incoming.users.length > 0) {
    // Merge users so seed admin accounts and participant accounts are both present
    const userMap = new Map<string, (typeof merged.users)[number]>();
    (base.users || []).forEach((u) => userMap.set(u.email.toLowerCase(), u));
    (incoming.users || []).forEach((u) => userMap.set(u.email.toLowerCase(), { ...(userMap.get(u.email.toLowerCase()) || {}), ...u }));
    merged.users = Array.from(userMap.values());
  }
  if (Array.isArray(incoming.eventParticipations) && incoming.eventParticipations.length > 0) {
    merged.eventParticipations = incoming.eventParticipations;
  }

  // Cross-synthesize: Ensure every registration has a matching attendee and crmContact entry
  const regList = merged.registrations || [];
  if (regList.length > 0) {
    const attList = [...(merged.attendees || [])];
    const crmList = [...(merged.crmContacts || [])];
    const attEmails = new Set(attList.map((a) => a.email?.toLowerCase()).filter(Boolean));
    const attRefs = new Set(attList.map((a) => a.reference).filter(Boolean));
    const crmEmails = new Set(crmList.map((c) => c.email?.toLowerCase()).filter(Boolean));

    regList.forEach((rRaw) => {
      const r = rRaw as any;
      const emailLower = (r.email || '').toLowerCase();
      if (!attEmails.has(emailLower) && !attRefs.has(r.reference)) {
        attList.push({
          id: r.id || `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          registrationId: r.id,
          reference: r.reference || `VS-${r.year || 2026}-REG`,
          legacyEntryId: r.legacyEntryId || r.customFields?.legacyEntryId || 0,
          entryId: r.entryId || r.legacyEntryId || 0,
          eventId: r.eventId || 'vs-2026',
          year: r.year || '2026',
          edition: r.edition || '2026',
          name: r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Delegate',
          email: r.email || '',
          phone: r.phone || '',
          city: r.city || '',
          state: r.state || '',
          country: r.country || 'India',
          churchName: r.churchName || r.customFields?.churchName || r.customFields?.church || r.customFields?.organisation || '',
          organisation: r.organisation || r.customFields?.organisation || '',
          designation: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          gender: r.gender || r.customFields?.gender || '',
          age: r.age || r.customFields?.age || null,
          categoryId: r.categoryId || 'full-delegate',
          paymentStatus: r.paymentStatus || 'unpaid',
          checkInStatus: r.checkInStatus || 'not-arrived',
          checkedInAt: null,
          badgeStatus: 'not-generated',
          roomingStatus: 'unassigned',
          roomId: null,
          attendanceIntention: r.attendanceIntention || 'NOT_VERIFIED',
          whatsappStatus: r.whatsappStatus || 'NOT_ADDED',
          isDemo: false,
        });
        if (emailLower) attEmails.add(emailLower);
        if (r.reference) attRefs.add(r.reference);
      }

      if (emailLower && !crmEmails.has(emailLower)) {
        crmList.push({
          id: `crm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          legacyEntryId: r.legacyEntryId || r.customFields?.legacyEntryId || 0,
          entryId: r.entryId || r.legacyEntryId || 0,
          contactType: 'pastor',
          lifecycle: r.paymentStatus === 'paid' ? 'attendee' : 'lead',
          firstName: r.firstName || '',
          lastName: r.lastName || '',
          fullName: r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim(),
          email: r.email || '',
          phone: r.phone || '',
          country: 'India',
          city: r.city || '',
          state: r.state || '',
          churchName: r.churchName || r.customFields?.churchName || r.customFields?.church || r.customFields?.organisation || '',
          churchDenomination: '',
          organisation: r.organisation || r.customFields?.organisation || '',
          role: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          designation: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          leadSource: 'Portal Registration',
          tags: r.paymentStatus === 'paid' ? ['VS-2026', 'REGISTERED_PAID', 'SHIVIR_2026'] : ['VS-2026', 'REGISTERED_UNPAID', 'PAYMENT_PENDING'],
          consent: true,
          notes: `Registered via portal. Payment Status: ${r.paymentStatus}. Amount: ${r.amount}`,
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        crmEmails.add(emailLower);
      }
    });

    merged.attendees = attList;
    merged.crmContacts = crmList;
  }

  return merged;
}

export class ApiAdapter implements DataAdapter {
  readonly name = 'api';
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl || '/api';
  }

  async load(): Promise<Database> {
    const url = `${this.baseUrl}/snapshot`;
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text) as Database;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {
            // ignore storage quota error
          }
          return mergeWithSeed(seedDatabase(), data);
        }
      }
    } catch (err) {
      console.warn(`API snapshot from ${url} unavailable, falling back to local store:`, err);
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return mergeWithSeed(seedDatabase(), JSON.parse(cached));
      }
    } catch {
      // ignore parse errors
    }

    return seedDatabase();
  }

  async persist(db: Database): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }

    const url = `${this.baseUrl}/sync`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
    } catch {
      // Backend offline, changes already cached locally
    }
  }
}

