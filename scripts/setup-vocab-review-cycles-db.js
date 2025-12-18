const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupVocabReviewCyclesDb() {
  try {
    const { loadEnv } = require('./env-loader');
    const envVars = loadEnv();

    const connection = await mysql.createConnection({
      host: envVars.DB_HOST || 'localhost',
      user: envVars.DB_USER || 'root',
      password: envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || 'english_app',
    });

    console.log('Conectado ao banco de dados.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS vocab_review_cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        word_en VARCHAR(255) NOT NULL,
        completed_count INT NOT NULL DEFAULT 0,
        last_completed_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_word (user_id, word_en),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('Tabela vocab_review_cycles criada ou já existente.');

    await connection.end();
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

setupVocabReviewCyclesDb();
