require('dotenv').config();
const TelegramService = require('./services/telegram-service');

console.log('🚀 Starting WhatsApp Mass Reporter Bot...');
console.log('='.repeat(50));

// Display startup banner
console.log(`
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                                                                                ▓
▓                  CodeX WhatsApp Reporter Bot                                   ▓
▓                  ---------------------------                                  ▓
▓                                                                                ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
`);

// Validate environment variables (supports both SMTP_ACCOUNTS and legacy SMTP_EMAIL/PASSWORD)
let missingVars = [];

if (!process.env.TELEGRAM_BOT_TOKEN) missingVars.push('TELEGRAM_BOT_TOKEN');

let hasSmtp = false;
if (process.env.SMTP_ACCOUNTS) {
    try {
        const accounts = JSON.parse(process.env.SMTP_ACCOUNTS);
        if (accounts.length > 0) hasSmtp = true;
    } catch (e) { console.error('Invalid SMTP_ACCOUNTS JSON'); }
} else if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    hasSmtp = true;
}

if (!hasSmtp) missingVars.push('SMTP_ACCOUNTS (or SMTP_EMAIL + SMTP_PASSWORD)');

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    
    console.log('\n💡 Please set environment variables on Render:');
    console.log('   1. TELEGRAM_BOT_TOKEN - Get from @BotFather on Telegram');
    console.log('   2. SMTP_ACCOUNTS - JSON array like [{"email":"...","password":"..."}]');
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.log('\n📋 How to get TELEGRAM_BOT_TOKEN:');
        console.log('   1. Message @BotFather on Telegram');
        console.log('   2. Send /newbot and follow instructions');
        console.log('   3. Copy the bot token');
    }
    
    if (!hasSmtp) {
        console.log('\n📋 SMTP_ACCOUNTS format example:');
        console.log('   [{"email":"your@gmail.com","password":"app_password"}]');
        console.log('   For Gmail: Enable 2FA and generate App Password');
    }
    
    process.exit(1);
}

// Display configuration summary
console.log('📋 Configuration Summary:');
console.log(`   Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`   SMTP Accounts: ${hasSmtp ? '✅ Set' : '❌ Missing'}`);
console.log(`   WhatsApp Support: ${process.env.WHATSAPP_SUPPORT_EMAIL || 'support@support.whatsapp.com'}`);
console.log(`   Max Reports/Session: ${process.env.MAX_REPORTS_PER_SESSION || 50}`);
console.log(`   Max Reports/Hour: ${process.env.MAX_REPORTS_PER_HOUR || 100}`);

let telegramService;

// Initialize services with error handling
try {
    console.log('\n🔧 Initializing Telegram service...');
    telegramService = new TelegramService();
    console.log('✅ Telegram service initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Telegram service:', error.message);
    
    if (error.message.includes('ETELEGRAM')) {
        console.log('\n💡 Telegram bot token might be invalid');
        console.log('   1. Check your TELEGRAM_BOT_TOKEN in environment variables');
        console.log('   2. Get a new token from @BotFather if needed');
    }
    
    process.exit(1);
}

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('🔴 Unhandled Promise Rejection:', error);
    console.error('Stack:', error.stack);
});

process.on('uncaughtException', (error) => {
    console.error('🔴 Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    shutdown(1);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT (Ctrl+C)');
    shutdown(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM');
    shutdown(0);
});

function shutdown(exitCode = 0) {
    console.log('\n🔚 Shutting down bot gracefully...');
    try {
        if (telegramService) {
            console.log('   Closing Telegram service...');
            telegramService.close();
        }
        if (telegramService && telegramService.emailService) {
            console.log('   Closing email service...');
            telegramService.emailService.close();
        }
        console.log('✅ Cleanup completed');
        console.log('👋 Bot shutdown successfully');
    } catch (shutdownError) {
        console.error('❌ Error during shutdown:', shutdownError);
    } finally {
        process.exit(exitCode);
    }
}

let isRunning = true;
let startTime = Date.now();

setInterval(() => {
    if (isRunning) {
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        console.log(`📊 Bot Status: ONLINE | Uptime: ${hours}h ${minutes}m ${seconds}s`);
        
        if (telegramService && telegramService.emailService) {
            const stats = telegramService.emailService.getStats();
            if (stats.total > 0) {
                console.log(`   📧 Emails: ${stats.successful}/${stats.total} successful (${stats.successRate})`);
            }
        }
    }
}, 30000);

console.log('\n🎉 Bot started successfully!');
console.log('='.repeat(50));
console.log('📋 Available Commands:');
console.log('   /start    - Show welcome message');
console.log('   /report   - Start mass reporting');
console.log('   /autoreport - Auto reporting (just number)');
console.log('   /mystats  - Check your statistics');
console.log('   /emailstats - View email performance');
console.log('   /help     - Get help information');
console.log('');
console.log('⚡ Bot is now listening for messages...');
console.log('💡 Message your bot on Telegram to get started');
console.log('⏹️  Press Ctrl+C to stop the bot');
console.log('='.repeat(50));

module.exports = {
    telegramService,
    shutdown,
    isRunning: () => isRunning
};

process.on('exit', (code) => {
    isRunning = false;
    console.log(`\n🔚 Process exiting with code: ${code}`);
});