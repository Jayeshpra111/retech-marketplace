import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <h1 style={{ fontSize: '96px', fontWeight: '900', color: '#10B981', margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginTop: '16px', marginBottom: '12px' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '460px', color: '#6B7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
        The device, listing, or page you are looking for might have been sold, removed, or does not exist.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#10B981',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <Home size={18} /> Back to Home
        </Link>
        <Link
          to="/browse"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'inherit',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={18} /> Browse Catalog
        </Link>
      </div>
    </div>
  );
}
