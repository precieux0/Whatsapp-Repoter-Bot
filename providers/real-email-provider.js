const nodemailer = require('nodemailer');
const config = require('../config');

class RealEmailProvider {
    constructor() {
        this.transporters = [];
        this.init();
    }

    init() {
        if (!config.SMTP_ACCOUNTS || config.SMTP_ACCOUNTS.length === 0) {
            console.error('❌ No SMTP accounts loaded');
            return;
        }
        for (const acc of config.SMTP_ACCOUNTS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: acc.email, pass: acc.password },
                tls: { rejectUnauthorized: false }
            });
            this.transporters.push({ account: acc, transporter, failCount: 0 });
            console.log(`   ✅ Added SMTP account: ${acc.email}`);
        }
        console.log(`✅ Total SMTP accounts: ${this.transporters.length}`);
    }

    // Envoi avec un compte spécifique (index)
    async sendEmailWithAccount(index, to, subject, text) {
        const item = this.transporters[index];
        if (!item) return { success: false, message: 'Account not found', account: null };

        try {
            const info = await item.transporter.sendMail({
                from: item.account.email,
                to,
                subject,
                text
            });
            return { success: true, messageId: info.messageId, account: item.account.email };
        } catch (err) {
            console.error(`❌ Error with ${item.account.email}:`, err.message);
            item.failCount++;
            return { success: false, message: err.message, account: item.account.email };
        }
    }

    // Envoi parallèle : pour un même email, on l'envoie avec TOUS les comptes
    async sendMultipleEmailsAllAccounts(to, subject, text, count) {
        const allResults = [];
        for (let i = 0; i < count; i++) {
            const uniqueSubject = `${subject} #${i+1}`;
            const uniqueText = text + `\n\nVariation ${i+1}`;
            
            // Envoyer avec tous les comptes en parallèle
            const promises = this.transporters.map((_, idx) => 
                this.sendEmailWithAccount(idx, to, uniqueSubject, uniqueText)
            );
            const results = await Promise.allSettled(promises);
            const formattedResults = results.map((res, idx) => ({
                account: this.transporters[idx].account.email,
                success: res.status === 'fulfilled' ? res.value.success : false,
                message: res.status === 'fulfilled' ? res.value.message : res.reason
            }));
            allResults.push({ reportIndex: i+1, results: formattedResults });
            
            // Petit délai entre les lots
            if (i < count-1) await new Promise(r => setTimeout(r, config.EMAIL_SEND_DELAY));
        }
        return allResults;
    }

    close() {
        this.transporters.forEach(t => t.transporter.close());
    }
}

module.exports = RealEmailProvider;