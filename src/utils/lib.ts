import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { User } from "~/types/global";

const key = new TextEncoder().encode(process.env.TOKEN_SECRET);

interface Payload extends JWTPayload {
  user: User;
  expires: Date;
  iat: number;
  exp: number;
}

export async function encrypt(payload: Payload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr")
    .sign(key);
}

export async function decrypt(input: string): Promise<Payload> {
  const { payload } = (await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })) as { payload: Payload };

  return payload;
}

export async function updateSession(
  request: NextRequest,
): Promise<Payload | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;

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

export async function getSession(): Promise<Payload | null> {
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
  return currentSession?.user;
}

export async function createSession(user: Partial<User>) {
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires } as Payload);
  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });
}
