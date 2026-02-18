import express from "express";
import { getInstances } from "../aws/ec2.js";
import { getMonthlyCost } from "../aws/cost.js";
import { calculateCO2 } from "../aws/emissions.js";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const roleArn = req.body?.roleArn;

    if (!roleArn) {
      return res.status(400).json({ error: "roleArn is required" });
    }

    const ec2Data = await getInstances(roleArn);
    const cost = await getMonthlyCost(roleArn);
    const estimatedCO2 = calculateCO2(ec2Data.count);

    res.json({
      activeInstances: ec2Data.count,
      monthlyCost: cost,
      estimatedCO2,
    });

  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});




router.post("/instances", async (req, res) => {
  try {
    const roleArn = req.body?.roleArn;

    if (!roleArn) {
      return res.status(400).json({ error: "roleArn is required" });
    }

    const ec2Data = await getInstances(roleArn);

    res.json(ec2Data.details);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching instances" });
  }
});



export default router;
