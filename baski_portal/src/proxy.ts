import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const rawCookie = request.headers.get("cookie") || "";
  const session =
    request.cookies.get("baski_session") ||
    rawCookie.includes("baski_session=true");
  const role = request.cookies.get("user_role")?.value;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith("/duzenleme-paneli") ||
      pathname.startsWith("/nobetci-atama") ||
      pathname.startsWith("/yetki-yonetimi")) &&
    !session
  ) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("user_role");
    response.cookies.delete("user_name");
    response.cookies.delete("bridge_id");
    response.cookies.delete("user_unit_name");

    return response;
  }
  if (pathname.startsWith("/duzenleme-paneli") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/nobetci-atama", request.url));
  }

  if (pathname === "/login" && session) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/duzenleme-paneli", request.url));
    } else if (role === "UNIT_MANAGER") {
      return NextResponse.redirect(new URL("/nobetci-atama", request.url));
    } else {
      return NextResponse.redirect(new URL("/yetki-yonetimi ", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/duzenleme-paneli/:path*",
    "/nobetci-atama/:path*",
    "/yetki-yonetimi/:path*",
    "/login",
  ],
};
