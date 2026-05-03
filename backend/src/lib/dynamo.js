import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const docClient = DynamoDBDocumentClient.from(client);

// 🚀 DEMO MOCK: In-memory storage if DynamoDB fails
const mockStorage = new Map();

export const db = {
    get: async (params) => {
        try {
            return await docClient.send(new GetCommand(params));
        } catch (err) {
            console.warn("DynamoDB GET failed, using mock storage:", err.message);
            const key = JSON.stringify(params.Key);
            return { Item: mockStorage.get(key) || null };
        }
    },
    put: async (params) => {
        try {
            return await docClient.send(new PutCommand(params));
        } catch (err) {
            console.warn("DynamoDB PUT failed, using mock storage:", err.message);
            const key = JSON.stringify({ tenant_id: params.Item.tenant_id });
            mockStorage.set(key, params.Item);
            return { success: true };
        }
    },
    update: (params) => docClient.send(new UpdateCommand(params)),
    query: (params) => docClient.send(new QueryCommand(params)),
};

export default db;
