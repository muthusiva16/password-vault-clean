import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import bcrypt from "bcrypt";
import { sign } from "../../../../src/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });

  const client = await clientPromise;
  const db = client.db("vaultdb");
  const users = db.collection("users");
  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid" });

  const token = sign({ userId: user._id.toString(), email });

  res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax; Secure=${process.env.NODE_ENV === "production"}`);
  return res.json({ ok: true, vaultSalt: user.vaultSalt });
}
