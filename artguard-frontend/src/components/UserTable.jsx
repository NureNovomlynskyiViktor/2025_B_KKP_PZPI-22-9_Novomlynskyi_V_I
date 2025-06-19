import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'viewer', id: null
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    const res = await axios.get('http://127.0.0.1:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  }, [token]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedUsers = () => {
    const sorted = [...users];
    if (sortField) {
      sorted.sort((a, b) => {
        const valA = a[sortField]?.toString().toLowerCase() ?? '';
        const valB = b[sortField]?.toString().toLowerCase() ?? '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/users/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://127.0.0.1:3000/api/users', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: '', email: '', password: '', role: 'viewer', id: null });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (u) => {
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити користувача?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const sortedUsers = getSortedUsers();

  const renderSortArrow = (field) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <input
          placeholder="Ім’я"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!form.id}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="viewer">viewer</option>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit">{form.id ? 'Зберегти' : 'Додати'}</button>
        {form.id && (
          <button
            type="button"
            onClick={() =>
              setForm({ name: '', email: '', password: '', role: 'viewer', id: null })
            }
          >
            Скасувати
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
              Ім’я{renderSortArrow('name')}
            </th>
            <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
              Email{renderSortArrow('email')}
            </th>
            <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
              Роль{renderSortArrow('role')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((u) => (
            <tr key={u.id}>
              <td style={{ display: 'none' }}>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Редагувати</button>
                <button onClick={() => handleDelete(u.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
