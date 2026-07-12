import middleware from "next-auth/middleware";

export default middleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expense/:path*",
    "/settle/:path*",
    "/activity/:path*",
    "/roommates/:path*",
    "/invite/:path*",
    "/apartment/:path*"
  ]
};
