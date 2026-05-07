// server.js - Serveur HTTP pour Render
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serveur HTTP simple pour garder Render actif
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        bot: 'WhatsApp Mass Reporter Bot',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        time: new Date().toISOString()
    });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
    console.log(`✅ Health check available at http://localhost:${PORT}/health`);
});

// Exporter pour le shutdown propre
module.exports = server;
