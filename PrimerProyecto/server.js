const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- VARIABLE GLOBAL EN TU PC ---
// Esta variable guardará quién eres tú después de hacer login
let ultimoIdLogueado = null; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: 'busan.dvpla.com',
  port: 3306,
  user: 'busan_formacion',
  password: 'formacion',
  database: 'busan_formacion'
});

db.connect(err => {
  if (err) { console.error('❌ Error BD:', err.message); return; }
  console.log('✅ Conectado a la BD');
});

// --- RUTA DE LOGIN (Actualizada para guardar ID) ---
app.get('/api/usuarios', (req, res) => {
  const { nombre, contraseña } = req.query;
  const sql = 'SELECT * FROM mw208_RecetasUsuarios WHERE nombre = ?'; 
  
  db.query(sql, [nombre], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      const usuario = results[0];
      if (usuario.contraseña === contraseña) {
        
        // GUARDAR ID EN LA MEMORIA DEL PC
        ultimoIdLogueado = usuario.id;
        console.log(`💻 PC RECORDANDO USUARIO ID: ${ultimoIdLogueado}`);

        res.json({ 
          success: true, 
          id: usuario.id,      
          usuario: usuario.nombre 
        });
      } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// --- RUTA PARA OBTENER CONTACTOS (Excluyéndote a ti mismo) ---
app.get('/api/mis-contactos', (req, res) => {
  if (!ultimoIdLogueado) {
    console.log("⚠️ Intento de acceso sin login previo en el PC");
    return res.status(401).json({ error: 'No hay sesión activa en el PC' });
  }

  console.log(`🔍 Buscando contactos para el ID guardado en PC: ${ultimoIdLogueado}`);
  const sql = 'SELECT id, nombre FROM mw208_RecetasUsuarios WHERE id != ?';
  
  db.query(sql, [ultimoIdLogueado], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- NUEVA RUTA: TRAER MENSAJES DEL CHAT ---
app.get('/api/mensajes/:otroUsuarioId/sesion-pc', (req, res) => {
    const otroUsuarioId = req.params.otroUsuarioId;
  
    if (!ultimoIdLogueado) {
      return res.status(401).json({ error: 'No hay sesión activa en el PC' });
    }
  
    // Buscamos mensajes entre el usuario logueado en el PC y el contacto seleccionado
    const sql = `
      SELECT * FROM mw208_RecetasMensajes 
      WHERE (id_emisor = ? AND id_receptor = ?) 
         OR (id_emisor = ? AND id_receptor = ?)
      ORDER BY fecha_envio ASC
    `;
  
    db.query(sql, [ultimoIdLogueado, otroUsuarioId, otroUsuarioId, ultimoIdLogueado], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

// --- RUTA PARA ENVIAR MENSAJES (Actualizada) ---
app.post('/api/mensajes', (req, res) => {
  let { id_emisor, id_receptor, contenido, tipo, id_referencia } = req.body || {};

  // Si el móvil envía "auto" o no envía nada, usamos el ID que guardó el servidor
  if (id_emisor === 'auto' || !id_emisor) {
    id_emisor = ultimoIdLogueado;
  }

  if (!id_emisor) {
    return res.status(401).json({ error: 'El servidor no sabe quién eres (ID no encontrado en PC)' });
  }

  const sql = 'INSERT INTO mw208_RecetasMensajes (id_emisor, id_receptor, contenido, tipo, id_referencia) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id_emisor, id_receptor, contenido, tipo, id_referencia], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Mensaje enviado', id: result.insertId });
  });
});

// --- OTRAS RUTAS ---

app.post('/api/usuarios', (req, res) => {
  const { nombre, contraseña } = req.body || {};
  if (!nombre || !contraseña) return res.status(400).json({ error: 'Faltan datos' });
  const sql = 'INSERT INTO mw208_RecetasUsuarios (nombre, contraseña) VALUES (?, ?)';
  db.query(sql, [nombre, contraseña], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuario creado', id: results.insertId });
  });
});
app.get('/api/recetas', (req, res) => {
  db.query('SELECT * FROM mw208_Recetas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
