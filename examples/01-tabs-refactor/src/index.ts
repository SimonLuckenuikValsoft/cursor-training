/**
 * Entry point for the User Service module
 */

export * from './userService.js';

import { createUser, getUserById, formatUserForDisplay, clearUsers } from './userService.js';

// Demo usage
function main() {
  console.log('User Service Demo\n');

  // Create a user
  const result = createUser({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
  });

  if (result.success && result.data) {
    console.log('Created user:');
    console.log(formatUserForDisplay(result.data));

    // Retrieve the user
    const getResult = getUserById(result.data.id);
    if (getResult.success) {
      console.log('\nRetrieved user successfully!');
    }
  } else {
    console.error('Failed to create user:', result.error);
  }

  // Clean up
  clearUsers();
}

main();
