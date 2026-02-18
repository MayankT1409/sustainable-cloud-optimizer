import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import awsRoutes from "./routes/awsRoutes.js";
import azureRoutes from "./routes/azureRoutes.js";
import gcpRoutes from "./routes/gcpRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/aws", awsRoutes);
app.use("/api/azure", azureRoutes);
app.use("/api/gcp", gcpRoutes);


// console.log(process.env.AWS_ACCESS_KEY_ID);
// console.log(process.env.AWS_SECRET_ACCESS_KEY);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
