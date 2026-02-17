import express from "express";
import { getInstances } from "../aws/ec2.js";
import { getMonthlyCost } from "../aws/cost.js";
import { calculateCO2 } from "../aws/emissions.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const instances = await getInstances();
    const cost = await getMonthlyCost();
    const co2 = calculateCO2(instances);

    res.json({
      instances,
      monthlyCost: cost,
      estimatedCO2: co2,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching AWS data");
  }
});

export default router;
