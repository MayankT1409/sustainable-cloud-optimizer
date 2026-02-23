import express from "express";
import { getInstances } from "../aws/ec2.js";
import { getMonthlyCost } from "../aws/cost.js";
import { calculateCO2 } from "../aws/emissions.js";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const roleArn = req.body?.roleArn;
    console.log(`[AWS] Fetching summary for Role: ${roleArn}`);

    if (!roleArn) {
      return res.status(400).json({ error: "roleArn is required" });
    }

    const ec2Data = await getInstances(roleArn);
    const costData = await getMonthlyCost(roleArn);
    const estimatedCO2 = calculateCO2(ec2Data.count);

    // Extract Account ID from Role ARN (arn:aws:iam::ACCOUNT_ID:role/...)
    const accountId = roleArn.split(':')[4] || "Unknown";

    res.json({
      accountId,
      activeInstances: ec2Data.count,
      totalCost6Months: costData.total,
      monthlyCost: costData.trend[costData.trend.length - 1]?.cost || 0, // Latest month
      costBreakdown: costData.breakdown,
      costTrend: costData.trend,
      estimatedCO2,
    });

  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: err.message || "Failed to fetch summary" });
  }
});




router.post("/instances", async (req, res) => {
  try {
    const roleArn = req.body?.roleArn;
    console.log(`[AWS] Fetching instances for Role: ${roleArn}`);

    if (!roleArn) {
      return res.status(400).json({ error: "roleArn is required" });
    }

    const ec2Data = await getInstances(roleArn);

    res.json(ec2Data.details);

  } catch (err) {
    console.error("Error fetching instances:", err);
    res.status(500).json({ error: err.message || "Error fetching instances" });
  }
});



export default router;
