import fs from "fs";
import path from "path";

const envSetup = () => {
  const base64Credentials = process.env.GOOGLE_CREDENTIALS;
  if (!base64Credentials) {
    throw new Error("GOOGLE_CREDENTIALS environment variable is missing");
  }
  const credentialsBuffer = Buffer.from(base64Credentials, "base64");
  const credentialsPath = path.join(__dirname, "../google-credentials.json");

  fs.writeFileSync(credentialsPath, credentialsBuffer);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
};

export default envSetup;
