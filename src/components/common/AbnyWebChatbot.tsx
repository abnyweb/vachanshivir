import { useState } from 'react';
import { Bot, Sparkles, X, Send, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export function AbnyWebChatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: language === 'hi'
        ? 'जय मसीह की! मैं वचन अध्ययन शिविर सहायक हूँ। मैं आपकी किस प्रकार सहायता कर सकता हूँ?'
        : 'Praise the Lord! Welcome to Vachan Shivir Assistant. How can I assist you today?',
      time: 'Just now',
    },
  ]);

  const quickPrompts = [
    { label: 'Event Dates & Schedule', query: 'What are the Vachan Shivir 2026 event dates and schedule?' },
    { label: 'Puri Venue & Ashram', query: 'Tell me details about the Ishopanthi Ashram Puri venue and directions.' },
    { label: 'Registration Fee (₹3000)', query: 'How much is the registration fee and what is included in the pass?' },
    { label: 'How to Register', query: 'How can I register online for Vachan Shivir 2026?' },
  ];

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent AI response based on query keywords
    setTimeout(() => {
      let replyText = '';
      const lowerQ = q.toLowerCase();

      if (lowerQ.includes('theme') || lowerQ.includes('उद्देश्य') || lowerQ.includes('थीम')) {
        replyText =
          'वचन अध्ययन शिविर 2026 की थीम:\n"परमेश्वर के वचन को सही रीति से समझना, जीवन में लागू करना और विश्वासयोग्यता से सिखाना।" (Accurately understanding God\'s Word, applying it in life, and teaching it faithfully — 2 Timothy 2:15 / Ezra 7:10).';
      } else if (lowerQ.includes('date') || lowerQ.includes('when') || lowerQ.includes('dates') || lowerQ.includes('कब')) {
        replyText =
          'वचन अध्ययन शिविर 2026 (Puri Edition):\nदिनांक: 26 से 29 अक्टूबर 2026 (4 Days)\nआगमन (Check-in): 26 अक्टूबर शाम 5:00 बजे\nसमापन: 29 अक्टूबर दोपहर 2:00 बजे तक।';
      } else if (lowerQ.includes('venue') || lowerQ.includes('location') || lowerQ.includes('place') || lowerQ.includes('कहाँ') || lowerQ.includes('puri') || lowerQ.includes('ashram')) {
        replyText =
          'स्थान (Venue):\nईशोपंथी आश्रम (Ishopanthi Ashram)\nबालियापांडा रोड, लाइट हाउस के पास, पूरी – 752001, ओडिशा।\nGoogle Maps दिशा-निर्देश: https://share.google/xcoKtrFFxV2oOre8q';
      } else if (lowerQ.includes('fee') || lowerQ.includes('cost') || lowerQ.includes('price') || lowerQ.includes('stay') || lowerQ.includes('pay') || lowerQ.includes('शुल्क')) {
        replyText =
          'पंजीकरण शुल्क विवरण (Registration Fee):\n• पूर्ण शिविर पास: ₹3,000 मात्र (इसमें 3 रात्रियों का आवास/Accommodation, 4 दिनों का संपूर्ण भोजन, अध्ययन सामग्री व किट सम्मिलित है)।';
      } else if (lowerQ.includes('register') || lowerQ.includes('pass') || lowerQ.includes('apply') || lowerQ.includes('पंजीकरण')) {
        replyText =
          'आप वेबसाइट पर ऊपर "पंजीकरण करें" बटन दबाकर या /registration पेज पर जाकर सीधे ऑनलाइन फॉर्म भर सकते हैं। फॉर्म भरने के बाद तुरंत आपका डिजिटल संदर्भ कोड प्राप्त होगा!';
      } else if (lowerQ.includes('abny') || lowerQ.includes('web') || lowerQ.includes('developer') || lowerQ.includes('who built')) {
        replyText =
          'This web application and AI assistant is proudly designed and developed by ABNY Web (https://abnyweb.in/) — empowering churches and Christian organizations with premium digital technology.';
      } else {
        replyText =
          'वचन अध्ययन शिविर 2026 (ईशोपंथी आश्रम, पूरी, ओडिशा): किसी भी सहायता या प्रश्न के लिए आप सीधे +91 9696110134 (Call & WhatsApp) पर संपर्क कर सकते हैं या हमारे संपर्क फॉर्म के द्वारा संदेश भेज सकते हैं।';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Badge (Bottom-Right corner) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 font-sans">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0E1626]/95 hover:bg-[#142036] text-white border border-amber-500/40 shadow-2xl backdrop-blur-xl transition-all hover:scale-105"
            aria-label="Open AI Chatbot Powered by ABNY Web"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-md">
              <Sparkles size={12} className="text-slate-950" />
            </div>
            <span className="text-xs font-bold tracking-wide">
              Powered by <span className="text-amber-400 underline font-black">ABNY Web</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {/* Interactive AI Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-h-[600px] bg-[#0A0E17] border border-amber-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-slideUp font-sans backdrop-blur-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0E172A] via-[#161F33] to-[#0E172A] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5 font-serif">
                  Vachan Shivir AI Assistant
                </h3>
                <a
                  href="https://abnyweb.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Powered by ABNY Web</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close Chatbot"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-white/[0.02] border-b border-white/10 p-2.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-white/80 hover:text-amber-300 text-[10px] font-bold border border-white/10 hover:border-amber-400/40 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px] custom-scrollbar text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-none font-sans'
                      : 'bg-white/10 text-white/95 border border-white/15 rounded-tl-none font-sans'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] font-mono text-white/40 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#080B12] border-t border-white/10 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dates, fees, venue, stay..."
                className="flex-1 bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 disabled:opacity-40 transition shadow-md"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 px-1 pt-1 border-t border-white/5">
              <span>ABNY Web AI Engine v2.6</span>
              <a
                href="https://abnyweb.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline font-bold"
              >
                abnyweb.in &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
