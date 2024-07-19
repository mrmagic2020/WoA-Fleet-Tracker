import { Router, Request, Response } from "express";
import Invitation from "../models/invitation";
import { auth } from "../middleware/auth";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

router.use(auth);

// GET all invitations
router.get("/", checkAdmin, async (req: Request, res: Response) => {
  try {
    const invitations = await Invitation.find({});
    res.json(invitations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new invitation
router.post("/", checkAdmin, async (req: Request, res: Response) => {
  const { code, remainingUses } = req.body;
  try {
    const invitation = new Invitation({ code, remainingUses });
    const newInvitation = await invitation.save();
    res.status(201).json(newInvitation);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an invitation
router.delete("/:id", checkAdmin, async (req: Request, res: Response) => {
  try {
    await Invitation.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Invitation" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
