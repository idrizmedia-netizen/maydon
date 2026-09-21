# SportXabar: sport yangiliklari sayti

Next.js 15 + Tailwind CSS. Maqolalar `content/articles` papkasidagi Markdown fayllar. Baza ham, server ham kerak emas: sayt to'liq statik yig'iladi va Vercel'da bepul ishlaydi.

## 1. Kompyuterda ishga tushirish

Node.js 20+ va Git o'rnatilgan bo'lishi kerak.

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` ochiladi. Fayllarni o'zgartirsangiz, sahifa o'zi yangilanadi.

Production tekshiruvi uchun: `npm run build` va `npm start`.

## 2. Papkalar tuzilishi

```
content/articles/     maqolalar (.md fayllar), asosiy ish shu yerda
lib/config.ts         sayt nomi, tavsifi, kategoriyalar va ranglari
lib/articles.ts       maqolalarni o'qish
app/                  sahifalar (bosh, kategoriya, maqola, qidiruv, sitemap, RSS)
components/           header, kartochka, qidiruv va boshqalar
app/globals.css       ranglar (kunduzgi va tungi) va maqola matni uslubi
```

## 3. Yangi maqola qo'shish

`content/articles/` ichida yangi `.md` fayl oching. Fayl nomi havolaga aylanadi:
`mening-maqolam.md` uchun `/yangilik/mening-maqolam`.

```markdown
---
title: "Maqola sarlavhasi"
date: "2026-09-21"
category: futbol
excerpt: "Bosh sahifa va Google uchun 1-2 gaplik qisqa mazmun."
author: "Ismingiz"
featured: true
image: "/rasm.jpg"
tags: ["teg1", "teg2"]
---

Maqola matni shu yerda. **Qalin**, *qiya*, ro'yxatlar va ## sarlavhalar ishlaydi.
```

- `category`: `futbol`, `boks`, `kurash`, `tennis`, `mma`, `boshqa`
- `featured: true`: bosh sahifada katta panelda chiqadi (bir nechta bo'lsa, eng yangisi)
- `image`: ixtiyoriy. Rasmni `public/` papkasiga qo'ying va `"/rasm.jpg"` deb yozing
- `draft: true`: maqola saytda ko'rinmaydi (qoralama)

**Namuna maqolalarni o'chiring**, ular faqat sayt qanday ko'rinishini ko'rsatish uchun.

## 4. Kategoriya yoki sayt nomini o'zgartirish

`lib/config.ts` faylini oching. Sayt nomi, tavsif, Telegram kanal havolasi va kategoriyalar (nomi, rangi, tavsifi) shu yerda.

## 5. GitHub'ga yuklash

1. github.com'da **New repository** bosing, nom bering (masalan `sportxabar`), bo'sh qoldiring (README qo'shmang).
2. Loyiha papkasida:

```bash
git init
git add .
git commit -m "Birinchi versiya"
git branch -M main
git remote add origin https://github.com/SIZNING_NOMINGIZ/sportxabar.git
git push -u origin main
```

## 6. Vercel'ga chiqarish

1. vercel.com'ga GitHub akkauntingiz bilan kiring.
2. **Add New → Project** bosing va `sportxabar` repozitoriyasini tanlang.
3. Sozlamalarga tegmang (Vercel Next.js'ni o'zi taniydi), **Deploy** bosing.
4. 1-2 daqiqadan keyin `sportxabar.vercel.app` ko'rinishidagi manzil beriladi.

Shundan keyin har safar `git push` qilsangiz, sayt avtomatik yangilanadi.

### Sayt manzilini bering (muhim)

Sitemap, RSS va ulashish havolalari to'g'ri ishlashi uchun Vercel'da:
**Project → Settings → Environment Variables** ga qo'shing:

```
NEXT_PUBLIC_SITE_URL = https://sizning-saytingiz.vercel.app
```

Keyin **Deployments** bo'limidan oxirgi deployni **Redeploy** qiling.

### O'z domeningizni ulash

**Project → Settings → Domains** ga domeningizni yozing (masalan `sportxabar.uz`). Vercel DNS'da qaysi yozuvlarni kiritish kerakligini ko'rsatadi. Domenni ulagach `NEXT_PUBLIC_SITE_URL`ni yangi manzilga o'zgartiring.

## 7. Google'da ko'rinish

1. search.google.com/search-console'ga saytni qo'shing.
2. **Sitemaps** bo'limiga `sitemap.xml` yozing.

## 8. Keyingi qadamlar (Claude'ga shu so'rovlarni bering)

- "Maqola sahifasiga izohlar o'rniga Telegram kanalga havola bloki qo'sh."
- "Bosh sahifaga football-data.org API'dan olingan jonli natijalar bloki qo'sh." (API kalitini `.env.local`ga qo'ying, GitHub'ga yuklamang.)
- "Rasmlar uchun `next/image` va `public/` papkasidan optimallashtirishni sozla."
- "Ruscha versiya qo'shish uchun `/ru` marshrutlari va til almashtirgich yasa."
- "Vercel Analytics'ni ulash."
- "Kodga tegmasdan maqola qo'shish uchun Decap CMS yoki Sanity'ni ulash."

## Eslatma

Boshqa saytlarning maqolalarini to'liq nusxalamang: mualliflik huquqi muammosi chiqadi. Sarlavha, o'z so'zlaringiz bilan qisqa mazmun va manbaga havola qo'ying.
