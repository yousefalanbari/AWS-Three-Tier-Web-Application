const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'webappdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, status, created_at FROM tasks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description = '', status = 'Pending' } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
      [title.trim(), description.trim(), status]
    );
    const [rows] = await pool.query(
      'SELECT id, title, description, status, created_at FROM tasks WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'In Progress', 'Completed'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});
