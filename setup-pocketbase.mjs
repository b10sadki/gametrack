import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'sadkidjallel@gmail.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'your-admin-password';

// Initialize PocketBase
const pb = new PocketBase(POCKETBASE_URL);

/**
 * Collection schema for user_games
 */
const USER_GAMES_SCHEMA = {
  name: 'user_games',
  type: 'base',
  schema: [
    {
      name: 'user',
      type: 'relation',
      required: true,
      options: {
        collectionId: '_pb_users_auth_',
        cascadeDelete: true,
        minSelect: null,
        maxSelect: 1,
        displayFields: ['email']
      }
    },
    {
      name: 'game_id',
      type: 'number',
      required: true,
      options: {
        min: null,
        max: null
      }
    },
    {
      name: 'game_name',
      type: 'text',
      required: true,
      options: {
        min: null,
        max: null,
        pattern: ''
      }
    },
    {
      name: 'game_background_image',
      type: 'url',
      required: false,
      options: {
        exceptDomains: null,
        onlyDomains: null
      }
    },
    {
      name: 'game_released',
      type: 'text',
      required: false,
      options: {
        min: null,
        max: null,
        pattern: ''
      }
    },
    {
      name: 'game_metacritic',
      type: 'number',
      required: false,
      options: {
        min: null,
        max: null
      }
    },
    {
      name: 'game_platforms',
      type: 'json',
      required: false,
      options: {}
    },
    {
      name: 'game_genres',
      type: 'json',
      required: false,
      options: {}
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: {
        maxSelect: 1,
        values: ['backlog', 'playing', 'completed', 'wishlist', 'none']
      }
    },
    {
      name: 'rating',
      type: 'number',
      required: false,
      options: {
        min: 1,
        max: 5
      }
    },
    {
      name: 'notes',
      type: 'text',
      required: false,
      options: {
        min: null,
        max: null,
        pattern: ''
      }
    },
    {
      name: 'play_time',
      type: 'number',
      required: false,
      options: {
        min: 0,
        max: null
      }
    },
    {
      name: 'date_added',
      type: 'text',
      required: true,
      options: {
        min: null,
        max: null,
        pattern: ''
      }
    },
    {
      name: 'last_modified',
      type: 'text',
      required: true,
      options: {
        min: null,
        max: null,
        pattern: ''
      }
    }
  ],
  indexes: [
    'CREATE INDEX `idx_user_games_user` ON `user_games` (`user`)',
    'CREATE INDEX `idx_user_games_status` ON `user_games` (`status`)',
    'CREATE INDEX `idx_user_games_game_id` ON `user_games` (`game_id`)',
    'CREATE UNIQUE INDEX `idx_user_games_unique` ON `user_games` (`user`, `game_id`)'
  ],
  listRule: '@request.auth.id != "" && user = @request.auth.id',
  viewRule: '@request.auth.id != "" && user = @request.auth.id',
  createRule: '@request.auth.id != "" && user = @request.auth.id',
  updateRule: '@request.auth.id != "" && user = @request.auth.id',
  deleteRule: '@request.auth.id != "" && user = @request.auth.id'
};

/**
 * Authenticate with PocketBase admin
 */
async function authenticateAdmin() {
  try {
    console.log('?? Authenticating with PocketBase admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('? Admin authentication successful');
    return true;
  } catch (error) {
    console.error('? Admin authentication failed:', error.message);
    console.log('\n?? Make sure to create an admin user first:');
    console.log(`   .\\pocketbase.exe superuser upsert ${ADMIN_EMAIL} your-password`);
    return false;
  }
}

/**
 * Create or update a collection
 */
async function createCollection(schema) {
  try {
    console.log(`?? Creating collection: ${schema.name}`);
    
    // Check if collection already exists
    try {
      const existingCollection = await pb.collections.getOne(schema.name);
      console.log(`??  Collection '${schema.name}' already exists, updating...`);
      
      // Update the existing collection
      await pb.collections.update(existingCollection.id, schema);
      console.log(`? Collection '${schema.name}' updated successfully`);
    } catch (error) {
      if (error.status === 404) {
        // Collection doesn't exist, create it
        await pb.collections.create(schema);
        console.log(`? Collection '${schema.name}' created successfully`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`? Error creating/updating collection '${schema.name}':`, error.message);
    throw error;
  }
}

/**
 * Setup PocketBase collections and configuration
 */
async function setupPocketBase() {
  try {
    console.log('?? Setting up PocketBase for GameTrack...');
    console.log(`?? Connecting to: ${POCKETBASE_URL}`);
    
    // Test connection by trying to authenticate
    console.log('?? Testing PocketBase connection...');
    // Skip health check as it might not be available in all versions
    
    // Authenticate as admin
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      return;
    }
    
    // Create collections
    await createCollection(USER_GAMES_SCHEMA);
    
    console.log('\n?? PocketBase setup completed successfully!');
    console.log('\n?? Next steps:');
    console.log('1. ? Collections created with proper schema');
    console.log('2. ? Access rules configured for user isolation');
    console.log('3. ? Indexes created for optimal performance');
    console.log('\n?? Configuration:');
    console.log(`   - PocketBase URL: ${POCKETBASE_URL}`);
    console.log(`   - Admin Panel: ${POCKETBASE_URL}/_/`);
    console.log('\n?? Update your .env file:');
    console.log(`   VITE_POCKETBASE_URL=${POCKETBASE_URL}`);
    
  } catch (error) {
    console.error('? Setup failed:', error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
  }
}

/**
 * Clean up collections (use with caution!)
 */
async function cleanupCollections() {
  try {
    console.log('?? Cleaning up collections...');
    
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      return;
    }
    
    // Delete user_games collection
    try {
      const collection = await pb.collections.getOne('user_games');
      await pb.collections.delete(collection.id);
      console.log('? user_games collection deleted');
    } catch (error) {
      if (error.status === 404) {
        console.log('??  user_games collection does not exist');
      } else {
        throw error;
      }
    }
    
    console.log('?? Cleanup completed');
    
  } catch (error) {
    console.error('? Cleanup failed:', error.message);
  }
}

// Main execution
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    const command = process.argv[2];
    
    if (command === 'cleanup') {
      cleanupCollections();
    } else {
      setupPocketBase();
    }
  }
}

export {
  setupPocketBase,
  cleanupCollections,
  USER_GAMES_SCHEMA
};