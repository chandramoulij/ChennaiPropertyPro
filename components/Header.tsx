
import React from 'react';
import { Menu, X, Gavel, Building2, Mail, Home, PlusCircle, LogOut, FileText, HelpCircle, ChevronDown } from 'lucide-react';

interface Props {
  onNavigate: (page: string, params?: any) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const Header: React.FC<Props> = ({ onNavigate, isAdmin, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-white py-2 border-b border-white/5 hidden md:block">
        <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Mail size={12} className="text-accent" /> chennaipropertypro2@gmail.com</span>
          </div>
          <div className="flex gap-4">
            <a href="#/about" className="hover:text-accent transition-colors">About Portal</a>
            <a href="#/contact" className="hover:text-accent transition-colors">Support</a>
          </div>
        </div>
      </div>

      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onNavigate('LANDING')}
            >
              <div className="bg-primary p-2.5 rounded group-hover:bg-accent transition-colors">
                <Building2 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-primary tracking-tighter leading-none uppercase">ChennaiProperty<span className="text-accent">Pro</span></h1>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Auction & Real Estate Directory</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#/" onClick={(e) => { e.preventDefault(); onNavigate('LANDING'); }} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all flex items-center gap-1.5">
                <Home size={14} /> Home
              </a>
              <a href="#/auctions" onClick={(e) => { e.preventDefault(); onNavigate('AUCTION_HOME'); }} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all flex items-center gap-1.5">
                <Gavel size={14} className="text-accent" /> Bank Auctions
              </a>
              <a href="#/projects" onClick={(e) => { e.preventDefault(); onNavigate('PROJECT_HOME'); }} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all flex items-center gap-1.5">
                <Building2 size={14} className="text-accent" /> Projects
              </a>

              <div className="group relative">
                <button className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-accent flex items-center gap-1.5">
                  Resources <ChevronDown size={12} />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <a href="#/guide" onClick={(e) => { e.preventDefault(); onNavigate('GUIDE'); }} className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-accent flex items-center gap-2">
                    <FileText size={14} /> Auction Guide
                  </a>
                  <a href="#/faq" onClick={(e) => { e.preventDefault(); onNavigate('FAQ'); }} className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-accent flex items-center gap-2">
                    <HelpCircle size={14} /> Questions (FAQ)
                  </a>
                </div>
              </div>
              
              <div className="h-4 w-px bg-slate-200"></div>
              
              {isAdmin ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => onNavigate('ADMIN')}
                    className="bg-accent text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <PlusCircle size={14} /> Post
                  </button>
                  <button onClick={onLogout} className="text-slate-400 hover:text-accent transition-colors" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <a href="#/contact" onClick={(e) => { e.preventDefault(); onNavigate('CONTACT'); }} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all">
                  Contact
                </a>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-slate-600 bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-xl py-4">
            <div className="flex flex-col p-4 space-y-5">
              <a href="#/" onClick={() => { onNavigate('LANDING'); setIsMobileMenuOpen(false); }} className="text-slate-900 font-black uppercase tracking-widest text-sm">Home</a>
              <a href="#/auctions" onClick={() => { onNavigate('AUCTION_HOME'); setIsMobileMenuOpen(false); }} className="text-slate-900 font-black uppercase tracking-widest text-sm flex items-center gap-2"><Gavel size={16} className="text-accent" /> Bank Auctions</a>
              <a href="#/projects" onClick={() => { onNavigate('PROJECT_HOME'); setIsMobileMenuOpen(false); }} className="text-slate-900 font-black uppercase tracking-widest text-sm flex items-center gap-2"><Building2 size={16} className="text-accent" /> New Projects</a>
              <a href="#/guide" onClick={() => { onNavigate('GUIDE'); setIsMobileMenuOpen(false); }} className="text-slate-900 font-black uppercase tracking-widest text-sm flex items-center gap-2"><FileText size={16} className="text-accent" /> Auction Guide</a>
              {isAdmin && (
                <button 
                  onClick={() => { onNavigate('ADMIN'); setIsMobileMenuOpen(false); }}
                  className="bg-accent text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-left"
                >
                  Post Listing
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
