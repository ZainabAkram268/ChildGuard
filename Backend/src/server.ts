// src/server.ts (Conceptual content based on your setup)

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; // Your existing auth routes
import indexRouter from './routes/index'; // <-- NEW IMPORT
import caseReporterRoutes from "./routes/caseReporterRoutes";



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. HOME PAGE ROUTE (Place this first)
// The root path '/' now returns the API status JSON
app.use('/', indexRouter); 

// 2. API ROUTES (Place these under a path prefix)
app.use('/api/auth', authRoutes);
app.use("/case", caseReporterRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});