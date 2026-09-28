import { useState } from 'react';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { openRazorpayCheckout, type RazorpayPrefill } from '../../services/razorpayService';
import { cn } from '../../utils/cn';
import { useToast } from './ToastProvider';

interface RazorpayPayButtonProps {
  amountInRupees: number;
  registrationId?: string;
  receipt?: string;
  prefill?: RazorpayPrefill;
  description?: string;
  label?: string;
  className?: string;
  onPaymentSuccess?: (data: {
    paymentId: string;
    orderId: string;
    signature: string;
    registration?: any;
  }) => void;
  onPaymentError?: (error: any) => void;
}

export function RazorpayPayButton({
  amountInRupees,
  registrationId,
  receipt,
  prefill,
  description,
  label,
  className,
  onPaymentSuccess,
  onPaymentError,
}: RazorpayPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const { notify } = useToast();

  const handlePay = async () => {
    if (loading || paidSuccess) return;

    setLoading(true);
    try {
      await openRazorpayCheckout({
        amountInRupees,
        registrationId,
        receipt,
        prefill,
        description: description || `वचन अध्ययन शिविर 2026 शुल्क: ₹${amountInRupees.toLocaleString('en-IN')}`,
        onSuccess: (res) => {
          setLoading(false);
          setPaidSuccess(true);
          notify(`भुगतान सफल! Razorpay ID: ${res.paymentId}`, 'success');
          if (onPaymentSuccess) onPaymentSuccess(res);
        },
        onError: (err) => {
          setLoading(false);
          notify(err.description || 'भुगतान विफल रहा या रद्द किया गया।', 'error');
          if (onPaymentError) onPaymentError(err);
        },
        onDismiss: () => {
          setLoading(false);
          notify('भुगतान विंडो बंद कर दी गई।', 'info');
        },
      });
    } catch (err: any) {
      setLoading(false);
      notify(err.message || 'Razorpay गेटवे शुरू करने में त्रुटि।', 'error');
      if (onPaymentError) onPaymentError(err);
    }
  };

  if (paidSuccess) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        <CheckCircle2 size={16} className="text-emerald-600" />
        <span>भुगतान सत्यापित (₹{amountInRupees.toLocaleString('en-IN')} Paid)</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer',
        'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/20',
        loading && 'opacity-70 cursor-wait',
        className
      )}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Razorpay गेटवे खुल रहा है...</span>
        </>
      ) : (
        <>
          <CreditCard size={16} />
          <span>{label || `Razorpay से भुगतान करें (Pay ₹${amountInRupees.toLocaleString('en-IN')})`}</span>
          <Lock size={12} className="opacity-80" />
        </>
      )}
    </button>
  );
}
