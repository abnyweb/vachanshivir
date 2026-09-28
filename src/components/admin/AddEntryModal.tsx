import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextEntryId: number;
  onAdd: (newEntryData: any) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  nextEntryId,
  onAdd,
}) => {
  const [entryIdVal, setEntryIdVal] = useState(String(nextEntryId));
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [churchName, setChurchName] = useState('');
  const [churchDenomination, setChurchDenomination] = useState('Non-Denominational');
  const [designation, setDesignation] = useState('Senior Pastor');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [categoryId, setCategoryId] = useState('cat-eb-quad');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [amount, setAmount] = useState('3999');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryId = entryIdVal.trim();
    const reference = `VS2026-${entryId.padStart(4, '0')}`;
    const now = new Date().toISOString();

    const registration = {
      id: `reg_manual_${Date.now()}`,
      legacyEntryId: entryId,
      entryId: entryId,
      reference,
      eventId: 'evt-vs-2026',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : null,
      organisation: churchName.trim(),
      churchName: churchName.trim(),
      churchDenomination,
      designation: designation.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      categoryId,
      addOns: [],
      amount: Number(amount) || 0,
      tax: 0,
      total: Number(amount) || 0,
      currency: 'INR',
      paymentStatus,
      status: paymentStatus === 'paid' ? 'confirmed' : 'submitted',
      notes: notes.trim(),
      createdAt: now,
      isDemo: false,
    };

    const attendee = {
      id: `att_manual_${Date.now()}`,
      registrationId: registration.id,
      legacyEntryId: entryId,
      entryId: entryId,
      reference,
      eventId: 'evt-vs-2026',
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      organisation: churchName.trim(),
      churchName: churchName.trim(),
      churchDenomination,
      role: designation.trim(),
      designation: designation.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      categoryId,
      paymentStatus,
      attendanceIntention: 'ATTENDING',
      whatsappStatus: 'NOT_ADDED',
      checkInStatus: 'not-arrived',
      physicalCheckIn: 'NOT_CHECKED_IN',
      checkedInAt: null,
      checkinToken: `chk_tok_${entryId}`,
      badgeStatus: paymentStatus === 'paid' ? 'generated' : 'not-generated',
      roomingStatus: 'unassigned',
      roomId: null,
      isDemo: false,
    };

    onAdd({ registration, attendee });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden text-slate-800 my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200/90 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans">Create New Delegate Entry</h2>
              <p className="text-xs text-slate-500">
                Manually register a pastor or delegate and assign an Excel Entry ID.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Excel Entry ID</label>
              <input
                type="text"
                value={entryIdVal}
                onChange={(e) => setEntryIdVal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[#153A66] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference Code</label>
              <input
                type="text"
                value={`VS2026-${(entryIdVal || '0').padStart(4, '0')}`}
                disabled
                className="w-full bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Church Name</label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                placeholder="e.g. 38"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Denomination</label>
              <input
                type="text"
                value={churchDenomination}
                onChange={(e) => setChurchDenomination(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              >
                <option value="cat-eb-quad">Early Bird — Quadruple</option>
                <option value="cat-eb-triple">Early Bird — Triple</option>
                <option value="cat-eb-double">Early Bird — Double</option>
                <option value="cat-eb-day">Early Bird — Day Scholar</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              >
                <option value="paid">PAID</option>
                <option value="pending">PENDING</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Admin Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              placeholder="Internal remarks..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs"
            >
              Create Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
