import React from 'react';

export default function AdminSection({ title, children }) {
  return (
    <div style={{
      background: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      margin: '2rem auto',
      width: '95%',
      maxWidth: '1100px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        borderBottom: '2px solid #eee',
        paddingBottom: '0.5rem'
      }}>{title}</h2>
      {children}
    </div>
  );
}
