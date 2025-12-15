const mysql = require('mysql2/promise');
// require('dotenv').config({ path: '.env' });

async function checkProgress() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [users] = await connection.execute('SELECT * FROM users');
    console.log('Users:', users);

    if (users.length > 0) {
      const userId = users[0].id;
      const [progress] = await connection.execute(
        'SELECT COUNT(*) as count FROM flashcard_progress WHERE user_id = ? AND is_learned = 1',
        [userId]
      );
      console.log('Learned count for user 1:', progress[0].count);
      
      const [allProgress] = await connection.execute(
        'SELECT word, is_learned FROM flashcard_progress WHERE user_id = ?',
        [userId]
      );
      console.log('Total progress entries:', allProgress.length);
      console.log('First 5 entries:', allProgress.slice(0, 5));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkProgress();
