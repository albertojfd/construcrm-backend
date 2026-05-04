const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

// ─── PROVEEDORES ───────────────────────────────────────────────
const proveedoresRouter = express.Router();

proveedoresRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pv.*, COUNT(pp.proyecto_id) as total_proyectos
      FROM proveedores pv
      LEFT JOIN proyecto_proveedores pp ON pp.proveedor_id = pv.id
      GROUP BY pv.id ORDER BY pv.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

proveedoresRouter.get('/:id', async (req, res) => {
  try {
    const pv = await pool.query('SELECT * FROM proveedores WHERE id = $1', [req.params.id]);
    if (!pv.rows.length) return res.status(404).json({ error: 'Proveedor no encontrado' });
    const proyectos = await pool.query(`
      SELECT p.*, c.nombre as cliente_nombre FROM proyectos p
      JOIN proyecto_proveedores pp ON pp.proyecto_id = p.id
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE pp.proveedor_id = $1`, [req.params.id]);
    res.json({ ...pv.rows[0], proyectos: proyectos.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

proveedoresRouter.post('/', async (req, res) => {
  try {
    const { nombre, categoria, contacto, email, telefono, plazo_pago, estado } = req.body;
    const result = await pool.query(
      'INSERT INTO proveedores (nombre, categoria, contacto, email, telefono, plazo_pago, estado) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [nombre, categoria, contacto, email, telefono, plazo_pago || '30 días', estado || 'Activo']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

proveedoresRouter.put('/:id', async (req, res) => {
  try {
    const { nombre, categoria, contacto, email, telefono, plazo_pago, estado } = req.body;
    const result = await pool.query(
      'UPDATE proveedores SET nombre=$1,categoria=$2,contacto=$3,email=$4,telefono=$5,plazo_pago=$6,estado=$7 WHERE id=$8 RETURNING *',
      [nombre, categoria, contacto, email, telefono, plazo_pago, estado, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

proveedoresRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedores WHERE id = $1', [req.params.id]);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── EMPLEADOS ─────────────────────────────────────────────────
const empleadosRouter = express.Router();

empleadosRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, p.nombre as proyecto_nombre
      FROM empleados e LEFT JOIN proyectos p ON p.id = e.proyecto_id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

empleadosRouter.post('/', async (req, res) => {
  try {
    const { nombre, cargo, email, telefono, proyecto_id, estado, fecha_ingreso } = req.body;
    const result = await pool.query(
      'INSERT INTO empleados (nombre, cargo, email, telefono, proyecto_id, estado, fecha_ingreso) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [nombre, cargo, email, telefono, proyecto_id || null, estado || 'Disponible', fecha_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

empleadosRouter.put('/:id', async (req, res) => {
  try {
    const { nombre, cargo, email, telefono, proyecto_id, estado, fecha_ingreso } = req.body;
    const result = await pool.query(
      'UPDATE empleados SET nombre=$1,cargo=$2,email=$3,telefono=$4,proyecto_id=$5,estado=$6,fecha_ingreso=$7 WHERE id=$8 RETURNING *',
      [nombre, cargo, email, telefono, proyecto_id || null, estado, fecha_ingreso, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

empleadosRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM empleados WHERE id = $1', [req.params.id]);
    res.json({ message: 'Empleado eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PRESUPUESTOS ──────────────────────────────────────────────
const presupuestosRouter = express.Router();

presupuestosRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, c.nombre as cliente_nombre, p.nombre as proyecto_nombre
      FROM presupuestos pr
      LEFT JOIN clientes c ON c.id = pr.cliente_id
      LEFT JOIN proyectos p ON p.id = pr.proyecto_id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

presupuestosRouter.post('/', async (req, res) => {
  try {
    const { codigo, proyecto_id, cliente_id, concepto, subtotal, impuestos, estado, valido_hasta } = req.body;
    const total = subtotal * (1 + (impuestos || 7) / 100);
    const result = await pool.query(
      `INSERT INTO presupuestos (codigo, proyecto_id, cliente_id, concepto, subtotal, impuestos, total, estado, valido_hasta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [codigo, proyecto_id, cliente_id, concepto, subtotal, impuestos || 7, total, estado || 'Pendiente', valido_hasta]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

presupuestosRouter.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await pool.query('UPDATE presupuestos SET estado=$1 WHERE id=$2 RETURNING *', [estado, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PAGOS ─────────────────────────────────────────────────────
const pagosRouter = express.Router();

pagosRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pg.*, c.nombre as cliente_nombre, p.nombre as proyecto_nombre
      FROM pagos pg
      LEFT JOIN clientes c ON c.id = pg.cliente_id
      LEFT JOIN proyectos p ON p.id = pg.proyecto_id
      ORDER BY pg.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

pagosRouter.post('/', async (req, res) => {
  try {
    const { numero_factura, cliente_id, proyecto_id, concepto, monto, fecha_vencimiento, metodo_pago } = req.body;
    const result = await pool.query(
      `INSERT INTO pagos (numero_factura, cliente_id, proyecto_id, concepto, monto, fecha_vencimiento, metodo_pago)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [numero_factura, cliente_id, proyecto_id, concepto, monto, fecha_vencimiento, metodo_pago || 'Transferencia']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

pagosRouter.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await pool.query('UPDATE pagos SET estado=$1 WHERE id=$2 RETURNING *', [estado, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { proveedoresRouter, empleadosRouter, presupuestosRouter, pagosRouter };
