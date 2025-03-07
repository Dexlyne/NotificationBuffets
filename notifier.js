import fetch from "node-fetch";

const date = "2024-03-11";
const moment = "noon"; // 'noon' pour midi, 'evening' pour le soir
const pax = 4;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_URL = "https://api-public.lesgrandsbuffets.com/v1/context/availabilities";

async function checkDisponibilites() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const disponibilites = await response.json();
        console.log("📅 Disponibilités récupérées :", disponibilites);

        // Vérifie si la date existe dans les données de l'API
        if (disponibilites[date] && disponibilites[date][pax] && disponibilites[date][pax][moment]) {
            const message = `🎉 **Bonne nouvelle !**\n📅 *${date}* | 👥 ${pax} personnes | ⏰ ${moment}\nUne table est disponible aux *Grands Buffets* !`;
            await sendTelegramMessage(message);
        } else {
            console.log("❌ Aucune disponibilité trouvée pour cette date/moment/pax.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des disponibilités :", error);
    }
}

async function sendTelegramMessage(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error("❌ Erreur : Le token Telegram ou le chat ID est manquant.");
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = { chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`Erreur Telegram: ${response.statusText}`);
        }

        console.log("✅ Message envoyé sur Telegram !");
    } catch (error) {
        console.error("Erreur lors de l'envoi du message Telegram :", error);
    }
}

// Exécuter le script
checkDisponibilites();
