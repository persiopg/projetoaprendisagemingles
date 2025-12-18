const { loadEnv } = require('./env-loader');
const fs = require('fs');
const path = require('path');

const localEnvPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(localEnvPath)) {
    console.log('--- RAW .env.local (first 200 chars) ---');
    const content = fs.readFileSync(localEnvPath, 'utf8');
    console.log(content.substring(0, 200));
    console.log('----------------------------------------');
} else {
    console.log('.env.local NOT FOUND');
}

const envVars = loadEnv();
console.log('DB_HOST:', envVars.DB_HOST);
console.log('DB_USER:', envVars.DB_USER);
