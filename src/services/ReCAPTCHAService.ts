import api from "./api";

export const verifyReCAPTCHA = async (token: string, action: string) => {
  try {
    const response = await api.post("/verify-recaptcha", { token, action });
    return response.data;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    throw error;
  }
};
