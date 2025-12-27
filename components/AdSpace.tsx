import React from 'react';

interface AdSpaceProps {
  className?: string;
  type?: 'banner' | 'sidebar' | 'inline';
}

const AdSpace: React.FC<AdSpaceProps> = ({ className = '', type = 'banner' }) => {
  let heightClass = 'h-24';
  if (type === 'sidebar') heightClass = 'h-64';
  if (type === 'inline') heightClass = 'h-32';

  return (
    <div className={`bg-gray-100 border border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 text-sm overflow-hidden relative ${heightClass} ${className}`}>
      <span className="font-semibold tracking-wider">ADVERTISEMENT</span>
      <span className="text-xs mt-1">Place your ad here</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 pointer-events-none"></div>
    </div>
  );
};

export default AdSpace;