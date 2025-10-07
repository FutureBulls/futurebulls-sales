import { NextResponse } from "next/server";
import { getUserSession } from "@/app/services/auth.service"; // Adjust import according to your structure

const protectedRoutes = ["/dashboard/payments", "/dashboard/users"];
const adminRoutes = ["/dashboard/users"]; // Example admin-only routes
const authUrls = ["/auth/signin"];

const isProtectedRoute = (pathname: string): boolean => {
  if (protectedRoutes.includes(pathname)) {
    return true;
  }

  const dynamicRoutePattern = /^\/(dashboard)(\/.*)?$/;
  if (dynamicRoutePattern.test(pathname)) {
    return true;
  }

  return false;
};

const isAdminRoute = (pathname: string): boolean => {
  return adminRoutes.includes(pathname);
};

export default async function middleware(req: any) {
  const pathname = req.nextUrl.pathname;

  // Fetch session data
  let session: any;
  const cookieName =
    process.env.APP_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  if (req.cookies.get(cookieName)) {
    try {
      session = await getUserSession(req);
    } catch (error) {
      console.error("Failed to fetch user session:", error);
    }
  }
  const isAuthenticated = !!session;
  const isAdmin =
    typeof session?.role === "string" && session?.role.includes("ADMIN");

  if (isAuthenticated && authUrls.includes(pathname)) {
    const absoluteUrl = new URL("/dashboard", req.nextUrl.origin);
    return NextResponse.redirect(absoluteUrl.toString());
  }

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl.toString());
  }

  if (isAuthenticated && isAdminRoute(pathname) && !isAdmin) {
    // Redirect non-admin users from admin-only routes
    const errorUrl = new URL("/auth/unauthorized", req.nextUrl.origin); // or any other page
    return NextResponse.redirect(errorUrl.toString());
  }

  return NextResponse.next();
}
