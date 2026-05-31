require('dotenv').config();
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Error Handling for process
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

const GROUPS_FILE = path.join(__dirname, 'groups.json');
const chatHistory = new Map();

const MODELS = {
    primary: "gemini-2.5-flash",
    fallbacks: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-pro-latest"]
};

const VERSION = "1.1.0";

const GEMINI_SYSTEM_PROMPT = `Sen Gemini ismli aqlli yordamchisiz. O'zbek tilida juda samimiy va bilimdon gaplashasan. Guruhda odamlarga yordam berasan. Qoidalaring: 1. Agar kimdir 'Gemini' deb chaqirsa, albatta javob ber. 2. Ish boshlashdan oldin 'Gemini ishni boshladi 🚀' deb ayt. 3. Ishni tugatgach, 'Gemini ishni tugatdi ✅' deb aytishing mumkin.`;

const CODEX_SYSTEM_PROMPT = `Sen Codex ismli professional dasturchi va texnik ekspertsiz. O'zbek tilida texnik, aniq va lo'nda gaplashasan. Qoidalaring: 1. Faqat 'Codex' deb chaqirishganda javob ber. 2. Dasturlash, API, ma'lumotlar bazasi va boshqa texnik savollarga yordam ber.`;

function getGroups() {
    if (!fs.existsSync(GROUPS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveGroupId(chatId) {
    const groups = getGroups();
    const idStr = String(chatId);
    if (!groups.includes(idStr)) {
        groups.push(idStr);
        fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getAIResponse(ctx, modelName, systemPrompt, prompt, retryCount = 0) {
    const chatId = ctx.chat.id;
    try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
        const history = chatHistory.get(chatId) || [];
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        if (!chatHistory.has(chatId)) chatHistory.set(chatId, []);
        const currentHistory = chatHistory.get(chatId);
        currentHistory.push({ role: "user", parts: [{ text: prompt }] });
        currentHistory.push({ role: "model", parts: [{ text: responseText }] });
        if (currentHistory.length > 20) currentHistory.shift();

        return responseText;
    } catch (error) {
        console.error(`AI Error (${modelName}):`, error.message);

        if (error.message.includes("429") && retryCount < 2) {
            await sleep(10000);
            return getAIResponse(ctx, modelName, systemPrompt, prompt, retryCount + 1);
        }

        if (retryCount === 0) {
            for (const fallback of MODELS.fallbacks) {
                if (fallback === modelName) continue;
                try {
                    return await getAIResponse(ctx, fallback, systemPrompt, prompt, 1);
                } catch {
                    continue;
                }
            }
        }

        return "Uzr, hozirda barcha AI modellar band yoki limitda. Iltimos, 1-2 daqiqadan so'ng yozib ko'ring. 🛠️";
    }
}

bot.start((ctx) => {
    const name = ctx.from.first_name || 'Do\'stim';
    return ctx.reply(
        `Salom ${name}! 👋\n\n` +
        `Men Gemini AI yordamchisiman. Menga istalgan savolingizni berishingiz mumkin.\n\n` +
        `📌 **Guruhda ishlatish:**\n` +
        `- "Gemini" yoki "Codex" deb yozing\n` +
        `- Botga javob (reply) bering\n` +
        `- Botning o'zini (@${ctx.botInfo.username}) chaqiring\n\n` +
        `📌 **Shaxsiy chat:** To'g'ridan-to'g'ri savol berishingiz mumkin.\n` +
        `📌 **Buyruqlar:**\n` +
        `/clear - Xotirani tozalash\n` +
        `/status - Bot holati\n` +
        `/help - Yordam`
    );
});

bot.help((ctx) => {
    return ctx.reply(
        "🤖 **Gemini AI Bot yordam**\n\n" +
        "🔹 **Shaxsiy chat:** Har qanday savolingizni yozing, men javob beraman.\n" +
        "🔹 **Guruhda:**\n" +
        "  1. \"Gemini\" yoki \"Codex\" so'zini ishlating.\n" +
        "  2. Bot xabariga javob (reply) bering.\n" +
        "  3. @${ctx.botInfo.username} deb murojaat qiling.\n\n" +
        "🔹 **/clear** - Suhbat xotirasini tozalaydi\n" +
        "🔹 **/status** - Bot holati va statistikasi\n" +
        "🔹 **/help** - Yordam oynasi"
    );
});

bot.command('clear', async (ctx) => {
    const chatId = ctx.chat.id;
    chatHistory.delete(chatId);
    return ctx.reply("🧹 Suhbat xotirasi tozalandi!");
});

bot.command('status', async (ctx) => {
    const groups = getGroups();
    return ctx.reply(
        `📊 **Bot holati:**\n\n` +
        `✅ Versiya: ${VERSION}\n` +
        `👥 Guruhlar soni: ${groups.length}\n` +
        `🧠 Xotiradagi chatlar: ${chatHistory.size}\n` +
        `🤖 Model: ${MODELS.primary}`
    );
});

bot.command('version', (ctx) => {
    return ctx.reply(`v${VERSION}`);
});

bot.on(['text', 'channel_post'], async (ctx) => {
    const message = ctx.message || ctx.channel_post;
    if (!message || !message.text) return;

    const text = message.text;
    const lowerText = text.toLowerCase();
    const chatId = ctx.chat.id;
    const chatType = ctx.chat.type;
    const isGroup = chatType === 'group' || chatType === 'supergroup';
    const isChannel = chatType === 'channel';

    if (isGroup || isChannel) {
        saveGroupId(chatId);
    }

    const botUsername = ctx.botInfo.username.toLowerCase();
    const isGeminiMentioned = lowerText.includes('gemini');
    const isCodexMentioned = lowerText.includes('codex');
    const isBotMentioned = lowerText.includes(`@${botUsername}`);
    const isReplyToBot = message.reply_to_message && message.reply_to_message.from && message.reply_to_message.from.id === ctx.botInfo.id;

    // Log interaction for debugging
    const fromUser = ctx.from ? `${ctx.from.first_name} (ID: ${ctx.from.id})` : 'Channel/Unknown';
    console.log(`[Message] From: ${fromUser}, Chat: ${chatId} (${chatType}), Mentioned: ${isGeminiMentioned || isCodexMentioned || isBotMentioned}, ReplyToBot: ${isReplyToBot}`);

    // Respond if:
    // 1. It's a private chat
    // 2. Bot is mentioned (Gemini, Codex, or @Username)
    // 3. Someone replies to the bot's message
    if (chatType === 'private' || isGeminiMentioned || isCodexMentioned || isBotMentioned || isReplyToBot) {
        try {
            await ctx.sendChatAction('typing');
            
            // Choose prompt (default to Gemini unless Codex is specifically mentioned)
            const systemPrompt = isCodexMentioned ? CODEX_SYSTEM_PROMPT : GEMINI_SYSTEM_PROMPT;
            
            const response = await getAIResponse(ctx, MODELS.primary, systemPrompt, text);
            
            // Mention the user in groups to make it clear who the bot is replying to
            if (isGroup && ctx.from) {
                const userName = ctx.from.first_name || 'Do\'stim';
                return ctx.reply(`${userName}, ${response}`, { reply_to_message_id: message.message_id });
            }
            
            return ctx.reply(response, { reply_to_message_id: message.message_id });
        } catch (e) {
            console.error("Interaction Error:", e.message);
        }
    }
});

bot.telegram.getMe().then(me => {
    console.log(`Bot @${me.username} muvaffaqiyatli ishga tushdi! 🚀`);
}).catch(e => {
    console.error("Bot ulana olmadi:", e.message);
});

bot.launch({ dropPendingUpdates: true }).catch(e => console.error("Bot ishga tushmadi:", e.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
