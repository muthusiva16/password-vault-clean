// src/lib/jwt.ts
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "dev-secret";

// Payload type can be object or string
export function sign(payload: string | object, expiresIn: string = "7d"): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Returns decoded payload or throws error if invalid
export function verify(token: string): string | JwtPayload {
  return jwt.verify(token, JWT_SECRET);
}

