import axios from "axios";
import { getActiveBreak } from "../utils/breakTime";

const api = axios.create({
  baseURL: "https://your-api-url.com",
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (getActiveBreak()) {
      return Promise.reject({
        isBreak: true,
        message: "Break Time – API Blocked",
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
