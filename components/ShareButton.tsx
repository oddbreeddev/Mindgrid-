import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Share2, Link as LinkIcon, Twitter, Facebook, MessageCircle, X as CloseIcon } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: 'icon' | 'full' | 'outline' | 'ghost';
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url = window.location.href, 
  variant = 'icon',
  className = ''
}) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, [open]);

  const handleMainAction = async () => {
    if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {}
    }
    setOpen(!open);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}: ${text}\n${url}`);
      showToast('Copied to your clipboard!', 'success');
      setOpen(false);
    } catch (e) {
      showToast('Could not copy', 'error');
    }
  };

  const linkStyles = "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium";
  
  const vStyles = {
    icon: `w-10 h-10 bg-white/5 text-gray-400 hover:text-white rounded-xl`,
    ghost: `text-gray-500 hover:text-blue-500 text-sm`,
    outline: `border border-white/10 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold`,
    full: `bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl text-xs font-bold shadow-lg`
  };

  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(`${title}: ${text}`);

  return (
    <div className="relative inline-block" ref={ref}>
      <button onClick={handleMainAction} className={`flex items-center justify-center transition-all active:scale-95 ${vStyles[variant]} ${className}`}>
        <Share2 size={16} className={variant !== 'icon' ? 'mr-2' : ''} />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      {open && (
        <div className="absolute bottom-full mb-3 right-0 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-up">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Send To</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><CloseIcon size={12} /></button>
          </div>
          <div className="space-y-1">
            <a href={`https://api.whatsapp.com/send?text=${encText}%20${encUrl}`} target="_blank" rel="noreferrer" className={linkStyles}>
              <MessageCircle size={16} className="text-emerald-500" /> WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`} target="_blank" rel="noreferrer" className={linkStyles}>
              <Twitter size={16} className="text-blue-400" /> Twitter (X)
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`} target="_blank" rel="noreferrer" className={linkStyles}>
              <Facebook size={16} className="text-indigo-500" /> Facebook
            </a>
            <button onClick={copy} className={`w-full ${linkStyles}`}>
              <LinkIcon size={16} className="text-gray-500" /> Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;