import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { getUserAttendeeData, saveUserAttendeeData } from '../services/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!auth);
  const [calendarToken, setCalendarToken] = useState(null);

  useEffect(() => {
    if (!auth) return;

    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserAttendeeData(u.uid);
        if (p) {
          setProfile(p);
        } else {
          // Initialize empty profile
          const defaultProfile = {
            name: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            role: '',
            interests: [],
            experienceLevel: '',
            bookmarkedSessions: [],
            onboardingComplete: false,
            createdAt: new Date().toISOString()
          };
          setProfile(defaultProfile);
          await saveUserAttendeeData(u.uid, defaultProfile);
        }
      } else {
        setProfile(null);
        setCalendarToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCalendarToken(credential.accessToken);
        sessionStorage.setItem('calendarToken', credential.accessToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => auth.signOut();

  const updateProfile = async (updates) => {
    const p = { ...profile, ...updates };
    setProfile(p);
    if (user) await saveUserAttendeeData(user.uid, p);
  };

  const checkToken = () => {
    return calendarToken || sessionStorage.getItem('calendarToken');
  }

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    updateProfile,
    getCalendarToken: checkToken
  };

  if (!auth) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ef4444' }}>Missing API Keys!</h1>
        <p>Please rename <code>.env.example</code> to <code>.env</code> and fill in your Firebase and Gemini credentials to start the application.</p>
        <p>You can find the keys required in the generated .env.example file.</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
