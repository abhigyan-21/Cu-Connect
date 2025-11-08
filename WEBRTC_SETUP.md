# Setting Up Multi-User Video Calls

## Current Status

Your app is deployed and working, but **users cannot see each other** because WebRTC requires a **signaling server** to exchange connection information between peers.

## What You Need

To enable multi-user video calls, you need to add:

1. **Signaling Server** - To exchange SDP offers/answers and ICE candidates
2. **STUN/TURN Servers** - To handle NAT traversal (optional but recommended)

## Quick Solutions

### Option 1: Use PeerJS (Easiest - 30 minutes)

PeerJS provides free signaling servers and simplifies WebRTC.

1. **Install PeerJS:**
```bash
npm install peerjs
```

2. **Update `use-milan.ts`:**
```typescript
import Peer from 'peerjs';

// In useMilan hook:
const peerRef = useRef<Peer | null>(null);

useEffect(() => {
  // Initialize PeerJS
  const peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com',
    secure: true,
    port: 443,
  });

  peer.on('open', (id) => {
    console.log('My peer ID:', id);
    // Share this ID with other users via the room
  });

  peer.on('call', (call) => {
    // Answer incoming call
    call.answer(state.localStream!);
    
    call.on('stream', (remoteStream) => {
      // Add remote peer stream
      dispatch({
        type: 'ADD_REMOTE_PEER',
        peer: {
          id: call.peer,
          connection: call.peerConnection,
          stream: remoteStream,
        },
      });
    });
  });

  peerRef.current = peer;

  return () => peer.destroy();
}, [state.localStream]);

// To call another user:
const callPeer = (remotePeerId: string) => {
  const call = peerRef.current?.call(remotePeerId, state.localStream!);
  
  call?.on('stream', (remoteStream) => {
    dispatch({
      type: 'ADD_REMOTE_PEER',
      peer: {
        id: remotePeerId,
        connection: call.peerConnection,
        stream: remoteStream,
      },
    });
  });
};
```

3. **Share Peer IDs:**
   - Store peer IDs in a database (Firebase, Supabase, etc.)
   - Or use a simple room-based system

### Option 2: Use Socket.io + Your Own Server (1-2 hours)

More control but requires a backend server.

1. **Create a signaling server:**
```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.to).emit('offer', {
      from: socket.id,
      offer: data.offer,
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer,
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Signaling server running on port 3001');
});
```

2. **Deploy the server:**
   - Deploy to Railway, Render, or Heroku
   - Get the server URL

3. **Update your client code:**
```typescript
import io from 'socket.io-client';

const socket = io('YOUR_SIGNALING_SERVER_URL');

socket.emit('join-room', roomId);

socket.on('user-connected', async (userId) => {
  // Create offer and send to new user
  const pc = createPeerConnection(userId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', { to: userId, offer });
});

socket.on('offer', async ({ from, offer }) => {
  const pc = createPeerConnection(from);
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', { to: from, answer });
});

// Handle answer and ICE candidates...
```

### Option 3: Use a Service (Fastest - 15 minutes)

Use a managed service that handles everything:

1. **Daily.co** - Free tier available
   - Sign up at [daily.co](https://daily.co)
   - Get API key
   - Use their React SDK

2. **Agora** - Free tier available
   - Sign up at [agora.io](https://agora.io)
   - Get App ID
   - Use their React SDK

3. **Twilio Video** - Paid but reliable
   - Sign up at [twilio.com](https://twilio.com)
   - Get credentials
   - Use their SDK

## Recommended Approach

For a quick working solution: **Use PeerJS (Option 1)**

For production: **Use a managed service (Option 3)**

## STUN/TURN Servers

Add these to your RTCPeerConnection configuration:

```typescript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const pc = new RTCPeerConnection(configuration);
```

## Need Help?

1. Check the [WebRTC documentation](https://webrtc.org/getting-started/overview)
2. See [PeerJS documentation](https://peerjs.com/docs/)
3. Try the [Socket.io WebRTC example](https://socket.io/get-started/private-messaging-part-1/)

## Current Limitations

Without a signaling server:
- ❌ Users cannot see each other
- ❌ Only local video stream works
- ✅ UI and controls work perfectly
- ✅ Camera/mic permissions work
- ✅ Screen sharing works (locally)

Once you add signaling:
- ✅ Multi-user video calls
- ✅ Real-time communication
- ✅ Screen sharing visible to others
- ✅ Full WebRTC functionality
