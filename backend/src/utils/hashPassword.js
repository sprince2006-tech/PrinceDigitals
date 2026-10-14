/**
 * CLI utility to generate a secure bcrypt password hash for ADMIN_PASSWORD_HASH
 *
 * Usage:
 *   node src/utils/hashPassword.js "YourSecurePassword123"
 */
const bcrypt = require('bcryptjs');

const rawPassword = process.argv[2];

if (!rawPassword) {
  console.log(`
Usage:
  node src/utils/hashPassword.js "<password>"

Example:
  node src/utils/hashPassword.js "MySuperSecretPassword2026!"
`);
  process.exit(1);
}

const saltRounds = 12;
const hash = bcrypt.hashSync(rawPassword, saltRounds);

console.log('\n==============================================');
console.log('🔑 PRINCE DIGITAL — ADMIN PASSWORD HASH GENERATOR');
console.log('==============================================');
console.log(`Plain Password : ${rawPassword}`);
console.log(`Bcrypt Hash    : ${hash}`);
console.log('----------------------------------------------');
console.log('Copy the hash above into your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('==============================================\n');
