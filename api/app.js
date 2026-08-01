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

  if (req.method === "PUT") {
    const { id } = req.query;
    const index = db.data.applicants.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    db.data.applicants[index] = {
      ...db.data.applicants[index],
      ...req.body,
      id,
    };

    await db.write();
    return res.json(db.data.applicants[index]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    db.data.applicants = db.data.applicants.filter(
      (item) => item.id !== id
    );

    await db.write();
    return res.status(204).send();
  }

  res.status(405).json({ error: "Method not allowed" });
}