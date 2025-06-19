import axios from 'axios';

export const handleBackup = async (token) => {
  const endpoints = ['users', 'museums', 'zones', 'objects', 'sensors', 'thresholds', 'measurements', 'alerts'];
  const backup = {};

  try {
    for (const ep of endpoints) {
      const res = await axios.get(`http://127.0.0.1:3000/api/${ep}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      backup[ep] = res.data;
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert('Помилка при створенні резервної копії.');
    console.error(err);
  }
};

export const handleImport = (e, key) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const parsed = JSON.parse(event.target.result);

      if (!Array.isArray(parsed)) {
        alert('Невірний формат: очікується масив обʼєктів.');
        return;
      }

      for (const item of parsed) {
        if (typeof item !== 'object') {
          alert('Невірний елемент: очікується обʼєкт.');
          return;
        }
      }

      for (const item of parsed) {
        await axios.post(`http://127.0.0.1:3000/api/${key}`, item, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      alert('Імпорт успішний!');
    } catch (err) {
      console.error(err);
      alert('Помилка при імпорті JSON.');
    }
  };
  reader.readAsText(file);
};

