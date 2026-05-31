require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function runTest(testNumber, prompt) {
    console.log(`\n--- Test #${testNumber} boshlandi ---`);
    console.log(`Prompt: "${prompt}"`);
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const duration = (Date.now() - startTime) / 1000;
        
        const responseText = result.response.text();
        console.log(`Javob: ${responseText.substring(0, 100)}...`);
        console.log(`Test #${testNumber} muvaffaqiyatli yakunlandi! (Vaqt: ${duration}s)`);
        return true;
    } catch (error) {
        console.error(`Test #${testNumber}da xatolik:`, error.message);
        return false;
    }
}

async function main() {
    console.log("🚀 3 bosqichli testni boshlaymiz...\n");
    
    const tests = [
        "Salom, bugun ob-havo qanday bo'lishini taxmin qila olasanmi?",
        "Dasturlashda 'recursion' nima? Oddiy tushuntir.",
        "Menga bitta qisqa o'zbekcha she'r aytib ber."
    ];
    
    let successCount = 0;
    for (let i = 0; i < tests.length; i++) {
        const success = await runTest(i + 1, tests[i]);
        if (success) successCount++;
        // 2 soniya kutamiz
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log(`\n--- Yakuniy natija ---`);
    console.log(`Jami testlar: ${tests.length}`);
    console.log(`Muvaffaqiyatli: ${successCount}`);
    
    if (successCount === tests.length) {
        console.log("\n✅ Barcha testlar muvaffaqiyatli o'tdi! Bot ishlashga tayyor.");
        process.exit(0);
    } else {
        console.log("\n⚠️ Ayrim testlarda xatolik bo'ldi. Iltimos, API kalitini tekshiring.");
        process.exit(1);
    }
}

main();
