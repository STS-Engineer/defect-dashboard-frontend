import axios from "axios";

export const api = axios.create({
<<<<<<< HEAD
  baseURL: "https://csl-back.azurewebsites.net",
=======
  baseURL: "http://127.0.0.1:8000",
>>>>>>> 652f97d (update)
});

export const deleteResource = (endpoint, id) => api.delete(`${endpoint}/${id}`);
