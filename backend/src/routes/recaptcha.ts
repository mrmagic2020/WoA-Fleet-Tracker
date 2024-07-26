import { Router, Request, Response } from "express";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import dotenv from "dotenv";

dotenv.config();

const projectID = "woa-fleet-tracke-1721716279617";
const recaptchaKey = process.env.RECAPTCHA_SITE_KEY;

async function verifyRecaptcha(token: string, _action: string) {
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey
      }
    },
    parent: projectPath
  };

  const [response] = await client.createAssessment(request);

  console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
  response.riskAnalysis?.reasons?.forEach((reason) => {
    console.log(reason);
  });
  return response.riskAnalysis?.score;
}

const router = Router();

// GET reCAPTCHA site key
router.get("/site-key", async (_req: Request, res: Response) => {
  res.json({ siteKey: recaptchaKey });
});

// POST verify reCAPTCHA token
router.post("/verify-recaptcha", async (req: Request, res: Response) => {
  const { token, action } = req.body;
  try {
    const score = await verifyRecaptcha(token, action);
    res.json({ score });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
