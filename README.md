# نظام حنين وحلا - POS/مطبخ

نظام نقاط بيع ومطبخ مصمم للعمل محلياً على شبكة المطعم (Offline-first capable). يدعم واجهات النادل والمطبخ والكاشير، وإدارة القائمة، الطلبات، والفواتير.

## المزايا
- عمل محلي على LAN - لا يحتاج إنترنت للتشغيل الأساسي
- فصل واجهات النادل / المطبخ / الكاشير
- دعم عربي RTL للشاشات اللمسية
- استيراد قائمة الطعام من ملف `malaki-menu-final.xlsx`
- قاعدة بيانات PostgreSQL مع migrations
- WebSocket للتحديثات الفورية
- بنية قابلة للتوسع لدعم الطابعات وقاعدة متعددة المطاعم

## البنية
```
apps/
  server/        # Fastify API + WebSocket
  web-waiter/    # واجهة النادل (React + Vite)
  web-kitchen/   # شاشة المطبخ (React + Vite)
  web-cashier/   # واجهة الكاشير (React + Vite)
packages/
  shared/        # أنواع مشتركة
  db/            # مخطط وقاعدة بيانات
```

## التشغيل السريع

### 1) تثبيت التبعيات
```bash
npm install
```

### 2) إعداد قاعدة البيانات
أنشئ قاعدة بيانات PostgreSQL، ثم عدّل `apps/server/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hanin_hala
JWT_SECRET=your-secret-key
```

### 3) تشغيل الترحيلات
```bash
cd packages/db && npm run build && npm run migrate
```

### 4) تشغيل النظام
```bash
npm run dev
```

الخدمات:
- API: http://localhost:8080
- واجهة النادل: http://localhost:5173
- شاشة المطبخ: http://localhost:5174
- واجهة الكاشير: http://localhost:5175

## التهيئة لأول مرة
1. افتح API أو استخدم `/api/setup/status` للتحقق
2. POST إلى `/api/setup` لتهيئة المطعم والمستخدم الأول
```json
{
  "restaurantName": "حنين وحلا",
  "username": "admin",
  "password": "admin123",
  "displayName": "المدير"
}
```

## استيراد القائمة
بعد تسجيل الدخول، يمكن استيراد القائمة من `malaki-menu-final.xlsx` الموجود في جذر المستودع:
- معاينة: POST `/api/import/menu/excel/preview`
- تطبيق: POST `/api/import/menu/excel/apply`

## ملاحظات
- الملف `malaki-menu-final.xlsx` محفوظ أصلياً ولم يُعدّل
- الطابعات والنسخ الاحتياطي يحتاجان إعداد إضافي حسب الأجهزة
- العمل دون إنترنت يعتمد على شبكة LAN محلية
