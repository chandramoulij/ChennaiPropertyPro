
import React from 'react';
import { Mail, Phone, MapPin, Building2, ChevronRight, Globe, ShieldCheck, Landmark, Map } from 'lucide-react';
import { BANKS, CATEGORIES, DISTRICTS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden relative border-t-8 border-accent">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-accent/5 pointer-events-none skew-y-6 transform translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Info */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-accent p-1.5 rounded shadow-lg">
                <Building2 className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">ChennaiProperty<span className="text-accent">Pro</span></h2>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm max-w-sm">
              Tamil Nadu's dedicated platform for Bank Property Auctions under the SARFAESI Act. We connect thousands of buyers with bank notices for residential, commercial and industrial assets.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-white/5 p-3 rounded-full group-hover:bg-accent transition-colors"><Phone size={20} className="text-accent group-hover:text-white" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-500">Contact Support</p><p className="text-white font-bold">+91 44 2431 8899</p></div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-white/5 p-3 rounded-full group-hover:bg-accent transition-colors"><Mail size={20} className="text-accent group-hover:text-white" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-500">Email Notice Desk</p><p className="text-white font-bold">notices@chennaipropertypro.com</p></div>
              </div>
            </div>
          </div>

          {/* Column 2: By Bank */}
          <div className="md:col-span-2">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Auctions by Bank</h3>
            <ul className="space-y-3 text-xs">
              {BANKS.slice(0, 8).map(bank => (
                <li key={bank}>
                  <a href={`#/bank/${bank}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-accent group-hover:translate-x-1 transition-transform" /> {bank} Property
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: By Property Type */}
          <div className="md:col-span-3">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Auction Categories</h3>
            <ul className="space-y-3 text-xs">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <a href={`#/category/${cat}`} className="hover:text-accent transition-colors flex items-center gap-2 group font-bold">
                    <ChevronRight size={12} className="text-accent group-hover:translate-x-1 transition-transform" /> {cat} Bank Auctions
                  </a>
                </li>
              ))}
              <li className="pt-4 text-slate-500 italic text-[10px]">Over 1,200+ active listings</li>
            </ul>
          </div>

          {/* Column 4: By District */}
          <div className="md:col-span-3">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 border-b border-accent pb-2 inline-block">Auctions by District</h3>
            <ul className="space-y-3 text-xs">
              {DISTRICTS.map(dist => (
                <li key={dist}>
                  <a href={`#/district/${dist}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-accent group-hover:translate-x-1 transition-transform" /> {dist} Properties
                  </a>
                </li>
              ))}
              <li><a href="#/auctions" className="hover:text-accent transition-colors flex items-center gap-2 group font-bold"><ChevronRight size={12} className="text-accent" /> Other TN Districts</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-widest">
          <p className="mb-4 md:mb-0">© {new Date().getFullYear()} ChennaiPropertyPro. NOT A GOVERNMENT ENTITY. ALL DATA FROM PUBLIC NOTICES.</p>
          <div className="flex gap-8 items-center">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors text-accent">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
