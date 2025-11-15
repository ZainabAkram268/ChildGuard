import reportRoutes from './routes/reportRoutes';
import familyRoutes from './routes/familyRoutes';

app.use('/api/reports', reportRoutes);
app.use('/api/family', familyRoutes);