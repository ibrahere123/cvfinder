"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"

// List of public paths anyone can access
const publicPaths = ["/", "/results"];

// List of paths that only unauthenticated users should access
const authPaths = ["/auth/signin", "/auth/signup"];

// List of paths that require email verification
const verificationRequiredPaths = ["/settings/profile", "/connect"];

// List of paths that require authentication
const protectedPaths = ["/dashboard"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for loading to finish

    if (user) {
      // Redirect authenticated users away from sign-in or sign-up pages
      if (authPaths.includes(pathname)) {
        router.replace("/dashboard");
        return;
      }

      // Redirect unverified users from protected routes requiring verification
      if (!user.emailVerified && verificationRequiredPaths.some(path => pathname.startsWith(path))) {
        toast.error("Please verify your email to access this page");
        router.replace("/auth/verify-email");
        return;
      }

      // Allow access to protected paths for authenticated users
      if (protectedPaths.some(path => pathname.startsWith(path))) {
        return;
      }
    } else {
      // Redirect unauthenticated users from protected routes
      const isPublicRoute = publicPaths.includes(pathname);
      const isAuthRoute = authPaths.includes(pathname);
      if (!isPublicRoute && !isAuthRoute) {
        router.replace("/auth/signin");
        return;
      }
    }
  }, [user, loading, pathname]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  // Allow access to protected paths for logged-in users
  if (user && protectedPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  // Allow access to public paths
  if (publicPaths.includes(pathname) || authPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // Block access to protected routes for unauthenticated users
  if (!user) {
    return null;
  }

  // Block access to verification-required routes for unverified users
  if (!user.emailVerified && verificationRequiredPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  return <>{children}</>;
}
