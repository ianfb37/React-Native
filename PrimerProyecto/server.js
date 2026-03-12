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

let ultimoIdLogueado = null; 

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
    console.error(err.message); 
    return; 
  }
  console.log('Conectado');
});

app.get('/api/usuarios', (req, res) => {
  const { nombre, contraseña } = req.query;
  const sql = 'SELECT * FROM mw208_RecetasUsuarios WHERE nombre = ?'; 
  
  db.query(sql, [nombre], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      const usuario = results[0];

      if (usuario.contraseña === contraseña) {
        ultimoIdLogueado = usuario.id;
        res.json({ 
          success: true, 
          id: usuario.id,      
          usuario: usuario.nombre,
          imagen: usuario.imagen 
        });
      } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

app.post('/api/usuarios', upload.single('imagen'), (req, res) => {
  const { nombre, password } = req.body;
  
  if (!nombre || !password) {
    return res.status(400).json({ 
      error: 'Faltan datos',
      recibido: req.body 
    });
  }

  const rutaImagen = req.file 
    ? `/uploads/${req.file.filename}` 
    : '/assets/default.jpg'; 

  const sql = 'INSERT INTO mw208_RecetasUsuarios (nombre, contraseña, imagen) VALUES (?, ?, ?)';
  
  db.query(sql, [nombre, password, rutaImagen], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true,
      id: results.insertId,
      imagen: rutaImagen 
    });
  });
});

app.get('/api/mis-contactos', (req, res) => {
  if (!ultimoIdLogueado) return res.status(401).json({ error: 'No hay sesión' });

  const sql = 'SELECT id, nombre, imagen FROM mw208_RecetasUsuarios WHERE id != ?';
  db.query(sql, [ultimoIdLogueado], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/mensajes/:otroUsuarioId/sesion-pc', (req, res) => {
    const otroUsuarioId = req.params.otroUsuarioId;
    if (!ultimoIdLogueado) return res.status(401).json({ error: 'No hay sesión' });
  
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

app.post('/api/mensajes', (req, res) => {
  let { id_emisor, id_receptor, contenido, tipo, id_referencia } = req.body || {};
  if (id_emisor === 'auto' || !id_emisor) id_emisor = ultimoIdLogueado;

  const sql = 'INSERT INTO mw208_RecetasMensajes (id_emisor, id_receptor, contenido, tipo, id_referencia) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id_emisor, id_receptor, contenido, tipo, id_referencia], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

app.get('/api/recetas', (req, res) => {
  db.query('SELECT * FROM mw208_Recetas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get('/api/usuarios/perfil-actual', (req, res) => {
  if (!ultimoIdLogueado) {
    return res.status(404).json({ success: false, error: 'No hay sesión' });
  }

  const sql = 'SELECT nombre, imagen FROM mw208_RecetasUsuarios WHERE id = ?';
  db.query(sql, [ultimoIdLogueado], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ success: false });
    
    res.json({
      success: true,
      nombre: results[0].nombre,
      imagen: results[0].imagen
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Puerto ${PORT}`);
});