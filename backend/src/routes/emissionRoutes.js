import express from "express";
import { calculateCO2, estimateKWh } from "../services/emissionService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/emissions/calculate
 * @desc Calculate CO2 for a list of resources
 */
router.post("/calculate", authMiddleware, async (req, res) => {
    try {
        const { resources } = req.body; // Array of { type, uptime, region }
        
        if (!resources || !Array.isArray(resources)) {
            return res.status(400).json({ error: "Resources array is required" });
        }

        const results = resources.map(res => {
            const kwh = estimateKWh(res.type, res.uptime || 720); // Default 1 month
            const co2 = calculateCO2(kwh, res.region);
            return {
                ...res,
                estimatedKWh: kwh,
                co2kg: co2
            };
        });

        const totalCO2 = results.reduce((acc, curr) => acc + curr.co2kg, 0);

        res.json({
            totalCO2: parseFloat(totalCO2.toFixed(2)),
            breakdown: results
        });
    } catch (err) {
        console.error("Emission calculation error:", err);
        res.status(500).json({ error: "Failed to calculate emissions" });
    }
});

export default router;
