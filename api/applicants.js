import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("db.json");
const db = new Low(adapter);

export default async function handler(req, res) {
  await db.read();
  db.data ||= { applicants: [] };

  if (req.method === "GET") {
    return res.status(200).json(db.data.applicants);
  }

  if (req.method === "POST") {
    const applicant = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: req.body.status || "جديد",
      ...req.body,
    };

    db.data.applicants.unshift(applicant);
    await db.write();

    return res.status(201).json(applicant);
  }

  res.status(405).json({ error: "Method not allowed" });
}