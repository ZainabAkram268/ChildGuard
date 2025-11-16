import reportRoutes from './routes/reportRoutes';
import familyRoutes from './routes/familyRoutes';
import progressReportRoutes from './routes/progressReportRoutes';
import reportRoutes from './routes/reportRoutes';
import familyRoutes from './routes/familyRoutes';

app.use('/api/reports', reportRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/progress-reports', progressReportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/family', familyRoutes);

// backend/src/server.ts (or app.ts)
import express from 'express';
import db from './config/database';
import progressReportRoutes from './routes/progressReportRoutes';

const app = express();
app.use(express.json());

// attach db to app
app.set('db', db);

// routes
app.use('/api/progress-reports', progressReportRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
