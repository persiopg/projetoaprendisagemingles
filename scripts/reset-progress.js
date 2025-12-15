const mysql = require('mysql2/promise');

async function resetProgress() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [result] = await connection.execute('DELETE FROM flashcard_progress');
    console.log(`Progress reset successfully. Deleted ${result.affectedRows} records.`);
  } catch (error) {
    console.error('Error resetting progress:', error);
  } finally {
    await connection.end();
  }
}

resetProgress();
