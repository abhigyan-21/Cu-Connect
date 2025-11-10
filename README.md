# CU-Connect

A real-time video conferencing application built with Next.js, WebRTC, and PeerJS.

## Features

- 🎥 **HD Video & Audio** - Crystal-clear video quality with real-time streaming
- 🎤 **Audio Controls** - Mute/unmute and device selection
- � **Videeo Controls** - Toggle camera on/off
- �️ **Sscreen Share** - Share your screen for presentations and collaboration
- � ***Fullscreen Mode** - Click any video to view in fullscreen (perfect for screen shares)
- 👥 **Live Peers Panel** - See all connected users in real-time with active status indicators
- 🚪 **Easy Rooms** - Create or join rooms with a simple code
- 🔒 **Room Validation** - Only created rooms can be joined
- 🌐 **Cross-Network Support** - TURN servers for NAT traversal
- 📊 **Real-time User Count** - Accurate display of connected participants
- 🎨 **Modern UI** - Clean, responsive design with glassmorphism effects
- 🔄 **Auto-reconnect** - Automatic ICE restart on connection failures

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://user
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
2. Allow camera and microphone permissions
3. Share the room ID with others
4. Wait for participants to join

### Joining a Room
1. Enter the room ID
2. Click "Join Room"
3. Allow camera and microphone permissions
4. You'll see all connected users in the peers panel

### During a Call
- **Toggle Audio:** Click the microphone button
- **Toggle Video:** Click the camera button
- **Share Screen:** Click the screen share button
- **Fullscreen:** Click any video to view in fullscreen mode
- **Device Settings:** Click the settings icon to change camera/microphone
- **View Participants:** Check the peers panel at bottom right
- **Leave Room:** Click the red phone button

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

## Testing Locally

You can test the video conferencing without deploying:

### Method 1: Multiple Browser Windows
1. Open `http://localhost:9002` in Chrome
2. Create a room
3. Open an **Incognito window** (Ctrl+Shift+N)
4. Join the same room
5. Both windows will connect as different users

### Method 2: Multiple Devices (Same Network)
1. On your computer: `http://localhost:9002`
2. On your phone (same WiFi): `http://192.168.1.7:9002`
3. Join the same room on both devices

## Troubleshooting

### Can't See Other Users?

**Quick Fixes:**
1. **Refresh both pages** and rejoin
2. **Check browser permissions** - Allow camera/microphone
3. **Use Chrome or Edge** - Best WebRTC support
4. **Check the peers panel** - Shows all connected users
5. **Both use mobile data** (not WiFi) - If on restricted networks

### Connection Issues?

**Check browser console (F12) for:**
- ✅ "ICE connection state: connected" - Good!
- ❌ "ICE connection failed" - Network issue
- ✅ "Received stream from: [peer-id]" - Stream received

**Solutions:**
- Switch to mobile data
- Try different network
- Disable VPN if using one
- Check firewall settings
- Clear browser cache and cookies

### Room Not Found?

- Verify the room ID is correct
- Room creator must join first
- Rooms are temporary (cleared after 1 hour of inactivity)

### Video Not Playing?

- Check if camera is being used by another app
- Try refreshing the page
- Click the video to enter fullscreen mode
- Check browser console for errors

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
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── room-controls.tsx # Meeting controls (audio, video, screen share)
│   ├── video-player.tsx  # Video display with fullscreen support
│   └── peers-panel.tsx   # Connected users panel
├── hooks/
│   └── use-milan.ts      # WebRTC logic and PeerJS management
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

## Recent Updates

### Latest Features (v1.2.0)
- ✨ **Fullscreen Support** - Click any video to view in fullscreen
- 👥 **Peers Panel** - Live display of all connected users
- 📊 **Accurate User Count** - Fixed user counting logic
- 🎨 **Screen Share Indicators** - Visual badges for screen sharing
- 🔕 **Reduced Notifications** - Removed redundant connection alerts
- 🐛 **Bug Fixes** - Improved video playback and connection stability

### Previous Updates
- 🔧 Fixed video feed issues and PeerJS connection handling
- 🎯 Improved ICE connection with better TURN server configuration
- 🧹 Cleaned up duplicate files and unused components
- 📱 Better mobile responsiveness

## Known Limitations

- **Network Restrictions:** May not work on corporate networks with strict firewalls
- **Room Cleanup:** Old rooms are cleaned up automatically after 1 hour of inactivity
- **Scalability:** Best for 2-4 users (peer-to-peer architecture)
- **Browser Support:** Works best on Chrome, Edge, Firefox (latest versions)
- **Mobile Safari:** Limited WebRTC support, use Chrome on iOS for best experience

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
MONGODB_URI=mongodb://user_
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
