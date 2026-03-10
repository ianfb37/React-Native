const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); 

const app = express();
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json()); 

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
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
  if (err) {
    console.error('❌ Error conectando a la BD:', err.message);
    return;
  }
  console.log('✅ Conectado con éxito a la BD remota');
});

// --- RUTA GET: Login / Obtener usuario ---
// Cambié _req por req para que puedas usar req.query
app.get('/api/usuarios', (req, res) => {
  const { nombre, contraseña } = req.query;
  const sql = 'SELECT * FROM mw208_RecetasUsuarios WHERE nombre = ?'; 
  
  db.query(sql, [nombre], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      const usuario = results[0];
      // Comparamos la contraseña (en producción usa bcrypt para encriptar)
      if (usuario.contraseña === contraseña) {
        res.json(usuario);
      } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// --- RUTA PUT: Crear usuario ---
// Corregido el paréntesis que cerraba antes de tiempo
app.put('/api/usuarios', (req, res) => {
  const { nombre, contraseña } = req.body || {};
  
  if (!nombre || !contraseña) {
    return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
  }

  const sql = 'INSERT INTO mw208_RecetasUsuarios (nombre, contraseña) VALUES (?, ?)';
  db.query(sql, [nombre, contraseña], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Usuario creado exitosamente', id: results.insertId });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});