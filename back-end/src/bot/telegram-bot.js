// ejecutar bot de telegram con: /src/bot/ y despues ejecutar: node telegram-bot.js
import { config } from "dotenv";
config(); // carga el .env

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let offset = 0;

async function getUpdates() {
    const res = await fetch(
        `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=30`
    );
    const data = await res.json();
    return data.result || [];
}

async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });
}

async function main() {
    console.log("Bot de telegram iniciado, esperando mensajes...");
    while (true) {
        const updates = await getUpdates();
        for (const update of updates) {
            offset = update.update_id + 1;
            const msg = update.message;
            if (!msg) continue;

            if (msg.text === "/start") {
                await sendMessage(msg.chat.id,
                    `Hola ${msg.from.first_name}!\n\nSoy el bot de Study Organizer.\n\nEscribe /id para obtener tu Chat ID y poder recibir notas compartidas.`
                );
            } else if (msg.text === "/id") {
                await sendMessage(msg.chat.id,
                    `Tu Chat ID es:\n\n<code>${msg.chat.id}</code>\n\nCópialo y pégalo en Study Organizer para recibir notas.`
                );
                // Nota: para que <code> funcione necesitas parse_mode HTML
            }
        }
    }
}

main();