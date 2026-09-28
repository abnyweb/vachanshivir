import React, { useState, useRef } from 'react';
import {
  Heart, Gift, BookOpen, Church, CheckCircle2, ShieldCheck, Copy,
  Check, Building, CreditCard, Sparkles, Send, ArrowUpRight, ArrowDown
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../common/ToastProvider';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { submitDonationToBackend, generateDonationReceipt } from '../../services/donationService';
import { useStore } from '../../store/StoreContext';
import { cn } from '../../utils/cn';
import { VsIcon } from '../common/VsIcon';

interface SponsorshipTier {
  id: string;
  amount: number;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  badgeHi: string;
  badgeEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  {
    id: 'pastor-pass',
    amount: 3000,
    titleHi: '1 पास्टर पास प्रायोजित करें',
    titleEn: 'Sponsor 1 Pastor Pass',
    subtitleHi: '3 रातों का होटल आवास, 4 दिनों का भोजन, अध्ययन किट एवं प्रवेश पास।',
    subtitleEn: 'Covers 3 nights hotel stay, 4 days meals, study kit & entry pass for 1 pastor.',
    badgeHi: 'सर्वाधिक अनुशंसित',
    badgeEn: 'Most Recommended',
    icon: Gift,
  },
  {
    id: 'bibles',
    amount: 1000,
    titleHi: 'निःशुल्क बाइबल साहित्य',
    titleEn: 'Study Bibles & Books',
    subtitleHi: 'सहभागियों को निःशुल्क वितरित की जाने वाली ESV ग्लोबल स्टडी बाइबल एवं पुस्तकें।',
    subtitleEn: 'Sponsors free ESV Global Study Bibles and expository literature for delegates.',
    badgeHi: 'साहित्य सेवा',
    badgeEn: 'Scripture Ministry',
    icon: BookOpen,
  },
  {
    id: 'venue-media',
    amount: 6000,
    titleHi: 'शिविर स्थल एवं रिकॉर्डिंग',
    titleEn: 'Retreat & Media Support',
    subtitleHi: 'पूरी, ओडिशा में हॉल व्यवस्था, साउंड, स्टेज एवं लाइव रिकॉर्डिंग (2 पास्टर प्रायोजन)।',
    subtitleEn: 'Hall setup, sound, stage & live recording in Puri (covers 2 pastors).',
    badgeHi: '2 पास्टर प्रायोजन',
    badgeEn: '2 Pastors Pass',
    icon: Church,
  },
  {
    id: 'custom',
    amount: 0,
    titleHi: 'स्वेच्छानुसार सहयोग',
    titleEn: 'Custom Contribution',
    subtitleHi: 'प्रभु की अगुवाई अनुसार अपनी इच्छानुसार कोई भी राशि शिविर सेवकाई के लिए सहयोग करें।',
    subtitleEn: 'Contribute any voluntary amount as led by the Lord to support this ministry.',
    badgeHi: 'इच्छानुसार राशि',
    badgeEn: 'Flexible Amount',
    icon: Sparkles,
  },
];

export const DonationSection: React.FC = () => {
  const { language } = useLanguage();
  const { notify } = useToast();
  const { create } = useStore();
  const isHi = language === 'hi';

  const [selectedAmount, setSelectedAmount] = useState<number>(3000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [copiedIfsc, setCopiedIfsc] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Tab for donation mode: 'online' (Razorpay) or 'offline' (Direct Bank / UPI UTR submission)
  const [donationMethod, setDonationMethod] = useState<'online' | 'offline'>('online');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [offlineSubmitted, setOfflineSubmitted] = useState<boolean>(false);

  // Refs for smooth navigation between bank details and form
  const formRef = useRef<HTMLDivElement>(null);
  const utrInputRef = useRef<HTMLInputElement>(null);
  const bankingRef = useRef<HTMLDivElement>(null);

  const amountToPay = selectedAmount === 0 ? parseFloat(customAmount) || 0 : selectedAmount;

  // Selected Tier label helper
  const getSelectedPurposeName = () => {
    if (selectedAmount === 3000) return isHi ? '1 पास्टर पास प्रायोजित करें' : 'Sponsor 1 Pastor Pass';
    if (selectedAmount === 1000) return isHi ? 'निःशुल्क बाइबल साहित्य' : 'Study Bibles & Literature';
    if (selectedAmount === 6000) return isHi ? 'शिविर स्थल एवं रिकॉर्डिंग सहयोग' : 'Retreat & Media Support';
    return isHi ? `स्वेच्छानुसार सहयोग (₹${amountToPay.toLocaleString()})` : `Custom Contribution (₹${amountToPay.toLocaleString()})`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('satyamultiservicejob@icici');
    setCopiedUpi(true);
    notify(isHi ? 'UPI ID कॉपी हो गया!' : 'UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('50200048741233');
    setCopiedAccount(true);
    notify(isHi ? 'खाता संख्या कॉपी हो गई!' : 'Account Number copied!', 'success');
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleCopyIfsc = () => {
    navigator.clipboard.writeText('HDFC0004768');
    setCopiedIfsc(true);
    notify(isHi ? 'IFSC कोड कॉपी हो गया!' : 'IFSC Code copied!', 'success');
    setTimeout(() => setCopiedIfsc(false), 3000);
  };

  // Jump from Banking info to UTR submission
  const handleJumpToUtrForm = () => {
    setDonationMethod('offline');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      utrInputRef.current?.focus();
    }, 400);
  };

  // Jump from form to Banking info
  const handleJumpToBanking = () => {
    if (bankingRef.current) {
      bankingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. Online Razorpay Donation Submit
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      notify(isHi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name', 'error');
      return;
    }
    if (amountToPay <= 0) {
      notify(isHi ? 'कृपया मान्य सहयोग राशि चुनें' : 'Please select a valid amount', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await openRazorpayCheckout({
        amountInRupees: amountToPay,
        description: `वचन अध्ययन शिविर 2026 मसीही सहयोग - ${donorName}`,
        receipt: `syg_${Date.now().toString().slice(-10)}`,
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone,
        },
        notes: {
          donorName,
          donorEmail,
          donorPhone,
          purpose: selectedAmount === 3000 ? '1 Pastor Pass Sponsorship' : selectedAmount === 1000 ? 'Study Bibles & Literature' : selectedAmount === 6000 ? 'Venue & Recording Support' : 'Ministry Support (Custom Amount)',
        },
        onSuccess: async (payRes) => {
          setIsProcessing(false);
          setIsSubmitted(true);

          const receiptNum = generateDonationReceipt();
          const donationRecord = {
            id: `dnt_${Date.now()}`,
            donorName: donorName.trim(),
            donorEmail: donorEmail.trim(),
            donorPhone: donorPhone.trim(),
            amount: amountToPay,
            currency: 'INR',
            paymentMode: 'razorpay' as const,
            paymentStatus: 'paid' as const,
            razorpayPaymentId: payRes.paymentId,
            razorpayOrderId: payRes.orderId,
            razorpaySignature: payRes.signature,
            receiptNumber: receiptNum,
            purpose: selectedAmount === 3000 ? '1 पास्टर पास प्रायोजित (Sponsor 1 Pastor Pass)' : selectedAmount === 1000 ? 'नि:शुल्क बाइबल साहित्य (Study Bibles)' : selectedAmount === 6000 ? 'शिविर स्थल एवं रिकॉर्डिंग सहयोग (Venue & Media)' : `स्वेच्छानुसार सहयोग (Custom Contribution ₹${amountToPay})`,
            createdAt: new Date().toISOString(),
          };

          create('donations', donationRecord);
          await submitDonationToBackend(donationRecord);

          notify(
            isHi
              ? `सहयोग सफल! Payment ID: ${payRes.paymentId}. प्रभु आपको बहुतायत से आशीष दे!`
              : `Contribution received! Payment ID: ${payRes.paymentId}. God bless you!`,
            'success'
          );
        },
        onError: (err) => {
          setIsProcessing(false);
          notify(err.description || 'भुगतान विफल रहा।', 'error');
        },
        onDismiss: () => {
          setIsProcessing(false);
          notify('भुगतान प्रक्रिया रद्द की गई।', 'info');
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      notify(err.message || 'गेटवे प्रारंभ नहीं हो सका।', 'error');
    }
  };

  // 2. Offline / Direct Bank Transfer Report Submit
  const handleOfflineReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      notify(isHi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name', 'error');
      return;
    }
    if (amountToPay <= 0) {
      notify(isHi ? 'कृपया मान्य सहयोग राशि दर्ज करें' : 'Please enter valid amount', 'error');
      return;
    }
    if (!utrNumber.trim()) {
      notify(isHi ? 'कृपया बैंक UTR संख्या अथवा UPI Ref No. दर्ज करें' : 'Please enter Bank UTR / UPI Ref number', 'error');
      return;
    }

    setIsProcessing(true);
    const receiptNum = generateDonationReceipt();
    const offlineRecord = {
      id: `dnt_bank_${Date.now()}`,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone.trim(),
      amount: amountToPay,
      currency: 'INR',
      paymentMode: 'direct_bank' as const,
      paymentStatus: 'pending' as const,
      receiptNumber: receiptNum,
      purpose: selectedAmount === 3000 ? '1 पास्टर पास प्रायोजित (Direct Bank)' : selectedAmount === 1000 ? 'नि:शुल्क बाइबल साहित्य (Direct Bank)' : selectedAmount === 6000 ? 'शिविर स्थल एवं रिकॉर्डिंग सहयोग (Direct Bank)' : `स्वेच्छानुसार सहयोग (Direct Bank ₹${amountToPay})`,
      notes: `Direct Bank Transfer reported. UTR: ${utrNumber.trim()}`,
      bankDetails: {
        bankName: 'HDFC Bank',
        utrNumber: utrNumber.trim(),
        accountNumber: '50200048741233',
      },
      createdAt: new Date().toISOString(),
    };

    create('donations', offlineRecord);
    await submitDonationToBackend(offlineRecord);

    setIsProcessing(false);
    setOfflineSubmitted(true);
    notify(
      isHi
        ? 'बैंक सहयोग विवरण प्राप्त हुआ! सत्यापन के पश्चात रसीद भेजी जाएगी।'
        : 'Bank transfer details received! Receipt will be sent upon verification.',
      'success'
    );
  };

  return (
    <section id="donate" className="bg-slate-50 text-slate-900 py-10 sm:py-14 md:py-20 lg:py-24 border-b border-slate-200 relative overflow-hidden font-sans">
      <div className="shell max-w-5xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        
        {/* Section Header with Official Identity Badge */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <VsIcon size="sm" />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.2em] text-navy uppercase font-raleway bg-navy-100/80 border border-navy/30 px-3.5 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>{isHi ? 'मसीही सहयोग एवं प्रायोजन • सत्य वचन चर्च' : 'MINISTRY SUPPORT & SPONSORSHIP • SATYA VACHAN CHURCH'}</span>
            </span>
          </div>

          <h2 className="font-raleway font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-navy-950 leading-tight">
            {isHi ? (
              <>वचन अध्ययन शिविर <span className="text-navy">मसीही सहयोग पोर्टल</span></>
            ) : (
              <>Support &amp; Sponsor <span className="text-navy">Vachan Shivir 2026</span></>
            )}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-sans leading-relaxed max-w-2xl mx-auto">
            {isHi
              ? 'ग्रामीण व आर्थिक रूप से जरूरतमंद पास्टरों एवं अगुवों के लिए शिविर पास, निःशुल्क बाइबल अध्ययन सामग्री एवं साहित्य प्रायोजित करें।'
              : 'Empower pastors, Bible teachers, and delegates from rural congregations by sponsoring their retreat passes and free study Bibles.'}
          </p>

          <div className="w-16 h-1.5 bg-crossgold mx-auto rounded-full" />
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED CONTRIBUTION PORTAL (TIERS + DETAILS + CHECKOUT KEPT TOGETHER)   */}
        {/* ========================================================================= */}
        <div
          ref={formRef}
          className="bg-white border-2 border-navy rounded-3xl p-5 sm:p-8 md:p-10 shadow-brutal space-y-7 transition-all scroll-mt-24"
        >
          {/* Header & Payment Mode Switcher */}
          <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-raleway font-black text-navy uppercase tracking-widest block">
                {isHi ? 'सहयोग राशि एवं उद्देश्य चुनें' : 'CHOOSE PURPOSE & CONTRIBUTE'}
              </span>
              <h3 className="font-raleway font-black text-xl sm:text-2xl text-navy-950 mt-1 flex items-center gap-2">
                <VsIcon size="xs" />
                <span>{isHi ? 'सत्य वचन चर्च सहयोग पोर्टल' : 'Satya Vachan Church Ministry Support'}</span>
              </h3>
            </div>

            {/* Toggle Online Razorpay vs Direct Bank UTR Report */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDonationMethod('online')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold font-raleway transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  donationMethod === 'online'
                    ? "bg-navy text-crossgold font-black shadow-xs"
                    : "text-slate-600 hover:text-navy"
                )}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isHi ? 'ऑनलाइन गेटवे (Razorpay)' : 'Online Card/UPI'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDonationMethod('offline')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold font-raleway transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  donationMethod === 'offline'
                    ? "bg-navy text-crossgold font-black shadow-xs"
                    : "text-slate-600 hover:text-navy"
                )}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{isHi ? 'बैंक UTR रसीद दर्ज करें' : 'Report Bank UTR'}</span>
              </button>
            </div>
          </div>

          {/* Confirmation Success Screen */}
          {isSubmitted || offlineSubmitted ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-10 text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-raleway font-black text-2xl sm:text-3xl text-slate-900">
                {isHi ? 'सहयोग अनुरोध प्राप्त हुआ! प्रभु आपको आशीष दे।' : 'Thank you for your faithful ministry support!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto font-sans leading-relaxed">
                {isHi
                  ? `आपका ₹${amountToPay.toLocaleString()} का मसीही सहयोग सत्य वचन चर्च को प्राप्त हुआ है। यह रिकॉर्ड सिस्टम में सुरक्षित रूप से दर्ज कर दिया गया है।`
                  : `Your contribution of ₹${amountToPay.toLocaleString()} has been securely recorded for Satya Vachan Church Vachan Shivir 2026.`}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => { setIsSubmitted(false); setOfflineSubmitted(false); }}
                  className="inline-flex items-center gap-2 bg-crossgold hover:bg-crossgold-dark text-navy-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm border border-navy-950 font-raleway cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-navy-950" />
                  <span>{isHi ? 'अन्य सहयोग करें' : 'Make Another Contribution'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* ========================================================================= */}
              {/* STEP 1: SPONSORSHIP & CONTRIBUTION TIERS (UNIFIED TOGETHER IN CARD)      */}
              {/* ========================================================================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black font-raleway text-slate-800 uppercase tracking-wider">
                    {isHi ? '1. सहयोग उद्देश्य एवं राशि चुनें (SELECT SPONSORSHIP TIER)' : '1. CHOOSE SPONSORSHIP / AMOUNT'}
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {isHi ? 'क्लिक करके चुनें' : 'Tap to select'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {SPONSORSHIP_TIERS.map((tier) => {
                    const IconComponent = tier.icon;
                    const isSelected = selectedAmount === tier.amount;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setSelectedAmount(tier.amount);
                          if (tier.amount > 0) setCustomAmount('');
                        }}
                        className={cn(
                          "relative rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all cursor-pointer border-2 text-left select-none",
                          isSelected
                            ? "border-navy-950 bg-amber-50/70 shadow-[3px_3px_0px_#0B1D33] ring-2 ring-crossgold scale-[1.01]"
                            : "border-slate-200 bg-white hover:border-navy hover:bg-slate-50/80 shadow-2xs hover:shadow-xs"
                        )}
                      >
                        {/* Top Row: Icon + Badge */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors",
                              isSelected ? "bg-navy text-crossgold" : "bg-slate-100 text-slate-700"
                            )}>
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <span className={cn(
                              "text-[10px] font-bold font-raleway uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              isSelected
                                ? "bg-crossgold/30 text-navy-950 border-navy-950 font-black"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              {isHi ? tier.badgeHi : tier.badgeEn}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-raleway font-black text-sm sm:text-base text-slate-900 leading-snug">
                            {isHi ? tier.titleHi : tier.titleEn}
                          </h4>

                          {/* Subtitle / Description */}
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-3">
                            {isHi ? tier.subtitleHi : tier.subtitleEn}
                          </p>
                        </div>

                        {/* Bottom Row: Amount Pill & Active Radio */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className={cn(
                            "font-mono font-black text-xs sm:text-sm",
                            isSelected ? "text-navy-950" : "text-slate-800"
                          )}>
                            {tier.amount > 0 ? `₹${tier.amount.toLocaleString()}` : (isHi ? 'अन्य राशि' : 'Custom')}
                          </div>

                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                            isSelected
                              ? "bg-navy border-navy text-crossgold"
                              : "border-slate-300 bg-white"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Amount Input Box & Suggestion Chips (Smoothly unfolds if selected) */}
                {selectedAmount === 0 && (
                  <div className="p-4 bg-amber-50/70 border-2 border-navy-950 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-black font-raleway text-navy-950 uppercase tracking-wider">
                        {isHi ? 'इच्छानुसार सहयोग राशि दर्ज करें (INR ₹)' : 'ENTER CUSTOM CONTRIBUTION AMOUNT (INR ₹)'}
                      </label>
                      <span className="text-[11px] text-slate-600 font-sans">
                        {isHi ? 'नीचे दिए गए सुझावों में से भी चुन सकते हैं:' : 'Or tap a quick preset:'}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-700 font-bold text-lg font-mono">₹</span>
                      <input
                        type="number"
                        min="1"
                        autoFocus
                        placeholder={isHi ? "उदाहरण: 5000" : "e.g. 5000"}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 border-2 border-navy-950 rounded-xl text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-crossgold bg-white shadow-2xs"
                      />
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {[500, 2000, 5000, 10000, 25000].map((quickAmt) => (
                        <button
                          type="button"
                          key={quickAmt}
                          onClick={() => setCustomAmount(String(quickAmt))}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer",
                            customAmount === String(quickAmt)
                              ? "bg-navy text-crossgold border-navy-950 shadow-xs"
                              : "bg-white text-slate-800 border-slate-300 hover:border-navy hover:bg-slate-100"
                          )}
                        >
                          ₹{quickAmt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* ACTIVE SELECTION SUMMARY RIBBON                                          */}
              {/* ========================================================================= */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-navy-950 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-crossgold text-navy-950 font-bold flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-navy-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-crossgold uppercase font-bold tracking-wider block">
                      {isHi ? 'चयनित सहयोग उद्देश्य' : 'SELECTED CONTRIBUTION PURPOSE'}
                    </span>
                    <span className="font-raleway font-bold text-xs sm:text-sm text-white">
                      {getSelectedPurposeName()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 font-mono">
                  <span className="text-xs text-slate-300">
                    {isHi ? 'कुल सहयोग:' : 'Total Amount:'}
                  </span>
                  <span className="text-base sm:text-lg font-black text-crossgold">
                    ₹{amountToPay.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* STEP 2: DONOR CONTACT DETAILS                                            */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-black font-raleway text-slate-800 uppercase tracking-wider">
                  {isHi ? '2. अपना विवरण दर्ज करें (DONOR CONTACT DETAILS)' : '2. YOUR CONTACT DETAILS'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-raleway">
                      {isHi ? 'आपका पूरा नाम *' : 'Your Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Kumar"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:border-navy bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-raleway">
                      {isHi ? 'ईमेल पता' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:border-navy bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-raleway">
                      {isHi ? 'मोबाइल / व्हाट्सएप नंबर' : 'Mobile / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9696110134"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:border-navy bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* STEP 3: PAYMENT / SUBMISSION ACTION                                       */}
              {/* ========================================================================= */}
              {donationMethod === 'online' ? (
                /* Mode 1: ONLINE RAZORPAY GATEWAY */
                <form onSubmit={handleSubmitDonation} className="space-y-4 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 font-sans p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {isHi
                          ? '100% सुरक्षित भुगतान गेटवे (UPI, Google Pay, PhonePe, Cards, NetBanking समर्थित)'
                          : '100% Secure Checkout via Razorpay (Supports UPI, Cards, NetBanking)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleJumpToBanking}
                      className="text-navy font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>{isHi ? 'या सीधे बैंक में भेजें' : 'Or direct bank transfer'}</span>
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || amountToPay <= 0 || !donorName.trim()}
                    className={cn(
                      "w-full py-4 bg-gradient-to-r from-crossgold via-amber-400 to-amber-500 hover:opacity-95 text-navy-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all shadow-md font-raleway border-2 border-navy-950 flex items-center justify-center gap-2 cursor-pointer",
                      (isProcessing || amountToPay <= 0 || !donorName.trim()) && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                        <span>{isHi ? 'गेटवे खुल रहा है...' : 'Opening Payment Gateway...'}</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 text-navy-950 shrink-0 fill-navy-950" />
                        <span>
                          {isHi
                            ? `₹${amountToPay.toLocaleString()} का सहयोग सबमिट करें (DONATE ₹${amountToPay.toLocaleString()})`
                            : `Contribute ₹${amountToPay.toLocaleString()} Online Now`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Mode 2: OFFLINE DIRECT BANK / UPI REPORT FORM */
                <form onSubmit={handleOfflineReportSubmit} className="space-y-4 pt-1">
                  <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs font-raleway">
                        <Building className="w-4 h-4 text-amber-700" />
                        <span>{isHi ? 'बैंक / UPI स्थानांतरण सत्यापन विवरण दर्ज करें' : 'Report Bank / UPI Transfer Details'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleJumpToBanking}
                        className="text-navy font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isHi ? 'बैंक विवरण देखें' : 'View Bank Details'}</span>
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'बैंक UTR नंबर / UPI Txn Ref ID *' : 'Bank UTR Number / UPI Ref ID *'}
                      </label>
                      <input
                        ref={utrInputRef}
                        type="text"
                        required
                        placeholder="e.g. 429182749102 or UPI/50291823"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 border-2 border-amber-400 rounded-xl text-xs sm:text-sm font-mono font-bold bg-white focus:outline-none focus:border-navy"
                      />
                      <p className="text-[11px] text-amber-900 mt-1 font-sans">
                        {isHi
                          ? 'नीचे दिए गए HDFC बैंक खाते अथवा UPI में स्थानांतरण करने के उपरांत प्राप्त UTR संख्या यहाँ दर्ज करें।'
                          : 'Enter the UTR reference generated after transferring to our HDFC account or UPI below.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || amountToPay <= 0 || !donorName.trim() || !utrNumber.trim()}
                    className={cn(
                      "w-full py-4 bg-navy hover:bg-navy-900 text-crossgold font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all shadow-md font-raleway border-2 border-navy-950 flex items-center justify-center gap-2 cursor-pointer",
                      (isProcessing || amountToPay <= 0 || !donorName.trim() || !utrNumber.trim()) && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-crossgold border-t-transparent rounded-full animate-spin" />
                        <span>{isHi ? 'दर्ज किया जा रहा है...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-crossgold shrink-0" />
                        <span>
                          {isHi
                            ? `₹${amountToPay.toLocaleString()} बैंक सहयोग रिपोर्ट सबमिट करें`
                            : `Submit Bank Transfer Report of ₹${amountToPay.toLocaleString()}`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Official Ownership Footer Note */}
          <div className="pt-2 text-center text-xs text-slate-500 font-sans border-t border-slate-100">
            <p className="flex items-center justify-center gap-1.5">
              <Church className="w-3.5 h-3.5 inline shrink-0 text-navy" />
              <span>
                {isHi
                  ? 'यह सहयोग सीधे सत्य वचन चर्च द्वारा आयोजित वचन अध्ययन शिविर 2026 के पास्टर प्रायोजन एवं निःशुल्क बाइबल वितरण में उपयोग किया जाता है।'
                  : 'All contributions are received under Satya Vachan Church and used to fund delegate sponsorships, venue costs, and free Bibles for Vachan Shivir 2026.'}
              </span>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL BANKING SECTION (PLACED AFTER THE MAIN DONATION SECTION)         */}
        {/* ========================================================================= */}
        <div
          ref={bankingRef}
          className="bg-white border-2 border-navy rounded-3xl p-6 sm:p-8 md:p-9 shadow-brutal space-y-6 scroll-mt-24 transition-all"
        >
          {/* Header of Banking Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-navy text-crossgold flex items-center justify-center shrink-0 border border-navy shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-navy block font-raleway">
                  {isHi ? 'आधिकारिक बैंक खाता विवरण' : 'OFFICIAL BANK ACCOUNT DETAILS'}
                </span>
                <h3 className="font-raleway font-black text-lg sm:text-xl text-navy-950">
                  {isHi ? 'सत्य वचन चर्च बैंक खाता (HDFC Bank Transfer)' : 'Satya Vachan Church HDFC Bank Transfer'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleJumpToUtrForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-navy-950 border border-amber-300 rounded-xl font-bold text-xs font-raleway transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>{isHi ? 'बैंक ट्रांसफर कर दिया? यहाँ UTR दर्ज करें' : 'Paid via Bank? Report UTR Here'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-navy" />
            </button>
          </div>

          <p className="text-xs text-slate-600 font-sans">
            {isHi
              ? 'यदि आप सीधे बैंक खाते में NEFT, RTGS, IMPS अथवा प्रत्यक्ष UPI द्वारा सहयोग भेजना चाहते हैं, तो कृपया नीचे दिए गए विवरण का उपयोग करें:'
              : 'If you prefer transferring directly to our bank account via NEFT, RTGS, IMPS or direct UPI, please use the following official credentials:'}
          </p>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
            {/* Bank Name */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                {isHi ? 'बैंक का नाम' : 'BANK NAME'}
              </span>
              <div className="text-sm font-bold text-navy-950">HDFC Bank</div>
            </div>

            {/* Account Name */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                {isHi ? 'खाता धारक का नाम' : 'ACCOUNT NAME'}
              </span>
              <div className="text-sm font-bold text-navy-950">Satya Vachan Church</div>
            </div>

            {/* Account Number with 1-click Copy */}
            <div className="bg-white p-4 rounded-2xl border-2 border-navy/20 shadow-2xs flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  {isHi ? 'खाता संख्या (ACCOUNT NUMBER)' : 'ACCOUNT NUMBER'}
                </span>
                <div className="text-base font-black text-navy-950 font-mono tracking-wider">
                  50200048741233
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy text-crossgold hover:bg-navy-900 rounded-xl font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
                title="Copy Account Number"
              >
                {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAccount ? (isHi ? 'कॉपी हो गया' : 'Copied') : (isHi ? 'कॉपी करें' : 'Copy')}</span>
              </button>
            </div>

            {/* IFSC Code with 1-click Copy */}
            <div className="bg-white p-4 rounded-2xl border-2 border-navy/20 shadow-2xs flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  {isHi ? 'IFSC कोड' : 'IFSC CODE'}
                </span>
                <div className="text-base font-black text-navy-950 font-mono tracking-wider">
                  HDFC0004768
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyIfsc}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy text-crossgold hover:bg-navy-900 rounded-xl font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
                title="Copy IFSC Code"
              >
                {copiedIfsc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedIfsc ? (isHi ? 'कॉपी हो गया' : 'Copied') : (isHi ? 'कॉपी करें' : 'Copy')}</span>
              </button>
            </div>

            {/* Branch Address */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 md:col-span-2 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                {isHi ? 'शाखा का पता' : 'BRANCH ADDRESS'}
              </span>
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                SP Dental College, Telibagh, Rae Bareilly Road, Lucknow, Uttar Pradesh - 226025
              </div>
            </div>

            {/* UPI ID with 1-click Copy */}
            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 font-mono">
                  {isHi ? 'प्रत्यक्ष UPI ID (DIRECT UPI)' : 'DIRECT UPI ID'}
                </span>
                <div className="text-sm sm:text-base font-mono font-bold text-amber-950">
                  satyamultiservicejob@icici
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy hover:bg-navy-900 text-crossgold rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? (isHi ? 'कॉपी हो गया' : 'Copied') : (isHi ? 'UPI ID कॉपी करें' : 'Copy UPI ID')}</span>
              </button>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {isHi
                  ? 'बैंक या UPI से स्थानांतरण करने के बाद, आधिकारिक रसीद जारी करवाने के लिए ऊपर "बैंक UTR रसीद दर्ज करें" विकल्प में जाकर UTR नंबर अवश्य सबमिट करें।'
                  : 'After transferring funds, please submit your UTR reference number above to receive your official donation receipt.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleJumpToUtrForm}
              className="font-bold text-xs text-navy hover:underline shrink-0 font-raleway cursor-pointer"
            >
              {isHi ? 'UTR दर्ज करने ऊपर जाएँ ↑' : 'Go up to submit UTR ↑'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
