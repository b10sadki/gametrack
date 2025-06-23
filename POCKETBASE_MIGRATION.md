# Migration from Firebase to PocketBase

This guide will help you migrate your GameTrack application from Firebase to PocketBase.

## Overview

PocketBase is a lightweight, self-hosted backend that provides:
- Built-in authentication
- Real-time database
- File storage
- Admin dashboard
- REST and WebSocket APIs

## Prerequisites

1. **Download PocketBase**
   - Visit [PocketBase releases](https://github.com/pocketbase/pocketbase/releases)
   - Download the appropriate version for your operating system
   - Extract the executable to a folder of your choice

2. **Install Dependencies**
   ```bash
   npm install pocketbase
   ```

## Step 1: Start PocketBase Server

1. **Run PocketBase**
   ```bash
   # Navigate to where you extracted PocketBase
   ./pocketbase serve
   
   # On Windows
   pocketbase.exe serve
   ```

2. **Access Admin Panel**
   - Open your browser and go to `http://127.0.0.1:8090/_/`
   - Create an admin account when prompted
   - This will be used for database management

## Step 2: Configure Environment Variables

1. **Update your `.env` file**
   ```env
   # PocketBase Configuration
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   
   # Keep Firebase config for migration (optional)
   # VITE_FIREBASE_API_KEY=your-api-key
   # VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   # ... other Firebase config
   ```

## Step 3: Set Up Database Schema

1. **Run the setup script**
   ```bash
   node setup-pocketbase.js
   ```
   
   This script will:
   - Connect to your PocketBase instance
   - Create the required `user_games` collection
   - Set up proper indexes and access rules

2. **Manual setup (alternative)**
   If you prefer to set up manually:
   - Go to the PocketBase admin panel
   - Create a new collection named `user_games`
   - Add the required fields (see schema below)

### Database Schema

The `user_games` collection should have these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|----------|
| user | Relation | Yes | Links to users collection |
| game_id | Number | Yes | Game ID from RAWG API |
| game_name | Text | Yes | Game title |
| game_background_image | URL | No | Game cover image |
| game_released | Text | No | Release date |
| game_metacritic | Number | No | Metacritic score |
| game_platforms | JSON | No | Platform information |
| game_genres | JSON | No | Genre information |
| status | Select | Yes | Options: backlog, playing, completed, wishlist, none |
| rating | Number | No | User rating (1-5) |
| notes | Text | No | User notes |
| play_time | Number | No | Play time in hours |
| date_added | Text | Yes | ISO date string |
| last_modified | Text | Yes | ISO date string |

### Access Rules

Set these rules for the `user_games` collection:

```javascript
// List/Search Rule
@request.auth.id != "" && user = @request.auth.id

// View Rule
@request.auth.id != "" && user = @request.auth.id

// Create Rule
@request.auth.id != "" && user = @request.auth.id

// Update Rule
@request.auth.id != "" && user = @request.auth.id

// Delete Rule
@request.auth.id != "" && user = @request.auth.id
```

## Step 4: Update Application Code

The migration has already been implemented in the codebase:

1. **New PocketBase files created:**
   - `src/lib/pocketbase.ts` - PocketBase client configuration
   - `src/lib/pocketbaseGameStorage.ts` - Game storage operations
   - `src/contexts/PocketBaseAuthContext.tsx` - Authentication context
   - `src/hooks/usePocketBaseGameStorage.ts` - Game storage hook

2. **Updated components:**
   - `App.tsx` - Uses PocketBase auth context
   - `LoginPage.tsx` - PocketBase authentication
   - `MyGamesPage.tsx` - PocketBase game storage
   - `SearchPage.tsx` - PocketBase game storage
   - `DashboardPage.tsx` - PocketBase game storage

## Step 5: Data Migration (Optional)

If you have existing data in Firebase:

1. **Export from Firebase**
   - Use the existing export functionality in your app
   - Or export directly from Firebase console

2. **Import to PocketBase**
   - Use the import functionality in your app
   - The app will automatically save to PocketBase when logged in

## Step 6: Test the Migration

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Test functionality:**
   - Create a new account
   - Search and add games
   - Test different game statuses
   - Verify real-time updates
   - Test export/import functionality

## Step 7: Production Deployment

### PocketBase Deployment Options

1. **Self-hosted VPS**
   - Deploy PocketBase on your own server
   - Use a reverse proxy (nginx) for HTTPS
   - Set up automatic backups

2. **Docker Deployment**
   ```dockerfile
   FROM alpine:latest
   RUN apk add --no-cache ca-certificates
   COPY pocketbase /usr/local/bin/pocketbase
   EXPOSE 8090
   CMD ["pocketbase", "serve", "--http=0.0.0.0:8090"]
   ```

3. **Cloud Platforms**
   - Railway
   - Fly.io
   - DigitalOcean App Platform
   - AWS/GCP/Azure

### Environment Variables for Production

```env
# Production PocketBase URL
VITE_POCKETBASE_URL=https://your-pocketbase-domain.com
```

## Benefits of PocketBase over Firebase

1. **Cost**: Free and self-hosted
2. **Control**: Full control over your data
3. **Performance**: Faster queries and real-time updates
4. **Simplicity**: Single binary, easy to deploy
5. **Privacy**: Your data stays on your servers
6. **Offline**: Works offline with local SQLite

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Make sure PocketBase is running
   - Check the URL in your `.env` file
   - Verify firewall settings

2. **Authentication errors**
   - Verify admin credentials
   - Check if users collection exists
   - Ensure proper access rules

3. **CORS issues**
   - PocketBase handles CORS automatically
   - For custom domains, update PocketBase settings

4. **Real-time not working**
   - Check WebSocket connection
   - Verify subscription setup
   - Check browser console for errors

### Getting Help

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [PocketBase GitHub](https://github.com/pocketbase/pocketbase)
- [PocketBase Discord](https://discord.gg/pocketbase)

## Rollback Plan

If you need to rollback to Firebase:

1. Revert the import changes in components
2. Update environment variables
3. Use the Firebase authentication context
4. Export data from PocketBase and import to Firebase

## Next Steps

1. **Backup Strategy**: Set up regular backups of your PocketBase data
2. **Monitoring**: Implement health checks and monitoring
3. **Scaling**: Consider load balancing for high traffic
4. **Security**: Implement additional security measures as needed

Congratulations! You've successfully migrated from Firebase to PocketBase. Your GameTrack application now runs on a self-hosted, cost-effective backend.