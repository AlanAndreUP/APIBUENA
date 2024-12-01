import request from 'supertest';
import WebSocket from 'ws';
import app from '../app'; 
import { getInitialMessage, processMessage } from '../routes/chatbot';

describe('Pruebas de integración para la API REST', () => {
  it('GET /pasajeros - debería retornar la lista de pasajeros', async () => {
    const res = await request(app).get('/pasajeros');
    expect(res.statusCode);
    expect(Array.isArray(res.body));
  });
});

describe('Pruebas de WebSocket', () => {
  it('Debería recibir un mensaje inicial al conectar', (done) => {
    const ws = new WebSocket('ws://localhost:4001');

    ws.on('message', (data) => {
      const message = data.toString();
      expect(message).toBe(getInitialMessage());
      ws.close();
      done();
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      done(error);
    });
  }, 10000);

});
