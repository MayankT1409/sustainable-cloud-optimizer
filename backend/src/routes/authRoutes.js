import express from "express";
import { adminDb } from "../firebase.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save AWS credentials for the logged-in user
router.post("/credentials", authMiddleware, async (req, res) => {
    try {
        const { awsRoleArn, awsAccountId } = req.body;
        const uid = req.user.uid;

        if (!awsRoleArn) {
            return res.status(400).json({ error: "awsRoleArn is required" });
        }

        await adminDb.collection("users").doc(uid).set(
            {
                email: req.user.email,
                awsRoleArn,
                awsAccountId: awsAccountId || "",
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );

        res.json({ success: true, message: "Credentials saved successfully" });
    } catch (err) {
        console.error("Error saving credentials:", err);
        res.status(500).json({ error: "Failed to save credentials" });
    }
});

// Get AWS credentials for the logged-in user
router.get("/credentials", authMiddleware, async (req, res) => {
    try {
        const uid = req.user.uid;
        const docSnap = await adminDb.collection("users").doc(uid).get();

        if (!docSnap.exists) {
            return res.json({ awsRoleArn: null, awsAccountId: null });
        }

        const data = docSnap.data();
        res.json({
            awsRoleArn: data.awsRoleArn || null,
            awsAccountId: data.awsAccountId || null,
        });
    } catch (err) {
        console.error("Error fetching credentials:", err);
        res.status(500).json({ error: "Failed to fetch credentials" });
    }
});

export default router;
