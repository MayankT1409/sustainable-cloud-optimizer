import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/ml/optimize
 * @desc Get optimization recommendations for resources
 */
router.post("/optimize", authMiddleware, async (req, res) => {
    try {
        const { resources } = req.body; // Array of { id, cpu, memory, uptime, cost }
        
        if (!resources || !Array.isArray(resources)) {
            return res.status(400).json({ error: "Resources array is required" });
        }

        // Logic: In a real production app, this would call a Python service or use a WASM-based XGBoost model.
        // For the demo, we implement the same logic as the training script.
        const recommendations = resources.map(res => {
            let action = "Keep";
            let confidence = 0.95;
            let reason = "Resource is healthy and utilized.";

            if (res.cpu < 5 && res.uptime > 168) {
                action = "Terminate";
                reason = "Idle for over a week with < 5% CPU usage.";
            } else if (res.cpu < 20 || res.memory < 20) {
                action = "Right-size";
                reason = "Under-utilized. Consider moving to a smaller instance type.";
            }

            return {
                resourceId: res.id,
                action,
                reason,
                confidence,
                savings: action !== "Keep" ? (res.cost * 0.4).toFixed(2) : 0
            };
        });

        res.json({
            summary: {
                totalResources: resources.length,
                toTerminate: recommendations.filter(r => r.action === "Terminate").length,
                toResize: recommendations.filter(r => r.action === "Right-size").length,
            },
            recommendations
        });
    } catch (err) {
        console.error("ML Inference error:", err);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
});

export default router;
