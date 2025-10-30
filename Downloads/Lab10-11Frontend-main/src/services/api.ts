import axios from "axios";
import { getAccessToken } from "./tokenService";

const api = axios.create({
  baseURL: "http://203.159.93.114:3100",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No token found in localStorage");
  }
  return config;
});



export default api;
