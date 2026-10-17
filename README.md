# 🚀 Moemen Team System | نظام إدارة وتطوير مشاريع فريق مؤمن

نظام متكامل واحترافي لإدارة وتطوير المشاريع، متابعة العملاء، وإصلاح الأعطال الفورية مع دمج مراحل التوسع البرمجي.
Enterprise Client & Project Delivery Platform with Fast Issue Fixing, Scope Extensions & Automated Merge.

---

## 🌟 Key Features / أبرز الميزات

1. **Email Service Projects (خدمة البريد الإلكتروني)**:
   - تصنيف جديد مخصص لخوادم البريد وحملات الإيميلات والرسائل المعاملاتية عبر كل اللوحات.
2. **Fast Fixing A Problem (التصليح السريع للأعطال)**:
   - يمكن للعميل اختيار المشروع، التقاط صورة للعطل بالكاميرا أو رفع سكرين شوت، وكتابة توضيح للمشكلة.
   - متابعة لحظية لحالة العطل (`pending` -> `on_it` -> `fixed`).
   - حساب دقيق للمدة المستغرقة لحل المشكلة وعرضها أمام العميل مع ملاحظات الحل الفنية.
3. **Project Extensions & Evolution Merge (طلبات التطوير والدمج الذكي)**:
   - عند اكتمال المشروع وسداد كامل ميزانيته، تتاح مراحل تطوير إضافية داخل نفس المشروع.
   - متابعة ميزانية التطوير، الدفعات المسددة، ونسبة الإنجاز (كام في الميه %).
   - زر دمج ذكي (`Merge into Base Project`) يدمج الميزانيات، يسجل الدفعات، ويرقي رقم الإصدار رسمياً.
4. **Full Localization (النظام إنجليزي افتراضياً مع خيار التبديل للعربية)**:
   - الواجهة بالإنجليزية بشكل افتراضي (`LTR`).
   - خيار تحويل فوري للغة العربية بالكامل مع اتجاه `RTL` وخط Cairo.
5. **High-Level Automated Testing (اختبارات مؤتمتة شاملة)**:
   - 70 اختبار تكامل و 62 اختبار E2E (إجمالي 132 اختباراً) بنسبة نجاح 100%.

---

## ⚡ Quick Deployment (سحب وتشغيل المشروع بضغطة واحدة على السيرفر)

### 1. سحب البرانش (Clone `production-v` branch)
```bash
git clone -b production-v https://github.com/moemenrady/moemen-team.git
cd moemen-team
```
*(أو باستخدام SSH: `git clone -b production-v git@github.com:moemenrady/moemen-team.git`)*

### 2. التثبيت والتشغيل الفوري (One-Command Run)
جميع بيانات قاعدة البيانات الحالية مُجهزة تلقائياً داخل `prisma/dev.db`:
```bash
npm install && npm run build && npm start
```

### 3. التشغيل في الخلفية باستخدام PM2 (Recommended for Production)
```bash
npm install -g pm2
pm2 start npm --name "moemen-team" -- start
pm2 save
pm2 startup
```

---

## 🔐 Credentials / بيانات الدخول الافتراضية

| الدور (Role) | البريد الإلكتروني (Email) | كلمة المرور (Password) |
|---|---|---|
| **مدير النظام (Admin)** | `admin@moemen-team.tech` | `admin123` |
| **المدير (Manager)** | `manager@moemen-team.tech` | `admin123` |
| **عميل تجريبي (Client Demo)** | `ahmed@cairofresh.eg` | `demo1234` |

---

## 🧪 Testing Suite / تشغيل حزمة الاختبارات

```bash
# تشغيل كل الاختبارات (Suite + E2E)
npm test

# تشغيل اختبارات النماذج وقاعدة البيانات
npm run test:suite

# تشغيل اختبارات HTTP و E2E API
npm run test:e2e
```
