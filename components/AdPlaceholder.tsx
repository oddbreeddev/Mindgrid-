import React, { useEffect, useRef } from 'react';

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
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    
    const tryPush = () => {
      // Check if the component is still mounted and the container has width
      if (adRef.current) {
        const width = adRef.current.offsetWidth;
        
        if (width > 0) {
          try {
            if (typeof window !== 'undefined') {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          } catch (e) {
            console.error("AdSense push error:", e);
          }
        } else {
          // If width is 0, wait and try again. This happens during initial render or animations.
          timer = setTimeout(tryPush, 100);
        }
      }
    };

    if (slot) {
      tryPush();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [slot]);

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
    <div ref={adRef} className={`ad-container overflow-hidden rounded-lg ${className}`}>
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