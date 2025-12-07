// Proxy handler for Better Auth API routes
// Forwards requests to the core backend where the actual Better Auth instance is hosted
// This is used by Expo Router API routes (web only)

function getBaseURL(): string {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL) {
    return process.env.EXPO_PUBLIC_BETTER_AUTH_URL;
  }
  return "http://localhost:8080";
}

export const auth = {
  handler: async (request: Request) => {
    const baseURL = getBaseURL();
    const url = new URL(request.url);
    
    // Extract the path after /api/auth
    const authPath = url.pathname.replace(/^\/api\/auth/, "");
    const targetURL = `${baseURL}/api/auth${authPath}${url.search}`;
    
    // Forward the request to the core backend
    const forwardedRequest = new Request(targetURL, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" 
        ? await request.clone().arrayBuffer() 
        : undefined,
    });
    
    try {
      const response = await fetch(forwardedRequest);
      const responseHeaders = new Headers(response.headers);
      
      // Copy cookies from the backend response
      const setCookie = responseHeaders.get("set-cookie");
      if (setCookie) {
        responseHeaders.set("set-cookie", setCookie);
      }
      
      return new Response(await response.arrayBuffer(), {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("[Auth Proxy] Error forwarding request:", error);
      return new Response(
        JSON.stringify({ error: "Failed to connect to auth server" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};

