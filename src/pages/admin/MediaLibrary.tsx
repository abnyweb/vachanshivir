import { useState, useMemo } from 'react';
import {
  FileImage, Upload, Copy, Check, Eye, Trash2, ShieldCheck, FileText,
  Image as ImageIcon, Award, Handshake, Building2, ExternalLink, Plus, Star
} from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { StatCard } from '../../components/admin/StatCard';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../components/common/ToastProvider';
import type { MediaAsset, MediaAssetCategory } from '../../types';

export default function MediaLibrary() {
  const { db, create, remove, update } = useStore();
  const event = useCurrentEvent();
  const { notify } = useToast();
  useDocumentMeta('Media & Library — Vachan Shivir Management');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form Draft
  const [draft, setDraft] = useState<Partial<MediaAsset>>({
    title: '',
    fileName: '',
    url: '',
    category: 'GRAPHIC',
    fileType: 'image/png',
    fileSize: '500 KB',
    description: '',
    associatedEntityName: '',
  });

  const mediaAssets: MediaAsset[] = db.mediaAssets || [];

  // Categorized counts
  const logoAssets = mediaAssets.filter((a) => a.category === 'SITE_LOGO' || a.category === 'SPONSOR_LOGO' || a.category === 'PARTNER_LOGO');
  const graphicAssets = mediaAssets.filter((a) => a.category === 'GRAPHIC');
  const docAssets = mediaAssets.filter((a) => a.category === 'DOCUMENT');

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    let result = mediaAssets;
    if (selectedCategory === 'LOGOS') {
      result = result.filter((a) => a.category === 'SITE_LOGO' || a.category === 'SPONSOR_LOGO' || a.category === 'PARTNER_LOGO');
    } else if (selectedCategory === 'SITE_LOGO') {
      result = result.filter((a) => a.category === 'SITE_LOGO');
    } else if (selectedCategory === 'SPONSORS_PARTNERS') {
      result = result.filter((a) => a.category === 'SPONSOR_LOGO' || a.category === 'PARTNER_LOGO');
    } else if (selectedCategory === 'GRAPHIC') {
      result = result.filter((a) => a.category === 'GRAPHIC');
    } else if (selectedCategory === 'DOCUMENT') {
      result = result.filter((a) => a.category === 'DOCUMENT');
    } else if (selectedCategory === 'PHOTO') {
      result = result.filter((a) => a.category === 'PHOTO');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.fileName.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.associatedEntityName || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [mediaAssets, selectedCategory, searchQuery]);

  function handleCopyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    notify('Asset URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSetPrimaryLogo(asset: MediaAsset) {
    // Unset current primary
    mediaAssets.forEach((a) => {
      if (a.isPrimarySiteLogo) {
        update('mediaAssets', a.id, { isPrimarySiteLogo: false });
      }
    });
    update('mediaAssets', asset.id, { isPrimarySiteLogo: true, category: 'SITE_LOGO' });
    notify(`Set "${asset.title}" as Primary Site Logo!`);
  }

  function handleDeleteAsset(id: string, title: string) {
    if (window.confirm(`Are you sure you want to delete "${title}" from Media Library?`)) {
      remove('mediaAssets', id);
      notify('Asset removed from Media Library.');
    }
  }

  function handleSaveUpload() {
    if (!draft.title || !draft.url) {
      notify('Title and Asset URL/File are required', 'error');
      return;
    }

    const newAsset: MediaAsset = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      title: draft.title.trim(),
      fileName: draft.fileName || `${draft.title.toLowerCase().replace(/\s+/g, '-')}.${draft.fileType?.includes('pdf') ? 'pdf' : 'png'}`,
      url: draft.url.trim(),
      category: (draft.category as MediaAssetCategory) || 'GRAPHIC',
      fileType: draft.fileType || 'image/png',
      fileSize: draft.fileSize || '350 KB',
      description: draft.description || '',
      associatedEntityName: draft.associatedEntityName || '',
      isPrimarySiteLogo: draft.category === 'SITE_LOGO' && logoAssets.length === 0,
      createdAt: new Date().toISOString(),
    };

    create('mediaAssets', newAsset);
    notify('New media asset uploaded and added to library!');
    setIsUploadOpen(false);
    setDraft({
      title: '',
      fileName: '',
      url: '',
      category: 'GRAPHIC',
      fileType: 'image/png',
      fileSize: '500 KB',
      description: '',
      associatedEntityName: '',
    });
  }

  return (
    <AdminPage
      title="Media & Library Assets"
      description="Central repository for site logos, graphics, sponsor & partner branding, PDFs, and event media."
      actions={
        <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)} className="!rounded-lg shadow-sm">
          <Plus size={15} /> Upload Media Asset
        </Button>
      }
    >
      {/* Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Media Assets" value={mediaAssets.length} color="indigo" hint="All graphics, PDFs & logos" icon={FileImage} />
        <StatCard label="Brand & Site Logos" value={logoAssets.length} color="amber" hint="Site emblem, partner & sponsor logos" icon={Award} />
        <StatCard label="Graphics & Banners" value={graphicAssets.length} color="violet" hint="Web banners & stage posters" icon={ImageIcon} />
        <StatCard label="PDFs & Documents" value={docAssets.length} color="emerald" hint="Brochures & exposition papers" icon={FileText} />
      </div>

      {/* Featured Primary Site Logo Spotlight Banner */}
      {logoAssets.find((a) => a.isPrimarySiteLogo) && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-5 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-white p-2 border border-slate-200 shadow-sm">
                <img
                  src={logoAssets.find((a) => a.isPrimarySiteLogo)?.url}
                  alt="Primary Site Logo"
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> Active Primary Site Logo
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-sans">
                  {logoAssets.find((a) => a.isPrimarySiteLogo)?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {logoAssets.find((a) => a.isPrimarySiteLogo)?.fileName} • {logoAssets.find((a) => a.isPrimarySiteLogo)?.fileSize}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopyUrl(logoAssets.find((a) => a.isPrimarySiteLogo)!.url, 'primary_logo')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Copy size={13} /> Copy Logo URL
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Assets', icon: FileImage },
              { id: 'LOGOS', label: 'All Logos', icon: Award },
              { id: 'SITE_LOGO', label: 'Site Logos', icon: ShieldCheck },
              { id: 'SPONSORS_PARTNERS', label: 'Partners & Sponsors Logos', icon: Handshake },
              { id: 'GRAPHIC', label: 'Graphics & Banners', icon: ImageIcon },
              { id: 'DOCUMENT', label: 'PDFs & Docs', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-full sm:w-64">
            <SearchInput
              tone="light"
              value={searchQuery}
              onChange={setSearchQuery}
              label="Search media assets"
              placeholder="Search assets, logos, sponsor..."
            />
          </div>
        </div>
      </div>

      {/* Media Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <FileImage size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No assets match your selected filter or search query. Upload graphics, logos, or documents to get started.
          </p>
          <Button size="sm" onClick={() => setIsUploadOpen(true)} className="mt-4">
            <Plus size={15} /> Upload First Asset
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const isPdf = asset.fileType?.includes('pdf') || asset.category === 'DOCUMENT';
            const isLogo = asset.category.includes('LOGO');

            return (
              <div
                key={asset.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-card transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover"
              >
                {/* Media Preview Thumbnail Box */}
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center group-hover:opacity-95 transition-opacity">
                    {isPdf ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <FileText size={36} className="text-emerald-600" />
                        <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">PDF Document</span>
                      </div>
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop';
                        }}
                      />
                    )}

                    {/* Category Overlay Tag */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {asset.category.replace(/_/g, ' ')}
                      </span>
                      {asset.isPrimarySiteLogo && (
                        <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <Star size={10} className="fill-white" /> Primary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Header */}
                  <div className="mt-3 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate font-sans" title={asset.title}>
                      {asset.title}
                    </h4>
                    {asset.associatedEntityName && (
                      <p className="text-xs font-semibold text-maroon flex items-center gap-1">
                        <Building2 size={12} /> {asset.associatedEntityName}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate font-mono">{asset.fileName}</p>
                    {asset.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">{asset.description}</p>
                    )}
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">{asset.fileSize || 'Standard'}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      title="Preview Media Asset"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(asset.url, asset.id)}
                      title="Copy Public Asset URL"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      {copiedId === asset.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === asset.id ? 'Copied' : 'Copy URL'}</span>
                    </button>
                    {isLogo && !asset.isPrimarySiteLogo && (
                      <button
                        onClick={() => handleSetPrimaryLogo(asset)}
                        title="Set as Primary Site Logo"
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Star size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAsset(asset.id, asset.title)}
                      title="Delete Asset"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Asset Modal */}
      {previewAsset && (
        <Modal open={true} title={previewAsset.title} onClose={() => setPreviewAsset(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              {previewAsset.fileType?.includes('pdf') ? (
                <div className="py-8 text-center space-y-3">
                  <FileText size={48} className="mx-auto text-emerald-600" />
                  <p className="text-sm font-bold text-slate-800">{previewAsset.fileName}</p>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                  >
                    Open PDF in New Window <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <img src={previewAsset.url} alt={previewAsset.title} className="max-h-80 max-w-full mx-auto object-contain rounded-lg shadow-sm" />
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Category:</span>
                <span className="font-bold text-slate-900">{previewAsset.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">File Name:</span>
                <span className="font-mono text-slate-800">{previewAsset.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Direct URL:</span>
                <span className="font-mono text-slate-800 truncate max-w-xs">{previewAsset.url}</span>
              </div>
              {previewAsset.associatedEntityName && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Associated Sponsor/Partner:</span>
                  <span className="font-bold text-maroon">{previewAsset.associatedEntityName}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="light" onClick={() => handleCopyUrl(previewAsset.url, previewAsset.id)}>
                <Copy size={14} /> Copy URL
              </Button>
              <Button size="sm" onClick={() => setPreviewAsset(null)}>Close Preview</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Asset Modal */}
      <Modal
        open={isUploadOpen}
        title="Upload Media & Branding Asset"
        onClose={() => setIsUploadOpen(false)}
        footer={
          <>
            <Button variant="light" size="sm" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveUpload}><Upload size={14} /> Upload & Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField tone="light" label="Asset Title" name="title" required hint="e.g. Vachan Shivir 2026 Header Logo, Sponsor Logo, Brochure PDF">
            <input
              type="text"
              className="field-light"
              value={draft.title || ''}
              placeholder="e.g. Grace Fellowship Sponsor Logo"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField tone="light" label="Asset Category" name="category" required>
              <select
                className="field-light"
                value={draft.category || 'GRAPHIC'}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as MediaAssetCategory })}
              >
                <option value="SITE_LOGO">Site & Brand Logo</option>
                <option value="SPONSOR_LOGO">Sponsor Logo</option>
                <option value="PARTNER_LOGO">Partner Logo</option>
                <option value="GRAPHIC">Graphic & Banner</option>
                <option value="DOCUMENT">PDF & Document</option>
                <option value="PHOTO">Event Photo</option>
              </select>
            </FormField>

            <FormField tone="light" label="File Format" name="fileType">
              <select
                className="field-light"
                value={draft.fileType || 'image/png'}
                onChange={(e) => setDraft({ ...draft, fileType: e.target.value })}
              >
                <option value="image/png">PNG Image (.png)</option>
                <option value="image/svg+xml">SVG Vector (.svg)</option>
                <option value="image/jpeg">JPEG Image (.jpg)</option>
                <option value="application/pdf">PDF Document (.pdf)</option>
              </select>
            </FormField>
          </div>

          <FormField tone="light" label="Media Asset URL or File Link" name="url" required hint="Enter public image URL or document link">
            <input
              type="text"
              className="field-light"
              value={draft.url || ''}
              placeholder="https://images.unsplash.com/... or https://vachanshivir.org/..."
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
          </FormField>

          {(draft.category === 'SPONSOR_LOGO' || draft.category === 'PARTNER_LOGO') && (
            <FormField tone="light" label="Associated Sponsor / Partner Name" name="associatedEntityName" hint="Link this logo to a sponsor or partner entity">
              <input
                type="text"
                className="field-light"
                value={draft.associatedEntityName || ''}
                placeholder="e.g. Grace Fellowship Church or Evangelical Fellowship of India"
                onChange={(e) => setDraft({ ...draft, associatedEntityName: e.target.value })}
              />
            </FormField>
          )}

          <FormField tone="light" label="Description / Usage Notes" name="description">
            <textarea
              rows={2}
              className="field-light"
              value={draft.description || ''}
              placeholder="Notes on usage, resolution, or dimensions..."
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </AdminPage>
  );
}
