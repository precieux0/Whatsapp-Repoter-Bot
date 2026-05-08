require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const ReportService = require('./services/report-service');
const EmailService = require('./services/email-service');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { webhook: true });
const reportService = new ReportService();
const emailService = new EmailService();
const userSessions = new Map();

// Webhook endpoint
app.post(`/webhook/${config.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Set webhook on startup (Render URL)
const RENDER_URL = process.env.RENDER_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
if (RENDER_URL) {
    bot.setWebHook(`${RENDER_URL}/webhook/${config.TELEGRAM_BOT_TOKEN}`)
        .then(() => console.log('✅ Webhook set'))
        .catch(console.error);
} else {
    console.warn('⚠️ RENDER_URL not set, webhook not configured');
}

// ==================== COMMANDES ====================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        "🚨 *WhatsApp Mass Reporter Bot*\n\n/report - Mode manuel (templates)\n/autoreport - Mode automatique\n/mystats - Tes stats\n/help - Aide",
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/report/, (msg) => {
    const chatId = msg.chat.id;
    if (!reportService.canUserReport(chatId)) {
        return bot.sendMessage(chatId, "❌ Limite horaire atteinte.");
    }
    userSessions.set(chatId, { step: 'awaiting_number', lastActivity: Date.now() });
    bot.sendMessage(chatId, "📱 Envoie le numéro (+1234567890)");
});

bot.onText(/\/autoreport/, (msg) => {
    const chatId = msg.chat.id;
    if (!reportService.canUserReport(chatId)) {
        return bot.sendMessage(chatId, "❌ Limite horaire atteinte.");
    }
    userSessions.set(chatId, { step: 'auto_number', lastActivity: Date.now() });
    bot.sendMessage(chatId, "🤖 Mode auto : envoie le numéro (+1234567890)");
});

bot.onText(/\/mystats/, (msg) => {
    const chatId = msg.chat.id;
    const stats = reportService.getUserReportStats(chatId);
    bot.sendMessage(chatId, 
        `📊 Stats : ${stats.reportsToday}/${config.MAX_REPORTS_PER_HOUR} aujourd'hui`,
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/emailstats/, (msg) => {
    const chatId = msg.chat.id;
    const s = emailService.getStats();
    bot.sendMessage(chatId, 
        `📧 Emails : ${s.successful}/${s.total} succès`,
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        "/report - Manuel avec templates\n/autoreport - Auto\n/mystats - Stats\n/emailstats - Emails",
        { parse_mode: 'Markdown' }
    );
});

// ==================== GESTION DES MESSAGES TEXTE ====================
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;
    const session = userSessions.get(chatId);
    if (!session) return;

    switch (session.step) {
        case 'awaiting_number':
            handlePhoneNumber(chatId, text, session);
            break;
        case 'awaiting_category':
            handleCategory(chatId, text, session);
            break;
        case 'awaiting_description':
            handleTemplateChoice(chatId, text, session);
            break;
        case 'awaiting_contact':
            handleContactInfo(chatId, text, session);
            break;
        case 'awaiting_quantity':
            handleReportQuantity(chatId, text, session);
            break;
        case 'auto_number':
            await handleAutoNumber(chatId, text, session);
            break;
        case 'confirm_auto':
            await handleConfirmAuto(chatId, text, session);
            break;
        default:
            break;
    }
});

// ==================== FONCTIONS MÉTIER ====================
function handlePhoneNumber(chatId, phoneNumber, session) {
    if (!reportService.isValidPhoneNumber(phoneNumber)) {
        return bot.sendMessage(chatId, "❌ Format invalide. Ex: +1234567890");
    }
    session.phoneNumber = phoneNumber;
    session.step = 'awaiting_category';
    userSessions.set(chatId, session);
    const cats = config.REPORT_CATEGORIES.map((c,i) => `${i+1}. ${c}`).join('\n');
    bot.sendMessage(chatId, `📂 Catégorie ?\n${cats}\n\nRéponds avec le numéro (1-${cats.length})`);
}

function handleCategory(chatId, text, session) {
    const idx = parseInt(text)-1;
    if (isNaN(idx) || idx < 0 || idx >= config.REPORT_CATEGORIES.length) {
        return bot.sendMessage(chatId, "Choix invalide.");
    }
    session.category = config.REPORT_CATEGORIES[idx];
    session.step = 'awaiting_description';
    userSessions.set(chatId, session);
    
    const templates = [
        "1️⃣ Spam : Envoi de messages publicitaires et de liens malveillants.",
        "2️⃣ Harcèlement : Menaces et insultes répétées.",
        "3️⃣ Usurpation d'identité : Se fait passer pour une autre personne.",
        "4️⃣ Partage privé : Mon numéro a été partagé sans mon consentement.",
        "5️⃣ Activité illégale : Vente de drogues, arnaques.",
        "6️⃣ Contenu explicite : Envoi de photos/videos obscènes non sollicitées.",
        "7️⃣ Arnaque financière : Demande d'argent sous faux prétexte.",
        "8️⃣ Faux compte : Utilise mon nom et ma photo.",
        "9️⃣ Virus : Envoi de fichiers infectés.",
        "🔟 Autre : Comportement suspect général."
    ];
    session.templates = templates.map(t => t.replace(/^\d+️⃣\s*/, ''));
    bot.sendMessage(chatId, "📝 *Choisis une description* (envoie le numéro) :\n\n" + templates.join('\n'), { parse_mode: 'Markdown' });
    session.step = 'awaiting_template_choice';
    userSessions.set(chatId, session);
}

function handleTemplateChoice(chatId, text, session) {
    const idx = parseInt(text)-1;
    if (isNaN(idx) || idx < 0 || idx >= session.templates.length) {
        return bot.sendMessage(chatId, "❌ Choix invalide. Envoie un numéro entre 1 et 10.");
    }
    session.description = session.templates[idx];
    session.step = 'awaiting_contact';
    userSessions.set(chatId, session);
    bot.sendMessage(chatId, "📞 Contact (ou 'skip' pour anonyme) :");
}

function handleContactInfo(chatId, text, session) {
    session.reporterContact = text.toLowerCase() === 'skip' ? 'Anonymous' : text;
    session.step = 'awaiting_quantity';
    userSessions.set(chatId, session);
    const stats = reportService.getUserReportStats(chatId);
    const maxAllowed = Math.min(config.MAX_REPORTS_PER_SESSION, stats.remaining);
    bot.sendMessage(chatId, `🔢 Quantité (${config.MIN_REPORTS_PER_SESSION}-${maxAllowed}) :`);
}

function handleReportQuantity(chatId, text, session) {
    const qty = parseInt(text);
    const stats = reportService.getUserReportStats(chatId);
    const maxAllowed = Math.min(config.MAX_REPORTS_PER_SESSION, stats.remaining);
    if (isNaN(qty) || qty < config.MIN_REPORTS_PER_SESSION || qty > maxAllowed) {
        return bot.sendMessage(chatId, `Quantité invalide. Entre ${config.MIN_REPORTS_PER_SESSION} et ${maxAllowed}`);
    }
    session.quantity = qty;
    userSessions.set(chatId, session);
    handleMassReporting(chatId, session);
}

async function handleAutoNumber(chatId, number, session) {
    if (!reportService.isValidPhoneNumber(number)) {
        return bot.sendMessage(chatId, "❌ Numéro invalide.");
    }
    const { getRandomCategory, getRandomDescription, getRandomQuantity } = require('./utils/random-content');
    const stats = reportService.getUserReportStats(chatId);
    session.phoneNumber = number;
    session.category = getRandomCategory();
    session.description = getRandomDescription();
    session.quantity = getRandomQuantity(stats.remaining);
    session.reporterContact = 'Anonymous';
    session.step = 'confirm_auto';
    userSessions.set(chatId, session);
    bot.sendMessage(chatId, 
        `📋 *Résumé auto*\nNuméro: ${number}\nCatégorie: ${session.category}\nQuantité: ${session.quantity}\n\nConfirmer ? (yes/no)`,
        { parse_mode: 'Markdown' }
    );
}

async function handleConfirmAuto(chatId, answer, session) {
    if (answer.toLowerCase() === 'yes') {
        await handleMassReporting(chatId, session);
    } else {
        bot.sendMessage(chatId, "❌ Annulé.");
    }
    userSessions.delete(chatId);
}

async function handleMassReporting(chatId, session) {
    try {
        const reportTemplate = reportService.generateReportTemplate(session);
        const totalAccounts = config.SMTP_ACCOUNTS.length;
        const totalEmailsToSend = session.quantity * totalAccounts;
        
        const progressMsg = await bot.sendMessage(chatId, 
            `⏳ Envoi parallèle de ${session.quantity} rapport(s) avec ${totalAccounts} comptes...\n(Total emails : ${totalEmailsToSend})`
        );
        
        const startTime = Date.now();
        const result = await emailService.sendMultipleReportsParallel(reportTemplate, session.quantity);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        
        const summary = `✅ Terminé en ${elapsed}s\n` +
            `📊 Rapports : ${session.quantity}\n` +
            `📧 Comptes : ${totalAccounts}\n` +
            `✉️ Emails envoyés : ${result.successful}\n` +
            `❌ Échecs : ${result.failed}\n` +
            `📈 Taux : ${((result.successful / totalEmailsToSend) * 100).toFixed(1)}%`;
        
        await bot.editMessageText(summary, {
            chat_id: chatId,
            message_id: progressMsg.message_id
        });
        
        reportService.updateUserReportCount(chatId, session.quantity);
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "❌ Erreur lors de l'envoi parallèle.");
    } finally {
        userSessions.delete(chatId);
    }
}

// ==================== DÉMARRAGE SERVEUR ====================
app.listen(PORT, () => {
    console.log(`🌐 Webhook server running on port ${PORT}`);
    console.log(`🤖 Bot ready (no polling)`);
});

// Nettoyage
process.on('SIGTERM', () => {
    emailService.close();
    process.exit(0);
});