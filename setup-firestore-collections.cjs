#!/usr/bin/env node

/**
 * Firestore Collections Setup Script
 * 
 * This script sets up the necessary Firestore collections for the GameTrack application.
 * It creates the userGames collection with sample data and sets up required indexes.
 * 
 * Usage:
 *   node setup-firestore-collections.js setup
 */

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Get Firebase configuration from environment variables
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gametrack-7e043';

let credential;

if (!projectId) {
  console.error('? Firebase project ID not found!');
  console.log('Please set VITE_FIREBASE_PROJECT_ID or FIREBASE_PROJECT_ID environment variable');
  process.exit(1);
}

try {
  // Option 1: Use service account key file
  if (serviceAccountPath) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('? Using service account key file');
    } catch (error) {
      console.error('? Error reading service account file:', error.message);
      process.exit(1);
    }
  }
  // Option 2: Use service account JSON content directly
  else if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      credential = admin.credential.cert(serviceAccount);
      console.log('? Using service account JSON from environment');
    } catch (error) {
      console.error('? Error parsing service account JSON:', error.message);
      process.exit(1);
    }
  }
  // Option 3: Try to use Application Default Credentials (if running on Google Cloud or with gcloud auth)
  else {
    try {
      credential = admin.credential.applicationDefault();
      console.log('? Using Application Default Credentials');
    } catch (error) {
      console.error('? Firebase service account not found!');
      console.log('\nTo run this script, you need Firebase Admin SDK credentials.');
      console.log('\nOption 1: Download service account key');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save the JSON file and set FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/key.json');
      console.log('\nOption 2: Use gcloud CLI');
      console.log('1. Install Google Cloud CLI');
      console.log('2. Run: gcloud auth application-default login');
      console.log('\nOption 3: Set JSON content directly');
      console.log('1. Set FIREBASE_SERVICE_ACCOUNT_JSON with the JSON content');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('? Error initializing Firebase credentials:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: credential,
  projectId: projectId
});

console.log(`?? Initializing Firebase Admin SDK for project: ${projectId}`);

const db = admin.firestore();

/**
 * Sample data structure for userGames collection
 */
const sampleUserGame = {
  // Game data from RAWG API
  id: 3498,
  name: "Grand Theft Auto V",
  background_image: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  released: "2013-09-17",
  metacritic: 92,
  platforms: [
    {
      platform: {
        id: 4,
        name: "PC",
        slug: "pc"
      }
    }
  ],
  genres: [
    {
      id: 4,
      name: "Action",
      slug: "action"
    }
  ],
  
  // User-specific data
  userId: "user123", // Firebase Auth user ID
  status: "playing", // 'backlog' | 'playing' | 'completed' | 'wishlist' | 'none'
  dateAdded: admin.firestore.Timestamp.now(),
  lastModified: admin.firestore.Timestamp.now(),
  rating: 4, // Optional: 1-5 stars
  notes: "Great open-world game!", // Optional: Personal notes
  playTime: 25 // Optional: Hours played
};

/**
 * Create collections and add sample data
 */
async function setupCollections() {
  try {
    console.log('Setting up Firestore collections for GameTracker...');
    
    // 1. Create userGames collection with sample document
    console.log('Creating userGames collection...');
    const userGamesRef = db.collection('userGames');
    
    // Document ID format: {userId}_{gameId}
    const sampleDocId = `${sampleUserGame.userId}_${sampleUserGame.id}`;
    await userGamesRef.doc(sampleDocId).set(sampleUserGame);
    
    console.log('? Sample userGame document created with ID:', sampleDocId);
    
    // 2. Create indexes (these should be created via Firebase Console or firebase.json)
    console.log('\n?? Required Firestore Indexes:');
    console.log('Collection: userGames');
    console.log('- Composite index: userId (Ascending) + lastModified (Descending)');
    console.log('- Single field index: userId (Ascending)');
    console.log('- Single field index: status (Ascending)');
    console.log('\n??  Please create these indexes in Firebase Console under Firestore > Indexes');
    
    // 3. Security Rules
    console.log('\n?? Recommended Firestore Security Rules:');
    console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own game data
    match /userGames/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`);
    
    console.log('\n? Collections setup completed!');
    console.log('\n?? Next steps:');
    console.log('1. Update your Firebase project ID in this script');
    console.log('2. Download and configure your service account key');
    console.log('3. Create the required indexes in Firebase Console');
    console.log('4. Update Firestore security rules');
    console.log('5. Update your .env file with Firebase configuration');
    
  } catch (error) {
    console.error('? Error setting up collections:', error);
  }
}

/**
 * Clean up collections (use with caution!)
 */
async function cleanupCollections() {
  try {
    console.log('?? Cleaning up collections...');
    
    const userGamesRef = db.collection('userGames');
    const snapshot = await userGamesRef.get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('? Collections cleaned up');
    
  } catch (error) {
    console.error('? Error cleaning up collections:', error);
  }
}

/**
 * Verify collections exist and show stats
 */
async function verifyCollections() {
  try {
    console.log('?? Verifying collections...');
    
    const userGamesRef = db.collection('userGames');
    const snapshot = await userGamesRef.get();
    
    console.log(`? userGames collection exists with ${snapshot.size} documents`);
    
    if (snapshot.size > 0) {
      console.log('\n?? Sample documents:');
      snapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name} (${data.status})`);
      });
    }
    
  } catch (error) {
    console.error('? Error verifying collections:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupCollections().then(() => process.exit(0));
    break;
  case 'cleanup':
    cleanupCollections().then(() => process.exit(0));
    break;
  case 'verify':
    verifyCollections().then(() => process.exit(0));
    break;
  default:
    console.log('GameTracker Firestore Setup Script');
    console.log('\nUsage:');
    console.log('  node setup-firestore-collections.js setup   - Create collections and sample data');
    console.log('  node setup-firestore-collections.js verify  - Verify collections exist');
    console.log('  node setup-firestore-collections.js cleanup - Remove all data (use with caution!)');
    console.log('\nBefore running:');
    console.log('1. npm install firebase-admin');
    console.log('2. Download service account key from Firebase Console');
    console.log('3. Update the serviceAccount path and projectId in this script');
    process.exit(1);
}