import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Menu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = (location.state as any)?.orderId;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/menu/categories`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/menu/products`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([cats, prods]) => {
      if (cats.ok) {
        setCategories(cats.data);
        if (cats.data.length > 0) setSelectedCat(cats.data[0].id);
      }
      if (prods.ok) setProducts(prods.data);
    });
  }, []);

  function addToCart(product: any) {
    setCart(prev => {
      const existing = prev.find(p => p.productId === product.id);
      if (existing) {
        return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { productId: product.id, name: product.name_ar, price: product.price_cents, quantity: 1 }];
    });
  }

  async function sendToKitchen() {
    if (!orderId || cart.length === 0) return;
    const res = await fetch(`${API}/api/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });
    const data = await res.json();
    if (data.ok) {
      alert('تم إرسال الطلب للمطبخ');
      navigate('/tables');
    }
  }

  const filtered = selectedCat ? products.filter(p => p.category_id === selectedCat) : products;

  return (
    <div className="container" style={{ paddingBottom: cart.length > 0 ? '80px' : '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#2d5f3b' }}>القائمة</h1>
        <button onClick={() => navigate('/tables')}>الطاولات</button>
      </header>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            style={{ background: selectedCat === cat.id ? '#2d5f3b' : '#666', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {cat.name_ar}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {filtered.map(product => (
          <div key={product.id} className="card" onClick={() => addToCart(product)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name_ar}</div>
            <div style={{ color: '#2d5f3b' }}>{product.price_cents} ل.س</div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '1rem', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>عدد الأصناف: {cart.reduce((s, c) => s + c.quantity, 0)}</div>
          <button onClick={sendToKitchen}>إرسال للمطبخ ({cart.length})</button>
        </div>
      )}
    </div>
  );
}
