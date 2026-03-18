
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ, MOCK_CURATED_ARTICLES } from '../data/staticData';
import { StudyRoom } from '../types';
import { fetchRealtimeNews, fetchTrendingSocialMedia, curateDailyLibraryArticles, fetchRealtimeJobs } from './geminiService';
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
      likes_count: 0,
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
    // Check if we have news for today in the archive
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'news_archive'),
      where('date', '==', today),
      limit(20)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const archivedNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (category === 'All') return archivedNews;
      return archivedNews.filter((n: any) => n.category?.toLowerCase() === category.toLowerCase());
    }

    // If no news for today, fetch from Gemini
    const realtimeNews = await fetchRealtimeNews(category);
    if (realtimeNews && realtimeNews.length > 0) {
      // Save to archive for today
      for (const item of realtimeNews) {
        await addDoc(collection(db, 'news_archive'), {
          ...item,
          date: today,
          created_at: serverTimestamp()
        });
      }
      return realtimeNews;
    }
  } catch (e) {
    console.error("News Fetch Error:", e);
  }
  
  // No mock fallback as per user request
  return [];
};

export const getSocialBuzz = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'trends_archive'),
      where('date', '==', today)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const trends = await fetchTrendingSocialMedia();
    if (trends && trends.length > 0) {
      for (const trend of trends) {
        await addDoc(collection(db, 'trends_archive'), {
          ...trend,
          date: today,
          created_at: serverTimestamp()
        });
      }
      return trends;
    }
  } catch (e) {
    console.error("Trends Fetch Error:", e);
  }
  return []; // No mock fallback
};

export const getCuratedArticles = async (status: string = 'approved') => {
  try {
    const q = query(
      collection(db, 'curated_articles'), 
      where('status', '==', status),
      orderBy('created_at', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // If it's for the library (approved) and we have fewer than 3 articles for today
    if (status === 'approved') {
      const today = new Date().toISOString().split('T')[0];
      const todayArticles = data.filter((a: any) => {
        const createdDate = a.created_at?.toDate ? a.created_at.toDate().toISOString().split('T')[0] : '';
        return createdDate === today;
      });

      if (todayArticles.length < 3) {
        const newArticles = await curateDailyLibraryArticles();
        if (newArticles && newArticles.length > 0) {
          for (const article of newArticles) {
            await saveCuratedArticle(article, 'MindGrid AI', 'approved', 'system');
          }
          // Refresh data
          const refreshedSnapshot = await getDocs(q);
          data = refreshedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }
    }

    return data.length > 0 ? data : MOCK_CURATED_ARTICLES;
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

export const getCareers = async (queryStr: string = '') => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // If it's a generic search (empty query), check archive for today
    if (!queryStr) {
      const q = query(
        collection(db, 'careers_archive'),
        where('date', '==', today),
        limit(20)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }

    // Fetch from Gemini
    const realtimeJobs = await fetchRealtimeJobs(queryStr);
    
    if (realtimeJobs && realtimeJobs.length > 0) {
      // If it was a generic search, archive these for today
      if (!queryStr) {
        for (const job of realtimeJobs) {
          await addDoc(collection(db, 'careers_archive'), {
            ...job,
            date: today,
            created_at: serverTimestamp()
          });
        }
      }
      return realtimeJobs;
    }
  } catch (e) {
    console.error("Careers Fetch Error:", e);
  }
  
  return []; // No mock fallback
};

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

// Study Room Services
export const getStudyRooms = async (userId: string) => {
  try {
    // Get public rooms
    const publicQ = query(collection(db, 'study_rooms'), where('is_private', '==', false));
    const publicSnapshot = await getDocs(publicQ);
    const publicRooms = publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get private rooms where user is a member
    const privateQ = query(collection(db, 'study_rooms'), where('is_private', '==', true), where('members', 'array-contains', userId));
    const privateSnapshot = await getDocs(privateQ);
    const privateRooms = privateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Combine and remove duplicates
    const allRooms = [...publicRooms, ...privateRooms];
    const uniqueRooms = Array.from(new Map(allRooms.map(item => [item.id, item])).values());
    
    return uniqueRooms;
  } catch (e) { 
    console.error("Fetch Rooms Error:", e);
    return []; 
  }
};

export const createStudyRoom = async (name: string, description: string, isPrivate: boolean, ownerId: string) => {
  try {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const docRef = await addDoc(collection(db, 'study_rooms'), {
      name,
      description,
      owner_id: ownerId,
      is_private: isPrivate,
      join_code: joinCode,
      members: [ownerId],
      created_at: serverTimestamp()
    });
    
    // Create a default "General" topic
    await addDoc(collection(db, 'study_rooms', docRef.id, 'topics'), {
      room_id: docRef.id,
      name: 'General',
      description: 'General discussion for this room.',
      created_at: serverTimestamp()
    });

    return { id: docRef.id, joinCode };
  } catch (e) { return null; }
};

export const joinRoomWithCode = async (joinCode: string, userId: string): Promise<StudyRoom> => {
  try {
    const q = query(collection(db, 'study_rooms'), where('join_code', '==', joinCode.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) throw new Error("Invalid join code");
    
    const roomDoc = snapshot.docs[0];
    const roomData = roomDoc.data() as Omit<StudyRoom, 'id'>;
    
    if (!roomData.members.includes(userId)) {
      await updateDoc(doc(db, 'study_rooms', roomDoc.id), {
        members: [...roomData.members, userId]
      });
    }
    
    return { id: roomDoc.id, ...roomData };
  } catch (e: any) {
    throw e;
  }
};

export const getRoomTopics = async (roomId: string) => {
  try {
    const q = query(collection(db, 'study_rooms', roomId, 'topics'), orderBy('created_at', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
};

export const createRoomTopic = async (roomId: string, name: string, description: string) => {
  try {
    const docRef = await addDoc(collection(db, 'study_rooms', roomId, 'topics'), {
      room_id: roomId,
      name,
      description,
      created_at: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (e) { return null; }
};

export const sendTopicMessage = async (roomId: string, topicId: string, userId: string, userName: string, content: string, isAi: boolean = false) => {
  try {
    const docRef = await addDoc(collection(db, 'study_rooms', roomId, 'topics', topicId, 'messages'), {
      topic_id: topicId,
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
    const rooms = [
      { name: 'Computer Science', description: 'Discuss algorithms, coding, and tech.', is_private: false },
      { name: 'Mechanical Engineering', description: 'Thermodynamics and machine design.', is_private: false },
      { name: 'Economics', description: 'Macro and micro economic theories.', is_private: false },
      { name: 'Medicine', description: 'Clinical discussions and anatomy.', is_private: false }
    ];

    for (const room of rooms) {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const docRef = await addDoc(collection(db, 'study_rooms'), {
        ...room,
        owner_id: 'system',
        join_code: joinCode,
        members: [],
        created_at: serverTimestamp()
      });

      // Add default topics
      const topics = ['General', 'Past Questions', 'Project Help'];
      for (const topicName of topics) {
        await addDoc(collection(db, 'study_rooms', docRef.id, 'topics'), {
          room_id: docRef.id,
          name: topicName,
          description: `${topicName} discussion for ${room.name}`,
          created_at: serverTimestamp()
        });
      }
    }
    return true;
  } catch (e) {
    console.error("Seeding failed:", e);
    return false;
  }
};
