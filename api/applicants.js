import { put, list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({
      prefix: "applicants.json",
    });

    let applicants = [];

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      applicants = await response.json();
    }

    if (req.method === "GET") {
      return res.status(200).json(applicants);
    }

    if (req.method === "POST") {
      const applicant = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "جديد",
        ...req.body,
      };

      applicants.unshift(applicant);

      await put(
        "applicants.json",
        JSON.stringify(applicants),
        {
          access: "private",
          addRandomSuffix: false,
        }
      );

      return res.status(201).json(applicant);
    }

    return res.status(405).json({
      error: "Method not allowed",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}