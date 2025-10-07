import type { NextApiRequest, NextApiResponse } from "next";
import { verify } from "../../../../src/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
  if (!cookie) return res.status(401).json({ error: "Not auth" });
  const token = cookie.split("=")[1];
  try {
    const data = verify(token as string) as any;
    return res.json({ ok: true, user: { id: data.userId, email: data.email } });
  } catch (err) {
    return res.status(401).json({ error: "Invalid" });
  }
}
