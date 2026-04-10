import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('techmart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only auto-redirect on 401 if NOT on an auth endpoint (avoids login page loop)
    if (
      err.response?.status === 401 &&
      !err.config.url.includes('/auth/login') &&
      !err.config.url.includes('/auth/register')
    ) {
      localStorage.removeItem('techmart_token');
      localStorage.removeItem('techmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
