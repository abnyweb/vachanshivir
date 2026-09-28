import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';

export const ConferenceVenueSection: React.FC = () => {
  const { language } = useLanguage();
  const lang = language;

  return (
    <section id="venue" className="bg-slate-50 text-slate-900 py-12 sm:py-16 lg:py-20 border-b-2 border-slate-200 relative overflow-hidden">
      <div className="shell max-w-5xl mx-auto space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.25em] text-navy uppercase font-raleway bg-navy-100 px-4 py-1.5 rounded-full border border-navy/30">
            <MapPin className="w-3.5 h-3.5 text-navy" />
            <span>{lang === 'hi' ? 'शिविर स्थल' : 'VENUE LOCATION'}</span>
          </span>
          <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-navy-950">
            {lang === 'hi' ? 'स्थान एवं संपर्क विवरण' : 'Venue & Contact Information'}
          </h2>
          <div className="w-16 h-1.5 bg-crossgold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Venue Location Card */}
          <div className="bg-white border-2 border-navy rounded-3xl p-6 sm:p-10 shadow-brutal space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy/30 text-navy text-xs font-raleway font-bold px-3.5 py-1 rounded-full uppercase">
                <MapPin className="w-3.5 h-3.5 text-navy" />
                <span>{lang === 'hi' ? 'पूरी, ओडिशा' : 'Puri, Odisha'}</span>
              </div>
              <h3 className="font-raleway font-black text-2xl sm:text-3xl text-navy-950">
                {lang === 'hi' ? 'वचन अध्ययन शिविर 2026 स्थल' : 'Vachan Adhyayan Shivir 2026 Venue'}
              </h3>
              <p className="text-sm text-slate-600 font-sans leading-relaxed">
                {lang === 'hi'
                  ? 'ईशोपंथी आश्रम, पूरी, ओडिशा। सुंदर एवं शांत वातावरण में 4 दिनों का आध्यात्मिक एवं वचन केंद्रित अध्ययन।'
                  : 'Ishopanthi Ashram, Puri, Odisha. A peaceful coastal venue conducive to focused 4-day biblical study and fellowship.'}
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700 font-sans border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-navy shrink-0" />
                  <span><strong className="text-slate-900">{lang === 'hi' ? 'दिनांक:' : 'Dates:'}</strong> {lang === 'hi' ? '26 - 29 अक्टूबर 2026' : '26 - 29 October 2026'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-navy shrink-0" />
                  <span><strong className="text-slate-900">{lang === 'hi' ? 'आगमन (Check-in):' : 'Check-in:'}</strong> {lang === 'hi' ? '26 अक्टूबर (शाम 5:00 बजे)' : '26 Oct (5:00 PM)'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-navy shrink-0" />
                  <span><strong className="text-slate-900">{lang === 'hi' ? 'समापन (Closing):' : 'Closing:'}</strong> {lang === 'hi' ? '29 अक्टूबर (दोपहर 2:00 बजे तक)' : '29 Oct (Up to 2:00 PM)'}</span>
                </div>
              </div>
            </div>

            <Button
              to="/registration"
              variant="gold"
              className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-center"
            >
              {lang === 'hi' ? 'पंजीकरण करें (₹3,000)' : 'Register Now (₹3,000)'}
            </Button>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border-2 border-navy rounded-3xl p-6 sm:p-10 shadow-brutal space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-raleway font-black text-navy uppercase tracking-widest">
                  {lang === 'hi' ? 'अधिक जानकारी के लिए' : 'FOR ENQUIRIES & HELP'}
                </span>
                <h3 className="font-raleway font-black text-2xl text-navy-950 mt-1">
                  {lang === 'hi' ? 'संपर्क सूत्र' : 'Contact Helplines'}
                </h3>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:9696110134"
                  className="flex items-center gap-4 bg-navy-50/60 border-2 border-navy/20 p-4 rounded-2xl hover:border-navy hover:bg-navy-50 transition-colors shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-navy text-crossgold flex items-center justify-center shrink-0 border border-navy shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-raleway font-bold text-navy">{lang === 'hi' ? 'फोन संपर्क' : 'Phone Helpline'}</div>
                    <div className="text-base font-black text-slate-900 font-mono">9696110134</div>
                  </div>
                </a>

                <Link
                  to="/contact"
                  className="flex items-center gap-4 bg-navy-50/60 border-2 border-navy/20 p-4 rounded-2xl hover:border-navy hover:bg-navy-50 transition-colors shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-navy text-crossgold flex items-center justify-center shrink-0 border border-navy shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-raleway font-bold text-navy">{lang === 'hi' ? 'ऑनलाइन सहायता' : 'Online Support'}</div>
                    <div className="text-base font-bold text-slate-900">{lang === 'hi' ? 'संपर्क फॉर्म भेजें' : 'Send Enquiry Message'}</div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-navy-50 border-2 border-navy/20 p-4 rounded-2xl text-center text-xs text-navy font-bold font-raleway">
              {lang === 'hi' ? 'आवास एवं भोजन की व्यवस्था सीमित है।' : 'Accommodation & meals included for registered delegates.'}
            </div>
          </div>
        </div>

        {/* Google Maps Cloud Location Interactive Embed */}
        <div className="bg-white border-2 border-navy rounded-3xl overflow-hidden shadow-brutal p-2">
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-navy-50/60 rounded-2xl mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-navy text-crossgold flex items-center justify-center font-bold">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-navy-950 font-raleway">
                  {lang === 'hi' ? 'ईशोपंथी आश्रम, पूरी, ओडिशा (शिविर स्थल)' : 'Ishopanthi Ashram, Puri, Odisha (Event Venue)'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Google Maps Geolocation: 19.8135° N, 85.8312° E
                </div>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Ishopanthi+Ashram+Puri+Odisha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy text-crossgold text-xs font-bold font-raleway hover:bg-navy-900 transition-colors shadow-2xs"
            >
              <span>{lang === 'hi' ? 'Google Maps पर नेविगेट करें' : 'Open in Google Maps'}</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200">
            <iframe
              title="Google Map Venue Location"
              src="https://maps.google.com/maps?q=Ishopanthi%20Ashram,%20Puri,%20Odisha,%20India&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConferenceVenueSection;

