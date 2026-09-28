import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';
import { ScheduleSection } from '../../components/public/ScheduleSection';
import { QaSection } from '../../components/public/QaSection';
import { ConferenceVenueSection } from '../../components/public/ConferenceVenueSection';
import { DonationSection } from '../../components/public/DonationSection';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { BookOpen, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { listPublishedFaqs } from '../../services/documentService';

function CountdownBar() {
  const { t, language } = useLanguage();
  const isHindi = language === 'hi';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-26T17:00:00+05:30').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0B1D33] border-b-2 border-crossgold/40 text-white shadow-xl relative z-20">
      {/* 1. Signature Scripture Band - Seamlessly integrated */}
      <div className="w-full bg-[#122E52]/90 border-b border-crossgold/25 py-3.5 px-4 text-center">
        <div className="shell flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 text-xs sm:text-sm text-slate-100 font-medium">
          <span className="font-serif italic text-white text-xs sm:text-sm md:text-base leading-snug">
            {isHindi
              ? '“अपने आप को परमेश्वर का ग्रहणयोग्य और ऐसा काम करने वाला ठहराने का यत्न कर, जो लज्जित होने न पाए, और जो सत्य के वचन को ठीक रीति से काम में लाता हो।”'
              : '“Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.”'}
          </span>
          <span className="font-raleway font-black text-crossgold tracking-wider uppercase ml-1 shrink-0 text-xs sm:text-sm">
            — {isHindi ? '2 तीमुथियुस 2:15' : '2 Timothy 2:15'}
          </span>
        </div>
      </div>

      {/* 2. Live Countdown Bar - Seamless continuity */}
      <div className="py-4 px-4 sm:px-6">
        <div className="shell flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3 sm:gap-6 font-raleway">
            <div className="flex items-baseline gap-1.5">
              <span className="font-raleway font-black text-2xl sm:text-3xl tracking-tight text-crossgold">{String(timeLeft.days).padStart(3, '0')}</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">{t('countdown_days')}</span>
            </div>
            <span className="text-slate-600 text-lg font-light">|</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-raleway font-black text-2xl sm:text-3xl tracking-tight text-crossgold">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">{t('countdown_hours')}</span>
            </div>
            <span className="text-slate-600 text-lg font-light">|</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-raleway font-black text-2xl sm:text-3xl tracking-tight text-crossgold">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">{t('countdown_minutes')}</span>
            </div>
            <span className="text-slate-600 text-lg font-light">|</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-raleway font-black text-2xl sm:text-3xl tracking-tight text-crossgold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">{t('countdown_seconds')}</span>
            </div>
          </div>
          <div className="text-xs font-raleway font-black tracking-[0.15em] uppercase text-crossgold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-crossgold shrink-0" />
            <span>{t('countdown_until')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const event = useCurrentEvent();
  const isHindi = language === 'hi';
  useDocumentMeta(
    language === 'hi' ? `वचन अध्ययन शिविर 2026 — Puri, Odisha` : `Vachan Adhyayan Shivir 2026 — Puri, Odisha`,
    language === 'hi'
      ? `वचन अध्ययन शिविर 2026: 26 से 29 अक्टूबर, पूरी, ओडिशा। वचन अध्ययन की सही विधि, बाइबल आधारित प्रचार एवं इफिसियों की पत्री का अध्ययन।`
      : `Vachan Adhyayan Shivir 2026: 26-29 Oct 2026, Puri, Odisha. Expository Preaching, Hermeneutics and Ephesians study.`,
  );

  const faqs = listPublishedFaqs(db, event.id);

  return (
    <>
      {/* 1. HERO SECTION WITH SCRIPTURE BAND */}
      <Hero event={event} />

      {/* 2. LIVE COUNTDOWN BAR */}
      <CountdownBar />

      {/* 3. CROSSLIFE STYLE: WHAT IS VACHAN SHIVIR? (DEEP NAVY BAND) */}
      <section className="bg-navy text-white py-12 sm:py-16 lg:py-20 border-b-2 border-crossgold/40 relative overflow-hidden" style={{ backgroundColor: '#1B4980' }}>
        <div className="shell space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-raleway font-black tracking-[0.25em] text-crossgold uppercase bg-navy-950 px-4 py-1.5 rounded-full border border-crossgold/40 shadow-brutal-gold-sm" style={{ backgroundColor: '#0B1D33' }}>
              {isHindi ? 'शिविर का उद्देश्य' : 'CONFERENCE PURPOSE'}
            </span>
            <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-white">
              {isHindi ? (
                <>वचन अध्ययन शिविर <span className="text-crossgold">क्या है?</span></>
              ) : (
                <>WHAT IS <span className="text-crossgold">VACHAN SHIVIR?</span></>
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-sans leading-relaxed">
              {isHindi
                ? 'विश्वासयोग्य कलीसियाई अगुवों के निर्माण एवं परमेश्वर के वचन की खरी व्याख्या व व्याख्यात्मक प्रचार (Expository Preaching) का 4-दिवसीय राष्ट्रीय सम्मेलन।'
                : 'A 4-day national retreat dedicated to equipping faithful pastors and church leaders in sound biblical hermeneutics and expository preaching.'}
            </p>
            <div className="w-20 h-1.5 bg-crossgold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-crossgold/30 hover:border-crossgold p-6 rounded-2xl space-y-3 transition-all shadow-[3px_3px_0px_0px_#FBB33B]" style={{ backgroundColor: '#0F2B4D' }}>
              <div className="w-10 h-10 rounded-xl bg-crossgold text-navy-950 flex items-center justify-center font-black text-base">
                1
              </div>
              <h3 className="font-raleway font-black text-lg text-white">
                {isHindi ? 'खरी शिक्षा (Sound Doctrine)' : 'Sound Doctrine'}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {isHindi
                  ? 'इफिसियों की पत्री का मूल भाषा व संदर्भ सहित पद-दर-पद अध्ययन ताकि मसीही सिद्धांतों की गहरी समझ स्थापित हो सके।'
                  : 'Verse-by-verse examination of the Epistle to the Ephesians to establish deep theological grounding.'}
              </p>
            </div>

            <div className="border-2 border-crossgold/30 hover:border-crossgold p-6 rounded-2xl space-y-3 transition-all shadow-[3px_3px_0px_0px_#FBB33B]" style={{ backgroundColor: '#0F2B4D' }}>
              <div className="w-10 h-10 rounded-xl bg-crossgold text-navy-950 flex items-center justify-center font-black text-base">
                2
              </div>
              <h3 className="font-raleway font-black text-lg text-white">
                {isHindi ? 'व्याख्यात्मक प्रचार (Expository Preaching)' : 'Expository Preaching'}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {isHindi
                  ? 'पवित्रशास्त्र के सत्य को विश्वासयोग्यता और प्रामाणिकता के साथ कलीसिया के सम्मुख प्रस्तुत करने की प्रायोगिक विधि।'
                  : 'Practical workshops on sermon crafting, hermeneutical principles, and faithful pulpit ministry.'}
              </p>
            </div>

            <div className="border-2 border-crossgold/30 hover:border-crossgold p-6 rounded-2xl space-y-3 transition-all shadow-[3px_3px_0px_0px_#FBB33B]" style={{ backgroundColor: '#0F2B4D' }}>
              <div className="w-10 h-10 rounded-xl bg-crossgold text-navy-950 flex items-center justify-center font-black text-base">
                3
              </div>
              <h3 className="font-raleway font-black text-lg text-white">
                {isHindi ? 'अगुवों की संगति (Pastoral Fellowship)' : 'Pastoral Fellowship'}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {isHindi
                  ? 'पूरी, ओडिशा के शांत वातावरण में 4 दिन, 3 रातें एक साथ प्रार्थना, विचार-विमर्श और आत्मिक सहभागिता।'
                  : '4 days of united prayer, fellowship, and mutual encouragement along the tranquil coast of Puri, Odisha.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLYER HIGHLIGHTS: WHO SHOULD ATTEND & KEY TOPICS (CLEAN WHITE CONTRAST BAND) */}
      <section id="topics" className="bg-slate-50 text-slate-900 py-12 sm:py-16 lg:py-20 border-b-2 border-slate-200 relative overflow-hidden">
        <div className="shell space-y-10 sm:space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-raleway font-black tracking-[0.25em] text-navy uppercase bg-navy-100 px-4 py-1.5 rounded-full border border-navy/30">
              {t('topics_badge')}
            </span>
            <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-navy-950">
              {t('topics_heading')}
            </h2>
            <div className="w-16 h-1.5 bg-crossgold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Box 1: कौन ? (Who should attend?) */}
            <div className="bg-white border-2 border-navy rounded-3xl p-6 sm:p-10 shadow-brutal hover:shadow-[6px_6px_0px_0px_#FBB33B] transition-all relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-navy text-crossgold flex items-center justify-center font-bold shrink-0 border border-navy-900 shadow-sm">
                  <Users className="w-6 h-6 text-crossgold" />
                </div>
                <div>
                  <span className={`text-xs font-raleway font-black text-navy uppercase ${language === 'hi' ? 'tracking-normal' : 'tracking-wider'}`}>{t('who_badge')}</span>
                  <h3 className="font-raleway font-black text-xl sm:text-2xl text-slate-900">{t('who_title')}</h3>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-700 font-sans leading-relaxed">
                <li className="flex items-start gap-3 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-crossgold text-navy-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-navy-900">1</span>
                  <span><strong>{t('who_1')}</strong></span>
                </li>
                <li className="flex items-start gap-3 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-crossgold text-navy-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-navy-900">2</span>
                  <span><strong>{t('who_2')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-crossgold text-navy-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-navy-900">3</span>
                  <span><strong>{t('who_3')}</strong></span>
                </li>
              </ul>
            </div>

            {/* Box 2: विषय (Topics / Curriculum) */}
            <div className="bg-white border-2 border-navy rounded-3xl p-6 sm:p-10 shadow-brutal hover:shadow-[6px_6px_0px_0px_#FBB33B] transition-all relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-navy text-crossgold flex items-center justify-center font-bold shrink-0 border border-navy-900 shadow-sm">
                  <BookOpen className="w-6 h-6 text-crossgold" />
                </div>
                <div>
                  <span className={`text-xs font-raleway font-black text-navy uppercase ${language === 'hi' ? 'tracking-normal' : 'tracking-wider'}`}>{t('curr_badge')}</span>
                  <h3 className="font-raleway font-black text-xl sm:text-2xl text-slate-900">{t('curr_title')}</h3>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 font-sans leading-relaxed">
                <li className="flex items-center gap-3 bg-navy-50/70 border border-navy/20 p-3.5 sm:p-4 rounded-2xl">
                  <span className="w-6 h-6 rounded-lg bg-navy text-crossgold flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{t('topic_1')}</span>
                </li>
                <li className="flex items-center gap-3 bg-navy-50/70 border border-navy/20 p-3.5 sm:p-4 rounded-2xl">
                  <span className="w-6 h-6 rounded-lg bg-navy text-crossgold flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{t('topic_2')}</span>
                </li>
                <li className="flex items-center gap-3 bg-navy-50/70 border border-navy/20 p-3.5 sm:p-4 rounded-2xl">
                  <span className="w-6 h-6 rounded-lg bg-navy text-crossgold flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{t('topic_3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Contact Strip from Flyer */}
          <div className="bg-navy text-white border-2 border-crossgold/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-brutal-sm">
            <div>
              <div className="text-xs font-raleway font-black text-crossgold uppercase tracking-widest">{t('contact_title')}</div>
              <div className="mt-1 text-lg font-bold text-white">{t('contact_info')}</div>
              <div className="text-xs text-slate-300">{t('contact_website')}</div>
            </div>
            <div className="bg-crossgold text-navy-950 p-4 px-8 rounded-2xl font-black text-center border-2 border-navy-950 shadow-[3px_3px_0px_0px_#FFFFFF] shrink-0">
              <div className="text-[10px] tracking-widest uppercase font-raleway text-navy-900">{t('fee_tag')}</div>
              <div className="text-3xl font-raleway font-black">{t('fee_val')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REGISTRATION PASS CTA SECTION (CROSSLIFE NEO-BRUTALIST PASS) */}
      <section id="pricing" className="bg-white text-slate-900 py-12 sm:py-16 lg:py-20 border-b-2 border-slate-200 relative overflow-hidden">
        <div className="shell space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="inline-block text-xs font-raleway font-black tracking-[0.25em] text-navy uppercase bg-navy-100 px-4 py-1.5 rounded-full border border-navy/30">
              {t('cta_edition_badge')}
            </span>
            <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-navy-950">
              {t('cta_title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-sans">
              {t('cta_sub')}
            </p>
          </div>

          <div className="bg-navy-50/60 border-3 border-navy rounded-3xl p-8 sm:p-12 shadow-brutal relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-block bg-crossgold text-navy-950 border border-navy text-xs font-raleway font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                {t('cta_pass_tag')}
              </div>
              <h3 className="font-raleway font-black text-2xl sm:text-3xl text-navy-950">
                {t('cta_pass_title')}
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-sans text-left">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('cta_b1')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('cta_b2')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('cta_b3')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('cta_b4')}</span>
                </li>
              </ul>
            </div>

            <div className="text-center bg-white border-2 border-navy p-6 sm:p-8 rounded-2xl shrink-0 w-full md:w-auto space-y-4 shadow-[4px_4px_0px_0px_#FBB33B]">
              <div className={`text-xs font-raleway font-black text-navy uppercase ${language === 'hi' ? 'tracking-normal' : 'tracking-widest'}`}>
                {t('fee_tag')}
              </div>
              <div className="text-4xl sm:text-5xl font-raleway font-black text-navy-950">
                ₹ 3000 <span className="text-xs font-sans text-slate-500 font-normal">{t('cta_fee_only')}</span>
              </div>
              <p className="text-[11px] text-slate-500">{t('cta_includes')}</p>
              <Link
                to="/registration"
                className="w-full inline-flex items-center justify-center gap-2 bg-crossgold hover:bg-crossgold-dark text-navy-950 font-raleway font-black py-3.5 px-8 text-xs uppercase tracking-wider rounded-xl border-2 border-navy-950 shadow-[3px_3px_0px_0px_#1B4980] hover:shadow-[1px_1px_0px_0px_#1B4980] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <span>{t('hero_btn_register')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="text-center pt-2">
            <div className="text-xs font-medium text-navy-900 bg-navy-50 border border-navy/20 px-5 py-3 rounded-2xl inline-flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-crossgold shrink-0" />
              <span>{t('cta_limited')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SCHEDULE & TIMELINE */}
      <ScheduleSection />

      {/* 6. CONFERENCE VENUE & CONTACT */}
      <ConferenceVenueSection />

      {/* 7. MINISTRY DONATION & SPONSORSHIP */}
      <DonationSection />

      {/* 8. FAQ ACCORDION */}
      <QaSection faqs={faqs} />
    </>
  );
}

