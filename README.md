# مشروع اللوحة

## الإعداد

1. قم بنسخ ملف `.env.example` إلى ملف جديد باسم `.env`
2. قم بتعبئة المتغيرات البيئية التالية في ملف `.env`:
   - `GOOGLE_SHEETS_ID`: معرف جدول البيانات في Google Sheets
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: البريد الإلكتروني لحساب الخدمة
   - `GOOGLE_PRIVATE_KEY`: المفتاح الخاص لحساب الخدمة

## تشغيل المشروع

1. قم بتثبيت الاعتماديات:
```bash
npm install
```

2. قم بتشغيل الخادم المحلي:
```bash
npm run dev
```
