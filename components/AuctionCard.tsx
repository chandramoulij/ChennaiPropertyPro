
import React from 'react';
import { MapPin, Calendar, Building, Eye, Landmark, Info } from 'lucide-react';
import { AuctionProperty } from '../types';

interface Props {
  auction: AuctionProperty;
  onClick: (slug: string) => void;
}

const AuctionCard: React.FC<Props> = ({ auction, onClick }) => {
  const mainImage = auction.imageUrls && auction.imageUrls.length > 0 
    ? auction.imageUrls[0] 
    : 'https://via.placeholder.com/800x600?text=No+Image';

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div 
      onClick={() => onClick(auction.slug)}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer flex flex-col h-full group"
    >
      <div className="relative h-44 overflow-hidden">
        <img 
          src={mainImage} 
          alt={auction.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-accent/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">
            {auction.category}
          </span>
          {auction.possessionStatus === 'Physical' && (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">
              Physical Poss.
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4">
          <p className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1">
             <Landmark size={14} className="text-accent" /> {auction.bankName}
          </p>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-extrabold text-slate-800 mb-3 line-clamp-2 min-h-[2.75rem] text-base leading-tight group-hover:text-accent transition-colors">
          {auction.title}
        </h3>
        
        <div className="space-y-3 text-xs text-slate-600 mb-6 flex-grow">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-accent shrink-0" />
            <span className="font-bold truncate text-slate-500">
              {auction.area}, {auction.city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-accent shrink-0" />
            <span className="font-bold">Auction: <span className="text-slate-900">{new Date(auction.auctionDate).toLocaleDateString()}</span></span>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl mb-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reserve Price</p>
            <p className="text-sm font-black text-primary">{formatPrice(auction.reservePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">EMD Amount</p>
            <p className="text-xs font-bold text-slate-600">{formatPrice(auction.emdAmount || 0)}</p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
               <Info size={12} className="text-accent" /> Details Available
             </div>
             <button className="text-accent flex items-center gap-1 text-xs font-black uppercase hover:underline transition-all group-hover:translate-x-1">
               View Notice <Eye size={14} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
