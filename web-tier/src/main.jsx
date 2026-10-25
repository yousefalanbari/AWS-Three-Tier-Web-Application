import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function loadTasks() {
    try {
      const response = await fetch(`${apiBase}/api/tasks`);
      if (!response.ok) throw new Error('Could not load tasks');
      setTasks(await response.json());
      setMessage('');
    } catch {
      setMessage('Unable to reach the application tier.');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    const response = await fetch(`${apiBase}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (response.ok) {
      setTitle('');
      setDescription('');
      await loadTasks();
    } else {
      setMessage('Could not create the task.');
    }
  }

  async function updateStatus(id, status) {
    await fetch(`${apiBase}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadTasks();
  }

  async function removeTask(id) {
    await fetch(`${apiBase}/api/tasks/${id}`, { method: 'DELETE' });
    await loadTasks();
  }

  return (
    <main className="container">
      <header>
        <p className="eyebrow">AWS THREE-TIER DEMO</p>
        <h1>Task Manager</h1>
        <p>React web tier, Express application tier, and MySQL database tier.</p>
      </header>

      <form onSubmit={addTask} className="panel form-grid">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          required
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add task</button>
      </form>

      {message && <p className="message">{message}</p>}

      <section className="task-grid">
        {tasks.map((task) => (
          <article className="panel task" key={task.id}>
            <div>
              <span className="status">{task.status}</span>
              <h2>{task.title}</h2>
              <p>{task.description || 'No description provided.'}</p>
            </div>
            <div className="actions">
              <select
                value={task.status}
                onChange={(event) => updateStatus(task.id, event.target.value)}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <button className="danger" onClick={() => removeTask(task.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
