// src/server.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { BaseModel } from "./models/BaseModels";

const app = express();
app.use(cors());
app.use(express.json());

// initialize DB once synchronously
BaseModel.init();

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
