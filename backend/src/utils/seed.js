import { db } from "../lib/dynamo.js";
import dotenv from "dotenv";

dotenv.config();

const TABLE_NAME = "Users";

const demoUsers = [
    {
        tenant_id: "demo-tenant-123",
        email: "demo@example.com",
        awsRoleArn: "arn:aws:iam::123456789012:role/DemoRole",
        awsAccountId: "123456789012",
        updatedAt: new Date().toISOString(),
    }
];

async function seed() {
    console.log("Seeding DynamoDB with demo data...");
    for (const user of demoUsers) {
        try {
            await db.put({
                TableName: TABLE_NAME,
                Item: user
            });
            console.log(`Added user: ${user.email}`);
        } catch (err) {
            console.error(`Error adding user ${user.email}:`, err.message);
        }
    }
    console.log("Seeding complete.");
}

seed();
