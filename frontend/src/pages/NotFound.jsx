import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#0E1116',
    fontFamily: "'Inter', sans-serif", color: '#EDEFF2', textAlign: 'center', padding: 20,
  }}>
    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, marginBottom: 12 }}>404</h1>
    <p style={{ color: 'rgba(237,239,242,0.5)', marginBottom: 24, fontSize: 14 }}>
      The page you're looking for doesn't exist.
    </p>
    <Link to="/" style={{ color: '#E0BC8A', fontSize: 14, textDecoration: 'none' }}>← Back to login</Link>
  </div>
);

export default NotFound;