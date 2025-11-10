# CU-Connect

A real-time video conferencing application built with Next.js, WebRTC, and PeerJS.

## Features

- 🎥 **HD Video & Audio** - Crystal-clear video quality
- 🎤 **Audio Controls** - Mute/unmute and device selection
- 🖥️ **Screen Share** - Share your screen for presentations
- 🚪 **Easy Rooms** - Create or join rooms with a simple code
- 🔒 **Room Validation** - Only created rooms can be joined
- 🌐 **Cross-Network Support** - TURN servers for NAT traversal

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to [http://localhost:9002](http://localhost:9002)

## How to Use

### Creating a Room
1. Click "Create a New Room"
2. Share the room ID with others
3. Wait for participants to join

### Joining a Room
1. Enter the room ID
2. Click "Join Room"
3. Allow camera and microphone permissions

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Click "Deploy"

### Netlify
1. Push code to GitHub
2. Import repository on [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`

## Troubleshooting

### Can't See Other Users?

**Quick Fixes:**
1. **Both use mobile data** (not WiFi) - 90% success rate
2. **Refresh both pages** and rejoin
3. **Check browser permissions** - Allow camera/microphone
4. **Use Chrome or Edge** - Best WebRTC support

### Connection Issues?

**Check browser console (F12) for:**
- ✅ "ICE connection state: connected" - Good!
- ❌ "ICE connection failed" - Network issue

**Solutions:**
- Switch to mobile data
- Try different network
- Disable VPN if using one
- Check firewall settings

### Room Not Found?

- Verify the room ID is correct
- Room creator must join first
- Rooms are temporary (cleared on server restart)

## Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Video:** WebRTC, PeerJS
- **Database:** MongoDB
- **Signaling:** Next.js API Routes
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/
│   ├── api/rooms/        # Room management API
│   ├── room/[roomId]/    # Room page
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # UI components
│   ├── room-controls.tsx # Meeting controls
│   └── video-player.tsx  # Video display
├── hooks/
│   └── use-milan.ts      # WebRTC logic
└── lib/
    ├── mongodb.ts        # MongoDB connection
    ├── rooms-db.ts       # Room database operations
    ├── rooms.ts          # Legacy in-memory storage
    └── utils.ts          # Utilities
```

## API Endpoints

- `POST /api/rooms/create` - Create a new room
- `POST /api/rooms/join` - Join an existing room
- `GET /api/rooms/[roomId]` - Get room participants
- `POST /api/rooms/leave` - Leave a room
- `POST /api/rooms/cleanup` - Clean up old/empty rooms (requires auth token)

## Known Limitations

- **Network Restrictions:** May not work on corporate networks with strict firewalls
- **Room Cleanup:** Old rooms are cleaned up automatically after 1 hour of inactivity
- **Scalability:** Best for 2-4 users (peer-to-peer architecture)
- **Browser Support:** Works best on Chrome, Edge, Firefox

## MongoDB Setup

The application uses MongoDB to persist room data. The database stores:
- Room IDs and creation timestamps
- Active peer connections per room
- Automatic cleanup of inactive rooms

### Database Schema

```typescript
{
  roomId: string,      // Unique room identifier
  peers: string[],     // Array of peer IDs in the room
  createdAt: Date,     // Room creation timestamp
  updatedAt: Date      // Last activity timestamp
}
```

### Environment Variables

```env
MONGODB_URI=mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99
CLEANUP_TOKEN=your-secret-token  # Optional: For cleanup API authentication
```

## For Production Use

Consider these improvements:

1. **TURN Server:** Deploy your own for better reliability
2. **Media Server:** Use SFU (Mediasoup) for 5+ users
3. **Managed Service:** Consider Daily.co, Agora, or Twilio
4. **Database Indexing:** Add indexes on roomId and updatedAt fields
5. **Monitoring:** Set up alerts for database connection issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, open an issue on GitHub.

---

Built with ❤️ for Chandigarh University
