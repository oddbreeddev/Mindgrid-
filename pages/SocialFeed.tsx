
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSocialPosts, createSocialPost, toggleLikePost, checkIfPostLiked } from '../services/dataService';
import { db } from '../src/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface Post {
  id: string;
  user_id: string;
  user_email: string;
  content: string;
  likes_count?: number;
  created_at: any;
}

const PostItem: React.FC<{ post: Post; user: any; idx: number; formatTime: (t: any) => string; getUserInitials: (e: string) => string }> = ({ post, user, idx, formatTime, getUserInitials }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  useEffect(() => {
    setLikesCount(post.likes_count || 0);
  }, [post.likes_count]);

  useEffect(() => {
    if (user) {
      checkIfPostLiked(post.id, user.uid).then(setIsLiked);
    }
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;
    const result = await toggleLikePost(post.id, user.uid, post.user_id);
    if (result) {
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
    }
  };

  return (
    <div 
      className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/[0.08] transition-all duration-300 animate-in group"
      style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs shrink-0">
          {getUserInitials(post.user_email)}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white">{post.user_email.split('@')[0]}</span>
              <span className="text-gray-600 text-[10px] font-bold">@{post.user_email.substring(0, 4)}...</span>
              <span className="text-gray-600 text-[10px]">•</span>
              <span className="text-gray-600 text-[10px]">{formatTime(post.created_at)}</span>
            </div>
            <button className="text-gray-600 hover:text-white transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {post.content}
          </p>
          <div className="flex items-center gap-8 text-gray-600">
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors text-xs font-bold">
              <MessageSquare size={14} /> 0
            </button>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors text-xs font-bold ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /> {likesCount}
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors text-xs font-bold">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialFeed: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to realtime updates using Firestore onSnapshot
    const q = query(
      collection(db, 'social_posts'),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || isPosting) return;

    setIsPosting(true);
    try {
      await createSocialPost(user.uid, user.email || 'Anonymous', content.trim());
      setContent('');
      showToast('Post beamed to the Grid!', 'success');
    } catch (err) {
      showToast('Failed to broadcast post.', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'now';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen bg-[#050505]">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-8 animate-in">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Scholars <span className="text-blue-500">Feed</span></h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Naija Student Intelligence Hub</p>
        </div>
        <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
          <Sparkles size={18} />
        </div>
      </div>

      {/* Composer */}
      <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 mb-10 shadow-2xl animate-in" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handlePost} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-500 font-black shrink-0">
              {getUserInitials(user?.email || '??')}
            </div>
            <textarea
              placeholder="What's the buzz, Scholar?"
              className="flex-grow bg-transparent border-none outline-none text-white resize-none text-lg placeholder:text-gray-600 mt-2 min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handlePost(e);
              }}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-4 text-gray-500">
              <button type="button" className="hover:text-blue-500 transition-colors"><MessageSquare size={18} /></button>
              <button type="button" className="hover:text-blue-500 transition-colors"><Share2 size={18} /></button>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isPosting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              {isPosting ? 'Sending...' : 'Broadcast'}
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      <div className="space-y-6" ref={scrollRef}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 h-40 rounded-[2.5rem] animate-pulse border border-white/5"></div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post, idx) => (
            <PostItem 
              key={post.id} 
              post={post} 
              user={user} 
              idx={idx} 
              formatTime={formatTime} 
              getUserInitials={getUserInitials} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
            <MessageSquare size={48} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">The Grid is quiet. Start the buzz!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
