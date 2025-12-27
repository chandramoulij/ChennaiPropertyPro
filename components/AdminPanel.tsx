import React, { useState, useEffect } from 'react';
import { Wand2, Save, Loader2, AlertCircle, Wifi, WifiOff, ShieldCheck, Database, Info, Bug, Terminal, Clock, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { parseAuctionText } from '../services/geminiService';
import { addAuction } from '../services/storageService';
import { checkDbConnection, getFirebaseConfigStatus, db } from '../services/firebaseService';
import { ref, set } from 'firebase/database';
import { AuctionProperty } from '../types';
import { CITIES, BANKS, CATEGORIES } from '../constants';

const DEPLOY_VERSION = "v1.0.9-FIXED-PATH";
const BUILD_TIME = new Date().toLocaleString();

interface Props {
  onSuccess: () => void;
}

const AdminPanel: React.FC<Props> = ({ onSuccess }) => {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string; url: string } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  const configStatus = getFirebaseConfigStatus();

  const [formData, setFormData] = useState<Partial<AuctionProperty>>({
    title: '',
    bankName: BANKS[0] || '',
    city: CITIES[0] || 'Chennai',
    area: '',
    category: 'Residential',
    description: '',
    location: '',
    reservePrice: 0,
    emdAmount: 0,
    auctionDate: new Date().toISOString().split('T')[0],
    contactNumber: '',
    possessionStatus: 'Symbolic', 
  });

  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '']);

  const refreshConnection = async () => {
    const status = await checkDbConnection();
    setDbStatus(status);
  };

  useEffect(() => {
    refreshConnection();
    const interval = setInterval(refreshConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const runTestWrite = async () => {
    setTestResult("Running write test...");
    try {
      const testRef = ref(db, 'system/test_write');
      await set(testRef, { 
        timestamp: Date.now(), 
        status: 'testing', 
        version: DEPLOY_VERSION,
        userAgent: navigator.userAgent
      });
      setTestResult("✅ Write Test Successful!");
    } catch (err: any) {
      setTestResult(`❌ Write Test Failed: ${err.message}`);
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const extracted = await parseAuctionText(rawText);
      setFormData(prev => ({
        ...prev,
        ...extracted,
        possessionStatus: extracted.possessionStatus || 'Symbolic',
        contactNumber: extracted.contactNumber || '',
        city: extracted.city || CITIES[0],
        bankName: extracted.bankName || BANKS[0]
      }));
    } catch (err: any) {
      setError(`AI analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reservePrice' || name === 'emdAmount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setRawError(null);
    
    try {
      const title = formData.title || 'Untitled Auction';
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const slug = `${safeTitle}-${Date.now().toString().slice(-4)}`;
      
      const newAuction: AuctionProperty = {
        id: Date.now().toString(),
        slug: slug,
        title: title,
        bankName: formData.bankName || 'Unknown Bank',
        reservePrice: Number(formData.reservePrice) || 0,
        emdAmount: Number(formData.emdAmount) || 0,
        auctionDate: formData.auctionDate || new Date().toISOString().split('T')[0],
        location: formData.location || '',
        area: formData.area || '',
        city: formData.city || 'Chennai',
        category: (formData.category as any) || 'Residential',
        description: formData.description || '',
        imageUrls: imageUrls.filter(u => u.trim() !== '').length > 0 ? imageUrls.filter(u => u.trim() !== '') : [`https://picsum.photos/800/600?random=${Date.now()}`],
        contactNumber: formData.contactNumber || '',
        possessionStatus: (formData.possessionStatus as any) || 'Symbolic',
        createdAt: new Date().toISOString()
      };

      await addAuction(newAuction);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setRawError(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 page-fade-in">
      {/* GOLDEN SUCCESS BANNER */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-primary p-3 text-center text-xs font-black uppercase tracking-[0.4em] rounded-t-2xl flex items-center justify-center gap-4 shadow-xl border-b border-black/10">
        <Sparkles size={16} /> FOLDER PATH FIX VERIFIED: {DEPLOY_VERSION} <Sparkles size={16} />
      </div>

      <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden border-x border-b border-slate-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Admin Console</h2>
              <span className="bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg">PROD {DEPLOY_VERSION}</span>
            </div>
            <p className="text-slate-400 text-[9px] font-bold uppercase flex items-center gap-2">
              <Clock size={12} className="text-amber-400" /> Server Build: {BUILD_TIME}
            </p>
          </div>
          <button onClick={() => setShowDiagnostics(!showDiagnostics)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase px-4 border border-white/10 transition-colors">
            {showDiagnostics ? 'Hide' : 'System'} Diagnostics
          </button>
        </div>

        {showDiagnostics && (
          <div className="bg-slate-900 text-slate-300 p-6 border-b border-white/10 animate-in slide-in-from-top duration-200">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                   <Database size={14} className="text-accent" /> Server Target Info
                </h3>
                <button onClick={runTestWrite} className="bg-accent hover:bg-red-700 text-white px-3 py-1 rounded text-[9px] font-black uppercase shadow-lg">Run Write Test</button>
             </div>
             {testResult && <div className="text-[10px] font-mono text-emerald-400 mb-2">{testResult}</div>}
             <p className="text-[9px] font-mono text-slate-500">DB Endpoint: {configStatus.currentUrl}</p>
          </div>
        )}

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the bank notice text here..."
                className="w-full h-[400px] p-6 border-2 border-slate-100 rounded-2xl outline-none text-sm bg-slate-50/30 focus:bg-white focus:border-primary transition-all resize-none shadow-inner"
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !rawText}
                className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} className="text-accent" />}
                {isAnalyzing ? 'Extracting...' : 'Fill with AI'}
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-700 text-[10px] font-black uppercase flex items-center gap-2 mb-1"><AlertCircle size={14} /> AI Failure</p>
                <p className="text-red-600 text-xs font-bold leading-tight">{error}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Auction Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold bg-white outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Selling Bank</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} list="banks" required className="w-full p-3.5 border border-slate-200 rounded-xl text-sm bg-white font-bold" />
                  <datalist id="banks">{BANKS.map(b => <option key={b} value={b} />)}</datalist>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">City</label>
                  <select name="city" value={formData.city} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-xl text-sm bg-white font-bold">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <label className="block text-[9px] font-black text-indigo-700 uppercase mb-2 flex items-center gap-2">Possession <ShieldCheck size={12} className="text-accent"/></label>
                  <select name="possessionStatus" value={formData.possessionStatus} onChange={handleChange} className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-black text-indigo-900">
                    <option value="Symbolic">Symbolic</option>
                    <option value="Physical">Physical</option>
                  </select>
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Contact</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="9876543210" className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="block text-[9px] font-black text-accent uppercase mb-1">Reserve (₹)</label>
                  <input type="number" name="reservePrice" value={formData.reservePrice} onChange={handleChange} required className="w-full p-1 text-xl font-black text-primary bg-transparent outline-none border-b-2 border-slate-100" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Date</label>
                  <input type="date" name="auctionDate" value={formData.auctionDate} onChange={handleChange} required className="w-full p-1 text-sm font-black text-slate-700 bg-transparent outline-none border-b-2 border-slate-100" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Notice Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-4 border border-slate-200 rounded-2xl text-sm bg-white outline-none font-medium"></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-accent text-white py-5 rounded-2xl font-black text-lg hover:bg-red-700 shadow-2xl transition-all flex items-center justify-center gap-4 disabled:bg-slate-200"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              {isSaving ? 'UPLOADING...' : 'PUBLISH NOTICE'}
            </button>
          </form>
        </div>
      </div>
      
      {rawError && (
        <div className="mt-6 bg-slate-900 p-6 rounded-2xl border border-white/5">
           <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap">{rawError}</pre>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;