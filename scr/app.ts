import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from 'dotenv';
import { getInitialMessage, processMessage } from './routes/chatbot';
import { WebSocketServer } from 'ws';
import pasajerosRoutes from './routes/pasajeros'; 
import usuariosRoutes from './routes/usuario';

config();

const app = express();
const port = process.env.PORT ?? 40000;
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

app.use(express.json());
app.use('/pasajeros', pasajerosRoutes);  
app.use('/user', usuariosRoutes);
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

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
