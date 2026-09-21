import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  user: {
    id: string;
    name: string;
  };
};

const sessionKey = "session";
const secretKey = process.env.SESSION_SECRET_KEY;

if (!secretKey) {
  throw new Error("SESSION_SECRET_KEY is not configured");
}

const encodedKey = new TextEncoder().encode(secretKey);

export const createSession = async (payload: Session) => {
  const TOTAL_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;

  const expiredAt = new Date(Date.now() + TOTAL_EXPIRATION_TIME);

  const session = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const cookieStore = await cookies();

  cookieStore.set(sessionKey, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiredAt,
    sameSite: "lax",
    path: "/",
  });
};

export const getSession = async () => {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(sessionKey)?.value;

  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;
  } catch (error) {
    console.error("Failed to verify the session", error);
    redirect("/auth/signin");
  }
};

export const deleteSession = async () => {
  (await cookies()).delete(sessionKey);
};
