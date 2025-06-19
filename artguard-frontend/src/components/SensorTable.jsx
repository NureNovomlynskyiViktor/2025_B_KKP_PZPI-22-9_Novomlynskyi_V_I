import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function SensorTable() {
  const [sensors, setSensors] = useState([]);
  const [objects, setObjects] = useState([]);
  const [form, setForm] = useState({
    identifier: '',
    type: '',
    unit: '',
    object_id: '',
    id: null,
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const [sensorRes, objectRes] = await Promise.all([
      axios.get('http://127.0.0.1:3000/api/sensors', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://127.0.0.1:3000/api/objects', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setSensors(sensorRes.data);
    setObjects(objectRes.data);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/sensors/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:3000/api/sensors`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ identifier: '', type: '', unit: '', object_id: '', id: null });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (s) => {
    setForm({ ...s });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити сенсор?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/sensors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const getObjectName = (id) =>
    objects.find((o) => o.id === id)?.name || '—';

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

  const getSortedSensors = () => {
    const sorted = [...sensors];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'object') {
          aVal = getObjectName(a.object_id).toLowerCase();
          bVal = getObjectName(b.object_id).toLowerCase();
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

  const sortedSensors = getSortedSensors();

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <input
          placeholder="Інвентарний код"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
        >
          <option value="">Тип сенсора</option>
          <option value="temperature">temperature</option>
          <option value="humidity">humidity</option>
          <option value="vibration">vibration</option>
        </select>
        <input
          placeholder="Одиниця виміру"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          required
        />
        <select
          value={form.object_id}
          onChange={(e) => setForm({ ...form, object_id: e.target.value })}
          required
        >
          <option value="">Оберіть об'єкт</option>
          {objects.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <button type="submit">{form.id ? 'Зберегти' : 'Додати'}</button>
        {form.id && (
          <button type="button" onClick={() => setForm({
            identifier: '',
            type: '',
            unit: '',
            object_id: '',
            id: null,
          })}>
            Скасувати
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('identifier')} style={{ cursor: 'pointer' }}>
              Інв. код{renderArrow('identifier')}
            </th>
            <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
              Тип{renderArrow('type')}
            </th>
            <th onClick={() => handleSort('unit')} style={{ cursor: 'pointer' }}>
              Одиниця{renderArrow('unit')}
            </th>
            <th onClick={() => handleSort('object')} style={{ cursor: 'pointer' }}>
              Об'єкт{renderArrow('object')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedSensors.map((s) => (
            <tr key={s.id}>
              <td style={{ display: 'none' }}>{s.id}</td>
              <td>{s.identifier}</td>
              <td>{s.type}</td>
              <td>{s.unit}</td>
              <td>{getObjectName(s.object_id)}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Редагувати</button>
                <button onClick={() => handleDelete(s.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



