import axios from "axios";
import { store } from "../store/store";

export function getBaseURL() {
  // return "https://api.lulusku.com"; // Fallback for local development
  return import.meta.env.VITE_API_URL || "http://api.lulusku.com"; // Fallback for local development
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
});

// Function to dynamically attach the interceptor
export function attachAuthInterceptor() {
  apiClient.interceptors.request.use(
    (config) => {
      const token = store.CommonStore?.token; // Ensure store exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

export default apiClient;
