import express from "express";
import { db } from "../lib/dynamo.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const TABLE_NAME = "Users";

// Save Cloud credentials for the logged-in user (multi-tenant)
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
        const tenantId = req.user.tenant_id;

        const item = {
            tenant_id: tenantId,
            email: req.user.email,
            updatedAt: new Date().toISOString(),
            awsRoleArn: awsRoleArn || null,
            awsAccountId: awsAccountId || null,
            azureSubId: azureSubId || null,
            azureTenantId: azureTenantId || null,
            azureClientId: azureClientId || null,
            azureClientSecret: azureClientSecret || null,
            gcpProjectId: gcpProjectId || null,
            gcpServiceAccountKey: gcpServiceAccountKey || null
        };

        await db.put({
            TableName: TABLE_NAME,
            Item: item
        });

        res.json({ success: true, message: "Credentials saved successfully" });
    } catch (err) {
        console.error("Error saving credentials:", err);
        res.status(500).json({ error: "Failed to save credentials" });
    }
});

// Get all cloud credentials for the logged-in user
router.get("/credentials", authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await db.get({
            TableName: TABLE_NAME,
            Key: { tenant_id: tenantId }
        });

        if (!result.Item) {
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

        res.json(result.Item);
    } catch (err) {
        console.error("Error fetching credentials:", err);
        res.status(500).json({ error: "Failed to fetch credentials" });
    }
});

export default router;
