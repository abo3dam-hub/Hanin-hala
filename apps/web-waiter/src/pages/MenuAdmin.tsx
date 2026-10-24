import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function MenuAdmin() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [tab, setTab] = useState<'products' | 'categories' | 'import'>('products');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [prodForm, setProdForm] = useState<any>({ nameAr: '', priceCents: 0, categoryId: '', isAvailable: true });
  const [catForm, setCatForm] = useState<any>({ nameAr: '', sortOrder: 0, isActive: true });
  const [preview, setPreview] = useState<any>(null);
  const [importRes, setImportRes] = useState<any>(null);

  async function load() {
    const [cats, prods] = await Promise.all([
      fetch(`${API}/api/menu/categories`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/menu/products`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]);
    if (cats.ok) setCategories(cats.data);
    if (prods.ok) setProducts(prods.data);
  }

  useEffect(() => { load(); }, []);

  async function saveProduct(e: any) {
    e.preventDefault();
    const res = await fetch(`${API}/api/menu/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prodForm, priceCents: Number(prodForm.priceCents) })
    });
    const data = await res.json();
    if (data.ok) {
      alert('تم الحفظ');
      setProdForm({ nameAr: '', priceCents: 0, categoryId: '', isAvailable: true });
      load();
    } else {
      alert(data.error?.message || 'فشل الحفظ');
    }
  }

  async function toggleProduct(p: any) {
    const res = await fetch(`${API}/api/menu/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !p.is_available })
    });
    const data = await res.json();
    if (data.ok) load();
  }

  async function saveCategory(e: any) {
    e.preventDefault();
    const res = await fetch(`${API}/api/menu/categories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...catForm, sortOrder: Number(catForm.sortOrder) })
    });
    const data = await res.json();
    if (data.ok) {
      alert('تم الحفظ');
      setCatForm({ nameAr: '', sortOrder: 0, isActive: true });
      load();
    } else {
      alert(data.error?.message || 'فشل الحفظ');
    }
  }

  async function doPreview() {
    const res = await fetch(`${API}/api/import/menu/excel/preview`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data.ok) setPreview(data);
    else alert(data.error?.message);
  }

  async function doApply() {
    const res = await fetch(`${API}/api/import/menu/excel/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'merge' })
    });
    const data = await res.json();
    if (data.ok) {
      setImportRes(data);
      load();
    } else alert(data.error?.message);
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#2d5f3b' }}>إدارة القائمة</h1>
        <button onClick={() => navigate('/tables')}>عودة</button>
      </header>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setTab('products')} style={{ background: tab === 'products' ? '#2d5f3b' : '#666' }}>الأصناف</button>
        <button onClick={() => setTab('categories')} style={{ background: tab === 'categories' ? '#2d5f3b' : '#666' }}>الفئات</button>
        <button onClick={() => setTab('import')} style={{ background: tab === 'import' ? '#2d5f3b' : '#666' }}>استيراد Excel</button>
      </div>

      {tab === 'categories' && (
        <div>
          <div className="card">
            <h3>إضافة فئة</h3>
            <form onSubmit={saveCategory} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input placeholder="اسم الفئة بالعربية" value={catForm.nameAr} onChange={e => setCatForm({ ...catForm, nameAr: e.target.value })} required />
              <input type="number" placeholder="ترتيب" value={catForm.sortOrder} onChange={e => setCatForm({ ...catForm, sortOrder: e.target.value })} />
              <button type="submit">حفظ</button>
            </form>
          </div>
          <div className="card">
            <h3>قائمة الفئات</h3>
            {categories.map(c => (
              <div key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.name_ar} (ترتيب: {c.sort_order})</span>
                <span>{c.is_active ? 'مفعلة' : 'معطلة'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="card">
            <h3>إضافة صنف</h3>
            <form onSubmit={saveProduct} style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <input placeholder="اسم الصنف" value={prodForm.nameAr} onChange={e => setProdForm({ ...prodForm, nameAr: e.target.value })} required />
              <input type="number" placeholder="السعر" value={prodForm.priceCents} onChange={e => setProdForm({ ...prodForm, priceCents: e.target.value })} required />
              <select value={prodForm.categoryId} onChange={e => setProdForm({ ...prodForm, categoryId: e.target.value })}>
                <option value="">بدون فئة</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
              <button type="submit">حفظ</button>
            </form>
          </div>
          <div className="card">
            <h3>قائمة الأصناف</h3>
            {products.map(p => (
              <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div><strong>{p.name_ar}</strong> - {p.price_cents} ل.س</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{p.category_name_ar || 'بدون فئة'}</div>
                </div>
                <button onClick={() => toggleProduct(p)}>{p.is_available ? 'تعطيل' : 'تفعيل'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'import' && (
        <div>
          <div className="card">
            <h3>استيراد من malaki-menu-final.xlsx</h3>
            <p style={{ color: '#666', marginBottom: '0.75rem' }}>الملف موجود في جذر المستودع. سيجري الاستيراد بمعاينة أولاً ثم تطبيق مع حماية ضد الحذف التلقائي.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={doPreview}>معاينة</button>
              <button onClick={doApply}>تطبيق الاستيراد (دمج)</button>
            </div>
          </div>
          {preview && (
            <div className="card">
              <h3>معاينة ({preview.count} صف)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th>الفئة</th><th>الاسم</th><th>السعر</th><th>متوفر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((r: any, i: number) => (
                      <tr key={i}>
                        <td>{r.category}</td><td>{r.name}</td><td>{r.price}</td><td>{r.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {importRes && (
            <div className="card">
              <h3>نتيجة الاستيراد</h3>
              <p>جديد: {importRes.imported} | محدث: {importRes.updated} | متخطى: {importRes.skipped} | أخطاء: {importRes.errorsCount}</p>
              {importRes.errors?.length > 0 && (
                <details>
                  <summary>عرض الأخطاء</summary>
                  <pre style={{ fontSize: '0.75rem', overflowX: 'auto' }}>{JSON.stringify(importRes.errors, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
