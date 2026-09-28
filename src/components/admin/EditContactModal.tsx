import React, { useState } from 'react';
import { X, Save, Contact } from 'lucide-react';
import type { CRMContact, CRMLifecycle } from '../../types';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: CRMContact | null;
  onSave: (updatedContact: Partial<CRMContact>) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSave,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <EditContactModalContent
      key={contact.id}
      onClose={onClose}
      contact={contact}
      onSave={onSave}
    />
  );
};

const EditContactModalContent: React.FC<{
  onClose: () => void;
  contact: CRMContact;
  onSave: (updatedContact: Partial<CRMContact>) => void;
}> = ({ onClose, contact, onSave }) => {
  const [entryIdVal, setEntryIdVal] = useState(String(contact.legacyEntryId || contact.entryId || ''));
  const [firstName, setFirstName] = useState(contact.firstName || '');
  const [lastName, setLastName] = useState(contact.lastName || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [whatsapp, setWhatsapp] = useState(contact.whatsapp || contact.phone || '');
  const [churchName, setChurchName] = useState(contact.churchName || contact.organisation || '');
  const [churchDenomination, setChurchDenomination] = useState(contact.churchDenomination || 'Non-Denominational');
  const [role, setRole] = useState(contact.role || contact.designation || 'Senior Pastor');
  const [city, setCity] = useState(contact.city || '');
  const [state, setState] = useState(contact.state || '');
  const [country, setCountry] = useState(contact.country || 'India');
  const [contactType, setContactType] = useState(contact.contactType || 'pastor');
  const [lifecycle, setLifecycle] = useState<CRMLifecycle>(contact.lifecycle || 'attendee');
  const [leadSource, setLeadSource] = useState(contact.leadSource || 'Vachan Shivir 2026 Registration');
  const [tagsInput, setTagsInput] = useState((contact.tags || []).join(', '));
  const [notes, setNotes] = useState(contact.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tagsInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const updated: Partial<CRMContact> = {
      legacyEntryId: entryIdVal.trim(),
      entryId: entryIdVal.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      churchName: churchName.trim(),
      organisation: churchName.trim(),
      churchDenomination: churchDenomination.trim(),
      role: role.trim(),
      designation: role.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      contactType: contactType as any,
      lifecycle,
      leadSource: leadSource.trim(),
      tags: Array.from(new Set(tagArray)),
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-white my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Contact size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <span>Edit CRM Contact Profile</span>
                {entryIdVal && (
                  <span className="text-xs font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Entry ID #{entryIdVal}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Update pastor details, lifecycle stage, church affiliation, tags &amp; notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Excel Entry ID (Optional)</label>
              <input
                type="text"
                value={entryIdVal}
                onChange={(e) => setEntryIdVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 105"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Type</label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="pastor">Pastor / Minister</option>
                <option value="delegate">Church Delegate</option>
                <option value="speaker">Speaker</option>
                <option value="sponsor">Sponsor</option>
                <option value="exhibitor">Exhibitor</option>
                <option value="partner">Partner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Church Name</label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Denomination</label>
              <input
                type="text"
                value={churchDenomination}
                onChange={(e) => setChurchDenomination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Role / Position</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lead Source</label>
              <input
                type="text"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lifecycle Stage</label>
              <select
                value={lifecycle}
                onChange={(e) => setLifecycle(e.target.value as CRMLifecycle)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="subscriber">Subscriber / New Lead</option>
                <option value="lead">Qualified Lead</option>
                <option value="applicant">Applicant</option>
                <option value="attendee">First-Time Attendee</option>
                <option value="repeat-attendee">Repeat Attendee</option>
                <option value="vip">VIP Pastor</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="VS-2026, PASTOR, VIP, HEALTHY_CHURCH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">CRM Notes &amp; History</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Add internal remarks, phone call records, special requirements..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition"
            >
              <Save size={15} /> Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
