import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDateTime } from '../utils/date';

export default function MeasurementTable() {
  const [measurements, setMeasurements] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      const [meRes, senRes] = await Promise.all([
        axios.get('http://127.0.0.1:3000/api/measurements', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://127.0.0.1:3000/api/sensors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const recentMeasurements = meRes.data.filter((m) => {
        const date = new Date(m.measured_at);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 10;
      });

      setMeasurements(recentMeasurements);
      setSensors(senRes.data);
    };

    fetchData();
  }, [token]);

  const getSensorName = (id) => {
    const s = sensors.find((sen) => sen.id === id);
    return s ? s.identifier || s.type : '—';
  };

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

  const getSortedMeasurements = () => {
    const sorted = [...measurements];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;

        if (sortField === 'sensor') {
          aVal = getSensorName(a.sensor_id).toLowerCase();
          bVal = getSensorName(b.sensor_id).toLowerCase();
        } else if (sortField === 'value') {
          aVal = parseFloat(a.value);
          bVal = parseFloat(b.value);
        } else if (sortField === 'measured_at') {
          aVal = new Date(a.measured_at);
          bVal = new Date(b.measured_at);
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const sortedMeasurements = getSortedMeasurements();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('sensor')} style={{ cursor: 'pointer' }}>
              Сенсор{renderArrow('sensor')}
            </th>
            <th onClick={() => handleSort('value')} style={{ cursor: 'pointer' }}>
              Значення{renderArrow('value')}
            </th>
            <th onClick={() => handleSort('measured_at')} style={{ cursor: 'pointer' }}>
              Час{renderArrow('measured_at')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMeasurements.map((m) => (
            <tr key={m.id}>
              <td style={{ display: 'none' }}>{m.id}</td>
              <td>{getSensorName(m.sensor_id)}</td>
              <td>{m.value}</td>
              <td>{formatDateTime(m.measured_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


