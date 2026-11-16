# دليل التشغيل والنشر (بالعربي)

## ١) رفع المشروع على GitHub
1. اعمل حساب مجاني على github.com ثم New repository (اسمه مثلاً `portfolio`).
2. ارفع كل ملفات المشروع (فك الـ zip وارفع المحتوى كما هو، بما فيه مجلدي `content` و`public`).

## ٢) النشر على Netlify
1. ادخل app.netlify.com واعمل حساب، ثم Add new site ← Import from GitHub واختر المشروع.
2. الإعدادات تتقرأ تلقائيًا من `netlify.toml` (Build: `npm run build`، Publish: `dist`). اضغط Deploy.

## ٣) تفعيل لوحة الأدمن
1. من Netlify: Site configuration ← Identity ← Enable Identity.
2. في Identity ← Registration اختر **Invite only** (عشان محدش غيرك يسجل).
3. في Identity ← Services ← Git Gateway ← Enable.
4. في Identity اضغط Invite users وادخل إيميلك، وهيجيلك إيميل، افتح اللينك واختار باسورد.
5. ادخل على `رابط-موقعك/admin` وسجل دخول.

## ٤) الاستخدام اليومي
- **Projects**: أضف/عدّل/امسح مشاريع، وارفع الصور. حقل Order بيحدد الترتيب (الستة الأوائل بيظهروا في الشبكة بالتصميم المتداخل).
- **Site Settings**: التواصل، نبذة، المهارات، الخدمات، الخبرة، وصورتك الشخصية.
- كل حفظ بيعمل نشر تلقائي للموقع خلال دقيقة تقريبًا.

## تشغيل محلي (اختياري)
`npm install` ثم `npm run dev`. للتحقق من الأخطاء: `npm run typecheck`.
