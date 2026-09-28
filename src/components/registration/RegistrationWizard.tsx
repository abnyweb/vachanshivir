import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  Heart,
  BookOpen,
  Utensils,
  GraduationCap,
  Church,
  HelpCircle,
  FileText,
  MapPin,
  QrCode,
} from 'lucide-react';
import { Stepper } from './Stepper';
import { Button } from '../common/Button';
import { RazorpayPayButton } from '../common/RazorpayPayButton';
import { RegistrationRulesSidebar } from './RegistrationRulesSidebar';
import { lookupIndianPincode } from '../../utils/pincode';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { listActiveCategories, getCategory, priceBreakdown } from '../../services/pricingService';
import { registrationCategories as defaultCategories } from '../../data/pricing';
import {
  buildAttendee,
  buildRegistration,
  emptyDraft,
  nextReference,
  validateParticipant,
  type FieldErrors,
  type RegistrationDraft,
} from '../../services/registrationService';
import { inr } from '../../utils/format';
import { syncRegistrationToCRM } from '../../services/crmService';
import type { Attendee, Registration } from '../../types';

const STEPS = [
  '1. व्यक्तिगत जानकारी (Personal)',
  '2. सेवकाई व कलीसिया (Ministry)',
  '3. आवास एवं अपेक्षाएँ (Stay & Goals)',
  '4. समीक्षा व पुष्टि (Review & Submit)',
];

async function registerViaApi(
  draft: RegistrationDraft,
  eventId: string,
  pricing?: { amount: number; tax: number; total: number }
): Promise<{ status: string; registration?: Registration; attendee?: Attendee; error?: string }> {
  try {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        eventId,
        amount: pricing?.amount ?? 0,
        tax: pricing?.tax ?? 0,
        total: pricing?.total ?? 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { status: 'error', error: data.error || 'Server error' };
    }
    return {
      status: 'success',
      registration: data.registration || data,
      attendee: data.attendee,
    };
  } catch (err) {
    return { status: 'offline' };
  }
}

export function RegistrationWizard() {
  const { db, create, update } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  const rawCategories = useMemo(() => listActiveCategories(db, event?.id), [db, event?.id]);
  const categories = useMemo(() => {
    return rawCategories.length > 0 ? rawCategories : defaultCategories;
  }, [rawCategories]);

  const [step, setStep] = useState(0);
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  const [draft, setDraft] = useState<RegistrationDraft>({
    ...emptyDraft,
    categoryId: categories[0]?.id || 'cat-std-full',
  });

  // Ensure categoryId is always populated with a valid category
  useEffect(() => {
    if (categories.length > 0) {
      if (!draft.categoryId || !categories.some((c) => c.id === draft.categoryId)) {
        setDraft((d) => ({
          ...d,
          categoryId: categories[0].id,
        }));
      }
    }
  }, [categories, draft.categoryId]);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ registration: Registration } | null>(null);

  // Duplicate Check & Pincode Status
  const [duplicateMatch, setDuplicateMatch] = useState<{ reference?: string; name?: string; email?: string; phone?: string } | null>(null);
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);
  const [isLookupPin, setIsLookupPin] = useState(false);
  const [pincodeFeedback, setPincodeFeedback] = useState<{
    status: 'idle' | 'loading' | 'success' | 'warning';
    message?: string;
  }>({ status: 'idle' });

  const effectiveCategoryId = draft.categoryId || categories[0]?.id || 'cat-std-full';
  const selectedCategory = getCategory(db, effectiveCategoryId) || categories[0] || defaultCategories[0];
  const breakdown = priceBreakdown(selectedCategory);

  function set<K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDuplicateMatch(null);
    if (errors[key as string]) {
      setErrors((prev) => {
        const nextErr = { ...prev };
        delete nextErr[key as string];
        return nextErr;
      });
    }
  }

  // Extract only the 10 raw digits after Indian code +91
  const phoneDigits = useMemo(() => {
    const raw = (draft.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '');
    if (raw.length > 10 && raw.startsWith('91')) {
      return raw.slice(2, 12);
    }
    return raw.slice(0, 10);
  }, [draft.phone]);

  // Handle phone input: strictly allow 10 digits with Indian code +91
  const handlePhoneDigitsChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('91') && clean.length > 10) {
      clean = clean.slice(2);
    } else if (clean.startsWith('0') && clean.length > 10) {
      clean = clean.slice(1);
    }
    clean = clean.slice(0, 10);
    set('phone', clean ? `+91 ${clean}` : '');
  };

  // Handle PIN Code Auto-Lookup for India: auto-updates City and State
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    set('postalCode', clean);

    if (clean.length < 6) {
      setPincodeFeedback({ status: 'idle' });
      return;
    }

    if (clean.length === 6) {
      setIsLookupPin(true);
      setPincodeFeedback({
        status: 'loading',
        message: `पिन कोड ${clean} खोजा जा रहा है...`,
      });

      const res = await lookupIndianPincode(clean);
      setIsLookupPin(false);

      if (res.success && res.city && res.state) {
        set('city', res.city);
        set('state', res.state);
        setPincodeFeedback({
          status: 'success',
          message: res.isEstimate
            ? `स्थान स्वतः अनुमानित: ${res.city}, ${res.state}`
            : `स्थान स्वतः भरा गया: ${res.city}, ${res.state}`,
        });
        notify(`स्थान स्वतः प्राप्त हुआ: ${res.city}, ${res.state}`, 'success');
      } else {
        setPincodeFeedback({
          status: 'warning',
          message: res.message || 'पिन कोड से स्थान नहीं मिला, कृपया शहर और राज्य मैन्युअली भरें।',
        });
        notify(res.message || 'इस पिन कोड का शहर स्वतः प्राप्त नहीं हो सका।', 'info');
      }
    }
  };

  // Check Duplicate Email & Phone gracefully without blocking co-registrations
  const checkDuplicateRegistration = (): boolean => {
    if (allowDuplicateOverride) return false;

    const cleanEmail = (draft.email || '').trim().toLowerCase();
    const cleanPhone = (draft.phone || '').replace(/\D/g, '');

    const existing = db.registrations.find((r) => {
      const rEmail = (r.email || '').trim().toLowerCase();
      const rPhone = (r.phone || '').replace(/\D/g, '');

      const emailMatch = cleanEmail && rEmail === cleanEmail;
      const phoneMatch = cleanPhone && cleanPhone.length >= 7 && rPhone.slice(-10) === cleanPhone.slice(-10);

      return emailMatch || phoneMatch;
    });

    if (existing) {
      setDuplicateMatch({
        reference: existing.reference || existing.id,
        name: existing.fullName || existing.firstName || 'सहभागी',
        email: existing.email,
        phone: existing.phone,
      });
      return true;
    }
    setDuplicateMatch(null);
    return false;
  };

  function validateCurrentStep(): boolean {
    const allErrors = validateParticipant(draft);
    const stepErrors: FieldErrors = {};

    if (step === 0) {
      // Q8 - Q13: Personal & Family
      if (allErrors.fullName) stepErrors.fullName = allErrors.fullName;
      if (allErrors.age) stepErrors.age = allErrors.age;
      if (allErrors.email) stepErrors.email = allErrors.email;
      if (allErrors.phone) stepErrors.phone = allErrors.phone;
      if (allErrors.postalCode) stepErrors.postalCode = allErrors.postalCode;
      if (allErrors.city) stepErrors.city = allErrors.city;
      if (allErrors.state) stepErrors.state = allErrors.state;
      if (allErrors.isUnmarried) stepErrors.isUnmarried = allErrors.isUnmarried;
      if (checkDuplicateRegistration()) {
        notify('यह संपर्क विवरण पहले से पंजीकृत है। कृपया नीचे दिए गए विकल्पों की जांच करें।', 'info');
        return false;
      }
    } else if (step === 1) {
      // Q14 - Q22: Ministry, Testimony, Dietary, Education & Church
      if (allErrors.testimony) stepErrors.testimony = allErrors.testimony;
      if (allErrors.hasDietaryRestrictions) stepErrors.hasDietaryRestrictions = allErrors.hasDietaryRestrictions;
      if (allErrors.dietaryDetails) stepErrors.dietaryDetails = allErrors.dietaryDetails;
      if (allErrors.educationQualification) stepErrors.educationQualification = allErrors.educationQualification;
      if (allErrors.otherEducation) stepErrors.otherEducation = allErrors.otherEducation;
      if (allErrors.churchName) stepErrors.churchName = allErrors.churchName;
      if (allErrors.churchRole) stepErrors.churchRole = allErrors.churchRole;
      if (allErrors.otherChurchRole) stepErrors.otherChurchRole = allErrors.otherChurchRole;
      if (allErrors.preachFrequency) stepErrors.preachFrequency = allErrors.preachFrequency;
    } else if (step === 2) {
      // Q23 - Q25: Expectations & Accommodation
      if (allErrors.trainingExpectations) stepErrors.trainingExpectations = allErrors.trainingExpectations;
      const effectiveCategory = draft.categoryId || categories[0]?.id || 'cat-std-full';
      if (!draft.categoryId && effectiveCategory) {
        set('categoryId', effectiveCategory);
      }
      if (!effectiveCategory) {
        notify('कृपया एक आवास विकल्प चुनें।', 'error');
        return false;
      }
    }

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      notify('कृपया लाल रंग से चिह्नित सभी अनिवार्य फ़ील्ड भरें।', 'error');
      return false;
    }
    return true;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  async function submit() {
    const allErrors = validateParticipant(draft);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      notify('कृपया फॉर्म के सभी अनिवार्य प्रश्नों के सही उत्तर दें।', 'error');
      if (allErrors.fullName || allErrors.age || allErrors.email || allErrors.phone || allErrors.postalCode || allErrors.city || allErrors.state || allErrors.isUnmarried) {
        setStep(0);
      } else if (allErrors.testimony || allErrors.dietaryDetails || allErrors.educationQualification || allErrors.churchName || allErrors.churchRole || allErrors.preachFrequency) {
        setStep(1);
      } else {
        setStep(2);
      }
      return;
    }

    if (checkDuplicateRegistration()) {
      setStep(0);
      return;
    }

    setSubmitting(true);

    let createdReg: Registration | null = null;
    let createdAtt: Attendee | null = null;
    try {
      const apiRes = await registerViaApi(draft, event.id, {
        amount: breakdown.subtotal,
        tax: breakdown.tax,
        total: breakdown.total,
      });
      if (apiRes.status === 'success' && apiRes.registration) {
        createdReg = apiRes.registration;
        createdAtt = apiRes.attendee || null;
      } else if (apiRes.status === 'error') {
        notify(apiRes.error || 'पंजीकरण विफल रहा। कृपया विवरण पुनः जांचें।', 'error');
        setSubmitting(false);
        return;
      }
    } catch (e) {
      console.warn('Backend API offline, saving to client store:', e);
    }

    const reference = createdReg?.reference || nextReference(db, event.year);
    const registration =
      createdReg ||
      buildRegistration(draft, event.id, reference, breakdown.subtotal, breakdown.tax);
    const attendee = createdAtt || buildAttendee(registration);

    create('registrations', registration);
    create('attendees', attendee);

    // Auto-create/sync participant account into User Directory & Pastoral CRM
    const userEmail = (registration.email || '').toLowerCase().trim();
    if (userEmail) {
      const existingUser = (db.users || []).find((u) => u.email.toLowerCase() === userEmail);
      if (!existingUser) {
        create('users', {
          id: `usr_${Date.now()}`,
          name: registration.fullName || `${registration.firstName || ''} ${registration.lastName || ''}`.trim(),
          email: userEmail,
          phone: registration.phone || '',
          role: 'PARTICIPANT',
          status: 'ACTIVE',
          authProvider: 'email',
          registeredAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }

      // Sync into Pastoral CRM
      try {
        const { contact, participation } = syncRegistrationToCRM(db, registration);
        if (contact) {
          const existingContact = (db.crmContacts || []).find((c) => c.email.toLowerCase() === userEmail);
          if (!existingContact) {
            create('crmContacts', contact);
          }
        }
        if (participation) {
          const existingPart = (db.eventParticipations || []).find((p) => p.registrationId === registration.id);
          if (!existingPart) {
            create('eventParticipations', participation);
          }
        }
      } catch (crmErr) {
        console.warn('CRM sync error:', crmErr);
      }
    }

    setResult({ registration });
    setSubmitting(false);
    setStep(4);
    notify('पंजीकरण सफलतापूर्वक दर्ज हो गया है!', 'success');
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {/* Mobile-Only Quick Help Banner (Q&A & Instructions) */}
        <div className="lg:hidden mb-4">
          <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setShowMobileHelp((v) => !v)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-amber-950"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-700 shrink-0" />
                <span>शिविर निर्देश एवं सामान्य प्रश्न (FAQ & Q&A)</span>
              </span>
              <span className="text-[11px] font-mono text-amber-800 bg-white border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                {showMobileHelp ? 'छुपाएं (Hide)' : 'देखें (View)'}
                <ChevronDown size={12} className={`transition-transform duration-200 ${showMobileHelp ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {showMobileHelp && (
              <div className="mt-3 pt-3 border-t border-amber-200/80 animate-fadeIn">
                <RegistrationRulesSidebar initialTab="qa" />
              </div>
            )}
          </div>
        </div>

        {/* Form Title & Stepper Header */}
        <div className="bg-white border-2 border-navy/20 p-5 sm:p-6 rounded-2xl mb-6 shadow-brutal-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-amber-700 font-bold uppercase bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full inline-block">
                {event.edition} · {event.year}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1.5">
                <span>वचन अध्ययन शिविर - 2026</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                प्रतिभागी पंजीकरण फॉर्म (Participant Registration Form)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-red-700 uppercase bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                भारतीय प्रतिनिधियों के लिए
              </span>
            </div>
          </div>

          <Stepper steps={STEPS} current={step} />
        </div>

        {/* Friendly Duplicate Notice & Choice */}
        {duplicateMatch && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-sm">
                  पहले से पंजीकृत विवरण मिला (Existing Registration Found)
                </p>
                <p className="text-slate-700 leading-relaxed">
                  यह ईमेल ({duplicateMatch.email || 'उपलब्ध'}) या फ़ोन नंबर ({duplicateMatch.phone || 'उपलब्ध'}) पहले से हमारे पास पंजीकृत है (नाम: <strong>{duplicateMatch.name}</strong>, संदर्भ: <span className="font-mono font-bold text-navy">{duplicateMatch.reference}</span>)।
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to={`/my-vachanshivir?ref=${encodeURIComponent(duplicateMatch.reference || '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy text-crossgold font-bold font-raleway text-xs hover:bg-navy-900 shadow-2xs"
                  >
                    <span>मौजूदा पास देखें / लॉगिन करें</span>
                    <ChevronRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAllowDuplicateOverride(true);
                      setDuplicateMatch(null);
                      notify('आप अपने साथी/परिवार के सदस्य का पंजीकरण जारी रख सकते हैं।', 'info');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold font-raleway text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    हाँ, मैं अन्य सदस्य/सहकर्मी का नया पंजीकरण कर रहा हूँ (जारी रखें)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 0: व्यक्तिगत व पारिवारिक विवरण (Q8 to Q13) */}
        {step === 0 && !result && (
          <div className="space-y-6">
            <div className="bg-navy-50/80 border border-navy/20 px-5 py-2.5 rounded-xl text-xs text-navy font-raleway font-bold flex items-center justify-between">
              <span>चरण 1 — व्यक्तिगत व पारिवारिक विवरण</span>
              <span className="text-amber-700 font-bold">Q8 &ndash; Q13</span>
            </div>

            {/* SECTION 2A — व्यक्तिगत जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-6">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <User size={15} />
                  <span>SECTION 2A</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">व्यक्तिगत जानकारी (Personal Information)</h2>
                <p className="text-xs text-slate-500">सभी चिह्नित (*) प्रश्न अनिवार्य हैं।</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* 8. पूरा नाम (Name) */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    8. पूरा नाम (Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className={`field text-sm sm:text-xs ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="अपना पूरा नाम लिखें"
                    value={draft.fullName}
                    onChange={(e) => {
                      set('fullName', e.target.value);
                      const parts = e.target.value.trim().split(/\s+/);
                      set('firstName', parts[0] || '');
                      set('lastName', parts.slice(1).join(' ') || '');
                    }}
                  />
                  {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* 9. आयु (Age) */}
                <div>
                  <label htmlFor="age" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    9. आयु (Age) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={18}
                    className={`field text-sm sm:text-xs ${errors.age ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="अपनी आयु लिखें"
                    value={draft.age}
                    onChange={(e) => set('age', e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">न्यूनतम 18 वर्ष आवश्यक</p>
                  {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
                </div>

                {/* 10. ईमेल (Email) */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    10. ईमेल (Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`field text-sm sm:text-xs ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="अपना ईमेल लिखें"
                    value={draft.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* 11. फ़ोन नंबर (Phone Number) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-800">
                      11. फ़ोन नंबर (Phone Number) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {phoneDigits.length === 10 ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> मान्य 10 अंक (+91)
                        </span>
                      ) : (
                        <span>{phoneDigits.length} / 10 अंक</span>
                      )}
                    </span>
                  </div>

                  <div
                    className={`flex rounded-xl overflow-hidden border transition-all bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 ${
                      errors.phone
                        ? 'border-red-500 ring-1 ring-red-500'
                        : phoneDigits.length === 10
                        ? 'border-emerald-500'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {/* Fixed Indian Country Code */}
                    <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 border-r border-slate-200 text-slate-800 select-none shrink-0">
                      <span className="text-base sm:text-lg leading-none" role="img" aria-label="India flag">
                        🇮🇳
                      </span>
                      <span className="font-mono font-bold text-amber-700 text-sm tracking-wide">+91</span>
                    </div>

                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      className="w-full bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none tracking-widest"
                      placeholder="98765 43210 (10 अंक)"
                      value={phoneDigits}
                      onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'ArrowLeft' &&
                          e.key !== 'ArrowRight' &&
                          e.key !== 'Tab'
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    कृपया भारत का वैध 10 अंकों का सक्रिय मोबाइल नंबर दर्ज करें (WhatsApp सूचनाओं हेतु)।
                  </p>
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* 12. पूरा पता (Full Postal Address with Indian Pincode Auto-Lookup) */}
                <div className="sm:col-span-2 border-t border-slate-200/80 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-800">
                      12. पूरा पता (Postal Address) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-amber-800 font-mono bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      पिन कोड दर्ज करते ही शहर व राज्य स्वतः भर जाएँगे
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Postal PIN Code (Indian 6 Digits) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="postalCode" className="block text-xs font-medium text-slate-700">
                          पिन कोड (PIN Code) <span className="text-red-500">*</span>
                        </label>
                        {isLookupPin && (
                          <span className="text-[11px] text-amber-700 font-mono animate-pulse">
                            डाकघर रिकॉर्ड खोज रहे हैं...
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="postalCode"
                          type="text"
                          maxLength={6}
                          inputMode="numeric"
                          className={`field font-mono text-sm sm:text-xs tracking-wider ${
                            errors.postalCode ? 'border-red-500 ring-1 ring-red-500' : ''
                          }`}
                          placeholder="6 अंकों का पिन कोड (उदा: 752001)"
                          value={draft.postalCode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                        />
                        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                          <MapPin size={16} />
                        </div>
                      </div>
                      {pincodeFeedback.status !== 'idle' && (
                        <p
                          className={`text-[11px] mt-1 font-sans ${
                            pincodeFeedback.status === 'success'
                              ? 'text-emerald-700 font-semibold'
                              : pincodeFeedback.status === 'warning'
                              ? 'text-amber-800 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          {pincodeFeedback.message}
                        </p>
                      )}
                      {errors.postalCode && (
                        <p className="text-red-600 text-[11px] mt-0.5">{errors.postalCode}</p>
                      )}
                    </div>

                    {/* City / District */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="city" className="block text-xs font-medium text-slate-700">
                          शहर / ज़िला (City / District) <span className="text-red-500">*</span>
                        </label>
                        {draft.city && (
                          <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> सत्यापित
                          </span>
                        )}
                      </div>
                      <input
                        id="city"
                        type="text"
                        className={`field text-sm sm:text-xs ${errors.city ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        placeholder="शहर का नाम"
                        value={draft.city}
                        onChange={(e) => set('city', e.target.value)}
                      />
                      {errors.city && <p className="text-red-600 text-[11px] mt-0.5">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="state" className="block text-xs font-medium text-slate-700">
                          राज्य (State) <span className="text-red-500">*</span>
                        </label>
                        {draft.state && (
                          <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> सत्यापित
                          </span>
                        )}
                      </div>
                      <input
                        id="state"
                        type="text"
                        className={`field text-sm sm:text-xs ${errors.state ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        placeholder="राज्य का नाम"
                        value={draft.state}
                        onChange={(e) => set('state', e.target.value)}
                      />
                      {errors.state && <p className="text-red-600 text-[11px] mt-0.5">{errors.state}</p>}
                    </div>

                    {/* House Number */}
                    <div>
                      <label htmlFor="houseNumber" className="block text-xs font-medium text-slate-700 mb-1">
                        मकान नंबर / नाम (House No. / Building)
                      </label>
                      <input
                        id="houseNumber"
                        type="text"
                        className="field text-sm sm:text-xs"
                        placeholder="उदा: 42-B, ग्रेस कॉटेज"
                        value={draft.houseNumber}
                        onChange={(e) => set('houseNumber', e.target.value)}
                      />
                    </div>

                    {/* Street Address */}
                    <div>
                      <label htmlFor="streetAddress" className="block text-xs font-medium text-slate-700 mb-1">
                        गली / क्षेत्र / स्थान (Street / Locality)
                      </label>
                      <input
                        id="streetAddress"
                        type="text"
                        className="field text-sm sm:text-xs"
                        placeholder="उदा: चर्च रोड, मिशन कंपाउंड"
                        value={draft.streetAddress}
                        onChange={(e) => set('streetAddress', e.target.value)}
                      />
                    </div>

                    {/* Landmark */}
                    <div className="sm:col-span-2">
                      <label htmlFor="landmark" className="block text-xs font-medium text-slate-700 mb-1">
                        लैंडमार्क / पहचान चिन्ह (Landmark - Optional)
                      </label>
                      <input
                        id="landmark"
                        type="text"
                        className="field text-sm sm:text-xs"
                        placeholder="उदा: मुख्य पोस्ट ऑफिस के पास / चर्च के सामने"
                        value={draft.landmark}
                        onChange={(e) => set('landmark', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* SECTION 2B — पारिवारिक जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <Heart size={15} />
                  <span>SECTION 2B</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">पारिवारिक जानकारी (Family Information)</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-3">
                  13. क्या आप अविवाहित हैं? (Are you unmarried?) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: 'हाँ', label: 'हाँ (Yes)', sub: 'अविवाहित (Unmarried)' },
                    { val: 'नहीं', label: 'नहीं (No)', sub: 'विवाहित (Married)' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('isUnmarried', opt.val as 'हाँ' | 'नहीं')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        draft.isUnmarried === opt.val ? 'bg-navy-50/70 border-2 border-navy ring-1 ring-navy shadow-brutal-sm' : 'bg-slate-50 border-2 border-slate-200 hover:border-navy/40 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${draft.isUnmarried === opt.val ? 'text-navy font-bold font-raleway' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        {draft.isUnmarried === opt.val && <CheckCircle2 size={16} className="text-amber-700" />}
                      </div>
                      <p className={`text-[11px] mt-1 ${draft.isUnmarried === opt.val ? 'text-navy-900 font-medium' : 'text-slate-500'}`}>
                        {opt.sub}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.isUnmarried && <p className="text-red-600 text-xs mt-2">{errors.isUnmarried}</p>}
              </div>
            </fieldset>
          </div>
        )}

        {/* STEP 1: आत्मिक गवाही, भोजन, शिक्षा व कलीसिया (Q14 to Q22) */}
        {step === 1 && !result && (
          <div className="space-y-6">
            <div className="bg-navy-50/80 border border-navy/20 px-5 py-2.5 rounded-xl text-xs text-navy font-raleway font-bold flex items-center justify-between">
              <span>चरण 2 — आत्मिक गवाही, भोजन, शिक्षा व कलीसिया</span>
              <span className="text-amber-700 font-bold">Q14 &ndash; Q22</span>
            </div>

            {/* SECTION 2C — व्यक्तिगत एवं आत्मिक जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <BookOpen size={15} />
                  <span>SECTION 2C</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">व्यक्तिगत एवं आत्मिक जानकारी (Spiritual Testimony)</h2>
              </div>

              <div>
                <label htmlFor="testimony" className="block text-xs font-semibold text-slate-800 mb-2">
                  14. कृपया अपनी गवाही संक्षेप में लिखें। (Testimony) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="testimony"
                  rows={4}
                  className={`field resize-y text-sm sm:text-xs leading-relaxed ${
                    errors.testimony ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                  placeholder="प्रभु में आपके उद्धार और आत्मिक यात्रा की संक्षिप्त गवाही लिखें"
                  value={draft.testimony}
                  onChange={(e) => set('testimony', e.target.value)}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>प्रभु में आपके उद्धार और सेवकाई बुलाहट की संक्षिप्त गवाही</span>
                  <span>{draft.testimony.length} अक्षर</span>
                </div>
                {errors.testimony && <p className="text-red-600 text-xs mt-1">{errors.testimony}</p>}
              </div>
            </fieldset>

            {/* SECTION 2D — भोजन संबंधी जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-5">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <Utensils size={15} />
                  <span>SECTION 2D</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">भोजन संबंधी जानकारी (Dietary Information)</h2>
              </div>

              {/* 15. क्या आपको खाने में किसी प्रकार के परहेज़ हैं? */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-3">
                  15. क्या आपको खाने में किसी प्रकार के परहेज़ हैं? (Any dietary restrictions?) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: 'नहीं', label: 'नहीं (No)', sub: 'सामान्य भोजन' },
                    { val: 'हाँ', label: 'हाँ (Yes)', sub: 'विशेष आहार या परहेज़' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('hasDietaryRestrictions', opt.val as 'हाँ' | 'नहीं')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        draft.hasDietaryRestrictions === opt.val ? 'bg-navy-50/70 border-2 border-navy ring-1 ring-navy shadow-brutal-sm' : 'bg-slate-50 border-2 border-slate-200 hover:border-navy/40 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${draft.hasDietaryRestrictions === opt.val ? 'text-navy font-bold font-raleway' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        {draft.hasDietaryRestrictions === opt.val && <CheckCircle2 size={16} className="text-amber-700" />}
                      </div>
                      <p className={`text-[11px] mt-1 ${draft.hasDietaryRestrictions === opt.val ? 'text-amber-800' : 'text-slate-500'}`}>
                        {opt.sub}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.hasDietaryRestrictions && (
                  <p className="text-red-600 text-xs mt-2">{errors.hasDietaryRestrictions}</p>
                )}
              </div>

              {/* 16. कृपया अपने खाने के परहेज़ का विवरण दें। (Conditional) */}
              {draft.hasDietaryRestrictions === 'हाँ' && (
                <div className="pt-3 border-t border-slate-200/80 animate-fadeIn">
                  <label htmlFor="dietaryDetails" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    16. कृपया अपने खाने के परहेज़ का विवरण दें। <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="dietaryDetails"
                    rows={3}
                    className={`field resize-y text-sm sm:text-xs ${
                      errors.dietaryDetails ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                    placeholder="अपने भोजन संबंधी परहेज़ लिखें (उदा: डायबिटीज़, एलर्जी, सादा भोजन)"
                    value={draft.dietaryDetails}
                    onChange={(e) => set('dietaryDetails', e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">कंडीशनल: Q15 = हाँ (उदा. डायबिटीज़, एलर्जी, सादा भोजन)</p>
                  {errors.dietaryDetails && <p className="text-red-600 text-xs mt-1">{errors.dietaryDetails}</p>}
                </div>
              )}
            </fieldset>

            {/* SECTION 2E — शिक्षा संबंधी जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-5">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <GraduationCap size={15} />
                  <span>SECTION 2E</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">शिक्षा संबंधी जानकारी (Educational Information)</h2>
              </div>

              {/* 17. आपकी शैक्षणिक योग्यता क्या है? */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-3">
                  17. आपकी शैक्षणिक योग्यता क्या है? (Educational Qualification) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['12वीं', 'स्नातक', 'परास्नातक', 'अन्य'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => set('educationQualification', item)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        draft.educationQualification === item
                          ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm ${
                          draft.educationQualification === item ? 'font-bold text-amber-950' : 'font-medium text-slate-800'
                        }`}>
                          {item}
                        </span>
                        {draft.educationQualification === item && (
                          <CheckCircle2 size={15} className="text-amber-700" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.educationQualification && (
                  <p className="text-red-600 text-xs mt-2">{errors.educationQualification}</p>
                )}
              </div>

              {/* 18. यदि आपने "अन्य" चुना है, तो कृपया बताएं। */}
              {draft.educationQualification === 'अन्य' && (
                <div className="pt-2 border-t border-slate-200/80 animate-fadeIn">
                  <label htmlFor="otherEducation" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    18. यदि आपने "अन्य" चुना है, तो कृपया बताएं। (Specify if Other)
                  </label>
                  <input
                    id="otherEducation"
                    type="text"
                    className="field text-sm sm:text-xs"
                    placeholder="अपनी योग्यता लिखें"
                    value={draft.otherEducation}
                    onChange={(e) => set('otherEducation', e.target.value)}
                  />
                  {errors.otherEducation && <p className="text-red-600 text-xs mt-1">{errors.otherEducation}</p>}
                </div>
              )}
            </fieldset>

            {/* SECTION 2F — कलीसिया एवं सेवकाई की जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-5">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <Church size={15} />
                  <span>SECTION 2F</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">कलीसिया एवं सेवकाई की जानकारी (Church & Ministry)</h2>
              </div>

              {/* 19. आपकी कलीसिया का नाम क्या है? */}
              <div>
                <label htmlFor="churchName" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  19. आपकी कलीसिया का नाम क्या है? (Church Name) <span className="text-red-500">*</span>
                </label>
                <input
                  id="churchName"
                  type="text"
                  className={`field text-sm sm:text-xs ${errors.churchName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="अपनी कलीसिया का नाम लिखें"
                  value={draft.churchName}
                  onChange={(e) => {
                    set('churchName', e.target.value);
                    set('organisation', e.target.value);
                  }}
                />
                {errors.churchName && <p className="text-red-600 text-xs mt-1">{errors.churchName}</p>}
              </div>

              {/* 20. कलीसिया में आपकी भूमिका क्या है? */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-3">
                  20. कलीसिया में आपकी भूमिका क्या है? (Your Role in Church) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['पास्टर', 'डीकन', 'अगुवा', 'संडे स्कूल शिक्षक', 'अन्य'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        set('churchRole', role);
                        set('designation', role);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        draft.churchRole === role ? 'bg-navy-50/70 border-2 border-navy ring-1 ring-navy shadow-brutal-sm' : 'bg-slate-50 border-2 border-slate-200 hover:border-navy/40 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm ${
                          draft.churchRole === role ? 'font-black text-navy font-raleway' : 'font-medium text-slate-800'
                        }`}>
                          {role}
                        </span>
                        {draft.churchRole === role && <CheckCircle2 size={15} className="text-amber-700" />}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.churchRole && <p className="text-red-600 text-xs mt-2">{errors.churchRole}</p>}
              </div>

              {/* 21. यदि आपने "अन्य" चुना है, तो कृपया अपनी भूमिका बताएं। */}
              {draft.churchRole === 'अन्य' && (
                <div className="pt-2 border-t border-slate-200/80 animate-fadeIn">
                  <label htmlFor="otherChurchRole" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    21. यदि आपने "अन्य" चुना है, तो कृपया अपनी भूमिका बताएं। (Specify Role)
                  </label>
                  <input
                    id="otherChurchRole"
                    type="text"
                    className="field text-sm sm:text-xs"
                    placeholder="अपनी भूमिका लिखें"
                    value={draft.otherChurchRole}
                    onChange={(e) => {
                      set('otherChurchRole', e.target.value);
                      set('designation', e.target.value);
                    }}
                  />
                  {errors.otherChurchRole && <p className="text-red-600 text-xs mt-1">{errors.otherChurchRole}</p>}
                </div>
              )}

              {/* 22. आप कलीसिया में कितनी बार प्रचार करते हैं? */}
              <div>
                <label htmlFor="preachFrequency" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  22. आप कलीसिया में कितनी बार प्रचार करते हैं? (Preaching Frequency) <span className="text-red-500">*</span>
                </label>
                <input
                  id="preachFrequency"
                  type="text"
                  className={`field text-sm sm:text-xs ${errors.preachFrequency ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="जैसे: हर रविवार / महीने में 2 बार"
                  value={draft.preachFrequency}
                  onChange={(e) => set('preachFrequency', e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1">जैसे: हर रविवार / महीने में 2 बार</p>
                {errors.preachFrequency && <p className="text-red-600 text-xs mt-1">{errors.preachFrequency}</p>}
              </div>
            </fieldset>
          </div>
        )}

        {/* STEP 2: अपेक्षाएँ एवं अतिरिक्त जानकारी (Q23 to Q25) */}
        {step === 2 && !result && (
          <div className="space-y-6">
            <div className="bg-navy-50/80 border border-navy/20 px-5 py-2.5 rounded-xl text-xs text-navy font-raleway font-bold flex items-center justify-between">
              <span>चरण 3 — अपेक्षाएँ एवं अतिरिक्त जानकारी</span>
              <span className="text-amber-700 font-bold">Q23 &ndash; Q25</span>
            </div>

            {/* SECTION 2G — प्रशिक्षण से संबंधित जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <FileText size={15} />
                  <span>SECTION 2G</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">प्रशिक्षण से संबंधित जानकारी (Training Expectations)</h2>
              </div>

              <div>
                <label htmlFor="trainingExpectations" className="block text-xs font-semibold text-slate-800 mb-2">
                  23. इस प्रशिक्षण से आपकी क्या अपेक्षाएँ हैं? (What are your expectations?) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="trainingExpectations"
                  rows={4}
                  className={`field resize-y text-sm sm:text-xs leading-relaxed ${
                    errors.trainingExpectations ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                  placeholder="आप इस प्रशिक्षण से क्या सीखना चाहते हैं? (उदा: इफिसियों की पत्री का गहराई से अध्ययन, प्रचार की रूपरेखा तैयार करना)"
                  value={draft.trainingExpectations}
                  onChange={(e) => set('trainingExpectations', e.target.value)}
                />
                {errors.trainingExpectations && (
                  <p className="text-red-600 text-xs mt-1">{errors.trainingExpectations}</p>
                )}
              </div>
            </fieldset>

            {/* SECTION 2H — अतिरिक्त जानकारी */}
            <fieldset className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-5">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-navy font-raleway text-xs font-black uppercase tracking-wider">
                  <HelpCircle size={15} />
                  <span>SECTION 2H</span>
                </div>
                <h2 className="text-lg font-black text-navy font-raleway mt-1">अतिरिक्त जानकारी (Additional Information)</h2>
                <p className="text-xs text-slate-500">यह अनुभाग वैकल्पिक (Optional) है।</p>
              </div>

              {/* 24. क्या आपकी कोई विशेष आवश्यकता है? */}
              <div>
                <label htmlFor="specialNeeds" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  24. क्या आपकी कोई विशेष आवश्यकता है जिसके बारे में हमें जानना चाहिए? (Special Needs)
                </label>
                <textarea
                  id="specialNeeds"
                  rows={2}
                  className="field resize-y text-sm sm:text-xs"
                  placeholder="यदि कोई विशेष शारीरिक या आवागमन संबंधी आवश्यकता हो तो लिखें"
                  value={draft.specialNeeds}
                  onChange={(e) => set('specialNeeds', e.target.value)}
                />
              </div>

              {/* 25. क्या आप हमारे साथ कोई अन्य जानकारी साझा करना चाहते हैं? */}
              <div>
                <label htmlFor="otherInfo" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  25. क्या आप हमारे साथ कोई अन्य जानकारी साझा करना चाहते हैं? (Other Information)
                </label>
                <textarea
                  id="otherInfo"
                  rows={2}
                  className="field resize-y text-sm sm:text-xs"
                  placeholder="अन्य कोई सूचना जो आप साझा करना चाहते हैं"
                  value={draft.otherInfo}
                  onChange={(e) => set('otherInfo', e.target.value)}
                />
              </div>
            </fieldset>
          </div>
        )}

        {/* STEP 3: समीक्षा व पुष्टि (Review & Submit) */}
        {step === 3 && !result && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-navy/20 p-5 sm:p-8 rounded-2xl shadow-brutal-sm space-y-6">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-xs font-mono text-amber-700 font-bold">चरण 4</span>
                <h2 className="text-xl font-black text-navy font-raleway mt-1">पंजीकरण विवरण की समीक्षा (Review Responses)</h2>
                <p className="text-xs text-slate-500">
                  कृपया फॉर्म जमा करने से पहले प्रश्न 8 से 25 तक के उत्तरों की पुष्टि करें।
                </p>
              </div>

              {/* Detailed Question Review Table (Q8 to Q25) */}
              <div className="divide-y divide-slate-200/80 border border-slate-200/90 rounded-2xl overflow-hidden bg-white text-xs">
                {/* Section 2A */}
                <div className="p-4 bg-slate-50/80">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-2 font-raleway">
                    SECTION 2A — व्यक्तिगत जानकारी
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-500">8. पूरा नाम:</span> <strong className="text-slate-900">{draft.fullName}</strong></div>
                    <div><span className="text-slate-500">9. आयु:</span> <strong className="text-slate-900">{draft.age} वर्ष</strong></div>
                    <div><span className="text-slate-500">10. ईमेल:</span> <strong className="text-slate-900">{draft.email}</strong></div>
                    <div><span className="text-slate-500">11. फ़ोन नंबर:</span> <strong className="text-slate-900">{draft.phone}</strong></div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">12. पूरा पता:</span>{' '}
                      <strong className="text-slate-900">
                        {[draft.houseNumber, draft.streetAddress, draft.landmark, draft.city, draft.state, draft.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 2B */}
                <div className="p-4">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-2 font-raleway">
                    SECTION 2B — पारिवारिक जानकारी
                  </h3>
                  <div className="text-slate-700">
                    <span className="text-slate-500">13. क्या आप अविवाहित हैं?:</span>{' '}
                    <strong className="text-slate-900">{draft.isUnmarried}</strong>
                  </div>
                </div>

                {/* Section 2C & 2D */}
                <div className="p-4 bg-slate-50/80">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-2 font-raleway">
                    SECTION 2C &amp; 2D — आत्मिक गवाही एवं भोजन
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-500">14. गवाही संक्षेप में:</span>
                      <p className="mt-1 text-slate-900 bg-white border border-slate-200 p-2.5 rounded-lg font-sans leading-relaxed shadow-2xs">
                        {draft.testimony}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">15. भोजन में परहेज़:</span>{' '}
                      <strong className="text-slate-900">{draft.hasDietaryRestrictions}</strong>
                      {draft.hasDietaryRestrictions === 'हाँ' && draft.dietaryDetails && (
                        <span className="text-amber-800 ml-2 font-medium">(16. विवरण: {draft.dietaryDetails})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2E & 2F */}
                <div className="p-4">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-2 font-raleway">
                    SECTION 2E &amp; 2F — शिक्षा एवं कलीसियाई सेवकाई
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500">17. शैक्षणिक योग्यता:</span>{' '}
                      <strong className="text-slate-900">
                        {draft.educationQualification}
                        {draft.educationQualification === 'अन्य' && draft.otherEducation ? ` (18. ${draft.otherEducation})` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">19. कलीसिया का नाम:</span>{' '}
                      <strong className="text-slate-900">{draft.churchName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">20. कलीसिया में भूमिका:</span>{' '}
                      <strong className="text-slate-900">
                        {draft.churchRole}
                        {draft.churchRole === 'अन्य' && draft.otherChurchRole ? ` (21. ${draft.otherChurchRole})` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">22. प्रचार करने की आवृत्ति:</span>{' '}
                      <strong className="text-slate-900">{draft.preachFrequency}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 2G & 2H */}
                <div className="p-4 bg-slate-50/80">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-2 font-raleway">
                    SECTION 2G &amp; 2H — अपेक्षाएँ एवं अतिरिक्त जानकारी
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-500">23. प्रशिक्षण से अपेक्षाएँ:</span>
                      <p className="mt-1 text-slate-900 bg-white border border-slate-200 p-2.5 rounded-lg font-sans shadow-2xs">
                        {draft.trainingExpectations}
                      </p>
                    </div>
                    {draft.specialNeeds && (
                      <div>
                        <span className="text-slate-500">24. विशेष आवश्यकता:</span>{' '}
                        <strong className="text-slate-900">{draft.specialNeeds}</strong>
                      </div>
                    )}
                    {draft.otherInfo && (
                      <div>
                        <span className="text-slate-500">25. अन्य जानकारी:</span>{' '}
                        <strong className="text-slate-900">{draft.otherInfo}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Fee Summary */}
                <div className="p-4 bg-amber-50/50">
                  <h3 className="font-black text-navy uppercase tracking-wider text-[11px] mb-1 font-raleway">
                    पंजीकरण पास एवं सकल शुल्क (Registration Fee)
                  </h3>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>{selectedCategory?.name || 'पूर्ण शिविर पंजीकरण पास (Full Camp Pass)'}</span>
                    <span className="font-mono text-amber-800">{inr(breakdown.total)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    3 रात आवास, 4 दिन संपूर्ण भोजन, अध्ययन सामग्री एवं शिविर किट सम्मिलित।
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full py-4 text-base font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-sm transition-colors"
                >
                  {submitting ? 'पंजीकरण जमा किया जा रहा है...' : 'पंजीकरण पुष्टि करें और टिकट प्राप्त करें (Submit & Confirm)'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP RESULT: CONFIRMED DELEGATE PASS */}
        {result && (
          <div className="bg-white border border-emerald-300 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                पंजीकरण सफल (Registration Confirmed)
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3 font-serif">
                वचन अध्ययन शिविर 2026 में आपका स्वागत है!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                आपका पंजीकरण संदर्भ क्रमांक दर्ज कर लिया गया है। इस पास को सहेज लें।
              </p>
            </div>

            {/* Delegate Pass Card */}
            <div className="bg-slate-50 border border-slate-200/90 p-6 rounded-2xl max-w-md mx-auto text-left space-y-4 font-sans shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">REFERENCE NUMBER</span>
                  <div className="font-mono text-lg font-bold text-amber-700">
                    {result.registration.reference}
                  </div>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg">
                  <QrCode size={40} className="text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">DELEGATE NAME</span>
                  <strong className="text-slate-900">{result.registration.fullName || `${result.registration.firstName} ${result.registration.lastName}`}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CHURCH / ORG</span>
                  <strong className="text-slate-900 truncate block">{result.registration.churchName || result.registration.organisation}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ROLE</span>
                  <strong className="text-slate-900">{result.registration.churchRole || result.registration.designation}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CITY / STATE</span>
                  <strong className="text-slate-900">{result.registration.city}, {result.registration.state}</strong>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500">आवास पैकेज:</span>
                <span className="font-bold text-amber-800">{selectedCategory?.name}</span>
              </div>

              {/* Razorpay Online Payment Integration */}
              <div className="border-t border-slate-200 pt-4">
                {result.registration.paymentStatus === 'paid' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>भुगतान सत्यापित (Paid via Razorpay: {result.registration.transactionId || 'CONFIRMED'})</span>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-3 text-left">
                    {/* Participant Record Confirmation Banner */}
                    <div className="p-3 bg-white/90 border border-emerald-300 rounded-lg text-emerald-900 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>विवरण डेटाबेस में सुरक्षित दर्ज (Participant Entry Saved)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        आपकी पंजीकरण प्रविष्टि सुरक्षित दर्ज कर ली गई है। यदि अभी भुगतान नहीं कर पा रहे हैं, तो चिंता न करें — आपके ईमेल (<strong>{result.registration.email}</strong>) पर भुगतान लिंक भेज दिया गया है।
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-amber-950">शुल्क भुगतान (Registration Fee):</span>
                      <span className="font-black text-amber-900 font-mono text-sm">{inr(breakdown.total)}</span>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      UPI (GPay, PhonePe, Paytm), क्रेडिट/डेबिट कार्ड या नेट बैंकिंग से ऑनलाइन भुगतान करें:
                    </p>

                    <RazorpayPayButton
                      amountInRupees={breakdown.total}
                      registrationId={result.registration.id}
                      receipt={`rcpt_${result.registration.reference}`}
                      prefill={{
                        name: result.registration.fullName || `${result.registration.firstName} ${result.registration.lastName}`,
                        email: result.registration.email,
                        contact: result.registration.phone,
                      }}
                      label={`Razorpay से अभी भुगतान करें (Pay ₹${breakdown.total.toLocaleString('en-IN')})`}
                      className="w-full py-3"
                      onPaymentSuccess={(payRes) => {
                        if (result?.registration?.id) {
                          update('registrations', result.registration.id, {
                            paymentStatus: 'paid',
                            transactionId: payRes.paymentId,
                          });
                          const matchingAttendee = (db.attendees || []).find(
                            (a) => a.registrationId === result.registration.id || a.reference === result.registration.reference
                          );
                          if (matchingAttendee) {
                            update('attendees', matchingAttendee.id, {
                              paymentStatus: 'paid',
                            });
                          }
                          const matchingContact = (db.crmContacts || []).find(
                            (c) => c.email.toLowerCase() === (result.registration.email || '').toLowerCase()
                          );
                          if (matchingContact) {
                            const newTags = Array.from(new Set([...(matchingContact.tags || []).filter((t) => t !== 'UNPAID' && t !== 'PAYMENT_FAILED'), 'PAID', 'VS-2026']));
                            update('crmContacts', matchingContact.id, { tags: newTags });
                          }
                        }
                        setResult((prev) =>
                          prev
                            ? {
                                ...prev,
                                registration: {
                                  ...prev.registration,
                                  paymentStatus: 'paid',
                                  transactionId: payRes.paymentId,
                                },
                              }
                            : null
                        );
                        notify('भुगतान सफलतापूर्वक सत्यापित! आपका टिकट व डिजिटल पास तैयार है।', 'success');
                      }}
                      onPaymentError={() => {
                        if (result?.registration?.id) {
                          const matchingContact = (db.crmContacts || []).find(
                            (c) => c.email.toLowerCase() === (result.registration.email || '').toLowerCase()
                          );
                          if (matchingContact) {
                            const newTags = Array.from(new Set([...(matchingContact.tags || []), 'PAYMENT_FAILED']));
                            update('crmContacts', matchingContact.id, { tags: newTags });
                          }
                        }
                        notify('भुगतान पूरा नहीं हो सका, लेकिन आपका पंजीकरण सुरक्षित है। आप ईमेल में दिए गए लिंक से कभी भी भुगतान कर सकते हैं।', 'info');
                      }}
                    />

                    <div className="text-center pt-1 border-t border-amber-200/60">
                      <Link
                        to={`/my-vachanshivir?ref=${result.registration.reference}`}
                        className="text-[11px] text-amber-800 hover:text-amber-950 underline font-semibold"
                      >
                        बाद में भुगतान के लिए अपना पास लिंक देखें &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-300 transition shadow-xs"
              >
                <Printer size={15} /> रसीद प्रिंट करें (Print Pass)
              </button>
              <Link
                to="/my-vachanshivir"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xs"
              >
                My Ticket पर जाएँ &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Step Navigation Bar (when not in result state) */}
        {!result && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              className={`text-xs ${step === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft size={15} className="mr-1 inline" /> पिछला (Back)
            </Button>

            {step < 3 ? (
              <Button variant="gold" onClick={handleNext} className="text-xs uppercase tracking-wider px-7 py-2.5 font-black">
                अगला (Next) <ChevronRight size={15} className="ml-1 inline" />
              </Button>
            ) : (
              <Button variant="gold" onClick={submit} disabled={submitting} className="text-xs uppercase tracking-wider px-8 py-2.5 font-black !bg-emerald-600 !text-white hover:!bg-emerald-500 !border-navy">
                {submitting ? 'जमा हो रहा है...' : 'पंजीकरण पुष्टि करें (Submit)'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Rules & Information Sidebar (Desktop right-hand side) */}
      <div className="hidden lg:block">
        <RegistrationRulesSidebar initialTab="instructions" />
      </div>
    </div>
  );
}
