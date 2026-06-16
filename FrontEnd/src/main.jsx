import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Global fetch interceptor to handle 401 (Unauthorized) responses
 * Automatically clears invalid tokens and redirects to login page
 */
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    if (response.status === 401) {
      // Token is invalid/expired - clear auth data
      console.warn('[Auth] Received 401 - clearing invalid token and redirecting to login');
      localStorage.removeItem('comaes_user');
      localStorage.removeItem('comaes_token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return response;
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
