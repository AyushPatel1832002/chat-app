import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-prod";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const getAuthUser = async () => {
  const cookieStore = await cookies();
  let token = cookieStore.get("token")?.value;

  if (!token) {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  return verifyToken(token);
};
