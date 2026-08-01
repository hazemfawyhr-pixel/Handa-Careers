import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export function getApplicants() {
  return api.get("/applicants").then((res) => res.data);
}

export function createApplicant(applicant) {
  return api.post("/applicants", applicant).then((res) => res.data);
}

export function updateApplicant(id, applicant) {
  return api.put(`/applicants/${id}`, applicant).then((res) => res.data);
}

export function deleteApplicant(id) {
  return api.delete(`/applicants/${id}`).then((res) => res.data);
}
