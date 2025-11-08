# Testing Multi-User Video Calls

## ✅ Fixed: Peer Discovery Issue

The app now uses a **coordinator pattern** where the first person to join a room becomes the coordinator and helps other peers discover each other.

## How It Works Now

1. **First User (Coordinator):**
   - Joins room with ID like `cu-roomId-coordinator`
   - Maintains list of all peers in the room
   - Helps new peers discover existing peers

2. **Subsequent Users:**
   - Try to connect to coordinator
   - Receive list of existing peers
   - Automatically call all peers in the room

3. **Mesh Network:**
   - Everyone connects to everyone (peer-to-peer)
   - No central server needed for media
   - Coordinator only helps with discovery

## Testing Instructions

### Test 1: Same Computer (Quick Test)

1. **Open Chrome:** `http://localhost:9002` or your Vercel URL
2. **Create Room:** Click "Create a New Room"
3. **Copy Room ID:** Note the room ID (e.g., "2ohe3s5")
4. **Open Incognito:** Press `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
5. **Join Room:** Enter the same room ID
6. **Result:** You should see both video streams!

### Test 2: Different Devices (Real Test)

1. **Device 1 (You):**
   - Open your Vercel URL
   - Create a room
   - Note the room ID

2. **Device 2 (Friend):**
   - Open the same Vercel URL
   - Enter the room ID
   - Click "Join Room"

3. **Result:** Both should see each other!

### Test 3: Multiple Users

1. **User 1:** Creates room
2. **User 2:** Joins with room ID
3. **User 3:** Joins with same room ID
4. **Result:** All three see each other!

## Troubleshooting

### "Connected!" but no video from friend

**Possible causes:**
1. **Firewall/NAT:** Some networks block WebRTC
   - Try on mobile data instead of WiFi
   - Try different network

2. **Browser permissions:** Both users need camera/mic access
   - Check browser address bar for permission icon
   - Allow camera and microphone

3. **HTTPS required:** Make sure using Vercel URL (has HTTPS)
   - Don't use `localhost` for cross-device testing
   - Use the Vercel deployment URL

### "Peer unavailable" error

- The other person may have closed their tab
- They may be on a different room ID
- Network connection issue

### Only seeing yourself

- Wait 5-10 seconds for connection to establish
- Check browser console for errors (F12)
- Refresh both pages and try again

## Debugging Tips

### Check Browser Console

Press `F12` and look for:
- "My peer ID: cu-roomId-xxxxx" ✅ Good
- "Connected to room coordinator" ✅ Good
- "Calling peer: cu-roomId-xxxxx" ✅ Good
- "Received stream from: cu-roomId-xxxxx" ✅ Good

### Common Console Messages

```
✅ "My peer ID: cu-2ohe3s5-abc123"
✅ "Connected to room coordinator"
✅ "Calling peer: cu-2ohe3s5-xyz789"
✅ "Received stream from: cu-2ohe3s5-xyz789"

❌ "Peer unavailable" - Other user disconnected
❌ "Connection failed" - Network/firewall issue
```

## Network Requirements

### Works On:
- ✅ Home WiFi (most cases)
- ✅ Mobile data (4G/5G)
- ✅ Public WiFi (coffee shops, etc.)
- ✅ University networks (usually)

### May Not Work On:
- ❌ Corporate firewalls (strict)
- ❌ Some VPNs
- ❌ Very restrictive networks

### Solution for Restricted Networks:
- Use mobile hotspot
- Try different network
- Or implement TURN server (advanced)

## Expected Behavior

### Successful Connection:
1. User 1 creates room → Sees "Connected!"
2. User 2 joins room → Sees "Connected!"
3. Wait 2-5 seconds
4. Both see each other's video ✅

### Timeline:
- 0s: User joins
- 1s: "Connected!" toast appears
- 2-5s: Peer discovery happens
- 5s: Video streams appear

## Still Not Working?

### Quick Fixes:
1. **Refresh both pages**
2. **Try incognito mode**
3. **Check camera/mic permissions**
4. **Use Chrome (best compatibility)**
5. **Try mobile data instead of WiFi**

### Advanced Debugging:
1. Open browser console (F12)
2. Look for errors
3. Check if peer IDs are being logged
4. Verify both users have same room ID

## Success Indicators

You'll know it's working when you see:
- ✅ "Connected!" toast message
- ✅ Your own video
- ✅ Friend's video (after 2-5 seconds)
- ✅ Controls work (mute, camera, screen share)

## Next Steps After Testing

Once it works:
1. Share your Vercel URL with friends
2. Create rooms for meetings
3. Enjoy video calls!

## Known Limitations

- Works best with 2-4 users
- More users = more bandwidth needed
- Peer-to-peer (no recording feature)
- No chat (video/audio only)

## Future Improvements

To make it even better:
- Add TURN server for better connectivity
- Add chat feature
- Add screen recording
- Add virtual backgrounds
- Support more users with SFU

---

**The coordinator pattern should now work across different devices and browsers!** 🎉
