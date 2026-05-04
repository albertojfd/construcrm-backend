require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { crearTablas } = require('./db/database');

const leadsRouter = require('./routes/leads');
const clientesRouter = require('./routes/clientes');
const proyectosRouter = require('./routes/proyectos');
const { proveedoresRouter, empleadosRouter, presupuestosRouter, pagosRouter } = require('./routes/otros');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir el frontend (el archivo HTML del CRM)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API
app.use('/api/leads', leadsRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/proyectos', proyectosRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/presupuestos', presupuestosRouter);
app.use('/api/pagos', pagosRouter);

// Dashboard de métricas (resumen general)
app.get('/api/dashboard', async (req, res) => {
  try {
    const { pool } = require('./db/database');
    const [clientes, proyectos, leads, pagos] = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM clientes WHERE estado != 'Prospecto'"),
      pool.query("SELECT COUNT(*) as total FROM proyectos WHERE estado = 'En progreso'"),
      pool.query("SELECT COUNT(*) as total FROM leads WHERE etapa != 'Descartado'"),
      pool.query("SELECT COALESCE(SUM(monto),0) as total FROM pagos WHERE estado = 'Pendiente'"),
    ]);
    res.json({
      clientes_activos: parseInt(clientes.rows[0].total),
      proyectos_en_curso: parseInt(proyectos.rows[0].total),
      leads_activos: parseInt(leads.rows[0].total),
      cobros_pendientes: parseFloat(pagos.rows[0].total),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta raíz — sirve el CRM
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Arrancar servidor
const iniciar = async () => {
  await crearTablas();
  app.listen(PORT, () => {
    console.log(`🚀 ConstruCRM corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  });
};

iniciar();
