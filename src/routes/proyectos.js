const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email
      FROM proyectos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const proyecto = await pool.query(`
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email, c.telefono as cliente_telefono
      FROM proyectos p LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1`, [req.params.id]);
    if (!proyecto.rows.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
    const proveedores = await pool.query(`
      SELECT pv.* FROM proveedores pv
      JOIN proyecto_proveedores pp ON pp.proveedor_id = pv.id
      WHERE pp.proyecto_id = $1`, [req.params.id]);
    const empleados = await pool.query('SELECT * FROM empleados WHERE proyecto_id = $1', [req.params.id]);
    res.json({ ...proyecto.rows[0], proveedores: proveedores.rows, empleados: empleados.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, cliente_id, lider, fecha_inicio, fecha_fin_estimada, presupuesto, estado, descripcion } = req.body;
    const result = await pool.query(
      `INSERT INTO proyectos (nombre, cliente_id, lider, fecha_inicio, fecha_fin_estimada, presupuesto, estado, descripcion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nombre, cliente_id, lider, fecha_inicio, fecha_fin_estimada, presupuesto, estado || 'Por iniciar', descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, cliente_id, lider, fecha_inicio, fecha_fin_estimada, presupuesto, avance, estado, descripcion } = req.body;
    const result = await pool.query(
      `UPDATE proyectos SET nombre=$1, cliente_id=$2, lider=$3, fecha_inicio=$4,
       fecha_fin_estimada=$5, presupuesto=$6, avance=$7, estado=$8, descripcion=$9
       WHERE id=$10 RETURNING *`,
      [nombre, cliente_id, lider, fecha_inicio, fecha_fin_estimada, presupuesto, avance, estado, descripcion, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Vincular proveedor a proyecto
router.post('/:id/proveedores', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO proyecto_proveedores (proyecto_id, proveedor_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.params.id, req.body.proveedor_id]
    );
    res.status(201).json({ message: 'Proveedor vinculado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/proveedores/:proveedorId', async (req, res) => {
  try {
    await pool.query('DELETE FROM proyecto_proveedores WHERE proyecto_id=$1 AND proveedor_id=$2',
      [req.params.id, req.params.proveedorId]);
    res.json({ message: 'Proveedor desvinculado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
