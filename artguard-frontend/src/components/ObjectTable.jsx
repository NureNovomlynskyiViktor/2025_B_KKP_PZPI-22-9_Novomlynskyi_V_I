import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function ObjectTable() {
  const [objects, setObjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    material: '',
    value: '',
    creation_date: '',
    zone_id: '',
    id: null,
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const [objRes, zoneRes] = await Promise.all([
      axios.get('http://127.0.0.1:3000/api/objects', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://127.0.0.1:3000/api/zones', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setObjects(objRes.data);
    setZones(zoneRes.data);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/objects/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:3000/api/objects`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({
        name: '',
        description: '',
        material: '',
        value: '',
        creation_date: '',
        zone_id: '',
        id: null,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (obj) => {
    setForm({ ...obj });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити об’єкт?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/objects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const getZoneName = (id) => zones.find((z) => z.id === id)?.name || '—';

  const formatDate = (isoString) => isoString?.split('T')[0] || '';

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderArrow = (field) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const getSortedObjects = () => {
    const sorted = [...objects];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;

        if (sortField === 'zone') {
          aVal = getZoneName(a.zone_id).toLowerCase();
          bVal = getZoneName(b.zone_id).toLowerCase();
        } else if (sortField === 'creation_date') {
          aVal = a.creation_date || '';
          bVal = b.creation_date || '';
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedObjects = getSortedObjects();

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <input
          placeholder="Назва"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Опис"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Матеріал"
          value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
        />
        <input
          placeholder="Цінність"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />
        <input
          type="date"
          value={form.creation_date}
          onChange={(e) =>
            setForm({ ...form, creation_date: e.target.value })
          }
        />
        <select
          value={form.zone_id}
          onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
          required
        >
          <option value="">Оберіть зону</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <button type="submit">{form.id ? 'Зберегти' : 'Додати'}</button>
        {form.id && (
          <button
            type="button"
            onClick={() =>
              setForm({
                name: '',
                description: '',
                material: '',
                value: '',
                creation_date: '',
                zone_id: '',
                id: null,
              })
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
              Назва{renderArrow('name')}
            </th>
            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
              Опис{renderArrow('description')}
            </th>
            <th onClick={() => handleSort('material')} style={{ cursor: 'pointer' }}>
              Матеріал{renderArrow('material')}
            </th>
            <th onClick={() => handleSort('value')} style={{ cursor: 'pointer' }}>
              Цінність{renderArrow('value')}
            </th>
            <th onClick={() => handleSort('creation_date')} style={{ cursor: 'pointer' }}>
              Дата створення{renderArrow('creation_date')}
            </th>
            <th onClick={() => handleSort('zone')} style={{ cursor: 'pointer' }}>
              Зона{renderArrow('zone')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedObjects.map((o) => (
            <tr key={o.id}>
              <td style={{ display: 'none' }}>{o.id}</td>
              <td>{o.name}</td>
              <td>{o.description}</td>
              <td>{o.material}</td>
              <td>{o.value}</td>
              <td>{formatDate(o.creation_date)}</td>
              <td>{getZoneName(o.zone_id)}</td>
              <td>
                <button onClick={() => handleEdit(o)}>Редагувати</button>
                <button onClick={() => handleDelete(o.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




