import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import awsRoutes from "./routes/awsRoutes.js";
import azureRoutes from "./routes/azureRoutes.js";
import gcpRoutes from "./routes/gcpRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes (save/get AWS credentials per user)
app.use("/api/auth", authRoutes);

// Cloud provider routes
app.use("/api/aws", awsRoutes);
app.use("/api/azure", azureRoutes);
app.use("/api/gcp", gcpRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
