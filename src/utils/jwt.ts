import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { env } from "../config";

interface IAuthToken {
  userId: string;
}

export function generateToken(payload: IAuthToken): string {
  const token = jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

  return token;
}

export function generateRefreshToken(payload: IAuthToken): string {
  const token = jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "30d",
  });

  return token;
}

export function verifyToken(token: string) {
  try {
    const result = jwt.verify(token, env.jwtSecret);

    return result as IAuthToken;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      console.error(err);
    }

    return null;
  }
}
