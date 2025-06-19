import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  FaTools,
  FaDownload,
  FaUpload
} from 'react-icons/fa';

import UserTable from '../components/UserTable';
import MuseumTable from '../components/MuseumTable';
import ZoneTable from '../components/ZoneTable';
import ObjectTable from '../components/ObjectTable';
import SensorTable from '../components/SensorTable';
import ThresholdTable from '../components/ThresholdTable';
import MeasurementTable from '../components/MeasurementTable';
import AlertTable from '../components/AlertTable';

import { handleBackup, handleImport } from '../utils/backup';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);

  const importRefs = {
    users: useRef(),
    museums: useRef(),
    zones: useRef(),
    objects: useRef(),
    sensors: useRef(),
    thresholds: useRef(),
    measurements: useRef(),
    alerts: useRef(),
  };

  useEffect(() => {
    const fetchStats = async () => {
      const [users, museums, zones, objects, sensors, measurements, alerts] = await Promise.all([
        axios.get('http://127.0.0.1:3000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/museums', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/zones', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/objects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/sensors', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/measurements', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:3000/api/alerts', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setStats({
        users: users.data.length,
        museums: museums.data.length,
        zones: zones.data.length,
        objects: objects.data.length,
        sensors: sensors.data.length,
        measurements: measurements.data.length,
        alertsUnresolved: alerts.data.filter((a) => !a.resolved_by).length,
      });
    };

    fetchStats();
  }, [token]);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <FaTools className="dashboard-icon" />
        <h1>{t('admin.title')}</h1>
      </div>

      <div className="admin-backup">
        <button onClick={() => handleBackup(token)} className="backup-btn">
          <FaDownload /> {t('admin.backup')}
        </button>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">{t('admin.stats.users')}: <strong>{stats.users}</strong></div>
          <div className="stat-card">{t('admin.stats.museums')}: <strong>{stats.museums}</strong></div>
          <div className="stat-card">{t('admin.stats.zones')}: <strong>{stats.zones}</strong></div>
          <div className="stat-card">{t('admin.stats.objects')}: <strong>{stats.objects}</strong></div>
          <div className="stat-card">{t('admin.stats.sensors')}: <strong>{stats.sensors}</strong></div>
          <div className="stat-card">{t('admin.stats.measurements')}: <strong>{stats.measurements}</strong></div>
          <div className="stat-card alert-highlight">{t('admin.stats.unresolved')}: <strong>{stats.alertsUnresolved}</strong></div>
        </div>
      )}

      {[
        { label: 'users', component: <UserTable /> },
        { label: 'museums', component: <MuseumTable /> },
        { label: 'zones', component: <ZoneTable /> },
        { label: 'objects', component: <ObjectTable /> },
        { label: 'sensors', component: <SensorTable /> },
        { label: 'thresholds', component: <ThresholdTable /> },
        { label: 'measurements', component: <MeasurementTable /> },
        { label: 'alerts', component: <AlertTable /> },
      ].map(({ label, component }) => (
        <div className="admin-section" key={label}>
          <h2>{t(`admin.sections.${label}`)}</h2>
          {component}
          <div className="import-control">
            <button className="import-btn" onClick={() => importRefs[label].current.click()}>
              <FaUpload /> {t('admin.import', { entity: t(`admin.entities.${label}`) })}
            </button>
            <input
              ref={importRefs[label]}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => handleImport(e, label)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}








