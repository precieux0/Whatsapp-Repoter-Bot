require('dotenv').config();

const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    ADMIN_USER_ID: process.env.ADMIN_USER_ID ? parseInt(process.env.ADMIN_USER_ID) : null,
    WHATSAPP_SUPPORT_EMAIL: process.env.WHATSAPP_SUPPORT_EMAIL || 'support@support.whatsapp.com',
    WHATSAPP_ABUSE_EMAIL: process.env.WHATSAPP_ABUSE_EMAIL || 'abuse@whatsapp.com',
    MIN_REPORTS_PER_SESSION: parseInt(process.env.MIN_REPORTS_PER_SESSION) || 10,
    MAX_REPORTS_PER_SESSION: parseInt(process.env.MAX_REPORTS_PER_SESSION) || 50,
    MAX_REPORTS_PER_HOUR: parseInt(process.env.MAX_REPORTS_PER_HOUR) || 100,
    MAX_REPORTS_PER_DAY: parseInt(process.env.MAX_REPORTS_PER_DAY) || 500,
    REPORT_COOLDOWN: parseInt(process.env.REPORT_COOLDOWN) || 3600000,
    EMAIL_SEND_DELAY: parseInt(process.env.EMAIL_SEND_DELAY) || 2000,
    MAX_EMAIL_ATTEMPTS: parseInt(process.env.MAX_EMAIL_ATTEMPTS) || 3,
    EMAIL_RETRY_DELAY: parseInt(process.env.EMAIL_RETRY_DELAY) || 10000,
    SMTP_ENABLED: process.env.SMTP_ENABLED !== 'false',
    SMTP_SERVICE: process.env.SMTP_SERVICE || 'gmail',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    EMAIL_PRIORITY: process.env.EMAIL_PRIORITY || 'high',
    REPORT_CATEGORIES: [
        'Spam', 'Harassment', 'Fake Account', 'Impersonation',
        'Illegal Activities', 'Privacy Violation', 'Threats',
        'Scam', 'Abusive Content', 'Other'
    ],
    CATEGORY_SEVERITY: {
        'Spam': 'medium', 'Harassment': 'high', 'Fake Account': 'medium',
        'Impersonation': 'high', 'Illegal Activities': 'critical',
        'Privacy Violation': 'high', 'Threats': 'critical',
        'Scam': 'high', 'Abusive Content': 'medium', 'Other': 'low'
    },
    VALIDATION: {
        PHONE_NUMBER_MIN_LENGTH: 8, PHONE_NUMBER_MAX_LENGTH: 15,
        DESCRIPTION_MIN_LENGTH: 20, DESCRIPTION_MAX_LENGTH: 1000
    }
};

// ==================== SMTP ACCOUNTS (multiples) ====================
let SMTP_ACCOUNTS = [];
try {
    if (process.env.SMTP_ACCOUNTS) {
        SMTP_ACCOUNTS = JSON.parse(process.env.SMTP_ACCOUNTS);
    } else if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        SMTP_ACCOUNTS = [{ email: process.env.SMTP_EMAIL, password: process.env.SMTP_PASSWORD }];
    }
} catch(e) { console.error('❌ Invalid SMTP_ACCOUNTS JSON'); }
config.SMTP_ACCOUNTS = SMTP_ACCOUNTS;
config.SMTP_PROXY = process.env.SMTP_PROXY || null;

// ==================== WHATSAPP RECIPIENTS (multiples) ====================
let WHATSAPP_RECIPIENTS = [config.WHATSAPP_SUPPORT_EMAIL];
try {
    if (process.env.WHATSAPP_RECIPIENTS) {
        WHATSAPP_RECIPIENTS = JSON.parse(process.env.WHATSAPP_RECIPIENTS);
    }
} catch(e) { console.error('❌ Invalid WHATSAPP_RECIPIENTS JSON, using default'); }
config.WHATSAPP_RECIPIENTS = WHATSAPP_RECIPIENTS;

config.getRandomRecipient = () => {
    if (!config.WHATSAPP_RECIPIENTS.length) return config.WHATSAPP_SUPPORT_EMAIL;
    return config.WHATSAPP_RECIPIENTS[Math.floor(Math.random() * config.WHATSAPP_RECIPIENTS.length)];
};

config.getWhatsAppEmailBySeverity = (severity) => config.getRandomRecipient();
config.getCategorySeverity = (cat) => config.CATEGORY_SEVERITY[cat] || 'medium';

module.exports = config;