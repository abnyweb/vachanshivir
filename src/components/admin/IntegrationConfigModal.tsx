import { useState, useEffect } from 'react';
import {
  X, Check, Copy, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2,
  ExternalLink, ShieldCheck, Sparkles, Key, Send
} from 'lucide-react';
import type { IntegrationSettings } from '../../types';
import {
  YouTubeIcon, InstagramIcon, WhatsAppIcon, RazorpayIcon,
  GoogleSheetsIcon, GmailIcon, ZoomIcon
} from './IntegrationIcons';

export type IntegrationKey = keyof IntegrationSettings;

interface IntegrationConfigModalProps {
  serviceKey: IntegrationKey | null;
  isOpen: boolean;
  onClose: () => void;
  config: any;
  onSave: (service: IntegrationKey, updatedConfig: any) => Promise<void>;
  onTest: (service: IntegrationKey, currentConfig: any) => Promise<{ success: boolean; message: string; latency?: string; [key: string]: any }>;
  onToggleConnect: (service: IntegrationKey) => Promise<void>;
}

export function IntegrationConfigModal({
  serviceKey,
  isOpen,
  onClose,
  config,
  onSave,
  onTest,
  onToggleConnect,
}: IntegrationConfigModalProps) {
  if (!isOpen || !serviceKey || !config) return null;

  const [formData, setFormData] = useState<any>({ ...config });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'credentials' | 'automations' | 'guide'>('credentials');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; latency?: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ ...config });
    setTestResult(null);
    setShowSecrets({});
    setActiveTab('credentials');
  }, [config, serviceKey]);

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(serviceKey, formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(serviceKey, formData);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed. Please verify credentials.',
      });
    } finally {
      setTesting(false);
    }
  };

  const renderServiceHeader = () => {
    switch (serviceKey) {
      case 'razorpay':
        return {
          title: 'Razorpay Payment Gateway API',
          subtitle: 'Configure Razorpay API Keys, Webhook secrets, and checkout modes.',
          icon: <RazorpayIcon className="w-6 h-6 text-sky-600" />,
          iconBg: 'bg-sky-50 border-sky-200',
          portalUrl: 'https://dashboard.razorpay.com/app/keys',
          portalLabel: 'Razorpay Dashboard API Keys',
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp Cloud API & Business Messaging',
          subtitle: 'Configure Meta WhatsApp Cloud API credentials, official delegate group links, and automated templates.',
          icon: <WhatsAppIcon className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200',
          portalUrl: 'https://developers.facebook.com/apps/',
          portalLabel: 'Meta Developers WhatsApp App',
        };
      case 'youtube':
        return {
          title: 'YouTube Data API v3 & Livestreaming',
          subtitle: 'Link official YouTube channel to automatically sync expository sermons and broadcast conference livestreams.',
          icon: <YouTubeIcon className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200',
          portalUrl: 'https://console.cloud.google.com/apis/credentials',
          portalLabel: 'Google Cloud YouTube API Console',
        };
      case 'instagram':
        return {
          title: 'Instagram Graph API & Photo Gallery',
          subtitle: 'Integrate Instagram account feed to synchronize photo albums, ministry reels, and retreat updates.',
          icon: <InstagramIcon className="w-6 h-6 text-fuchsia-600" />,
          iconBg: 'bg-fuchsia-50 border-fuchsia-200',
          portalUrl: 'https://developers.facebook.com/docs/instagram-platform',
          portalLabel: 'Meta Instagram Graph Documentation',
        };
      case 'email':
        return {
          title: 'Gmail & Business Email CRM Connector',
          subtitle: 'Synchronize pastoral inquiries, registration confirmations, and CRM communications via OAuth 2.0 or SMTP.',
          icon: <GmailIcon className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200',
          portalUrl: 'https://console.cloud.google.com/apis/credentials',
          portalLabel: 'Google Cloud OAuth Credentials',
        };
      case 'sheets':
        return {
          title: 'Google Sheets Bi-Directional Master Feed',
          subtitle: 'Real-time synchronization with Google Sheets for committee registration audits and offline field entries.',
          icon: <GoogleSheetsIcon className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200',
          portalUrl: formData.spreadsheetUrl || 'https://docs.google.com/spreadsheets',
          portalLabel: 'Open Google Spreadsheet',
        };
      case 'zoom':
        return {
          title: 'Zoom Video & Hybrid Webinar API',
          subtitle: 'Configure Server-to-Server OAuth to generate meeting links for remote delegates and expository teaching.',
          icon: <ZoomIcon className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-50 border-blue-200',
          portalUrl: 'https://marketplace.zoom.us/develop/create',
          portalLabel: 'Zoom App Marketplace',
        };
      case 'storage':
        return {
          title: 'Cloud Object Storage (AWS S3 / GCS / R2)',
          subtitle: 'Secure bucket storage for speaker photos, audio sermon mp3s, and attendee badge PDFs.',
          icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200',
          portalUrl: 'https://aws.amazon.com/s3/',
          portalLabel: 'AWS S3 Console',
        };
      case 'sms':
        return {
          title: 'Indian DLT SMS Gateway (Fast2SMS / MSG91)',
          subtitle: 'Deliver transactional OTPs and urgent retreat schedule alerts with Indian DLT-compliant sender ID.',
          icon: <Send className="w-6 h-6 text-violet-600" />,
          iconBg: 'bg-violet-50 border-violet-200',
          portalUrl: 'https://www.fast2sms.com/dashboard',
          portalLabel: 'Fast2SMS Dashboard',
        };
      default:
        return {
          title: `${serviceKey} Connector`,
          subtitle: 'Configure API parameters and connection settings.',
          icon: <Key className="w-6 h-6 text-slate-700" />,
          iconBg: 'bg-slate-100 border-slate-200',
          portalUrl: '#',
          portalLabel: 'Developer Documentation',
        };
    }
  };

  const meta = renderServiceHeader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${meta.iconBg}`}>
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-raleway text-slate-900">{meta.title}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    formData.connected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {formData.connected ? <CheckCircle2 size={10} className="text-emerald-600" /> : null}
                  {formData.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{meta.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold font-raleway">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'credentials'
                ? 'border-navy-950 text-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            API Credentials &amp; Keys
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('automations')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'automations'
                ? 'border-navy-950 text-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workflows &amp; Webhooks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-navy-950 text-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Integration Setup Guide
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              {/* RAZORPAY SPECIFIC FIELDS */}
              {serviceKey === 'razorpay' && (
                <>
                  <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-sky-900 block font-raleway">Active Gateway Environment</span>
                      <span className="text-sky-700 text-[11px]">Toggle between sandbox test credentials and live production payments.</span>
                    </div>
                    <div className="flex bg-white rounded-xl p-1 border border-sky-300">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('mode', 'test')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.mode === 'test' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Sandbox (Test)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('mode', 'live')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.mode === 'live' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Production (Live)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razorpay Key ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.keyId || ''}
                      onChange={(e) => handleFieldChange('keyId', e.target.value)}
                      placeholder={formData.mode === 'live' ? 'rzp_live_...' : 'rzp_test_...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      required
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Found under Razorpay Dashboard → Account &amp; Settings → API Keys.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razorpay Key Secret <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['keySecret'] ? 'text' : 'password'}
                        value={formData.keySecret || ''}
                        onChange={(e) => handleFieldChange('keySecret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('keySecret')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['keySecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Webhook Secret (HMAC-SHA256 Signature Verification)
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['webhookSecret'] ? 'text' : 'password'}
                        value={formData.webhookSecret || ''}
                        onChange={(e) => handleFieldChange('webhookSecret', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('webhookSecret')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['webhookSecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                      <input
                        type="text"
                        value={formData.currency || 'INR'}
                        onChange={(e) => handleFieldChange('currency', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoCapture ?? true}
                          onChange={(e) => handleFieldChange('autoCapture', e.target.checked)}
                          className="rounded text-navy focus:ring-navy w-4 h-4 cursor-pointer"
                        />
                        <span>Auto-capture Payments</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* WHATSAPP SPECIFIC FIELDS */}
              {serviceKey === 'whatsapp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Provider API</label>
                      <select
                        value={formData.provider || 'meta_cloud_api'}
                        onChange={(e) => handleFieldChange('provider', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-navy focus:border-navy"
                      >
                        <option value="meta_cloud_api">Meta WhatsApp Cloud API (Recommended)</option>
                        <option value="twilio">Twilio Programmable Messaging</option>
                        <option value="whatsapp_web">Direct WhatsApp Group &amp; Chat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Display Business Phone</label>
                      <input
                        type="text"
                        value={formData.displayPhone || ''}
                        onChange={(e) => handleFieldChange('displayPhone', e.target.value)}
                        placeholder="+91 96961 10134"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number ID</label>
                    <input
                      type="text"
                      value={formData.phoneNumberId || ''}
                      onChange={(e) => handleFieldChange('phoneNumberId', e.target.value)}
                      placeholder="e.g. 108429482910482"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Generated inside Meta Developers → WhatsApp → API Setup.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      value={formData.wabaId || ''}
                      onChange={(e) => handleFieldChange('wabaId', e.target.value)}
                      placeholder="e.g. 109283746192834"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Permanent System User Access Token</label>
                    <div className="relative">
                      <input
                        type={showSecrets['accessToken'] ? 'text' : 'password'}
                        value={formData.accessToken || ''}
                        onChange={(e) => handleFieldChange('accessToken', e.target.value)}
                        placeholder="EAAG..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('accessToken')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['accessToken'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Delegate Group Invite Link</label>
                    <input
                      type="url"
                      value={formData.groupInviteLink || ''}
                      onChange={(e) => handleFieldChange('groupInviteLink', e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                </>
              )}

              {/* YOUTUBE SPECIFIC FIELDS */}
              {serviceKey === 'youtube' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      YouTube Data API v3 Key <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['apiKey'] ? 'text' : 'password'}
                        value={formData.apiKey || ''}
                        onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('apiKey')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['apiKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Generated in Google Cloud Console with YouTube Data API v3 enabled.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Channel ID</label>
                      <input
                        type="text"
                        value={formData.channelId || ''}
                        onChange={(e) => handleFieldChange('channelId', e.target.value)}
                        placeholder="UC_SatyaVachanMinistry2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Custom Handle</label>
                      <input
                        type="text"
                        value={formData.customHandle || ''}
                        onChange={(e) => handleFieldChange('customHandle', e.target.value)}
                        placeholder="@SatyaVachan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Ministry Channel Title</label>
                    <input
                      type="text"
                      value={formData.channelTitle || ''}
                      onChange={(e) => handleFieldChange('channelTitle', e.target.value)}
                      placeholder="Satya Vachan Church & Ministry"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-navy focus:border-navy font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Active Conference Livestream ID</label>
                      <input
                        type="text"
                        value={formData.liveStreamVideoId || ''}
                        onChange={(e) => handleFieldChange('liveStreamVideoId', e.target.value)}
                        placeholder="e.g. dQw4w9WgXcQ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sermons Archive Playlist ID</label>
                      <input
                        type="text"
                        value={formData.sermonsPlaylistId || ''}
                        onChange={(e) => handleFieldChange('sermonsPlaylistId', e.target.value)}
                        placeholder="PL_VS2026_EXPOSITORY_SERMONS"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* INSTAGRAM SPECIFIC FIELDS */}
              {serviceKey === 'instagram' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Account Handle</label>
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        placeholder="@vachanshivir"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Business Account ID</label>
                      <input
                        type="text"
                        value={formData.accountId || ''}
                        onChange={(e) => handleFieldChange('accountId', e.target.value)}
                        placeholder="17841400928374"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Long-Lived Graph API Access Token</label>
                    <div className="relative">
                      <input
                        type={showSecrets['accessToken'] ? 'text' : 'password'}
                        value={formData.accessToken || ''}
                        onChange={(e) => handleFieldChange('accessToken', e.target.value)}
                        placeholder="IGQVJ..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('accessToken')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['accessToken'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Public Profile URL</label>
                    <input
                      type="url"
                      value={formData.profileUrl || ''}
                      onChange={(e) => handleFieldChange('profileUrl', e.target.value)}
                      placeholder="https://instagram.com/vachanshivir"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                </>
              )}

              {/* EMAIL / GMAIL SPECIFIC FIELDS */}
              {serviceKey === 'email' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Connected Email Address</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="enquirymsj@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Protocol / Provider</label>
                      <select
                        value={formData.provider || 'Google Workspace OAuth 2.0'}
                        onChange={(e) => handleFieldChange('provider', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-navy focus:border-navy"
                      >
                        <option value="Google Workspace OAuth 2.0">Google Workspace OAuth 2.0</option>
                        <option value="Custom SMTP / IMAP">Custom SMTP / IMAP Relay</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google OAuth Client ID</label>
                    <input
                      type="text"
                      value={formData.clientId || ''}
                      onChange={(e) => handleFieldChange('clientId', e.target.value)}
                      placeholder="305428340271-...apps.googleusercontent.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={formData.smtpHost || 'smtp.gmail.com'}
                        onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={formData.smtpPort || 587}
                        onChange={(e) => handleFieldChange('smtpPort', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* GOOGLE SHEETS SPECIFIC FIELDS */}
              {serviceKey === 'sheets' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Master Spreadsheet Name</label>
                    <input
                      type="text"
                      value={formData.spreadsheetName || ''}
                      onChange={(e) => handleFieldChange('spreadsheetName', e.target.value)}
                      placeholder="VS 2026 Master Data"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Sheet URL</label>
                    <input
                      type="url"
                      value={formData.spreadsheetUrl || ''}
                      onChange={(e) => handleFieldChange('spreadsheetUrl', e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Service Account Client Email</label>
                    <input
                      type="email"
                      value={formData.serviceAccountEmail || ''}
                      onChange={(e) => handleFieldChange('serviceAccountEmail', e.target.value)}
                      placeholder="vachan-shivir-sync@...iam.gserviceaccount.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </>
              )}

              {/* ZOOM SPECIFIC FIELDS */}
              {serviceKey === 'zoom' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Zoom Account ID</label>
                      <input
                        type="text"
                        value={formData.accountId || ''}
                        onChange={(e) => handleFieldChange('accountId', e.target.value)}
                        placeholder="Zoom Account ID"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Client ID</label>
                      <input
                        type="text"
                        value={formData.clientId || ''}
                        onChange={(e) => handleFieldChange('clientId', e.target.value)}
                        placeholder="Zoom OAuth Client ID"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Client Secret</label>
                    <div className="relative">
                      <input
                        type={showSecrets['clientSecret'] ? 'text' : 'password'}
                        value={formData.clientSecret || ''}
                        onChange={(e) => handleFieldChange('clientSecret', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('clientSecret')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['clientSecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Default Meeting Topic Template</label>
                    <input
                      type="text"
                      value={formData.defaultMeetingTopic || ''}
                      onChange={(e) => handleFieldChange('defaultMeetingTopic', e.target.value)}
                      placeholder="Vachan Shivir 2026 — Daily Expository Session"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </>
              )}

              {/* CLOUD STORAGE SPECIFIC FIELDS */}
              {serviceKey === 'storage' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Storage Provider</label>
                      <select
                        value={formData.provider || 'aws_s3'}
                        onChange={(e) => handleFieldChange('provider', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        <option value="aws_s3">Amazon S3</option>
                        <option value="google_cloud_storage">Google Cloud Storage</option>
                        <option value="cloudflare_r2">Cloudflare R2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bucket Name</label>
                      <input
                        type="text"
                        value={formData.bucketName || ''}
                        onChange={(e) => handleFieldChange('bucketName', e.target.value)}
                        placeholder="vachanshivir-assets-2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Region</label>
                      <input
                        type="text"
                        value={formData.region || 'ap-south-1'}
                        onChange={(e) => handleFieldChange('region', e.target.value)}
                        placeholder="ap-south-1 (Mumbai)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Custom CDN URL</label>
                      <input
                        type="text"
                        value={formData.cdnUrl || ''}
                        onChange={(e) => handleFieldChange('cdnUrl', e.target.value)}
                        placeholder="https://cdn.vachanshivir.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Access Key ID</label>
                    <input
                      type="text"
                      value={formData.accessKey || ''}
                      onChange={(e) => handleFieldChange('accessKey', e.target.value)}
                      placeholder="AKIA..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Secret Access Key</label>
                    <div className="relative">
                      <input
                        type={showSecrets['secretKey'] ? 'text' : 'password'}
                        value={formData.secretKey || ''}
                        onChange={(e) => handleFieldChange('secretKey', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('secretKey')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['secretKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* SMS SPECIFIC FIELDS */}
              {serviceKey === 'sms' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMS Gateway Provider</label>
                      <select
                        value={formData.provider || 'fast2sms'}
                        onChange={(e) => handleFieldChange('provider', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        <option value="fast2sms">Fast2SMS (Quick DLT)</option>
                        <option value="msg91">MSG91 Enterprise</option>
                        <option value="twilio">Twilio SMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">DLT Approved Sender ID (6 Characters)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.senderId || 'VCHNSV'}
                        onChange={(e) => handleFieldChange('senderId', e.target.value.toUpperCase())}
                        placeholder="VCHNSV"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SMS Gateway API Key</label>
                    <div className="relative">
                      <input
                        type={showSecrets['smsApiKey'] ? 'text' : 'password'}
                        value={formData.apiKey || ''}
                        onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('smsApiKey')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['smsApiKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">DLT Principal Entity ID (India Trai)</label>
                    <input
                      type="text"
                      value={formData.dltEntityId || ''}
                      onChange={(e) => handleFieldChange('dltEntityId', e.target.value)}
                      placeholder="1201159123456789012"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: AUTOMATIONS & WEBHOOKS */}
          {activeTab === 'automations' && (
            <div className="space-y-5">
              {/* Webhook Endpoint Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-crossgold font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Server Webhook Endpoint URL
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `https://vachanshivir.in/api/webhooks/${serviceKey}`,
                        'webhookUrl'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white bg-white/10 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedField === 'webhookUrl' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedField === 'webhookUrl' ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-white/90 break-all p-2 rounded-lg bg-black/30 border border-white/10">
                  {`https://vachanshivir.in/api/webhooks/${serviceKey}`}
                </div>
                <p className="text-[11px] text-white/60">
                  Register this URL in {meta.title} to receive real-time asynchronous callbacks and events.
                </p>
              </div>

              {/* Service Automation Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-raleway">
                  Automated Event Triggers
                </h4>

                {serviceKey === 'whatsapp' && (
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSendRegConfirm ?? true}
                        onChange={(e) => handleFieldChange('autoSendRegConfirm', e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Instant Registration Pass &amp; Entry Barcode</span>
                        <span className="text-[11px] text-slate-500">Automatically dispatch WhatsApp template with PDF delegate badge and rooming details immediately upon registration.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSendPaymentReceipt ?? true}
                        onChange={(e) => handleFieldChange('autoSendPaymentReceipt', e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Payment Receipt &amp; Invoice Confirmation</span>
                        <span className="text-[11px] text-slate-500">Send verified payment transaction ID, GST receipt, and amount breakdown via official WhatsApp business message.</span>
                      </div>
                    </label>
                  </div>
                )}

                {serviceKey === 'youtube' && (
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.embedOnPublicSite ?? true}
                        onChange={(e) => handleFieldChange('embedOnPublicSite', e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Live Broadcast Embed on Homepage</span>
                        <span className="text-[11px] text-slate-500">Display the active conference live stream player on the public portal during retreat dates (26-29 Oct 2026).</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSyncVideos ?? true}
                        onChange={(e) => handleFieldChange('autoSyncVideos', e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Auto-Sync Sermons into Media Library</span>
                        <span className="text-[11px] text-slate-500">Fetch newly uploaded expository sermon recordings and organize into the public audio/video archives.</span>
                      </div>
                    </label>
                  </div>
                )}

                {serviceKey === 'instagram' && (
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.syncToGallery ?? true}
                        onChange={(e) => handleFieldChange('syncToGallery', e.target.checked)}
                        className="mt-0.5 rounded text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Sync Instagram Posts to Event Gallery</span>
                        <span className="text-[11px] text-slate-500">Automatically pull high-resolution photos and reels into the retreat photo gallery stream.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSyncFeed ?? true}
                        onChange={(e) => handleFieldChange('autoSyncFeed', e.target.checked)}
                        className="mt-0.5 rounded text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Display Social Carousel on Public Footer</span>
                        <span className="text-[11px] text-slate-500">Show a dynamic 6-post preview of recent ministry updates on the public website footer.</span>
                      </div>
                    </label>
                  </div>
                )}

                {serviceKey === 'email' && (
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoSyncCrm ?? true}
                        onChange={(e) => handleFieldChange('autoSyncCrm', e.target.checked)}
                        className="mt-0.5 rounded text-navy focus:ring-navy w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Bi-Directional CRM Contact Synchronization</span>
                        <span className="text-[11px] text-slate-500">Match incoming pastor and church inquiries to CRM profiles automatically and update activity history.</span>
                      </div>
                    </label>

                    <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Auto-Sync Frequency</span>
                      <select
                        value={formData.syncFrequency || '15m'}
                        onChange={(e) => handleFieldChange('syncFrequency', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono"
                      >
                        <option value="realtime">Real-time Webhook</option>
                        <option value="15m">Every 15 Minutes</option>
                        <option value="1h">Hourly</option>
                        <option value="daily">Daily Batch</option>
                        <option value="manual">Manual Trigger Only</option>
                      </select>
                    </div>
                  </div>
                )}

                {serviceKey === 'razorpay' && (
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 block">Registered Webhook Events in Razorpay</span>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md border border-sky-200">payment.captured</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200">order.paid</span>
                      <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-md border border-rose-200">payment.failed</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">refund.created</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Our backend automatically signs and verifies every payment event using HMAC-SHA256 before updating registration states.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 font-raleway flex items-center gap-1.5">
                    <Sparkles size={14} className="text-crossgold" /> Quick Setup Instructions
                  </span>
                  <a
                    href={meta.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-navy hover:underline"
                  >
                    <span>{meta.portalLabel}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {serviceKey === 'razorpay' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>Log into your <strong>Razorpay Dashboard</strong> and switch to Test or Live mode.</li>
                    <li>Navigate to <strong>Account &amp; Settings → API Keys</strong> and click <strong>Generate Key</strong>.</li>
                    <li>Copy your <strong>Key ID</strong> and <strong>Key Secret</strong> into the fields above.</li>
                    <li>Go to <strong>Settings → Webhooks</strong>, click <strong>Add New Webhook</strong>, and paste the server webhook URL.</li>
                    <li>Select the events: <code>payment.captured</code>, <code>order.paid</code>, <code>payment.failed</code>.</li>
                  </ol>
                )}

                {serviceKey === 'whatsapp' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>Visit <strong>developers.facebook.com</strong> and create or select your Business App.</li>
                    <li>Add the <strong>WhatsApp</strong> product to your app.</li>
                    <li>Under <strong>API Setup</strong>, locate your <strong>Phone Number ID</strong> and <strong>WABA ID</strong>.</li>
                    <li>Create a <strong>System User</strong> in Meta Business Suite with <em>whatsapp_business_messaging</em> permission to get a permanent token.</li>
                    <li>Configure the webhook callback URL and verify token under WhatsApp → Configuration.</li>
                  </ol>
                )}

                {serviceKey === 'youtube' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>Open <strong>Google Cloud Console</strong> and select or create your ministry project.</li>
                    <li>Navigate to <strong>APIs &amp; Services → Library</strong> and enable <strong>YouTube Data API v3</strong>.</li>
                    <li>Go to <strong>Credentials → Create Credentials → API Key</strong>.</li>
                    <li>Paste the generated API Key and your official Channel ID / Handle into the configuration above.</li>
                  </ol>
                )}

                {serviceKey === 'instagram' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>Convert your retreat/ministry Instagram account to an <strong>Instagram Professional / Business Account</strong>.</li>
                    <li>Link the Instagram account to your Facebook Page in Meta Business Suite.</li>
                    <li>In Meta Developers, add <strong>Instagram Graph API</strong> permissions.</li>
                    <li>Generate a <strong>60-day long-lived User Access Token</strong> and paste it above.</li>
                  </ol>
                )}

                {serviceKey === 'email' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>For Google Workspace OAuth: Create OAuth 2.0 Client credentials in Google Cloud Console.</li>
                    <li>Add <code>https://vachanshivir.in/auth/google/callback</code> as an authorized redirect URI.</li>
                    <li>Or, for standard SMTP relay: Use <code>smtp.gmail.com</code> with an App Password generated from Google Account Security.</li>
                  </ol>
                )}

                {serviceKey === 'sheets' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>Create a Google Service Account in Google Cloud Console.</li>
                    <li>Share your Master Google Spreadsheet with the service account client email with <strong>Editor</strong> permission.</li>
                    <li>Paste the Spreadsheet URL and Sheet name into the fields above.</li>
                  </ol>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Security Best Practice:</strong>
                  <p className="mt-0.5 text-amber-800">
                    Credentials are saved into the secure backend store. Passwords, secrets, and private keys are never exposed in browser storage or client bundles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span>{testResult.success ? 'Connection Test Passed!' : 'Connection Test Failed'}</span>
                  {testResult.latency && <span className="text-[10px] font-mono opacity-70">Latency: {testResult.latency}</span>}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs font-raleway transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Testing Handshake…' : 'Test API Connection'}</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onToggleConnect(serviceKey);
                  setFormData((prev: any) => ({ ...prev, connected: !prev.connected }));
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-raleway transition-colors cursor-pointer ${
                  formData.connected
                    ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                    : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                {formData.connected ? 'Disconnect Service' : 'Connect Service'}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-black text-xs uppercase font-raleway shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {saving && <RefreshCw size={13} className="animate-spin" />}
                <span>{saving ? 'Saving Changes…' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
