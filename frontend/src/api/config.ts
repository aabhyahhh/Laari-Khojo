// Use environment variable if available, otherwise fallback to development/production logic
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : 'https://laari-khojo-backend.onrender.com');

export { API_URL };