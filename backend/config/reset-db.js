// reset-db.js
const { resetGreenhouses, resetUsers } = require('./database');

async function resetDB() {
  try {
    await resetUsers();          // resets users
    await resetGreenhouses();    // resets 5 default greenhouses
    console.log('✅ Database reset successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
}

resetDB();