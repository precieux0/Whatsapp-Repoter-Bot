const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: 'active', bot: 'WhatsApp Mass Reporter', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => { res.status(200).json({ status: 'healthy' }); });

const server = app.listen(PORT, () => console.log(`🌐 Web server on port ${PORT}`));
module.exports = server;