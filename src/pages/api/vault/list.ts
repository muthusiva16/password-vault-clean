import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import { verify } from "../../../../src/lib/jwt";
import { ObjectId } from "mongodb";

async function authUser(req: NextApiRequest) {
  const cookie = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
  if (!cookie) throw new Error("Not auth");
  const token = cookie.split("=")[1];
  const payload = verify(token as string) as any;
  return payload.userId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await authUser(req);
    const client = await clientPromise;
    const db = client.db("vaultdb");
    const vault = db.collection("vault");
    const items = await vault.find({ userId: new ObjectId(userId) }).toArray();
    return res.json({ items });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
