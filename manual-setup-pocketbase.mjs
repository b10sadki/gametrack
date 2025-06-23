import PocketBase from 'pocketbase';

// Configuration
const POCKETBASE_URL = 'http://127.0.0.1:8090';

// Initialize PocketBase
const pb = new PocketBase(POCKETBASE_URL);

/**
 * Manual setup instructions
 */
function printManualSetupInstructions() {
  console.log('?? PocketBase Manual Setup Instructions');
  console.log('=====================================\n');
  
  console.log('1. ?? Open PocketBase Admin Panel:');
  console.log('   http://127.0.0.1:8090/_/\n');
  
  console.log('2. ?? Login with admin credentials:');
  console.log('   Email: sadkidjallel@gmail.com');
  console.log('   Password: changeme123\n');
  
  console.log('3. ?? Create a new collection named "user_games" with these fields:\n');
  
  const fields = [
    { name: 'user', type: 'Relation', required: true, options: 'Users collection, Single select' },
    { name: 'game_id', type: 'Number', required: true, options: 'No min/max limits' },
    { name: 'game_name', type: 'Text', required: true, options: 'No length limits' },
    { name: 'game_background_image', type: 'URL', required: false, options: 'Optional game cover' },
    { name: 'game_released', type: 'Text', required: false, options: 'Release date string' },
    { name: 'game_metacritic', type: 'Number', required: false, options: 'Score 0-100' },
    { name: 'game_platforms', type: 'JSON', required: false, options: 'Platform array' },
    { name: 'game_genres', type: 'JSON', required: false, options: 'Genre array' },
    { name: 'status', type: 'Select', required: true, options: 'Values: backlog, playing, completed, wishlist, none' },
    { name: 'rating', type: 'Number', required: false, options: 'Min: 1, Max: 5' },
    { name: 'notes', type: 'Text', required: false, options: 'User notes' },
    { name: 'play_time', type: 'Number', required: false, options: 'Hours played, Min: 0' },
    { name: 'date_added', type: 'Text', required: true, options: 'ISO date string' },
    { name: 'last_modified', type: 'Text', required: true, options: 'ISO date string' }
  ];
  
  fields.forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name} (${field.type})${field.required ? ' *' : ''}`);
    console.log(`      ${field.options}`);
  });
  
  console.log('\n4. ?? Set API Rules for "user_games" collection:');
  console.log('   List/Search: @request.auth.id != "" && user = @request.auth.id');
  console.log('   View: @request.auth.id != "" && user = @request.auth.id');
  console.log('   Create: @request.auth.id != "" && user = @request.auth.id');
  console.log('   Update: @request.auth.id != "" && user = @request.auth.id');
  console.log('   Delete: @request.auth.id != "" && user = @request.auth.id\n');
  
  console.log('5. ?? Create Indexes (optional but recommended):');
  console.log('   - Single field index on "user" (Ascending)');
  console.log('   - Single field index on "status" (Ascending)');
  console.log('   - Single field index on "game_id" (Ascending)');
  console.log('   - Composite unique index on "user" + "game_id"\n');
  
  console.log('6. ? Test the setup:');
  console.log('   - Create a test user account');
  console.log('   - Try adding a game to the user_games collection');
  console.log('   - Verify the API rules work correctly\n');
  
  console.log('?? Once completed, your PocketBase backend will be ready!');
  console.log('?? Make sure to update your .env file with:');
  console.log('   VITE_POCKETBASE_URL=http://127.0.0.1:8090');
}

/**
 * Test connection to PocketBase
 */
async function testConnection() {
  try {
    console.log('?? Testing PocketBase connection...');
    
    // Try to get collections (this will work even without auth)
    const collections = await pb.collections.getList(1, 1);
    console.log('? PocketBase server is running and accessible');
    console.log(`?? Found ${collections.totalItems} collections\n`);
    
    return true;
  } catch (error) {
    console.error('? Cannot connect to PocketBase server');
    console.error('Error:', error.message);
    console.log('\n?? Make sure PocketBase is running:');
    console.log('   .\\pocketbase.exe serve\n');
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('?? GameTrack PocketBase Setup Helper\n');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    printManualSetupInstructions();
  } else {
    console.log('Please start PocketBase first, then run this script again.');
  }
}

// Run the script
if (import.meta.url.startsWith('file:')) {
  const modulePath = new URL(import.meta.url).pathname;
  if (process.argv[1] === modulePath || process.argv[1].endsWith('manual-setup-pocketbase.mjs')) {
    main();
  }
}

export { printManualSetupInstructions, testConnection };