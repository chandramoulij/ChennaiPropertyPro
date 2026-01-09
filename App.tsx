
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuctionCard from './components/AuctionCard';
import AdSpace from './components/AdSpace';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { getAuctions, getAuctionBySlug, searchAuctions, getProjects, getProjectBySlug, formatImageUrl } from './services/storageService';
import { AuctionProperty, RealEstateProject, PageView, SearchFilters } from './types';
import { 
  Search, MapPin, ChevronRight, Gavel, 
  Building2, Mail, Home, Loader2, IndianRupee, 
  Calendar as CalendarIcon, Download, Landmark, Info, FileText, HelpCircle, CheckCircle2,
  MessageCircle, Share2
} from 'lucide-react';
import { BANKS, DEFAULT_PROPERTY_IMAGE } from './constants';

const ADMIN_SECRET_KEY = 'CHENNAI_ADMIN7@2025';
const ITEMS_PER_PAGE = 9;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.LANDING);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '', city: 'All', area: '', bank: '', category: '',
    minPrice: undefined, maxPrice: undefined, startDate: '', endDate: ''
  });

  const [auctions, setAuctions] = useState<AuctionProperty[]>([]);
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<AuctionProperty | null>(null);
  const [selectedProject, setSelectedProject] = useState<RealEstateProject | null>(null);

  useEffect(() => {
    const adminFlag = sessionStorage.getItem('isAdminAuth') === 'true';
    setIsAdmin(adminFlag);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      window.scrollTo(0, 0);
      setVisibleCount(ITEMS_PER_PAGE); 

      if (hash === '#/login') { setCurrentPage(PageView.LOGIN); return; }
      if (hash === '#/admin') { isAdmin ? setCurrentPage(PageView.ADMIN) : setCurrentPage(PageView.LOGIN); return; }
      if (hash === '#/about') { setCurrentPage(PageView.ABOUT); return; }
      if (hash === '#/contact') { setCurrentPage(PageView.CONTACT); return; }
      if (hash === '#/auctions') { setCurrentPage(PageView.AUCTION_HOME); return; }
      if (hash === '#/projects') { setCurrentPage(PageView.PROJECT_HOME); return; }
      if (hash === '#/guide') { setCurrentPage(PageView.GUIDE); return; }
      if (hash === '#/faq') { setCurrentPage(PageView.FAQ); return; }

      if (hash.startsWith('#/listing/')) {
        setCurrentSlug(hash.replace('#/listing/', ''));
        setCurrentPage(PageView.AUCTION_DETAIL);
        return;
      }
      if (hash.startsWith('#/project/')) {
        setCurrentSlug(hash.replace('#/project/', ''));
        setCurrentPage(PageView.PROJECT_DETAIL);
        return;
      }
      if (hash.startsWith('#/bank/')) {
        const val = decodeURIComponent(hash.replace('#/bank/', ''));
        setFilters(prev => ({ ...prev, bank: val }));
        setCurrentPage(PageView.AUCTION_FILTER);
        return;
      }
      
      setCurrentPage(PageView.LANDING);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (currentPage === PageView.AUCTION_DETAIL && currentSlug) {
          const auction = await getAuctionBySlug(currentSlug);
          setSelectedAuction(auction || null);
        } else if (currentPage === PageView.PROJECT_DETAIL && currentSlug) {
          const project = await getProjectBySlug(currentSlug);
          setSelectedProject(project || null);
        } else {
          const [fAuctions, fProjects] = await Promise.all([
            searchAuctions(filters),
            getProjects()
          ]);
          setAuctions(fAuctions || []);
          setProjects(fProjects || []);
        }
      } catch (err) {
        console.error("Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, currentSlug, filters]);

  const navigateTo = (path: string) => { window.location.hash = path; };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on filter change
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('Price') ? (value ? Number(value) : undefined) : value
    }));
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdminAuth');
    navigateTo('#/');
  };

  const shareOnWhatsApp = (title: string, price?: string) => {
    const url = window.location.href;
    const text = `Check out this property on ChennaiPropertyPro:\n\n*${title}*\n${price ? `Price: ${price}\n` : ''}\nLink: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Header 
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onNavigate={(page) => {
          if(page === 'LANDING') navigateTo('#/');
          else if(page === 'AUCTION_HOME') navigateTo('#/auctions');
          else if(page === 'PROJECT_HOME') navigateTo('#/projects');
          else if(page === 'CONTACT') navigateTo('#/contact');
          else if(page === 'ADMIN') navigateTo('#/admin');
          else if(page === 'GUIDE') navigateTo('#/guide');
          else if(page === 'FAQ') navigateTo('#/faq');
      }} />
      
      <main className="flex-grow page-fade-in">
        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[99] flex items-center justify-center">
             <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100">
               <Loader2 className="animate-spin text-accent" size={48} />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Database...</p>
             </div>
          </div>
        )}

        {currentPage === PageView.LANDING && (
          <div>
            <section className="bg-primary text-white py-24 px-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 transform translate-x-1/4"></div>
              <div className="container mx-auto max-w-6xl relative z-10 text-center">
                <span className="bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block shadow-xl">verified property portal TN</span>
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-none tracking-tighter uppercase">
                  Find Your Next <br/> <span className="text-accent">Dream Property</span>
                </h1>
                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">Bank Auctions, Premium Flats, and Plot Projects. Direct access to verified public notices.</p>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                   <button onClick={() => navigateTo('#/auctions')} className="bg-white text-primary px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3 shadow-2xl"><Gavel size={20} className="text-accent" /> Bank Auctions</button>
                   <button onClick={() => navigateTo('#/projects')} className="bg-accent text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all flex items-center gap-3 shadow-2xl"><Building2 size={20} /> New Projects</button>
                </div>
              </div>
            </section>

            <section className="py-24">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid md:grid-cols-12 gap-12">
                   <div className="md:col-span-8 space-y-12">
                     <div className="flex justify-between items-end border-b-4 border-accent pb-4">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Bank Auctions</h2>
                        <button onClick={() => navigateTo('#/auctions')} className="text-accent font-black text-xs uppercase hover:underline flex items-center gap-2">View All <ChevronRight size={18}/></button>
                     </div>
                     <div className="grid sm:grid-cols-2 gap-8">
                       {auctions?.length > 0 ? auctions.slice(0, 4).map(a => <AuctionCard key={a.id} auction={a} onClick={(s) => navigateTo(`#/listing/${s}`)} />) : <p className="text-slate-400 text-xs uppercase font-bold">No recent auctions</p>}
                     </div>

                     <div className="flex justify-between items-end border-b-4 border-accent pb-4 pt-12">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Featured Projects</h2>
                        <button onClick={() => navigateTo('#/projects')} className="text-accent font-black text-xs uppercase hover:underline flex items-center gap-2">View All <ChevronRight size={18}/></button>
                     </div>
                     <div className="grid sm:grid-cols-2 gap-8">
                       {projects?.length > 0 ? projects.slice(0, 4).map(p => (
                         <div key={p.id} onClick={() => navigateTo(`#/project/${p.slug}`)} className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                           <div className="h-56 relative overflow-hidden">
                             <img src={p.imageUrls && p.imageUrls[0] ? formatImageUrl(p.imageUrls[0]) : DEFAULT_PROPERTY_IMAGE} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE; }} />
                             <span className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{p.type} Project</span>
                           </div>
                           <div className="p-8">
                             <h3 className="text-xl font-black mb-2 group-hover:text-accent transition-colors uppercase leading-tight">{p.title}</h3>
                             <p className="text-slate-500 text-sm font-bold flex items-center gap-2 mb-6"><MapPin size={16} className="text-accent"/> {p.area}, {p.city}</p>
                             <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                               <span className="text-xs font-black uppercase text-slate-400">Starting at</span>
                               <span className="text-lg font-black text-primary uppercase tracking-tighter">{p.priceRange}</span>
                             </div>
                           </div>
                         </div>
                       )) : <p className="text-slate-400 text-xs uppercase font-bold">No recent projects</p>}
                     </div>
                   </div>
                   <aside className="md:col-span-4 space-y-8">
                      <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24">
                        <h3 className="font-black text-2xl mb-8 flex items-center gap-3 uppercase tracking-tighter"><Landmark size={24} className="text-accent" /> Auction Banks</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {BANKS.map(bank => (
                            <a key={bank} href={`#/bank/${bank}`} className="flex justify-between items-center text-xs text-slate-400 hover:text-white transition-all py-3 border-b border-white/5 font-black uppercase group">
                               {bank} Notice <ChevronRight size={14} className="text-accent group-hover:translate-x-1 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </div>
                      <AdSpace type="sidebar" />
                   </aside>
                </div>
              </div>
            </section>
          </div>
        )}

        {(currentPage === PageView.AUCTION_HOME || currentPage === PageView.AUCTION_FILTER) && (
          <div className="container mx-auto px-4 py-16 max-w-7xl">
             <div className="mb-12">
               <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                 {filters.bank ? `${filters.bank} Auction Notices` : 'Bank Auction Directory'}
               </h1>
               <p className="text-slate-500 font-medium">Search through verified public auction notices across Tamil Nadu.</p>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12">
               <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 items-end">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={12}/> Locality</label>
                   <input name="area" value={filters.area} onChange={handleFilterChange} placeholder="Search Area" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-accent" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><IndianRupee size={12}/> Min Price</label>
                   <input name="minPrice" type="number" value={filters.minPrice || ''} onChange={handleFilterChange} placeholder="Min ₹" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-accent" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><IndianRupee size={12}/> Max Price</label>
                   <input name="maxPrice" type="number" value={filters.maxPrice || ''} onChange={handleFilterChange} placeholder="Max ₹" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-accent" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><CalendarIcon size={12}/> From Date</label>
                   <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><CalendarIcon size={12}/> To Date</label>
                   <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
                 </div>
                 <button onClick={() => {
                   setFilters({ query: '', city: 'All', area: '', bank: '', category: '', minPrice: undefined, maxPrice: undefined, startDate: '', endDate: '' });
                   setVisibleCount(ITEMS_PER_PAGE);
                 }} className="bg-primary text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800">Reset</button>
               </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {auctions?.length > 0 ? (
                 auctions.slice(0, visibleCount).map(a => <AuctionCard key={a.id} auction={a} onClick={(s) => navigateTo(`#/listing/${s}`)} />)
               ) : (
                 <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No matching auctions found.</p>
                 </div>
               )}
             </div>

             {auctions?.length > visibleCount && (
               <div className="mt-16 flex justify-center">
                 <button 
                   onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                   className="bg-white border-2 border-primary text-primary px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                 >
                   Load More Notices
                 </button>
               </div>
             )}
          </div>
        )}

        {currentPage === PageView.PROJECT_HOME && (
          <div className="container mx-auto px-4 py-16 max-w-7xl">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">New Residential & <span className="text-accent">Plot Projects</span></h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {projects?.slice(0, visibleCount).map(p => (
                <div key={p.id} onClick={() => navigateTo(`#/project/${p.slug}`)} className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-full">
                  <div className="h-64 relative overflow-hidden">
                    <img src={p.imageUrls && p.imageUrls[0] ? formatImageUrl(p.imageUrls[0]) : DEFAULT_PROPERTY_IMAGE} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE; }} />
                  </div>
                  <div className="p-8 flex-grow">
                    <h3 className="text-2xl font-black mb-3 uppercase leading-tight group-hover:text-accent transition-colors">{p.title}</h3>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mb-6"><MapPin size={16} className="text-accent"/> {p.area}, {p.city}</p>
                    <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-8">{p.description}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                      <p className="text-xl font-black text-primary">{p.priceRange}</p>
                      <button className="bg-accent text-white p-3 rounded-xl shadow-lg group-hover:translate-x-1 transition-transform"><ChevronRight size={20}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects?.length > visibleCount && (
               <div className="mt-16 flex justify-center">
                 <button 
                   onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                   className="bg-white border-2 border-primary text-primary px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl"
                 >
                   Explore More Projects
                 </button>
               </div>
             )}
          </div>
        )}

        {currentPage === PageView.GUIDE && <GuidePage />}
        {currentPage === PageView.FAQ && <FAQPage />}

        {currentPage === PageView.AUCTION_DETAIL && selectedAuction && (
          <div className="container mx-auto px-4 py-16 max-w-5xl">
             <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200 aspect-video group">
                     <img src={selectedAuction.imageUrls && selectedAuction.imageUrls[0] ? formatImageUrl(selectedAuction.imageUrls[0]) : DEFAULT_PROPERTY_IMAGE} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE; }} />
                   </div>
                   <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl border-t-8 border-accent">
                      <h3 className="font-black text-2xl mb-8 flex items-center gap-3"><Gavel className="text-accent" /> Auction Summary</h3>
                      <div className="space-y-5">
                         <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Reserve Price</span><span className="font-black text-2xl text-accent">{formatCurrency(selectedAuction.reservePrice)}</span></div>
                         <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Auction Date</span><span className="font-black text-lg">{new Date(selectedAuction.auctionDate).toLocaleDateString()}</span></div>
                         <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Bank</span><span className="font-black text-lg">{selectedAuction.bankName}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Possession</span><span className="font-black text-lg text-accent uppercase tracking-wider">{selectedAuction.possessionStatus || 'Symbolic'}</span></div>
                      </div>
                      {selectedAuction.documentUrl && <a href={selectedAuction.documentUrl} target="_blank" className="mt-10 w-full bg-white text-primary py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl"><Download size={20} className="text-accent"/> Download Auction Notice</a>}
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {selectedAuction.category}
                        </span>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {selectedAuction.possessionStatus} Possession
                        </span>
                      </div>
                      <button 
                        onClick={() => shareOnWhatsApp(selectedAuction.title, formatCurrency(selectedAuction.reservePrice))}
                        className="p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <MessageCircle size={18} /> Share
                      </button>
                   </div>
                   <h1 className="text-5xl font-black text-slate-900 leading-none uppercase tracking-tighter">{selectedAuction.title}</h1>
                   <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl"><MapPin className="text-accent" /><p className="font-bold text-slate-600 uppercase text-xs tracking-wider">{selectedAuction.area}, {selectedAuction.city}</p></div>
                   <div className="prose max-w-none">
                     <h4 className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-4 border-b pb-2"><Info size={14} className="text-accent" /> Notice Details</h4>
                     <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line text-sm">{selectedAuction.description}</p>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200"><a href="mailto:chennaipropertypro2@gmail.com" className="bg-primary text-white w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all"><Mail size={20} className="text-accent"/> Inquire for More Details</a></div>
                </div>
             </div>
          </div>
        )}

        {currentPage === PageView.PROJECT_DETAIL && selectedProject && (
          <article className="container mx-auto px-4 py-16 max-w-4xl page-fade-in">
             <header className="mb-12">
               <div className="flex justify-between items-start mb-4">
                 <span className="text-accent font-black text-xs uppercase tracking-[0.4em] block">New Launch Project</span>
                 <button 
                   onClick={() => shareOnWhatsApp(selectedProject.title, selectedProject.priceRange)}
                   className="p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6"
                 >
                   <MessageCircle size={18} /> Share on WhatsApp
                 </button>
               </div>
               <h1 className="text-6xl font-black text-slate-900 mb-8 leading-none tracking-tighter uppercase">{selectedProject.title}</h1>
               <div className="flex flex-wrap gap-8 py-6 border-y border-slate-200">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Developer</p><p className="font-black uppercase">{selectedProject.developer}</p></div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p><p className="font-black uppercase">{selectedProject.area}, {selectedProject.city}</p></div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pricing</p><p className="font-black uppercase text-accent">{selectedProject.priceRange}</p></div>
               </div>
             </header>
             <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-16 border border-slate-200 aspect-[21/9]">
               <img src={selectedProject.imageUrls && selectedProject.imageUrls[0] ? formatImageUrl(selectedProject.imageUrls[0]) : DEFAULT_PROPERTY_IMAGE} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE; }} />
             </div>
             <div className="prose max-w-none mb-16"><div className="text-slate-700 text-lg leading-relaxed font-medium whitespace-pre-line space-y-6">{selectedProject.content || selectedProject.description}</div></div>
             <div className="grid sm:grid-cols-2 gap-8">
                {selectedProject.documentUrl && <a href={selectedProject.documentUrl} target="_blank" className="bg-slate-900 text-white p-8 rounded-[2rem] flex flex-col justify-between hover:bg-accent transition-all group shadow-xl"><Download className="text-accent group-hover:text-white mb-6" size={40} /><div><p className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white/60 mb-2">Technical Info</p><h4 className="text-xl font-black uppercase">Project Brochure</h4></div></a>}
                <div className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm"><Mail className="text-accent mb-6" size={40} /><div><a href="mailto:chennaipropertypro2@gmail.com" className="text-xl font-black uppercase hover:text-accent transition-colors">Contact Notice Desk</a></div></div>
             </div>
          </article>
        )}

        {currentPage === PageView.LOGIN && <Login onLogin={async (key) => {
          if(key === ADMIN_SECRET_KEY) { setIsAdmin(true); sessionStorage.setItem('isAdminAuth', 'true'); navigateTo('#/admin'); return true; }
          return false;
        }} />}
        {currentPage === PageView.ADMIN && <AdminPanel onSuccess={() => navigateTo('#/auctions')} />}
        {currentPage === PageView.CONTACT && <ContactPage />}
        {currentPage === PageView.ABOUT && <AboutPage />}
      </main>
      <Footer />
    </div>
  );
};

const GuidePage = () => (
  <div className="py-24 px-4 bg-white page-fade-in">
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase border-b-8 border-accent pb-4 inline-block">Auction Purchase <span className="text-accent">Guide</span></h1>
      <div className="space-y-12">
        <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-3"><span className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> Select Property</h2>
          <p className="text-slate-600 leading-relaxed font-medium">Browse through our verified listings. Check the location, area, and Reserve Price. Visit the property physically if possible before the auction date.</p>
        </section>
        <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-3"><span className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> Pay EMD (Earnest Money Deposit)</h2>
          <p className="text-slate-600 leading-relaxed font-medium">To participate, you must pay the EMD (usually 10% of Reserve Price) to the bank. This is refundable if you don't win the bid.</p>
        </section>
        <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-3"><span className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> Online/Physical Bidding</h2>
          <p className="text-slate-600 leading-relaxed font-medium">The auction happens on the scheduled date. If you are the highest bidder, you are declared the winner.</p>
        </section>
        <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-3"><span className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span> Balance Payment</h2>
          <p className="text-slate-600 leading-relaxed font-medium">Upon winning, you usually pay 25% of the bid amount immediately (including EMD) and the remaining 75% within 15 days.</p>
        </section>
      </div>
    </div>
  </div>
);

const FAQPage = () => (
  <div className="py-24 px-4 bg-slate-50 page-fade-in">
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase text-center">Frequently Asked <span className="text-accent">Questions</span></h1>
      <div className="grid gap-6">
        {[
          { q: "Is buying from bank auction safe?", a: "Yes, it's generally safe as the bank has verified the property title. However, checking encumbrance certificate (EC) is always recommended." },
          { q: "Can I take a loan for auction property?", a: "Yes, most banks provide loans for properties purchased in their own or other bank auctions, provided you meet the eligibility criteria." },
          { q: "What is the difference between Physical and Symbolic possession?", a: "Physical possession means the bank has the keys and the house is vacant. Symbolic possession means the bank has legal right but might not have physically ousted the previous owner yet." },
          { q: "How do I get my EMD back if I lose?", a: "The bank usually refunds the EMD within 3-7 working days directly to your bank account." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-3 text-slate-800"><HelpCircle size={24} className="text-accent" /> {item.q}</h3>
            <p className="text-slate-600 font-medium leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="py-24 px-4 bg-white page-fade-in text-center">
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-6xl font-black mb-8 tracking-tighter uppercase">About <span className="text-accent">PropertyPro</span></h1>
      <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">Tamil Nadu's dedicated platform for bank auction notices and premium residential projects. Our mission is to bridge the gap between verified bank listings and potential home buyers.</p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100">
          <CheckCircle2 size={40} className="text-accent mx-auto mb-4" />
          <h3 className="font-black uppercase text-sm mb-2">Verified Notices</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sourced directly from banks</p>
        </div>
        <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100">
          <Gavel size={40} className="text-accent mx-auto mb-4" />
          <h3 className="font-black uppercase text-sm mb-2">Weekly Updates</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fresh listings every Monday</p>
        </div>
        <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100">
          <Building2 size={40} className="text-accent mx-auto mb-4" />
          <h3 className="font-black uppercase text-sm mb-2">Prime Locations</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chennai & Major TN Cities</p>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="py-24 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden grid md:grid-cols-2">
        <div className="p-16 bg-primary text-white">
            <h2 className="text-5xl font-black mb-8 leading-none uppercase tracking-tighter">Support Desk</h2>
            <p className="text-slate-400 mb-12 font-medium">Have questions about a specific bank notice? Our property experts are here to help you navigate the auction process.</p>
            <div className="flex items-center gap-6"><div className="bg-accent p-6 rounded-3xl shadow-xl"><Mail size={32}/></div><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Email Address</p><p className="font-black text-2xl">chennaipropertypro2@gmail.com</p></div></div>
        </div>
        <div className="p-16">
          <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter text-slate-800">Direct Inquiry</h3>
          <form className="space-y-6">
            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Full Name" />
            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Email Address" />
            <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" rows={4} placeholder="Property Interest (Listing ID or Bank Name)"></textarea>
            <button className="w-full bg-accent text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-red-700 transition-all">Send Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default App;
