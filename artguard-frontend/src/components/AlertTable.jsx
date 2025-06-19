import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDateTime } from '../utils/date';

export default function AlertTable() {
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      const [alertRes, sensorRes] = await Promise.all([
        axios.get('http://127.0.0.1:3000/api/alerts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://127.0.0.1:3000/api/sensors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const recentAlerts = alertRes.data.filter((a) => {
        const date = new Date(a.created_at);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 14;
      });

      setAlerts(recentAlerts);
      setSensors(sensorRes.data);
    };

    fetchData();
  }, [token]);

  const getSensorLabel = (id) => {
    const sensor = sensors.find((s) => s.id === id);
    return sensor ? sensor.identifier || sensor.type : '—';
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

  const getSortedAlerts = () => {
    const sorted = [...alerts];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
          case 'sensor':
            aVal = getSensorLabel(a.sensor_id).toLowerCase();
            bVal = getSensorLabel(b.sensor_id).toLowerCase();
            break;
          case 'alert_type':
          case 'alert_message':
            aVal = a[sortField]?.toString().toLowerCase() ?? '';
            bVal = b[sortField]?.toString().toLowerCase() ?? '';
            break;
          case 'created_at':
            aVal = new Date(a.created_at);
            bVal = new Date(b.created_at);
            break;
          case 'viewed':
            aVal = a.viewed ? 1 : 0;
            bVal = b.viewed ? 1 : 0;
            break;
          case 'resolved':
            aVal = a.resolved_at || '';
            bVal = b.resolved_at || '';
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const sortedAlerts = getSortedAlerts();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ display: 'none' }}>ID</th>
            <th onClick={() => handleSort('sensor')} style={{ cursor: 'pointer' }}>
              Сенсор{renderArrow('sensor')}
            </th>
            <th onClick={() => handleSort('alert_type')} style={{ cursor: 'pointer' }}>
              Тип{renderArrow('alert_type')}
            </th>
            <th onClick={() => handleSort('alert_message')} style={{ cursor: 'pointer' }}>
              Повідомлення{renderArrow('alert_message')}
            </th>
            <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
              Час{renderArrow('created_at')}
            </th>
            <th onClick={() => handleSort('viewed')} style={{ cursor: 'pointer' }}>
              Статус{renderArrow('viewed')}
            </th>
            <th onClick={() => handleSort('resolved')} style={{ cursor: 'pointer' }}>
              Вирішено{renderArrow('resolved')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAlerts.map((a) => (
            <tr key={a.id}>
              <td style={{ display: 'none' }}>{a.id}</td>
              <td>{getSensorLabel(a.sensor_id)}</td>
              <td>{a.alert_type}</td>
              <td>{a.alert_message}</td>
              <td>{formatDateTime(a.created_at)}</td>
              <td style={{ color: a.viewed ? 'green' : 'red' }}>
                {a.viewed ? '👁 Переглянуто' : '❗ Нове'}
              </td>
              <td>
                {a.resolved_by
                  ? `${a.resolved_by} (${a.resolved_by_user_id || '—'})\n${formatDateTime(a.resolved_at)}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



