import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setOrders(data.data);
      });
  }, []);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#2d5f3b' }}>الطلبات النشطة</h1>
        <button onClick={() => navigate('/tables')}>الطاولات</button>
      </header>
      {orders.map(order => (
        <div key={order.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>طلب #{order.order_number}</strong>
            <span>{order.table_code || 'تيك أواي'}</span>
          </div>
          <div style={{ marginTop: '0.5rem', color: '#666' }}>الحالة: {order.status}</div>
        </div>
      ))}
    </div>
  );
}
