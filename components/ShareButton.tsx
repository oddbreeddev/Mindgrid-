
import React from 'react';
import { useToast } from '../context/ToastContext';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: 'icon' | 'full' | 'outline' | 'ghost';
  iconOnly?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url = window.location.href, 
  className = '', 
  variant = 'icon',
  iconOnly = false
}) => {
  const { showToast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card clicks
    const shareData = { title, text, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          showToast('Sharing failed', 'error');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        const fullShareText = `${title}\n${text}\n${url}`;
        await navigator.clipboard.writeText(fullShareText);
        showToast('Link & info copied to clipboard!', 'success');
      } catch (err) {
        showToast('Failed to copy share info', 'error');
      }
    }
  };

  const baseStyles = "flex items-center justify-center transition-all active:scale-95 shrink-0";
  
  const variants = {
    icon: `w-10 h-10 bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-xl ${className}`,
    ghost: `text-slate-400 hover:text-green-600 text-sm ${className}`,
    outline: `border border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${className}`,
    full: `bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-200 ${className}`
  };

  return (
    <button 
      onClick={handleShare} 
      className={`${baseStyles} ${variants[variant]}`}
      title="Share to Social Media"
    >
      <i className={`fas fa-share-nodes ${!iconOnly && variant !== 'icon' ? 'mr-2' : ''}`}></i>
      {!iconOnly && variant !== 'icon' && <span>Share</span>}
    </button>
  );
};

export default ShareButton;
