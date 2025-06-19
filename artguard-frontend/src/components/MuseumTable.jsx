import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function MuseumTable() {
  const [museums, setMuseums] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', id: null });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const token = localStorage.getItem('token');

  const fetchMuseums = useCallback(async () => {
    const res = await axios.get('http://127.0.0.1:3000/api/museums', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMuseums(res.data);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, location: form.location };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/museums/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:3000/api/museums`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: '', location: '', id: null });
      fetchMuseums();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (m) => {
    setForm({ id: m.id, name: m.name, location: m.location });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити музей?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/museums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMuseums();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedMuseums = () => {
    const sorted = [...museums];
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

  const renderArrow = (field) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  useEffect(() => {
    fetchMuseums();
  }, [fetchMuseums]);

  const sortedMuseums = getSortedMuseums();

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <input
          placeholder="Назва музею"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Локація"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <button type="submit">{form.id ? 'Зберегти' : 'Додати'}</button>
        {form.id && (
          <button type="button" onClick={() => setForm({ name: '', location: '', id: null })}>
            Скасувати
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
              Назва{renderArrow('name')}
            </th>
            <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
              Локація{renderArrow('location')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedMuseums.map((m) => (
            <tr key={m.id}>
              <td style={{ display: 'none' }}>{m.id}</td>
              <td>{m.name}</td>
              <td>{m.location}</td>
              <td>
                <button onClick={() => handleEdit(m)}>Редагувати</button>
                <button onClick={() => handleDelete(m.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



