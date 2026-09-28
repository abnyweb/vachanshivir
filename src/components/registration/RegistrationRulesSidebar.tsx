import React, { useState } from 'react';
import {
  MapPin,
  HelpCircle,
  FileText,
  User,
  BadgeCheck,
  BookOpen,
  Languages,
  Calendar,
  PhoneCall,
  Phone,
  MessageCircle,
  Clock,
  ChevronDown,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const REGISTRATION_FAQS = [
  {
    qNum: 1,
    qHi: 'वचन अध्ययन शिविर 2026 के लिए कौन पंजीकरण कर सकता है?',
    qEn: 'Who can register for Vachan Shivir 2026?',
    aHi: 'अगुवे जो सेवा में कार्यरत हैं, ऐसे लोग जो अगुवा बनने की इच्छा रखते हैं, और वचन में बढ़ना चाहते हैं।',
    aEn: 'Active ministry leaders, aspiring church leaders, and believers passionate to grow in God’s Word.',
    icon: User,
  },
  {
    qNum: 2,
    qHi: 'किसी व्यक्ति को वचन अध्ययन शिविर में क्यों भाग लेना चाहिए?',
    qEn: 'Why should one attend this retreat?',
    aHi: 'वचन को गहराई में समझने के लिए, अपने जीवन में लागू करने के लिए, और विश्वासयोग्यता से प्रचार करने के लिए आपको आना चाहिए।',
    aEn: 'To deeply understand biblical scripture, apply it to daily life, and faithfully preach expository sermons.',
    icon: BadgeCheck,
  },
  {
    qNum: 3,
    qHi: 'वचन अध्ययन शिविर 2026 की विशेषता क्या है?',
    qEn: 'What is the special feature of this retreat?',
    aHi: 'विश्वासयोग्य अगुवों के द्वारा खरी शिक्षा का प्रचार और इफिसियों की पत्री का विशेष अध्ययन।',
    aEn: 'Sound biblical teaching by faithful leaders and in-depth verse-by-verse study of Ephesians.',
    icon: BookOpen,
  },
  {
    qNum: 4,
    qHi: 'शिविर के सत्र किस भाषा में आयोजित किए जाएंगे?',
    qEn: 'In which language will sessions be conducted?',
    aHi: 'सभी सत्र हिन्दी भाषा में आयोजित किए जाएंगे।',
    aEn: 'All teaching sessions and workshops will be conducted in Hindi.',
    icon: Languages,
  },
  {
    qNum: 5,
    qHi: 'वचन अध्ययन शिविर 2026 कब आयोजित किया जाएगा?',
    qEn: 'When will the retreat take place?',
    aHi: '26 अक्टूबर शाम 5:00 बजे से 29 अक्टूबर दोपहर 1:00 बजे तक (4 दिन, 3 रातें)।',
    aEn: '26 October (5:00 PM check-in) to 29 October (1:00 PM closing) — 4 days, 3 nights.',
    icon: Calendar,
  },
  {
    qNum: 6,
    qHi: 'शिविर कहाँ आयोजित किया जाएगा?',
    qEn: 'Where is the retreat venue located?',
    aHi: 'ईशोपंथी आश्रम, बालियापंडा रोड, लाइट हाउस के पास, पूरी, ओडिशा – 752001',
    aEn: 'Ishopanthi Ashram, Baliapanda Road, Near Light House, Puri, Odisha – 752001',
    icon: MapPin,
  },
  {
    qNum: 7,
    qHi: 'रजिस्ट्रेशन फीस कितनी है?',
    qEn: 'What is the registration fee?',
    aHi: 'रजिस्ट्रेशन फीस ₹3,000 है (आवास, 4 दिनों का भोजन व अध्ययन किट शामिल)। स्कॉलरशिप हेतु कॉल करें: 9696110134',
    aEn: 'Registration fee is ₹3,000 (includes lodging, 4 days complete meals & study kit). For scholarship support, call: +91 9696110134',
    icon: PhoneCall,
    highlight: true,
  },
];

interface RegistrationRulesSidebarProps {
  initialTab?: 'instructions' | 'qa';
}

export const RegistrationRulesSidebar: React.FC<RegistrationRulesSidebarProps> = ({
  initialTab = 'instructions',
}) => {
  const { language } = useLanguage();
  const lang = language;
  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState<'instructions' | 'qa'>(initialTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(7); // Q7 expanded by default

  return (
    <aside className="w-full bg-white text-slate-800 border-2 border-navy/20 rounded-3xl p-5 sm:p-6 space-y-5 shadow-brutal-sm font-sans sticky top-20">
      {/* Tab Switcher: Instructions vs Q&A (CrossLife Neo-Brutalist Tabs) */}
      <div className="flex items-center p-1 bg-navy-50/80 rounded-2xl border-2 border-navy/20">
        <button
          type="button"
          onClick={() => setActiveTab('instructions')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-raleway font-bold transition-all ${
            activeTab === 'instructions'
              ? 'bg-navy text-white shadow-sm border border-navy font-black'
              : 'text-slate-600 hover:text-navy'
          }`}
        >
          <FileText size={14} className={activeTab === 'instructions' ? 'text-crossgold' : 'text-slate-400'} />
          <span>{isHi ? 'निर्देश व नियम' : 'Instructions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-raleway font-black transition-all ${
            activeTab === 'qa'
              ? 'bg-crossgold text-navy-950 shadow-sm border border-navy-950'
              : 'text-slate-600 hover:text-navy'
          }`}
        >
          <HelpCircle size={14} className={activeTab === 'qa' ? 'text-navy-950' : 'text-navy'} />
          <span>{isHi ? 'प्रश्न-उत्तर (Q&A)' : 'Q&A / FAQs'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'qa' ? 'bg-navy text-white font-bold' : 'bg-navy-100 text-navy-900 font-bold'
          }`}>
            7
          </span>
        </button>
      </div>

      {/* TAB 1: INSTRUCTIONS & SHIVIR GUIDELINES */}
      {activeTab === 'instructions' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Shivir Theme Card */}
          <div className="bg-navy-50/70 border-2 border-navy/30 rounded-2xl p-4 text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-raleway font-black tracking-widest text-crossgold uppercase bg-navy px-3 py-1 rounded-full border border-crossgold/50 inline-block shadow-brutal-gold-sm">
              {isHi ? 'शिविर विषय 2026' : 'RETREAT THEME 2026'}
            </span>
            <h3 className="font-raleway font-black text-lg text-navy-950 leading-snug">
              {isHi ? 'वचन अध्ययन की सही विधि' : 'Biblical Hermeneutics & Expository Preaching'}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {isHi
                ? 'इफिसियों की पत्री का विशेष अध्ययन एवं बाइबल आधारित प्रचार कला'
                : 'Verse-by-verse study on Ephesians and expository preaching fundamentals'}
            </p>
          </div>

          {/* Key Guidelines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={14} />
              <span>{isHi ? 'महत्वपूर्ण दिशा-निर्देश' : 'Key Guidelines'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHi ? '₹3,000 ऑल-इनक्लूसिव पास:' : '₹3,000 All-Inclusive Pass:'}</strong>{' '}
                  {isHi
                    ? '3 रातें आश्रम आवास, 4 दिन सम्पूर्ण सात्विक भोजन, एवं अध्ययन सामग्री शामिल है।'
                    : 'Includes 3 nights stay, 4 days complete meals, delegate badge & study kits.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHi ? 'हिन्दी माध्यम:' : 'Medium of Instruction:'}</strong>{' '}
                  {isHi ? 'सभी सत्र एवं प्रश्नोत्तरी पूर्णतः हिन्दी में होंगी।' : 'All study sessions and discussions will be in Hindi.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHi ? 'अनिवार्य उपस्थिति:' : 'Full Attendance:'}</strong>{' '}
                  {isHi ? 'प्रतिभागियों को सभी 4 दिनों के प्रत्येक सत्र में उपस्थित रहना आवश्यक है।' : 'Full attendance in all sessions across all 4 days is required.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHi ? 'सीमित स्थान:' : 'Limited Capacity:'}</strong>{' '}
                  {isHi ? 'आश्रम में स्थान सीमित है, अतः अग्रिम पंजीकरण आवश्यक है।' : 'Seats and rooms are strictly limited. Advance booking recommended.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Schedule Summary */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} />
              <span>{isHi ? 'समय-सारणी' : 'Event Schedule'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">{isHi ? 'आगमन / चेक-इन' : 'Arrival'}</span>
                <strong className="text-slate-900 block mt-0.5">{isHi ? '26 Oct, शाम 5:00' : '26 Oct, 5:00 PM'}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">{isHi ? 'समापन' : 'Closing'}</span>
                <strong className="text-slate-900 block mt-0.5">{isHi ? '29 Oct, दोपहर 1:00' : '29 Oct, 1:00 PM'}</strong>
              </div>
            </div>
          </div>

          {/* Venue Notice */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <MapPin size={14} className="text-amber-600 shrink-0" />
              <span>{isHi ? 'ईशोपंथी आश्रम, पूरी, ओडिशा' : 'Ishopanthi Ashram, Puri, Odisha'}</span>
            </div>
            <p className="text-[11px] text-slate-500 pl-5">
              {isHi
                ? 'बालियापंडा रोड, लाइट हाउस के निकट, पूरी – 752001'
                : 'Baliapanda Road, Near Light House, Puri – 752001'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS & ANSWERS (Q&A / FAQs) */}
      {activeTab === 'qa' && (
        <div className="space-y-3 animate-fadeIn max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-xs text-slate-500 pb-1 flex items-center justify-between">
            <span>{isHi ? 'सभी 7 सामान्य प्रश्न एवं उत्तर' : 'All 7 Questions & Answers'}</span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">{isHi ? 'टैप करके पढ़ें' : 'Tap to read'}</span>
          </div>

          {REGISTRATION_FAQS.map((faq) => {
            const isExpanded = expandedFaq === faq.qNum;
            return (
              <div
                key={faq.qNum}
                className={`rounded-2xl border transition-all ${
                  faq.highlight
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/20'
                    : isExpanded
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : faq.qNum)}
                  className="w-full p-3 flex items-start gap-2.5 text-left"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    faq.highlight ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {faq.qNum}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 leading-snug block">
                      {isHi ? faq.qHi : faq.qEn}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 shrink-0 transition-transform mt-1 ${isExpanded ? 'rotate-180 text-amber-600' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 text-xs text-slate-700 leading-relaxed pl-11 font-sans">
                    <p>{isHi ? faq.aHi : faq.aEn}</p>
                    {faq.highlight && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center gap-2">
                        <a
                          href="tel:9696110134"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs"
                        >
                          <Phone size={12} />
                          <span>{isHi ? 'हेल्पलाइन कॉल: 9696110134' : 'Call: 9696110134'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Helplines Strip */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 uppercase font-bold">{isHi ? 'सहायता हेल्पलाइन' : 'HELPLINE'}</span>
          <div className="flex items-center gap-2">
            <a
              href="tel:9696110134"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-800 font-bold text-xs border border-slate-200 transition"
              title="Call Helpline"
            >
              <Phone size={12} className="text-amber-600" />
              <span>9696110134</span>
            </a>
            <a
              href="https://wa.me/919696110134"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={12} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RegistrationRulesSidebar;
