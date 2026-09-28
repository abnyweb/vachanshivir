import type { RegistrationCategory } from '../types';

const BENEFITS = ['3 Nights Accommodation', 'All 4 Days Conference Sessions', 'All Meals & Tea Refreshments', 'Complete Bible Study Material & Delegate Kit'];

export const registrationCategories: RegistrationCategory[] = [
  {
    id: 'cat-std-full',
    eventId: 'evt-vachanshivir-2026',
    name: 'पूर्ण शिविर पंजीकरण पास (Full Camp Pass)',
    description: '26 से 29 अक्टूबर, पूरी, ओडिशा संपूर्ण शिविर पास - 3 रात आवास, 4 दिन संपूर्ण भोजन, अध्ययन सामग्री एवं सत्र किट शामिल।',
    price: 3000,
    currency: 'INR',
    taxPercent: 0,
    taxNote: '₹ 3,000 मात्र (सकल शुल्क - आवास व भोजन सम्मिलित)',
    validFrom: '2026-05-01',
    validUntil: '2026-10-26',
    benefits: BENEFITS,
    sharingType: 'quadruple',
    maxGuests: 4,
    active: true,
    displayOrder: 1,
  },
];

export const extendedStayRates: { sharing: string; amount: number }[] = [];
