require('dotenv').config();
const express = require('express');
const TelegramService = require('./services/telegram-service');

const app = express();
const PORT = process.env.PORT || 3000;

let telegramService;

try {
    // Démarrer le bot en polling (pas de webhook)
    telegramService = new TelegramService();
    console.log('✅ Bot started in polling mode');
} catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
}

// Serveur factice pour Render (indispensable pour garder le service actif)
app.get('/', (req, res) => res.send('Bot is running'));
app.get('/health', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
    console.log(`🌐 HTTP server listening on port ${PORT} (health checks)`);
});

// Arrêt propre
process.on('SIGTERM', () => {
    if (telegramService) telegramService.close();
    server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
    if (telegramService) telegramService.close();
    server.close(() => process.exit(0));
});