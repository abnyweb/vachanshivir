import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Calendar, History, ArrowLeft, Mail, Phone, MapPin, Building2, Award, QrCode } from 'lucide-react';
import { ParticipantBadge } from '../../components/badge/ParticipantBadge';

export default function CrmContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db } = useStore();

  const contact = (db.crmContacts || []).find((c) => c.id === id);
  const participations = (db.eventParticipations || []).filter((p) => p.contactId === id);
  const registrations = (db.registrations || []).filter(
    (r) => r.contactId === id || (contact && r.email.toLowerCase() === contact.email.toLowerCase())
  );

  if (!contact) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/admin/crm/contacts')} className="flex items-center gap-1">
          <ArrowLeft size={16} /> Back to CRM Contacts
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-ink/50">CRM Contact Profile record not found.</CardContent>
        </Card>
      </div>
    );
  }

  const totalSpend = participations.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/admin/crm/contacts')} className="flex items-center gap-1 text-xs">
        <ArrowLeft size={14} /> Back to CRM Contacts
      </Button>

      {/* Header Profile Banner */}
      <Card className="bg-white border-l-4 border-l-navy shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy flex items-center justify-center font-raleway text-2xl font-black border border-navy/20">
                {contact.firstName[0]}
                {contact.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black font-raleway text-navy-950">{contact.fullName}</h1>
                  <span
                    className={`px-2 py-0.5 rounded text-xs uppercase font-medium border ${
                      contact.lifecycle === 'repeat-attendee'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {contact.lifecycle}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 font-sans">
                  {contact.role || contact.designation} at <span className="font-semibold text-slate-900">{contact.churchName || contact.organisation}</span>
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2 font-sans">
                  <span className="flex items-center gap-1">
                    <Mail size={12} className="text-navy" /> {contact.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-navy" /> {contact.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-amber-600" /> {contact.city}, {contact.state}, {contact.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 justify-end text-right border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Event Spend</div>
              <div className="text-2xl font-black text-navy font-mono">₹{totalSpend.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{participations.length} Event Participations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Event History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-raleway font-bold flex items-center gap-2 text-slate-900">
                <History className="text-navy" size={20} />
                Vachan Shivir Event History Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participations.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No historical event participations linked yet.</p>
              ) : (
                <div className="relative border-l-2 border-navy/20 pl-6 ml-2 space-y-6">
                  {participations.map((p) => (
                    <div key={p.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-navy border-2 border-white" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-raleway font-bold text-base text-navy">{p.eventName}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#153A66] font-semibold border border-blue-200/60">VS {p.eventYear}</span>
                        </div>
                        <div className="text-xs text-ink/70 flex flex-wrap gap-4">
                          <span>Reference: <strong className="text-ink">{p.reference}</strong></span>
                          <span>Role: <strong>{p.role}</strong></span>
                          <span>Category: <strong>{p.categoryName}</strong></span>
                          <span>Amount: <strong>₹{p.amountPaid}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              p.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Payment: {p.paymentStatus}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              p.attended ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            Attended: {p.attended ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registrations List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-raleway font-bold flex items-center gap-2 text-slate-900">
                <Calendar className="text-navy" size={18} />
                Linked Registration Entries ({registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Reference</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Total</th>
                    <th className="px-4 py-2.5">Payment</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 font-bold font-mono text-navy">{r.reference}</td>
                      <td className="px-4 py-2.5">{r.categoryId}</td>
                      <td className="px-4 py-2.5 font-bold font-mono">₹{r.total ?? (r as unknown as Record<string, unknown>).totalAmount ?? (r as unknown as Record<string, unknown>).amountPaid ?? r.amount ?? 0}</td>
                      <td className="px-4 py-2.5 uppercase font-semibold">{r.paymentStatus}</td>
                      <td className="px-4 py-2.5 uppercase">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Contact Details & Tags */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-raleway font-bold flex items-center gap-2 text-slate-900">
                <Building2 className="text-navy" size={18} />
                Church & Organisation Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Church Name</span>
                <span className="text-sm font-bold text-slate-900">{contact.churchName || contact.organisation}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Denomination</span>
                <span className="text-slate-700">{contact.churchDenomination}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Role / Position</span>
                <span className="text-slate-700">{contact.role || contact.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Lead Source</span>
                <span className="text-slate-700">{contact.leadSource}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-raleway font-bold flex items-center gap-2 text-slate-900">
                <Award className="text-amber-600" size={18} />
                Tags &amp; Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-xl bg-navy-50 text-navy text-xs font-bold border border-navy/15">
                    {t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Official Participant Badge Card */}
          <Card className="bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-sans font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="text-[#153A66]" size={18} />
                Official Delegate Badge Pass
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <ParticipantBadge
                attendee={{
                  id: contact.id,
                  registrationId: `reg_${contact.id}`,
                  eventId: 'evt-vachanshivir-2026',
                  reference: contact.id.replace('crm_cnt_', 'VS26-'),
                  name: contact.fullName,
                  email: contact.email,
                  phone: contact.phone,
                  city: contact.city,
                  state: contact.state,
                  country: contact.country || 'India',
                  churchName: contact.churchName,
                  organisation: contact.organisation,
                  designation: contact.role || contact.designation || 'Pastor',
                  categoryId: 'cat-eb-quad',
                  paymentStatus: 'paid',
                  checkInStatus: 'not-arrived',
                  physicalCheckIn: 'NOT_CHECKED_IN',
                  attendanceIntention: 'ATTENDING',
                  whatsappStatus: 'ADDED',
                  checkinToken: `chk_tok_${contact.id}`,
                  checkedInAt: null,
                  badgeStatus: 'generated',
                  roomingStatus: 'unassigned',
                  roomId: null,
                  isDemo: false,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

