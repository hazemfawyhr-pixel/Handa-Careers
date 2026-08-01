let applicants = [];

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(applicants);
  }

  if (req.method === "POST") {
    const applicant = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: req.body.status || "جديد",
      ...req.body,
    };

    applicants.unshift(applicant);

    return res.status(201).json(applicant);
  }

  return res.status(405).json({ error: "Method not allowed" });
}