// start.js - Point d'entrée principal pour Render
require('dotenv').config();

// Démarrer le serveur HTTP (pour Render)
require('./server');

// Attendre 1 seconde puis démarrer le bot Telegram
setTimeout(() => {
    console.log('\n🤖 Starting WhatsApp Mass Reporter Bot...');
    require('./index');
}, 1000);
