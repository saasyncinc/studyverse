// StudyVerse API Configuration
// Handles both development and production environments

// Get API URL from environment variable or use fallback
const getApiUrl = () => {
  // In production, VITE_API_URL will be set by Render from backend service
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    // Ensure URL has proper protocol
    if (envApiUrl.startsWith('http')) {
      return envApiUrl;
    } else {
      return `https://${envApiUrl}`;
    }
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Production fallback - try same domain first
  const currentDomain = window.location.origin;
  return currentDomain;
};

export const API_BASE_URL = getApiUrl();

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    MODE: import.meta.env.MODE
  });
}

