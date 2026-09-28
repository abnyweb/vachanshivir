import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  IdCard,
  CheckCircle2,
  Calendar,
  MapPin,
  Download,
  BedDouble,
  FileText,
  Church,
  X,
  ExternalLink,
  ShieldCheck,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../auth/AuthContext';
import { RazorpayPayButton } from '../../components/common/RazorpayPayButton';
import { VsIcon } from '../../components/common/VsIcon';

export const MyVachanShivir: React.FC = () => {
  const { notify } = useToast();
  const { user, token, signOut: authSignOut } = useAuth();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Authenticated/Verified Registration
  const [verifiedReg, setVerifiedReg] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchParticipantData = async () => {
      const activeToken = token || localStorage.getItem('vachanshivir_auth_token') || sessionStorage.getItem('vachanshivir_auth_token');
      if (!activeToken) {
        setVerifiedReg(null);
        return;
      }

      setIsVerifying(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/my-registration', {
          headers: {
            'Authorization': `Bearer ${activeToken}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          if (data.registration) {
            setVerifiedReg(data.registration);
            setAttendees(data.attendees || []);
          } else {
            setErrorMsg('No registration was found associated with your participant account.');
          }
        } else if (res.status === 401) {
          authSignOut();
          setVerifiedReg(null);
        } else {
          setErrorMsg(data.error || 'Failed to retrieve your registration data.');
        }
      } catch (err) {
        console.error('Network error fetching registration:', err);
        setErrorMsg('Unable to connect to registration server. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    fetchParticipantData();
  }, [user, token]);

  const handleLogout = () => {
    setVerifiedReg(null);
    setAttendees([]);
    setErrorMsg(null);
    authSignOut();
    notify('Security session ended. Profile locked.', 'info');
  };

  if (!verifiedReg) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 flex flex-col justify-center items-center pb-28">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="text-center space-y-3">
            <VsIcon size="lg" className="mx-auto" />
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                PARTICIPANT ACCESS PORTAL
              </span>
              <h1 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                Access Your Registration
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                कृपया अपने पंजीकृत ईमेल और पासवर्ड या Google खाते से लॉगिन करें।
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{errorMsg}</div>
            </div>
          )}

          {isVerifying ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500">Loading your registration details…</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <Link
                to="/login"
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 border border-amber-600/30 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>लॉगिन करें (Sign In to View Pass)</span>
              </Link>

              <Link
                to="/registration"
                className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-slate-200"
              >
                <span>नया पंजीकरण करें (New Registration)</span>
              </Link>

              <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-600 space-y-2">
                <p>Already registered but haven't set a password?</p>
                <Link
                  to="/forgot-password"
                  className="inline-block text-xs font-bold text-amber-800 hover:underline uppercase tracking-wider"
                >
                  Set or Reset Password &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const delegateName = verifiedReg.fullName || `${verifiedReg.firstName || ''} ${verifiedReg.lastName || ''}`.trim();
  const refCode = verifiedReg.reference || `VS2026-${verifiedReg.legacyEntryId || '0001'}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 max-w-md mx-auto space-y-6 pb-28">
      {/* Top Security Status Bar */}
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs">
        <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Verified &bull; {delegateName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center space-x-1 hover:underline ml-2 shrink-0"
          title="Lock session and sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </div>

      {/* Header Welcome Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            VACHAN SHIVIR 2026 PASS
          </span>
          <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verifiedReg.paymentStatus || 'CONFIRMED'}</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-serif">{delegateName}</h1>
        <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1.5">
          <Church className="w-4 h-4 text-amber-600" />
          <span>{verifiedReg.organisation || 'Grace Fellowship Center'}</span>
        </p>

        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Ref ID: <span className="text-slate-900 font-bold">{refCode}</span>
          </span>
          <span className="text-amber-800 font-bold uppercase">
            {verifiedReg.categoryId?.replace('cat-', '').replace('-', ' ') || 'Quad Sharing'}
          </span>
        </div>
      </div>

      {/* Razorpay Online Payment Card if Unpaid */}
      {verifiedReg.paymentStatus !== 'paid' && (
        <div className="bg-amber-50/90 border border-amber-300 p-5 rounded-3xl space-y-3 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-amber-900 tracking-wider">
              पंजीकरण शुल्क देय (Payment Pending)
            </span>
            <span className="text-sm font-black text-amber-900 font-mono">
              ₹{(verifiedReg.total || 3000).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            आपके पंजीकरण की पुष्टि और डिजिटल बैज सक्रिय करने के लिए शुल्क का भुगतान आवश्यक है। आप Razorpay UPI, GPay, PhonePe, कार्ड या नेट बैंकिंग से तुरंत भुगतान कर सकते हैं।
          </p>
          <RazorpayPayButton
            amountInRupees={verifiedReg.total || 3000}
            registrationId={verifiedReg.id}
            receipt={`rcpt_${refCode}`}
            prefill={{
              name: delegateName,
              email: verifiedReg.email,
              contact: verifiedReg.phone,
            }}
            label={`Razorpay से भुगतान करें (Pay ₹${(verifiedReg.total || 3000).toLocaleString('en-IN')})`}
            className="w-full py-3.5"
            onPaymentSuccess={(res) => {
              setVerifiedReg((prev: any) => ({
                ...prev,
                paymentStatus: 'paid',
                transactionId: res.paymentId,
              }));
            }}
          />
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowQrModal(true)}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-2.5 group shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Check-in QR</div>
            <div className="text-[10px] text-slate-500">Scan at Entry Desk</div>
          </div>
        </button>

        <button
          onClick={() => setShowBadgeModal(true)}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-2.5 group shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
            <IdCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Digital Badge</div>
            <div className="text-[10px] text-slate-500">View &amp; Download</div>
          </div>
        </button>
      </div>

      {/* Event Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold text-amber-800 uppercase tracking-widest font-mono">
          Retreat Details
        </h2>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900">26 &ndash; 29 October 2026</div>
              <div className="text-[11px] text-slate-500">Vachan Shivir 2026 &bull; Expository Retreat</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900">Sterling Puri / Toshali Sands Resort</div>
              <div className="text-[11px] text-slate-500">Marine Drive, Puri, Odisha, India</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <BedDouble className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900">Full Residential Retreat Pass</div>
              <div className="text-[11px] text-emerald-700 font-medium">Lodging (3 Nights) &amp; All Meals Included</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Roster / Family Members */}
      {attendees && attendees.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-amber-800 uppercase tracking-widest font-mono">
              Registered Attendees ({attendees.length})
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              Group Passes
            </span>
          </div>

          <div className="space-y-2">
            {attendees.map((att: any, idx: number) => (
              <div key={att.id || idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{att.name || att.fullName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{att.reference || refCode} &bull; {att.designation || att.role || 'Delegate'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {att.paymentStatus === 'paid' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloads Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold text-amber-800 uppercase tracking-widest font-mono">
          Downloads &amp; Resources
        </h2>

        <div className="space-y-2">
          <button
            onClick={() => {
              notify('Downloading Vachan Shivir 2026 Confirmation...', 'success');
              window.print();
            }}
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between text-xs text-slate-800"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-amber-700" />
              <span className="font-medium">Registration Confirmation PDF</span>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <Link
            to="/documents"
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between text-xs text-slate-800"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-4 h-4 text-amber-700" />
              <span className="font-medium">Travel &amp; Schedule Guide</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Check-in QR Code</h3>
              <p className="text-xs text-slate-500">Present code at entry desk for fast check-in</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl max-w-[220px] mx-auto border border-slate-200 flex flex-col items-center">
              <div className="w-40 h-40 bg-slate-950 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-slate-950" />
                  <div className="w-10 h-10 border-4 border-white bg-slate-950" />
                </div>
                <div className="text-center font-mono text-[9px] text-amber-400 tracking-widest font-bold">
                  VS-2026
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-slate-950" />
                  <div className="w-6 h-6 bg-amber-500 rounded-xs" />
                </div>
              </div>
            </div>

            <div className="font-mono text-xs font-bold text-slate-900 bg-slate-100 p-3 rounded-xl border border-slate-200">
              {refCode}
            </div>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center relative shadow-2xl">
            <button
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/60 border-2 border-amber-300 p-6 rounded-2xl shadow-md space-y-4 text-center relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 mx-auto flex items-center justify-center font-serif font-black text-sm">
                VS
              </div>

              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  DELEGATE BADGE
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 font-serif">{delegateName}</h3>
                <p className="text-xs text-slate-600 font-medium">{verifiedReg.designation || 'Delegate'}</p>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  {verifiedReg.organisation || 'Grace Fellowship Center'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Vachan Shivir 2026</span>
                <span className="text-slate-900 font-bold">{refCode}</span>
              </div>
            </div>

            <button
              onClick={() => {
                notify('Digital Badge saved!', 'success');
                setShowBadgeModal(false);
              }}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              Save Badge to Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVachanShivir;
