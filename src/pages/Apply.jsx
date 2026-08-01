import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const arabicToLatinDigits = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function normalizeNationalId(value) {
  return value
    .split("")
    .map((char) => arabicToLatinDigits[char] ?? char)
    .join("")
    .replace(/\D/g, "")
    .slice(0, 14);
}

export default function Apply({ jobs = [], onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    address: "",
    job: jobs[0] || "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobs.length > 0 && !formData.job) {
      setFormData((prev) => ({ ...prev, job: jobs[0] }));
    }
  }, [jobs]);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue = name === "nationalId" ? normalizeNationalId(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedNationalId = normalizeNationalId(formData.nationalId);
    setError("");

    if (onSubmit) {
      setLoading(true);
      onSubmit({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        nationalId: normalizedNationalId,
        job: formData.job,
        message: formData.message.trim(),
      })
        .then(() => {
          setSubmitted(true);
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            nationalId: "",
            address: "",
            job: jobs[0] || "",
            message: "",
          });
        })
        .catch((err) => {
          console.error("Failed to submit applicant", err);
          const networkMessage =
            err?.message === "Network Error"
              ? "حدث خطأ في الشبكة. تحقق من تشغيل خادم الـ API على http://localhost:4000"
              : err?.response?.data?.error || err?.message || "لم يتم إرسال الطلب، حاول مرة أخرى.";
          setError(networkMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 90px)",
          background: "#f8fafc",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "760px",
            background: "white",
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 20px 50px rgba(15, 118, 110, 0.12)",
          }}
        >
          <h2
            style={{
              fontSize: "34px",
              textAlign: "center",
              color: "#0f766e",
              marginBottom: "12px",
            }}
          >
            قدم على وظيفة
          </h2>

          <p style={{ textAlign: "center", color: "#475569", marginBottom: "30px" }}>
            املأ بياناتك لنقل طلبك إلى فريق التوظيف، وسنتواصل معك قريبًا.
          </p>

          {submitted ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: "18px",
                padding: "26px",
                textAlign: "center",
                color: "#166534",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "12px" }}>تم استلام الطلب بنجاح!</h3>
              <p>شكراً لتقديمك. سوف يراجع فريق التوظيف طلبك ويتواصل معك في أقرب وقت.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                الاسم الكامل
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                رقم الهاتف
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010xxxxxxxx"
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                العنوان
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="اكتب عنوانك الكامل"
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                الرقم القومي
              </label>
              <input
                type="tel"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="014xxxxxxxxxx"
                required
                maxLength={14}
                minLength={14}
                pattern="[0-9]{14}"
                title="يجب أن يتكون من 14 رقمًا"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                الوظيفة المرشحة
              </label>
              <select
                name="job"
                value={formData.job}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "18px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                }}
              >
                {jobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>

              <label style={{ display: "block", marginBottom: "8px", color: "#334155" }}>
                خبرة قصيرة
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="اكتب شيئًا عن خبرتك أو مهاراتك"
                rows="5"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginBottom: "24px",
                  borderRadius: "14px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: loading ? "#94a3b8" : "#0f766e",
                  color: "white",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
              </button>
              {error && (
                <p style={{ color: "#dc2626", marginTop: "16px", textAlign: "center" }}>
                  {error}
                </p>
              )}
            </form>
          )}
        </section>
      </main>
    </>
  );
}
