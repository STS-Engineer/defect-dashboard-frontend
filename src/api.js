import axios from "axios";

export const api = axios.create({
  baseURL: "https://csl-back.azurewebsites.net",
});

export const deleteResource = (endpoint, id) => api.delete(`${endpoint}/${id}`);
