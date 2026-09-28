import type { Faq } from '../types';
import { CURRENT_EVENT_ID } from './eventData';

export const faqs: Faq[] = [
  {
    id: 'faq-1',
    eventId: CURRENT_EVENT_ID,
    category: 'General',
    displayOrder: 1,
    status: 'published',
    question: 'वचन अध्ययन शिविर 2026 क्या है? (What is Vachan Adhyayan Shivir 2026?)',
    answer: 'वचन अध्ययन शिविर 2026 एक 4-दिवसीय गहन बाइबल अध्ययन एवं प्रचार प्रशिक्षण शिविर है, जिसका मुख्य उद्देश्य परमेश्वर के वचन को सही रीति से समझना, जीवन में लागू करना और विश्वासयोग्यता से सिखाना है।',
  },
  {
    id: 'faq-2',
    eventId: CURRENT_EVENT_ID,
    category: 'Eligibility',
    displayOrder: 2,
    status: 'published',
    question: 'इस शिविर में कौन सहभागी हो सकता है? (Who should attend?)',
    answer: '1. जो विश्वासी बाइबल का अध्ययन करने के इच्छुक हैं। 2. जो विश्वासी वचन की सही शिक्षा देना चाहते हैं। 3. जो अगूवे वर्तमान में कलीसिया में शिक्षा देते हैं।',
  },
  {
    id: 'faq-3',
    eventId: CURRENT_EVENT_ID,
    category: 'Dates & Venue',
    displayOrder: 3,
    status: 'published',
    question: 'शिविर कब और कहाँ आयोजित हो रहा है? (When and where?)',
    answer: '26 अक्टूबर 2026 (5:00 PM) से 29 अक्टूबर 2026 (2:00 PM) तक ईशोपंथी आश्रम (Ishopanthi Ashram), बालियापांडा रोड, पुरी, ओडिशा (Puri, Odisha - 752001) में आयोजित होगा। Google Maps: https://share.google/xcoKtrFFxV2oOre8q',
  },
  {
    id: 'faq-4',
    eventId: CURRENT_EVENT_ID,
    category: 'Topics',
    displayOrder: 4,
    status: 'published',
    question: 'शिविर के मुख्य विषय क्या हैं? (What are the key topics?)',
    answer: '• वचन अध्ययन की सही विधि (Expository Bible Study)  • बाइबल आधारित प्रचार कैसे करें? (Biblical Preaching)  • परमेश्वर के वचन को जीवन में लागू करना और विश्वासयोग्यता से सिखाना।',
  },
  {
    id: 'faq-5',
    eventId: CURRENT_EVENT_ID,
    category: 'Registration',
    displayOrder: 5,
    status: 'published',
    question: 'पंजीकरण शुल्क कितना है और संपर्क कैसे करें? (Registration Fee & Contact)',
    answer: 'पंजीकरण शुल्क ₹ 3000 मात्र है (3 रात्रियों का आवास, भोजन एवं अध्ययन सामग्री शामिल)। सीमित सीटों के कारण शीघ्र ही संपर्क करें: +91 9696110134 (Call & WhatsApp) अथवा वेबसाइट के संपर्क फॉर्म के द्वारा',
  },
];
