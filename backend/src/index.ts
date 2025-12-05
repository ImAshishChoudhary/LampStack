import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || '3002';

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/file', fileRoutes)

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
