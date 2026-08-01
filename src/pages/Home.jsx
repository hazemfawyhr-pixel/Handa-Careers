import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home({ jobs = [] }) {

  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "70vh",
          background: "#f3f4f6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "45px",
            color: "#0f766e",
          }}
        >
          Handa Careers
        </h1>

        <h2>
          انضم إلى فريق عمل هاندا إيجيبت
        </h2>

        <Link
          to="/apply"
          style={{
            marginTop: "25px",
            background: "#0f766e",
            color: "white",
            padding: "15px 35px",
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          قدم الآن
        </Link>
      </section>


      <section style={{ padding: "40px" }}>

        <h2
          style={{
            textAlign: "center",
            color: "#0f766e",
            marginBottom: "30px",
          }}
        >
          الوظائف المتاحة
        </h2>


        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >

          {jobs.map((job, index) => (
            <div
              key={index}
              style={{
                width: "220px",
                padding: "30px",
                background: "white",
                borderRadius: "15px",
                boxShadow: "0 3px 10px #ccc",
                textAlign: "center",
              }}
            >

              <h3>{job}</h3>

              <Link
                to="/apply"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  background: "#0f766e",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                قدم الآن
              </Link>

            </div>
          ))}

        </div>

      </section>
    </>
  );
}