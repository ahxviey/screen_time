const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('it320')); // Serve static files

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'screentime_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// GET all screen time data
app.get('/getScreenTimeData', (req, res) => {
  db.query('SELECT * FROM screen_time', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});
// UPDATE screen time record
app.put('/updateScreenTime/:id', (req, res) => {
    const { age, gender, screen_time_type, day_type, average_screen_time, sample_size } = req.body;
    const id = req.params.id;
  
    const sql = `
      UPDATE screen_time SET
        Age = ?,
        Gender = ?,
        \`Screen Time Type\` = ?,
        \`Day Type\` = ?,
        \`Average Screen Time (hours)\` = ?,
        \`Sample Size\` = ?
      WHERE id = ?
    `;
  
    db.query(sql, [age, gender, screen_time_type, day_type, average_screen_time, sample_size, id], (err, result) => {
      if (err) {
        console.error('Error updating data:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: 'Record updated successfully' });
    });
  });
  

// INSERT new analytics data
app.post('/update-analytics', (req, res) => {
  const { age, gender, screen_time_type, day_type, average_screen_time, sample_size } = req.body;

  const sql = `
    INSERT INTO screen_time 
    (Age, Gender, \`Screen Time Type\`, \`Day Type\`, \`Average Screen Time (hours)\`, \`Sample Size\`) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [age, gender, screen_time_type, day_type, average_screen_time, sample_size], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, insertedId: result.insertId });
  });
});

// DELETE screen time record by ID
app.delete('/deleteScreenTime/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM screen_time WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'No record found with that ID' });
    }

    res.json({ success: true, message: 'Data deleted successfully' });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
