const mysql = require('mysql2/promise');
const { loadEnv } = require('./env-loader');

async function setupFlashcardsDb() {
    try {
        const envVars = loadEnv();

        const connection = await mysql.createConnection({
            host: envVars.DB_HOST || 'localhost',
            user: envVars.DB_USER || 'root',
            password: envVars.DB_PASSWORD || '',
            database: envVars.DB_NAME || 'english_app'
        });

        console.log('Conectado ao banco de dados (setup flashcards).');

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS flashcard_progress (
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
        console.log('Tabela flashcard_progress criada ou já existente.');

        await connection.end();
    } catch (error) {
        console.error('Erro ao configurar tabela flashcard_progress:', error);
        process.exit(1);
    }
}

setupFlashcardsDb();
