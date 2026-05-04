const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const crearTablas = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        tipo VARCHAR(50) DEFAULT 'Empresa',
        email VARCHAR(200),
        telefono VARCHAR(50),
        direccion TEXT,
        estado VARCHAR(50) DEFAULT 'Prospecto',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proveedores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        categoria VARCHAR(100),
        contacto VARCHAR(200),
        email VARCHAR(200),
        telefono VARCHAR(50),
        plazo_pago VARCHAR(50) DEFAULT '30 días',
        estado VARCHAR(50) DEFAULT 'Activo',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proyectos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(300) NOT NULL,
        cliente_id INTEGER REFERENCES clientes(id),
        lider VARCHAR(200),
        fecha_inicio DATE,
        fecha_fin_estimada DATE,
        presupuesto DECIMAL(15,2),
        avance INTEGER DEFAULT 0,
        estado VARCHAR(50) DEFAULT 'Por iniciar',
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proyecto_proveedores (
        proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
        proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE CASCADE,
        PRIMARY KEY (proyecto_id, proveedor_id)
      );

      CREATE TABLE IF NOT EXISTS empleados (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        cargo VARCHAR(100),
        email VARCHAR(200),
        telefono VARCHAR(50),
        proyecto_id INTEGER REFERENCES proyectos(id),
        estado VARCHAR(50) DEFAULT 'Disponible',
        fecha_ingreso DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS presupuestos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        proyecto_id INTEGER REFERENCES proyectos(id),
        cliente_id INTEGER REFERENCES clientes(id),
        concepto TEXT,
        subtotal DECIMAL(15,2),
        impuestos DECIMAL(5,2) DEFAULT 7,
        total DECIMAL(15,2),
        estado VARCHAR(50) DEFAULT 'Pendiente',
        fecha_emision DATE DEFAULT CURRENT_DATE,
        valido_hasta DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        numero_factura VARCHAR(50) UNIQUE NOT NULL,
        cliente_id INTEGER REFERENCES clientes(id),
        proyecto_id INTEGER REFERENCES proyectos(id),
        concepto TEXT,
        monto DECIMAL(15,2),
        fecha_vencimiento DATE,
        metodo_pago VARCHAR(50) DEFAULT 'Transferencia',
        estado VARCHAR(50) DEFAULT 'Pendiente',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        empresa VARCHAR(200),
        email VARCHAR(200),
        telefono VARCHAR(50),
        tipo_obra VARCHAR(100),
        valor_estimado DECIMAL(15,2),
        etapa VARCHAR(50) DEFAULT 'Nuevo contacto',
        temperatura VARCHAR(20) DEFAULT 'Tibio',
        asignado_a VARCHAR(200),
        fuente VARCHAR(100),
        ultimo_contacto VARCHAR(100) DEFAULT 'Hoy',
        fecha_ingreso DATE DEFAULT CURRENT_DATE,
        descripcion TEXT,
        proxima_accion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lead_acciones (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        texto TEXT NOT NULL,
        hecho BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lead_historial (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        nota TEXT NOT NULL,
        fecha VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error creando tablas:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, crearTablas };
