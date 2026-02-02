import React, { useEffect } from 'react';

interface AdPlaceholderProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ 
  slot, 
  format = 'auto', 
  className,
  style = { display: 'block' }
}) => {
  useEffect(() => {
    // Only attempt to push if we are in a browser environment and not in development (optional check)
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [slot]); // Re-run if slot changes

  // If no slot is provided, show the placeholder style
  if (!slot) {
    return (
      <div className={`bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-4 min-h-[100px] ${className}`}>
        <div className="text-center">
          <p className="text-slate-400 text-xs font-mono mb-1">ADVERTISEMENT</p>
          <p className="text-slate-300 text-[10px] uppercase">Slot ID Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container overflow-hidden rounded-lg ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-5345604333370357"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdPlaceholder;