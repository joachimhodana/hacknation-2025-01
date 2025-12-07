import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { Icon } from "@iconify/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
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

  // Show loading only on initial session check, not during form submission
  if (isPending && !hasCheckedSession && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
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

      // Success - use window.location for reliable redirect
      // This ensures the page fully reloads with the new session
      window.location.href = "/";
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
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="BydGO Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Icon icon="solar:letter-bold-duotone" className="h-4 w-4" />
                Email
              </Label>
              <div className="relative">
                <Icon 
                  icon="solar:letter-bold-duotone" 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Icon icon="solar:lock-password-bold-duotone" className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Icon 
                  icon="solar:lock-password-bold-duotone" 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2">
                <Icon icon="solar:danger-triangle-bold-duotone" className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Icon icon="solar:login-3-bold-duotone" className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
