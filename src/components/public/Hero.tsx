import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowRight, Sparkles, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';
import type { EventEdition } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export function Hero({ event }: { event: EventEdition }) {
  const { t, language } = useLanguage();
  const eventYear = event?.year || 2026;
  const isHindi = language === 'hi';

  // CrossLife inspired rotating concept words
  const rotatingWordsHi = ['सत्य वचन', 'खरी समझ', 'विश्वासयोग्यता', 'सुसमाचार प्रचार'];
  const rotatingWordsEn = ['Sound Doctrine', 'Accurate Handling', 'Faithful Ministry', 'Gospel Preaching'];
  const words = isHindi ? rotatingWordsHi : rotatingWordsEn;

  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveWordIdx((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 250);
    }, 2800);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <section className="relative isolate overflow-hidden bg-[#071322] text-white min-h-[90vh] lg:min-h-[94vh] flex flex-col justify-center">
      {/* Background Stage Photography (CrossLife Podium & Auditorium Stage) */}
      <img
        src="/assets/hero-stage-podium.jpg"
        alt="Vachan Adhyayan Shivir Expository Stage"
        width={1600}
        height={1066}
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[78%_center] lg:object-[82%_center] brightness-[0.58] contrast-[1.12] select-none"
      />

      {/* Asymmetric Studio Gradient Overlays - Left dark contrast for text, Right open for warm stage spotlight */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071322] via-[#071322]/90 via-40% md:via-50% to-[#071322]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071322] via-transparent to-[#071322]/65" />

      {/* Ambient Warm Golden Stage Lighting Glow (CrossLife Signature Golden Halo) */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none -z-10 opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #FBB33B 0%, rgba(251,179,59,0) 70%)' }}
      />
      <div
        className="absolute top-1/4 right-[8%] w-[28rem] h-[28rem] rounded-full pointer-events-none -z-10 opacity-25 blur-3xl hidden md:block"
        style={{ background: 'radial-gradient(circle, #FBB33B 0%, rgba(27,73,128,0) 70%)' }}
      />

      <div className="shell pt-10 sm:pt-16 pb-28 sm:pb-16 lg:pb-20 animate-riseIn relative z-10">
        <div className="max-w-4xl space-y-5 sm:space-y-7">
          
          {/* Top Eyebrow Badges (CrossLife Pill Header Style) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Live Event Date & Location Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1D33]/90 border border-crossgold/60 text-crossgold text-[11px] sm:text-xs font-raleway font-black tracking-wider uppercase backdrop-blur-md shadow-brutal-gold-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crossgold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-crossgold"></span>
              </span>
              <span>{isHindi ? '२६ – २९ अक्टूबर २०२६ • पूरी, ओडिशा' : '26 – 29 OCTOBER 2026 • PURI, ODISHA'}</span>
            </div>

            {/* Organizer Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-[10px] sm:text-[11px] font-raleway font-bold tracking-wide backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-crossgold" />
              <span>{isHindi ? 'इशोपंथी आश्रम द्वारा आयोजित' : 'Organized by Ishopanthi Ashram'}</span>
            </div>
          </div>

          {/* Main Title & CrossLife Concept Subheading */}
          <div className="space-y-3">
            <h1 className="font-raleway font-black text-3xl sm:text-5xl lg:text-7xl tracking-tight text-white leading-[1.08]">
              {isHindi ? 'वचन अध्ययन शिविर' : 'Vachan Adhyayan Shivir'}{' '}
              <span className="text-crossgold underline decoration-crossgold/40 underline-offset-8 inline-block drop-shadow-[0_2px_14px_rgba(251,179,59,0.35)]">
                {eventYear}
              </span>
            </h1>

            {/* CrossLife Rotating Concept Word Animation */}
            <div className="flex items-center gap-2 text-base sm:text-2xl font-raleway font-bold text-slate-200">
              <span className="text-crossgold tracking-wider uppercase font-black text-sm sm:text-xl">
                {isHindi ? 'एक लक्ष्य •' : 'One Desire •'}
              </span>
              <span
                className={`inline-block px-2.5 sm:px-3 py-0.5 rounded-lg bg-crossgold/15 border border-crossgold/40 text-crossgold font-black text-sm sm:text-xl transition-all duration-300 transform ${
                  fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
                }`}
              >
                {words[activeWordIdx]}
              </span>
            </div>

            {/* Scripture Anchor Card (CrossLife 1 Tim / 2 Tim Style) */}
            <div className="relative pl-3.5 sm:pl-5 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-r-2xl bg-white/[0.04] backdrop-blur-md border-l-4 border-crossgold max-w-3xl space-y-1">
              <p className="text-xs sm:text-base text-slate-100 font-serif italic leading-relaxed">
                {isHindi
                  ? '“अपने आप को परमेश्वर का ग्रहणयोग्य और ऐसा काम करनेवाला ठहराने का यत्न कर, जो लज्जित होने न पाए, और जो सत्य के वचन को ठीक रीति से काम में लाता हो।”'
                  : '“Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.”'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-raleway font-black text-crossgold uppercase tracking-wider">
                  — {isHindi ? '2 तीमुथियुस 2:15' : '2 Timothy 2:15'}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-[10px] sm:text-xs text-slate-300 font-sans">
                  {isHindi ? 'शिविर का केंद्रीय उद्देश्य' : 'Conference Key Mandate'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Key Facts Strip (CrossLife Glassmorphic Cards Dock) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            {/* Card 1: Dates */}
            <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-[#0B1D33]/90 border border-crossgold/40 backdrop-blur-md flex items-start gap-3 shadow-brutal-sm hover:border-crossgold transition-colors">
              <div className="p-2 rounded-lg bg-crossgold/15 text-crossgold shrink-0 mt-0.5 border border-crossgold/30">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <dt className="text-[10px] font-raleway font-black text-crossgold uppercase tracking-wider">
                  {t('hero_dates_label')}
                </dt>
                <dd className="mt-0.5 font-bold text-white text-xs sm:text-sm">
                  {isHindi ? '26 – 29 अक्टूबर 2026' : '26 – 29 October 2026'}
                </dd>
                <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                  {isHindi ? 'सोमवार 5:00 PM से गुरुवार 2:00 PM' : 'Mon 5:00 PM to Thu 2:00 PM'}
                </p>
              </div>
            </div>

            {/* Card 2: Venue */}
            <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-[#0B1D33]/90 border border-crossgold/40 backdrop-blur-md flex items-start gap-3 shadow-brutal-sm hover:border-crossgold transition-colors">
              <div className="p-2 rounded-lg bg-crossgold/15 text-crossgold shrink-0 mt-0.5 border border-crossgold/30">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <dt className="text-[10px] font-raleway font-black text-crossgold uppercase tracking-wider">
                  {t('hero_venue_label')}
                </dt>
                <dd className="mt-0.5 font-bold text-white text-xs sm:text-sm">
                  {isHindi ? 'इशोपंथी आश्रम, पूरी' : 'Ishopanthi Ashram, Puri'}
                </dd>
                <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                  {isHindi ? 'पूरी, ओडिशा (समुद्र तट के निकट)' : 'Puri, Odisha (Near Coast)'}
                </p>
              </div>
            </div>

            {/* Card 3: Delegate Pass */}
            <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-[#0B1D33]/90 border border-crossgold/40 backdrop-blur-md flex items-start gap-3 shadow-brutal-sm hover:border-crossgold transition-colors">
              <div className="p-2 rounded-lg bg-crossgold/15 text-crossgold shrink-0 mt-0.5 border border-crossgold/30">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <dt className="text-[10px] font-raleway font-black text-crossgold uppercase tracking-wider">
                  {t('hero_fee_label')}
                </dt>
                <dd className="mt-0.5 font-black text-crossgold text-sm sm:text-base">
                  ₹ 3,000 <span className="text-[11px] font-medium text-slate-200">{isHindi ? 'मात्र' : 'Only'}</span>
                </dd>
                <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                  {isHindi ? '३ दिन संपूर्ण भोजन एवं आवास सहित' : '3 Days Full Stay & Meals Included'}
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs (CrossLife Neo-Brutalist 3D Buttons) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Link
              to="/registration"
              className="inline-flex items-center justify-center gap-2.5 bg-crossgold hover:bg-crossgold-dark text-navy-950 font-raleway font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl border-2 border-navy-950 shadow-[3px_3px_0px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] transition-all text-center group"
            >
              <span>{t('hero_btn_register')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#topics"
              className="inline-flex items-center justify-center font-raleway font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl text-center bg-white/10 hover:bg-white/15 text-white border-2 border-white/40 shadow-[2px_2px_0px_0px_#FBB33B] hover:shadow-[1px_1px_0px_0px_#FBB33B] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              {t('hero_btn_topics')}
            </a>

            <a
              href="#schedule"
              className="inline-flex items-center justify-center font-raleway font-semibold text-xs text-slate-300 hover:text-crossgold px-3 py-2 text-center transition-colors underline-offset-4 hover:underline"
            >
              {isHindi ? 'समय-सारणी देखें →' : 'View Schedule →'}
            </a>
          </div>

          {/* CrossLife Style 3 Core Pillars Micro-Strip */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-crossgold shrink-0" />
              <span>{isHindi ? 'व्याख्यात्मक वचन प्रचार' : 'Expository Preaching'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-crossgold shrink-0" />
              <span>{isHindi ? 'खरी बाइबल समझ' : 'Sound Hermeneutics'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-crossgold shrink-0" />
              <span>{isHindi ? 'मसीही संगति व संवाद' : 'Pastoral Fellowship'}</span>
            </div>
          </div>

          {/* Urgent Seat Alert Pill */}
          <div className="pt-0.5">
            <div className="inline-flex items-center gap-2 text-xs text-crossgold bg-crossgold/10 border border-crossgold/30 px-3.5 py-1.5 rounded-xl font-medium backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-crossgold shrink-0 animate-pulse" />
              <span>{t('hero_urgent_alert')}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
