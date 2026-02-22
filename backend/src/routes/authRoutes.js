import express from "express";
import { adminDb } from "../firebase.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save Cloud credentials for the logged-in user
router.post("/credentials", authMiddleware, async (req, res) => {
    try {
        const {
            awsRoleArn,
            awsAccountId,
            azureSubId,
            azureTenantId,
            azureClientId,
            azureClientSecret,
            gcpProjectId,
            gcpServiceAccountKey
        } = req.body;
        const uid = req.user.uid;

        const updateData = {
            email: req.user.email,
            updatedAt: new Date().toISOString(),
        };

        if (awsRoleArn) updateData.awsRoleArn = awsRoleArn;
        if (awsAccountId !== undefined) updateData.awsAccountId = awsAccountId;
        if (azureSubId) updateData.azureSubId = azureSubId;
        if (azureTenantId) updateData.azureTenantId = azureTenantId;
        if (azureClientId) updateData.azureClientId = azureClientId;
        if (azureClientSecret) updateData.azureClientSecret = azureClientSecret;
        if (gcpProjectId) updateData.gcpProjectId = gcpProjectId;
        if (gcpServiceAccountKey) updateData.gcpServiceAccountKey = gcpServiceAccountKey;

        await adminDb.collection("users").doc(uid).set(updateData, { merge: true });

        res.json({ success: true, message: "Credentials saved successfully" });
    } catch (err) {
        console.error("Error saving credentials:", err);
        res.status(500).json({ error: "Failed to save credentials" });
    }
});

// Get all cloud credentials for the logged-in user
router.get("/credentials", authMiddleware, async (req, res) => {
    try {
        const uid = req.user.uid;
        const docSnap = await adminDb.collection("users").doc(uid).get();

        if (!docSnap.exists) {
            return res.json({
                awsRoleArn: null,
                awsAccountId: null,
                azureSubId: null,
                azureTenantId: null,
                azureClientId: null,
                azureClientSecret: null,
                gcpProjectId: null,
                gcpServiceAccountKey: null
            });
        }

        const data = docSnap.data();
        res.json({
            awsRoleArn: data.awsRoleArn || null,
            awsAccountId: data.awsAccountId || null,
            azureSubId: data.azureSubId || null,
            azureTenantId: data.azureTenantId || null,
            azureClientId: data.azureClientId || null,
            azureClientSecret: data.azureClientSecret || null,
            gcpProjectId: data.gcpProjectId || null,
            gcpServiceAccountKey: data.gcpServiceAccountKey || null
        });
    } catch (err) {
        console.error("Error fetching credentials:", err);
        res.status(500).json({ error: "Failed to fetch credentials" });
    }
});

export default router;
