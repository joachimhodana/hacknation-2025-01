const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080";

/**
 * Build full URL for backend image/asset
 * If url is already a full URL (starts with http:// or https://), return it as is
 * Otherwise, prepend API_BASE_URL
 * Backend serves static files from /resources prefix via staticPlugin
 */
export function getBackendImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let cleanUrl = url;
  
  if (!cleanUrl.startsWith('/resources') && !cleanUrl.startsWith('resources/')) {
    if (cleanUrl.startsWith('/')) {
      cleanUrl = `/resources${cleanUrl}`;
    } else {
      cleanUrl = `/resources/${cleanUrl}`;
    }
  } else if (cleanUrl.startsWith('resources/')) {
    cleanUrl = `/${cleanUrl}`;
  }
  
  return `${API_BASE_URL}${cleanUrl}`;
}
