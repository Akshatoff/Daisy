'use client'

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";

/* ---- Daily Tasks Popup ---- */
const DailyPopup = ({ show, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const val = localStorage.getItem("TASK");
    setTasks(val ? JSON.parse(val) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("TASK", JSON.stringify(tasks));
  }, [tasks]);

  const add = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks(t => [...t, { id: crypto.randomUUID(), title: input.trim(), completed: false }]);
    setInput("");
  };

  const toggle = (id, val) =>
    setTasks(t => t.map(x => x.id === id ? { ...x, completed: val } : x));

  const remove = (id) => setTasks(t => t.filter(x => x.id !== id));

  const startEdit = (id, text) => { setEditId(id); setEditText(text); };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(t => t.map(x => x.id === id ? { ...x, title: editText.trim() } : x));
    setEditId(null);
    setEditText("");
  };

  return (
    <div className={`popup-overlay ${show ? "show" : ""}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="popup-box">
        <h2>Daily Tasks</h2>

        <form onSubmit={add} style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a daily task…"
          />
          <button type="submit" className="btn btn-gold" style={{ whiteSpace: "nowrap" }}>Add</button>
        </form>

        <ul className="todo-list">
          {tasks.length === 0 && (
            <p style={{ color: "var(--text3)", fontSize: "0.9rem" }}>No daily tasks yet.</p>
          )}
          {tasks.map(task => (
            <li key={task.id} className={`todo-item ${task.completed ? "completed" : ""}`}>
              {editId === task.id ? (
                <div className="todo-edit-row">
                  <input
                    className="input"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ padding: "0.4rem 0.8rem" }}
                  />
                  <button className="btn btn-gold" onClick={() => saveEdit(task.id)} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditId(null)}>×</button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={task.completed}
                    onChange={e => toggle(task.id, e.target.checked)}
                  />
                  <span className="todo-text">{task.title}</span>
                  <div className="todo-actions">
                    <button className="todo-action-btn" onClick={() => startEdit(task.id, task.title)}>Edit</button>
                    <button className="todo-action-btn danger" onClick={() => remove(task.id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <button className="btn btn-outline" style={{ marginTop: "1.5rem" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

/* ---- Main Page ---- */
const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDaily, setShowDaily] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem("ITEMS");
    setTodos(val ? JSON.parse(val) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("ITEMS", JSON.stringify(todos));
  }, [todos]);

  const add = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos(t => [...t, { id: crypto.randomUUID(), title: input.trim(), completed: false }]);
    setInput("");
  };

  const toggle = (id, val) =>
    setTodos(t => t.map(x => x.id === id ? { ...x, completed: val } : x));

  const remove = (id) => setTodos(t => t.filter(x => x.id !== id));

  const startEdit = (id, text) => { setEditId(id); setEditText(text); };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(t => t.map(x => x.id === id ? { ...x, title: editText.trim() } : x));
    setEditId(null);
    setEditText("");
  };

  const clearAll = () => {
    localStorage.removeItem("ITEMS");
    setTodos([]);
  };

  const remaining = todos.filter(t => !t.completed).length;

  return (
    <>
      <Nav />
      <DailyPopup show={showDaily} onClose={() => setShowDaily(false)} />

      <div className="todo-page">
        <div className="todo-header-row">
          <div>
            <p className="page-eyebrow">Your list</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "var(--text)", lineHeight: 1.1 }}>
              To-Do
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {todos.length > 0 && (
              <span style={{ fontSize: "0.82rem", color: "var(--text3)" }}>
                {remaining} remaining
              </span>
            )}
            <button className="daily-sun-btn" onClick={() => setShowDaily(true)}>
              ☀ Daily Tasks
            </button>
          </div>
        </div>

        <form onSubmit={add} className="todo-add-form">
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button type="submit" className="btn btn-gold" style={{ whiteSpace: "nowrap" }}>Add task</button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p className="todo-section-label">Tasks</p>
          {todos.length > 0 && (
            <button className="btn btn-ghost" onClick={clearAll} style={{ fontSize: "0.8rem", color: "var(--danger)" }}>
              Clear all
            </button>
          )}
        </div>

        <ul className="todo-list">
          {todos.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text3)", fontSize: "0.9rem" }}>
              No tasks yet — add one above
            </div>
          )}

          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
              {editId === todo.id ? (
                <div className="todo-edit-row">
                  <input
                    className="input"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ padding: "0.4rem 0.8rem" }}
                  />
                  <button className="btn btn-gold" onClick={() => saveEdit(todo.id)} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditId(null)}>×</button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={e => toggle(todo.id, e.target.checked)}
                  />
                  <span className="todo-text">{todo.title}</span>
                  <div className="todo-actions">
                    <button className="todo-action-btn" onClick={() => startEdit(todo.id, todo.title)}>Edit</button>
                    <button className="todo-action-btn danger" onClick={() => remove(todo.id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TodoPage;
