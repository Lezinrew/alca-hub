// Centralized environment-aware backend URL resolution for React
// Prefer VITE_API_URL when provided. On Android emulator/webview, use 10.0.2.2 to reach host localhost.
const fromEnv = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : undefined;

const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
const isCapacitor = typeof window !== 'undefined' && typeof window.Capacitor !== 'undefined';

// Configurações de host para diferentes ambientes
const androidHost = import.meta.env.VITE_ANDROID_HOST || 'http://10.0.2.2:8000';
const localHost = import.meta.env.VITE_LOCAL_HOST || 'http://localhost:8000';

export const API_URL = fromEnv || ((isAndroid && isCapacitor) ? androidHost : localHost);


