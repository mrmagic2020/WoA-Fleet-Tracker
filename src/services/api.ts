import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:6060/api"
});

export default api;