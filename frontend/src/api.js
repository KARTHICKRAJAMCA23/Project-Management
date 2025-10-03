import axios from "axios";

const API = axios.create({
  baseURL: ["http://localhost:5173/api","https://project-management-1-2rgk.onrender.com/api"],
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
