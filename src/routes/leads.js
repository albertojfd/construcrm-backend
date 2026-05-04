const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

// GET todos los leads con sus acciones e historial
router.get('/', async (req, res) => {
  try {
    const leads = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    const result = [];
    for (const lead of leads.rows) {
      const acciones = await pool.query('SELECT * FROM lead_acciones WHERE lead_id = $1 ORDER BY created_at ASC', [lead.id]);
      const historial = await pool.query('SELECT * FROM lead_historial WHERE lead_id = $1 ORDER BY created_at DESC', [lead.id]);
      result.push({ ...lead, acciones: acciones.rows, historial: historial.rows });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un lead por id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (!lead.rows.length) return res.status(404).json({ error: 'Lead no encontrado' });
    const acciones = await pool.query('SELECT * FROM lead_acciones WHERE lead_id = $1 ORDER BY created_at ASC', [id]);
    const historial = await pool.query('SELECT * FROM lead_historial WHERE lead_id = $1 ORDER BY created_at DESC', [id]);
    res.json({ ...lead.rows[0], acciones: acciones.rows, historial: historial.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear lead
router.post('/', async (req, res) => {
  try {
    const { nombre, empresa, email, telefono, tipo_obra, valor_estimado, etapa, temperatura, asignado_a, fuente, descripcion, proxima_accion } = req.body;
    const result = await pool.query(
      `INSERT INTO leads (nombre, empresa, email, telefono, tipo_obra, valor_estimado, etapa, temperatura, asignado_a, fuente, descripcion, proxima_accion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [nombre, empresa, email, telefono, tipo_obra, valor_estimado, etapa || 'Nuevo contacto', temperatura || 'Tibio', asignado_a, fuente, descripcion, proxima_accion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar lead (etapa, temperatura, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, empresa, email, telefono, tipo_obra, valor_estimado, etapa, temperatura, asignado_a, fuente, descripcion, proxima_accion, ultimo_contacto } = req.body;
    const result = await pool.query(
      `UPDATE leads SET nombre=$1, empresa=$2, email=$3, telefono=$4, tipo_obra=$5,
       valor_estimado=$6, etapa=$7, temperatura=$8, asignado_a=$9, fuente=$10,
       descripcion=$11, proxima_accion=$12, ultimo_contacto=$13 WHERE id=$14 RETURNING *`,
      [nombre, empresa, email, telefono, tipo_obra, valor_estimado, etapa, temperatura, asignado_a, fuente, descripcion, proxima_accion, ultimo_contacto, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ message: 'Lead eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST agregar acción a un lead
router.post('/:id/acciones', async (req, res) => {
  try {
    const { texto } = req.body;
    const result = await pool.query(
      'INSERT INTO lead_acciones (lead_id, texto) VALUES ($1, $2) RETURNING *',
      [req.params.id, texto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT marcar acción como hecha/pendiente
router.put('/:id/acciones/:accionId', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE lead_acciones SET hecho = $1 WHERE id = $2 RETURNING *',
      [req.body.hecho, req.params.accionId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE acción
router.delete('/:id/acciones/:accionId', async (req, res) => {
  try {
    await pool.query('DELETE FROM lead_acciones WHERE id = $1', [req.params.accionId]);
    res.json({ message: 'Acción eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST agregar actividad al historial
router.post('/:id/historial', async (req, res) => {
  try {
    const { tipo, nota, fecha } = req.body;
    const result = await pool.query(
      'INSERT INTO lead_historial (lead_id, tipo, nota, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, tipo, nota, fecha]
    );
    // Actualizar ultimo_contacto
    await pool.query("UPDATE leads SET ultimo_contacto = 'Hoy' WHERE id = $1", [req.params.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE actividad del historial
router.delete('/:id/historial/:histId', async (req, res) => {
  try {
    await pool.query('DELETE FROM lead_historial WHERE id = $1', [req.params.histId]);
    res.json({ message: 'Actividad eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
