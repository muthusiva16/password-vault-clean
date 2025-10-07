import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import { verify } from "../../../../src/lib/jwt";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();
  try {
    const cookie = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
    if (!cookie) throw new Error("Not auth");
    const token = cookie.split("=")[1];
    const payload = verify(token as string) as any;
    const userId = payload.userId;

    const { id, encrypted } = req.body;
    if (!id || !encrypted) return res.status(400).json({ error: "Missing" });

    const client = await clientPromise;
    const db = client.db("vaultdb");
    const vault = db.collection("vault");
    await vault.updateOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: { encrypted, updatedAt: new Date() } });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
