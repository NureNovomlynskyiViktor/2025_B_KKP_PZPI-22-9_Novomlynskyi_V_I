import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function ThresholdTable() {
  const [thresholds, setThresholds] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    sensor_type: '',
    min_value: '',
    max_value: '',
    zone_id: '',
    id: null,
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const [thrRes, zoneRes] = await Promise.all([
      axios.get('http://127.0.0.1:3000/api/thresholds', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://127.0.0.1:3000/api/zones', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setThresholds(thrRes.data);
    setZones(zoneRes.data);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form };

    try {
      if (form.id) {
        await axios.put(`http://127.0.0.1:3000/api/thresholds/${form.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:3000/api/thresholds`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ sensor_type: '', min_value: '', max_value: '', zone_id: '', id: null });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (thr) => {
    setForm({ ...thr });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити поріг?')) return;
    await axios.delete(`http://127.0.0.1:3000/api/thresholds/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const getZoneName = (id) =>
    zones.find((z) => z.id === id)?.name || '—';

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

  const getSortedThresholds = () => {
    const sorted = [...thresholds];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'zone') {
          aVal = getZoneName(a.zone_id).toLowerCase();
          bVal = getZoneName(b.zone_id).toLowerCase();
        } else if (['min_value', 'max_value'].includes(sortField)) {
          aVal = parseFloat(a[sortField]);
          bVal = parseFloat(b[sortField]);
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

  const sortedThresholds = getSortedThresholds();

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <select
          value={form.sensor_type}
          onChange={(e) => setForm({ ...form, sensor_type: e.target.value })}
          required
        >
          <option value="">Тип сенсора</option>
          <option value="temperature">temperature</option>
          <option value="humidity">humidity</option>
          <option value="vibration">vibration</option>
        </select>
        <input
          type="number"
          placeholder="Min"
          value={form.min_value}
          onChange={(e) => setForm({ ...form, min_value: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Max"
          value={form.max_value}
          onChange={(e) => setForm({ ...form, max_value: e.target.value })}
          required
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
          <button type="button" onClick={() => setForm({
            sensor_type: '', min_value: '', max_value: '', zone_id: '', id: null
          })}>
            Скасувати
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('sensor_type')} style={{ cursor: 'pointer' }}>
              Тип{renderArrow('sensor_type')}
            </th>
            <th onClick={() => handleSort('min_value')} style={{ cursor: 'pointer' }}>
              Min{renderArrow('min_value')}
            </th>
            <th onClick={() => handleSort('max_value')} style={{ cursor: 'pointer' }}>
              Max{renderArrow('max_value')}
            </th>
            <th onClick={() => handleSort('zone')} style={{ cursor: 'pointer' }}>
              Зона{renderArrow('zone')}
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sortedThresholds.map((t) => (
            <tr key={t.id}>
              <td style={{ display: 'none' }}>{t.id}</td>
              <td>{t.sensor_type}</td>
              <td>{t.min_value}</td>
              <td>{t.max_value}</td>
              <td>{getZoneName(t.zone_id)}</td>
              <td>
                <button onClick={() => handleEdit(t)}>Редагувати</button>
                <button onClick={() => handleDelete(t.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



