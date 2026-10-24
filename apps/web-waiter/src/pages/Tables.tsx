import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Tables() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/tables`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setTables(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function openTable(tableId: string) {
    const res = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, source: 'WAITER' })
    });
    const data = await res.json();
    if (data.ok) {
      navigate('/menu', { state: { orderId: data.data.id, tableId } });
    }
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#2d5f3b' }}>الطاولات</h1>
        <button onClick={() => navigate('/orders')}>الطلبات النشطة</button>
      </header>
      {loading ? <p>جاري التحميل...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {tables.map(table => (
            <button key={table.id} onClick={() => openTable(table.id)} style={{ height: '80px', fontSize: '1.25rem' }}>
              {table.code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
