const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080";

/**
 * Build full URL for backend image/asset
 * If url is already a full URL (starts with http:// or https://), return it as is
 * Otherwise, prepend API_BASE_URL
 */
export function getBackendImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  // Build full URL with API_BASE_URL
  return `${API_BASE_URL}/${cleanUrl}`;
}
