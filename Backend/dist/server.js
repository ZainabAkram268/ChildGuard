import express from 'express';
import cors from 'cors';
import path from 'path';
import { BaseModel } from "./models/BaseModels";
import authRoutes from './routes/authRoutes.js';
import indexRouter from './routes/index.js';
import caseReporterRoutes from "./routes/caseReporterRoutes.js";
const app = express();
const PORT = process.env.PORT || 5000;
console.log("Starting server...");
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize DB safely
try {
    BaseModel.init();
    console.log("Database initialized successfully.");
}
catch (err) {
    console.error("Database initialization failed:", err);
}
// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
// Routes
app.use('/', indexRouter);
app.use('/api/auth', authRoutes);
app.use("/case", caseReporterRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving static uploads from: ${path.join(__dirname, '..', 'public', 'uploads')}`);
});
