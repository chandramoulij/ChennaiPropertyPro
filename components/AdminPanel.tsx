
import React, { useState } from 'react';
import { Save, Loader2, AlertCircle, Wand2, FileText, Image as ImageIcon, Building2, Gavel, Upload, CheckCircle2 } from 'lucide-react';
import { parseAuctionText } from '../services/geminiService';
import { addAuction, addProject, uploadFile, formatImageUrl } from '../services/storageService';
import { AuctionProperty, RealEstateProject } from '../types';
import { BANKS, CATEGORIES, DEFAULT_PROPERTY_IMAGE } from '../constants';

interface Props {
  onSuccess: () => void;
}

const AdminPanel: React.FC<Props> = ({ onSuccess }) => {
  const [postType, setPostType] = useState<'auction' | 'project'>('auction');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');

  // Auction State
  const [auctionData, setAuctionData] = useState<Partial<AuctionProperty>>({
    title: '', bankName: BANKS[0], city: 'Chennai', area: '', 
    category: 'Residential', description: '', reservePrice: 0, 
    emdAmount: 0, auctionDate: '', documentUrl: '', 
    imageUrls: [''], possessionStatus: 'Symbolic'
  });

  // Project State (Blog Style)
  const [projectData, setProjectData] = useState<Partial<RealEstateProject>>({
    title: '', type: 'Flat', developer: '', city: 'Chennai', 
    area: '', location: '', priceRange: '', description: '', 
    content: '', documentUrl: '', imageUrls: ['']
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max size 10MB.");
      return;
    }

    const key = field === 'image' ? 'img_upload' : 'doc_upload';
    setUploadingFiles(prev => ({ ...prev, [key]: true }));
    setError(null);

    try {
      const folder = postType === 'auction' ? 'auctions' : 'projects';
      const url = await uploadFile(file, folder);
      
      if (postType === 'auction') {
        if (field === 'image') setAuctionData(prev => ({ ...prev, imageUrls: [url] }));
        else setAuctionData(prev => ({ ...prev, documentUrl: url }));
      } else {
        if (field === 'image') setProjectData(prev => ({ ...prev, imageUrls: [url] }));
        else setProjectData(prev => ({ ...prev, documentUrl: url }));
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      setError(`File upload failed: ${err.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAuctionAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const extracted = await parseAuctionText(rawText);
      setAuctionData(prev => ({ ...prev, ...extracted }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (postType === 'auction') {
        const auction: AuctionProperty = {
          ...auctionData,
          id: Date.now().toString(),
          slug: (auctionData.title || 'auction').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
          createdAt: new Date().toISOString(),
          // Format URLs on submission too just to be certain
          imageUrls: (auctionData.imageUrls?.filter(u => !!u) || []).map(formatImageUrl),
        } as AuctionProperty;
        await addAuction(auction);
      } else {
        const project: RealEstateProject = {
          ...projectData,
          id: Date.now().toString(),
          slug: (projectData.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
          createdAt: new Date().toISOString(),
          imageUrls: (projectData.imageUrls?.filter(u => !!u) || []).map(formatImageUrl),
        } as RealEstateProject;
        await addProject(project);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-primary p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Listing Studio</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage all public notices & projects</p>
          </div>
          <div className="flex bg-white/10 p-1.5 rounded-2xl">
            <button onClick={() => setPostType('auction')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${postType === 'auction' ? 'bg-accent text-white shadow-xl' : 'hover:bg-white/5'}`}>
              <Gavel size={16}/> Bank Auction
            </button>
            <button onClick={() => setPostType('project')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${postType === 'project' ? 'bg-accent text-white shadow-xl' : 'hover:bg-white/5'}`}>
              <Building2 size={16}/> New Project
            </button>
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-12 gap-12">
          {postType === 'auction' && (
            <div className="md:col-span-4 space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">AI Extraction Tool</label>
                <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste auction text here..." className="w-full h-72 p-4 text-xs font-medium border border-slate-200 rounded-2xl mb-4 resize-none outline-none focus:border-accent" />
                <button onClick={handleAuctionAnalyze} disabled={isAnalyzing || !rawText} className="w-full bg-primary text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50">
                  {isAnalyzing ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16} className="text-accent" />}
                  Generate Form Data
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`${postType === 'auction' ? 'md:col-span-8' : 'md:col-span-12'} space-y-8`}>
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Property Title</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-accent" value={postType === 'auction' ? auctionData.title : projectData.title} onChange={(e) => postType === 'auction' ? setAuctionData({...auctionData, title: e.target.value}) : setProjectData({...projectData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{postType === 'auction' ? 'Selling Bank' : 'Developer Name'}</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-accent" value={postType === 'auction' ? auctionData.bankName : projectData.developer} onChange={(e) => postType === 'auction' ? setAuctionData({...auctionData, bankName: e.target.value}) : setProjectData({...projectData, developer: e.target.value})} />
              </div>
            </div>

            {postType === 'project' ? (
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={projectData.type} onChange={e => setProjectData({...projectData, type: e.target.value as any})}>
                      <option value="Flat">Residential Flat</option>
                      <option value="Plot">Plot / Layout</option>
                      <option value="House">Individual House</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Area</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={projectData.area} onChange={e => setProjectData({...projectData, area: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Price Range</label>
                    <input placeholder="e.g. 35L - 75L" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={projectData.priceRange} onChange={e => setProjectData({...projectData, priceRange: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FileText size={14} className="text-accent"/> Detailed Blog / Project Info (3000 words max)</label>
                  <textarea rows={12} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm leading-relaxed outline-none focus:border-accent" placeholder="Write comprehensive details for SEO..." value={projectData.content} onChange={e => setProjectData({...projectData, content: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reserve Price (₹)</label>
                      <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={auctionData.reservePrice} onChange={e => setAuctionData({...auctionData, reservePrice: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auction Date</label>
                      <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={auctionData.auctionDate} onChange={e => setAuctionData({...auctionData, auctionDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Locality</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={auctionData.area} onChange={e => setAuctionData({...auctionData, area: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
                      <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={auctionData.category} onChange={e => setAuctionData({...auctionData, category: e.target.value as any})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Possession Status</label>
                      <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={auctionData.possessionStatus} onChange={e => setAuctionData({...auctionData, possessionStatus: e.target.value as any})}>
                        <option value="Physical">Physical Possession</option>
                        <option value="Symbolic">Symbolic Possession</option>
                      </select>
                   </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Notice Summary</label>
                    <textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm" value={auctionData.description} onChange={e => setAuctionData({...auctionData, description: e.target.value})} />
                 </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 p-8 bg-slate-900 rounded-[2rem]">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Physical Property Image</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:bg-white/10 transition-all">
                    {uploadingFiles['img_upload'] ? (
                      <Loader2 className="animate-spin text-accent" />
                    ) : (postType === 'auction' ? auctionData.imageUrls?.[0] : projectData.imageUrls?.[0]) ? (
                      <CheckCircle2 className="text-emerald-500" />
                    ) : (
                      <Upload className="text-slate-500" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                      {uploadingFiles['img_upload'] ? 'Uploading...' : 'Choose Property Image'}
                    </span>
                  </label>
                </div>
                <input className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-mono outline-none" placeholder="Or paste image URL here..." value={postType === 'auction' ? (auctionData.imageUrls?.[0] === DEFAULT_PROPERTY_IMAGE ? '' : auctionData.imageUrls?.[0]) : (projectData.imageUrls?.[0] === DEFAULT_PROPERTY_IMAGE ? '' : projectData.imageUrls?.[0])} onChange={e => {
                  const val = formatImageUrl(e.target.value);
                  postType === 'auction' ? setAuctionData({...auctionData, imageUrls: [val || DEFAULT_PROPERTY_IMAGE]}) : setProjectData({...projectData, imageUrls: [val || DEFAULT_PROPERTY_IMAGE]});
                }} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><FileText size={14}/> Notice / Brochure PDF</label>
                <div className="relative group">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document')} className="hidden" id="doc-upload" />
                  <label htmlFor="doc-upload" className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:bg-white/10 transition-all">
                    {uploadingFiles['doc_upload'] ? (
                      <Loader2 className="animate-spin text-accent" />
                    ) : (postType === 'auction' ? auctionData.documentUrl : projectData.documentUrl) ? (
                      <CheckCircle2 className="text-emerald-500" />
                    ) : (
                      <Upload className="text-slate-500" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                      {uploadingFiles['doc_upload'] ? 'Uploading...' : 'Choose PDF Document'}
                    </span>
                  </label>
                </div>
                <input className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-mono outline-none" placeholder="Or paste document URL here..." value={postType === 'auction' ? auctionData.documentUrl : projectData.documentUrl} onChange={e => postType === 'auction' ? setAuctionData({...auctionData, documentUrl: e.target.value}) : setProjectData({...projectData, documentUrl: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={isSaving || Object.values(uploadingFiles).some(v => v)} className="w-full bg-accent text-white py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              {isSaving ? 'Uploading to Database...' : 'Publish to Website'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
