const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error en la conexión a la base de datos MongoDB:', error);
});

db.once('open', () => {
  console.log('Conexión exitosa a la base de datos MongoDB.');
});

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

const apiRouter = require('./routes/citas'); 
app.use('/cita', apiRouter);

const apiRouterClientes = require('./routes/paciente'); 
app.use('/paciente', apiRouterClientes);



app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
 
