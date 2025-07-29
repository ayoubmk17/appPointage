import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/", // adapte selon ton mapping Spring
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
