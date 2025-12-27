import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuctionCard from './components/AuctionCard';
import AdSpace from './components/AdSpace';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { getAuctions, getAuctionBySlug, searchAuctions } from './services/storageService';
import { subscribeToStats } from './services/firebaseService';
import { AuctionProperty, PageView, SearchFilters } from './types';
import { 
  Search, MapPin, Building, ChevronRight, 
  Phone, Gavel, MessageCircle, Building2, Mail, Home, Filter, Send,
  Globe, Landmark, Map, ShieldCheck, Loader2
} from 'lucide-react';
import { BANKS, CATEGORIES, DISTRICTS } from './constants';

const ADMIN_SECRET_KEY = 'CHENNAI_ADMIN7@2025';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.LANDING);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'bank' | 'category' | 'city' | 'district' | 'search' | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [siteStats, setSiteStats] = useState({ online: 0, views: 0 });
  const [auctions, setAuctions] = useState<AuctionProperty[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<AuctionProperty | null>(null);

  useEffect(() => {
    const adminFlag = sessionStorage.getItem('isAdminAuth') === 'true';
    setIsAdmin(adminFlag);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStats(
      (onlineCount) => setSiteStats(prev => ({ ...prev, online: onlineCount })),
      (viewCount) => setSiteStats(prev => ({ ...prev, views: viewCount }))
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      window.scrollTo(0, 0);

      if (hash === '#/login') {
        isAdmin ? navigateTo('#/admin') : setCurrentPage(PageView.LOGIN);
        return;
      }
      if (hash === '#/admin') {
        isAdmin ? setCurrentPage(PageView.ADMIN) : navigateTo('#/login');
        return;
      }
      if (hash === '#/about') {
        setCurrentPage(PageView.ABOUT);
        return;
      }
      if (hash === '#/contact') {
        setCurrentPage(PageView.CONTACT);
        return;
      }

      if (hash.startsWith('#/listing/')) {
        setCurrentSlug(hash.replace('#/listing/', ''));
        setCurrentPage(PageView.AUCTION_DETAIL);
        return;
      }
      if (hash.startsWith('#/bank/')) {
        setFilterType('bank');
        setFilterValue(decodeURIComponent(hash.replace('#/bank/', '')));
        setCurrentPage(PageView.AUCTION_FILTER);
        return;
      }
      if (hash.startsWith('#/category/')) {
        setFilterType('category');
        setFilterValue(decodeURIComponent(hash.replace('#/category/', '')));
        setCurrentPage(PageView.AUCTION_FILTER);
        return;
      }
      if (hash.startsWith('#/district/')) {
        setFilterType('district');
        setFilterValue(decodeURIComponent(hash.replace('#/district/', '')));
        setCurrentPage(PageView.AUCTION_FILTER);
        return;
      }
      if (hash.startsWith('#/search/')) {
        setFilterType('search');
        setFilterValue(decodeURIComponent(hash.replace('#/search/', '')));
        setCurrentPage(PageView.AUCTION_FILTER);
        return;
      }

      if (hash === '#/auctions') {
        setCurrentPage(PageView.AUCTION_HOME);
        setFilterType(null);
        setFilterValue(null);
      } else {
        setCurrentPage(PageView.LANDING);
      }
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
        } else if (currentPage === PageView.AUCTION_FILTER) {
          const filters: SearchFilters = {
            bank: filterType === 'bank' ? filterValue! : '',
            category: filterType === 'category' ? filterValue! : '',
            city: filterType === 'city' ? filterValue! : '',
            area: filterType === 'district' ? filterValue! : '',
            query: filterType === 'search' ? filterValue! : ''
          };
          const filtered = await searchAuctions(filters);
          setAuctions(filtered);
        } else if (currentPage === PageView.AUCTION_HOME || currentPage === PageView.LANDING) {
          const allAuctions = await getAuctions();
          setAuctions(allAuctions);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, currentSlug, filterType, filterValue]);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo(`#/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const Breadcrumbs = ({ items }: { items: { label: string, path?: string }[] }) => (
    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
      <Home size={12} className="cursor-pointer hover:text-primary" onClick={() => navigateTo('#/')} />
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} />
          {item.path ? (
            <span className="cursor-pointer hover:text-primary" onClick={() => navigateTo(item.path!)}>{item.label}</span>
          ) : (
            <span className="font-semibold text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Header 
        onNavigate={(page) => {
          if(page === 'LANDING') navigateTo('#/');
          else if(page === 'AUCTION_HOME') navigateTo('#/auctions');
          else if(page === 'ABOUT') navigateTo('#/about');
          else if(page === 'CONTACT') navigateTo('#/contact');
          else if(page === 'ADMIN') navigateTo('#/admin');
        }} 
        isAdmin={isAdmin} 
        onLogout={() => { setIsAdmin(false); sessionStorage.removeItem('isAdminAuth'); navigateTo('#/'); }} 
      />
      
      <main className="flex-grow page-fade-in">
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[99] flex items-center justify-center">
             <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100">
               <Loader2 className="animate-spin text-accent" size={40} />
               <p className="text-xs font-black uppercase tracking-widest text-slate-500">Updating Notices...</p>
             </div>
          </div>
        )}

        {currentPage === PageView.LANDING && (
          <div>
            {/* SEO Hero Section */}
            <section className="bg-primary text-white py-16 px-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 transform translate-x-1/4"></div>
              <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-3/5">
                  <span className="bg-accent text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">Verified Property Source</span>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tighter">Chennai Bank Auction <span className="text-accent">Property Portal</span></h1>
                  <p className="text-slate-300 text-lg mb-8 max-w-lg font-medium">Direct access to SARFAESI auction notices from SBI, HDFC, Indian Bank & more. Buy residential and commercial assets at 25-30% below market price.</p>
                  
                  {/* Hero Search Box */}
                  <form onSubmit={handleHeroSearch} className="bg-white p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl">
                    <div className="flex-grow flex items-center px-4 border-b md:border-b-0 md:border-r border-slate-100">
                      <Search size={18} className="text-slate-400 mr-2" />
                      <input 
                        className="w-full py-3 text-slate-900 outline-none text-sm font-medium" 
                        placeholder="Search by Area, Bank or Category..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="bg-accent hover:bg-red-700 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95">
                      Find Auctions
                    </button>
                  </form>
                </div>
                
                <div className="md:w-2/5 grid grid-cols-2 gap-4">
                  {CATEGORIES.slice(0, 4).map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => navigateTo(`#/category/${cat}`)}
                      className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-accent/20 transition-all cursor-pointer group"
                    >
                      <Building2 className="text-accent mb-3 group-hover:scale-110 transition-transform" size={24} />
                      <h3 className="font-bold text-sm uppercase tracking-wide">{cat}</h3>
                      <p className="text-[10px] text-slate-400">View Listings <ChevronRight size={10} className="inline"/></p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Stats Bar */}
            <section className="bg-white border-b py-4">
              <div className="container mx-auto px-4 max-w-6xl flex justify-around text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Globe size={14} className="text-accent" /> PAN Tamil Nadu Presence</div>
                <div className="flex items-center gap-2 border-x border-slate-100 px-8"><Landmark size={14} className="text-accent" /> 60+ Financial Institutions</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> 100% SARFAESI Compliant</div>
              </div>
            </section>

            {/* Main Listing Section */}
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Main Content */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 border-l-4 border-accent pl-4">Latest Auction Notices</h2>
                      <button onClick={() => navigateTo('#/auctions')} className="text-accent font-black text-[10px] uppercase hover:underline flex items-center gap-1 tracking-widest">View All Notices <ChevronRight size={14}/></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {auctions.slice(0, 6).map(a => <AuctionCard key={a.id} auction={a} onClick={(slug) => navigateTo(`#/listing/${slug}`)} />)}
                    </div>
                  </div>
                  
                  {/* Sidebar - Similar to reference site */}
                  <aside className="md:w-72 shrink-0 space-y-6">
                    <div className="bg-primary text-white p-6 rounded-2xl shadow-xl">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 uppercase tracking-tighter"><Landmark size={18} className="text-accent"/> By Bank</h3>
                      <div className="space-y-1.5">
                        {BANKS.slice(0, 8).map(bank => (
                          <a key={bank} href={`#/bank/${bank}`} className="block text-xs text-slate-400 hover:text-accent transition-colors py-2 border-b border-white/5 font-bold">{bank} Auctions</a>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 uppercase tracking-tighter"><Map size={18} className="text-accent"/> By District</h3>
                      <div className="space-y-1.5">
                        {DISTRICTS.map(dist => (
                          <a key={dist} href={`#/district/${dist}`} className="block text-xs text-slate-600 hover:text-accent transition-colors py-2 border-b border-slate-50 font-bold">{dist} Properties</a>
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
          <div className="container mx-auto px-4 py-8 max-w-6xl">
             <Breadcrumbs items={[
                { label: 'Auctions', path: '#/auctions' },
                ...(filterValue ? [{ label: filterValue }] : [])
             ]} />
             
             <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-64 space-y-6">
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-black text-[10px] uppercase text-slate-400 mb-4 tracking-widest">Filter By Bank</h3>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                        {BANKS.map(bank => (
                          <button 
                            key={bank}
                            onClick={() => navigateTo(`#/bank/${bank}`)}
                            className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all font-bold ${filterValue === bank ? 'bg-accent text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-black text-[10px] uppercase text-slate-400 mb-4 tracking-widest">Property Type</h3>
                      <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                          <button 
                            key={cat}
                            onClick={() => navigateTo(`#/category/${cat}`)}
                            className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all font-bold ${filterValue === cat ? 'bg-accent text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                   </div>
                   <AdSpace type="sidebar" />
                </aside>

                <div className="flex-grow">
                   <div className="flex items-end justify-between mb-8 border-b-4 border-accent pb-2">
                     <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                       {filterValue ? `${filterValue} Property Auctions` : 'All Bank Auctions'}
                     </h1>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{auctions.length} Results Found</p>
                   </div>
                   
                   {auctions.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                       {auctions.map(a => <AuctionCard key={a.id} auction={a} onClick={(slug) => navigateTo(`#/listing/${slug}`)} />)}
                     </div>
                   ) : (
                     <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Search className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No active notices found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">We couldn't find any auctions matching "{filterValue}". Try checking a different category or bank.</p>
                        <button onClick={() => navigateTo('#/auctions')} className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Clear All Filters</button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {currentPage === PageView.AUCTION_DETAIL && selectedAuction && (
           <AuctionDetailPage auction={selectedAuction} formatCurrency={formatCurrency} />
        )}

        {currentPage === PageView.ABOUT && <AboutPage />}
        {currentPage === PageView.CONTACT && <ContactPage />}
        {currentPage === PageView.LOGIN && <Login onLogin={async (key) => {
          if(key === ADMIN_SECRET_KEY) { setIsAdmin(true); sessionStorage.setItem('isAdminAuth', 'true'); navigateTo('#/admin'); return true; }
          return false;
        }} />}
        {currentPage === PageView.ADMIN && <AdminPanel onSuccess={() => navigateTo('#/auctions')} />}
      </main>
      <Footer />
    </div>
  );
};

// Sub-components for better organization
const AuctionDetailPage = ({ auction, formatCurrency }: { auction: AuctionProperty, formatCurrency: any }) => (
  <div className="container mx-auto px-4 py-12 max-w-5xl page-fade-in">
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200 aspect-video relative group">
          <img src={auction.imageUrls[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Official Notice Image</div>
        </div>
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border-t-4 border-accent">
          <h3 className="font-black text-xl mb-6 text-white uppercase tracking-tighter flex items-center gap-2">
            <Gavel className="text-accent" /> Auction Particulars
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Selling Bank</span>
              <span className="font-black text-sm uppercase">{auction.bankName}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Reserve Price</span>
              <span className="font-black text-xl text-accent">{formatCurrency(auction.reservePrice)}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">EMD (10%)</span>
              <span className="font-black text-sm">{formatCurrency(auction.emdAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Auction Date</span>
              <span className="font-black text-sm">{new Date(auction.auctionDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <span className="text-accent font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">SARFAESI Property ID: {auction.id}</span>
          <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tighter uppercase">{auction.title}</h1>
          <p className="flex items-center gap-2 text-slate-500 font-black text-sm uppercase tracking-wider">
            <MapPin size={18} className="text-accent" /> {auction.area}, {auction.city}
          </p>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b pb-2">Full Property Description</h3>
          <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line text-sm">{auction.description}</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
           <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Auction Terms</p>
           <ul className="space-y-2">
             <li className="flex gap-2 text-xs font-bold text-slate-600"><ChevronRight size={14} className="text-accent shrink-0" /> Sold on "As is where is" basis</li>
             <li className="flex gap-2 text-xs font-bold text-slate-600"><ChevronRight size={14} className="text-accent shrink-0" /> Participation requires 10% EMD deposit</li>
             <li className="flex gap-2 text-xs font-bold text-slate-600"><ChevronRight size={14} className="text-accent shrink-0" /> Possession Status: {auction.possessionStatus || 'Contact Official'}</li>
           </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <button className="bg-emerald-600 text-white py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
             <MessageCircle size={18}/> WhatsApp Query
           </button>
           <button className="bg-primary text-white py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95">
             <Phone size={18}/> Call Bank Official
           </button>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="py-20 px-4 bg-white page-fade-in">
    <div className="container mx-auto max-w-4xl text-center">
      <h1 className="text-5xl font-black mb-8 tracking-tighter uppercase">About <span className="text-accent">ChennaiPropertyPro</span></h1>
      <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">
        We are Tamil Nadu's leading aggregator of bank auction properties. Our platform simplifies the SARFAESI auction process by providing centralized access to property notices from all leading nationalized and private banks.
      </p>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-accent text-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg"><Gavel /></div>
          <h4 className="font-black text-lg mb-2 uppercase tracking-tighter">Legal Clarity</h4>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Every property listed is legally processed under the SARFAESI Act by regulated financial institutions.</p>
        </div>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg"><Building2 /></div>
          <h4 className="font-black text-lg mb-2 uppercase tracking-tighter">Direct Purchase</h4>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">We provide direct links to bank officials and auction portals. No hidden brokerage or middlemen costs.</p>
        </div>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-accent text-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg"><Search /></div>
          <h4 className="font-black text-lg mb-2 uppercase tracking-tighter">Search Efficiency</h4>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Filter thousands of properties by Reserve Price, Bank Name, or specific Locality in seconds.</p>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="py-20 px-4 page-fade-in">
    <div className="container mx-auto max-w-6xl">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden grid md:grid-cols-2">
        <div className="p-12 bg-primary text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <Landmark size={400} className="translate-x-1/2 -translate-y-1/4" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 leading-tight uppercase tracking-tighter">Contact Our <br/>Auction Experts</h2>
            <p className="text-slate-400 mb-12 text-lg font-medium">Need assistance with the auction bidding process or legal documentation? Our help desk is available 24/7.</p>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-accent p-4 rounded-2xl shadow-lg"><Phone size={24}/></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Call Support</p><p className="font-black text-xl">+91 44 2431 8899</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-accent p-4 rounded-2xl shadow-lg"><Mail size={24}/></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Email Inquiries</p><p className="font-black text-lg">info@chennaipropertypro.com</p></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-12 relative z-10">Operated by CP Pro Media Group • Verified Partner</p>
        </div>
        <div className="p-12">
          <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter text-slate-800">Inquiry Form</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-accent font-bold transition-all" placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mobile</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-accent font-bold transition-all" placeholder="+91" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-accent font-bold transition-all" placeholder="email@domain.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Message / Property Interest</label>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-accent font-medium transition-all" rows={4} placeholder="What property are you looking for?"></textarea>
            </div>
            <button className="w-full bg-accent text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 shadow-2xl transition-all active:scale-95">Send Secure Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default App;