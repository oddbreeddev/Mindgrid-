
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError } from '../src/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  loading: boolean;
  setAdminStatus: (status: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for secret admin session in storage
    const adminSession = localStorage.getItem('mg_admin_vault');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.uid);
        // Check if user is the default admin
        if (currentUser.email === 'aminudanielkaltungo@gmail.com') {
          setIsAdmin(true);
          localStorage.setItem('mg_admin_vault', 'true');
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        localStorage.removeItem('mg_admin_vault');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Profile doesn't exist, create it
        const newProfile = { 
          updated_at: new Date().toISOString(),
          role: userId === auth.currentUser?.uid && auth.currentUser?.email === 'aminudanielkaltungo@gmail.com' ? 'admin' : 'user'
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      // handleFirestoreError(err, 'get', `profiles/${userId}`);
    }
  };

  const setAdminStatus = (status: boolean) => {
    if (status) localStorage.setItem('mg_admin_vault', 'true');
    else localStorage.removeItem('mg_admin_vault');
    setIsAdmin(status);
  };

  const signOut = async () => {
    localStorage.removeItem('mg_admin_vault');
    setIsAdmin(false);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, setAdminStatus, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
