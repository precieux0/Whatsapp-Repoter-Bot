require('dotenv').config();
require('./server');
setTimeout(() => {
    console.log('\n🤖 Starting WhatsApp Mass Reporter Bot...');
    require('./index');
}, 1000);