import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./utils/lib";

const publicRoutes = ["/signup", "/login"];
const protectedRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const isRouteProtected = protectedRoutes.includes(currentPath);
  const isRoutePublic = publicRoutes.includes(currentPath);
  const currentSession = await updateSession(request);

  if (isRouteProtected && !currentSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isRoutePublic && currentSession) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}
