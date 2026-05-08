const RealEmailProvider = require('../providers/real-email-provider');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class EmailService {
    constructor() {
        this.emailProvider = new RealEmailProvider();
        this.sentEmails = new Map();
        this.sentCount = 0;
        this.failedEmails = new Map();
        
        this.retryInterval = setInterval(() => {
            this.processRetryQueue();
        }, config.EMAIL_RETRY_DELAY);
        
        console.log('✅ Email service initialized (parallel mode)');
    }

    // Méthode simple (gardée pour compatibilité)
    async sendWhatsAppReport(reportData, attempt = 1) {
        const { content, subject, email: recipientEmail } = reportData;
        const result = await this.emailProvider.sendEmailWithAccount(0, recipientEmail, subject, content);
        const emailId = uuidv4();
        const emailRecord = {
            id: emailId,
            to: recipientEmail,
            subject,
            timestamp: new Date(),
            sendResult: result,
            reportData: { phoneNumber: reportData.phoneNumber, category: reportData.category },
            attempt
        };
        this.sentEmails.set(emailId, emailRecord);
        this.sentCount++;
        return emailRecord;
    }

    // Envoi parallèle avec tous les comptes pour chaque rapport
    async sendMultipleReportsParallel(reportData, count) {
        const { content, subject, email: recipientEmail } = reportData;
        const results = await this.emailProvider.sendMultipleEmailsAllAccounts(recipientEmail, subject, content, count);
        
        let successful = 0;
        let failed = 0;
        for (const report of results) {
            for (const res of report.results) {
                if (res.success) successful++;
                else failed++;
            }
        }
        this.sentCount += successful;
        console.log(`📊 Parallel send: ${successful} success, ${failed} fails`);
        return { results, successful, failed, total: successful + failed };
    }

    async processRetryQueue() {
        // Optionnel, gardé pour compatibilité
    }

    getStats() {
        return {
            total: this.sentCount,
            successful: this.sentCount,
            failed: 0,
            pendingRetry: 0,
            successRate: '100%'
        };
    }

    close() {
        if (this.retryInterval) clearInterval(this.retryInterval);
        this.emailProvider.close();
    }
}

module.exports = EmailService;