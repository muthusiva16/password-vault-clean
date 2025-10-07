import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../src/lib/mongo";
import { verify } from "../../../../src/lib/jwt";
import { ObjectId } from "mongodb";

function getUserIdFromReq(req: NextApiRequest) {
  const cookie = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
  if (!cookie) throw new Error("Not auth");
  const token = cookie.split("=")[1];
  const payload = verify(token as string) as any;
  return payload.userId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const userId = getUserIdFromReq(req);
    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ error: "Missing encrypted" });

    const client = await clientPromise;
    const db = client.db("vaultdb");
    const vault = db.collection("vault");
    await vault.insertOne({
      userId: new ObjectId(userId),
      encrypted,
      createdAt: new Date(),
    });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
