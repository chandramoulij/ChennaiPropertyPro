import React from 'react';
import { Mail, Building2, ChevronRight, Lock } from 'lucide-react';
import { BANKS, CATEGORIES, DISTRICTS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden relative border-t-8 border-accent">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-accent/5 pointer-events-none skew-y-6 transform translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-accent p-1.5 rounded shadow-lg">
                <Building2 className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">ChennaiProperty<span className="text-accent">Pro</span></h2>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm max-w-sm">
              Premium directory for TN Bank Auctions and Residential Projects. We provide legally verified notice information to home buyers and investors.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-white/5 p-3 rounded-full group-hover:bg-accent transition-colors"><Mail size={20} className="text-accent group-hover:text-white" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-500">Official Desk</p><p className="text-white font-bold">chennaipropertypro2@gmail.com</p></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Directory</h3>
            <ul className="space-y-3 text-xs">
              <li><a href="#/auctions" className="hover:text-accent transition-colors flex items-center gap-2 group"><ChevronRight size={12} className="text-accent" /> Bank Auctions</a></li>
              <li><a href="#/projects" className="hover:text-accent transition-colors flex items-center gap-2 group"><ChevronRight size={12} className="text-accent" /> New Projects</a></li>
              <li><a href="#/about" className="hover:text-accent transition-colors flex items-center gap-2 group"><ChevronRight size={12} className="text-accent" /> About Us</a></li>
              <li><a href="#/contact" className="hover:text-accent transition-colors flex items-center gap-2 group"><ChevronRight size={12} className="text-accent" /> Support</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Partner Banks</h3>
            <ul className="space-y-3 text-xs">
              {BANKS.slice(0, 6).map(bank => (
                <li key={bank}>
                  <a href={`#/bank/${bank}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-accent" /> {bank} Auctions
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Locations</h3>
            <ul className="space-y-3 text-xs">
              {DISTRICTS.map(dist => (
                <li key={dist}>
                  <a href={`#/district/${dist}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-accent" /> {dist} Notice
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-widest">
          <p className="mb-4 md:mb-0">© {new Date().getFullYear()} ChennaiPropertyPro. ALL NOTICES VERIFIED FROM PUBLIC DOMAIN.</p>
          <div className="flex gap-8 items-center">
            <a href="#/login" className="hover:text-white transition-colors flex items-center gap-1"><Lock size={12} className="text-accent" /> Admin Access</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;