import fetch from "node-fetch";
import dotenv from "dotenv";
import promptSync from "prompt-sync";

dotenv.config(); // Charge les variables d'environnement depuis un fichier .env
const prompt = promptSync();

// ⚙️ Demande des informations à l'utilisateur
const date = "2024-03-10";
const moment = "noon"
const pax = 4;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!date || !moment || !pax || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("❌ ERREUR : Toutes les informations sont requises.");
    process.exit(1);
}

const url = `https://api-public.lesgrandsbuffets.com/v1/context/availabilities?date=${date}&moment=${moment}&pax=${pax}`;

console.log(`🔍 Vérification des disponibilités pour ${pax} personnes le ${date} (${moment})...`);

// 🔔 Fonction d'envoi de notification Telegram
async function sendTelegramMessage(message) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown",
            }),
        });

        if (!response.ok) {
            throw new Error(`Erreur Telegram: ${response.statusText}`);
        }
        console.log("📩 Notification envoyée sur Telegram !");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message Telegram :", error.message);
    }
}

// 🔥 Vérification des disponibilités
async function checkAvailability() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📅 Disponibilités reçues :", data);

        if (data[date] && data[date][pax] && data[date][pax][moment]) {
            console.log("✅ Une disponibilité a été trouvée !");
            await sendTelegramMessage(`🎉 **Bonne nouvelle !** Une table pour ${pax} personnes est disponible le ${date} (${moment}) aux *Grands Buffets* !`);
        } else {
            console.log("❌ Aucune disponibilité trouvée.");
        }
    } catch (error) {
        console.error("❗ Erreur lors de la récupération des disponibilités :", error.message);
    }
}

// 🚀 Exécuter la vérification
checkAvailability();
