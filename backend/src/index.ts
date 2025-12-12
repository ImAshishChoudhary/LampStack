import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes';
import providerRoutes from './routes/provider.routes';
import uploadRoutes from './routes/upload.routes';
import validationRoutes from './routes/validation.routes';
import agentRoutes from './routes/agent.routes';
import embeddingsRoutes from './routes/embeddings.routes';
import { createRealTimeWebSocket } from './agents/real-orchestrator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || '3002';

const server = createServer(app);

createRealTimeWebSocket(server);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/file', fileRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/embeddings', embeddingsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`[server] Frontend URL: ${process.env.FRONTEND_URL}`);
});
