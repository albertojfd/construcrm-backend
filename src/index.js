require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const leadsRouter = require('./routes/leads');
const clientesRouter = require('./routes/clientes');
const proyectosRouter = require('./routes/proyectos');
const { proveedoresRouter, empleadosRouter, presupuestosRouter, pagosRouter } = require('./routes/otros');

app.use('/api/leads', leadsRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/proyectos', proyectosRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/presupuestos', presupuestosRouter);
app.use('/api/pagos', pagosRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log('ConstruCRM corriendo en puerto ' + PORT);
});

const conectarDB = async () => {
  try {
    const { crearTablas } = require('./db/database');
    await crearTablas();
    console.log('Base de datos conectada');
  } catch (err) {
    console.error('Reintentando DB en 5s: ' + err.message);
    setTimeout(conectarDB, 5000);
  }
};

conectarDB();