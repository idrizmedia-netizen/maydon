# Maydon: sport yangiliklari sayti

Next.js 15 + Tailwind CSS. Maqolalar admin paneldan qo'shiladi (`/admin`), o'rnatiladigan ilova (PWA) sifatida ishlaydi.

## 1. Kompyuterda ishga tushirish

Node.js 20+ kerak.

```bash
npm install
npm run dev
```

- Sayt: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- Vaqtinchalik kirish: login `Izzat`, parol `123456`

Kompyuterda baza sozlash shart emas: maqolalar `.data/store.json` fayliga saqlanadi (bu fayl GitHub'ga yuklanmaydi).

> PWA (ilova sifatida o'rnatish) `npm run dev`da ishlamaydi. Uni tekshirish uchun `npm run build`, keyin `npm start`.

## 2. Papkalar tuzilishi

```
app/                      sahifalar
  admin/                  admin panel (kirish, ro'yxat, yangi va tahrirlash)
  api/admin/upload/       rasm yuklash
  api/img/[id]/           yuklangan rasmni ko'rsatish
  manifest.ts             ilova ma'lumotlari (PWA)
components/               header, kartochkalar, admin formalari
  admin/                  admin formasi va rasm yuklagich
lib/config.ts             sayt nomi va sport bo'limlari
lib/kv.ts                 ma'lumotlar ombori (Upstash Redis yoki lokal fayl)
lib/auth.ts               admin kirish tizimi
lib/seed.ts               7 ta namuna maqola
middleware.ts             /admin ni parol bilan himoyalaydi
public/sw.js              service worker (ilova va oflayn rejim)
public/offline.html       internet yo'qligida ko'rsatiladigan sahifa
public/icons/             ilova ikonkalari
public/brand/             logotiplar (PNG va SVG)
```

## 3. Admin panel

`/admin` manzilida:

- **Yangi maqola**: sport bo'limini tanlaysiz (Futbol, Boks, Kurash, Tennis, MMA, Boshqa sport), turini (Yangilik yoki Maqola), sarlavha, matn va rasm.
- **Rasm**: muqova rasmi va matn ichiga rasm qo'shish. Katta rasmlar brauzerning o'zida avtomatik kichraytiriladi.
- **Qoralama**: belgilansa, maqola saytda ko'rinmaydi.
- **Asosiy**: belgilansa, bosh sahifada katta panelda chiqadi.
- Har bir maqolani tahrirlash, qoralamaga o'tkazish va o'chirish mumkin.

Namuna maqolalarni ham shu yerdan o'chirasiz.

Yangi sport bo'limi qo'shish uchun `lib/config.ts` dagi `categories` ro'yxatiga yangi qator qo'shing.

## 4. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Maydon"
git branch -M main
git remote add origin https://github.com/SIZNING_NOMINGIZ/maydon.git
git push -u origin main
```

Avval `.gitignore` fayli borligini tekshiring.

## 5. Vercel'ga chiqarish

1. vercel.com'da **Add New → Project**, GitHub'dagi repozitoriyani tanlang, **Deploy**.
2. **Settings → Environment Variables** ga quyidagilarni qo'shing:

| Nomi | Qiymati |
|---|---|
| `AUTH_SECRET` | Uzun tasodifiy matn (kamida 16 belgi). Yaratish: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | Saytingiz manzili, masalan `https://maydon.vercel.app` |

`AUTH_SECRET`siz admin panelga kirib bo'lmaydi. Bu ataylab qilingan: kalit koddan ochiq bo'lmasligi uchun.

## 6. Upstash Redis ulash (maqolalarni saqlash uchun)

Vercel serverida fayl yozib bo'lmaydi, shuning uchun maqolalar bazada saqlanadi. Baza bepul.

1. Vercel'da loyihangizni oching, **Storage** bo'limiga kiring.
2. **Upstash (Redis)** ni tanlab, yangi baza yarating va loyihaga ulang. Vercel `KV_REST_API_URL` va `KV_REST_API_TOKEN` o'zgaruvchilarini o'zi qo'shadi.
3. **Deployments** bo'limidan oxirgi deployni **Redeploy** qiling.

Agar Vercel orqali emas, to'g'ridan-to'g'ri upstash.com'da baza yaratsangiz, "REST URL" va "REST Token" qiymatlarini shu ikki nom bilan o'zingiz qo'shing.

Ulanmagan bo'lsa, admin panelning yuqorida qizil ogohlantirish chiqadi.

## 7. Login va parolni almashtirish (muhim)

`Izzat` / `123456` faqat vaqtinchalik. Sayt internetga chiqqach, Vercel'da qo'shing:

| Nomi | Qiymati |
|---|---|
| `ADMIN_LOGIN` | O'zingizning loginingiz |
| `ADMIN_PASSWORD` | Uzun va murakkab parol |

Keyin qayta deploy qiling. Parol o'zgarganda eski sessiyalar avtomatik bekor bo'ladi. Ikkalasi ham o'rnatilgach, admin paneldagi sariq ogohlantirish yo'qoladi.

## 8. Ilova sifatida o'rnatish (PWA)

- **Android / Chrome / Edge:** sarlavhadagi "Ilovani o'rnatish" tugmasi chiqadi. Bossangiz, Maydon ilovasi telefon yoki kompyuterga o'rnatiladi.
- **iPhone / iPad:** Safari'da "Ulashish" → "Bosh ekranga qo'shish".

O'rnatilgan ilova to'liq ekranda ochiladi. Avval ochilgan sahifalar internetsiz ham ochiladi, boshqalari uchun "Internet yo'q" sahifasi chiqadi.

PWA faqat HTTPS'da ishlaydi. Vercel manzili avtomatik HTTPS.

## 9. Logotiplar

- `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`: brauzer belgisi
- `public/icons/`: ilova ikonkalari (192, 512 va maskable)
- `public/og.png`: Telegram/Facebook'da ulashganda ko'rinadigan rasm
- `public/brand/`: logotiplar (oq va qora matnli PNG, belgi SVG)

Nomni o'zgartirmoqchi bo'lsangiz: `lib/config.ts` (`name`) va logotip rasmlari.

## Muammolar

- **Admin'ga kirib bo'lmayapti, "AUTH_SECRET" xatosi:** 5-bo'limdagi `AUTH_SECRET` qo'shilmagan yoki qo'shgandan keyin qayta deploy qilinmagan.
- **"Ma'lumotlar bazasi ulanmagan":** 6-bo'lim.
- **Saqlangan maqola saytda ko'rinmayapti:** 1-2 daqiqa kuting va sahifani yangilang (Ctrl+F5).
- **Ilova eski holatda ko'rinyapti:** `public/sw.js` ichidagi `VERSION` raqamini oshiring.
