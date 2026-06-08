import axios from "axios";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const baseURL = `${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1/"}`.replace(/\/?$/, "/");

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: Error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }
    return Promise.reject(error);
  },
);

export function errorResponse<T>(error: Error, fallback: string): ApiResponse<T> {
  if (axios.isAxiosError<ApiResponse<T>>(error)) {
    return { success: false, message: error.response?.data?.message ?? fallback };
  }
  return { success: false, message: fallback };
}
