import { put, list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "BLOB_READ_WRITE_TOKEN is missing",
      });
    }

    let applicants = [];

    const { blobs } = await list({
      prefix: "applicants.json",
      token,
    });

    if (blobs && blobs.length > 0) {
      const response = await fetch(blobs[0].url);

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          applicants = data;
        }
      }
    }


    // GET
    if (req.method === "GET") {
      return res.status(200).json(applicants);
    }


    // POST
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
          allowOverwrite: true,
          token,
        }
      );


      return res.status(201).json(applicant);
    }



    // PUT
    if (req.method === "PUT") {

      const { id } = req.query;


      const index = applicants.findIndex(
        (item) => item.id === id
      );


      if (index === -1) {
        return res.status(404).json({
          error: "Applicant not found",
        });
      }


      applicants[index] = {
        ...applicants[index],
        ...req.body,
        id,
      };


      await put(
        "applicants.json",
        JSON.stringify(applicants),
        {
          access: "private",
          allowOverwrite: true,
          token,
        }
      );


      return res.status(200).json(applicants[index]);
    }



    // DELETE
    if (req.method === "DELETE") {

      const { id } = req.query;


      applicants = applicants.filter(
        (item) => item.id !== id
      );


      await put(
        "applicants.json",
        JSON.stringify(applicants),
        {
          access: "private",
          allowOverwrite: true,
          token,
        }
      );


      return res.status(200).json({
        message: "Deleted successfully",
      });
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