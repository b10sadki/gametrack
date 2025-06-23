/**
 * Browser-based Firestore Setup Script for GameTracker
 * 
 * This script can be run directly in the browser console on your Firebase project
 * or in the Firebase Console's Firestore Rules playground.
 * 
 * Instructions:
 * 1. Go to Firebase Console > Firestore Database
 * 2. Open browser developer tools (F12)
 * 3. Paste this script in the console and run it
 */

// This script assumes you're running it in a context where Firebase is already loaded
// (like Firebase Console or your app with Firebase SDK)

const setupFirestoreCollections = async () => {
  console.log('?? Setting up GameTracker Firestore collections...');
  
  // Check if Firebase is available
  if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
    console.error('? Firebase SDK not found. Please run this in Firebase Console or your app.');
    return;
  }
  
  const db = firebase.firestore ? firebase.firestore() : window.firebase.firestore();
  
  try {
    // Sample user game data
    const sampleUserId = 'demo_user_123';
    const sampleGameId = 3498;
    
    const sampleUserGame = {
      // Game data from RAWG API
      id: sampleGameId,
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
      userId: sampleUserId,
      status: "playing", // 'backlog' | 'playing' | 'completed' | 'wishlist' | 'none'
      dateAdded: firebase.firestore.Timestamp.now(),
      lastModified: firebase.firestore.Timestamp.now(),
      rating: 4, // Optional: 1-5 stars
      notes: "Great open-world game! Demo data.", // Optional: Personal notes
      playTime: 25 // Optional: Hours played
    };
    
    // Create userGames collection with sample document
    const docId = `${sampleUserId}_${sampleGameId}`;
    await db.collection('userGames').doc(docId).set(sampleUserGame);
    
    console.log('? Sample userGame document created with ID:', docId);
    console.log('? userGames collection is now ready!');
    
    // Verify the document was created
    const doc = await db.collection('userGames').doc(docId).get();
    if (doc.exists) {
      console.log('? Verification successful - document exists');
      console.log('?? Document data:', doc.data());
    }
    
  } catch (error) {
    console.error('? Error setting up collections:', error);
  }
};

// Instructions for manual setup
const showSetupInstructions = () => {
  console.log(`
?? FIRESTORE SETUP INSTRUCTIONS FOR GAMETRACKER

1. ???  COLLECTIONS:
   - userGames: Main collection for storing user's game data

2. ?? REQUIRED INDEXES:
   Go to Firebase Console > Firestore > Indexes and create:
   
   Collection: userGames
   - Composite index: 
     * userId (Ascending) 
     * lastModified (Descending)
   
   - Single field indexes (usually auto-created):
     * userId (Ascending)
     * status (Ascending)

3. ?? SECURITY RULES:
   Go to Firebase Console > Firestore > Rules and use:

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
}

4. ?? DOCUMENT STRUCTURE:
   Each document in userGames has ID format: {userId}_{gameId}
   
   Document fields:
   - id: number (game ID from RAWG API)
   - name: string (game name)
   - background_image: string (game cover image URL)
   - released: string (release date)
   - metacritic: number (metacritic score)
   - platforms: array (supported platforms)
   - genres: array (game genres)
   - userId: string (Firebase Auth user ID)
   - status: string ('backlog'|'playing'|'completed'|'wishlist'|'none')
   - dateAdded: timestamp (when added to collection)
   - lastModified: timestamp (last update)
   - rating: number (optional, 1-5 stars)
   - notes: string (optional, user notes)
   - playTime: number (optional, hours played)

5. ?? NEXT STEPS:
   - Run setupFirestoreCollections() to create sample data
   - Create the required indexes
   - Update security rules
   - Test your app's save functionality
`);
};

// Auto-run instructions
showSetupInstructions();

console.log('\n?? To create sample data, run: setupFirestoreCollections()');
console.log('?? To see instructions again, run: showSetupInstructions()');

// Export functions for manual execution
window.setupFirestoreCollections = setupFirestoreCollections;
window.showSetupInstructions = showSetupInstructions;