const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envVars = {};
    const files = ['.env.local', '.env'];

    files.forEach(file => {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                // Remove comments and trim
                const cleanLine = line.split('#')[0].trim();
                if (!cleanLine) return;

                // More flexible regex: supports spaces around =, and export keyword
                const match = cleanLine.match(/^(?:export\s+)?([\w._-]+)\s*=\s*(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    // Only set if not already present (first file wins if we iterate order properly, 
                    // but here checking if key exists prevents overwriting.
                    // Since we process .env.local FIRST in the list above, it takes precedence.
                    if (!envVars[key]) {
                        envVars[key] = value;
                    }
                }
            });
        }
    });

    // Also default to process.env for missing keys
    Object.keys(process.env).forEach(key => {
        if (envVars[key] === undefined) {
            envVars[key] = process.env[key];
        }
    });

    return envVars;
}

module.exports = { loadEnv };
