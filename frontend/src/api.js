// import axios from "axios";

// const API = axios.create({
//   baseURL: "https://project-management-1-2rgk.onrender.com/api",
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;


// src/api.js
import axios from "axios";

// Create axios instance with baseURL from environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5003/api", // fallback to local
});

// Request interceptor: attach token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: log errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
