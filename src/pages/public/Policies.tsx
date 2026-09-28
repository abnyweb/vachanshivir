import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, RefreshCw, Church, Mail, Phone } from 'lucide-react';
import { PageHeader } from '../../components/public/PageHeader';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLanguage } from '../../i18n/LanguageContext';

export function PoliciesLayout({ activeTab, children }: { activeTab: 'privacy' | 'terms' | 'refund'; children: React.ReactNode }) {
  const { language } = useLanguage();
  const lang = language;

  return (
    <>
      <PageHeader
        eyebrow={lang === 'hi' ? 'कानूनी एवं संगठनात्मक नीतियां' : 'LEGAL & MINISTRY POLICIES'}
        title={
          activeTab === 'privacy'
            ? lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'
            : activeTab === 'terms'
            ? lang === 'hi' ? 'नियम एवं शर्तें (Terms & Conditions)' : 'Terms & Conditions'
            : lang === 'hi' ? 'रद्दीकरण एवं रिफंड नीति (Refund & Cancellation)' : 'Refund & Cancellation Policy'
        }
        intro={
          lang === 'hi'
            ? 'सत्य वचन चर्च के मार्गदर्शन में वचन अध्ययन शिविर 2026 की आधिकारिक नीतियां।'
            : 'Official policies and governance guidelines for Vachan Shivir 2026 under Satya Vachan Church.'
        }
      />

      <section className="bg-slate-50 text-slate-900 py-12 lg:py-16 border-b border-slate-200">
        <div className="shell max-w-5xl mx-auto space-y-8">
          {/* Ownership Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-transparent border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Church className="w-6 h-6" />
            </div>
            <div className="space-y-1 font-sans">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-800">
                {lang === 'hi' ? 'आधिकारिक स्वामित्व घोषणा' : 'OFFICIAL MINISTRY OWNERSHIP NOTICE'}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {lang === 'hi'
                  ? 'यह वचन अध्ययन शिविर सत्य वचन चर्च (Satya Vachan Church) के पूर्ण स्वामित्व एवं संचालन के अंतर्गत है।'
                  : 'Vachan Shivir is owned, managed, and organized under the sole ownership and governance of Satya Vachan Church.'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {lang === 'hi'
                  ? 'पंजीकरण, शुल्क संग्रह, आवास आवंटन एवं सत्र प्रबंधन सत्य वचन चर्च की अधिकृत टीम द्वारा किया जाता है।'
                  : 'All delegate registrations, fee collections, hotel rooming allocations, and session administration are officially governed by Satya Vachan Church.'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-200 pb-4">
            <Link
              to="/privacy-policy"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
            </Link>

            <Link
              to="/terms"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'hi' ? 'नियम एवं शर्तें' : 'Terms & Conditions'}</span>
            </Link>

            <Link
              to="/refund-policy"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'refund'
                  ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'hi' ? 'रिफंड एवं रद्दीकरण' : 'Refund & Cancellation'}</span>
            </Link>
          </div>

          {/* Page Body Content */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 text-slate-800 space-y-8 font-sans leading-relaxed text-sm sm:text-base shadow-xs">
            {children}
          </div>

          {/* Contact Support Card */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm shadow-xs">
            <div>
              <p className="font-bold text-slate-900 font-serif text-base">{lang === 'hi' ? 'नीतियां संबंधी प्रश्न?' : 'Questions about our policies?'}</p>
              <p className="text-slate-600 mt-0.5">{lang === 'hi' ? 'सत्य वचन चर्च की टीम से संपर्क करें।' : 'Contact the Satya Vachan Church support team.'}</p>
            </div>
            <div className="flex items-center gap-4 font-mono font-bold text-amber-800">
              <a href="tel:9696110134" className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-4 h-4" />
                <span>+91 9696110134</span>
              </a>
              <Link to="/contact" className="flex items-center gap-1.5 hover:underline">
                <Mail className="w-4 h-4" />
                <span>{lang === 'hi' ? 'संपर्क फॉर्म' : 'Enquiry Form'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPolicy() {
  useDocumentMeta("Privacy Policy — Vachan Shivir", "Privacy Policy and data protection guidelines of Vachan Shivir under Satya Vachan Church.");
  const { language } = useLanguage();
  const lang = language;

  return (
    <PoliciesLayout activeTab="privacy">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '1. स्वामित्व एवं परिचय (Ownership & Scope)' : '1. Ministry Ownership & Privacy Scope'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'वचन अध्ययन शिविर सत्य वचन चर्च (Satya Vachan Church) के स्वामित्व और तत्वावधान में आयोजित एक वार्षिक अध्ययन शिविर है। यह गोपनीयता नीति स्पष्ट करती है कि सत्य वचन चर्च आपके द्वारा प्रदान की गई जानकारी को किस प्रकार संग्रहित, सुरक्षित एवं उपयोग करता है।'
              : 'Vachan Shivir is an annual expository retreat owned and organized under Satya Vachan Church. This Privacy Policy governs how Satya Vachan Church collects, uses, and safeguards personal information provided by delegates.'}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '2. एकत्र की जाने वाली जानकारी (Information We Collect)' : '2. Personal Data We Collect'}
          </h2>
          <ul className="mt-3 space-y-2 text-slate-700 list-disc pl-5">
            <li>
              <strong>{lang === 'hi' ? 'व्यक्तिगत पहचान विवरण:' : 'Personal Identification:'}</strong> {lang === 'hi' ? 'प्रथम नाम, अंतिम नाम, आयु, लिंग, एवं संपर्क भाषा।' : 'First Name, Last Name, Age, Gender, and language preference.'}
            </li>
            <li>
              <strong>{lang === 'hi' ? 'संपर्क जानकारी:' : 'Contact Information:'}</strong> {lang === 'hi' ? 'मोबाइल/व्हाट्सएप नंबर, ईमेल पता, स्ट्रीट एड्रेस, पिन कोड, शहर एवं राज्य।' : 'Mobile/WhatsApp Number, Email Address, Street Address, PIN Code, City, and State.'}
            </li>
            <li>
              <strong>{lang === 'hi' ? 'कलीसियाई विवरण:' : 'Church & Ministry Details:'}</strong> {lang === 'hi' ? 'कलीसिया का नाम, संप्रदाय, एवं कलीसिया में पद (पास्टर, प्राचीन, शिक्षक, विश्वासी)।' : 'Church Name, Denomination, and Role (Pastor, Elder, Ministry Leader, Delegate).'}
            </li>
            <li>
              <strong>{lang === 'hi' ? 'भुगतान विवरण:' : 'Transaction Details:'}</strong> {lang === 'hi' ? 'पंजीकरण पास शुल्क भुगतान संदर्भ संख्या एवं भुगतान स्थिति (बैंक कार्ड की जानकारी हम स्टोर नहीं करते)।' : 'Payment reference numbers and status. Card details are processed via secure gateways.'}
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '3. जानकारी का उपयोग (How We Use Your Data)' : '3. Purpose & Data Utilization'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'आपकी जानकारी का उपयोग केवल निम्नलिखित आधिकारिक उद्देश्यों के लिए किया जाता है:'
              : 'Your data is strictly utilized for official event administration:'}
          </p>
          <ul className="mt-3 space-y-2 text-slate-700 list-disc pl-5">
            <li>{lang === 'hi' ? 'शिविर प्रवेश पास, डिजिटल QR कोड एवं आईडी बैज जनरेट करना।' : 'Generating delegate passes, digital QR badges, and physical IDs.'}</li>
            <li>{lang === 'hi' ? 'पुरी, ओडिशा में 3 रातों का होटल आवास एवं 4 दिनों के भोजन का आवंटन।' : 'Allocating hotel rooming and meal packages in Puri, Odisha.'}</li>
            <li>{lang === 'hi' ? 'व्हाट्सएप एवं ईमेल के माध्यम से शिविर की आवश्यक समय-सारणी एवं अपडेट भेजना।' : 'Sending essential WhatsApp & email updates regarding schedule changes and arrival guidance.'}</li>
            <li>{lang === 'hi' ? 'सत्य वचन चर्च द्वारा भविष्य के अध्ययन शिविरों की सूचना देना।' : 'Notifying delegates of future ministry events organized by Satya Vachan Church.'}</li>
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '4. डेटा सुरक्षा एवं गोपनीयता (Data Protection & Non-Sharing)' : '4. Security & Non-Disclosure Guarantee'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'सत्य वचन चर्च आपके व्यक्तिगत डेटा की पूर्ण गोपनीयता की गारंटी देता है। आपका डेटा किसी भी तृतीय-पक्ष विज्ञापनदाता या बाहरी व्यावसायिक संस्था को न तो बेचा जाता है और न ही साझा किया जाता है।'
              : 'Satya Vachan Church prioritizes data confidentiality. We do NOT sell, rent, or disclose your personal data to third-party advertisers or commercial entities.'}
          </p>
        </div>
      </div>
    </PoliciesLayout>
  );
}

export function Terms() {
  useDocumentMeta("Terms & Conditions — Vachan Shivir", "Terms and conditions for attending Vachan Shivir 2026 under Satya Vachan Church.");
  const { language } = useLanguage();
  const lang = language;

  return (
    <PoliciesLayout activeTab="terms">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '1. स्वामित्व एवं आयोजक (Ownership & Authority)' : '1. Ministry Ownership & Event Authority'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'वचन अध्ययन शिविर 2026 का आयोजन सत्य वचन चर्च (Satya Vachan Church) के स्वामित्व एवं मार्गदर्शन में हो रहा है। शिविर में पंजीकरण कराने वाले सभी प्रतिभागी सत्य वचन चर्च द्वारा निर्धारित नियमों का पालन करने के लिए सहमत हैं।'
              : 'Vachan Shivir 2026 is fully owned and operated under the authority of Satya Vachan Church. By completing registration, all delegates agree to abide by the guidelines established by Satya Vachan Church.'}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '2. सहभागिता एवं उपस्थिति (Eligibility & Attendance)' : '2. Delegate Eligibility & Attendance'}
          </h2>
          <ul className="mt-3 space-y-2 text-slate-700 list-disc pl-5">
            <li>{lang === 'hi' ? 'शिविर में प्रवेश केवल 20 वर्ष या उससे अधिक आयु के भारतीय विश्वासियों, पास्टरों, प्राचीनों एवं अगुओं के लिए है।' : 'Registration is open to Indian believers, pastors, elders, and leaders aged 20 or above.'}</li>
            <li>{lang === 'hi' ? '26 अक्टूबर शाम 5:00 बजे से 29 अक्टूबर दोपहर 2:00 बजे तक सभी 4 दिनों के सत्रों में उपस्थिति अनिवार्य है।' : 'Full attendance across all 4 days of study sessions (26 Oct 5:00 PM to 29 Oct 2:00 PM) is mandatory.'}</li>
            <li>{lang === 'hi' ? 'सभी प्रतिभागियों से ईसाई भाईचारे, शांति एवं मसीही आचरण की अपेक्षा की जाती है।' : 'Delegates are expected to maintain exemplary Christian conduct and mutual respect throughout.'}</li>
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '3. आवास एवं भोजन दिशा-निर्देश (Lodging & Meal Rules)' : '3. Lodging & Boarding Guidelines'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? '₹3,000 का पूर्ण शिविर पास पूरी, ओडिशा में 3 रातों का साझा AC आवास (Check-in: 26 Oct 5 PM, Check-out: 29 Oct 2 PM) और 4 दिनों का भोजन कवर करता है। व्यक्तिगत अतिरिक्त व्यय प्रतिभागी का स्वयं का होगा।'
              : 'The ₹3,000 Full Pass covers 3 nights shared AC hotel stay in Puri, Odisha (Check-in 26 Oct 5 PM, Check-out 29 Oct 2 PM) and 4 days complete meals. Personal extra charges must be borne by the delegate.'}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '4. बौद्धिक संपदा (Intellectual Property)' : '4. Intellectual Property Rights'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'शिविर में प्रदान की जाने वाली सभी अध्ययन सामग्रियां, व्याख्यान नोट्स, ऑडियो/वीडियो रिकॉर्डिंग्स सत्य वचन चर्च की बौद्धिक संपदा हैं।'
              : 'All curriculum study guides, notes, publications, and session recordings remain the intellectual property of Satya Vachan Church.'}
          </p>
        </div>
      </div>
    </PoliciesLayout>
  );
}

export function RefundPolicy() {
  useDocumentMeta("Refund & Cancellation Policy — Vachan Shivir", "Cancellation and refund rules for Vachan Shivir 2026 under Satya Vachan Church.");
  const { language } = useLanguage();
  const lang = language;

  return (
    <PoliciesLayout activeTab="refund">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '1. शुल्क एवं प्रतिबद्धता (Registration Fee)' : '1. Registration Fee Commitment'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'वचन अध्ययन शिविर 2026 का पंजीकरण शुल्क ₹3,000 प्रति प्रतिभागी है। यह शुल्क पूरी, ओडिशा में होटल आवास, हॉल बुकिंग एवं भोजन प्रदाताओं को अग्रिम भुगतान हेतु उपयोग किया जाता है।'
              : 'The registration fee is ₹3,000 per delegate. This fee directly funds advance hotel lodging, venue reservations, and catering commitments made by Satya Vachan Church.'}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '2. रद्दीकरण एवं रिफंड नियम (Cancellation & Refund Terms)' : '2. Cancellation & Refund Timeline'}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-amber-800 font-bold text-xs uppercase font-mono">{lang === 'hi' ? '30+ दिन पूर्व (26 Sep से पहले)' : '30+ Days Prior'}</span>
              <p className="text-xl font-bold text-slate-900">80% Refund</p>
              <p className="text-xs text-slate-600">{lang === 'hi' ? '20% प्रशासनिक शुल्क काटा जाएगा।' : '20% retained for admin charges.'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-amber-800 font-bold text-xs uppercase font-mono">{lang === 'hi' ? '15 से 29 दिन पूर्व' : '15–29 Days Prior'}</span>
              <p className="text-xl font-bold text-slate-900">50% Refund</p>
              <p className="text-xs text-slate-600">{lang === 'hi' ? '50% अग्रिम व्यवस्था शुल्क।' : '50% retained for hotel lock-in.'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-amber-800 font-bold text-xs uppercase font-mono">{lang === 'hi' ? '14 दिन या कम (12 Oct के बाद)' : 'Within 14 Days'}</span>
              <p className="text-xl font-bold text-rose-700">No Refund</p>
              <p className="text-xs text-slate-600">{lang === 'hi' ? 'कमरा व भोजन अग्रिम बुक होने के कारण रिफंड अदेय।' : 'Non-refundable due to vendor lock-in.'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '3. पास स्थानांतरण (Pass Transferability)' : '3. Free Pass Transferability'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'यदि आप शिविर में उपस्थित होने में असमर्थ हैं, तो आप अपना पास किसी अन्य मसीही विश्वासी, पास्टर या अगुए को बिना किसी अतिरिक्त शुल्क के स्थानांतरित कर सकते हैं। इसके लिए आगमन से कम से कम 48 घंटे पूर्व 9696110134 पर संपर्क करें।'
              : 'If you are unable to attend, you may transfer your registration pass to another eligible church member or leader at NO extra charge by notifying us at 9696110134 at least 48 hours prior to check-in.'}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'hi' ? '4. आयोजक द्वारा स्थगन (Organizer Postponement)' : '4. Event Cancellation by Organizer'}
          </h2>
          <p className="mt-2 text-slate-700">
            {lang === 'hi'
              ? 'किसी प्राकृतिक आपदा या अप्रत्याशित परिस्थिति के कारण सत्य वचन चर्च द्वारा शिविर स्थगित या रद्द होने की स्थिति में, सभी प्रतिभागियों को 100% पूर्ण रिफंड या नई तिथियों में पास ट्रांसफर का विकल्प दिया जाएगा।'
              : 'In the rare event of postponement or cancellation by Satya Vachan Church due to severe force majeure, delegates will receive a 100% full refund or option to transfer to rescheduled dates.'}
          </p>
        </div>
      </div>
    </PoliciesLayout>
  );
}

export default function PoliciesRedirect() {
  const location = useLocation();
  if (location.pathname.includes('terms')) return <Terms />;
  if (location.pathname.includes('refund')) return <RefundPolicy />;
  return <PrivacyPolicy />;
}
