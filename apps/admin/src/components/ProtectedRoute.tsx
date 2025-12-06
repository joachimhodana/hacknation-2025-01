import { useNavigate } from "react-router-dom";
import { authClient, useSession } from "@/lib/auth-client";
import { Login } from "@/pages/Login/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { data: session, isPending, error } = useSession();

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's an error or no session, show login
  if (error || !session?.user) {
    return <Login />;
  }

  // Check if user has admin role
  const userRole = session.user.role;
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You do not have admin privileges to access this page.
          </p>
          <button
            onClick={async () => {
              await authClient.signOut();
              navigate("/login");
            }}
            className="text-blue-600 hover:underline"
          >
            Sign out and try a different account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

