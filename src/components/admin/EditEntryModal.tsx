import React, { useState } from 'react';
import { X, Save, ShieldAlert, User, Building, CreditCard, CheckCircle } from 'lucide-react';
import type { Registration, Attendee } from '../../types';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Registration | Attendee | null;
  onSave: (updatedData: Partial<Registration & Attendee>) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
}) => {
  if (!isOpen || !entry) return null;

  return (
    <EditEntryModalContent
      key={entry.id || entry.reference || 'entry-modal'}
      onClose={onClose}
      entry={entry}
      onSave={onSave}
    />
  );
};

const EditEntryModalContent: React.FC<{
  onClose: () => void;
  entry: Registration | Attendee;
  onSave: (updatedData: Partial<Registration & Attendee>) => void;
}> = ({ onClose, entry, onSave }) => {
  const initialEntryId = String(entry.legacyEntryId || entry.entryId || (entry.reference || '').replace(/\D/g, '') || '');
  const initialNameParts = (entry as any).name
    ? String((entry as any).name).split(' ')
    : [(entry as any).firstName || '', (entry as any).lastName || ''];

  const [entryIdVal, setEntryIdVal] = useState(initialEntryId);
  const [referenceVal, setReferenceVal] = useState(entry.reference || `VS2026-${initialEntryId.padStart(4, '0')}`);
  const [firstName, setFirstName] = useState((entry as any).firstName || initialNameParts[0] || '');
  const [lastName, setLastName] = useState((entry as any).lastName || initialNameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(entry.email || '');
  const [phone, setPhone] = useState(entry.phone || '');
  const [age, setAge] = useState<string>(entry.age !== null && entry.age !== undefined ? String(entry.age) : '');
  const [gender, setGender] = useState<string>((entry as any).gender || 'male');
  const [churchName, setChurchName] = useState(entry.organisation || (entry as any).churchName || '');
  const [churchDenomination, setChurchDenomination] = useState((entry as any).churchDenomination || 'Non-Denominational');
  const [designation, setDesignation] = useState(entry.designation || (entry as any).role || 'Senior Pastor');
  const [city, setCity] = useState(entry.city || '');
  const [state, setState] = useState(entry.state || '');
  const [country, setCountry] = useState(entry.country || 'India');
  const [categoryId, setCategoryId] = useState(entry.categoryId || 'cat-eb-quad');
  const [paymentStatus, setPaymentStatus] = useState<string>(entry.paymentStatus || 'paid');
  const [amount, setAmount] = useState<string>(
    String((entry as any).total ?? (entry as any).amount ?? 3999)
  );
  const [attendanceIntention, setAttendanceIntention] = useState<string>(
    (entry as any).attendanceIntention || 'ATTENDING'
  );
  const [checkInStatus, setCheckInStatus] = useState<string>(
    (entry as any).checkInStatus || 'not-arrived'
  );
  const [whatsappStatus, setWhatsappStatus] = useState<string>(
    (entry as any).whatsappStatus || 'NOT_ADDED'
  );
  const [notes, setNotes] = useState((entry as any).notes || (entry as any).remarks || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericEntryId = entryIdVal.trim();
    const updated = {
      legacyEntryId: numericEntryId,
      entryId: numericEntryId,
      reference: referenceVal,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : null,
      gender,
      organisation: churchName.trim(),
      churchName: churchName.trim(),
      churchDenomination,
      designation: designation.trim(),
      role: designation.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      categoryId,
      paymentStatus: paymentStatus as any,
      amount: Number(amount) || 0,
      total: Number(amount) || 0,
      attendanceIntention: attendanceIntention as any,
      checkInStatus: checkInStatus as any,
      physicalCheckIn: checkInStatus === 'checked-in' ? 'CHECKED_IN' : 'NOT_CHECKED_IN',
      whatsappStatus: whatsappStatus as any,
      notes: notes.trim(),
    };
    onSave(updated as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden text-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/90 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#153A66]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <span>Edit Delegate Entry Information</span>
                <span className="text-xs font-mono bg-blue-50 text-[#153A66] px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                  Entry ID #{entryIdVal || initialEntryId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Update delegate details, payment status, accommodation category &amp; operational statuses.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Identifiers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153A66] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <ShieldAlert size={14} /> Entry Identifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Excel Entry ID (Entry Id column)
                </label>
                <input
                  type="text"
                  value={entryIdVal}
                  onChange={(e) => {
                    setEntryIdVal(e.target.value);
                    if (e.target.value) {
                      setReferenceVal(`VS2026-${e.target.value.padStart(4, '0')}`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[#153A66] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                  placeholder="e.g. 105"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">System Reference ID</label>
                <input
                  type="text"
                  value={referenceVal}
                  onChange={(e) => setReferenceVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153A66] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User size={14} /> Personal &amp; Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66]"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Church & Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153A66] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Building size={14} /> Church, Role &amp; Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Church / Organisation</label>
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Church Denomination</label>
                <input
                  type="text"
                  value={churchDenomination}
                  onChange={(e) => setChurchDenomination(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role / Designation</label>
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
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
          </div>

          {/* Section 4: Registration, Category & Payment */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153A66] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <CreditCard size={14} /> Accommodation Category &amp; Payment Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Accommodation Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="cat-eb-quad">Early Bird — Quadruple Sharing (₹3,999)</option>
                  <option value="cat-eb-triple">Early Bird — Triple Sharing (₹5,999)</option>
                  <option value="cat-eb-double">Early Bird — Double Sharing (₹9,999)</option>
                  <option value="cat-eb-day">Early Bird — Day Scholar (₹3,999)</option>
                  <option value="cat-n-quad">Normal — Quadruple Sharing (₹4,999)</option>
                  <option value="cat-n-triple">Normal — Triple Sharing (₹7,999)</option>
                  <option value="cat-n-double">Normal — Double Sharing (₹11,999)</option>
                  <option value="cat-n-day">Normal — Day Scholar (₹4,999)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="paid">PAID (Verified)</option>
                  <option value="pending">PENDING / UNPAID</option>
                  <option value="unpaid">UNPAID</option>
                  <option value="refunded">REFUNDED</option>
                  <option value="failed">FAILED</option>
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
          </div>

          {/* Section 5: Operations & Attendance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153A66] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <CheckCircle size={14} /> Operations &amp; Attendance Intention
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attendance Intention (RSVP)</label>
                <select
                  value={attendanceIntention}
                  onChange={(e) => setAttendanceIntention(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="ATTENDING">ATTENDING (Confirmed)</option>
                  <option value="NOT_ATTENDING">NOT ATTENDING</option>
                  <option value="NOT_VERIFIED">NOT VERIFIED</option>
                  <option value="MAYBE">MAYBE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Check-in</label>
                <select
                  value={checkInStatus}
                  onChange={(e) => setCheckInStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="not-arrived">Not Arrived</option>
                  <option value="checked-in">Checked In at Venue</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">WhatsApp Community</label>
                <select
                  value={whatsappStatus}
                  onChange={(e) => setWhatsappStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                >
                  <option value="ADDED">Added to Official Group</option>
                  <option value="INVITED">Invited via Link</option>
                  <option value="NOT_ADDED">Not Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">Admin Remarks &amp; Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
              placeholder="Internal remarks or special requests..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#153A66] hover:bg-[#1B4980] text-white text-xs font-semibold shadow-xs transition"
            >
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
