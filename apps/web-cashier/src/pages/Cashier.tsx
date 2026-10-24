import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Cashier() {
  const [orders, setOrders] = useState<any[]>([]);
  const token = localStorage.getItem('token');

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
      <h1 style={{ marginBottom: '1rem', color: '#2d5f3b' }}>واجهة الكاشير</h1>
      {orders.map(order => (
        <div key={order.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>طلب #{order.order_number}</strong>
            <span>{order.table_code || 'تيك أواي'}</span>
          </div>
          <div style={{ marginTop: '0.5rem', color: '#666' }}>الحالة: {order.status}</div>
          <button style={{ marginTop: '0.75rem' }}>إنشاء فاتورة</button>
        </div>
      ))}
      {orders.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>لا توجد طلبات</p>}
    </div>
  );
}
