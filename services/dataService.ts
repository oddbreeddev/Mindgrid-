
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ, MOCK_CURATED_ARTICLES } from '../data/staticData';
import { fetchRealtimeNews } from './geminiService';
import { db, handleFirestoreError } from '../src/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  setDoc, 
  doc, 
  getDoc,
  getCountFromServer,
  updateDoc,
  increment,
  deleteDoc,
  where
} from 'firebase/firestore';

/**
 * MindGrid Data Service
 */

// Social Feed Functions
export const getSocialPosts = async () => {
  try {
    const q = query(
      collection(db, 'social_posts'), 
      orderBy('created_at', 'desc'), 
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Failed to fetch social posts:", e);
    // handleFirestoreError(e, 'list', 'social_posts');
    return [];
  }
};

export const createSocialPost = async (userId: string, email: string, content: string) => {
  try {
    const docRef = await addDoc(collection(db, 'social_posts'), {
      user_id: userId,
      user_email: email,
      content: content,
      created_at: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (e) {
    console.error("Failed to create post:", e);
    // handleFirestoreError(e, 'create', 'social_posts');
    throw e;
  }
};

export const subscribeToNewsletter = async (email: string, interests: string[], platform: string = 'email') => {
  try {
    const emailKey = email.trim().toLowerCase();
    await setDoc(doc(db, 'newsletter_subscribers', emailKey), { 
      email: emailKey, 
      interests: interests.length > 0 ? interests : ['General'], 
      platform,
      created_at: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (e: any) {
    console.error("Newsletter Subscription Exception:", e);
    return { success: false, error: e.message || 'Unknown network error' };
  }
};

// Lesson Caching Functions
export const getCachedLesson = async (subject: string, topic: string) => {
  try {
    const key = `${subject}:${topic}`.toLowerCase().replace(/\//g, '_');
    const docSnap = await getDoc(doc(db, 'lessons_cache', key));
    
    if (docSnap.exists()) {
      return docSnap.data().content;
    }
    return null;
  } catch (e) {
    console.error("Cache Fetch Error:", e);
    return null;
  }
};

export const saveLessonToCache = async (subject: string, topic: string, content: any) => {
  try {
    const key = `${subject}:${topic}`.toLowerCase().replace(/\//g, '_');
    await setDoc(doc(db, 'lessons_cache', key), {
      content: content,
      updated_at: serverTimestamp()
    });
  } catch (e) {
    console.error("Cache Save Error:", e);
  }
};

// Admin Services
export const logBroadcast = async (title: string, content: string, reach: number) => {
  try {
    const docRef = await addDoc(collection(db, 'broadcast_logs'), {
      title,
      content,
      reach,
      sent_at: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (e) { return null; }
};

export const getBroadcastHistory = async () => {
  try {
    const q = query(collection(db, 'broadcast_logs'), orderBy('sent_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const getAllSubscribers = async () => {
  try {
    const q = query(collection(db, 'newsletter_subscribers'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const getAdminDashboardStats = async () => {
  try {
    const [subscribers, profiles, records, articles] = await Promise.all([
      getCountFromServer(collection(db, 'newsletter_subscribers')),
      getCountFromServer(collection(db, 'profiles')),
      getCountFromServer(collection(db, 'cgpa_records')),
      getCountFromServer(collection(db, 'curated_articles'))
    ]);
    return {
      subscribers: subscribers.data().count || 0,
      students: profiles.data().count || 0,
      academicOperations: records.data().count || 0,
      knowledgeEntries: (articles.data().count || 0) + MOCK_CURATED_ARTICLES.length
    };
  } catch (e) { return { subscribers: 0, students: 0, academicOperations: 0, knowledgeEntries: 0 }; }
};

export const downloadSubscribersCSV = (subscribers: any[]) => {
  const headers = ['Email', 'Platform', 'Interests', 'Joined At'];
  const rows = subscribers.map(s => [
    s.email,
    s.platform,
    s.interests?.join('; '),
    s.created_at ? new Date(s.created_at.seconds * 1000).toLocaleDateString() : 'N/A'
  ]);
  
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mindgrid_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getNews = async (category: string = 'All') => {
  try {
    const realtimeNews = await fetchRealtimeNews(category);
    if (realtimeNews && realtimeNews.length > 0) return realtimeNews;
  } catch (e) {}
  if (category === 'All') return MOCK_NEWS;
  return MOCK_NEWS.filter(news => news.category.toLowerCase() === category.toLowerCase());
};

export const getCuratedArticles = async (status: string = 'approved') => {
  try {
    const q = query(
      collection(db, 'curated_articles'), 
      where('status', '==', status),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return status === 'approved' ? [...data, ...MOCK_CURATED_ARTICLES] : data;
  } catch (e) { 
    console.error("Fetch Articles Error:", e);
    return status === 'approved' ? MOCK_CURATED_ARTICLES : []; 
  }
};

export const saveCuratedArticle = async (article: any, userEmail?: string, status: string = 'approved', authorUid?: string) => {
  try {
    const docRef = await addDoc(collection(db, 'curated_articles'), {
      title: article.title,
      excerpt: article.excerpt || article.content.substring(0, 150) + '...',
      content: article.content,
      category: article.category || 'General',
      suggested_by: userEmail || 'Anonymous Student',
      author_uid: authorUid || null,
      image_id: article.image_id || Math.floor(Math.random() * 1000).toString(),
      likes_count: 0,
      status: status,
      created_at: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (e) { 
    return { ...article, id: Date.now().toString(), suggested_by: userEmail || 'Anonymous Student', created_at: new Date().toISOString(), likes_count: 0, status: status }; 
  }
};

export const updateArticleStatus = async (articleId: string, status: 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, 'curated_articles', articleId), {
      status: status,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (e) {
    console.error("Update Status Error:", e);
    return false;
  }
};

export const toggleLikeArticle = async (articleId: string, userId: string, authorUid?: string) => {
  try {
    const likeRef = doc(db, 'article_likes', `${userId}_${articleId}`);
    const likeDoc = await getDoc(likeRef);
    
    const articleRef = doc(db, 'curated_articles', articleId);
    
    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(articleRef, { likes_count: increment(-1) });
      return { liked: false };
    } else {
      await setDoc(likeRef, {
        user_id: userId,
        article_id: articleId,
        created_at: serverTimestamp()
      });
      await updateDoc(articleRef, { likes_count: increment(1) });
      
      // Notify author
      if (authorUid && authorUid !== userId) {
        await createNotification(authorUid, 'New Like!', 'Someone liked your article.', 'like');
      }
      
      return { liked: true };
    }
  } catch (e) {
    console.error("Like toggle failed:", e);
    return null;
  }
};

export const checkIfLiked = async (articleId: string, userId: string) => {
  try {
    const likeRef = doc(db, 'article_likes', `${userId}_${articleId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (e) { return false; }
};

export const deleteCuratedArticle = async (articleId: string) => {
  try {
    await deleteDoc(doc(db, 'curated_articles', articleId));
    return true;
  } catch (e) {
    console.error("Delete Article Error:", e);
    return false;
  }
};

export const getCareers = async (query: string = '') => {
  if (!query) return MOCK_CAREERS;
  const lowerQuery = query.toLowerCase();
  return MOCK_CAREERS.filter(job => 
    job.title.toLowerCase().includes(lowerQuery) || 
    job.company.toLowerCase().includes(lowerQuery) ||
    job.description.toLowerCase().includes(lowerQuery)
  );
};

export const getSocialBuzz = async () => MOCK_BUZZ;

// Profile Services
export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'profiles', userId));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (e) { return null; }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    await setDoc(doc(db, 'profiles', userId), {
      ...data,
      updated_at: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (e) { return false; }
};

// Notification Services
export const getNotifications = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const createNotification = async (userId: string, title: string, message: string, type: 'like' | 'new_article' | 'system') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: serverTimestamp()
    });
  } catch (e) { console.error("Notification creation failed", e); }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (e) {}
};

// Study Group Services
export const getStudyGroups = async () => {
  try {
    const q = query(collection(db, 'study_groups'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const getGroupMessages = async (groupId: string) => {
  try {
    const q = query(
      collection(db, 'study_groups', groupId, 'messages'),
      orderBy('created_at', 'asc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const sendGroupMessage = async (groupId: string, userId: string, userName: string, content: string, isAi: boolean = false) => {
  try {
    const docRef = await addDoc(collection(db, 'study_groups', groupId, 'messages'), {
      group_id: groupId,
      user_id: userId,
      user_name: userName,
      content,
      is_ai: isAi,
      created_at: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (e) { return null; }
};

// Post Like Services
export const toggleLikePost = async (postId: string, userId: string, authorUid: string) => {
  try {
    const likeRef = doc(db, 'post_likes', `${userId}_${postId}`);
    const likeDoc = await getDoc(likeRef);
    
    const postRef = doc(db, 'social_posts', postId);
    
    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likes_count: increment(-1) });
      return { liked: false };
    } else {
      await setDoc(likeRef, {
        user_id: userId,
        post_id: postId,
        created_at: serverTimestamp()
      });
      await updateDoc(postRef, { likes_count: increment(1) });
      
      if (authorUid !== userId) {
        await createNotification(authorUid, 'Post Liked!', 'Someone liked your post in the feed.', 'like');
      }
      
      return { liked: true };
    }
  } catch (e) { return null; }
};

export const checkIfPostLiked = async (postId: string, userId: string) => {
  try {
    const likeRef = doc(db, 'post_likes', `${userId}_${postId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (e) { return false; }
};

// Admin Seeding
export const seedStudyGroups = async () => {
  try {
    const groups = [
      { name: 'Computer Science', department: 'Science', description: 'Discuss algorithms, coding, and tech.' },
      { name: 'Mechanical Engineering', department: 'Engineering', description: 'Thermodynamics and machine design.' },
      { name: 'Economics', department: 'Social Sciences', description: 'Macro and micro economic theories.' },
      { name: 'Medicine', department: 'Health Sciences', description: 'Clinical discussions and anatomy.' }
    ];

    for (const group of groups) {
      await addDoc(collection(db, 'study_groups'), {
        ...group,
        created_at: serverTimestamp()
      });
    }
    return true;
  } catch (e) {
    console.error("Seeding failed:", e);
    return false;
  }
};
