
import React from 'react';
import { Menu, X, Gavel, PlusCircle, Building2, LogOut, Info, Phone, Mail, Search } from 'lucide-react';

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
            <span className="flex items-center gap-2"><Phone size={12} className="text-accent" /> Support: +91 44 2431 8899</span>
            <span className="flex items-center gap-2"><Mail size={12} className="text-accent" /> notices@chennaipropertypro.com</span>
          </div>
          <div className="flex gap-4">
            <span className="text-accent">Member of Property Group TN</span>
            <a href="#/about" className="hover:text-accent transition-colors">About Portal</a>
            <a href="#/contact" className="hover:text-accent transition-colors">Help Desk</a>
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
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Premier Auction Directory</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#/" 
                onClick={(e) => { e.preventDefault(); onNavigate('LANDING'); }}
                className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all"
              >
                Home
              </a>
              <a 
                href="#/auctions" 
                onClick={(e) => { e.preventDefault(); onNavigate('AUCTION_HOME'); }}
                className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all flex items-center gap-2"
              >
                <Gavel size={16} className="text-accent" /> Bank Auctions
              </a>
              <div className="h-4 w-px bg-slate-200"></div>
              <a 
                href="#/contact" 
                onClick={(e) => { e.preventDefault(); onNavigate('CONTACT'); }}
                className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-accent transition-all"
              >
                Inquiries
              </a>
              
              {isAdmin ? (
                <div className="flex items-center gap-4 ml-4">
                  <button 
                    onClick={() => onNavigate('ADMIN')}
                    className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
                  >
                    <PlusCircle size={16} /> Post Listing
                  </button>
                  <button 
                    onClick={onLogout}
                    className="text-slate-400 hover:text-accent transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate('ADMIN')}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Admin Login
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 bg-slate-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
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
              <a href="#/contact" onClick={() => { onNavigate('CONTACT'); setIsMobileMenuOpen(false); }} className="text-slate-900 font-black uppercase tracking-widest text-sm">Contact Support</a>
              {isAdmin && (
                <button 
                  onClick={() => { onNavigate('ADMIN'); setIsMobileMenuOpen(false); }}
                  className="bg-accent text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest"
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
