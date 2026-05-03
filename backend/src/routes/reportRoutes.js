import express from "express";
import { generateESGReport } from "../services/reportService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/reports/generate
 * @desc Generate and download PDF ESG Report
 */
router.post("/generate", authMiddleware, async (req, res) => {
    try {
        const { reportData } = req.body;
        
        // Mocking some data if not provided
        const data = {
            tenantName: req.user.email.split("@")[0],
            totalCO2: reportData?.totalCO2 || 1240,
            co2Reduction: reportData?.co2Reduction || 15.5,
            greenScore: reportData?.greenScore || 82,
            totalSavings: reportData?.totalSavings || 450.20,
            idleCount: reportData?.idleCount || 4,
            efficiencyGain: reportData?.efficiencyGain || 12
        };

        const pdfBuffer = await generateESGReport(data);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=ESG_Report.pdf",
            "Content-Length": pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

export default router;
