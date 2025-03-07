const fetch = require("node-fetch");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_URL = "https://api-public.lesgrandsbuffets.com/v1/context/availabilities";

async function checkDisponibilites() {
    try {
        const response = await fetch(API_URL);
        const disponibilites = await response.json();
        
        let message = "🚨 Disponibilités trouvées ! 🚨\n";
        let found = false;

        for (const date in disponibilites) {
            for (const pax in disponibilites[date]) {
                for (const moment in disponibilites[date][pax]) {
                    if (disponibilites[date][pax][moment]) {
                        found = true;
                        message += `📅 ${date} | 👥 ${pax} pers. | ⏰ ${moment}\n`;
                    }
                }
            }
        }

        if (found) {
            sendTelegramMessage(message);
        } else {
            console.log("❌ Aucune disponibilité trouvée.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des disponibilités :", error);
    }
}

async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = { chat_id: TELEGRAM_CHAT_ID, text };

    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        });
        console.log("✅ Message envoyé sur Telegram !");
    } catch (error) {
        console.error("Erreur lors de l'envoi du message Telegram :", error);
    }
}

// Exécuter le script
checkDisponibilites();
