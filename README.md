# CodeX WhatsApp Report Assistant Bot 🤖

A Telegram bot built with Node.js that assists users in submitting **legitimate WhatsApp policy violation reports** via email using structured and professional templates.

> ⚠️ This project is intended **only for genuine reporting** and must be used in compliance with WhatsApp’s Terms of Service and applicable laws.

---

## Badges

![WhatsApp](https://img.shields.io/badge/WhatsApp-Report%20Assistant-brightgreen)
![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

---

## 🚀 Features

- Guided reporting flow via Telegram  
- Professional email report templates  
- Step-by-step user input validation  
- Real-time status updates  
- Automatic retry for temporary email failures  
- Built-in rate limiting  
- Secure SMTP authentication using Gmail App Passwords  

---

## 📋 Prerequisites

- Node.js **18 or higher**
- npm or yarn
- Telegram account
- Gmail account with **2-Factor Authentication enabled**
- Google **App Password** (required)

---

## ⚡ Installation

```bash
git clone https://github.com/KAWDHITHA-NIRMAL/CodeX-Whatsapp-Repoter-Bot-v2.0
cd CodeX-Whatsapp-Repoter-Bot-v2.0
```
```
npm install
```
# Run automated setup
```
npm run setup
```
# Install dependencies
```
npm install
```
2. Configuration
```
Telegram Bot Token
```
- Message @BotFather on Telegram

- Send /newbot and follow instructions

```
Copy the bot token
```
- Gmail App Password (REQUIRED)
- Enable 2-Factor Authentication

- Generate App Password

- Select "Mail" → "Other" → Name: "WhatsApp Bot"

- Copy the 16-digit app password

- Edit .env File
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_16_digit_app_password  # ← APP PASSWORD ONLY!
```
3. Testing
```
bash
# Test email configuration
npm run test:email
```
# Test bot configuration
```
npm run test:bot
```
- 4. Run the Bot

# Start the bot
```
npm start
```
# Development mode with auto-restart

```
npm run dev
```

# 🎯 How to Use

- Starting the Bot
- Message your bot on Telegram

- Send /start to begin

- Mass Reporting Process
- Send /report to start

- Step 1: Enter WhatsApp number (with country code, e.g., +1234567890)

- Step 2: Select violation category (1-10)

- Step 3: Describe the incident in detail (min. 20 characters)

- Step 4: Provide contact info or type "skip"

- Step 5: Choose number of reports (10-50)

- Watch progress as reports are sent automatically

Available Commands
```
/start - Show welcome message and instructions
```
```
/report - Start mass reporting process
```
```
/mystats - Check your reporting statistics
```
```
/emailstats - View email performance metrics
```
```
/help - Get help information
```
---
# 📊 Reporting Categories
- Spam - Unwanted promotional messages

- Harassment - Bullying or threatening behavior

- Fake Account - Impersonation or fake profiles

- Impersonation - Pretending to be someone else

- Illegal Activities - Illegal content or activities

- Privacy Violation - Sharing private information

- Threats - Direct threats or intimidation

- Scam - Fraudulent schemes

- Abusive Content - Hate speech or abuse

- Other - Other violations
---

# ⚙️ Configuration Options

```
.env File Settings
```

# Reporting Limits

```
MIN_REPORTS_PER_SESSION=10      # Minimum reports per session
MAX_REPORTS_PER_SESSION=50      # Maximum reports per session
MAX_REPORTS_PER_HOUR=100        # Hourly limit per user
MAX_REPORTS_PER_DAY=500         # Daily limit per user
```

# Email Settings

```
EMAIL_SEND_DELAY=3000           # Delay between emails (ms)
MAX_EMAIL_ATTEMPTS=3            # Retry attempts for failed emails
EMAIL_RETRY_DELAY=10000         # Delay between retries (ms)
```

---
# SMTP Configuration (Gmail example)
- SMTP_SERVICE=gmail
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- 🛡️ Security Features
- App Passwords Only - Never uses regular Google passwords
- Rate Limiting - Prevents abuse and overuse
- IP Restrictions - Optional IP-based rate limiting
- Session Management - Automatic cleanup of old sessions
- No Data Storage - Reports are not stored long-term

---

# 🔧 Troubleshooting
## Common Issues
###❌ Emails not sending:

- Verify App Password (not regular password)

- Enable 2-factor authentication

- Check SMTP settings in .env

- ❌ Bot not responding:

- Check TELEGRAM_BOT_TOKEN in .env

- Verify internet connection

---
# ❌ Rate limited:

- Wait for cooldown period (1 hour)

- Reduce number of reports per session

---
## Testing Commands

bash

# Test email functionality
```
npm run test:email
```

# Verify configuration
```
npm run test:config
```

# Check bot status
```
npm run test:bot
```

# 📁 Project Structure
```
CodeX-Whatsapp-Repoter-Bot-v2./
├── index.js              # Main application entry point
├── config.js             # Configuration and settings
├── setup.js              # Automated setup script
├── test-email.js         # Email testing utility
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (created by setup)
├── services/
│   ├── telegram-service.js    # Telegram bot handling
│   ├── email-service.js       # Email sending logic
│   └── report-service.js      # Report generation
├── providers/
│   └── real-email-provider.js # SMTP email provider
├── templates/
│   └── report-template.txt    # Email template
├── scripts/              # Utility scripts
├── reports_backup/       # Report backups (optional)
├── temp/                 # Temporary files
└── logs/                 # Application logs
```
# 🚨 Important Notes
```
Legal and Ethical Use
Only report genuine violations

Do not abuse the system

Respect WhatsApp's Terms of Service

Provide accurate information

This tool is for legitimate reporting only

Technical Limitations
Requires stable internet connection

Gmail has daily sending limits (500 emails/day)

WhatsApp support response times may vary

Some emails may be filtered as spam initially

Performance
10 reports: ~30 seconds

50 reports: ~2-3 minutes

Speed depends on email service performance

```
# 🤝 Contributing
```
Fork the repository
```
```
Create a feature branch (git checkout -b feature/amazing-feature)
```
```
Commit changes (git commit -m 'Add amazing feature')
```
```
Push to branch (git push origin feature/amazing-feature)
```
```
Open a Pull Request
```

## 🤝 Support & Contact

### Need Help?

- 💬 **Telegram Support:** [@CodeX_Developer](https://t.me/codex_developer)
- 👨‍💻 **Developer:** [@kawdiha_Nirmal](https://t.me/kawdiha_Nirmal)
- 📢 **Updates Channel:** [@CodeX_Developer](https://t.me/codex_developer)

### Report Issues

If you encounter any bugs or issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review `logs/bot.log` for error messages
3. Contact support with error details

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 CodeX Developer Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Credits

**Developed by:** CodeX Developer Corporation  
**Lead Developer:** @kawdiha_Nirmal  
**Version:** 2.0  
**Year:** 2025

---
## 🤝 Connect with Me

<a href="https://dev.dubhub.lk" target="_blank"><img src="https://img.icons8.com/fluency/48/web.png" alt="Website"/></a>
<a href="mailto:codexsldev@gmail.com" target="_blank"><img src="https://img.icons8.com/fluency/48/000000/mail.png" alt="Email"/></a>
<a href="https://t.me/Codex_dev" target="_blank"><img src="https://img.icons8.com/fluency/48/000000/telegram-app.png" alt="Telegram"/></a>
<a href="https://github.com/KAWDHITHA-NIRMAL" target="_blank"><img src="https://img.icons8.com/fluency/48/000000/github.png" alt="GitHub"/></a>

---

<div align="left">
  <img src="https://komarev.com/ghpvc/?username=KAWDHITHA-NIRMAL&color=blueviolet&style=for-the-badge" alt="Profile Views" />
</div>

  <a href="https://t.me/codex_developer" target="_blank"><img src="https://social-card-codex.vercel.app/api/telegram?username=codex_developer&theme=dark&overrideVerified=true&overrideVerifiedIcon=https%3A%2F%2Fstatic.whatsapp.net%2Frsrc.php%2Fv4%2FyM%2Fr%2FSGDtYg_EYce.png" alt="CodeX Developers tg" style="width: 300px; max-width: 100%; height: auto;" /></a>
</div>

**Made with ❤️ by CodeX Developer**

⭐ **Star this project if you find it helpful!** ⭐

</div>
