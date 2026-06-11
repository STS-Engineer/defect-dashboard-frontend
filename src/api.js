import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

export const deleteResource = (endpoint, id) => api.delete(`${endpoint}/${id}`);
