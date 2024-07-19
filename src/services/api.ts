import axios from "axios";

const api = axios.create({
  baseURL: "https://woa-fleet-tracker-1ecffa10696a.herokuapp.com/api"
});

export default api;