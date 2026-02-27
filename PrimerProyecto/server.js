const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// IMPORTANTE: Añade esto para que la API pueda leer el JSON que envía tu App
app.use(express.json()); 

const db = mysql.createConnection({
  host: 'busan.dvpla.com',
  port: 3306,
  user: 'busan_formacion',
  password: 'busan',
  database: 'busan_formacion'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error conectando a la BD de Busan:', err.message);
    return;
  }
  console.log('✅ Conectado con éxito a la BD remota de Busan');
});

// --- RUTA GET: Obtener todas las recetas ---
app.get('/api/recetas', (req, res) => {
  const sql = 'SELECT * FROM mw208_Recetas'; 
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// --- NUEVA RUTA PUT: Editar una receta por ID ---
app.put('/api/recetas/:id', (req, res) => {
  const { id } = req.params; // Sacamos la ID de la URL
  const { nombre, descripcion } = req.body; // Sacamos los nuevos datos del cuerpo del mensaje

  // Consulta SQL para actualizar
  const sql = 'UPDATE mw208_Recetas SET nombre = ?, descripcion = ?, estado = ? WHERE id = ?';

  db.query(sql, [nombre, descripcion,estado, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar en la BD:', err);
      return res.status(500).json({ error: 'Error al actualizar la receta' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró ninguna receta con esa ID' });
    }

    console.log(`✅ Receta ${id} actualizada con éxito`);
    res.json({ message: 'Receta actualizada correctamente' });
  });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Local de Busan corriendo en http://81.42.203.159:${PORT}`);
});
