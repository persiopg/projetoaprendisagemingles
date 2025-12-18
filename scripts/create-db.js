const mysql = require('mysql2/promise');
const { loadEnv } = require('./env-loader');

async function createDb() {
    try {
        const envVars = loadEnv();
        const dbName = envVars.DB_NAME || 'english_app';

        // Connect without database selected to create it
        const connection = await mysql.createConnection({
            host: envVars.DB_HOST || 'localhost',
            user: envVars.DB_USER || 'root',
            password: envVars.DB_PASSWORD || ''
        });

        console.log(`Conectado ao MySQL. Verificando banco '${dbName}'...`);

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Banco de dados '${dbName}' verificado/criado.`);

        await connection.end();
    } catch (error) {
        console.error('Erro ao criar banco de dados:', error);
        process.exit(1);
    }
}

createDb();
