import axios from 'axios';

// In production: set VITE_API_URL to your Render backend URL
// In development: proxied via Vite config to localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE });

// Attach stored session ID to every request
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('smartshop_session') || generateSession();
  config.headers['x-session-id'] = sessionId;
  return config;
});

function generateSession() {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('smartshop_session', id);
  return id;
}

export async function searchProducts(params) {
  const { data } = await api.get('/search', { params });
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function saveProfile(profile) {
  const { data } = await api.post('/profile', profile);
  return data;
}

export async function compareProduct(query) {
  const { data } = await api.get('/compare', { params: { q: query } });
  return data;
}

export async function getHealth() {
  const { data } = await api.get('/health');
  return data;
}
