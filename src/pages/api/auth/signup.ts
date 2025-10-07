import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import bcrypt from "bcrypt";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });

  const client = await clientPromise;
  const db = client.db("vaultdb");
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) return res.status(409).json({ error: "User exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const vaultSalt = crypto.randomBytes(16).toString("base64");

  await users.insertOne({
    email,
    passwordHash,
    vaultSalt,
    createdAt: new Date(),
  });

  return res.status(201).json({ ok: true });
}
