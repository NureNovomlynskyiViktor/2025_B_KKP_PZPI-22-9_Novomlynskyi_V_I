import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserForm({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '', 
        role: user.role || 'viewer',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await axios.put(`http://127.0.0.1:3000/api/users/${user.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:3000/api/users`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      alert('Помилка при збереженні');
      console.error(err);
    }
  };

  return (
    <div style={{ border: '1px solid gray', padding: '1rem', marginTop: '1rem' }}>
      <h3>{user ? 'Редагувати користувача' : 'Новий користувач'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Ім’я" value={form.name} onChange={handleChange} required /><br />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          type="password"
          required={!user}
        /><br />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="viewer">viewer</option>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select><br />
        <button type="submit">{user ? 'Зберегти' : 'Створити'}</button>
        <button type="button" onClick={onClose} style={{ marginLeft: '1rem' }}>Скасувати</button>
      </form>
    </div>
  );
}
