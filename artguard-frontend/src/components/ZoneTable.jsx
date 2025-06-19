import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function ZoneTable() {
  const [zones, setZones] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [form, setForm] = useState({ name: '', museum_id: '', id: null });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const [zonesRes, museumsRes] = await Promise.all([
      axios.get('http://127.0.0.1:3000/api/zones', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://127.0.0.1:3000/api/museums', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setZones(zonesRes.data);
    setMuseums(museumsRes.data);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      museum_id: form.museum_id,
    };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/zones/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://127.0.0.1:3000/api/zones', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: '', museum_id: '', id: null });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (z) => {
    setForm({
      id: z.id,
      name: z.name,
      museum_id: z.museum_id,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити зону?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/zones/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const getMuseumName = (id) =>
    museums.find((m) => m.id === id)?.name || '—';

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedZones = () => {
    const sorted = [...zones];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'museum') {
          aVal = getMuseumName(a.museum_id).toLowerCase();
          bVal = getMuseumName(b.museum_id).toLowerCase();
        } else {
          aVal = a[sortField]?.toString().toLowerCase() ?? '';
          bVal = b[sortField]?.toString().toLowerCase() ?? '';
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
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
    fetchData();
  }, [fetchData]);

  const sortedZones = getSortedZones();

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <input
          placeholder="Назва"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          value={form.museum_id}
          onChange={(e) => setForm({ ...form, museum_id: e.target.value })}
          required
        >
          <option value="">Виберіть музей</option>
          {museums.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button type="submit">{form.id ? 'Зберегти' : 'Додати'}</button>
        {form.id && (
          <button type="button" onClick={() => setForm({ name: '', museum_id: '', id: null })}>
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
            <th onClick={() => handleSort('museum')} style={{ cursor: 'pointer' }}>
              Музей{renderArrow('museum')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedZones.map((z) => (
            <tr key={z.id}>
              <td style={{ display: 'none' }}>{z.id}</td>
              <td>{z.name}</td>
              <td>{getMuseumName(z.museum_id)}</td>
              <td>
                <button onClick={() => handleEdit(z)}>Редагувати</button>
                <button onClick={() => handleDelete(z.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
