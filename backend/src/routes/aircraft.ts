import express, { Request, Response, NextFunction } from "express";
import { auth } from "../middleware/auth";
import Aircraft from "../models/aircraft";
import { AircraftStatus, ContractType } from "@mrmagic2020/shared/dist/enums";

const router = express.Router();
router.use(auth);

// GET all aircraft for the authenticated user
router.get("/", async (req: Request, res: Response) => {
  try {
    const aircraft = await Aircraft.find({ user: (req.user as any).id });
    res.json(aircraft);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific aircraft
router.get("/:id", getAircraft, (req: Request, res: Response) => {
  res.json(res.aircraft);
});

// POST a new aircraft for the authenticated user
router.post("/", async (req: Request, res: Response) => {
  const aircraft = new Aircraft({
    ac_model: req.body.ac_model,
    size: req.body.size,
    type: req.body.type,
    registration: req.body.registration,
    configuration: req.body.configuration,
    airport: req.body.airport,
    status: req.body.status,
    contracts: req.body.contracts,
    totalProfits: req.body.totalProfits,
    user: (req.user as any).id
  });

  try {
    const existingAircraft = await Aircraft.findOne({
      registration: aircraft.registration
    });
    if (existingAircraft) {
      return res
        .status(400)
        .json({ message: "Registration code already exists" });
    }
    const newAircraft = await aircraft.save();
    res.status(201).json(newAircraft);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an aircraft
router.delete("/:id", getAircraft, async (req: Request, res: Response) => {
  try {
    await res.aircraft.deleteOne();
    res.json({ message: "Deleted Aircraft" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get an aircraft by ID and ensure it belongs to the authenticated user
async function getAircraft(req: Request, res: Response, next: NextFunction) {
  let aircraft;
  try {
    aircraft = await Aircraft.findOne({
      _id: req.params.id,
      user: (req.user as any).id
    });
    if (aircraft == null) {
      return res.status(404).json({ message: "Cannot find aircraft" });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }

  res.aircraft = aircraft;
  next();
}

// POST a new contract
router.post(
  "/:id/contracts",
  getAircraft,
  async (req: Request, res: Response) => {
    const aircraft = res.aircraft;
    const newContract = {
      contractType: req.body.contractType,
      player: req.body.player,
      destination: req.body.destination,
      profits: [],
      progress: 0,
      finished: false
    };

    aircraft.contracts.unshift(newContract);
    aircraft.status = AircraftStatus.InService;

    try {
      const updatedAircraft = await aircraft.save();
      res.status(201).json(updatedAircraft);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT finish a contract
router.put(
  "/:id/contracts/:contractId/finish",
  getAircraft,
  async (req: Request, res: Response) => {
    const aircraft = res.aircraft;
    const contract = aircraft.contracts.id(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ message: "Cannot find contract" });
    }

    contract.finished = true;

    // Update status if all contracts are finished
    if (!aircraft.contracts.some((c: any) => !c.finished)) {
      aircraft.status = AircraftStatus.Idle;
    }

    try {
      const updatedAircraft = await aircraft.save();
      res.status(201).json(updatedAircraft);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE a contract
router.delete(
  "/:id/contracts/:contractId",
  getAircraft,
  async (req: Request, res: Response) => {
    const aircraft = res.aircraft;
    const contract = aircraft.contracts.id(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ message: "Cannot find contract" });
    }

    await contract.deleteOne();

    if (!aircraft.contracts.some((c: any) => !c.finished)) {
      aircraft.status = AircraftStatus.Idle;
    }

    try {
      const updatedAircraft = await aircraft.save();
      res.status(201).json(updatedAircraft);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST log a profit
router.post(
  "/:id/contracts/:contractId/profits",
  getAircraft,
  async (req: Request, res: Response) => {
    const aircraft = res.aircraft;
    aircraft.totalProfits += req.body.profit;

    const contract = aircraft.contracts.id(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ message: "Cannot find contract" });
    }

    contract.profits.push(req.body.profit);
    contract.progress += 1;
    contract.finished =
      (contract.contractType === ContractType.Player &&
        contract.profits.length >= 10) ||
      contract.finished;

    // Update status if all contracts are finished
    if (
      contract.finished &&
      !aircraft.contracts.some((c: any) => !c.finished)
    ) {
      aircraft.status = AircraftStatus.Idle;
    }

    try {
      const updatedAircraft = await aircraft.save();
      res.status(201).json(updatedAircraft);
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  }
);

export default router;
