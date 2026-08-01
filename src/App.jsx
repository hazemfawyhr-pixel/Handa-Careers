import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Apply from "./pages/Apply";
import Admin from "./pages/Admin";
import { createApplicant } from "./services/api";

const initialJobs = [
  "عامل إنتاج",
  "قسم القص",
  "خياطة",
  "عمال مخازن",
  "مترجم صيني",
];

const JOBS_STORAGE = "handa-careers-jobs";

function App() {
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    const storedJobs = localStorage.getItem(JOBS_STORAGE);

    if (storedJobs) {
      try {
        const parsedJobs = JSON.parse(storedJobs);
        if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
          setJobs(parsedJobs);
        }
      } catch (error) {
        console.error("Failed to parse jobs from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
  }, [jobs]);

  function handleSubmitApplicant(applicant) {
    return createApplicant(applicant);
  }

  function addJob(jobName) {
    const job = jobName.trim();
    if (!job) return;
    setJobs((prev) => {
      if (prev.includes(job)) return prev;
      return [...prev, job];
    });
  }

  function updateJob(index, jobName) {
    const job = jobName.trim();
    if (!job) return;
    setJobs((prev) => prev.map((current, idx) => (idx === index ? job : current)));
  }

  function deleteJob(index) {
    setJobs((prev) => prev.filter((_, idx) => idx !== index));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home jobs={jobs} />} />
        <Route path="/apply" element={<Apply jobs={jobs} onSubmit={handleSubmitApplicant} />} />
        <Route
          path="/admin"
          element={
            <Admin
              jobs={jobs}
              onAddJob={addJob}
              onUpdateJob={updateJob}
              onDeleteJob={deleteJob}
            />
          }
        />
        <Route path="*" element={<Home jobs={jobs} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;