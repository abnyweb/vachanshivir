import * as seed from '../data';
import type {
  AdminUser, Announcement, Attendee, AuditLog, CommunicationLog, Company, CRMActivity, CRMContact, Donation, Enquiry, EventDocument,
  EventEdition, EventParticipation, Exhibitor, Faq, GalleryAlbum, GalleryImage, HistoricalResource, IntegrationSettings,
  Lead, MediaAsset, Partner, Registration, RegistrationCategory, Room, RoomingGroup, SavedFilter, Session, SiteSettings, Speaker,
  Sponsor, Stall, SyncJob, WhatsAppGroupConfig,
} from '../types';

export interface Database {
  users: AdminUser[];
  communications: CommunicationLog[];
  events: EventEdition[];
  speakers: Speaker[];
  sessions: Session[];
  registrationCategories: RegistrationCategory[];
  registrations: Registration[];
  attendees: Attendee[];
  rooms: Room[];
  sponsors: Sponsor[];
  partners: Partner[];
  exhibitors: Exhibitor[];
  stalls: Stall[];
  galleryAlbums: GalleryAlbum[];
  galleryImages: GalleryImage[];
  enquiries: Enquiry[];
  documents: EventDocument[];
  announcements: Announcement[];
  faqs: Faq[];
  donations: Donation[];
  settings: SiteSettings;
  integrations?: IntegrationSettings;
  crmContacts: CRMContact[];
  crmCompanies: Company[];
  crmLeads: Lead[];
  crmActivities: CRMActivity[];
  eventParticipations: EventParticipation[];
  historicalResources: HistoricalResource[];
  mediaAssets: MediaAsset[];
  syncJobs: SyncJob[];
  auditLogs: AuditLog[];
  whatsappGroups: WhatsAppGroupConfig[];
  roomingGroups: RoomingGroup[];
  savedFilters: SavedFilter[];
}

export type Collection = Exclude<keyof Database, 'settings' | 'integrations'>;

export function seedDatabase(): Database {
  return structuredClone({
    users: [
      {
        id: 'usr_david',
        name: 'David',
        email: 'david.abnyweb@gmail.com',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '+91 96961 10134',
        authProvider: 'google',
        registeredAt: '2026-01-01T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'usr_msj',
        name: 'Marg Satya',
        email: 'enquirymsj@gmail.com',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '+91 98765 43210',
        authProvider: 'google',
        registeredAt: '2026-01-15T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'usr_ashish',
        name: 'Ashish',
        email: 'ashish@abny.in',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '+91 99887 76655',
        authProvider: 'google',
        registeredAt: '2026-01-10T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'usr_support_abny',
        name: 'Support ABNY',
        email: 'support@abny.in',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '+91 98111 22334',
        authProvider: 'google',
        registeredAt: '2026-02-01T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'usr_admin_vs',
        name: 'Vachan Shivir Administrator',
        email: 'admin@vachanshivir.in',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '+91 98000 11223',
        authProvider: 'google',
        registeredAt: '2026-01-01T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      },
    ],
    communications: [
      {
        id: 'comm_1',
        contactEmail: 'timothy@pastor.org',
        direction: 'outbound',
        subject: 'Vachan Shivir 2026 — Delegate Confirmation & Schedule',
        sender: 'enquirymsj@gmail.com',
        recipient: 'timothy@pastor.org',
        status: 'delivered',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'comm_2',
        contactEmail: 'timothy@pastor.org',
        direction: 'inbound',
        subject: 'Re: Vachan Shivir 2026 — Dietary Preference & Rooming',
        sender: 'timothy@pastor.org',
        recipient: 'enquirymsj@gmail.com',
        status: 'received',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    events: seed.events,
    speakers: seed.speakers,
    sessions: seed.sessions,
    registrationCategories: seed.registrationCategories,
    registrations: seed.registrations,
    attendees: seed.attendees,
    rooms: seed.rooms,
    sponsors: seed.sponsors,
    partners: seed.partners,
    exhibitors: seed.exhibitors,
    stalls: seed.stalls,
    galleryAlbums: seed.galleryAlbums,
    galleryImages: seed.galleryImages,
    enquiries: seed.enquiries,
    documents: seed.documents,
    announcements: seed.announcements,
    faqs: seed.faqs,
    settings: seed.siteSettings,
    integrations: {
      email: {
        connected: true,
        email: 'enquirymsj@gmail.com',
        provider: 'Google Workspace OAuth 2.0',
        clientId: '305428340271-8k799ruq6unmr1jsfuo29h03en2iufdt.apps.googleusercontent.com',
        clientSecret: '••••••••••••••••',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'enquirymsj@gmail.com',
        autoSyncCrm: true,
        syncFrequency: '15m',
        lastSyncAt: new Date().toISOString(),
        status: 'Connected & Authorized',
      },
      razorpay: {
        connected: true,
        keyId: 'rzp_live_Tfk3yh7AAwlNYr',
        keySecret: '41f2Hpr6EvHBYkf3UWPfqKRK',
        webhookSecret: 'whsec_vachan_shivir_2026_prod',
        mode: 'live',
        currency: 'INR',
        autoCapture: true,
        webhookUrl: 'https://vachanshivir.in/api/payments/razorpay/webhook',
        lastTestAt: new Date().toISOString(),
        status: 'Live Production Active',
      },
      whatsapp: {
        connected: true,
        provider: 'meta_cloud_api',
        phoneNumberId: '108429482910482',
        wabaId: '109283746192834',
        accessToken: 'EAAG...vachan_prod_token',
        displayPhone: '+91 96961 10134',
        groupInviteLink: 'https://chat.whatsapp.com/VachanShivir2026OfficialGroupLink',
        webhookVerifyToken: 'vachan_shivir_wa_verify_2026',
        autoSendRegConfirm: true,
        autoSendPaymentReceipt: true,
        lastSyncAt: new Date().toISOString(),
        status: 'Cloud API Active',
      },
      youtube: {
        connected: true,
        apiKey: 'AIzaSyC7z89x-VachanShivirDataApiKey2026',
        channelId: 'UC_SatyaVachanMinistry2026',
        channelTitle: 'Satya Vachan Church & Ministry',
        customHandle: '@SatyaVachan',
        liveStreamVideoId: 'dQw4w9WgXcQ',
        sermonsPlaylistId: 'PL_VS2026_EXPOSITORY_SERMONS',
        autoSyncVideos: true,
        embedOnPublicSite: true,
        subscriberCount: '12.4K Subscribers',
        videoCount: '184 Expository Sermons',
        lastSyncAt: new Date().toISOString(),
        status: 'Live Feed Connected',
      },
      instagram: {
        connected: true,
        accessToken: 'IGQVJ...longLivedUserToken2026',
        accountId: '17841400928374',
        username: '@vachanshivir',
        profileUrl: 'https://instagram.com/vachanshivir',
        autoSyncFeed: true,
        syncToGallery: true,
        postCount: 96,
        lastSyncAt: new Date().toISOString(),
        status: 'Graph API Connected',
      },
      sheets: {
        connected: true,
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        spreadsheetName: 'VS 2026 Master Data',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
        serviceAccountEmail: 'vachan-shivir-sync@vachan-shivir-2026.iam.gserviceaccount.com',
        autoSync: true,
        syncInterval: '15m',
        lastSyncAt: new Date().toISOString(),
        status: 'Auto-Sync Enabled',
      },
      zoom: {
        connected: false,
        accountId: '',
        clientId: '',
        clientSecret: '',
        defaultMeetingTopic: 'Vachan Shivir 2026 — Daily Expository Session',
        autoGenerateLinks: true,
        lastSyncAt: '',
        status: 'Ready to Configure',
      },
      storage: {
        connected: true,
        provider: 'aws_s3',
        bucketName: 'vachanshivir-127698679573-us-east-1-an',
        region: 'us-east-1',
        accessKey: '',
        secretKey: '',
        cdnUrl: 'https://vachanshivir-127698679573-us-east-1-an.s3.us-east-1.amazonaws.com',
        lastSyncAt: new Date().toISOString(),
        status: 'Active (us-east-1)',
      },
      sms: {
        connected: false,
        provider: 'fast2sms',
        apiKey: '',
        senderId: 'VCHNSV',
        dltEntityId: '1201159123456789012',
        autoSendOtp: true,
        lastSyncAt: '',
        status: 'Ready for DLT Credentials',
      },
    },
    crmContacts: seed.registrations.map((r) => ({
      id: `crm_${r.legacyEntryId || r.id}`,
      legacyEntryId: r.legacyEntryId,
      entryId: r.entryId,
      firstName: r.firstName,
      lastName: r.lastName,
      fullName: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      phone: r.phone,
      whatsapp: r.phone,
      age: r.age,
      country: r.country,
      state: r.state,
      city: r.city,
      churchName: r.organisation,
      churchDenomination: 'Non-Denominational',
      role: r.designation || 'Delegate',
      organisation: r.organisation,
      designation: r.designation || 'Delegate',
      contactType: 'delegate',
      lifecycle: Number(r.legacyEntryId) % 4 === 0 ? 'repeat-attendee' : 'attendee',
      leadSource: 'Vachan Shivir 2026 Online Portal',
      tags: Number(r.legacyEntryId) % 4 === 0 ? ['VS-2026', 'VS-2025', 'DELEGATE'] : ['VS-2026', 'DELEGATE'],
      consent: true,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    })),
    crmCompanies: [],
    crmLeads: [],
    crmActivities: [],
    eventParticipations: [],
    historicalResources: [],
    syncJobs: [],
    auditLogs: [],
    whatsappGroups: [
      {
        id: 'wa_group_2026',
        eventId: 'evt-vachanshivir-2026',
        groupName: 'Vachan Shivir 2026 Delegates Group',
        groupLink: 'https://chat.whatsapp.com/VachanShivir2026OfficialGroupLink',
        description: 'Official WhatsApp group for Vachan Shivir 2026 registered delegates.',
        purpose: 'Event updates, session alerts, announcements, and peer networking.',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-09-11T00:00:00.000Z',
      },
    ],
    roomingGroups: [],
    savedFilters: [
      {
        id: 'filter_paid_delegates',
        name: 'Paid Participants',
        isShared: true,
        criteria: { paymentStatus: 'paid' },
      },
      {
        id: 'filter_whatsapp_pending',
        name: 'WhatsApp Not Added',
        isShared: true,
        criteria: { whatsappStatus: 'NOT_ADDED' },
      },
      {
        id: 'filter_quadruple_sharing',
        name: 'Quadruple Sharing',
        isShared: true,
        criteria: { accommodationType: 'quadruple' },
      },
      {
        id: 'filter_checkin_pending',
        name: 'Check-in Pending',
        isShared: true,
        criteria: { physicalCheckIn: 'NOT_CHECKED_IN' },
      },
    ],
    mediaAssets: [
      {
        id: 'media_logo_primary',
        eventId: 'evt-vachanshivir-2026',
        title: 'Vachan Shivir Official Brand Logo',
        fileName: 'vachan-shivir-logo.png',
        url: '/assets/aipc-header-logo.png',
        category: 'SITE_LOGO',
        fileType: 'image/png',
        fileSize: '420 KB',
        dimensions: '1200 x 400',
        description: 'Main high-resolution emblem logo for website header and official documents.',
        isPrimarySiteLogo: true,
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'media_banner_2026',
        eventId: 'evt-vachanshivir-2026',
        title: 'Vachan Shivir 2026 Banner',
        fileName: 'vachan-shivir-banner.jpg',
        url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop',
        category: 'GRAPHIC',
        fileType: 'image/jpeg',
        fileSize: '2.4 MB',
        dimensions: '1920 x 1080',
        description: 'Primary visual graphic for website hero displays.',
        createdAt: '2026-01-15T12:00:00.000Z',
      },
    ],
    donations: [
      {
        id: 'dnt_seed_1',
        donorName: 'Anonymous Pastor Supporter',
        donorEmail: 'pastor.blessing@gmail.com',
        donorPhone: '+91 98450 12345',
        amount: 3000,
        currency: 'INR',
        paymentMode: 'razorpay',
        paymentStatus: 'paid',
        razorpayPaymentId: 'pay_P101928374',
        razorpayOrderId: 'order_O101928374',
        receiptNumber: 'VS26-DON-001',
        purpose: '1 पास्टर पास प्रायोजित करें (Sponsor 1 Rural Pastor)',
        notes: 'May the Lord bless Vachan Shivir 2026 conference delegates abundantly.',
        createdAt: '2026-03-01T11:30:00.000Z',
      },
    ],
  });
}
