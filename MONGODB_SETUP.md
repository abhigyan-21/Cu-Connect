# MongoDB Integration Guide

## Overview
Your CU-Connect application now uses MongoDB for persistent room storage instead of in-memory storage.

## What Changed

### New Files Created
1. **`src/lib/mongodb.ts`** - MongoDB connection handler with connection pooling
2. **`src/lib/rooms-db.ts`** - Database operations for room management
3. **`src/app/api/rooms/cleanup/route.ts`** - API endpoint for cleaning old rooms
4. **`.env.local`** - Environment configuration with MongoDB URI

### Updated Files
1. **`src/app/api/rooms/create/route.ts`** - Now creates rooms in MongoDB
2. **`src/app/api/rooms/join/route.ts`** - Adds peers to MongoDB rooms
3. **`src/app/api/rooms/leave/route.ts`** - Removes peers from MongoDB rooms
4. **`src/app/api/rooms/[roomId]/route.ts`** - Fetches room data from MongoDB
5. **`README.md`** - Updated with MongoDB setup instructions

## Database Connection

**Connection String:**
```
mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99
```

**Database Name:** `db_4447zrz99`
**Collection:** `rooms`

## Features

### 1. Persistent Room Storage
- Rooms survive server restarts
- Data persists across deployments
- Automatic connection pooling

### 2. Automatic Cleanup
- Empty rooms are deleted immediately when last peer leaves
- Inactive rooms (no activity for 1 hour) are cleaned up
- Manual cleanup via API endpoint

### 3. Concurrent Access
- Multiple users can join/leave simultaneously
- Atomic operations prevent race conditions
- Connection pooling for performance

## API Usage

### Create Room
```bash
POST /api/rooms/create
Content-Type: application/json

{
  "roomId": "abc-123"
}
```

### Join Room
```bash
POST /api/rooms/join
Content-Type: application/json

{
  "roomId": "abc-123",
  "peerId": "peer-xyz"
}
```

### Leave Room
```bash
POST /api/rooms/leave
Content-Type: application/json

{
  "roomId": "abc-123",
  "peerId": "peer-xyz"
}
```

### Get Room Info
```bash
GET /api/rooms/abc-123
```

### Manual Cleanup (Protected)
```bash
POST /api/rooms/cleanup
Authorization: Bearer your-secret-token
```

## Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Create a Room
- Go to http://localhost:9002
- Click "Create a New Room"
- Note the room ID

### 3. Join from Another Browser
- Open incognito/private window
- Enter the room ID
- Click "Join Room"

### 4. Verify in MongoDB
Check your MongoDB database to see the room document:
```javascript
{
  "_id": ObjectId("..."),
  "roomId": "abc-123",
  "peers": ["peer-1", "peer-2"],
  "createdAt": ISODate("2024-..."),
  "updatedAt": ISODate("2024-...")
}
```

## Deployment

### Vercel
1. Add environment variable in Vercel dashboard:
   - Key: `MONGODB_URI`
   - Value: `mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99`

2. Deploy:
```bash
vercel --prod
```

### Netlify
1. Add environment variable in Netlify dashboard
2. Deploy via Git push or CLI

## Troubleshooting

### Connection Issues
**Error:** "MongoServerError: Authentication failed"
- Verify username and password in connection string
- Check if database user has proper permissions

**Error:** "MongoNetworkError: connection timed out"
- Check if MongoDB server is accessible
- Verify firewall rules allow connections
- Test connection from your IP address

### Room Not Found
- Ensure room was created before joining
- Check MongoDB collection for the room document
- Verify roomId matches exactly (case-sensitive)

### Performance Issues
- Connection pooling is enabled (max 10 connections)
- Consider adding indexes:
  ```javascript
  db.rooms.createIndex({ roomId: 1 }, { unique: true })
  db.rooms.createIndex({ updatedAt: 1 })
  ```

## Monitoring

### Check Active Rooms
```javascript
// In MongoDB shell or Compass
db.rooms.find({})
```

### Count Peers
```javascript
db.rooms.aggregate([
  {
    $project: {
      roomId: 1,
      peerCount: { $size: "$peers" }
    }
  }
])
```

### Find Inactive Rooms
```javascript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
db.rooms.find({
  updatedAt: { $lt: oneHourAgo }
})
```

## Security Recommendations

1. **Use Environment Variables**
   - Never commit `.env.local` to Git
   - Use different credentials for production

2. **Add Authentication**
   - Implement user authentication
   - Validate room ownership

3. **Rate Limiting**
   - Add rate limiting to API endpoints
   - Prevent abuse of room creation

4. **Database Security**
   - Use strong passwords
   - Enable MongoDB authentication
   - Restrict network access

## Next Steps

1. **Add Indexes** for better query performance
2. **Implement Cron Job** for automatic cleanup
3. **Add Monitoring** with alerts for errors
4. **Set up Backups** for production data
5. **Add Analytics** to track room usage

## Support

For issues or questions:
- Check MongoDB connection logs
- Review API endpoint responses
- Test with MongoDB Compass
- Check browser console for errors

---

MongoDB integration completed successfully! 🎉
