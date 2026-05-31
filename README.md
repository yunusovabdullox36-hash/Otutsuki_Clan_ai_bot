# Telegram AI Bot (Gemini & Codex)

Ushbu bot Telegram guruhlarida Gemini va Codex sun'iy intellektlari bilan muloqot qilish uchun yaratilgan.

## Funksiyalar
- **Gemini:** Umumiy yordamchi, samimiy muloqot, qidiruv natijalarini tushuntirish.
- **Codex:** Texnik mutaxassis, dasturlash va API bo'yicha yordam beradi.
- **Mention Logic:** 'Gemini' yoki 'Codex' so'zlari ishlatilganda tegishli AI javob beradi.
- **Google Search:** 'Qidir' yoki 'Search' so'zlari ishlatilganda ma'lumot qidiradi.
- **Status Reporting:** AI o'z holati haqida (typing, ishni boshladi, tugatdi) xabar beradi.
- **Proactive:** Bot vaqti-vaqti bilan o'zi suhbatga qo'shilishi mumkin.

## O'rnatish
1. `npm install` - kutubxonalarni o'rnatish.
2. `.env` fayliga o'z tokenlaringizni kiriting.
3. `node bot.js` - botni ishga tushirish.

## Talablar
- Node.js (v18+)
- Telegram Bot Token
- Gemini API Key

## Kelajakda qo'shish mumkin:
- **Haqiqiy rasm qidiruv:** Pixabay yoki Unsplash API ulab, `bot.js` dagi `searchImage` funksiyasini yangilash.
- **Grounding:** Google Search Grounding xususiyatini faollashtirish.
