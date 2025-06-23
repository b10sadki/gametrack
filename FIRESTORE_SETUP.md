# GameTracker Firestore Database Setup

This guide will help you set up the Firestore database collections needed for the GameTracker application to save user game data properly.

## ?? Current Issue

If saves are not working, it's likely because:
1. Firestore collections don't exist
2. Security rules are blocking writes
3. Indexes are missing
4. Firebase configuration is incomplete

## ??? Required Collections

### `userGames` Collection
Stores user's game collections with the following structure:

```javascript
{
  // Document ID format: "{userId}_{gameId}"
  
  // Game data from RAWG API
  id: 3498,
  name: "Grand Theft Auto V",
  background_image: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  released: "2013-09-17",
  metacritic: 92,
  platforms: [{
    platform: {
      id: 4,
      name: "PC",
      slug: "pc"
    }
  }],
  genres: [{
    id: 4,
    name: "Action",
    slug: "action"
  }],
  
  // User-specific data
  userId: "firebase_user_id",
  status: "playing", // 'backlog'|'playing'|'completed'|'wishlist'|'none'
  dateAdded: Timestamp,
  lastModified: Timestamp,
  rating: 4, // Optional: 1-5 stars
  notes: "Personal notes", // Optional
  playTime: 25 // Optional: hours played
}
```

## ?? Setup Methods

### Method 1: Browser Console (Recommended)

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your GameTracker project
   - Navigate to Firestore Database

2. **Run Setup Script**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Copy and paste the contents of `setup-firestore-browser.js`
   - Press Enter to load the functions
   - Run: `setupFirestoreCollections()`

### Method 2: Node.js Script

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This installs `firebase-admin` and `dotenv` dependencies.

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration
   - **Option A**: Download service account key and set path:
     ```env
     FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
     ```
   - **Option B**: Set service account JSON directly:
     ```env
     FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
     ```

3. **Download Service Account Key** (if using Option A)
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file in your project directory
   - Update `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`

4. **Run Setup**
   ```bash
   node setup-firestore-collections.js setup
   ```

## ?? Required Firestore Indexes

Create these indexes in Firebase Console > Firestore > Indexes:

### Composite Index
- **Collection**: `userGames`
- **Fields**: 
  - `userId` (Ascending)
  - `lastModified` (Descending)

### Single Field Indexes (usually auto-created)
- `userId` (Ascending)
- `status` (Ascending)

## ?? Security Rules

Update your Firestore security rules in Firebase Console > Firestore > Rules:

```javascript
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
```

## ?? Environment Configuration

Ensure your `.env` file has all required Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## ?? Troubleshooting

### Save Operations Failing

1. **Check Browser Console**
   - Open developer tools (F12)
   - Look for Firebase/Firestore errors
   - Common errors:
     - "Missing or insufficient permissions"
     - "The query requires an index"
     - "Firebase configuration error"

2. **Verify Authentication**
   ```javascript
   // Test in browser console
   firebase.auth().currentUser
   // Should return user object, not null
   ```

3. **Test Firestore Connection**
   ```javascript
   // Test in browser console
   firebase.firestore().collection('userGames').limit(1).get()
     .then(snapshot => console.log('Firestore connected:', snapshot.size))
     .catch(error => console.error('Firestore error:', error))
   ```

4. **Check Security Rules**
   - Temporarily use permissive rules for testing:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - **?? Remember to restore secure rules after testing!**

### Missing Indexes

If you see "The query requires an index" errors:

1. **Auto-create from Error**
   - Click the link in the error message
   - Firebase will create the required index

2. **Manual Creation**
   - Go to Firebase Console > Firestore > Indexes
   - Click "Create Index"
   - Add the fields mentioned in the error

### Authentication Issues

1. **Check Firebase Auth Configuration**
   - Ensure Email/Password provider is enabled
   - Check authorized domains include your localhost

2. **Verify User Login**
   - Test login functionality
   - Check that `firebase.auth().currentUser` returns a user object

## ? Verification Steps

1. **Test Save Functionality**
   - Log in to your app
   - Search for a game
   - Try to add it to your collection
   - Check if it appears in "My List"

2. **Verify in Firebase Console**
   - Go to Firestore Database
   - Check if documents appear in `userGames` collection
   - Document IDs should follow format: `{userId}_{gameId}`

3. **Check Real-time Updates**
   - Add a game in one browser tab
   - Open another tab with the same user
   - Verify the game appears in both tabs

## ?? Support

If you're still experiencing issues:

1. **Check the browser console** for specific error messages
2. **Verify all setup steps** have been completed
3. **Test with simplified security rules** temporarily
4. **Ensure Firebase project billing** is enabled (required for some operations)

## ?? Quick Test Script

Run this in your browser console to test the complete flow:

```javascript
// Test complete save flow
const testSave = async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('? User not logged in');
    return;
  }
  
  console.log('? User logged in:', user.uid);
  
  const testGame = {
    id: 999999,
    name: "Test Game",
    background_image: null,
    released: "2024-01-01",
    metacritic: 85,
    platforms: [],
    genres: []
  };
  
  try {
    const docRef = firebase.firestore()
      .collection('userGames')
      .doc(`${user.uid}_${testGame.id}`);
    
    await docRef.set({
      ...testGame,
      userId: user.uid,
      status: 'backlog',
      dateAdded: firebase.firestore.Timestamp.now(),
      lastModified: firebase.firestore.Timestamp.now()
    });
    
    console.log('? Test save successful!');
    
    // Clean up test data
    await docRef.delete();
    console.log('? Test cleanup complete');
    
  } catch (error) {
    console.error('? Test save failed:', error);
  }
};

// Run the test
testSave();
```