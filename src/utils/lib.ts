import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const key = new TextEncoder().encode(process.env.TOKEN_SECRET);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  //update the expire time
  const parsed = await decrypt(session);
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  cookieStore.set("session", await encrypt(parsed), {
    expires,
    httpOnly: true,
  });

  return getSession();
}

export async function getSession() {
  const cookieSession = await cookies();
  const session = cookieSession.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getCurrentUser() {
  const currentSession = await getSession();
  return currentSession.user;
}
