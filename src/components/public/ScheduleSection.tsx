import { useState } from 'react';
import { Clock, MapPin, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

interface SessionItem {
  id: string;
  time: string;
  titleHi: string;
  titleEn: string;
  location: string;
  category: 'exposition' | 'workshop' | 'fellowship' | 'keynote' | 'closing';
  descriptionHi: string;
  descriptionEn: string;
}

const SHIVIR_SCHEDULE: Record<number, { dateHi: string; dateEn: string; titleHi: string; titleEn: string; sessions: SessionItem[] }> = {
  1: {
    dateHi: 'सोमवार, 26 अक्टूबर 2026',
    dateEn: 'Monday, Oct 26, 2026',
    titleHi: 'प्रथम दिवस: आगमन, पंजीकरण एवं उद्घाटन सत्र',
    titleEn: 'Day 1: Arrival, Registration & Opening Expositions',
    sessions: [
      {
        id: 's1-1',
        time: '05:00 PM – 06:30 PM',
        titleHi: 'प्रतिनिधि चेक-इन एवं किट वितरण',
        titleEn: 'Delegate Check-in & Registration Kit Distribution',
        location: 'Puri, Odisha Registration Desk',
        category: 'fellowship',
        descriptionHi: 'प्रतिनिधि कार्ड प्राप्त करें, कमरे का आवंटन एवं शिविर किट संग्रह करें।',
        descriptionEn: 'Receive delegate badge, room allocation, and conference study kit.',
      },
      {
        id: 's1-2',
        time: '07:00 PM – 09:00 PM',
        titleHi: 'उद्घाटन सत्र: सत्य का अध्ययन क्यों आवश्यक है?',
        titleEn: 'Opening Keynote: Why Proper Study of Truth Matters?',
        location: 'Main Conference Auditorium, Puri',
        category: 'keynote',
        descriptionHi: 'सत्य के वचन का सही अध्ययन, उद्देश्य और 4-दिवसीय शिविर की रूपरेखा।',
        descriptionEn: 'The necessity of sound biblical study, objectives, and overview of the 4-day retreat.',
      },
    ],
  },
  2: {
    dateHi: 'मंगलवार, 27 अक्टूबर 2026',
    dateEn: 'Tuesday, Oct 27, 2026',
    titleHi: 'द्वितीय दिवस: वचन अध्ययन की सही विधि एवं इफिसियों का अध्ययन',
    titleEn: 'Day 2: Hermeneutics & Ephesians (Ch. 1-3)',
    sessions: [
      {
        id: 's2-1',
        time: '09:00 AM – 11:30 AM',
        titleHi: 'विषय 1: वचन अध्ययन की सही विधि (Hermeneutics)',
        titleEn: 'Topic 1: Principles of Sound Biblical Interpretation (Hermeneutics)',
        location: 'Main Auditorium',
        category: 'exposition',
        descriptionHi: 'शास्त्र का सही अर्थ निकालने, ऐतिहासिक संदर्भ एवं विश्लेषणात्मक अध्ययन।',
        descriptionEn: 'Extracting the true intent of Scripture, historical context, and analytical study methods.',
      },
      {
        id: 's2-2',
        time: '03:00 PM – 05:30 PM',
        titleHi: 'विषय 2: इफिसियों की पत्री का गहन अध्ययन (अध्याय 1 से 3)',
        titleEn: 'Topic 2: Exposition of Ephesians (Chapters 1 to 3)',
        location: 'Main Auditorium',
        category: 'workshop',
        descriptionHi: 'मसीह में अनंत उद्धार, अनुग्रह और कलीसिया की पहचान एवं ईश्वर की योजना।',
        descriptionEn: 'Eternal salvation in Christ, sovereign grace, the church’s identity, and God’s eternal plan.',
      },
    ],
  },
  3: {
    dateHi: 'बुधवार, 28 अक्टूबर 2026',
    dateEn: 'Wednesday, Oct 28, 2026',
    titleHi: 'तृतीय दिवस: बाइबल आधारित प्रचार एवं इफिसियों का अध्ययन',
    titleEn: 'Day 3: Expository Preaching & Ephesians (Ch. 4-6)',
    sessions: [
      {
        id: 's3-1',
        time: '09:00 AM – 11:30 AM',
        titleHi: 'विषय 3: बाइबल आधारित प्रचार की तैयारी (Expository Preaching)',
        titleEn: 'Topic 3: Preparation & Practice of Expository Preaching',
        location: 'Main Auditorium',
        category: 'exposition',
        descriptionHi: 'व्याख्यात्मक प्रचार तैयार करने की व्यावहारिक रूपरेखा, रूपरेखा निर्माण एवं प्रभाव।',
        descriptionEn: 'Practical framework for crafting text-driven expository sermons and outlines.',
      },
      {
        id: 's3-2',
        time: '03:00 PM – 05:30 PM',
        titleHi: 'इफिसियों की पत्री का अध्ययन (अध्याय 4 से 6)',
        titleEn: 'Exposition of Ephesians (Chapters 4 to 6)',
        location: 'Main Auditorium',
        category: 'workshop',
        descriptionHi: 'कलीसियाई एकता, मसीही आचरण, मसीही परिवार और आत्मिक युद्ध।',
        descriptionEn: 'Church unity, Christian walk, biblical family structure, and spiritual warfare.',
      },
    ],
  },
  4: {
    dateHi: 'गुरुवार, 29 अक्टूबर 2026',
    dateEn: 'Thursday, Oct 29, 2026',
    titleHi: 'चतुर्थ दिवस: कलीसिया में शिक्षा, प्रमाण-पत्र एवं विदाई',
    titleEn: 'Day 4: Effective Teaching, Certificates & Farewell',
    sessions: [
      {
        id: 's4-1',
        time: '09:00 AM – 11:30 AM',
        titleHi: 'कलीसिया में प्रभावशाली शिक्षा देने के व्यावहारिक पहलू',
        titleEn: 'Practical Aspects of Teaching Effectively in Local Churches',
        location: 'Main Auditorium',
        category: 'exposition',
        descriptionHi: 'अगूवों एवं शिक्षकों के लिए कलीसिया में प्रभावशाली रीति से सिखाने की रणनीति।',
        descriptionEn: 'Strategies and pedagogical principles for pastors, elders, and Bible teachers.',
      },
      {
        id: 's4-2',
        time: '12:00 PM – 02:00 PM',
        titleHi: 'समापन सत्र, प्रमाण-पत्र एवं विदाई भोजन',
        titleEn: 'Closing Session, Certificate Distribution & Farewell Lunch',
        location: 'Main Dining Hall',
        category: 'closing',
        descriptionHi: 'विशेष समर्पण प्रार्थना, शिविर प्रमाण-पत्र वितरण एवं सामूहिक विदाई भोजन।',
        descriptionEn: 'Commissioning prayer, certificate distribution, and farewell fellowship lunch.',
      },
    ],
  },
};

export function ScheduleSection() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const { language } = useLanguage();
  const lang = language;
  const currentSchedule = SHIVIR_SCHEDULE[activeDay];

  const getCategoryBadge = (category: SessionItem['category']) => {
    const badgeClass = `text-[10px] font-bold px-3 py-1 rounded-full font-raleway ${lang === 'hi' ? 'tracking-normal' : 'tracking-wider uppercase'}`;
    switch (category) {
      case 'keynote':
        return <span className={`bg-navy text-white border border-navy shadow-2xs ${badgeClass}`}>{lang === 'hi' ? 'मुख्य व्याख्यान सत्र' : 'Keynote Exposition'}</span>;
      case 'exposition':
        return <span className={`bg-crossgold text-navy-950 border border-navy shadow-2xs ${badgeClass}`}>{lang === 'hi' ? 'व्याख्यान सत्र' : 'Exposition Session'}</span>;
      case 'workshop':
        return <span className={`bg-blue-100 text-blue-900 border border-blue-300 ${badgeClass}`}>{lang === 'hi' ? 'अध्ययन सत्र' : 'Study Workshop'}</span>;
      case 'fellowship':
        return <span className={`bg-emerald-100 text-emerald-900 border border-emerald-300 ${badgeClass}`}>{lang === 'hi' ? 'पंजीकरण एवं संगति' : 'Check-in & Registration'}</span>;
      case 'closing':
        return <span className={`bg-purple-100 text-purple-900 border border-purple-300 ${badgeClass}`}>{lang === 'hi' ? 'समापन एवं विदाई' : 'Closing & Lunch'}</span>;
      default:
        return null;
    }
  };

  return (
    <section id="schedule" className="bg-white text-slate-900 py-12 sm:py-16 lg:py-20 border-b-2 border-slate-200 relative overflow-hidden">
      <div className="shell space-y-10 sm:space-y-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.25em] text-navy uppercase font-raleway bg-navy-100 px-4 py-1.5 rounded-full border border-navy/30">
            <Calendar size={14} className="text-navy" />
            <span>{lang === 'hi' ? 'शिविर कार्यक्रम एवं समय-सारणी' : 'SHIVIR ITINERARY'}</span>
          </span>

          <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-navy-950 leading-tight">
            {lang === 'hi' ? '4-दिवसीय शिविर समय-सारणी' : '4-Day Shivir Schedule'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-2xl mx-auto">
            {lang === 'hi'
              ? '26 अक्टूबर शाम 5:00 बजे आगमन से लेकर 29 अक्टूबर दोपहर 2:00 बजे तक का संपूर्ण कार्यक्रम।'
              : 'Detailed schedule from Check-in on Oct 26 (5:00 PM) to Closing lunch on Oct 29 (2:00 PM).'}
          </p>

          <div className="w-16 h-1.5 bg-crossgold mx-auto rounded-full mt-2" />
        </div>

        {/* Day Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center p-1.5 bg-navy-50/80 border-2 border-navy/20 rounded-2xl shadow-sm gap-1.5">
            {[1, 2, 3, 4].map((dayNum) => {
              const dayData = SHIVIR_SCHEDULE[dayNum];
              const isActive = activeDay === dayNum;
              return (
                <button
                  key={dayNum}
                  onClick={() => setActiveDay(dayNum)}
                  className={cn(
                    'flex flex-col items-center px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all font-raleway',
                    isActive
                      ? 'bg-navy text-white shadow-[2px_2px_0px_#FBB33B] border-2 border-navy font-black'
                      : 'text-slate-700 hover:text-navy hover:bg-white',
                  )}
                >
                  <span className="font-mono text-[10px] uppercase font-extrabold opacity-80">
                    DAY 0{dayNum}
                  </span>
                  <span className="text-xs font-bold">
                    {lang === 'hi' ? dayData.dateHi.split(',')[1] : dayData.dateEn.split(',')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Day Title */}
        <div className="bg-navy-50/80 border-2 border-navy/20 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-brutal-sm">
          <div>
            <h3 className="font-raleway font-black text-xl sm:text-2xl text-navy-950">
              {lang === 'hi' ? currentSchedule.titleHi : currentSchedule.titleEn}
            </h3>
            <p className="text-xs text-navy font-raleway font-bold mt-1 flex items-center gap-2">
              <MapPin size={13} className="text-navy" />
              <span>Puri, Odisha &bull; {lang === 'hi' ? currentSchedule.dateHi : currentSchedule.dateEn}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-navy-950 bg-crossgold border-2 border-navy-950 px-3.5 py-1.5 rounded-xl shadow-2xs font-raleway">
            <CheckCircle2 size={15} className="text-navy-950" />
            <span>{lang === 'hi' ? 'सत्र निर्धारित' : 'Confirmed'}</span>
          </div>
        </div>

        {/* Session Timeline Items */}
        <div className="relative border-l-2 border-navy/30 ml-3 sm:ml-6 pl-6 sm:pl-10 space-y-6">
          {currentSchedule.sessions.map((item) => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-[31px] sm:-left-[47px] top-4 w-4 h-4 rounded-full bg-white border-2 border-navy group-hover:bg-crossgold transition-all shadow-sm" />

              <div className="bg-white border-2 border-navy/15 hover:border-navy rounded-2xl p-6 transition-all shadow-brutal-sm hover:shadow-brutal space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-raleway text-navy font-black">
                    <Clock size={14} className="text-crossgold" />
                    <span>{item.time}</span>
                  </div>
                  {getCategoryBadge(item.category)}
                </div>

                <div className="space-y-1">
                  <h4 className="font-raleway font-black text-base sm:text-lg text-slate-900 group-hover:text-navy transition-colors">
                    {lang === 'hi' ? item.titleHi : item.titleEn}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {lang === 'hi' ? item.descriptionHi : item.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-navy" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScheduleSection;

