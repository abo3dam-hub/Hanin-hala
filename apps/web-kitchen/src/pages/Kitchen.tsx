import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Kitchen() {
  const [items, setItems] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  function fetchItems() {
    fetch(`${API}/api/orders/kitchen`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setItems(data.data);
      });
  }

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const orders = items.reduce((acc: any, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = {
        orderNumber: item.order_number,
        tableCode: item.table_code,
        notes: item.order_notes,
        items: []
      };
    }
    acc[item.order_id].items.push(item);
    return acc;
  }, {});

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>شاشة المطبخ</h1>
      {Object.entries(orders).map(([orderId, order]: [string, any]) => (
        <div key={orderId} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1.25rem' }}>
            <strong>طلب #{order.orderNumber}</strong>
            <span>{order.tableCode || 'تيك أواي'}</span>
          </div>
          {order.notes && <div style={{ background: '#ff6b6b33', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.75rem' }}>ملاحظات: {order.notes}</div>}
          {order.items.map((item: any) => (
            <div key={item.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{item.quantity}x</strong> {item.product_name_snapshot}</span>
              </div>
              {item.notes && <div style={{ color: '#ffcc00', marginTop: '0.25rem' }}>ملاحظة: {item.notes}</div>}
            </div>
          ))}
        </div>
      ))}
      {Object.keys(orders).length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>لا توجد طلبات</p>}
    </div>
  );
}
