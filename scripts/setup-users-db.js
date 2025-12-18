const mysql = require('mysql2/promise');
const { loadEnv } = require('./env-loader');

async function setupUsersDb() {
    try {
        const envVars = loadEnv();

        const connection = await mysql.createConnection({
            host: envVars.DB_HOST || 'localhost',
            user: envVars.DB_USER || 'root',
            password: envVars.DB_PASSWORD || '',
            database: envVars.DB_NAME || 'english_app'
        });

        console.log('Conectado ao banco de dados (setup users).');

        // Tabela users compatível com NextAuth Credentials provider (email/password)
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

        await connection.execute(createTableQuery);
        console.log('Tabela users criada ou já existente.');

        await connection.end();
    } catch (error) {
        console.error('Erro ao configurar tabela users:', error);
        process.exit(1);
    }
}

setupUsersDb();
