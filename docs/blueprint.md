# **App Name**: Milan

## Core Features:

- Room Creation/Joining: Users can create or join a conference room using a unique room ID, managed securely with Firebase Authentication.
- Real-time Audio/Video Conferencing: Enables multi-party audio and video communication using WebRTC, with signaling handled via Firestore.
- Mute/Unmute & Camera Toggle: Provides controls for participants to mute/unmute their microphone and toggle their camera on/off.
- Device Selection: Enables users to select their preferred audio and video input devices.
- Signaling via Firestore: Uses Firestore to exchange SDP offers/answers and ICE candidates between peers in real-time.

## Style Guidelines:

- Primary color: #02182B
- Background color: #F7DBA7
- Accent color: #F06449
- Font pairing: 'Space Grotesk' (sans-serif) for headings, and 'Inter' (sans-serif) for body text.
- Simple, clear icons for controls (mute, camera, share screen).
- Video grid layout with active speaker highlighting.
- Subtle transitions for participant join/leave and screen share start/stop.