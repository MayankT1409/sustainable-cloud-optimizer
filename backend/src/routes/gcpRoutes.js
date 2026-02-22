import express from "express";
import { getInstances } from "../gcp/compute.js";
import { calculateCO2 } from "../gcp/emissions.js";

const router = express.Router();

router.post("/summary", async (req, res) => {
    try {
        const { projectId, serviceAccountKey } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: "projectId is required" });
        }

        const data = await getInstances(projectId);
        const estimatedCO2 = calculateCO2(data.count);

        // Mock cost logic
        const monthlyCost = data.count * 38; // $38 avg per instance

        res.json({
            activeInstances: data.count,
            monthlyCost: monthlyCost,
            estimatedCO2,
        });

    } catch (err) {
        console.error("Error fetching GCP summary:", err);
        res.status(500).json({ error: err.message || "Failed to fetch GCP summary" });
    }
});

router.post("/instances", async (req, res) => {
    try {
        const { projectId, serviceAccountKey } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: "projectId is required" });
        }
        const data = await getInstances(projectId);
        res.json(data.details);
    } catch (err) {
        console.error("Error fetching GCP instances:", err);
        res.status(500).json({ error: err.message || "Error fetching GCP instances" });
    }
});

export default router;
