const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080";

/**
 * Build full URL for backend image/asset
 * If url is already a full URL (starts with http:// or https://), return it as is
 * Otherwise, prepend API_BASE_URL
 * Backend serves static files from /resources prefix via staticPlugin
 */
export function getBackendImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Backend returns URLs like /resources/avatars/... or resources/avatars/...
  // staticPlugin serves them at /resources/... prefix
  // So we need to ensure the URL starts with /resources
  let cleanUrl = url;
  
  // If URL doesn't start with /resources, add it
  if (!cleanUrl.startsWith('/resources') && !cleanUrl.startsWith('resources/')) {
    // If it starts with /, remove it and add /resources
    if (cleanUrl.startsWith('/')) {
      cleanUrl = `/resources${cleanUrl}`;
    } else {
      cleanUrl = `/resources/${cleanUrl}`;
    }
  } else if (cleanUrl.startsWith('resources/')) {
    // If it starts with resources/ (no leading slash), add leading slash
    cleanUrl = `/${cleanUrl}`;
  }
  
  // Build full URL with API_BASE_URL
  return `${API_BASE_URL}${cleanUrl}`;
}
