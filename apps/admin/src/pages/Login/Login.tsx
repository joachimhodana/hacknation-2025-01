import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { Route } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending, refetch } = useSession();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Check session once on mount, don't re-check on every session change
  useEffect(() => {
    if (!isPending && !hasCheckedSession) {
      setHasCheckedSession(true);
      if (session?.user?.role === "admin") {
        navigate("/", { replace: true });
      }
    }
  }, [session, isPending, navigate, hasCheckedSession]);

  // Watch for session changes after login to redirect
  useEffect(() => {
    if (session?.user?.role === "admin" && loading) {
      // Session updated after login, redirect
      setLoading(false);
      navigate("/", { replace: true });
    }
  }, [session, loading, navigate]);

  // Show loading only on initial session check, not during form submission
  if (isPending && !hasCheckedSession && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in as admin, show loading while redirecting
  if (session?.user?.role === "admin" && !loading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return; // Prevent double submission
    
    setError(null);
    setLoading(true);

    try {
      // Sign in using Better Auth
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });

      if (result.error) {
        // Handle specific error cases
        if (result.error.status === 403) {
          setError("Access denied. Admin privileges required.");
        } else if (result.error.status === 401) {
          setError("Invalid email or password. Please check your credentials.");
        } else {
          setError(result.error.message || "Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Sign in successful, wait a bit for session to be set, then check role
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Refetch session to update state
      await refetch();
      
      // Get the updated session to check role
      const sessionResult = await authClient.getSession();
      
      // Check if user is admin
      if (sessionResult?.data?.user?.role !== "admin") {
        // Sign out non-admin users
        await authClient.signOut();
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      // Success - the useEffect will handle the redirect when session updates
      // Keep loading state true briefly to show success, then redirect
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Route className="h-8 w-8 text-blue-500" />
            <CardTitle className="text-2xl font-bold text-blue-500">
              BydGO Admin
            </CardTitle>
          </div>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

