import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import { auth } from "../middleware/auth";
import Aircraft from "../models/aircraft";
import AircraftGroup from "../models/aircraftGroup";
import { AircraftStatus, ContractType } from "@mrmagic2020/shared/dist/enums";
import { Limits } from "@mrmagic2020/shared/dist/constants";
import {
  IAircraft,
  IAircraftContract
} from "@mrmagic2020/shared/dist/interfaces";

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
    user: (req.user as any).id,
    aircraftGroup: req.body.aircraftGroup ?? null
  });

  try {
    // Check if aircraft limit is reached
    const aircraftCount = await Aircraft.countDocuments({
      user: (req.user as any).id
    });
    if (aircraftCount >= Limits.MaxAircrafts) {
      return res.status(400).json({
        message: `Aircraft limit reached. Maximum ${Limits.MaxAircrafts} aircrafts allowed`
      });
    }
    const existingAircraft = await Aircraft.findOne({
      registration: aircraft.registration
    });
    if (existingAircraft) {
      return res
        .status(400)
        .json({ message: "Registration code already exists" });
    }
    const newAircraft = await aircraft.save();
    // Update the corresponding aircraft group, if any
    if (newAircraft.aircraftGroup) {
      await AircraftGroup.findByIdAndUpdate(
        newAircraft.aircraftGroup,
        {
          $push: { aircrafts: newAircraft._id }
        },
        { new: true }
      );
    }
    res.status(201).json(newAircraft);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an aircraft
router.put("/:id", getAircraft, async (req: Request, res: Response) => {
  try {
    const newAircraft: IAircraft | null = await Aircraft.findById(
      req.params.id
    );
    if (!newAircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }
    if (newAircraft.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    newAircraft.set(req.body);
    await newAircraft.save();
    res.json(newAircraft);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT sell an aircraft
router.put("/:id/sell", getAircraft, async (req: Request, res: Response) => {
  const aircraft: IAircraft = res.aircraft;
  if (aircraft.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  aircraft.status = AircraftStatus.Sold;
  aircraft.contracts.forEach((contract: any) => {
    contract.finished = true;
  });

  try {
    const updatedAircraft = await aircraft.save();
    res.json(updatedAircraft);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an aircraft
router.delete("/:id", getAircraft, async (req: Request, res: Response) => {
  try {
    if (res.aircraft.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await res.aircraft.deleteOne();
    if (res.aircraft.aircraftGroup) {
      await AircraftGroup.findByIdAndUpdate(
        res.aircraft.aircraftGroup,
        {
          $pull: { aircrafts: res.aircraft._id }
        },
        { new: true }
      );
    }
    if (res.aircraft.imageURL) {
      fs.unlink(res.aircraft.imageURL, (err: any) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
      });
    }
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
      user: req.user.id
    });
    if (aircraft == null) {
      return res.status(404).json({ message: "Cannot find aircraft" });
    }
    aircraft.contracts.forEach((contract: IAircraftContract) => {
      if (!contract.lastHandled) {
        contract.lastHandled = new Date();
      }
    });
    aircraft.markModified("contracts");
    await aircraft.save();
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
    const contractCount = aircraft.contracts.length;
    if (contractCount >= Limits.MaxContractsPerAircraft) {
      return res.status(400).json({
        message: `Maximum ${Limits.MaxContractsPerAircraft} contracts allowed per aircraft`
      });
    }

    const newContract = {
      contractType: req.body.contractType,
      player: req.body.player,
      destination: req.body.destination,
      profits: [],
      progress: 0,
      finished: false,
      lastHandled: new Date()
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
    const contract: IAircraftContract = aircraft.contracts.id(
      req.params.contractId
    );

    if (!contract) {
      return res.status(404).json({ message: "Cannot find contract" });
    }

    contract.profits.push(req.body.profit);
    contract.progress += 1;
    contract.finished =
      (contract.contractType === ContractType.Player &&
        contract.profits.length >= 10) ||
      contract.finished;
    contract.lastHandled = new Date();

    // Update status if all contracts are finished
    if (
      contract.finished &&
      !aircraft.contracts.some((c: IAircraftContract) => !c.finished)
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
