import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPaymentApiRoute = nextUrl.pathname.startsWith("/api/payment");
    const isAuthRoute = ["/auth/login", "/auth/invite", "/"].includes(nextUrl.pathname);
    const isPublicRoute = nextUrl.pathname === "/"; // Only landing page is public

    if (isApiAuthRoute || isPaymentApiRoute) return null;

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    // Role-based protection
    if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/teacher") && userRole !== "TEACHER" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return null;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
