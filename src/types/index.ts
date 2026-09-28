/** Shared domain model for the Vachan Shivir event management platform. */

export type ID = string;

export type PublishStatus = 'draft' | 'published' | 'archived';

export type EventEditionStatus = 'past' | 'current' | 'upcoming';

/** A Vachan Shivir edition. Nothing in the UI hard-codes a year; everything reads an Event. */
export interface EventEdition {
  id: ID;
  slug: string;
  name: string;
  edition: string;
  year: number;
  theme: string;
  themeScripture: string;
  themeBlurb: string;
  tagline: string;
  startDate: string;
  endDate: string;
  checkInTime: string;
  closeTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueMapUrl: string;
  organiser: string;
  organiserUrl: string;
  organiserBlurb: string;
  description: string;
  audience: string;
  languageNotice: string;
  eligibilityNotice: string;
  objectives: string[];
  highlights: { label: string; value: string }[];
  status: EventEditionStatus;
  heroImage: string;
}

export type SpeakerCategory = 'main-session' | 'panel' | 'workshop' | 'unannounced';

export interface Speaker {
  id: ID;
  eventId: ID;
  name: string;
  designation: string;
  organisation: string;
  country: string;
  bio: string;
  photo: string | null;
  topic: string;
  sessionId: ID | null;
  category: SpeakerCategory;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  displayOrder: number;
  status: PublishStatus;
}

export type SessionType =
  | 'keynote' | 'exposition' | 'panel' | 'workshop' | 'presentation'
  | 'networking' | 'worship' | 'meal' | 'break' | 'opening' | 'closing';

export interface Session {
  id: ID;
  eventId: ID;
  day: number;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  type: SessionType;
  speakerId: ID | null;
  room: string;
  description: string;
  displayOrder: number;
  status: PublishStatus;
}

export interface RegistrationCategory {
  id: ID;
  eventId: ID;
  name: string;
  description: string;
  price: number;
  currency: string;
  taxPercent: number;
  taxNote: string;
  validFrom: string;
  validUntil: string;
  benefits: string[];
  sharingType: SharingType;
  maxGuests: number | null;
  active: boolean;
  displayOrder: number;
}

export type SharingType = 'quadruple' | 'triple' | 'double' | 'single' | 'day-scholar';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';
export type RegistrationStatus = 'draft' | 'submitted' | 'confirmed' | 'cancelled';

export type AttendanceIntentionStatus = 'NOT_VERIFIED' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE' | 'UNKNOWN';
export type WhatsAppStatus = 'NOT_ADDED' | 'INVITED' | 'ADDED' | 'DECLINED' | 'NOT_REQUIRED';
export type RoomingStatusDetailed = 'NOT_REQUIRED' | 'PENDING' | 'SUGGESTED' | 'ASSIGNED' | 'CONFIRMED';
export type PhysicalAttendanceStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN';

export interface Registration {
  id: ID;
  reference: string;
  legacyEntryId?: string | number;
  entryId?: string | number;
  sourceSerialNumber?: number;
  eventId: ID;
  contactId?: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number | null;
  organisation: string;
  designation: string;
  city: string;
  state: string;
  country: string;
  categoryId: ID;
  addOns: string[];
  amount: number;
  tax: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  notes: string;
  createdAt: string;
  isDemo: boolean;
  transactionId?: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
  paymentDate?: string;

  // --- Vachan Shivir 2026 Registration Form (18 Questions) ---
  fullName?: string;
  houseNumber?: string;
  streetAddress?: string;
  landmark?: string;
  postalCode?: string;
  isUnmarried?: 'हाँ' | 'नहीं' | string;
  testimony?: string;
  hasDietaryRestrictions?: 'हाँ' | 'नहीं' | string;
  dietaryDetails?: string;
  educationQualification?: string;
  otherEducation?: string;
  churchName?: string;
  churchRole?: string;
  otherChurchRole?: string;
  preachFrequency?: string;
  trainingExpectations?: string;
  specialNeeds?: string;
  otherInfo?: string;
}

export type CheckInStatus = 'not-arrived' | 'checked-in' | 'no-show';
export type BadgeStatus = 'not-generated' | 'generated' | 'printed' | 'collected';
export type RoomingStatus = 'unassigned' | 'assigned' | 'checked-in' | 'checked-out';

export interface AttendeeTimelineItem {
  id: ID;
  title: string;
  detail: string;
  timestamp: string;
  actor: string;
}

export interface Attendee {
  id: ID;
  registrationId: ID;
  contactId?: ID;
  reference: string;
  legacyEntryId?: string | number;
  entryId?: string | number;
  sourceSerialNumber?: number;
  eventId: ID;
  year?: string;
  edition?: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  designation: string;
  churchName?: string;
  churchDenomination?: string;
  role?: string;
  age?: number | null;
  gender?: string;
  city: string;
  state: string;
  country: string;
  categoryId: ID;
  paymentStatus: PaymentStatus;
  registrationStatus?: RegistrationStatus;
  checkInStatus: CheckInStatus;
  physicalCheckIn?: PhysicalAttendanceStatus;
  checkedInAt: string | null;
  badgeStatus: BadgeStatus;
  roomingStatus: RoomingStatus;
  roomingStatusDetailed?: RoomingStatusDetailed;
  roomId: ID | null;
  roomingGroup?: ID | null;
  roommatePreference?: {
    preferenceType: 'SAME_CITY' | 'SAME_CHURCH' | 'NO_PREFERENCE' | 'SPECIFIC_PERSON' | 'DO_NOT_ASSIGN';
    preferredPersonName?: string;
    agreementStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  };
  attendanceIntention?: AttendanceIntentionStatus;
  whatsappStatus?: WhatsAppStatus;
  checkinToken?: string;
  invitedAt?: string | null;
  invitedBy?: string | null;
  addedAt?: string | null;
  addedBy?: string | null;
  declinedAt?: string | null;
  attendanceVerifiedBy?: string | null;
  attendanceVerifiedAt?: string | null;
  attendanceNote?: string;
  assignedManagerId?: ID | null;
  assignedManagerName?: string | null;
  checkedInBy?: string | null;
  checkedInMethod?: 'QR' | 'MANUAL';
  checkinCorrection?: { reason: string; undoneBy: string; undoneAt: string };
  timeline?: AttendeeTimelineItem[];
  isDemo: boolean;

  // --- Vachan Shivir 2026 Registration Form (18 Questions) ---
  fullName?: string;
  houseNumber?: string;
  streetAddress?: string;
  landmark?: string;
  postalCode?: string;
  isUnmarried?: 'हाँ' | 'नहीं' | string;
  testimony?: string;
  hasDietaryRestrictions?: 'हाँ' | 'नहीं' | string;
  dietaryDetails?: string;
  educationQualification?: string;
  otherEducation?: string;
  otherChurchRole?: string;
  preachFrequency?: string;
  trainingExpectations?: string;
  specialNeeds?: string;
  otherInfo?: string;
}

export interface WhatsAppGroupConfig {
  id: ID;
  eventId: ID;
  groupName: string;
  groupLink: string;
  description: string;
  purpose: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomingGroup {
  id: ID;
  eventId: ID;
  roomNumber: string;
  block?: string;
  accommodationType: SharingType;
  capacity: number;
  participantIds: ID[];
  status: 'PENDING' | 'SUGGESTED' | 'CONFIRMED';
  notes?: string;
  createdAt: string;
}

export interface SavedFilter {
  id: ID;
  name: string;
  userId?: ID;
  isShared: boolean;
  criteria: Record<string, unknown>;
}

export interface Room {
  id: ID;
  eventId: ID;
  number: string;
  block: string;
  sharingType: SharingType;
  capacity: number;
  checkIn: string;
  checkOut: string;
  status: 'available' | 'partial' | 'full' | 'blocked';
  isDemo: boolean;
}

export type SponsorTier = 'principal' | 'gold' | 'silver' | 'supporting';

export interface Sponsor {
  id: ID;
  eventId: ID;
  name: string;
  logo: string | null;
  tier: SponsorTier;
  description: string;
  website: string;
  displayOrder: number;
  active: boolean;
  isDemo: boolean;
}

export type PartnerCategory = 'organiser' | 'ministry' | 'publishing' | 'association' | 'media' | 'strategic' | 'supporting';

export interface Partner {
  id: ID;
  eventId: ID;
  name: string;
  logo: string | null;
  category: PartnerCategory;
  description: string;
  website: string;
  displayOrder: number;
  active: boolean;
  isDemo: boolean;
}

export type ExhibitorStatus = 'enquiry' | 'approved' | 'confirmed' | 'cancelled';

export interface Exhibitor {
  id: ID;
  eventId: ID;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  category: string;
  description: string;
  logo: string | null;
  stallId: ID | null;
  status: ExhibitorStatus;
  paymentStatus: PaymentStatus;
  isDemo: boolean;
}

export type StallStatus = 'available' | 'held' | 'reserved' | 'confirmed' | 'paid' | 'blocked';

export interface Stall {
  id: ID;
  eventId: ID;
  number: string;
  size: string;
  type: string;
  price: number;
  currency: string;
  zone: string;
  row: number;
  column: number;
  exhibitorId: ID | null;
  status: StallStatus;
  facilities: string[];
  isDemo: boolean;
}

export interface GalleryAlbum {
  id: ID;
  eventId: ID;
  title: string;
  category: string;
  year: number;
  coverImage: string | null;
  displayOrder: number;
  status: PublishStatus;
}

export interface GalleryImage {
  id: ID;
  albumId: ID;
  src: string | null;
  s3Url?: string;
  caption: string;
  alt: string;
  displayOrder: number;
  /** True when the source file could not be retrieved and must be supplied by Vachan Shivir. */
  pendingAsset: boolean;
  createdAt?: string;
}

export type EnquiryKind = 'contact' | 'speaker-application' | 'sponsor' | 'exhibitor' | 'stall';
export type EnquiryStatus = 'new' | 'in-progress' | 'resolved' | 'closed';

export interface Enquiry {
  id: ID;
  reference: string;
  eventId: ID;
  kind: EnquiryKind;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  subject: string;
  message: string;
  meta: Record<string, string>;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
  isDemo: boolean;
}

export interface EventDocument {
  id: ID;
  eventId: ID;
  title: string;
  description: string;
  category: string;
  file: string | null;
  date: string;
  status: PublishStatus;
  pendingAsset: boolean;
}

export interface Announcement {
  id: ID;
  eventId: ID;
  title: string;
  body: string;
  kind: 'general' | 'registration' | 'programme' | 'venue' | 'notice';
  active: boolean;
  date: string;
}

export interface Faq {
  id: ID;
  eventId: ID;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  status: PublishStatus;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhones: string[];
  whatsapp: string;
  address: string;
  social: { label: string; url: string }[];
  currentEventId: ID;
  registrationOpen: boolean;
  registrationExternalUrl: string;
}

export type AdminRole =
  | 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'REGISTRATION_ADMIN' | 'PAYMENT_ADMIN'
  | 'CRM_ADMIN' | 'EXHIBITION_ADMIN' | 'CONTENT_ADMIN' | 'CHECKIN_ADMIN' | 'RESOURCE_ADMIN'
  | 'EVENT_MANAGER' | 'CHECKIN_MANAGER' | 'PARTICIPANT';

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status?: 'ACTIVE' | 'INACTIVE';
  picture?: string | null;
  authProvider?: 'google' | 'email';
  permissions?: string[];
  registrationId?: string;
  crmContactId?: string;
  registeredAt?: string;
  lastLogin?: string;
}

export type CRMLifecycle = 'subscriber' | 'lead' | 'applicant' | 'attendee' | 'repeat-attendee' | 'vip' | 'alumni';

export interface CRMContact {
  id: ID;
  userId?: string;
  legacyEntryId?: string | number;
  entryId?: string | number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  age?: number | null;
  gender?: string;
  country: string;
  state: string;
  city: string;
  address?: string;
  churchName: string;
  churchDenomination: string;
  role: string;
  organisation: string;
  designation: string;
  website?: string;
  linkedin?: string;
  contactType: 'pastor' | 'delegate' | 'speaker' | 'sponsor' | 'exhibitor' | 'partner' | 'vendor';
  lifecycle: CRMLifecycle;
  leadSource: string;
  owner?: string;
  tags: string[];
  consent: boolean;
  marketingConsent?: boolean;
  subscriptionStatus?: 'subscribed' | 'unsubscribed' | 'pending';
  consentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: ID;
  contactEmail: string;
  direction: 'inbound' | 'outbound';
  subject: string;
  sender: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'received' | 'opened';
  date: string;
}

export interface IntegrationEmailConfig {
  connected: boolean;
  email: string;
  provider: string;
  clientId?: string;
  clientSecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  autoSyncCrm?: boolean;
  syncFrequency?: 'realtime' | '15m' | '1h' | 'daily' | 'manual';
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationRazorpayConfig {
  connected: boolean;
  keyId: string;
  keySecret?: string;
  webhookSecret?: string;
  mode: 'test' | 'live';
  currency: string;
  autoCapture: boolean;
  webhookUrl: string;
  lastTestAt?: string;
  status: string;
}

export interface IntegrationWhatsAppConfig {
  connected: boolean;
  provider: 'meta_cloud_api' | 'twilio' | 'whatsapp_web';
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  displayPhone: string;
  groupInviteLink: string;
  webhookVerifyToken?: string;
  autoSendRegConfirm?: boolean;
  autoSendPaymentReceipt?: boolean;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationYouTubeConfig {
  connected: boolean;
  apiKey: string;
  channelId: string;
  channelTitle?: string;
  customHandle?: string;
  liveStreamVideoId?: string;
  sermonsPlaylistId?: string;
  autoSyncVideos?: boolean;
  embedOnPublicSite?: boolean;
  subscriberCount?: string;
  videoCount?: string;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationInstagramConfig {
  connected: boolean;
  accessToken: string;
  accountId: string;
  username: string;
  profileUrl: string;
  autoSyncFeed?: boolean;
  syncToGallery?: boolean;
  postCount?: number;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationGoogleSheetsConfig {
  connected: boolean;
  spreadsheetId?: string;
  spreadsheetName: string;
  spreadsheetUrl?: string;
  serviceAccountEmail?: string;
  autoSync?: boolean;
  syncInterval?: '5m' | '15m' | '1h' | 'manual';
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationZoomConfig {
  connected: boolean;
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
  defaultMeetingTopic?: string;
  autoGenerateLinks?: boolean;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationStorageConfig {
  connected: boolean;
  provider?: 'aws_s3' | 'google_cloud_storage' | 'cloudflare_r2';
  bucketName?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  cdnUrl?: string;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationSmsConfig {
  connected: boolean;
  provider?: 'fast2sms' | 'msg91' | 'twilio';
  apiKey?: string;
  senderId?: string;
  dltEntityId?: string;
  autoSendOtp?: boolean;
  lastSyncAt?: string;
  status: string;
}

export interface IntegrationSettings {
  email: IntegrationEmailConfig;
  razorpay: IntegrationRazorpayConfig;
  whatsapp: IntegrationWhatsAppConfig;
  youtube: IntegrationYouTubeConfig;
  instagram: IntegrationInstagramConfig;
  sheets: IntegrationGoogleSheetsConfig;
  zoom?: IntegrationZoomConfig;
  storage?: IntegrationStorageConfig;
  sms?: IntegrationSmsConfig;
}

export interface Company {
  id: ID;
  name: string;
  website?: string;
  industry?: string;
  country: string;
  state?: string;
  city: string;
  address?: string;
  gstVat?: string;
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  createdAt: string;
}

export type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'NURTURE';

export interface Lead {
  id: ID;
  title: string;
  source: string;
  stage: LeadStage;
  owner: string;
  potentialValue: number;
  currency: string;
  notes: string;
  followUpDate?: string;
  eventId?: ID;
  contactId?: ID;
  companyId?: ID;
  createdAt: string;
}

export type CRMActivityType =
  | 'registration' | 'payment' | 'payment_failed' | 'check_in'
  | 'email' | 'whatsapp' | 'speaker_application' | 'sponsor_enquiry'
  | 'exhibitor_enquiry' | 'stall_booking' | 'call' | 'meeting' | 'note' | 'document_sent';

export interface CRMActivity {
  id: ID;
  contactId: ID;
  eventId?: ID;
  type: CRMActivityType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface EventParticipation {
  id: ID;
  contactId: ID;
  eventId: ID;
  eventYear: number;
  eventName: string;
  registrationId: ID;
  reference: string;
  role: string;
  categoryName: string;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  attended: boolean;
  checkedInAt?: string | null;
  createdAt: string;
}

export type ResourceCategory =
  | 'BROCHURE' | 'PROGRAMME' | 'AGENDA' | 'SPEAKER_RESOURCE'
  | 'SPONSOR_RESOURCE' | 'EXHIBITOR_RESOURCE' | 'FLOOR_PLAN'
  | 'GALLERY' | 'PHOTO' | 'VIDEO' | 'REPORT' | 'PRESS_RELEASE'
  | 'CERTIFICATE' | 'VENUE' | 'TRAVEL' | 'ACCOMMODATION' | 'DOCUMENT' | 'OTHER';

export type ResourceVisibility = 'PUBLIC' | 'ADMIN_ONLY' | 'ARCHIVED' | 'DRAFT';

export interface HistoricalResource {
  id: ID;
  eventId: ID;
  eventYear: number;
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  fileSize?: string;
  visibility: ResourceVisibility;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncJob {
  id: ID;
  target: 'google_sheets' | 'email' | 'webhook';
  action: 'registration_sync' | 'attendee_sync' | 'payment_sync';
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string | null;
  retryCount: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: ID;
  userId?: ID;
  userName?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DuplicateReviewItem {
  id: ID;
  legacyEntryId: number | string;
  rowNumber: number;
  email: string;
  name: string;
  phone?: string;
  churchName?: string;
  previousMatch: {
    legacyEntryId: number | string;
    rowNumber: number;
    name: string;
    email: string;
    churchName?: string;
  };
  status: 'PENDING_REVIEW' | 'MERGED' | 'KEPT_SEPARATE' | 'IGNORED';
  notes?: string;
}

export interface ReconciliationReport {
  totalSourceRows: number;
  expectedRegistrations: number;
  importedRegistrations: number;
  skippedRegistrations: number;
  errorsCount: number;
  paymentBreakdown: {
    expectedDone: number;
    actualDone: number;
    expectedPending: number;
    actualPending: number;
    matches: boolean;
  };
  accommodationBreakdown: {
    expectedQuadruple: number;
    actualQuadruple: number;
    expectedTriple: number;
    actualTriple: number;
    expectedDouble: number;
    actualDouble: number;
    expectedDayScholar: number;
    actualDayScholar: number;
    matches: boolean;
  };
  crmMetrics: {
    newContactsCreated: number;
    existingContactsMatched: number;
    duplicateEmailsFlagged: number;
  };
  discrepancies: Array<{
    type: string;
    rowNumber: number;
    legacyEntryId: number | string;
    field: string;
    message: string;
  }>;
}

export interface MigrationBatch {
  id: ID;
  batchName: string;
  fileName: string;
  sheetName: string;
  eventId: ID;
  eventEdition: string;
  importedAt: string;
  importedBy: string;
  totalSourceRows: number;
  successfulRows: number;
  failedRows: number;
  duplicateRows: number;
  status: 'DRY_RUN' | 'COMMITTED' | 'FAILED';
  reconciliation: ReconciliationReport;
  duplicateReviews: DuplicateReviewItem[];
}

export interface HealthyChurchRecord {
  id: ID;
  serialNumber: number;
  churchName: string;
  city: string;
  state: string;
  language: string;
  leadPastor: string;
  callingNotes: string;
  status: 'NEW' | 'CONTACTED' | 'REGISTERED' | 'NURTURE';
  createdAt: string;
}

export type MediaAssetCategory =
  | 'SITE_LOGO'
  | 'SPONSOR_LOGO'
  | 'PARTNER_LOGO'
  | 'GRAPHIC'
  | 'DOCUMENT'
  | 'PHOTO';

export interface MediaAsset {
  id: ID;
  eventId?: ID;
  title: string;
  fileName: string;
  url: string;
  category: MediaAssetCategory;
  fileType: string;
  fileSize?: string;
  dimensions?: string;
  description?: string;
  associatedEntityName?: string;
  isPrimarySiteLogo?: boolean;
  createdAt: string;
}

export type DonationPaymentMode = 'razorpay' | 'direct_bank' | 'upi' | 'cash' | 'other';
export type DonationPaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Donation {
  id: ID;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  currency: string;
  paymentMode: DonationPaymentMode;
  paymentStatus: DonationPaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  receiptNumber: string;
  purpose: string;
  notes?: string;
  bankDetails?: {
    bankName?: string;
    utrNumber?: string;
    accountNumber?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
  verifiedBy?: string;
}

export interface TrafficLog {
  id: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  userAgent: string;
  referrer: string;
  timestamp: string;
  country?: string;
  city?: string;
  responseTimeMs?: number;
  threatLevel?: 'safe' | 'suspicious' | 'blocked';
  notes?: string;
}

