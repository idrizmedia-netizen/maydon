import type { StoredArticle } from "./articles";

// Namuna maqolalar. Admin panelga birinchi marta kirganingizda bazaga ko'chiriladi,
// keyin ularni admin paneldan tahrirlash yoki o'chirish mumkin.
export const SEED_ARTICLES: StoredArticle[] = [
  {
    slug: "boks-haftalik-reja",
    title: "Boksni endi boshlaganlar uchun haftalik mashg'ulot rejasi",
    date: "2026-09-18",
    category: "boks",
    kind: "maqola",
    excerpt: "Zalga birinchi marta kirgan odam nimadan boshlashi kerak? Sodda haftalik reja va yangi boshlovchilar qiladigan tez-tez xatolar.",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["mashg'ulot", "boks", "boshlovchilar"],
    createdAt: 1789722000000,
    updatedAt: 1789722000000,
    content: `Boksni boshlash uchun avval jang qilish shart emas. Dastlabki oylarda asosiy maqsad to'g'ri turish, oyoq ishi va chidamlilikni o'rganish.

## Namuna reja (haftasiga 3 kun)

**1-kun: texnika**
- Isinish va arqonda sakrash
- Tik turish, oyoq harakati va himoya holati
- Soya bilan boks (oynaga qarab)

**2-kun: zarba va himoya**
- To'g'ri zarbalar va ularning kombinatsiyasi
- Xalta bilan ishlash
- Himoya va qaytish harakatlari

**3-kun: chidamlilik**
- Intervalli yugurish yoki arqon
- Butun tana uchun kuch mashqlari
- Cho'zilish

## Boshlovchilar qiladigan xatolar

1. Juda erta kuchli zarba urishga urinish. Avval texnika, keyin kuch.
2. Isinishni tashlab ketish. Bu jarohatning eng oson yo'li.
3. Murabbiysiz o'rganish. Kamida dastlabki oylarda malakali murabbiy nazorati kerak.

Sparringga (haqiqiy zarbalar bilan mashq) faqat murabbiyingiz tayyor deb aytganda chiqing va himoya vositalarini kiying.

*Bu maqola sayt uchun namuna sifatida yozilgan va tibbiy maslahat emas. Mashg'ulotni boshlashdan oldin shifokor bilan gaplashing.*`,
  },
  {
    slug: "kurash-tanishuv",
    title: "Kurash: O'zbekistonning milliy kurash turi bilan tanishuv",
    date: "2026-09-17",
    category: "kurash",
    kind: "maqola",
    excerpt: "Kurash asrlar davomida O'zbekistonda yashab kelgan an'anaviy kurash bo'lib, bugun xalqaro musobaqalarda ham o'tkaziladi.",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["kurash", "milliy sport"],
    createdAt: 1789635600000,
    updatedAt: 1789635600000,
    content: `Kurash O'zbekiston va Markaziy Osiyoda uzoq tarixga ega an'anaviy kurash turi. Bugun u alohida qoidalari, xalqaro tashkiloti va musobaqalari bo'lgan zamonaviy sport hisoblanadi.

## Qisqacha xususiyatlari

Kurashda sportchilar maxsus kiyim (chakan va belbog') kiyib, ushlash orqali raqibni tik holatda yiqitishga harakat qiladi. Asosiy urg'u tik holatdagi kurashga beriladi, yerdagi kurash chegaralangan.

Baholash tizimida yiqitishning qanchalik toza bo'lganiga qarab turli ballar beriladi. Eng yuqori baho jangni darhol tugatadi.

## Nega e'tiborga loyiq

- U milliy madaniyat bilan chambarchas bog'liq.
- Dzyudo va sambo kabi sport turlariga o'xshash texnik jihatlari bor, shuning uchun sportchilar bir turdan ikkinchisiga osongina o'tadi.
- Xalqaro musobaqalarda ishtirok etish imkoniyati kengayib bormoqda.

Aniq qoidalar, vazn toifalari va baholash uchun rasmiy federatsiya materiallariga murojaat qiling.

*Bu maqola sayt uchun namuna sifatida yozilgan. Nashr qilishdan oldin faktlarni rasmiy manbalardan tekshiring.*`,
  },
  {
    slug: "mma-vazn-toifalari",
    title: "MMA'da vazn toifalari: kim kim bilan jang qiladi?",
    date: "2026-09-15",
    category: "mma",
    kind: "maqola",
    excerpt: "Aralash jang san'atida jangchilar vazniga qarab guruhlanadi. Erkaklarning UFC'dagi asosiy toifalari jadvali.",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["MMA", "UFC", "vazn toifalari"],
    createdAt: 1789462800000,
    updatedAt: 1789462800000,
    content: `MMA'da adolatli jang uchun jangchilar vazniga qarab bo'linadi. Toifalar tashkilotga qarab biroz farq qilishi mumkin, quyida UFC'dagi erkaklarning asosiy toifalari keltirilgan (vazn chegaralari taxminiy kilogrammga o'tkazilgan).

## Erkaklar toifalari

- **Strouveyt:** 115 funtgacha (taxminan 52 kg)
- **Flayveyt:** 125 funtgacha (taxminan 57 kg)
- **Bentamveyt:** 135 funtgacha (taxminan 61 kg)
- **Feterveyt:** 145 funtgacha (taxminan 66 kg)
- **Laytveyt:** 155 funtgacha (taxminan 70 kg)
- **Uelterveyt:** 170 funtgacha (taxminan 77 kg)
- **Middlveyt:** 185 funtgacha (taxminan 84 kg)
- **Yengil og'ir vazn:** 205 funtgacha (taxminan 93 kg)
- **Og'ir vazn:** 265 funtgacha (taxminan 120 kg)

Ayollar uchun ham bir necha toifa mavjud, ular tashkilot dasturiga qarab o'zgaradi.

## Vazn o'lchash nega muhim

Jangchilar jangdan bir kun oldin rasmiy o'lchovdan o'tadi. Toifa chegarasidan oshgan jangchi jarima to'lashi yoki jang bekor bo'lishi mumkin. Shuning uchun vazn tushirish MMA tayyorgarligining alohida qismi bo'lib, sog'liq nuqtai nazaridan ehtiyotkorlik talab qiladi.

*Bu maqola sayt uchun namuna sifatida yozilgan. Toifa chegaralarini nashr qilishdan oldin rasmiy manbadan tekshiring.*`,
  },
  {
    slug: "ofsayd-qoidasi",
    title: "Ofsayd qoidasi: oddiy tilda tushuntirish",
    date: "2026-09-19",
    category: "futbol",
    kind: "maqola",
    excerpt: "Futbolning eng ko'p bahsga sabab bo'ladigan qoidasi aslida bitta savolga tayanadi. Uni bir marta tushunib olsangiz, bahslar ancha soddalashadi.",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["qoidalar", "ofsayd"],
    createdAt: 1789808400000,
    updatedAt: 1789808400000,
    content: `Ofsayd futbolda eng ko'p munozara qilinadigan qoida. Lekin uning mantig'i sodda: hujumchi raqib darvozasi yonida doim "kutib turmasligi" kerak.

## Asosiy qoida

Hamkoringiz sizga to'p uzatgan paytda siz raqib yarim maydonida bo'lib, raqib darvozasi chizig'iga to'pdan va raqibning oxirgidan bitta oldingi o'yinchisidan yaqinroq tursangiz, siz ofsaydda hisoblanasiz. Odatda oxirgidan oldingi o'yinchi himoyachi bo'ladi, oxirgisi esa darvozabon.

Muhim tafsilot: ofsayd holati to'p **uzatilgan lahzada** aniqlanadi, to'pni olgan paytda emas.

## Ofsayd hisoblanmaydigan hollar

- Darvozadan to'pni tepishda
- Chetdan avtga to'pni tashlashda
- Burchakdan to'pni tepishda
- O'z yarim maydoningizda turganingizda

## Nima uchun bahs bo'ladi

Bahsning ko'p qismi bir necha santimetrlik farqdan kelib chiqadi. Qaysi tana qismi hisobga olinishi ham muhim: darvozaga gol kiritish mumkin bo'lgan qismlar (bosh, tana, oyoq) hisobga olinadi, qo'l esa olinmaydi.

*Bu maqola sayt uchun namuna sifatida yozilgan. Rasmiy qoidalar uchun FIFA va IFAB hujjatlariga qarang.*`,
  },
  {
    slug: "press-nima",
    title: "Press nima va zamonaviy futbolda u nega shuncha muhim?",
    date: "2026-09-20",
    category: "futbol",
    kind: "maqola",
    excerpt: "Raqibni o'z yarim maydonida to'xtatish g'oyasi bugungi futbol taktikasining markazida. Press qanday ishlaydi va uni nima buzadi?",
    author: "Tahririyat",
    image: "",
    featured: true,
    draft: false,
    tags: ["taktika", "press", "futbol"],
    createdAt: 1789894800000,
    updatedAt: 1789894800000,
    content: `Press so'zi futbolda to'pni yo'qotgan jamoaning uni imkon qadar tez qaytarishga urinishini anglatadi. Ya'ni orqaga chekinib mudofaa qurish o'rniga, to'p turgan joyning o'zida raqibga bosim o'tkaziladi.

## Press qanday ishlaydi

Asosiy g'oya oddiy: raqib to'pni yangi olgan paytda u eng ojiz bo'ladi. Uning atrofida hali o'yinchilar to'planmagan, pas beradigan yo'nalish yo'q. Shu soniyalarda bosim o'tkazilsa, to'pni raqib darvozasiga yaqin joyda qaytarib olish mumkin.

Press odatda uch narsaga tayanadi:

- **Signal.** Jamoa "endi bosamiz" degan lahzani hammaga tushunarli qilib belgilaydi: masalan, raqib to'pni orqaga yoki chetga uzatganda.
- **Birgalikdagi harakat.** Bir o'yinchi yolg'iz yugurib, foyda bermaydi. Bosim butun jamoa bilan, yaqin pas yo'llarini yopib boriladi.
- **Jismoniy tayyorgarlik.** Press ko'p yugurishni talab qiladi, shuning uchun kuchli chidamlilik kerak.

## Press nima uchun buziladi

Agar bitta o'yinchi kechiksa yoki noto'g'ri joyni yopsa, raqib pressni bitta aniq pas bilan yorib o'tadi. Shunda orqada katta bo'sh maydon qoladi. Shuning uchun murabbiylar pressni ko'pincha o'yin bo'yicha emas, ulushlab, ya'ni ma'lum daqiqalarda yoki maydonning ma'lum qismida qo'llaydi.

## Tomoshabin nimaga qarashi kerak

Keyingi o'yinni ko'rganda to'p yo'qolgan zahoti jamoa nima qilayotganiga e'tibor bering. Hamma birdan oldinga siljisa, bu press. Hamma orqaga tushsa, jamoa past blok bilan himoyalanmoqda.

*Bu maqola sayt uchun namuna sifatida yozilgan. Uni o'chirib, o'z maqolalaringizni qo'shing.*`,
  },
  {
    slug: "tennis-birinchi-servis",
    title: "Birinchi servis foizi nega o'yin natijasini hal qiladi?",
    date: "2026-09-16",
    category: "tennis",
    kind: "maqola",
    excerpt: "Tennis statistikasida bir raqam ko'pincha g'olibni oldindan aytib beradi. Birinchi servisning aniqligi nimaga shuncha ta'sir qiladi?",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["tennis", "statistika", "servis"],
    createdAt: 1789549200000,
    updatedAt: 1789549200000,
    content: `Tennis o'yinini tomosha qilganda diktorlar tez-tez "birinchi servis foizi" haqida gapiradi. Bu raqam oddiy: o'yinchi birinchi urinishda servisni to'g'ri kvadratga necha marta tushirganini ko'rsatadi.

## Nega bu raqam muhim

Servis tennisda to'pni o'zi boshqaradigan yagona zarba. Birinchi servis odatda ikkinchisidan kuchliroq va tezroq bo'ladi. Agar u kvadratga tushsa, raqibning javob berishi qiyinlashadi va ochko ko'pincha servis qilgan o'yinchida qoladi.

Birinchi servis tushmasa, o'yinchi ikkinchi servisga o'tadi. U xavfsizroq, sekinroq va raqib uchun qulayroq. Shuning uchun ikkinchi servisda ochko yo'qotish ehtimoli ancha yuqori.

## Faqat foiz emas

Birinchi servis foizi yolg'iz o'zi yetarli emas. Uning yonida yana ikkita raqamga qarang:

- **Birinchi servisdan yutilgan ochkolar foizi.** Servis tushgandan keyin o'yinchi ochkoni qanchalik yutayotgani.
- **Ikkinchi servisdan yutilgan ochkolar foizi.** Bosim ostida o'yinchining ishonchliligini ko'rsatadi.

Ba'zi o'yinchilar servisni juda kuchli uradi, lekin foizi past. Boshqalari sekinroq, lekin barqaror. Ikkala yondashuv ham ishlashi mumkin, muhimi raqamlar birgalikda qanday ko'rinishi.

*Bu maqola sayt uchun namuna sifatida yozilgan.*`,
  },
  {
    slug: "yugurish-4-hafta",
    title: "Yugurishni boshlash: birinchi 4 hafta uchun sodda reja",
    date: "2026-09-14",
    category: "boshqa",
    kind: "maqola",
    excerpt: "Hech qachon yugurmagan odam ham 4 haftada 20 daqiqa uzluksiz yugurishga tayyorlanishi mumkin. Asosiy sir: yugurish va yurishni almashtirish.",
    author: "Tahririyat",
    image: "",
    featured: false,
    draft: false,
    tags: ["yugurish", "sog'lom turmush", "boshlovchilar"],
    createdAt: 1789376400000,
    updatedAt: 1789376400000,
    content: `Yugurishni boshlagan ko'pchilik birinchi haftada haddan tashqari tez boshlab, charchab tashlab ketadi. Yechim oddiy: yugurishni yurish bilan almashtiring va yukni sekin oshiring.

## 4 haftalik namuna (haftasiga 3 kun)

**1-hafta:** 1 daqiqa yengil yugurish, 2 daqiqa yurish. Buni 8 marta takrorlang.

**2-hafta:** 2 daqiqa yugurish, 2 daqiqa yurish. 6 marta takrorlang.

**3-hafta:** 4 daqiqa yugurish, 1 daqiqa yurish. 4 marta takrorlang.

**4-hafta:** 8 daqiqa yugurish, 2 daqiqa yurish. 2 marta takrorlang, oxirida 4 daqiqa yugurishni qo'shing.

## Foydali maslahatlar

1. **Gaplasha oladigan tezlikda yuguring.** Nafas yetmasa, sekinlashing.
2. **Kunlar orasida dam bering.** Mushak va bo'g'imlar dam olganda mustahkamlanadi.
3. **To'g'ri poyabzal tanlang.** Yugurish uchun mo'ljallangan poyabzal jarohat xavfini kamaytiradi.
4. **Har mashg'ulotdan oldin 5 daqiqa isining**, keyin yengil cho'zilish qiling.

Og'riq sezsangiz, mashg'ulotni to'xtating.

*Bu maqola sayt uchun namuna sifatida yozilgan va tibbiy maslahat emas. Sog'lig'ingizda muammo bo'lsa, boshlashdan oldin shifokor bilan maslahatlashing.*`,
  }
];
