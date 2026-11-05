import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const createCase = (premise, difficulty) =>
  api.post("/api/cases", { premise, difficulty });

export const getCase = (id) => api.get(`/api/cases/${id}`);

export const discoverClue = (caseId, clueId) =>
  api.post(`/api/cases/${caseId}/clues/${clueId}/discover`);

export const requestHint = (caseId) => api.post(`/api/cases/${caseId}/hints`);

export const accuse = (caseId, suspectId) =>
  api.post(`/api/cases/${caseId}/accuse`, { suspectId });

export const getResult = (caseId) => api.get(`/api/cases/${caseId}/result`);
