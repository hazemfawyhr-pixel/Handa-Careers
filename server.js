import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const adapter = new JSONFile("db.json");
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data ||= { applicants: [] };
  await db.write();
}

initDB();

app.get("/api/applicants", async (req, res) => {
  await db.read();
  res.json(db.data.applicants || []);
});

app.post("/api/applicants", async (req, res) => {
  await db.read();
  const applicant = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: req.body.status || "جديد",
    ...req.body,
  };
  db.data.applicants.unshift(applicant);
  await db.write();
  res.status(201).json(applicant);
});

app.put("/api/applicants/:id", async (req, res) => {
  await db.read();
  const { id } = req.params;
  const index = db.data.applicants.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Applicant not found" });
  }
  db.data.applicants[index] = {
    ...db.data.applicants[index],
    ...req.body,
    id,
  };
  await db.write();
  res.json(db.data.applicants[index]);
});

app.delete("/api/applicants/:id", async (req, res) => {
  await db.read();
  const { id } = req.params;
  db.data.applicants = db.data.applicants.filter((item) => item.id !== id);
  await db.write();
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
