import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import { getInitialMessage, processMessage } from './routes/chatbot';
import { WebSocketServer } from 'ws';
import pasajerosRoutes from './routes/pasajeros'; 
import usuariosRoutes from './routes/usuario';
import kitsRoutes from './routes/kits';

config();

const app = express();
const port = process.env.PORT ?? 4000;
const uri = process.env.MONGODB_URI!;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions);

const db = mongoose.connection;

db.on('error', (error: Error) => {
  console.error('Error en la conexión a la base de datos MongoDB:', error);
});

db.once('open', () => {
  console.log('Conexión exitosa a la base de datos MongoDB.');
});

// Configuración de CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
    
  }
  next();
});

app.use(express.json());
app.use(morgan('dev'));
app.use('/pasajeros', pasajerosRoutes);  
app.use('/users', usuariosRoutes);
app.use('/kits', kitsRoutes);

const wss = new WebSocketServer({ port: 4001 });

wss.on('connection', (ws) => {
  ws.send(getInitialMessage());

  ws.on('message', (message: string) => {
    const response = processMessage(message);
    ws.send(response);
  });
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
