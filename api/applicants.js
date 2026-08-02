import { put, list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "BLOB_READ_WRITE_TOKEN is missing",
      });
    }

    const { blobs } = await list({
      prefix: "applicants.json",
      token,
    });

    let applicants = [];

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        applicants = await response.json();
      }
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
          allowOverwrite: true,
          token,
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