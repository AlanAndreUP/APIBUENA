const request = require('supertest');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const apiRouter = require('../routes/citas'); 
const Cita = require('../models/UsuarioModel'); 


mongoose.connect('mongodb+srv://223208:Jaguares34.1@cluster0.swir3km.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

beforeAll(async () => {
  await mongoose.connection;

  app.use(express.json());
  app.use('/api', apiRouter); 

});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('CRUD Tests', () => {
  let newItemId;

  it('Debería crear un nuevo elemento', async () => {
  
    const newItemData = {
      idUser: 1,
      nombre: "Jonathan Dzul",
      email: "oaxaco@gmail.com"
  }

    const response = await request(app)
      .post('/api')
      .send(newItemData);

    expect(response.statusCode).toBe(201);
    
    expect(response.body.id).toBe(newItemData.id); 
   console.log(response.body);
    newItemId = response.body.email;
  });

  it('Debería obtener todos los elementos', async () => {
    const response = await request(app)
      .get('/api');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Debería obtener un elemento por ID', async () => {
    const response = await request(app)
      .get(`/api/${newItemId}`);
    expect(response.statusCode).toBe(200);
  });

  it('Debería actualizar un elemento', async () => {
    const updatedItemData = { email: newItemId }; 
    const response = await request(app)
      .put(`/api/${newItemId}`)
      .send(updatedItemData);
      console.log(response.error);
    expect(response.statusCode).toBe(200);
    
    expect(response.body.email).toBe(updatedItemData.email);
  
  });

  it('Debería eliminar un elemento', async () => {
    const response = await request(app)
      .delete(`/api/${newItemId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('El objeto fue eliminado');
  });

  it('Debería devolver 404 al intentar obtener un elemento eliminado', async () => {
    const response = await request(app)
      .get(`/api/${newItemId}`);

    expect(response.statusCode).toBe(404);
  });
});
