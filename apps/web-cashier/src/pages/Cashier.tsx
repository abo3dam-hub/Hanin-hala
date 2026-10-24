import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Cashier() {
  const [bills, setBills] = useState<any[]>([]);
  const [paying, setPaying] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const token = localStorage.getItem('token');

  function fetchBills() {
    fetch(`${API}/api/cashier/open-bills`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setBills(data.data);
      });
  }

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 8000);
    return () => clearInterval(interval);
  }, []);

  async function createBill(orderId: string) {
    const res = await fetch(`${API}/api/cashier/bills/from-order/${orderId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.ok) {
      fetchBills();
    } else {
      alert(data.error?.message);
    }
  }

  async function pay() {
    if (!paying) return;
    const res = await fetch(`${API}/api/cashier/payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId: paying.id, amountCents: Number(amount), method: 'CASH' })
    });
    const data = await res.json();
    if (data.ok) {
      alert(`تم الدفع. المتبقي: ${data.remaining} ل.س - الحالة: ${data.status}`);
      setPaying(null);
      setAmount('');
      fetchBills();
    } else {
      alert(data.error?.message);
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', color: '#2d5f3b' }}>واجهة الكاشير</h1>
      {bills.map(bill => (
        <div key={bill.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>فاتورة #{bill.bill_number} - طلب #{bill.order_number}</strong>
            <span>{bill.table_code || 'تيك أواي'}</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            الإجمالي: {bill.subtotal_cents} ل.س | المدفوع: {bill.paid_cents || 0} ل.س | المتبقي: {bill.remaining_cents || bill.subtotal_cents} ل.س
          </div>
          <div style={{ marginTop: '0.25rem', color: '#666' }}>الحالة: {bill.status}</div>
          {bill.status !== 'PAID' && (
            <button style={{ marginTop: '0.75rem' }} onClick={() => { setPaying(bill); setAmount(String(bill.remaining_cents || bill.subtotal_cents)); }}>دفع</button>
          )}
        </div>
      ))}
      {bills.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>لا توجد فواتير مفتوحة</p>}

      {paying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3>دفع للفاتورة #{paying.bill_number}</h3>
            <p>المتبقي: {paying.remaining_cents || paying.subtotal_cents} ل.س</p>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={pay}>تأكيد الدفع</button>
              <button onClick={() => setPaying(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
