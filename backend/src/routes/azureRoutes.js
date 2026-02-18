import express from "express";
import { getVMs } from "../azure/vm.js";
import { calculateCO2 } from "../azure/emissions.js";

const router = express.Router();

router.post("/summary", async (req, res) => {
    try {
        const subscriptionId = req.body?.subscriptionId || process.env.AZURE_SUBSCRIPTION_ID || "mock-sub-id";

        const data = await getVMs(subscriptionId);
        const estimatedCO2 = calculateCO2(data.count);

        // Mock cost logic for now
        const monthlyCost = data.count * 45; // $45 avg per VM

        res.json({
            activeInstances: data.count,
            monthlyCost: monthlyCost,
            estimatedCO2,
        });

    } catch (err) {
        console.error("Error fetching Azure summary:", err);
        res.status(500).json({ error: "Failed to fetch Azure summary" });
    }
});

router.post("/instances", async (req, res) => {
    try {
        const subscriptionId = req.body?.subscriptionId || process.env.AZURE_SUBSCRIPTION_ID || "mock-sub-id";
        const data = await getVMs(subscriptionId);
        res.json(data.details);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching Azure instances" });
    }
});

export default router;
