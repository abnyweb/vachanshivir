import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { FolderArchive, Plus, ExternalLink, Search, Filter, Eye } from 'lucide-react';
import type { HistoricalResource, ResourceCategory, ResourceVisibility } from '../../types';

export default function Resources() {
  const { db, create } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('BROCHURE');
  const [year, setYear] = useState('2026');
  const [fileUrl, setFileUrl] = useState('');
  const [visibility, setVisibility] = useState<ResourceVisibility>('PUBLIC');

  const resources = db.historicalResources || [];

  const filtered = resources.filter((r) => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (selectedYear !== 'ALL' && r.eventYear !== Number(selectedYear)) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const yr = Number(year);
    const newRes: HistoricalResource = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId: `evt-vachanshivir-${yr}`,
      eventYear: yr,
      title,
      description,
      category,
      fileType: fileUrl.split('.').pop() || 'pdf',
      fileUrl: fileUrl || 'https://vachanshivir.org/documents/sample-resource.pdf',
      thumbnailUrl: null,
      fileSize: '2.5 MB',
      visibility,
      displayOrder: resources.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    create('historicalResources', newRes);
    setIsUploadOpen(false);
    setTitle('');
    setDescription('');
    setFileUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900 flex items-center gap-2">
            <FolderArchive className="text-[#153A66]" size={26} />
            Resource &amp; Historical Asset Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Manage public brochures, agendas, speaker profiles, reports, and internal admin assets across conference years.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs shadow-xs rounded-xl">
          <Plus size={16} /> Upload New Resource
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search resources by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-slate-400" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="ALL">All Categories</option>
              <option value="BROCHURE">Brochure</option>
              <option value="PROGRAMME">Programme / Agenda</option>
              <option value="SPEAKER_RESOURCE">Speaker Resource</option>
              <option value="SPONSOR_RESOURCE">Sponsor Resource</option>
              <option value="REPORT">Report</option>
              <option value="GALLERY">Gallery / Media</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow rounded-2xl border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-navy-50 text-navy border border-navy/15 uppercase">
                  {r.category}
                </span>
                <span className="text-xs text-navy-950 font-black px-2 py-0.5 rounded-lg bg-crossgold/20 border border-crossgold/30">
                  Vachan Shivir {r.eventYear}
                </span>
              </div>
              <CardTitle className="text-base font-raleway font-bold text-slate-900 mt-2">{r.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-sans">
              <p className="text-xs text-slate-500 line-clamp-2">{r.description || 'No description available.'}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Eye size={12} /> {r.visibility}
                </span>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-navy font-bold hover:underline"
                >
                  Download / View <ExternalLink size={12} />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Conference Resource">
        <form onSubmit={handleUpload} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-ink">Resource Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vachan Shivir 2026 Session Handbook"
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-ink">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the document or resource..."
              className="mt-1 w-full rounded border border-ink/20 p-2"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="mt-1 w-full rounded border border-ink/20 p-2"
              >
                <option value="BROCHURE">Brochure</option>
                <option value="PROGRAMME">Programme</option>
                <option value="AGENDA">Agenda</option>
                <option value="SPEAKER_RESOURCE">Speaker Resource</option>
                <option value="SPONSOR_RESOURCE">Sponsor Resource</option>
                <option value="REPORT">Report</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-ink">Event Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 w-full rounded border border-ink/20 p-2"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-ink">File URL</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://vachanshivir.org/documents/file.pdf"
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-ink">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ResourceVisibility)}
              className="mt-1 w-full rounded border border-ink/20 p-2"
            >
              <option value="PUBLIC">Public (Visible on website)</option>
              <option value="ADMIN_ONLY">Admin Only</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Upload Asset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
