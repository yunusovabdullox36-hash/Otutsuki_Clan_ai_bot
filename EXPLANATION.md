# Telegram AI Bot Loyihasi - To'liq Tushuntirish

Ushbu loyiha Telegram orqali Google Gemini AI modellaridan foydalanish imkonini beruvchi aqlli botdir. Quyida loyihadagi har bir fayl va kod qismlari batafsil tushuntirilgan.

## 1. Loyiha Tuzilishi

*   `bot.js` - Botning asosiy mantiqiy markazi.
*   `.env` - Maxfiy kalitlar (Tokenlar) saqlanadigan joy.
*   `package.json` - Kutubxonalar va loyiha ma'lumotlari.
*   `groups.json` - Bot qo'shilgan guruhlar ID raqamlari ro'yxati.
*   `list-models.js` - Mavjud AI modellar ro'yxatini ko'rish uchun yordamchi skript.
*   `test-api.js` - API kaliti to'g'ri ishlayotganini tekshirish uchun skript.

## 2. bot.js Fayli Tushuntirishi

Bu fayl botning "miyasi" hisoblanadi.

### Kutubxonalarni ulash
```javascript
const { Telegraf } = require('telegraf'); // Telegram API bilan ishlash uchun
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Google AI bilan ishlash uchun
const fs = require('fs'); // Fayl tizimi bilan ishlash uchun
```

### AI Modellar Sozlamasi
Loyihada `gemini-2.5-flash` asosiy model sifatida tanlangan. Agar u band bo'lsa yoki xatolik bersa, bot avtomatik ravishda boshqa (fallback) modellarga o'tadi:
*   `gemini-2.0-flash`
*   `gemini-pro-latest`

### Tizim Ko'rsatmalari (System Prompts)
Bot ikki xil shaxsiyatga ega:
1.  **Gemini**: Umumiy yordamchi, samimiy va bilimdon.
2.  **Codex**: Texnik mutaxassis, dasturlash bo'yicha yordamchi.

### getAIResponse Funksiyasi
Bu funksiya foydalanuvchi savolini olib, uni Google AI ga yuboradi va javobni qaytaradi. Unda quyidagi mexanizmlar bor:
*   **Retry (Qayta urinish)**: Agar API band bo'lsa (429 xatosi), 10 soniya kutib qayta urinadi.
*   **Fallback (Zaxira)**: Agar asosiy model ishlamasa, boshqa modellardan foydalanadi.
*   **History (Xotira)**: Oxirgi 20 ta xabarni eslab qoladi, shunda siz u bilan suhbat qurishingiz mumkin.

## 3. Xavfsizlik (.env)
Hech qachon `TELEGRAM_BOT_TOKEN` va `GEMINI_API_KEY`ni ochiq kodda qoldirmang. Ular `.env` faylida xavfsiz saqlanadi.

## 4. Guruhlar bilan ishlash
Bot guruhga qo'shilganda, u guruhning ID raqamini `groups.json` fayliga yozib qo'yadi. Bu kelajakda barcha guruhlarga xabar yuborish (broadcast) uchun kerak bo'lishi mumkin.

## 5. Buyruqlar
*   `/start` - Botni ishga tushirish.
*   `/help` - Yordam olish.
*   `/clear` - Botning xotirasini tozalash (yangi mavzuda gaplashish uchun).
