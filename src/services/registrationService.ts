import type { Database } from '../store/database';
import type { Attendee, Registration } from '../types';
import { registrationReference, uid } from '../utils/ids';

export const listRegistrations = (db: Database, eventId: string): Registration[] =>
  db.registrations
    .filter((r) => r.eventId === eventId)
    .sort((a, b) => {
      const dateA = a?.createdAt || (a as unknown as Record<string, unknown>)?.registeredAt as string || (a as unknown as Record<string, unknown>)?.importedAt as string || '';
      const dateB = b?.createdAt || (b as unknown as Record<string, unknown>)?.registeredAt as string || (b as unknown as Record<string, unknown>)?.importedAt as string || '';
      return dateB.localeCompare(dateA);
    });

export function nextReference(db: Database, year: number): string {
  const used = db.registrations
    .map((r) => Number(r.reference.split('-')[1]))
    .filter((n) => Number.isFinite(n));
  return registrationReference(year, (used.length ? Math.max(...used) : 0) + 1);
}

export interface RegistrationDraft {
  // SECTION 1 — व्यक्तिगत जानकारी (Personal Information)
  fullName: string;
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  phone: string;
  houseNumber: string;
  streetAddress: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // SECTION 2 — पारिवारिक जानकारी (Family Information)
  isUnmarried: 'हाँ' | 'नहीं' | '';

  // SECTION 3 — व्यक्तिगत एवं आत्मिक जानकारी (Personal & Spiritual Information)
  testimony: string;

  // SECTION 4 — भोजन संबंधी जानकारी (Dietary Information)
  hasDietaryRestrictions: 'हाँ' | 'नहीं' | '';
  dietaryDetails: string;

  // SECTION 5 — शिक्षा संबंधी जानकारी (Educational Information)
  educationQualification: string;
  otherEducation: string;

  // SECTION 6 — कलीसिया एवं सेवकाई की जानकारी (Church & Ministry Information)
  churchName: string;
  churchRole: string;
  otherChurchRole: string;
  preachFrequency: string;

  // SECTION 7 — प्रशिक्षण से संबंधित जानकारी (Training Information)
  trainingExpectations: string;

  // SECTION 8 — अतिरिक्त जानकारी (Additional Information)
  specialNeeds: string;
  otherInfo: string;

  // Package & Platform fields
  categoryId: string;
  organisation: string;
  designation: string;
  addOns: string[];
  notes: string;
}

export const emptyDraft: RegistrationDraft = {
  fullName: '',
  firstName: '',
  lastName: '',
  age: '',
  email: '',
  phone: '',
  houseNumber: '',
  streetAddress: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',

  isUnmarried: '',
  testimony: '',
  hasDietaryRestrictions: 'नहीं',
  dietaryDetails: '',
  educationQualification: '',
  otherEducation: '',
  churchName: '',
  churchRole: '',
  otherChurchRole: '',
  preachFrequency: '',
  trainingExpectations: '',
  specialNeeds: '',
  otherInfo: '',

  categoryId: '',
  organisation: '',
  designation: '',
  addOns: [],
  notes: '',
};

export function buildRegistration(
  draft: RegistrationDraft,
  eventId: string,
  reference: string,
  amount: number,
  tax: number,
): Registration {
  const parts = draft.fullName.trim().split(/\s+/);
  const firstName = draft.firstName.trim() || parts[0] || 'Delegate';
  const lastName = draft.lastName.trim() || parts.slice(1).join(' ') || '';

  return {
    id: uid('reg'),
    reference,
    eventId,
    firstName,
    lastName,
    fullName: draft.fullName.trim() || `${firstName} ${lastName}`.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    age: draft.age ? Number(draft.age) : null,
    organisation: draft.churchName.trim() || draft.organisation.trim(),
    designation: draft.churchRole.trim() || draft.designation.trim() || 'Delegate',
    houseNumber: draft.houseNumber.trim(),
    streetAddress: draft.streetAddress.trim(),
    landmark: draft.landmark.trim(),
    city: draft.city.trim(),
    state: draft.state.trim(),
    postalCode: draft.postalCode.trim(),
    country: draft.country || 'India',

    isUnmarried: draft.isUnmarried,
    testimony: draft.testimony.trim(),
    hasDietaryRestrictions: draft.hasDietaryRestrictions,
    dietaryDetails: draft.dietaryDetails.trim(),
    educationQualification: draft.educationQualification,
    otherEducation: draft.otherEducation.trim(),
    churchName: draft.churchName.trim(),
    churchRole: draft.churchRole,
    otherChurchRole: draft.otherChurchRole.trim(),
    preachFrequency: draft.preachFrequency.trim(),
    trainingExpectations: draft.trainingExpectations.trim(),
    specialNeeds: draft.specialNeeds.trim(),
    otherInfo: draft.otherInfo.trim(),

    categoryId: draft.categoryId,
    addOns: draft.addOns,
    amount,
    tax,
    total: amount + tax,
    currency: 'INR',
    paymentStatus: 'unpaid',
    status: 'submitted',
    notes: draft.notes.trim(),
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
}

export function buildAttendee(registration: Registration): Attendee {
  return {
    id: uid('att'),
    registrationId: registration.id,
    reference: registration.reference,
    legacyEntryId: registration.legacyEntryId || registration.entryId,
    entryId: registration.entryId || registration.legacyEntryId,
    eventId: registration.eventId,
    name: registration.fullName || `${registration.firstName} ${registration.lastName}`.trim(),
    fullName: registration.fullName || `${registration.firstName} ${registration.lastName}`.trim(),
    email: registration.email,
    phone: registration.phone,
    age: registration.age,
    organisation: registration.organisation || registration.churchName || '',
    designation: registration.designation || registration.churchRole || '',
    churchName: registration.churchName || registration.organisation || '',
    role: registration.churchRole || registration.designation || '',
    city: registration.city,
    state: registration.state,
    country: registration.country,
    houseNumber: registration.houseNumber,
    streetAddress: registration.streetAddress,
    landmark: registration.landmark,
    postalCode: registration.postalCode,

    isUnmarried: registration.isUnmarried,
    testimony: registration.testimony,
    hasDietaryRestrictions: registration.hasDietaryRestrictions,
    dietaryDetails: registration.dietaryDetails,
    educationQualification: registration.educationQualification,
    otherEducation: registration.otherEducation,
    otherChurchRole: registration.otherChurchRole,
    preachFrequency: registration.preachFrequency,
    trainingExpectations: registration.trainingExpectations,
    specialNeeds: registration.specialNeeds,
    otherInfo: registration.otherInfo,

    categoryId: registration.categoryId,
    paymentStatus: registration.paymentStatus,
    checkInStatus: 'not-arrived',
    checkedInAt: null,
    badgeStatus: 'not-generated',
    roomingStatus: 'unassigned',
    roomId: null,
    isDemo: registration.isDemo,
  };
}

export interface FieldErrors { [key: string]: string }

export function validateParticipant(draft: RegistrationDraft): FieldErrors {
  const errors: FieldErrors = {};

  // SECTION 2A: व्यक्तिगत जानकारी (Required: Q8, Q9, Q10, Q11, Q12)
  const name = (draft.fullName || `${draft.firstName} ${draft.lastName}`).trim();
  if (!name) errors.fullName = 'कृपया अपना पूरा नाम लिखें (Q8. Enter full name)';

  const age = Number(draft.age);
  if (!draft.age || Number.isNaN(age) || age < 18) {
    errors.age = 'कृपया अपनी वैध आयु लिखें (Q9. न्यूनतम 18 वर्ष)';
  }

  if (!draft.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = 'कृपया एक मान्य ईमेल आईडी लिखें (Q10. Enter valid email)';
  }

  // 11. फ़ोन नंबर: +91 के बाद ठीक 10 अंकों का भारतीय मोबाइल नंबर
  const rawPhoneDigits = (draft.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '');
  const tenDigitPhone = rawPhoneDigits.length > 10 && rawPhoneDigits.startsWith('91')
    ? rawPhoneDigits.slice(2, 12)
    : rawPhoneDigits.slice(0, 10);

  if (!tenDigitPhone || tenDigitPhone.length !== 10) {
    errors.phone = 'कृपया +91 के बाद ठीक 10 अंकों का मोबाइल नंबर लिखें (Q11. Exactly 10 digits after +91)';
  } else if (!/^[6-9]\d{9}$/.test(tenDigitPhone)) {
    errors.phone = 'कृपया मान्य भारतीय मोबाइल नंबर लिखें (6, 7, 8, या 9 से शुरू होने वाले 10 अंक)';
  }

  // 12. पूरा पता: पिन कोड (6 अंक), शहर और राज्य
  const cleanPin = (draft.postalCode || '').replace(/\D/g, '');
  if (!cleanPin || cleanPin.length !== 6) {
    errors.postalCode = 'कृपया 6 अंकों का मान्य भारतीय पिन कोड दर्ज करें (Q12. Valid 6-digit PIN code)';
  }
  if (!draft.city.trim()) errors.city = 'कृपया शहर / ज़िला लिखें (Q12. Enter city/district)';
  if (!draft.state.trim()) errors.state = 'कृपया राज्य लिखें (Q12. Enter state)';

  // SECTION 2B: पारिवारिक जानकारी (Required: Q13)
  if (!draft.isUnmarried) {
    errors.isUnmarried = 'कृपया चुनें कि क्या आप अविवाहित हैं (Q13. Select Yes/No)';
  }

  // SECTION 2C: व्यक्तिगत एवं आत्मिक जानकारी (Required: Q14)
  if (!draft.testimony.trim()) {
    errors.testimony = 'कृपया अपनी गवाही संक्षेप में लिखें (Q14. Please write your testimony)';
  } else if (draft.testimony.trim().length < 15) {
    errors.testimony = 'कृपया अपनी गवाही में कम से कम कुछ वाक्य लिखें (Q14. Minimum 15 characters)';
  }

  // SECTION 2D: भोजन संबंधी जानकारी (Required: Q15, Conditional: Q16)
  if (!draft.hasDietaryRestrictions) {
    errors.hasDietaryRestrictions = 'कृपया चुनें कि क्या आपको भोजन में कोई परहेज़ है (Q15. Select Yes/No)';
  }
  if (draft.hasDietaryRestrictions === 'हाँ' && !draft.dietaryDetails.trim()) {
    errors.dietaryDetails = 'कृपया अपने खाने के परहेज़ का विवरण दें (Q16. Detail your dietary restriction)';
  }

  // SECTION 2E: शिक्षा संबंधी जानकारी (Required: Q17)
  if (!draft.educationQualification) {
    errors.educationQualification = 'कृपया अपनी शैक्षणिक योग्यता चुनें (Q17. Select qualification)';
  }
  if (draft.educationQualification === 'अन्य' && !draft.otherEducation.trim()) {
    errors.otherEducation = 'कृपया अपनी शैक्षणिक योग्यता का विवरण लिखें (Q18. Specify qualification)';
  }

  // SECTION 2F: कलीसिया एवं सेवकाई की जानकारी (Required: Q19, Q20, Q22)
  if (!draft.churchName.trim()) {
    errors.churchName = 'अपनी कलीसिया का नाम लिखें (Q19. Enter church name)';
  }
  if (!draft.churchRole) {
    errors.churchRole = 'कलीसिया में अपनी भूमिका चुनें (Q20. Select church role)';
  }
  if (draft.churchRole === 'अन्य' && !draft.otherChurchRole.trim()) {
    errors.otherChurchRole = 'कृपया अपनी भूमिका का विवरण लिखें (Q21. Specify role)';
  }
  if (!draft.preachFrequency.trim()) {
    errors.preachFrequency = 'कलीसिया में प्रचार करने की आवृत्ति लिखें (Q22. e.g. हर रविवार / महीने में 2 बार)';
  }

  // SECTION 2G: प्रशिक्षण से संबंधित जानकारी (Required: Q23)
  if (!draft.trainingExpectations.trim()) {
    errors.trainingExpectations = 'इस प्रशिक्षण से अपनी अपेक्षाएँ लिखें (Q23. What you hope to learn)';
  }

  // SECTION 2H: अतिरिक्त जानकारी (Q24, Q25 are Optional as per guidelines)

  return errors;
}
