import express from "express";
import { getInstances } from "../aws/ec2.js";
import { getMonthlyCost } from "../aws/cost.js";
import { calculateCO2 } from "../aws/emissions.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const ec2Data = await getInstances();
    const cost = await getMonthlyCost();
    // const co2 = calculateCO2(ec2Data.details); // Assuming calculateCO2 can handle the list

    res.json({
      activeInstances: ec2Data.count,
      monthlyCost: cost,
      // estimatedCO2: co2,
    });
  } catch (err) {
    console.error("Error fetching summary data, returning mock data:", err);
    // Fallback mock data as requested by user
    res.json({
      activeInstances: 1,
      monthlyCost: 15.50,
      // estimatedCO2: 0,
    });
  }
});

router.get("/instances", async (req, res) => {
  try {
    const ec2Data = await getInstances();
    res.json(ec2Data.details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching instances" });
  }
});

export default router;
