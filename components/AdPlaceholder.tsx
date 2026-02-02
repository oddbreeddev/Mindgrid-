
import React from 'react';

interface AdPlaceholderProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ slot, format = 'auto', className }) => {
  return (
    <div className={`bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-4 min-h-[100px] ${className}`}>
      <div className="text-center">
        <p className="text-slate-400 text-xs font-mono mb-1">ADVERTISEMENT</p>
        <p className="text-slate-300 text-[10px] uppercase">Google AdSense Slot {slot || 'XXXXXX'}</p>
      </div>
    </div>
  );
};

export default AdPlaceholder;
