// Use dynamic imports to avoid require() style imports

async function checkDb() {
  try {
    // Dynamically import modules to avoid require() style imports
    const mysqlModule = await import('mysql2/promise');
    const mysql = mysqlModule.default || mysqlModule;
    const fsModule = await import('fs');
    const fs = fsModule.default || fsModule;
    const pathModule = await import('path');
    const path = pathModule.default || pathModule;

    // Ler arquivo .env manualmente para não depender do dotenv
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove aspas se houver
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    });

    console.log('Tentando conectar com as seguintes configurações:');
    console.log('Host:', envVars.DB_HOST);
    console.log('User:', envVars.DB_USER);
    console.log('Database:', envVars.DB_NAME);
    // Não mostrar a senha por segurança

    const connection = await mysql.createConnection({
      host: envVars.DB_HOST || 'localhost',
      user: envVars.DB_USER || 'root',
      password: envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || 'english_app'
    });

    console.log('\n✅ Conexão bem sucedida!\n');

    // Consultar Usuários
    console.log('--- Usuários Cadastrados ---');
    const [users] = await connection.execute('SELECT id, name, email, created_at FROM users');
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado.');
    } else {
      console.table(users);
    }

    // Consultar Progresso
    console.log('\n--- Progresso dos Flashcards ---');
    const [progress] = await connection.execute(`
      SELECT fp.id, u.email, fp.word, fp.is_learned, fp.last_reviewed 
      FROM flashcard_progress fp
      JOIN users u ON fp.user_id = u.id
      LIMIT 10
    `);
    
    if (progress.length === 0) {
      console.log('Nenhum progresso registrado ainda.');
    } else {
      console.table(progress);
    }

    await connection.end();

  } catch (error) {
    console.error('\n❌ Erro ao conectar ou consultar o banco de dados:');
    console.error(error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nVerifique se o usuário e senha no arquivo .env estão corretos.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nVerifique se o banco de dados foi criado.');
    }
  }
}

checkDb();
