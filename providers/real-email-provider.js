const nodemailer = require('nodemailer');
const config = require('../config');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

class RealEmailProvider {
    constructor() {
        this.transporters = [];
        this.init();
    }

    init() {
        for (const acc of config.SMTP_ACCOUNTS) {
            const options = {
                service: config.SMTP_SERVICE,
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                secure: config.SMTP_SECURE,
                auth: { user: acc.email, pass: acc.password },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                socketTimeout: 10000
            };
            if (config.SMTP_PROXY) {
                const proxy = config.SMTP_PROXY;
                options.agent = proxy.startsWith('socks') ? new SocksProxyAgent(proxy) : new HttpsProxyAgent(proxy);
            }
            const transporter = nodemailer.createTransport(options);
            this.transporters.push({ account: acc, transporter, failCount: 0 });
        }
        console.log(`✅ Initialized ${this.transporters.length} SMTP accounts`);
    }

    // Envoi avec un compte spécifique (par index)
    async sendEmailWithAccount(index, to, subject, text) {
        const item = this.transporters[index];
        if (!item) return { success: false, message: 'Account not found', account: null };
        
        const names = ['Concerned User', 'WhatsApp User', 'Safety Reporter', 'Community Member'];
        const fromName = names[Math.floor(Math.random() * names.length)];
        
        const mailOptions = {
            from: `"${fromName}" <${item.account.email}>`,
            to,
            subject,
            text,
            headers: { 'X-Mailer': 'WhatsApp Reporter', 'X-Priority': '1', 'Importance': 'high' }
        };

        try {
            const result = await item.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId, account: item.account.email };
        } catch (err) {
            item.failCount++;
            console.error(`SMTP error on ${item.account.email}:`, err.message);
            return { success: false, message: err.message, account: item.account.email };
        }
    }

    // Envoi parallèle : 1 email par compte (tous en même temps)
    async sendEmailParallelAllAccounts(to, subject, text) {
        const promises = this.transporters.map((_, idx) => this.sendEmailWithAccount(idx, to, subject, text));
        const results = await Promise.allSettled(promises);
        return results.map((r, i) => ({
            account: this.transporters[i].account.email,
            success: r.status === 'fulfilled' ? r.value.success : false,
            message: r.status === 'fulfilled' ? r.value.message : r.reason
        }));
    }

    // Envoi multiple : pour chaque rapport, on utilise TOUS les comptes en parallèle
    async sendMultipleEmailsAllAccounts(to, subject, text, count) {
        const allResults = [];
        for (let i = 0; i < count; i++) {
            const uniqueSubject = `${subject} #${i+1}`;
            const uniqueText = text + `\n\nReport variation ${i+1}`;
            const parallelResults = await this.sendEmailParallelAllAccounts(to, uniqueSubject, uniqueText);
            allResults.push({
                reportIndex: i+1,
                results: parallelResults
            });
            if (i < count-1) await new Promise(r => setTimeout(r, config.EMAIL_SEND_DELAY));
        }
        return allResults;
    }

    close() {
        this.transporters.forEach(t => t.transporter.close());
    }
}

module.exports = RealEmailProvider;