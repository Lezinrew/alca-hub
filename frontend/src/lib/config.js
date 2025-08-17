// Centralized environment-aware backend URL resolution for React
export const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : process.env.REACT_APP_BACKEND_URL;


