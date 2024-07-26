import api from "./api";

export let siteKey: string | null = null;

export const initReCAPTCHASiteKey = async () => {
  if (siteKey) {
    return siteKey;
  }
  try {
    const response = await api.get("/site-key");
    siteKey = response.data.siteKey;
    return siteKey;
  } catch (error) {
    console.error("Error fetching reCAPTCHA site key:", error);
    throw error;
  }
};

export const verifyReCAPTCHA = async (token: string, action: string) => {
  try {
    const response = await api.post("/verify-recaptcha", { token, action });
    return response.data;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    throw error;
  }
};
