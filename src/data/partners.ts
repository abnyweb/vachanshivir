import type { Partner, Sponsor } from '../types';
import { CURRENT_EVENT_ID } from './eventData';

export const partners: Partner[] = [
  {
    id: 'ptn-vsf', eventId: CURRENT_EVENT_ID, name: 'Vachan Shivir Foundation',
    logo: '/assets/partner-eic.png', category: 'organiser',
    description: 'Dedicated to encouraging biblical exposition, spiritual growth, and unity across Indian communities.',
    website: 'https://vachanshivir.org', displayOrder: 1, active: true, isDemo: false,
  },
  {
    id: 'ptn-ftt', eventId: CURRENT_EVENT_ID, name: 'For The Truth Publishing',
    logo: '/assets/partner-ft.png', category: 'publishing',
    description: 'A publishing ministry printing and distributing theological literature and study resources.',
    website: 'https://forthetruth.in', displayOrder: 2, active: true, isDemo: false,
  },
  {
    id: 'ptn-t78', eventId: CURRENT_EVENT_ID, name: 'Truth:78 Ministry',
    logo: '/assets/partner-t78.png', category: 'ministry',
    description: 'Helping the next generation know, honor, and treasure God through biblical resources.',
    website: 'https://truth78.org', displayOrder: 3, active: true, isDemo: false,
  },
];

export const sponsors: Sponsor[] = [
  {
    id: 'spn-1', eventId: CURRENT_EVENT_ID, name: 'Grace Media Partner',
    logo: null, tier: 'principal', description: 'Principal media & resource partner for Vachan Shivir 2026.',
    website: 'https://vachanshivir.org', displayOrder: 1, active: true, isDemo: false,
  },
];
