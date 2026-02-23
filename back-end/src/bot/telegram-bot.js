// ejecutar bot de telegram con: node src/bot/telegram-bot.js
import { config } from "dotenv";
config(); // carga el .env

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let offset = 0;

async function getUpdates() {
    try {
        const res = await fetch(
            `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=30`
        );

        if (!res.ok) {
            console.error("Respuesta no OK de Telegram:", res.status);
            return [];
        }

        const data = await res.json();
        return data.result || [];

    } catch (error) {
        console.error("Error en getUpdates:", error.message);
        return []; // importante: no lanzar error
    }
}

async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML" // necesario para <code>
        }),
    });
}

console.log("Bot de telegram iniciado, esperando mensajes...");

async function loop() {
    try {
        const updates = await getUpdates();

        for (const update of updates) {
            offset = update.update_id + 1;

            const msg = update.message;
            if (!msg) continue;

            if (msg.text === "/start") {
                await sendMessage(
                    msg.chat.id,
                    `Hola ${msg.from.first_name}!\n\nSoy el bot de Study Organizer.\n\nEscribe /id para obtener tu Chat ID y poder recibir notas compartidas.`
                );

            } else if (msg.text === "/id") {
                await sendMessage(
                    msg.chat.id,
                    `Tu Chat ID es:\n\n<code>${msg.chat.id}</code>\n\nCópialo y pégalo en Study Organizer para recibir notas.`
                );
            }
        }

    } catch (err) {
        console.error("Error en loop del bot:", err);
    }

    // Espera 1 segundo después de terminar antes de volver a ejecutar
    setTimeout(loop, 1000);
}

loop();