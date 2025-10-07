import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import { verify } from "../../../../src/lib/jwt";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end();
  try {
    const cookie = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
    if (!cookie) throw new Error("Not auth");
    const token = cookie.split("=")[1];
    const payload = verify(token as string) as any;
    const userId = payload.userId;

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const client = await clientPromise;
    const db = client.db("vaultdb");
    const vault = db.collection("vault");
    await vault.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
