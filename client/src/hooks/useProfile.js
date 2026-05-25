import { useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../api';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prefer localStorage for instant load, sync with server
    const local = localStorage.getItem('smartshop_profile');
    if (local) {
      setProfile(JSON.parse(local));
      setLoading(false);
    }
    getProfile()
      .then((p) => {
        setProfile(p);
        localStorage.setItem('smartshop_profile', JSON.stringify(p));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (updates) => {
    const merged = { ...profile, ...updates };
    setProfile(merged);
    localStorage.setItem('smartshop_profile', JSON.stringify(merged));
    try {
      await saveProfile(merged);
    } catch (e) {
      console.error('Failed to sync profile to server:', e.message);
    }
    return merged;
  };

  return { profile, loading, updateProfile };
}
