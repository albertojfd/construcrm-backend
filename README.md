# ConstruCRM — Backend

## Estructura de archivos
```
construcrm-backend/
├── src/
│   ├── index.js          ← Servidor principal
│   ├── db/
│   │   └── database.js   ← Conexión y tablas PostgreSQL
│   └── routes/
│       ├── leads.js      ← API de leads
│       ├── clientes.js   ← API de clientes
│       ├── proyectos.js  ← API de proyectos
│       └── otros.js      ← Proveedores, empleados, pagos, presupuestos
├── public/
│   └── index.html        ← Aquí va el archivo del CRM
├── package.json
├── .env.example
└── .gitignore
```

---

## INSTRUCCIONES DE DESPLIEGUE PASO A PASO

### Paso 1 — Preparar los archivos en tu computadora

1. Crea una carpeta llamada `construcrm-backend` en tu escritorio
2. Copia todos estos archivos dentro manteniendo la misma estructura
3. Crea una carpeta llamada `public` dentro de `construcrm-backend`
4. Copia el archivo `crm_construccion.html` dentro de `public/` y renómbralo a `index.html`

### Paso 2 — Subir a GitHub

1. Ve a **github.com** e inicia sesión
2. Clic en el botón verde **"New"** (esquina superior izquierda)
3. Nombre del repositorio: `construcrm-backend`
4. Asegúrate que esté en **"Public"**
5. Clic en **"Create repository"**
6. En la página siguiente verás instrucciones. Abre la terminal (en Windows: tecla Windows + R, escribe `cmd`, Enter)
7. Escribe estos comandos uno por uno:

```bash
cd Desktop/construcrm-backend
git init
git add .
git commit -m "primer despliegue"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/construcrm-backend.git
git push -u origin main
```
(Reemplaza TU_USUARIO con tu nombre de usuario de GitHub)

### Paso 3 — Desplegar en Railway

1. Ve a **railway.app** e inicia sesión con GitHub
2. Clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona `construcrm-backend`
5. Railway detectará Node.js automáticamente

### Paso 4 — Agregar la base de datos

1. En tu proyecto de Railway, clic en **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Espera que se cree (30 segundos)
4. Clic en la base de datos → pestaña **"Variables"**
5. Copia el valor de **DATABASE_URL**

### Paso 5 — Configurar variables de entorno

1. Clic en tu servicio Node.js en Railway
2. Ve a la pestaña **"Variables"**
3. Agrega:
   - `DATABASE_URL` = (el valor que copiaste en el paso anterior)
   - `NODE_ENV` = `production`
4. Railway reiniciará automáticamente

### Paso 6 — Obtener tu URL

1. Ve a la pestaña **"Settings"** de tu servicio
2. En la sección **"Domains"** clic en **"Generate Domain"**
3. Obtendrás una URL como: `construcrm-backend.up.railway.app`
4. Ábrela en tu teléfono o iPad — ¡tu CRM estará disponible!

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | Métricas generales |
| GET/POST | /api/leads | Listar/crear leads |
| PUT/DELETE | /api/leads/:id | Actualizar/eliminar lead |
| POST | /api/leads/:id/acciones | Agregar acción |
| POST | /api/leads/:id/historial | Agregar actividad |
| GET/POST | /api/clientes | Listar/crear clientes |
| GET/POST | /api/proyectos | Listar/crear proyectos |
| GET/POST | /api/proveedores | Listar/crear proveedores |
| GET/POST | /api/empleados | Listar/crear empleados |
| GET/POST | /api/presupuestos | Listar/crear presupuestos |
| GET/POST | /api/pagos | Listar/crear pagos |
