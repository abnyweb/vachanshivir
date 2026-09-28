import type { Database } from '../store/database';
import type { RegistrationCategory } from '../types';
import { registrationCategories as defaultCategories } from '../data/pricing';

export const listCategories = (db: Database, eventId?: string): RegistrationCategory[] => {
  const allCats = Array.isArray(db?.registrationCategories) && db.registrationCategories.length > 0
    ? db.registrationCategories
    : defaultCategories;

  // 1. If eventId is provided, try finding matching categories
  if (eventId) {
    const matched = allCats.filter((c) => c.eventId === eventId);
    if (matched.length > 0) {
      return [...matched].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  // 2. If no eventId or no exact match in db, try defaultCategories matching eventId
  if (eventId) {
    const defaultMatched = defaultCategories.filter((c) => c.eventId === eventId);
    if (defaultMatched.length > 0) {
      return [...defaultMatched].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  // 3. Fallback: return all categories available
  return [...(allCats.length > 0 ? allCats : defaultCategories)].sort((a, b) => a.displayOrder - b.displayOrder);
};

export const listActiveCategories = (db: Database, eventId?: string): RegistrationCategory[] => {
  const cats = listCategories(db, eventId);
  const active = cats.filter((c) => c.active !== false);
  return active.length > 0 ? active : cats;
};

export const getCategory = (db: Database, id: string): RegistrationCategory | undefined => {
  const fromDb = db?.registrationCategories?.find((c) => c.id === id);
  if (fromDb) return fromDb;
  return defaultCategories.find((c) => c.id === id);
};

export function priceBreakdown(category: RegistrationCategory | undefined, addOnTotal = 0) {
  if (!category) {
    const fallback = defaultCategories[0];
    const subtotal = (fallback?.price || 3000) + addOnTotal;
    const tax = Math.round((subtotal * (fallback?.taxPercent || 0)) / 100);
    return { subtotal, tax, total: subtotal + tax, currency: fallback?.currency || 'INR' };
  }
  const subtotal = category.price + addOnTotal;
  const tax = Math.round((subtotal * category.taxPercent) / 100);
  return { subtotal, tax, total: subtotal + tax, currency: category.currency };
}

