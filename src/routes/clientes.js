const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as total_proyectos
      FROM clientes c
      LEFT JOIN proyectos p ON p.cliente_id = c.id
      GROUP BY c.id ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const cliente = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (!cliente.rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    const proyectos = await pool.query('SELECT * FROM proyectos WHERE cliente_id = $1', [req.params.id]);
    res.json({ ...cliente.rows[0], proyectos: proyectos.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, tipo, email, telefono, direccion, estado } = req.body;
    const result = await pool.query(
      'INSERT INTO clientes (nombre, tipo, email, telefono, direccion, estado) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, tipo || 'Empresa', email, telefono, direccion, estado || 'Prospecto']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, tipo, email, telefono, direccion, estado } = req.body;
    const result = await pool.query(
      'UPDATE clientes SET nombre=$1,tipo=$2,email=$3,telefono=$4,direccion=$5,estado=$6 WHERE id=$7 RETURNING *',
      [nombre, tipo, email, telefono, direccion, estado, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
