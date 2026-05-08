const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const ReportService = require('./report-service');
const EmailService = require('./email-service');

class TelegramService {
    constructor() {
        if (!config.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN required');
        this.bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true, request: { timeout: 60000 } });
        this.reportService = new ReportService();
        this.emailService = new EmailService();
        this.userSessions = new Map();
        this.initializeHandlers();
    }

    initializeHandlers() {
        this.bot.onText(/\/start/, (m) => this.handleStart(m));
        this.bot.onText(/\/report/, (m) => this.handleReport(m));
        this.bot.onText(/\/autoreport/, (m) => this.handleAutoReport(m));
        this.bot.onText(/\/mystats/, (m) => this.handleStats(m));
        this.bot.onText(/\/emailstats/, (m) => this.handleEmailStats(m));
        this.bot.onText(/\/help/, (m) => this.handleHelp(m));
        this.bot.on('message', (m) => this.handleMessage(m));
    }

    handleStart(msg) {
        const chatId = msg.chat.id;
        this.bot.sendMessage(chatId, 
            "🚨 *WhatsApp Mass Reporter Bot*\n\n/report - Mode manuel (rapide avec templates)\n/autoreport - Mode automatique (juste le numéro)\n/mystats - Tes stats\n/help - Aide",
            { parse_mode: 'Markdown' }
        );
    }

    handleReport(msg) {
        const chatId = msg.chat.id;
        if (!this.reportService.canUserReport(chatId)) {
            return this.bot.sendMessage(chatId, "❌ Limite horaire atteinte.");
        }
        this.userSessions.set(chatId, { step: 'awaiting_number', lastActivity: Date.now() });
        this.bot.sendMessage(chatId, "📱 Envoie le numéro (+1234567890)");
    }

    handleAutoReport(msg) {
        const chatId = msg.chat.id;
        if (!this.reportService.canUserReport(chatId)) {
            return this.bot.sendMessage(chatId, "❌ Limite horaire atteinte.");
        }
        this.userSessions.set(chatId, { step: 'auto_number', lastActivity: Date.now() });
        this.bot.sendMessage(chatId, "🤖 Mode auto : envoie le numéro (+1234567890)");
    }

    async handleAutoNumber(chatId, number, session) {
        if (!this.reportService.isValidPhoneNumber(number)) {
            return this.bot.sendMessage(chatId, "❌ Numéro invalide.");
        }
        const { getRandomCategory, getRandomDescription, getRandomQuantity } = require('../utils/random-content');
        const stats = this.reportService.getUserReportStats(chatId);
        session.phoneNumber = number;
        session.category = getRandomCategory();
        session.description = getRandomDescription();
        session.quantity = getRandomQuantity(stats.remaining);
        session.reporterContact = 'Anonymous';
        session.step = 'confirm_auto';
        this.userSessions.set(chatId, session);
        this.bot.sendMessage(chatId, 
            `📋 *Résumé auto*\nNuméro: ${number}\nCatégorie: ${session.category}\nQuantité: ${session.quantity}\n\nConfirmer ? (yes/no)`,
            { parse_mode: 'Markdown' }
        );
    }

    async handleConfirmAuto(chatId, answer, session) {
        if (answer.toLowerCase() === 'yes') {
            await this.handleMassReporting(chatId, session);
        } else {
            this.bot.sendMessage(chatId, "❌ Annulé.");
        }
        this.userSessions.delete(chatId);
    }

    handleStats(msg) {
        const chatId = msg.chat.id;
        const stats = this.reportService.getUserReportStats(chatId);
        this.bot.sendMessage(chatId, 
            `📊 Stats : ${stats.reportsToday}/${config.MAX_REPORTS_PER_HOUR} aujourd'hui`,
            { parse_mode: 'Markdown' }
        );
    }

    handleEmailStats(msg) {
        const chatId = msg.chat.id;
        const s = this.emailService.getStats();
        this.bot.sendMessage(chatId, 
            `📧 Emails : ${s.successful}/${s.total} succès`,
            { parse_mode: 'Markdown' }
        );
    }

    handleHelp(msg) {
        const chatId = msg.chat.id;
        this.bot.sendMessage(chatId, 
            "/report - Manuel avec templates\n/autoreport - Auto\n/mystats - Stats\n/emailstats - Emails",
            { parse_mode: 'Markdown' }
        );
    }

    handleMessage(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;
        const session = this.userSessions.get(chatId);
        if (!session) return;

        switch (session.step) {
            case 'awaiting_number': this.handlePhoneNumber(chatId, text, session); break;
            case 'awaiting_category': this.handleCategory(chatId, text, session); break;
            case 'awaiting_description': this.handleDescription(chatId, text, session); break;
            case 'awaiting_contact': this.handleContactInfo(chatId, text, session); break;
            case 'awaiting_quantity': this.handleReportQuantity(chatId, text, session); break;
            case 'auto_number': this.handleAutoNumber(chatId, text, session); break;
            case 'confirm_auto': this.handleConfirmAuto(chatId, text, session); break;
            default: break;
        }
    }

    // ==================== MODE MANUEL ====================
    handlePhoneNumber(chatId, text, session) {
        if (!this.reportService.isValidPhoneNumber(text)) {
            return this.bot.sendMessage(chatId, "❌ Format invalide. Ex: +1234567890");
        }
        session.phoneNumber = text;
        session.step = 'awaiting_category';
        this.userSessions.set(chatId, session);
        const cats = config.REPORT_CATEGORIES.map((c,i) => `${i+1}. ${c}`).join('\n');
        this.bot.sendMessage(chatId, `📂 Catégorie ?\n${cats}\n\nRéponds avec le numéro (1-${cats.length})`);
    }

    handleCategory(chatId, text, session) {
        const idx = parseInt(text)-1;
        if (isNaN(idx) || idx < 0 || idx >= config.REPORT_CATEGORIES.length) {
            return this.bot.sendMessage(chatId, "Choix invalide.");
        }
        session.category = config.REPORT_CATEGORIES[idx];
        session.step = 'awaiting_description';
        this.userSessions.set(chatId, session);
        
        // Liste des templates de description (prédéfinies)
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
        session.templates = templates.map(t => t.replace(/^\d+️⃣\s*/, '')); // stocke sans le numéro
        this.bot.sendMessage(chatId, "📝 *Choisis une description* (envoie le numéro) :\n\n" + templates.join('\n'), { parse_mode: 'Markdown' });
        session.step = 'awaiting_template_choice';
        this.userSessions.set(chatId, session);
    }

    // Nouvelle étape : choix du template
    async handleTemplateChoice(chatId, text, session) {
        const idx = parseInt(text) - 1;
        if (isNaN(idx) || idx < 0 || idx >= session.templates.length) {
            return this.bot.sendMessage(chatId, "❌ Choix invalide. Envoie un numéro entre 1 et 10.");
        }
        session.description = session.templates[idx];
        session.step = 'awaiting_contact';
        this.userSessions.set(chatId, session);
        this.bot.sendMessage(chatId, "📞 Contact (ou 'skip' pour anonyme) :");
    }

    // Remplacer la méthode handleDescription par handleTemplateChoice
    async handleDescription(chatId, text, session) {
        // Rediriger vers le choix de template
        await this.handleTemplateChoice(chatId, text, session);
    }

    handleContactInfo(chatId, text, session) {
        session.reporterContact = text.toLowerCase() === 'skip' ? 'Anonymous' : text;
        session.step = 'awaiting_quantity';
        this.userSessions.set(chatId, session);
        const stats = this.reportService.getUserReportStats(chatId);
        const maxAllowed = Math.min(config.MAX_REPORTS_PER_SESSION, stats.remaining);
        this.bot.sendMessage(chatId, `🔢 Quantité (${config.MIN_REPORTS_PER_SESSION}-${maxAllowed}) :`);
    }

    handleReportQuantity(chatId, text, session) {
        const qty = parseInt(text);
        const stats = this.reportService.getUserReportStats(chatId);
        const maxAllowed = Math.min(config.MAX_REPORTS_PER_SESSION, stats.remaining);
        if (isNaN(qty) || qty < config.MIN_REPORTS_PER_SESSION || qty > maxAllowed) {
            return this.bot.sendMessage(chatId, `Quantité invalide. Entre ${config.MIN_REPORTS_PER_SESSION} et ${maxAllowed}`);
        }
        session.quantity = qty;
        this.userSessions.set(chatId, session);
        this.handleMassReporting(chatId, session);
    }

    // ==================== ENVOI PARALLÈLE ====================
    async handleMassReporting(chatId, session) {
        try {
            const reportTemplate = this.reportService.generateReportTemplate(session);
            const totalAccounts = config.SMTP_ACCOUNTS.length;
            const totalEmailsToSend = session.quantity * totalAccounts;
            
            const progressMsg = await this.bot.sendMessage(chatId, 
                `⏳ Envoi parallèle de ${session.quantity} rapport(s) avec ${totalAccounts} comptes...\n(Total emails : ${totalEmailsToSend})`
            );
            
            const startTime = Date.now();
            const result = await this.emailService.sendMultipleReportsParallel(reportTemplate, session.quantity);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            
            const summary = `✅ Terminé en ${elapsed}s\n` +
                `📊 Rapports : ${session.quantity}\n` +
                `📧 Comptes : ${totalAccounts}\n` +
                `✉️ Emails envoyés : ${result.successful}\n` +
                `❌ Échecs : ${result.failed}\n` +
                `📈 Taux : ${((result.successful / totalEmailsToSend) * 100).toFixed(1)}%`;
            
            await this.bot.editMessageText(summary, {
                chat_id: chatId,
                message_id: progressMsg.message_id
            });
            
            this.reportService.updateUserReportCount(chatId, session.quantity);
        } catch (err) {
            console.error(err);
            this.bot.sendMessage(chatId, "❌ Erreur lors de l'envoi parallèle.");
        } finally {
            this.userSessions.delete(chatId);
        }
    }

    close() {
        this.emailService.close();
    }
}

module.exports = TelegramService;