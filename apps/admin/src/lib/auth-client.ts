import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { useState, useEffect } from "react";

const BETTER_AUTH_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080";

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  plugins: [
    adminClient()
  ],
});

// Create useSession hook using React hooks
export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSession = async () => {
    try {
      setIsPending(true);
      const result = await authClient.getSession();
      setSession(result.data);
      setError(null);
    } catch (err) {
      setError(err);
      setSession(null);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Removed polling - Better Auth client handles session updates automatically
  }, []);

  return {
    data: session,
    isPending,
    error,
    refetch: fetchSession,
  };
};

