const config = require('../config');

const DESCRIPTIONS = [
    "This number is sending spam messages with malicious links to multiple contacts.",
    "Harassment and death threats received from this number repeatedly.",
    "Impersonating a known public figure to scam people.",
    "Shared my private phone number without consent in a public group.",
    "Promoting illegal activities including drug sales and phishing.",
    "Sent unsolicited explicit images and videos.",
    "Financial scam: asking for money under false pretenses.",
    "Fake account using my profile picture to contact my friends.",
    "Sending virus-infected attachments and fake lottery messages.",
    "Coordinated spam campaign sending bulk promotions."
];

const getRandomDescription = () => {
    const base = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
    return base + `\n\nReported on ${new Date().toLocaleDateString()}. Please investigate.`;
};

const getRandomCategory = () => {
    const cats = config.REPORT_CATEGORIES;
    return cats[Math.floor(Math.random() * cats.length)];
};

const getRandomQuantity = (maxRemaining) => {
    const min = config.MIN_REPORTS_PER_SESSION;
    let max = Math.min(maxRemaining, config.MAX_REPORTS_PER_SESSION);
    if (max < min) max = min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = { getRandomDescription, getRandomCategory, getRandomQuantity };