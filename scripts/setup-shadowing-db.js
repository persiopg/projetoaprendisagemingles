const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupShadowingDb() {
  try {
    // Ler arquivo .env manualmente
    const envPath = path.join(process.cwd(), '.env');
    let envVars = {};
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
            }
            envVars[key] = value;
        }
        });
    }

    const connection = await mysql.createConnection({
      host: envVars.DB_HOST || 'localhost',
      user: envVars.DB_USER || 'root',
      password: envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || 'english_app'
    });

    console.log('Conectado ao banco de dados.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS shadowing_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        word VARCHAR(255) NOT NULL,
        is_learned BOOLEAN DEFAULT FALSE,
        last_reviewed DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_word (user_id, word),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('Tabela shadowing_progress criada ou já existente.');

    await connection.end();
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  }
}

setupShadowingDb();
