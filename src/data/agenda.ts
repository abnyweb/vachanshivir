import type { Session } from '../types';

export const sessions: Session[] = [
  {
    id: 'ses-d1-1', eventId: 'evt-vachanshivir-2026', day: 1, date: '2026-10-26',
    startTime: '17:00', endTime: '18:30', title: 'शिविर आगमन एवं पंजीकरण (Check-in & Welcome)',
    type: 'opening', speakerId: null, room: 'Main Convention Desk, Puri',
    description: 'प्रतिनिधि पंजीकरण, शिविर किट वितरण, कमरे का आवंटन एवं परिचय।',
    displayOrder: 1, status: 'published',
  },
  {
    id: 'ses-d1-2', eventId: 'evt-vachanshivir-2026', day: 1, date: '2026-10-26',
    startTime: '19:00', endTime: '21:00', title: 'उद्घाटन सत्र: सत्य का अध्ययन क्यों आवश्यक है?',
    type: 'exposition', speakerId: 'spk-1', room: 'Main Auditorium',
    description: 'बाइबल अध्ययन का महत्व, उद्देश्य और शिविर की दिशा।',
    displayOrder: 2, status: 'published',
  },
  {
    id: 'ses-d2-1', eventId: 'evt-vachanshivir-2026', day: 2, date: '2026-10-27',
    startTime: '09:00', endTime: '11:30', title: 'विषय 1: वचन अध्ययन की सही विधि (Proper Bible Study Method)',
    type: 'exposition', speakerId: 'spk-1', room: 'Main Auditorium',
    description: 'शास्त्र का सही अर्थ निकालने (Hermeneutics), संदर्भ और विश्लेषणात्मक अध्ययन के सिद्धांत।',
    displayOrder: 1, status: 'published',
  },
  {
    id: 'ses-d2-2', eventId: 'evt-vachanshivir-2026', day: 2, date: '2026-10-27',
    startTime: '15:00', endTime: '17:30', title: 'विषय 2: इफिसियों की पत्री का अध्ययन (अध्याय 1-3)',
    type: 'workshop', speakerId: 'spk-2', room: 'Main Auditorium',
    description: 'इफिसियों की पत्री में मसीह में उद्धार, अनुग्रह और कलीसिया की पहचान का गहन अध्ययन।',
    displayOrder: 2, status: 'published',
  },
  {
    id: 'ses-d3-1', eventId: 'evt-vachanshivir-2026', day: 3, date: '2026-10-28',
    startTime: '09:00', endTime: '11:30', title: 'विषय 3: बाइबल आधारित प्रचार कैसे करें? (Expository Preaching)',
    type: 'exposition', speakerId: 'spk-3', room: 'Main Auditorium',
    description: 'व्याख्यात्मक प्रचार (Expository Preaching) तैयार करने की व्यावहारिक रूपरेखा और प्रभावी प्रस्तुति।',
    displayOrder: 1, status: 'published',
  },
  {
    id: 'ses-d3-2', eventId: 'evt-vachanshivir-2026', day: 3, date: '2026-10-28',
    startTime: '15:00', endTime: '17:30', title: 'इफिसियों की पत्री का अध्ययन (अध्याय 4-6)',
    type: 'workshop', speakerId: 'spk-2', room: 'Main Auditorium',
    description: 'कलीसियाई एकता, मसीही जीवन का आचरण, परिवार और आत्मिक युद्ध का व्यावहारिक अध्ययन।',
    displayOrder: 2, status: 'published',
  },
  {
    id: 'ses-d4-1', eventId: 'evt-vachanshivir-2026', day: 4, date: '2026-10-29',
    startTime: '09:00', endTime: '11:30', title: 'कलीसिया में प्रभावशाली शिक्षा देने के व्यावहारिक पहलू',
    type: 'exposition', speakerId: 'spk-4', room: 'Main Auditorium',
    description: 'अगूवों एवं शिक्षकों के लिए कलीसिया में प्रभावशाली रीति से शिक्षा देने और नए विश्वासियों का मार्गदर्शन करने की रणनीति।',
    displayOrder: 1, status: 'published',
  },
  {
    id: 'ses-d4-2', eventId: 'evt-vachanshivir-2026', day: 4, date: '2026-10-29',
    startTime: '12:00', endTime: '14:00', title: 'समापन, प्रार्थना एवं विदाई भोजन (2:00 PM)',
    type: 'closing', speakerId: null, room: 'Main Auditorium & Dining Hall',
    description: 'विशेष समर्पण प्रार्थना, प्रमाण-पत्र एवं दोपहर का विदाई भोजन।',
    displayOrder: 2, status: 'published',
  },
];
