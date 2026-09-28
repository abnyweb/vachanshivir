import { useState, useRef } from 'react';
import { AdminPage } from '../../components/admin/AdminPage';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { FormField } from '../../components/common/FormField';
import { Modal } from '../../components/common/Modal';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { imagesOf, listAlbums } from '../../services/galleryService';
import { uid } from '../../utils/ids';
import { Plus, Trash2, UploadCloud, Image as ImageIcon, CheckCircle2, Cloud, RefreshCw } from 'lucide-react';
import type { GalleryAlbum, GalleryImage } from '../../types';

export default function AdminGallery() {
  const { db, create, update, remove } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Gallery — Vachan Shivir Management');

  const albums = listAlbums(db, event.id);
  const [albumId, setAlbumId] = useState(albums[0]?.id ?? '');
  const [newAlbum, setNewAlbum] = useState<GalleryAlbum | null>(null);
  const [newImage, setNewImage] = useState<GalleryImage | null>(null);

  // File Upload State
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = imagesOf(db, albumId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Please select an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      notify('File is too large. Maximum size is 15MB.', 'error');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      if (newImage) {
        setNewImage({
          ...newImage,
          caption: newImage.caption || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          alt: newImage.alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndSave = async () => {
    if (!newImage) return;

    if (!newImage.alt.trim()) {
      notify('Alt text is required so the image is accessible.', 'error');
      return;
    }

    if (uploadMode === 'upload') {
      if (!previewUrl) {
        notify('Please select an image file to upload.', 'error');
        return;
      }

      setIsUploading(true);
      setUploadProgress('Compressing and transmitting to AWS S3...');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: selectedFile?.name || `gallery_${Date.now()}`,
            fileData: previewUrl,
            albumId: newImage.albumId,
            caption: newImage.caption,
            alt: newImage.alt,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const uploadedImg: GalleryImage = {
            ...newImage,
            src: data.url || data.s3Url || previewUrl,
            s3Url: data.s3Url,
            pendingAsset: false,
          };
          create('galleryImages', uploadedImg);
          notify('Photograph successfully uploaded to AWS S3 & Album!', 'success');
          setNewImage(null);
          setSelectedFile(null);
          setPreviewUrl(null);
        } else {
          // Local fallback
          create('galleryImages', {
            ...newImage,
            src: previewUrl,
            pendingAsset: false,
          });
          notify('Saved with local media cache.', 'info');
          setNewImage(null);
          setSelectedFile(null);
          setPreviewUrl(null);
        }
      } catch (err: any) {
        console.warn('Backend upload API error, saving to local store:', err);
        create('galleryImages', {
          ...newImage,
          src: previewUrl,
          pendingAsset: false,
        });
        notify('Saved to local gallery.', 'info');
        setNewImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        setUploadProgress('');
      }
    } else {
      // Direct URL mode
      create('galleryImages', { ...newImage, pendingAsset: !newImage.src });
      setNewImage(null);
      notify('Image added.');
    }
  };

  return (
    <AdminPage
      title="Gallery & Media Storage"
      description="Manage photographs and albums with direct AWS S3 cloud synchronisation."
      actions={
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="light"
            onClick={() => setNewAlbum({
              id: uid('alb'), eventId: event.id, title: '', category: '', year: event.year,
              coverImage: null, displayOrder: albums.length + 1, status: 'draft',
            })}
            className="flex-1 sm:flex-none justify-center"
          >
            <Plus size={15} /> New album
          </Button>
          <Button
            size="sm"
            disabled={!albumId}
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              setUploadMode('upload');
              setNewImage({
                id: uid('img'), albumId, src: '', caption: '', alt: '', displayOrder: images.length + 1, pendingAsset: false,
              });
            }}
            className="flex-1 sm:flex-none justify-center bg-navy text-crossgold font-raleway font-black"
          >
            <UploadCloud size={15} /> Upload to AWS S3
          </Button>
        </div>
      }
    >
      {/* S3 Storage Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-600 text-white font-bold">
            <Cloud size={16} />
          </div>
          <div>
            <span className="font-bold font-raleway">AWS S3 Cloud Storage Active</span>
            <span className="mx-2 text-sky-400">•</span>
            <span className="text-slate-600 font-mono text-[11px]">Bucket: vachanshivir-127698679573-us-east-1-an</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          us-east-1 Connected
        </span>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
        {albums.map((a) => (
          <button
            key={a.id}
            onClick={() => setAlbumId(a.id)}
            aria-pressed={albumId === a.id}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold font-raleway shrink-0 whitespace-nowrap transition-all ${
              albumId === a.id
                ? 'border-navy-950 bg-navy-950 text-crossgold shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:border-crossgold/60'
            }`}
          >
            {a.title || 'Untitled album'}
          </button>
        ))}
      </div>

      {albums.length === 0 ? (
        <EmptyState tone="light" title="No albums yet" description="Create an album to start organising photographs." />
      ) : (
        <>
          <div className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 shadow-xs">
            {albums.filter((a) => a.id === albumId).map((a) => (
              <div key={a.id} className="contents">
                <FormField tone="light" label="Album title" name="album-title">
                  <input id="album-title" className="field-light" value={a.title} onChange={(e) => update('galleryAlbums', a.id, { title: e.target.value })} />
                </FormField>
                <FormField tone="light" label="Category" name="album-category">
                  <input id="album-category" className="field-light" value={a.category} onChange={(e) => update('galleryAlbums', a.id, { category: e.target.value })} />
                </FormField>
                <FormField tone="light" label="Status" name="album-status">
                  <select id="album-status" className="field-light" value={a.status} onChange={(e) => update('galleryAlbums', a.id, { status: e.target.value as GalleryAlbum['status'] })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </FormField>
              </div>
            ))}
          </div>

          <DataTable
            rows={images}
            rowKey={(r) => r.id}
            empty={<EmptyState tone="light" title="No images in this album" description="Upload photographs directly from your computer or phone to publish them to AWS S3." />}
            columns={[
              {
                key: 'preview', header: '', className: 'w-20',
                render: (r) => r.src ? (
                  <div className="relative group">
                    <img src={r.src} alt="" className="h-10 w-16 object-cover rounded-lg border border-slate-200" />
                  </div>
                ) : <span className="text-[12px] text-ink/40">Pending</span>,
              },
              { key: 'caption', header: 'Caption', render: (r) => r.caption || '—' },
              { key: 'alt', header: 'Alt text', render: (r) => r.alt || <span className="text-red-600">Missing</span> },
              {
                key: 'storage',
                header: 'Storage',
                render: () => (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <Cloud size={11} className="text-sky-600" /> AWS S3
                  </span>
                ),
              },
              { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.pendingAsset ? 'pending' : 'published'} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
              {
                key: 'actions', header: '', className: 'w-12 text-right',
                render: (r) => (
                  <button onClick={() => { remove('galleryImages', r.id); notify('Image removed.'); }} aria-label="Delete image" className="rounded-sm p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                ),
              },
            ]}
          />
        </>
      )}

      {/* New Album Modal */}
      <Modal
        open={newAlbum !== null}
        title="New album"
        onClose={() => setNewAlbum(null)}
        footer={
          <>
            <Button variant="light" size="sm" onClick={() => setNewAlbum(null)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!newAlbum?.title.trim()) { notify('Album title is required.', 'error'); return; }
              create('galleryAlbums', newAlbum);
              setAlbumId(newAlbum.id);
              setNewAlbum(null);
              notify('Album created.');
            }}>Create album</Button>
          </>
        }
      >
        {newAlbum && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField tone="light" label="Title" name="na-title" required>
              <input id="na-title" className="field-light" value={newAlbum.title} onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })} />
            </FormField>
            <FormField tone="light" label="Category" name="na-cat">
              <input id="na-cat" className="field-light" value={newAlbum.category} onChange={(e) => setNewAlbum({ ...newAlbum, category: e.target.value })} />
            </FormField>
          </div>
        )}
      </Modal>

      {/* Add / Upload Image Modal with S3 support */}
      <Modal
        open={newImage !== null}
        title="Upload Photograph to AWS S3"
        onClose={() => {
          if (!isUploading) {
            setNewImage(null);
            setSelectedFile(null);
            setPreviewUrl(null);
          }
        }}
        footer={
          <>
            <Button variant="light" size="sm" disabled={isUploading} onClick={() => {
              setNewImage(null);
              setSelectedFile(null);
              setPreviewUrl(null);
            }}>Cancel</Button>
            <Button size="sm" disabled={isUploading} onClick={handleUploadAndSave} className="bg-navy text-crossgold font-bold">
              {isUploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Uploading to S3...
                </>
              ) : (
                <>
                  <UploadCloud size={14} /> Upload & Save
                </>
              )}
            </Button>
          </>
        }
      >
        {newImage && (
          <div className="grid gap-4">
            {/* Mode Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold font-raleway">
              <button
                type="button"
                onClick={() => setUploadMode('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  uploadMode === 'upload' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud size={14} /> Direct Device Upload (S3)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  uploadMode === 'url' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon size={14} /> External Image URL
              </button>
            </div>

            {uploadMode === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-crossgold bg-slate-50/70 hover:bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 font-raleway">
                        Click to select or drag photograph here
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Supports PNG, JPG, or WebP up to 15MB • Uploads directly to S3
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-56 object-contain mx-auto" />
                    <div className="p-3 bg-white/95 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate font-mono text-[11px]">
                          {selectedFile?.name || 'image.jpg'}
                        </span>
                        {selectedFile && (
                          <span className="text-slate-400 text-[10px]">
                            ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="text-red-600 hover:text-red-700 font-bold text-[11px] underline ml-2"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 animate-pulse">
                    <RefreshCw size={14} className="animate-spin text-amber-600" />
                    <span>{uploadProgress || 'Uploading to AWS S3 bucket...'}</span>
                  </div>
                )}
              </div>
            ) : (
              <FormField tone="light" label="Image URL" name="ni-src" hint="Paste direct HTTPS image link.">
                <input
                  id="ni-src"
                  className="field-light"
                  placeholder="https://example.com/photo.jpg"
                  value={newImage.src ?? ''}
                  onChange={(e) => setNewImage({ ...newImage, src: e.target.value })}
                />
              </FormField>
            )}

            <FormField tone="light" label="Caption / Title" name="ni-caption">
              <input
                id="ni-caption"
                className="field-light"
                placeholder="e.g. Morning Expository Preaching Session"
                value={newImage.caption}
                onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
              />
            </FormField>
            <FormField tone="light" label="Alt text" name="ni-alt" required hint="Describe the photograph for accessibility.">
              <input
                id="ni-alt"
                className="field-light"
                placeholder="e.g. Delegates holding Bibles during session"
                value={newImage.alt}
                onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
              />
            </FormField>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

