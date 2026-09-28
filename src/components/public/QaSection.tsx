import { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import type { Faq } from '../../types';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

interface DualFaq {
  id: string;
  categoryEn: string;
  categoryHi: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

const DUAL_FAQS: DualFaq[] = [
  {
    id: 'faq-1',
    categoryEn: 'Eligibility',
    categoryHi: 'पात्रता',
    questionEn: 'Who can register for Vachan Adhyayan Shivir 2026?',
    questionHi: 'वचन अध्ययन शिविर 2026 में कौन पंजीकरण कर सकता है?',
    answerEn: 'Registration is open to believers, Bible teachers, pastors, elders, and church leaders across India who wish to deepen their understanding of God\'s Word and expository preaching.',
    answerHi: 'पंजीकरण भारत भर के सभी विश्वासियों, बाइबल शिक्षकों, पास्टरों, प्राचीनों एवं कलीसियाई अगुवों के लिए खुला है जो ईश्वर के वचन और व्याख्यात्मक प्रचार (Expository Preaching) का गहरा अध्ययन करना चाहते हैं।',
  },
  {
    id: 'faq-2',
    categoryEn: 'About Shivir',
    categoryHi: 'शिविर विवरण',
    questionEn: 'Why should anyone attend Vachan Adhyayan Shivir?',
    questionHi: 'वचन अध्ययन शिविर में भाग क्यों लेना चाहिए?',
    answerEn: 'Vachan Adhyayan Shivir is a focused 4-day intensive retreat designed to equip attendees with proper hermeneutical methods, expository preaching skills, and in-depth study of the Scriptures (Epistle to the Ephesians).',
    answerHi: 'वचन अध्ययन शिविर 4 दिनों का एक गहन अध्ययन शिविर है जो प्रतिभागियों को सही बाइबिल व्याख्या शास्त्र, प्रचार कला एवं इफिसियों की पत्री का गहराई से अध्ययन कराने के लिए तैयार किया गया है।',
  },
  {
    id: 'faq-3',
    categoryEn: 'About Shivir',
    categoryHi: 'शिविर विवरण',
    questionEn: 'What is unique about Vachan Adhyayan Shivir 2026?',
    questionHi: 'वचन अध्ययन शिविर 2026 की क्या विशेषताएँ हैं?',
    answerEn: 'It provides a clear, practical framework for studying the Bible accurately, preparing expositional sermons, and applying biblical truths in the local church context with fellow believers.',
    answerHi: 'यह बाइबल को सटीकता से समझने, व्याख्यात्मक संदेश तैयार करने और स्थानीय कलीसिया में बाइबलीय सच्चाइयों को लागू करने के लिए व्यावहारिक एवं स्पष्ट ढांचा प्रदान करता है।',
  },
  {
    id: 'faq-4',
    categoryEn: 'Eligibility',
    categoryHi: 'पात्रता',
    questionEn: 'What language will the sessions be conducted in?',
    questionHi: 'सत्रों की मुख्य भाषा क्या होगी?',
    answerEn: 'The primary medium of instruction and teaching is Hindi (हिन्दी), making it accessible to believers and leaders across Hindi-speaking and multi-lingual congregations.',
    answerHi: 'शिक्षण और सभी सत्रों का मुख्य माध्यम हिंदी (Hindi) रहेगा, ताकि हिंदी भाषी एवं बहुभाषी कलीसियाओं के अगुवे और विश्वासी आसानी से समझ सकें।',
  },
  {
    id: 'faq-5',
    categoryEn: 'Dates',
    categoryHi: 'दिनांक',
    questionEn: 'When will Vachan Shivir 2026 take place?',
    questionHi: 'वचन शिविर 2026 कब आयोजित होगा?',
    answerEn: 'The retreat takes place from 26 October to 29 October 2026. Check-in starts at 5:00 PM on 26 October, and the event concludes after lunch at 2:00 PM on 29 October.',
    answerHi: 'शिविर 26 अक्टूबर से 29 अक्टूबर 2026 तक आयोजित होगा। आगमन (Check-in) 26 अक्टूबर शाम 5:00 बजे से शुरू होगा और समापन 29 अक्टूबर दोपहर 2:00 बजे भोजन के बाद होगा।',
  },
  {
    id: 'faq-6',
    categoryEn: 'Venue & Travel',
    categoryHi: 'स्थल एवं यात्रा',
    questionEn: 'Where will Vachan Shivir 2026 take place?',
    questionHi: 'वचन शिविर 2026 का आयोजन कहाँ होगा?',
    answerEn: 'Vachan Shivir 2026 will take place in Puri, Odisha. Detailed travel directions and venue guidance are provided upon registration confirmation.',
    answerHi: 'वचन शिविर 2026 का आयोजन पूरी, ओडिशा में होगा। पंजीकरण की पुष्टि के बाद यात्रा संबंधी संपूर्ण मार्गदर्शिका प्रदान की जाएगी।',
  },
  {
    id: 'faq-7',
    categoryEn: 'Accommodation',
    categoryHi: 'आवास व्यवस्था',
    questionEn: 'What is included in the Full Camp Pass?',
    questionHi: '₹3,000 के पूर्ण शिविर पास में क्या-क्या शामिल है?',
    answerEn: 'The ₹3,000 Full Camp Pass covers 3 nights hotel accommodation in Puri, 4 days complete meals (breakfast, lunch, dinner, tea), study materials, and all session entry passes.',
    answerHi: '₹3,000 के पूर्ण शिविर पास में पूरी में 3 रातों का होटल आवास, 4 दिनों का संपूर्ण भोजन (नाश्ता, दोपहर का भोजन, रात का भोजन, चाय), अध्ययन सामग्री और सभी सत्रों का प्रवेश पास शामिल है।',
  },
  {
    id: 'faq-8',
    categoryEn: 'Accommodation',
    categoryHi: 'आवास व्यवस्था',
    questionEn: 'How early can participants check in on 26 October?',
    questionHi: '26 अक्टूबर को प्रतिभागी किस समय आगमन (Check-in) कर सकते हैं?',
    answerEn: 'Check-in desk opens at 5:00 PM on Monday, 26 October 2026. Room keys and delegate welcome kits will be issued upon arrival.',
    answerHi: 'चेक-इन डेस्क सोमवार, 26 अक्टूबर 2026 को शाम 5:00 बजे खुलेगा। आगमन पर कमरे की चाबियाँ एवं स्वागत किट प्रदान की जाएगी।',
  },
  {
    id: 'faq-9',
    categoryEn: 'Registration & Pricing',
    categoryHi: 'पंजीकरण एवं शुल्क',
    questionEn: 'What is the registration fee and how can I pay?',
    questionHi: 'पंजीकरण शुल्क कितना है और भुगतान कैसे करें?',
    answerEn: 'The registration fee is ₹3,000 per delegate. Registration can be completed online through our portal or by contacting 9696110134.',
    answerHi: 'पंजीकरण शुल्क प्रति प्रतिभागी ₹3,000 है। पंजीकरण हमारे ऑनलाइन पोर्टल से या फोन नंबर 9696110134 पर संपर्क करके पूरा किया जा सकता है।',
  },
  {
    id: 'faq-10',
    categoryEn: 'Registration & Pricing',
    categoryHi: 'पंजीकरण एवं शुल्क',
    questionEn: 'How can I contact the organizing team for enquiries?',
    questionHi: 'पूछताछ के लिए आयोजक टीम से कैसे संपर्क करें?',
    answerEn: 'You can call +91 9696110134 (Call & WhatsApp) or submit the online enquiry form on our contact page for any questions or group registration support.',
    answerHi: 'किसी भी प्रश्न या समूह पंजीकरण सहायता के लिए आप +91 9696110134 (कॉल व व्हाट्सएप) पर संपर्क कर सकते हैं या वेबसाइट के संपर्क फॉर्म के माध्यम से संदेश भेज सकते हैं।',
  },
];

const CATEGORIES_EN = ['All', 'Eligibility', 'About Shivir', 'Registration & Pricing', 'Accommodation', 'Venue & Travel'];
const CATEGORIES_HI = ['सभी', 'पात्रता', 'शिविर विवरण', 'पंजीकरण एवं शुल्क', 'आवास व्यवस्था', 'स्थल एवं यात्रा'];

export function QaSection({ faqs: _faqs }: { faqs?: Faq[] } = {}) {
  const { language } = useLanguage();
  const lang = language;

  const categories = lang === 'hi' ? CATEGORIES_HI : CATEGORIES_EN;
  const [selectedCategory, setSelectedCategory] = useState<string>(lang === 'hi' ? 'सभी' : 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(DUAL_FAQS[0]?.id ?? null);

  const filteredFaqs = DUAL_FAQS.filter((item) => {
    const itemCat = lang === 'hi' ? item.categoryHi : item.categoryEn;
    const allKey = lang === 'hi' ? 'सभी' : 'All';
    const matchesCategory = selectedCategory === allKey || selectedCategory === 'All' || selectedCategory === 'सभी' || itemCat === selectedCategory;

    const question = lang === 'hi' ? item.questionHi : item.questionEn;
    const answer = lang === 'hi' ? item.answerHi : item.answerEn;
    const matchesSearch =
      question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="qa" className="bg-[#FAFBFC] text-slate-900 py-12 sm:py-16 lg:py-20 border-b border-slate-200">
      <div className="shell space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.25em] text-navy uppercase font-raleway bg-navy-100 px-4 py-1.5 rounded-full border border-navy/30">
            <HelpCircle size={14} className="text-navy" />
            <span>{lang === 'hi' ? 'प्रश्न एवं उत्तर' : 'QUESTIONS & ANSWERS'}</span>
          </div>

          <h2 className="font-raleway font-black text-3xl sm:text-5xl tracking-tight text-navy-950 leading-tight">
            {lang === 'hi' ? (
              <>सामान्य <span className="text-navy underline decoration-crossgold underline-offset-8">जिज्ञासाएँ</span> एवं उत्तर</>
            ) : (
              <>Common <span className="text-navy underline decoration-crossgold underline-offset-8">Questions</span> &amp; Answers</>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-2xl mx-auto">
            {lang === 'hi'
              ? 'प्रतिभागी पात्रता, आवास व्यवस्था, दिनांक, पूरी स्थल मार्गदर्शिका एवं शिविर दिशा-निर्देशों की संपूर्ण जानकारी।'
              : 'Everything you need to know about delegate eligibility, accommodation packages, dates, venue access, and conference guidelines.'}
          </p>

          <div className="w-16 h-1.5 bg-crossgold mx-auto mt-2 rounded-full" />
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={
                lang === 'hi'
                  ? 'प्रश्न या शब्द खोजें (उदा. आवास, आगमन, पात्रता)...'
                  : 'Search questions or keywords (e.g. accommodation, check-in, eligibility)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-navy/20 rounded-2xl shadow-xs text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-navy focus:ring-2 focus:ring-crossgold/30 transition-all font-sans"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 text-xs font-bold font-raleway rounded-xl transition-all',
                  selectedCategory === cat
                    ? 'bg-navy text-white border-2 border-navy shadow-[2px_2px_0px_#FBB33B] font-black'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-navy/40 hover:text-navy',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Q&A Accordion Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-navy/20 p-8 space-y-3 shadow-brutal-sm">
              <MessageSquare className="mx-auto text-slate-400" size={32} />
              <p className="text-sm font-bold text-slate-800 font-raleway">
                {lang === 'hi' ? 'कोई प्रासंगिक प्रश्न नहीं मिला।' : 'No matching questions found.'}
              </p>
              <p className="text-xs text-slate-500 font-sans">
                {lang === 'hi'
                  ? 'अलग शब्द खोजें या "सभी" श्रेणी का चयन करें।'
                  : 'Try searching for a different keyword or select "All" categories.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const category = lang === 'hi' ? faq.categoryHi : faq.categoryEn;
              const question = lang === 'hi' ? faq.questionHi : faq.questionEn;
              const answer = lang === 'hi' ? faq.answerHi : faq.answerEn;

              return (
                <div
                  key={faq.id}
                  className={cn(
                    'bg-white border-2 rounded-2xl transition-all overflow-hidden',
                    isOpen ? 'border-navy shadow-brutal ring-1 ring-navy' : 'border-navy/15 hover:border-navy/50 shadow-brutal-sm',
                  )}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5">
                      {category && (
                        <span className="inline-block text-[10px] font-raleway font-black uppercase tracking-wider text-navy bg-navy-50 border border-navy/30 px-2.5 py-0.5 rounded-full">
                          {category}
                        </span>
                      )}
                      <h3 className="font-raleway text-base sm:text-lg font-black text-navy-950 leading-snug">
                        {question}
                      </h3>
                    </div>

                    <div
                      className={cn(
                        'shrink-0 p-2 rounded-full transition-colors',
                        isOpen ? 'bg-navy text-crossgold' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-0 text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-100 space-y-3">
                      <div className="flex items-start gap-3 bg-navy-50/60 p-4 rounded-xl border border-navy/15 mt-3">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <p className="font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">{answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Contact Box */}
        <div className="max-w-4xl mx-auto bg-navy text-white border-2 border-crossgold rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-brutal-gold">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-raleway text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' ? 'क्या आपका कोई अन्य प्रश्न है?' : 'Have a specific question not answered here?'}
            </h4>
            <p className="text-xs sm:text-sm text-navy-100 font-sans">
              {lang === 'hi'
                ? 'हमारी शिविर सहायता टीम पंजीकरण एवं अन्य विवरण में सहायता के लिए उपलब्ध है।'
                : 'Our conference team is here to assist you with registration or special requests.'}
            </p>
          </div>

          <a
            href="tel:9696110134"
            className="shrink-0 inline-flex items-center gap-2 bg-crossgold hover:bg-crossgold-dark text-navy-950 font-black font-raleway text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] transition-all"
          >
            <Send size={14} />
            <span>{lang === 'hi' ? 'सहायता टीम से संपर्क करें' : 'Contact Support'}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default QaSection;
