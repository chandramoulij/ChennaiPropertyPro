
import React from 'react';
import { MapPin, Calendar, Eye, Landmark, Lock, Info } from 'lucide-react';
import { AuctionProperty } from '../types';
import { formatImageUrl } from '../services/storageService';
import { DEFAULT_PROPERTY_IMAGE } from '../constants';

interface Props {
  auction: AuctionProperty;
  onClick: (slug: string) => void;
}

const AuctionCard: React.FC<Props> = ({ auction, onClick }) => {
  const mainImage = auction.imageUrls && auction.imageUrls.length > 0 && auction.imageUrls[0]
    ? formatImageUrl(auction.imageUrls[0]) 
    : DEFAULT_PROPERTY_IMAGE;

  return (
    <div 
      onClick={() => onClick(auction.slug)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer flex flex-col h-full group"
    >
      <div className="relative h-52 overflow-hidden">
        <img 
          src={mainImage} 
          alt={auction.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE; }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-primary/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow-lg">
            {auction.category}
          </span>
          {auction.possessionStatus === 'Physical' && (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow-lg">
              Physical
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          < Landmark size={14} className="text-accent" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{auction.bankName} Notice</span>
        </div>
        
        <h3 className="font-extrabold text-slate-800 mb-4 line-clamp-2 min-h-[3rem] text-lg leading-tight group-hover:text-accent transition-colors">
          {auction.title}
        </h3>
        
        <div className="space-y-3 text-xs text-slate-500 mb-6 flex-grow">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-accent shrink-0" />
            <span className="font-bold">{auction.area}, {auction.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent shrink-0" />
            <span className="font-bold">Auction: <span className="text-slate-900">{new Date(auction.auctionDate).toLocaleDateString()}</span></span>
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl mb-6 flex items-center justify-center gap-3 group-hover:bg-accent transition-all duration-300">
          <Lock size={16} className="text-accent group-hover:text-white" />
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Click to View Pricing</p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
               <Info size={12} className="text-accent" /> Public Notice
             </div>
             <button className="text-accent flex items-center gap-1 text-xs font-black uppercase hover:underline transition-all group-hover:translate-x-1">
               Full Details <Eye size={16} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
