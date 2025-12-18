const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDictationDb() {
  try {
    const { loadEnv } = require('./env-loader');
    const envVars = loadEnv();

    const connection = await mysql.createConnection({
      host: envVars.DB_HOST || 'localhost',
      user: envVars.DB_USER || 'root',
      password: envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || 'english_app'
    });

    console.log('Conectado ao banco de dados.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS dictation_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('Tabela dictation_progress criada ou já existente.');

    await connection.end();
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

setupDictationDb();
