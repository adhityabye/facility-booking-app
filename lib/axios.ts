import axios from "axios";
import { useAuthStore } from "./auth"; // Import useAuthStore

const API_URL = "https://booking-api.hyge.web.id";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, signIn, signOut } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          await signIn({ accessToken: newAccessToken, refreshToken: newRefreshToken });

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          await signOut();
          return Promise.reject(refreshError);
        }
      } else {
        await signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
